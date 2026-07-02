import { NotificationService } from '../../src/modules/notification/services/NotificationService';
import { NotificationRepository } from '../../src/modules/notification/repositories/NotificationRepository';

const VALID_ID = '507f1f77bcf86cd799439011';

vi.mock('../../src/modules/notification/repositories/NotificationRepository');

const MockedNotificationRepository = NotificationRepository as vi.MockedClass<typeof NotificationRepository>;

describe('NotificationService', () => {
  let service: NotificationService;
  let mockRepository: vi.Mocked<NotificationRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = new MockedNotificationRepository() as vi.Mocked<NotificationRepository>;
    service = new NotificationService();
    (service as any).repository = mockRepository;
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const notification = {
        _id: 'notif-1',
        type: 'lead',
        title: 'New Lead',
        message: 'You have a new lead from Joe',
        read: false,
      };

      mockRepository.create.mockResolvedValue(notification as any);

      const result = await service.create(VALID_ID, 'lead', 'New Lead', 'You have a new lead from Joe');

      expect(result).toBe(notification);
      expect(mockRepository.create).toHaveBeenCalled();
      const callArg = mockRepository.create.mock.calls[0][0] as any;
      expect(callArg.type).toBe('lead');
      expect(callArg.title).toBe('New Lead');
    });
  });

  describe('getNotifications', () => {
    it('should return paginated notifications', async () => {
      const result = {
        data: [{ _id: 'notif-1', title: 'New Lead' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockRepository.paginate.mockResolvedValue(result as any);

      const notifications = await service.getNotifications(VALID_ID, { page: 1, limit: 10 });

      expect(notifications.data).toHaveLength(1);
      expect(mockRepository.paginate).toHaveBeenCalledWith({ userId: VALID_ID }, { page: 1, limit: 10 });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockRepository.findOne.mockResolvedValue({ _id: 'notif-1', userId: VALID_ID } as any);
      mockRepository.markAsRead.mockResolvedValue({ _id: 'notif-1', read: true } as any);

      const result = await service.markAsRead('notif-1', VALID_ID);

      expect(result.read).toBe(true);
    });

    it('should throw if notification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('nonexistent', VALID_ID)).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      mockRepository.markAllRead.mockResolvedValue(5);

      const result = await service.markAllAsRead(VALID_ID);

      expect(result).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockRepository.getUnreadCount.mockResolvedValue(3);

      const result = await service.getUnreadCount(VALID_ID);

      expect(result).toBe(3);
    });
  });
});
