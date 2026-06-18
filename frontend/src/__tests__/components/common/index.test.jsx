import { describe, it, expect } from 'vitest';

describe('Components barrel exports', () => {
  it('Button module exports correctly', async () => {
    const mod = await import('@/components/common/Button');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('Input module exports correctly', async () => {
    const mod = await import('@/components/common/Input');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('Loading module exports correctly', async () => {
    const mod = await import('@/components/common/Loading');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('ProtectedRoute module exports correctly', async () => {
    const mod = await import('@/components/common/ProtectedRoute');
    expect(mod.default).toBeDefined();
  });
});
