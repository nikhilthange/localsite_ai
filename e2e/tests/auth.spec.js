// ============================================
// LocalSite AI - Authentication E2E Tests
// ============================================
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Registration', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.locator('h1, h2').filter({ hasText: /sign up|create account|register/i }).first()).toBeVisible();
      await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/signup');
      await page.locator('button[type="submit"], button:has-text("Sign Up")').click();
      await expect(page.locator('text=required').or(page.locator('text=invalid'))).toBeVisible();
    });

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/signup');
      await page.locator('input[name="name"], input[placeholder*="name" i]').first().fill('Test User');
      await page.locator('input[type="email"]').first().fill('test@example.com');
      await page.locator('input[type="password"]').first().fill('123');
      await page.locator('button[type="submit"], button:has-text("Sign Up")').click();
      await expect(page.locator('text=password').or(page.locator('text=weak'))).toBeVisible();
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('h1, h2').filter({ hasText: /sign in|login|welcome back/i }).first()).toBeVisible();
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('should show validation for empty fields', async ({ page }) => {
      await page.goto('/login');
      await page.locator('button[type="submit"], button:has-text("Sign In")').click();
      await expect(page.locator('text=required').or(page.locator('text=invalid'))).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[type="email"]').first().fill('wrong@example.com');
      await page.locator('input[type="password"]').first().fill('wrongpassword');
      await page.locator('button[type="submit"], button:has-text("Sign In")').click();
      await expect(page.locator('text=invalid').or(page.locator('text=error'))).toBeVisible();
    });

    test('navigation to forgot password', async ({ page }) => {
      await page.goto('/login');
      await page.locator('a:has-text("Forgot")').click();
      await expect(page).toHaveURL(/forgot-password/);
    });

    test('navigation to signup', async ({ page }) => {
      await page.goto('/login');
      await page.locator('a:has-text("Sign up")').click();
      await expect(page).toHaveURL(/signup/);
    });
  });

  test.describe('Password Reset', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
    });

    test('should show success for valid email', async ({ page }) => {
      await page.goto('/forgot-password');
      await page.locator('input[type="email"]').first().fill('test@example.com');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=sent').or(page.locator('text=check your email'))).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect to login for admin page without auth', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/login/);
    });
  });
});
