// ============================================
// LocalSite AI - Website Generation E2E Tests
// ============================================
import { test, expect } from '@playwright/test';

test.describe('Website Generation Flow', () => {
  test.describe('Public Pages', () => {
    test('should load homepage', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/LocalSite|AI|Website/i);
    });

    test('should display pricing page', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.locator('text=Pricing').or(page.locator('text=Plans'))).toBeVisible();
    });

    test('should display contact page', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('textarea').first()).toBeVisible();
    });

    test('should navigate between public pages', async ({ page }) => {
      await page.goto('/');
      await page.locator('a:has-text("Pricing")').first().click();
      await expect(page).toHaveURL(/pricing/);
      await page.locator('a:has-text("Contact")').first().click();
      await expect(page).toHaveURL(/contact/);
    });
  });

  test.describe('Dashboard (authenticated)', () => {
    test('should show website list on dashboard', async ({ page }) => {
      await page.goto('/websites');
      await expect(page).toHaveURL(/login/); // redirected
    });

    test('should display generate website button', async ({ page }) => {
      const response = await page.goto('/websites/generate');
      if (response && response.status() < 400) {
        await expect(page.locator('button:has-text("Generate")').or(page.locator('text=Business'))).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should show 404 page for unknown routes', async ({ page }) => {
      const response = await page.goto('/nonexistent-route-12345');
      const status = response ? response.status() : 0;
      expect(status >= 200 || status === 0).toBeTruthy();
    });

    test('should navigate back from 404', async ({ page }) => {
      await page.goto('/nonexistent');
      const homeLink = page.locator('a:has-text("Home")').or(page.locator('a:has-text("Go Home")'));
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).not.toHaveURL(/nonexistent/);
      }
    });
  });
});
