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

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const STREAMING_MODEL_MIN_TOKENS = 2000;

export class AIClient {
  private static instance: AIClient;
  private client: NvidiaAI;

  private constructor() {
    this.client = new NvidiaAI({
      apiKey: config.nvidia.apiKey,
      baseURL: config.nvidia.baseUrl,
      maxRetries: 0,
      timeout: config.nvidia.timeoutMs,
    });
  }

  static getInstance(): AIClient {
    if (!this.instance) {
      this.instance = new AIClient();
    }
    return this.instance;
  }

  private analyzePrompt(prompt: string, maxTokens: number): { charCount: number; estimatedTokens: number; needsOptimization: boolean } {
    const charCount = prompt.length;
    const estimatedTokens = Math.ceil(charCount / 4);

    Logger.info('Prompt analysis', { 
      promptCharacterCount: charCount, 
      promptTokenEstimate: estimatedTokens, 
      expectedResponseTokens: maxTokens 
    });

    const needsOptimization = estimatedTokens + maxTokens > 12000;

    return { charCount, estimatedTokens, needsOptimization };
  }

  private optimizePrompt(prompt: string): string {
    const lines = prompt.split('\n');
    const optimized: string[] = [];
    let seen = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const normalized = trimmed.replace(/\s+/g, ' ').toLowerCase();
      
      // Remove unnecessary instructions
      if (normalized.includes('generate all sections below as top-level json keys')) continue;
      if (normalized.includes('return only the json object')) continue;
      
      // Remove duplicated text
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      
      // Compress formatting
      optimized.push(trimmed.replace(/\s+/g, ' '));
    }

    return optimized.join(' ');
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
      timeoutMs: config.nvidia.timeoutMs,
    });

    if (request.cacheKey) {
      const cached = await CacheService.get<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }>(request.cacheKey);
      if (cached) {
        const cost = this.calculateCost(model, cached.usage.promptTokens, cached.usage.completionTokens);
        Logger.info('AI cache hit', { cacheKey: request.cacheKey, model, taskType: request.taskType });
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

    const { charCount, estimatedTokens, needsOptimization } = this.analyzePrompt(request.userPrompt, maxTokens);
    let userPrompt = request.userPrompt;
    if (needsOptimization) {
      Logger.warn('Prompt exceeds safe limits, optimizing', { charCount, estimatedTokens, maxTokens });
      userPrompt = this.optimizePrompt(userPrompt);
      Logger.info('Prompt optimized', { originalChars: charCount, optimizedChars: userPrompt.length });
    }

    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      messages.push({ role: 'user', content: userPrompt });

      // Enforce the timeout exactly using AbortSignal
      const signal = AbortSignal.timeout(config.nvidia.timeoutMs);
      
      let content = '';
      let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      let finishReason = 'stop';

      const useStreaming = config.nvidia.enableStreaming !== false;

      const requestPayload: any = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: request.temperature ?? 0.5,
        top_p: 0.9,
        stream: useStreaming,
        ...(request.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
      };

      if (model.includes('nemotron-3-ultra')) {
        requestPayload.max_tokens = Math.max(maxTokens, 16384);
        requestPayload.reasoning_budget = 16384;
        requestPayload.chat_template_kwargs = { "enable_thinking": true };
      }

      if (useStreaming) {
        const stream = await this.client.chat.completions.create(requestPayload, { signal }) as unknown as AsyncIterable<any>;

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            content += delta;
          }
          // Safely ignore reasoning_content so it doesn't break JSON parsing
          // const reasoning = (chunk.choices[0]?.delta as any)?.reasoning_content;
          
          if (chunk.choices[0]?.finish_reason) {
            finishReason = chunk.choices[0].finish_reason;
          }
          if (chunk.usage) {
            usage.promptTokens = chunk.usage.prompt_tokens || usage.promptTokens;
            usage.completionTokens = chunk.usage.completion_tokens || usage.completionTokens;
          }
        }
      } else {
        const completion = await this.client.chat.completions.create(requestPayload, { signal }) as any;

        content = completion.choices[0]?.message?.content || '';
        finishReason = completion.choices[0]?.finish_reason || 'stop';
        usage = {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        };
      }

      if (usage.totalTokens === 0) {
        usage.totalTokens = usage.promptTokens + usage.completionTokens || Math.ceil(content.length / 4);
        if (usage.promptTokens === 0) usage.promptTokens = estimatedTokens;
        if (usage.completionTokens === 0) usage.completionTokens = usage.totalTokens - usage.promptTokens;
      }

      const elapsed = Date.now() - startTime;
      const cost = this.calculateCost(model, usage.promptTokens, usage.completionTokens);

      Logger.info('AI response received', {
        model,
        taskType: request.taskType,
        requestDurationMs: elapsed,
        finishReason,
        httpStatus: 200,
        responseSize: content.length,
        promptSize: charCount,
        tokenUsage: usage,
        cost,
      });

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
        latency: elapsed,
      };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const status = (error as any).status;
      const code = (error as any).code;
      const errorType = this.classifyError(error, status, code);
      const diagnostic = this.buildErrorDiagnostic(error as Error);

      Logger.error('AI request failed', {
        model,
        taskType: request.taskType,
        requestDurationMs: elapsed,
        error: (error as Error).message,
        errorName: (error as Error).name,
        errorType,
        httpStatus: status || 0,
        errorCode: code,
        diagnosticType: diagnostic.type,
        promptSize: charCount,
      });

      throw Object.assign(new Error(diagnostic.message), { diagnostic, status, code });
    }
  }

  private buildErrorDiagnostic(error: Error | null): { message: string; type: string; retryable: boolean; suggestion: string } {
    if (!error) {
      return { message: 'AI request failed after all retries', type: 'unknown', retryable: false, suggestion: 'Check network connectivity and API endpoint availability.' };
    }

    const msg = error.message.toLowerCase();
    const status = (error as any).status;
    const code = (error as any).code;

    if (error.name === 'TimeoutError' || msg.includes('abort') || msg.includes('timeout') || code === 'ETIMEDOUT' || code === 'ECONNABORTED') {
      if (status === 504) {
        return { message: `Server timeout: The AI model (${config.nvidia.model}) did not respond within ${config.nvidia.timeoutMs / 1000}s.`, type: 'server_timeout', retryable: true, suggestion: 'Try a smaller model like meta/llama-3.1-8b-instruct or increase AI_TIMEOUT_MS.' };
      }
      return { message: `Client timeout: Request exceeded ${config.nvidia.timeoutMs / 1000}s limit.`, type: 'client_timeout', retryable: false, suggestion: 'Ensure AI_TIMEOUT_MS is sufficient or use a faster model.' };
    }

    if (status === 429 || msg.includes('rate limit') || msg.includes('429')) {
      return { message: 'Rate limited by NVIDIA API.', type: 'rate_limit', retryable: true, suggestion: 'Reduce request frequency or upgrade your NVIDIA API tier.' };
    }

    if (status === 401 || status === 403 || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('invalid api key')) {
      return { message: 'Authentication failed. Check NVIDIA_API_KEY.', type: 'auth_error', retryable: false, suggestion: 'Verify your NVIDIA_API_KEY is valid and has not expired.' };
    }

    if (status === 400 && (msg.includes('prompt') || msg.includes('max_tokens') || msg.includes('token'))) {
      return { message: `Prompt validation error: ${error.message}`, type: 'prompt_validation', retryable: false, suggestion: 'Reduce prompt size or maxTokens. Try the 8B model for smaller context windows.' };
    }

    if (status === 404 || msg.includes('model not found') || msg.includes('not found')) {
      return { message: `Model unavailable: ${config.nvidia.model}`, type: 'model_unavailable', retryable: false, suggestion: 'Check that the model name is correct at https://build.nvidia.com/' };
    }

    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || msg.includes('network error') || msg.includes('econnrefused') || msg.includes('enotfound')) {
      return { message: `Network error connecting to ${config.nvidia.baseUrl}`, type: 'network_error', retryable: true, suggestion: 'Verify your network connectivity and the NVIDIA_BASE_URL.' };
    }

    return { message: error.message, type: 'unknown', retryable: false, suggestion: 'Check the NVIDIA API status page at https://status.nvidia.com/' };
  }

  private classifyError(error: any, status: number | undefined, code: string | undefined): string {
    const msg = error?.message?.toLowerCase() || '';
    if (error?.name === 'TimeoutError' || msg.includes('abort') || msg.includes('timeout') || code === 'ETIMEDOUT' || code === 'ECONNABORTED') return 'timeout';
    if (status === 429) return 'rate_limited';
    if (status && status >= 500 && status < 600) return `server_error_${status}`;
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || msg.includes('network error')) return 'network_error';
    return 'unknown';
  }

  private isRetryableError(error: any, status?: number, code?: string): boolean {
    if (status && RETRYABLE_STATUS_CODES.has(status)) return true; // 429, 502, 503, 504
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      // DO NOT retry repeated timeouts unless it's a 504 server timeout
      if ((error.name === 'TimeoutError' || msg.includes('abort') || msg.includes('timeout') || code === 'ETIMEDOUT' || code === 'ECONNABORTED') && status !== 504) {
        return false;
      }
      if (msg.includes('429') || msg.includes('rate limit')) return true;
      if (code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'ENOTFOUND') return true;
      if (msg.includes('network error') || msg.includes('econnrefused') || msg.includes('econnreset') || msg.includes('enotfound')) return true;
      if (msg.includes('504') || msg.includes('502') || msg.includes('503') || msg.includes('502')) return true;
    }
    return false;
  }

  private calculateResponseDelay(attempt: number): number {
    if (attempt === 0) return 1000;
    const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
    return delay;
  }

  private calculateCost(model: AIModel, promptTokens: number, completionTokens: number): number {
    const rates = MODEL_COSTS[model];
    if (!rates) return 0;
    return promptTokens * rates.input + completionTokens * rates.output;
  }

  getClient(): NvidiaAI {
    return this.client;
  }
}