import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebsiteProvider } from '@/context/WebsiteContext';
import { useWebsites } from '@/hooks/useWebsite';
import { websiteService } from '@/services/websiteService';

vi.mock('@/services/websiteService', () => ({
  websiteService: {
    getWebsites: vi.fn(),
    generateWebsite: vi.fn(),
    updateWebsite: vi.fn(),
    deleteWebsite: vi.fn(),
  },
}));

function TestComponent() {
  const { websites, loading, fetchWebsites, createWebsite, deleteWebsite } = useWebsites();
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="count">{websites.length}</span>
      <ul>
        {websites.map((w) => (
          <li key={w._id} data-testid={`web-${w._id}`}>{w.businessName}</li>
        ))}
      </ul>
      <button data-testid="fetch" onClick={fetchWebsites}>Fetch</button>
      <button data-testid="create" onClick={() => createWebsite({ businessName: 'New Site', category: 'restaurant' })}>Create</button>
      <button data-testid="delete" onClick={() => deleteWebsite('web-1')}>Delete</button>
    </div>
  );
}

describe('WebsiteContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with empty websites', () => {
    render(
      <WebsiteProvider>
        <TestComponent />
      </WebsiteProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('fetches websites', async () => {
    const mockedGetWebsites = vi.mocked(websiteService.getWebsites);
    mockedGetWebsites.mockResolvedValue({
      data: { data: [{ _id: 'web-1', businessName: 'Test Biz' }] },
    });

    const user = userEvent.setup();
    render(
      <WebsiteProvider>
        <TestComponent />
      </WebsiteProvider>
    );

    await user.click(screen.getByTestId('fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
    });
    expect(screen.getByText('Test Biz')).toBeInTheDocument();
  });

  it('creates a new website', async () => {
    const mockedCreate = vi.mocked(websiteService.generateWebsite);
    mockedCreate.mockResolvedValue({
      data: { website: { _id: 'web-new', businessName: 'New Site' } },
    });

    render(
      <WebsiteProvider>
        <TestComponent />
      </WebsiteProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByTestId('create'));

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith({ businessName: 'New Site', category: 'restaurant' });
    });
  });

  it('deletes a website', async () => {
    const mockedDelete = vi.mocked(websiteService.deleteWebsite);
    mockedDelete.mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <WebsiteProvider>
        <TestComponent />
      </WebsiteProvider>
    );

    await user.click(screen.getByTestId('delete'));
    expect(mockedDelete).toHaveBeenCalledWith('web-1');
  });
});
