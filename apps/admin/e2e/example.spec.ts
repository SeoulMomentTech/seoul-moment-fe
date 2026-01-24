import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic check to ensure the app is running
  // Adjust the expected title based on actual app title
  await expect(page).toHaveTitle(/admin/);
});
