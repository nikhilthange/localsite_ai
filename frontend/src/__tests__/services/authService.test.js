import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/authService';
import api from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService', () => {
  it('login calls correct endpoint', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockResolvedValue({ data: { token: 'test-token', user: { name: 'Test' } } });

    const result = await authService.login('test@test.com', 'password123');

    expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.data.token).toBe('test-token');
  });

  it('register calls correct endpoint', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockResolvedValue({ data: { token: 'new-token', user: { name: 'New' } } });

    const result = await authService.register('New User', 'new@test.com', 'P@ssword1');

    expect(mockedPost).toHaveBeenCalledWith('/auth/register', {
      name: 'New User',
      email: 'new@test.com',
      password: 'P@ssword1',
    });
  });

  it('logout calls correct endpoint', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockResolvedValue({});

    await authService.logout();

    expect(mockedPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('forgotPassword calls correct endpoint', async () => {
    const mockedPost = vi.mocked(api.post);

    await authService.forgotPassword('test@test.com');

    expect(mockedPost).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'test@test.com',
    });
  });

  it('resetPassword calls correct endpoint', async () => {
    const mockedPost = vi.mocked(api.post);

    await authService.resetPassword('reset-token-123', 'NewP@ss1');

    expect(mockedPost).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset-token-123',
      password: 'NewP@ss1',
    });
  });

  it('getProfile calls correct endpoint', async () => {
    const mockedGet = vi.mocked(api.get);
    mockedGet.mockResolvedValue({ data: { user: { name: 'Profile' } } });

    const result = await authService.getProfile();

    expect(mockedGet).toHaveBeenCalledWith('/auth/profile');
    expect(result.data.user.name).toBe('Profile');
  });

  it('updateProfile calls correct endpoint', async () => {
    const mockedPut = vi.mocked(api.put);

    await authService.updateProfile({ name: 'Updated' });

    expect(mockedPut).toHaveBeenCalledWith('/auth/profile', { name: 'Updated' });
  });

  it('updatePassword calls correct endpoint', async () => {
    const mockedPut = vi.mocked(api.put);

    await authService.updatePassword({ currentPassword: 'old', newPassword: 'new' });

    expect(mockedPut).toHaveBeenCalledWith('/auth/password', {
      currentPassword: 'old',
      newPassword: 'new',
    });
  });

  it('handles API errors gracefully', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockRejectedValue(new Error('Network Error'));

    await expect(authService.login('test@test.com', 'wrong')).rejects.toThrow('Network Error');
  });
});
