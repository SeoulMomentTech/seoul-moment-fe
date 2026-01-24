import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic check to ensure the app is running
  await expect(page).toHaveTitle(/Seoul Moment/);
});
