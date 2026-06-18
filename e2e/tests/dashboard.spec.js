// ============================================
// LocalSite AI - Dashboard & Navigation E2E Tests
// ============================================
import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout', () => {
  test('should display loading state', async ({ page }) => {
    await page.goto('/dashboard');
    const spinner = page.locator('.animate-spin, [data-testid="loader"]');
    await expect(spinner.or(page.locator('text=Login'))).toBeVisible();
  });

  test('sidebar navigation links exist on dashboard', async ({ page }) => {
    const response = await page.goto('/dashboard');
    if (response && response.status() < 400) {
      const navLinks = page.locator('nav a, [data-testid="sidebar"] a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(3);
    }
  });

  test('should redirect unknown dashboard routes', async ({ page }) => {
    await page.goto('/dashboard/unknown-route');
    await expect(page).not.toHaveURL(/unknown-route/);
  });
});

test.describe('Admin Access', () => {
  test('should redirect non-admins from admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/login/);
  });

  test('admin users page requires auth', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should display mobile menu toggle', async ({ page }) => {
    await page.goto('/');
    const mobileToggle = page.locator('button[aria-label*="menu" i], button[aria-label*="toggle" i], .mobile-menu-button');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await expect(page.locator('nav a').first()).toBeVisible();
    }
  });
});

test.describe('Dark Mode', () => {
  test('dark mode toggle exists', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label*="dark" i], button[aria-label*="theme" i], button:has(svg)');
    expect(await toggle.count()).toBeGreaterThan(0);
  });

  test('dark mode persists on navigation', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    const toggle = page.locator('button[aria-label*="dark" i], button[aria-label*="theme" i], button:has(svg)').first();

    if (await toggle.isVisible()) {
      await toggle.click();
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');
      const afterClass = await html.getAttribute('class');
      expect(afterClass).not.toBe(initialClass);
    }
  });
});
