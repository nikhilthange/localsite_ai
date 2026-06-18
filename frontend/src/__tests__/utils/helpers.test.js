import { describe, it, expect } from 'vitest';
import { formatCurrency, truncateText, generateAvatar, validateEmail, validatePassword, classNames } from '@/utils/helpers';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(2999)).toMatch(/\$|USD/);
  });

  it('formats INR when specified', () => {
    expect(formatCurrency(2999, 'INR')).toMatch(/₹|INR/);
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBeDefined();
    expect(formatCurrency(0).length).toBeGreaterThan(0);
  });
});

describe('truncateText', () => {
  it('truncates text longer than max length', () => {
    const result = truncateText('This is a very long text', 10);
    expect(result).toBe('This is a ...');
    expect(result.length).toBeLessThanOrEqual(14);
  });

  it('returns full text when shorter than max', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('generateAvatar', () => {
  it('generates initials from name', () => {
    expect(generateAvatar('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(generateAvatar('Alice')).toBe('AL');
  });

  it('handles triple names', () => {
    expect(generateAvatar('John Michael Doe')).toBe('JD');
  });

  it('handles empty string', () => {
    expect(generateAvatar('')).toBe('??');
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co')).toBe(true);
    expect(validateEmail('a+b@test.io')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts strong passwords', () => {
    expect(validatePassword('StrongP@ss1')).toBe(true);
    expect(validatePassword('MyP@ssword2024!')).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(validatePassword('')).toBe(false);
    expect(validatePassword('123')).toBe(false);
    expect(validatePassword('onlylowercase')).toBe(false);
    expect(validatePassword('NOLOWERCASE1')).toBe(false);
  });
});

describe('classNames', () => {
  it('merges class names', () => {
    expect(classNames('foo', 'bar')).toBe('foo bar');
  });

  it('filters falsy values', () => {
    expect(classNames('foo', false, null, undefined, 0, 'bar')).toBe('foo bar');
  });

  it('returns empty string for no args', () => {
    expect(classNames()).toBe('');
  });
});
