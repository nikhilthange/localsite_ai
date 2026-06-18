import { Chatbot } from '../../src/modules/chatbot/models/Chatbot';

jest.mock('../../src/modules/chatbot/models/Chatbot', () => ({
  Chatbot: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock('../../src/modules/ai/services/AIClient', () => ({
  AIClient: { generateChatResponse: jest.fn() },
}));

describe('Chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a chatbot config', async () => {
      const config = {
        websiteId: 'web-1',
        name: 'Support Bot',
        greeting: 'Hello! How can I help you?',
        theme: { primaryColor: '#4F46E5', position: 'bottom-right' },
        autoRespond: true,
      };

      (Chatbot.create as jest.Mock).mockResolvedValue({
        _id: 'bot-1',
        ...config,
        isActive: true,
      });

      const result = await Chatbot.create(config);

      expect(result._id).toBe('bot-1');
      expect(result.isActive).toBe(true);
    });
  });

  describe('findByWebsiteId', () => {
    it('should return chatbot for a website', async () => {
      (Chatbot.findOne as jest.Mock).mockResolvedValue({
        _id: 'bot-1',
        websiteId: 'web-1',
        name: 'Support Bot',
        isActive: true,
      });

      const result = await Chatbot.findOne({ websiteId: 'web-1' });

      expect(result.websiteId).toBe('web-1');
      expect(result.isActive).toBe(true);
    });

    it('should return null when no chatbot exists', async () => {
      (Chatbot.findOne as jest.Mock).mockResolvedValue(null);

      const result = await Chatbot.findOne({ websiteId: 'web-none' });

      expect(result).toBeNull();
    });
  });

  describe('updateConfig', () => {
    it('should update chatbot configuration', async () => {
      const updates = { greeting: 'Hi there!', theme: { primaryColor: '#059669' } };

      (Chatbot.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: 'bot-1',
        greeting: 'Hi there!',
        theme: { primaryColor: '#059669', position: 'bottom-right' },
        isActive: true,
      });

      const result = await Chatbot.findByIdAndUpdate('bot-1', updates, { new: true });

      expect(result.greeting).toBe('Hi there!');
      expect(result.theme.primaryColor).toBe('#059669');
    });
  });

  describe('response generation', () => {
    it('should generate a response using AI', async () => {
      const { AIClient } = require('../../src/modules/ai/services/AIClient');
      (AIClient.generateChatResponse as jest.Mock).mockResolvedValue({
        message: 'Thanks for reaching out! How can I assist you today?',
        confidence: 0.95,
      });

      const response = await AIClient.generateChatResponse('web-1', 'Hello', []);

      expect(response.message).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.9);
    });

    it('should handle context-aware responses', async () => {
      const { AIClient } = require('../../src/modules/ai/services/AIClient');
      (AIClient.generateChatResponse as jest.Mock).mockResolvedValue({
        message: 'Our pricing starts at $9.99/month',
        intent: 'pricing_inquiry',
      });

      const response = await AIClient.generateChatResponse(
        'web-1',
        'How much does it cost?',
        [{ role: 'user', content: 'Tell me about pricing' }]
      );

      expect(response.intent).toBe('pricing_inquiry');
    });
  });

  describe('countDocuments', () => {
    it('should count active chatbots', async () => {
      (Chatbot.countDocuments as jest.Mock).mockResolvedValue(10);

      const count = await Chatbot.countDocuments({ isActive: true });

      expect(count).toBe(10);
    });
  });
});
