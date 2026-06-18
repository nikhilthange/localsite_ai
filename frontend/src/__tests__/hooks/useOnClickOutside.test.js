import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

describe('useOnClickOutside', () => {
  it('calls handler when clicking outside the element', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    const outsideElement = document.createElement('button');

    document.body.appendChild(ref.current);
    document.body.appendChild(outsideElement);

    renderHook(() => useOnClickOutside(ref, handler));

    outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(ref.current);
    document.body.removeChild(outsideElement);
  });

  it('does not call handler when clicking inside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };

    document.body.appendChild(ref.current);

    renderHook(() => useOnClickOutside(ref, handler));

    ref.current.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  it('handles touch events', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    const outside = document.createElement('div');

    document.body.appendChild(ref.current);
    document.body.appendChild(outside);

    renderHook(() => useOnClickOutside(ref, handler));

    outside.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(ref.current);
    document.body.removeChild(outside);
  });
});
