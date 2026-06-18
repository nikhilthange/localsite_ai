import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    );

    rerender({ value: 'world', delay: 300 });
    expect(result.current).toBe('hello');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('world');
  });

  it('cancels previous debounce on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'ab', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'abc', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: 'abcd', delay: 300 });

    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe('a');

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('abcd');
  });

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('second');
  });
});
