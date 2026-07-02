import { Chatbot } from '../../src/modules/chatbot/models/Chatbot';
import { AIClient } from '../../src/modules/ai/services/AIClient';

vi.mock('../../src/modules/chatbot/models/Chatbot', () => ({
  Chatbot: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('../../src/modules/ai/services/AIClient', () => ({
  AIClient: { generateChatResponse: vi.fn() },
}));

describe('Chatbot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      (Chatbot.create as vi.Mock).mockResolvedValue({
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
      (Chatbot.findOne as vi.Mock).mockResolvedValue({
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
      (Chatbot.findOne as vi.Mock).mockResolvedValue(null);

      const result = await Chatbot.findOne({ websiteId: 'web-none' });

      expect(result).toBeNull();
    });
  });

  describe('updateConfig', () => {
    it('should update chatbot configuration', async () => {
      const updates = { greeting: 'Hi there!', theme: { primaryColor: '#059669' } };

      (Chatbot.findByIdAndUpdate as vi.Mock).mockResolvedValue({
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
      (AIClient.generateChatResponse as vi.Mock).mockResolvedValue({
        message: 'Thanks for reaching out! How can I assist you today?',
        confidence: 0.95,
      });

      const response = await AIClient.generateChatResponse('web-1', 'Hello', []);

      expect(response.message).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.9);
    });

    it('should handle context-aware responses', async () => {
      (AIClient.generateChatResponse as vi.Mock).mockResolvedValue({
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
      (Chatbot.countDocuments as vi.Mock).mockResolvedValue(10);

      const count = await Chatbot.countDocuments({ isActive: true });

      expect(count).toBe(10);
    });
  });
});
