import NvidiaAI from 'openai';
import { config } from '../../../config';
import { Logger } from '../../../core/logging/Logger';
import { CacheService } from '../../../core/cache/CacheService';
import {
  AICompletionRequest,
  AICompletionResponse,
  AIModel,
  MODEL_COSTS,
  TASK_MODEL_MAP,
  TASK_DEFAULT_MAX_TOKENS,
} from '../types';

const RETRY_DELAYS = [1000, 2000, 4000, 8000];
const MAX_RETRIES = 4;

export class AIClient {
  private static instance: AIClient;
  private client: NvidiaAI;

  private constructor() {
    this.client = new NvidiaAI({
      apiKey: config.nvidia.apiKey,
      baseURL: config.nvidia.baseUrl,
      maxRetries: 0,
      timeout: 180000,
    });
  }

  static getInstance(): AIClient {
    if (!this.instance) {
      this.instance = new AIClient();
    }
    return this.instance;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();
    const model = request.model || TASK_MODEL_MAP[request.taskType];
    const maxTokens = request.maxTokens || TASK_DEFAULT_MAX_TOKENS[request.taskType];

    Logger.info('AI request starting', {
      model,
      taskType: request.taskType,
      maxTokens,
      temperature: request.temperature,
      endpoint: config.nvidia.baseUrl,
    });

    if (request.cacheKey) {
      const cached = await CacheService.get<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }>(request.cacheKey);
      if (cached) {
        const cost = this.calculateCost(model, cached.usage.promptTokens, cached.usage.completionTokens);
        return {
          content: cached.content,
          model,
          taskType: request.taskType,
          usage: cached.usage,
          cost,
          cached: true,
          latency: Date.now() - startTime,
        };
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
        if (request.systemPrompt) {
          messages.push({ role: 'system', content: request.systemPrompt });
        }
        messages.push({ role: 'user', content: request.userPrompt });

        const completion = await this.client.chat.completions.create({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: request.temperature ?? config.nvidia.temperature,
          ...(request.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } as const } : {}),
          stream: false,
        });

        const choice = completion.choices[0];
        const elapsed = Date.now() - startTime;
        const content = choice?.message?.content || '';

        Logger.info('AI response received', {
          model,
          taskType: request.taskType,
          elapsedMs: elapsed,
          finishReason: choice?.finish_reason,
          status: completion.object ? 'success' : 'unknown',
        });

        const usage = completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens ?? 0,
              completionTokens: completion.usage.completion_tokens ?? 0,
              totalTokens: completion.usage.total_tokens ?? 0,
            }
          : { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

        const cost = this.calculateCost(model, usage.promptTokens, usage.completionTokens);

        if (request.cacheKey && usage.totalTokens > 0) {
          await CacheService.set(request.cacheKey, { content, usage }, request.cacheTtl || 3600);
        }

        return {
          content,
          model,
          taskType: request.taskType,
          usage,
          cost,
          cached: false,
          latency: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        const elapsed = Date.now() - startTime;

        Logger.error('AI request failed', {
          model,
          taskType: request.taskType,
          attempt: attempt + 1,
          elapsedMs: elapsed,
          error: lastError.message,
          errorName: lastError.name,
          errorCode: (error as any).code,
          errorStatus: (error as any).status,
          errorBody: (error as any).response?.data || (error as any).response?.body,
        });

        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt === MAX_RETRIES) {
          break;
        }

        const delay = RETRY_DELAYS[attempt];
        Logger.warn('AI request failed, retrying', {
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
          taskType: request.taskType,
          model,
          delay,
          error: lastError.message,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('AI request failed after all retries');
  }

  async completeStream(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void,
    onDone: (response: AICompletionResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const startTime = Date.now();
    const model = request.model || TASK_MODEL_MAP[request.taskType];
    const maxTokens = request.maxTokens || TASK_DEFAULT_MAX_TOKENS[request.taskType];

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.userPrompt });

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: request.temperature ?? config.nvidia.temperature,
        stream: true,
      });

      let fullContent = '';
      let promptTokens = 0;
      let completionTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          onChunk(delta);
        }
        if (chunk.usage) {
          promptTokens = chunk.usage.prompt_tokens || promptTokens;
          completionTokens = chunk.usage.completion_tokens || completionTokens;
        }
      }

      const totalTokens = promptTokens + completionTokens;
      const cost = this.calculateCost(model, promptTokens, completionTokens);

      onDone({
        content: fullContent,
        model,
        taskType: request.taskType,
        usage: { promptTokens, completionTokens, totalTokens },
        cost,
        cached: false,
        latency: Date.now() - startTime,
      });

      if (request.cacheKey && totalTokens > 0) {
        await CacheService.set(request.cacheKey, { content: fullContent, usage: { promptTokens, completionTokens, totalTokens } }, request.cacheTtl || 3600);
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  private calculateCost(model: AIModel, promptTokens: number, completionTokens: number): number {
    const rates = MODEL_COSTS[model];
    if (!rates) return 0;
    return (promptTokens * rates.input) + (completionTokens * rates.output);
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return msg.includes('429') || msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504') || msg.includes('timeout') || msg.includes('rate limit') || msg.includes('internal server error') || msg.includes('service unavailable') || msg.includes('network error') || msg.includes('econnrefused') || msg.includes('econnreset') || msg.includes('etimedout');
    }
    return false;
  }

  getClient(): NvidiaAI {
    return this.client;
  }
}
