import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          window.matchMedia._handlers = window.matchMedia._handlers || [];
          window.matchMedia._handlers.push(handler);
        }
      }),
      removeEventListener: vi.fn(),
    }));
  });

  it('returns false for non-matching query', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('returns true for matching query', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('responds to media query changes', () => {
    const listeners = [];
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, handler) => {
        listeners.push(handler);
      }),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));

    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((handler) => handler({ matches: true }));
    });

    expect(result.current).toBe(true);
  });
});
