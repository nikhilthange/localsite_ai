import { DeploymentService } from '../../src/modules/deployment/services/DeploymentService';

const VALID_ID = '507f1f77bcf86cd799439011';

vi.mock('../../src/modules/deployment/repositories/DeploymentRepository', () => {
  const mock = {
    findById: vi.fn(),
    findOne: vi.fn(),
    findByWebsiteId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    find: vi.fn(),
    paginate: vi.fn(),
  };
  (global as any).__mockDeploymentRepo = mock;
  return { DeploymentRepository: vi.fn().mockImplementation(() => mock) };
});

vi.mock('../../src/core/storage/S3Storage', () => ({ S3Storage: { upload: vi.fn() } }));
vi.mock('../../src/core/events/EventBus', () => ({ EventBus: { emit: vi.fn() } }));
vi.mock('../../src/modules/website/models/Website', () => ({ Website: { findOne: vi.fn(), findByIdAndUpdate: vi.fn() } }));

const mockRepo = (global as any).__mockDeploymentRepo;

describe('DeploymentService', () => {
  let service: DeploymentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DeploymentService();
  });

  describe('getDeploymentStatus', () => {
    it('should return deployment status', async () => {
      const deployment = { _id: 'deploy-1', status: 'live', url: 'https://test-biz.localsiteai.com' };
      mockRepo.findById.mockResolvedValue(deployment);

      expect(await service.getDeploymentStatus('deploy-1')).toBe(deployment);
    });
  });

  describe('getDeploymentHistory', () => {
    it('should return deployment history for a website', async () => {
      const history = [{ _id: 'deploy-1', status: 'live' }, { _id: 'deploy-2', status: 'failed' }];
      mockRepo.findByWebsiteId.mockResolvedValue(history);

      const result = await service.getDeploymentHistory('web-1');
      expect(result).toHaveLength(2);
    });
  });
});
