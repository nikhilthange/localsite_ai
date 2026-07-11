import { AIClient } from './AIClient';
import { PromptTemplateService } from './PromptTemplateService';
import { TokenUsageService } from './TokenUsageService';
import { AICreditService } from './AICreditService';
import {
  AICompletionRequest,
  AICompletionResponse,
  AITaskType,
  AIModel,
  TASK_MODEL_MAP,
  TASK_CREDIT_COSTS,
  TASK_DEFAULT_MAX_TOKENS,
} from '../types';
import { Logger } from '../../../core/logging/Logger';
import { emitToUser } from '../../../core/socket/SocketSetup';

export class AIEngineService {
  private aiClient: AIClient;
  private promptTemplate: PromptTemplateService;
  private tokenUsage: TokenUsageService;
  private credits: AICreditService;

  constructor() {
    this.aiClient = AIClient.getInstance();
    this.promptTemplate = new PromptTemplateService();
    this.tokenUsage = new TokenUsageService();
    this.credits = new AICreditService();
  }

  async generate(request: AICompletionRequest, socketEmit = true): Promise<AICompletionResponse> {
    const { userId, taskType, websiteId } = request;

    if (socketEmit) {
      emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Checking credits...', progress: 5 });
    }

    const creditResult = await this.credits.consumeCredits(userId, taskType);
    if (!creditResult.success) {
      emitToUser(userId, 'ai:error', {
        websiteId,
        taskType,
        error: `Insufficient credits. Need ${creditResult.cost}, have ${creditResult.remaining}`,
      });
      throw new Error(`Insufficient AI credits. Required: ${creditResult.cost}, Available: ${creditResult.remaining}`);
    }

    try {
      if (socketEmit) {
        emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Loading prompt template...', progress: 15 });
      }

      const template = await this.promptTemplate.getPrompt(taskType);
      if (template) {
        const compiled = this.promptTemplate.compile(template, request.userPrompt as unknown as Record<string, string>);
        request.systemPrompt = compiled.systemPrompt;
        request.userPrompt = compiled.userPrompt;
      }

      if (socketEmit) {
        emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Generating with AI...', progress: 30 });
      }

      const response = await this.aiClient.complete(request);

      if (socketEmit) {
        emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Finalizing...', progress: 90 });
      }

      await this.tokenUsage.recordUsage({
        userId,
        websiteId,
        taskType,
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        cost: response.cost,
        creditsConsumed: creditResult.cost,
        latency: response.latency,
        cached: response.cached,
        success: true,
      });

      if (socketEmit) {
        emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Complete', progress: 100 });
      }

      return response;
    } catch (error) {
      await this.credits.refundCredits(userId, taskType, creditResult.cost.toString());

      await this.tokenUsage.recordUsage({
        userId,
        websiteId,
        taskType,
        model: request.model || TASK_MODEL_MAP[taskType],
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        creditsConsumed: 0,
        latency: 0,
        cached: false,
        success: false,
        error: (error as Error).message,
      });

      if (socketEmit) {
        emitToUser(userId, 'ai:error', {
          websiteId,
          taskType,
          error: (error as Error).message,
        });
      }

      throw error;
    }
  }

  async generateStream(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void,
    socketEmit = true
  ): Promise<AICompletionResponse> {
    const { userId, taskType, websiteId } = request;

    if (socketEmit) {
      emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Checking credits...', progress: 5 });
    }

    const creditResult = await this.credits.consumeCredits(userId, taskType);
    if (!creditResult.success) {
      const error = `Insufficient credits. Need ${creditResult.cost}, have ${creditResult.remaining}`;
      emitToUser(userId, 'ai:error', { websiteId, taskType, error });
      throw new Error(error);
    }

    const template = await this.promptTemplate.getPrompt(taskType);
    if (template) {
      const compiled = this.promptTemplate.compile(template, request.userPrompt as unknown as Record<string, string>);
      request.systemPrompt = compiled.systemPrompt;
      request.userPrompt = compiled.userPrompt;
    }

    if (socketEmit) {
      emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Streaming response...', progress: 30 });
    }

    try {
      const response = await this.aiClient.complete(request);

      await this.tokenUsage.recordUsage({
        userId,
        websiteId,
        taskType,
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        cost: response.cost,
        creditsConsumed: creditResult.cost,
        latency: response.latency,
        cached: false,
        success: true,
      });

      if (socketEmit) {
        emitToUser(userId, 'ai:progress', { websiteId, taskType, step: 'Complete', progress: 100 });
      }

      return response;
    } catch (error) {
      await this.credits.refundCredits(userId, taskType, creditResult.cost.toString());

      await this.tokenUsage.recordUsage({
        userId,
        websiteId,
        taskType,
        model: request.model || TASK_MODEL_MAP[taskType],
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        creditsConsumed: 0,
        latency: 0,
        cached: false,
        success: false,
        error: (error as Error).message,
      });

      if (socketEmit) {
        emitToUser(userId, 'ai:error', { websiteId, taskType, error: (error as Error).message });
      }

      throw error;
    }
  }

  async checkCredits(userId: string, taskType: AITaskType): Promise<{ sufficient: boolean; required: number; available: number }> {
    const balance = await this.credits.getBalance(userId);
    const cost = TASK_CREDIT_COSTS[taskType];
    return {
      sufficient: balance.balance >= cost,
      required: cost,
      available: balance.balance,
    };
  }

  getCreditCosts(): Record<AITaskType, number> {
    return TASK_CREDIT_COSTS;
  }

  getModels(): Record<AITaskType, AIModel> {
    return TASK_MODEL_MAP;
  }

  getDefaultMaxTokens(): Record<AITaskType, number> {
    return TASK_DEFAULT_MAX_TOKENS;
  }
}
