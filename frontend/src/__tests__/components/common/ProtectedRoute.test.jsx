import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '@/components/common/ProtectedRoute';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated={true} />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute isAuthenticated={false} />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('shows loading state while auth is loading', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated={false} loading={true} />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('allows admin users for admin routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated={true} isAdmin={true} />}>
            <Route path="admin" element={<div>Admin Panel</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects non-admin users from admin routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated={true} isAdmin={false} />}>
            <Route path="admin" element={<div>Admin Panel</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
