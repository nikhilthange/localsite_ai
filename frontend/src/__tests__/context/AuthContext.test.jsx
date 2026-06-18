import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="auth">{auth.isAuthenticated.toString()}</span>
      <span data-testid="loading">{auth.loading.toString()}</span>
      <span data-testid="user">{auth.user ? auth.user.name : 'null'}</span>
      <button data-testid="login" onClick={() => auth.login('test@test.com', 'password')}>Login</button>
      <button data-testid="logout" onClick={auth.logout}>Logout</button>
    </div>
  );
}

function renderWithProviders(ui) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{ui}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts unauthenticated with no user', async () => {
    const mockedGet = vi.mocked(axios.get);
    mockedGet.mockRejectedValue(new Error('No token'));

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('authenticates on login', async () => {
    const mockedPost = vi.mocked(axios.post);
    const mockedGet = vi.mocked(axios.get);
    mockedGet.mockRejectedValue(new Error('No token'));
    mockedPost.mockResolvedValue({
      data: { token: 'test-token', user: { name: 'Test User', email: 'test@test.com' } },
    });

    renderWithProviders(<TestComponent />);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    const user = userEvent.setup();
    await user.click(screen.getByTestId('login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('true');
    });
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('clears session on logout', async () => {
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Existing', email: 'e@e.com' }));

    const mockedGet = vi.mocked(axios.get);
    mockedGet.mockRejectedValue(new Error('No token'));

    renderWithProviders(<TestComponent />);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    const user = userEvent.setup();
    await user.click(screen.getByTestId('logout'));

    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('restores session from localStorage', async () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Stored', email: 'stored@test.com' }));

    const mockedGet = vi.mocked(axios.get);
    mockedGet.mockResolvedValue({ data: { user: { name: 'Stored', email: 'stored@test.com' } } });

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Stored');
    });
    expect(screen.getByTestId('auth').textContent).toBe('true');
  });
});
