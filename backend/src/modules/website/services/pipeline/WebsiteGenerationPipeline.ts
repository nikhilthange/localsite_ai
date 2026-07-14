import { AIClient } from '../../../ai/services/AIClient';
import { AITaskType, AICompletionRequest, AIModel } from '../../../ai/types';
import { Logger } from '../../../../core/logging/Logger';
import { GenerationStage, PromptBuilder, WebsiteGenerationContext } from './PromptBuilder';
import { RetryHandler } from './RetryHandler';
import { ProgressEmitter } from './ProgressEmitter';
import { ResponseMerger } from './ResponseMerger';
import type { AiGeneratedWebsite } from '../../../../types/website';

const STAGES = [
  { stage: GenerationStage.BRAND, message: 'Generating brand identity...', weight: 10 },
  { stage: GenerationStage.NAV_HERO, message: 'Generating navigation and hero...', weight: 15 },
  { stage: GenerationStage.SERVICES, message: 'Generating services...', weight: 15 },
  { stage: GenerationStage.ABOUT, message: 'Generating about section...', weight: 10 },
  { stage: GenerationStage.TESTIMONIALS, message: 'Generating testimonials...', weight: 10 },
  { stage: GenerationStage.FAQ, message: 'Generating FAQ...', weight: 10 },
  { stage: GenerationStage.CONTACT, message: 'Generating contact section...', weight: 10 },
  { stage: GenerationStage.SEO, message: 'Generating SEO metadata...', weight: 10 },
  { stage: GenerationStage.FOOTER, message: 'Generating footer...', weight: 10 },
];

export class WebsiteGenerationPipeline {
  private promptBuilder = new PromptBuilder();
  private retryHandler = new RetryHandler();
  private responseMerger = new ResponseMerger();

  constructor(
    private aiClient: AIClient,
    private progressEmitter: ProgressEmitter
  ) {}

  async execute(context: WebsiteGenerationContext): Promise<AiGeneratedWebsite> {
    const responses: Record<string, any> = {};
    let accumulatedProgress = 0;
    
    let currentModel = AIModel.Llama8B as string;

    for (const step of STAGES) {
      accumulatedProgress += step.weight;
      this.progressEmitter.emitProgress(step.message, accumulatedProgress);

      const systemPrompt = this.promptBuilder.buildSystemPrompt();
      const userPrompt = this.promptBuilder.buildPrompt(step.stage, context);

      const request: AICompletionRequest = {
        taskType: AITaskType.WEBSITE_GENERATION,
        userId: 'system', // the actual usage might be recorded differently, we can omit or pass
        websiteId: 'temp',
        systemPrompt,
        userPrompt,
        temperature: 0.5,
        maxTokens: 1000,
        responseFormat: 'json_object',
        model: currentModel
      };

      const t0 = Date.now();
      let retries = 0;

      try {
        const response = await this.retryHandler.executeWithRetry(
          async () => {
            const res = await this.aiClient.complete(request);
            let cleaned = res.content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            if (!cleaned) throw new Error('Empty AI response');
            
            try {
              return { parsed: JSON.parse(cleaned), usage: res.usage };
            } catch (e) {
              throw new Error(`Failed to parse JSON for stage ${step.stage}: ${cleaned.substring(0, 50)}...`);
            }
          },
          {
            maxRetries: 3,
            delays: [1000, 2000, 5000],
            onRetry: (error, attempt) => {
              retries = attempt;
              Logger.warn(`Retrying stage ${step.stage}`, { attempt, error: error.message });
            },
            onTimeoutConsecutive: (count) => {
              if (count >= 2 && currentModel !== 'meta/llama-3.1-8b-instruct') {
                Logger.warn('Switching to smaller model due to consecutive timeouts', { stage: step.stage });
                currentModel = 'meta/llama-3.1-8b-instruct';
                request.model = currentModel;
              }
            }
          }
        );

        const duration = Date.now() - t0;
        responses[step.stage] = response.parsed;
        
        // Expose to context so later stages could potentially use it
        context.accumulatedData[step.stage] = response.parsed;

        Logger.info(`Stage completed successfully`, {
          stage: step.stage,
          promptTokens: response.usage?.promptTokens || 0,
          completionTokens: response.usage?.completionTokens || 0,
          durationMs: duration,
          retries,
          modelUsed: currentModel,
          success: true
        });

      } catch (error: any) {
        const duration = Date.now() - t0;
        Logger.error(`Stage failed`, {
          stage: step.stage,
          durationMs: duration,
          retries,
          modelUsed: currentModel,
          success: false,
          error: error.message
        });
        
        // If a stage fails after retries, we throw to abort the pipeline.
        // The orchestrator will catch it and run the fallback generator.
        throw new Error(`Pipeline aborted at stage ${step.stage}: ${error.message}`);
      }
    }

    this.progressEmitter.emitProgress('Saving website...', 100);
    return this.responseMerger.mergeResponses(responses);
  }
}
