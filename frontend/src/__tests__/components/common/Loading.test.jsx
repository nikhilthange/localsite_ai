import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loading from '@/components/common/Loading';

describe('Loading', () => {
  it('renders a spinner by default', () => {
    render(<Loading />);
    const spinner = document.querySelector('.rounded-full');
    expect(spinner).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<Loading label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders in fullPage mode', () => {
    render(<Loading fullPage />);
    const overlay = document.querySelector('.fixed');
    expect(overlay).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Loading size="sm" />);
    expect(document.querySelector('.rounded-full')).toBeInTheDocument();

    rerender(<Loading size="lg" />);
    expect(document.querySelector('.rounded-full')).toBeInTheDocument();

    rerender(<Loading />);
    expect(document.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(<Loading />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
