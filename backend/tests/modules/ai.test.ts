import { AIEngineService } from '../../src/modules/ai/services/AIEngineService';
import { AIClient } from '../../src/modules/ai/services/AIClient';
import type { AICompletionRequest } from '../../src/modules/ai/types';

const VALID_ID = '507f1f77bcf86cd799439011';

jest.mock('../../src/modules/ai/services/AIClient', () => ({
  AIClient: { getInstance: jest.fn() },
}));

jest.mock('../../src/modules/ai/services/PromptTemplateService', () => ({
  PromptTemplateService: jest.fn().mockImplementation(() => ({
    getPrompt: jest.fn(),
    compile: jest.fn(),
  })),
}));

jest.mock('../../src/modules/ai/services/TokenUsageService', () => ({
  TokenUsageService: jest.fn().mockImplementation(() => ({
    recordUsage: jest.fn(),
  })),
}));

jest.mock('../../src/modules/ai/services/AICreditService', () => ({
  AICreditService: jest.fn().mockImplementation(() => ({
    consumeCredits: jest.fn(),
    getBalance: jest.fn(),
    refundCredits: jest.fn(),
  })),
}));

jest.mock('../../src/core/socket/SocketSetup', () => ({
  emitToUser: jest.fn(),
}));

jest.mock('../../src/modules/ai/models/AiCredit', () => ({
  AiCredit: { findOne: jest.fn(), create: jest.fn() },
}));

describe('AIEngineService', () => {
  let service: AIEngineService;
  let mockAIClient: jest.Mocked<AIClient>;
  let mockAICreditService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockAIClient = { complete: jest.fn(), completeStream: jest.fn() } as any;
    (AIClient.getInstance as jest.Mock).mockReturnValue(mockAIClient);

    service = new AIEngineService();

    const { AICreditService } = require('../../src/modules/ai/services/AICreditService');
    mockAICreditService = (AICreditService as jest.Mock).mock.results[0]?.value;
  });

  describe('generate', () => {
    it('should generate AI completion successfully', async () => {
      const creditsService = (service as any).credits;
      creditsService.consumeCredits.mockResolvedValue({ success: true, remaining: 90, cost: 10 });

      const expectedResponse = {
        content: 'Generated content',
        model: 'gpt-4o-mini',
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
      expect(result.model).toBe('gpt-4o-mini');
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
      creditsService.refundCredits = jest.fn().mockResolvedValue(10);

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
