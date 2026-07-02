import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '@/components/common/ProtectedRoute';

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute isAuthenticated={true}>
          <div>Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={false} redirectTo="/login">
              <div>Dashboard Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('shows loading state while auth is loading', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute isAuthenticated={false} loading={true}>
          <div>Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
  });

  it('allows admin users for admin routes', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute isAuthenticated={true} isAdmin={true}>
          <div>Admin Panel</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects non-admin users from admin routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/admin" element={
            <ProtectedRoute isAuthenticated={true} isAdmin={false} requiredRole="admin">
              <div>Admin Panel</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
