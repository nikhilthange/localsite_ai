import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function TestComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="isDark">{isDark.toString()}</span>
      <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('provides default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('isDark').textContent).toBe('false');
  });

  it('toggles between light and dark', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('isDark').textContent).toBe('true');
  });

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(localStorage.getItem('theme')).toBe('light');
    await user.click(screen.getByTestId('toggle'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('reads theme from localStorage on init', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('throws error when useTheme is used outside provider', () => {
    const originalErr = console.error;
    console.error = () => {};

    expect(() => render(<TestComponent />)).toThrow();

    console.error = originalErr;
  });
});
