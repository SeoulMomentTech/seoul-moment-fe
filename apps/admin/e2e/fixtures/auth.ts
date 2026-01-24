import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // 1. Go to login page
    await page.goto('/login');

    // 2. Perform login
    await page.fill('#email', 'admin@seoulmoment.com.tw');
    await page.fill('#password', '123456');
    await page.click('button[type="submit"]');

    // 3. Wait for navigation to home or verify login success token
    // Adjust logic depending on how your app redirects (e.g., URL change or storage)
    await page.waitForURL('/');

    // 4. Use the logged-in page
    await use(page);
  },
});

export { expect };
