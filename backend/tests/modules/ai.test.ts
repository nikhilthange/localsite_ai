import { AIEngineService } from '../../src/modules/ai/services/AIEngineService';
import { AIClient } from '../../src/modules/ai/services/AIClient';
import { AICreditService } from '../../src/modules/ai/services/AICreditService';
import type { AICompletionRequest } from '../../src/modules/ai/types';

const VALID_ID = '507f1f77bcf86cd799439011';

vi.mock('../../src/modules/ai/services/AIClient', () => ({
  AIClient: { getInstance: vi.fn() },
}));

vi.mock('../../src/modules/ai/services/PromptTemplateService', () => ({
  PromptTemplateService: vi.fn().mockImplementation(() => ({
    getPrompt: vi.fn(),
    compile: vi.fn(),
  })),
}));

vi.mock('../../src/modules/ai/services/TokenUsageService', () => ({
  TokenUsageService: vi.fn().mockImplementation(() => ({
    recordUsage: vi.fn(),
  })),
}));

vi.mock('../../src/modules/ai/services/AICreditService', () => ({
  AICreditService: vi.fn().mockImplementation(() => ({
    consumeCredits: vi.fn(),
    getBalance: vi.fn(),
    refundCredits: vi.fn(),
  })),
}));

vi.mock('../../src/core/socket/SocketSetup', () => ({
  emitToUser: vi.fn(),
}));

vi.mock('../../src/modules/ai/models/AiCredit', () => ({
  AiCredit: { findOne: vi.fn(), create: vi.fn() },
}));

describe('AIEngineService', () => {
  let service: AIEngineService;
  let mockAIClient: vi.Mocked<AIClient>;
  let mockAICreditService: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockAIClient = { complete: vi.fn(), completeStream: vi.fn() } as any;
    (AIClient.getInstance as vi.Mock).mockReturnValue(mockAIClient);

    service = new AIEngineService();

    mockAICreditService = (AICreditService as vi.Mock).mock.results[0]?.value;
  });

  describe('generate', () => {
    it('should generate AI completion successfully', async () => {
      const creditsService = (service as any).credits;
      creditsService.consumeCredits.mockResolvedValue({ success: true, remaining: 90, cost: 10 });

      const expectedResponse = {
        content: 'Generated content',
        model: 'meta/llama-3.1-8b-instruct',
        usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
        cost: 0.002,
        latency: 500,
        cached: false,
      };
      mockAIClient.complete.mockResolvedValue(expectedResponse);

      const request: AICompletionRequest = {
        userId: VALID_ID,
        taskType: 'website-generation' as any,
        websiteId: VALID_ID,
        userPrompt: 'Create a homepage',
      };

      const result = await service.generate(request, false);

      expect(result.content).toBe('Generated content');
      expect(result.model).toBe('meta/llama-3.1-8b-instruct');
      expect(result.usage.totalTokens).toBe(150);
    });

    it('should throw on insufficient credits', async () => {
      const creditsService = (service as any).credits;
      creditsService.consumeCredits.mockResolvedValue({ success: false, remaining: 5, cost: 10 });

      const request: AICompletionRequest = {
        userId: VALID_ID,
        taskType: 'website-generation' as any,
        websiteId: VALID_ID,
        userPrompt: 'Create a homepage',
      };

      await expect(service.generate(request, false)).rejects.toThrow('Insufficient');
    });

    it('should handle AI client failure gracefully', async () => {
      const creditsService = (service as any).credits;
      creditsService.consumeCredits.mockResolvedValue({ success: true, remaining: 90, cost: 10 });
      creditsService.refundCredits = vi.fn().mockResolvedValue(10);

      mockAIClient.complete.mockRejectedValue(new Error('AI API error'));

      const request: AICompletionRequest = {
        userId: VALID_ID,
        taskType: 'website-generation' as any,
        websiteId: VALID_ID,
        userPrompt: 'Create a homepage',
      };

      await expect(service.generate(request, false)).rejects.toThrow('AI API error');
      expect(creditsService.refundCredits).toHaveBeenCalled();
    });
  });

  describe('checkCredits', () => {
    it('should return credit status', async () => {
      const creditsService = (service as any).credits;
      creditsService.getBalance.mockResolvedValue({ userId: VALID_ID, balance: 100, lifetimeUsed: 50, lifetimePurchased: 150 });

      const result = await service.checkCredits(VALID_ID, 'website-generation' as any);

      expect(result.sufficient).toBe(true);
      expect(result.required).toBeDefined();
      expect(result.available).toBe(100);
    });
  });

  describe('getCreditCosts', () => {
    it('should return credit costs map', () => {
      const costs = service.getCreditCosts();
      expect(costs).toBeDefined();
      expect(typeof costs).toBe('object');
    });
  });

  describe('getModels', () => {
    it('should return model map', () => {
      const models = service.getModels();
      expect(models).toBeDefined();
      expect(typeof models).toBe('object');
    });
  });

  describe('getDefaultMaxTokens', () => {
    it('should return default max tokens', () => {
      const tokens = service.getDefaultMaxTokens();
      expect(tokens).toBeDefined();
    });
  });
});
