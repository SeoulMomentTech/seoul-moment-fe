import { test, expect } from './fixtures/auth';

test.describe('Product Category Management (Real Data)', () => {
  // Use a unique name to avoid conflicts with existing data or other tests
  const timestamp = Date.now();
  const categoryName = `E2E_Test_${timestamp}`;
  const updatedCategoryName = `E2E_Test_Updated_${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/products/categories');
  });

  test('should manage category lifecycle (Create -> Edit -> Delete)', async ({ page }) => {
    // --- 1. CREATE ---
    await page.getByRole('button', { name: '카테고리 추가' }).click();

    // Fill form
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.fill('#categoryNameKo', categoryName);

    page.getByRole('button', { name: '추가', exact: true }).click();
    // Submit
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'POST' &&
        resp.status() >= 200 &&
        resp.status() < 300
    );
    // Wait for the list to refresh
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200
    );

    // Verify creation by searching
    await expect(page.getByRole('dialog')).toBeHidden();

    // Search for the new category
    await page.getByPlaceholder('카테고리명으로 검색...').fill(categoryName);
    page.getByRole('button', { name: '검색' }).click();
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200
    );

    // --- 2. EDIT ---
    // Find the row with the specific category name
    const row = page.getByRole('row', { name: categoryName });
    await row.getByRole('button', { name: '수정' }).click();

    // Fill form
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#editCategoryNameKo')).toHaveValue(categoryName);

    await page.fill('#editCategoryNameKo', updatedCategoryName);
    await page.fill('#editCategoryNameEn', `En_${updatedCategoryName}`);
    await page.fill('#editCategoryNameZh', `Zh_${updatedCategoryName}`);

    page.getByRole('button', { name: '저장' }).click();
    // Submit

    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'PATCH' &&
        resp.status() >= 200 &&
        resp.status() < 300
    );

    // Wait for the list to refresh
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200
    );

    // Verify update
    await expect(page.getByRole('dialog')).toBeHidden();

    // Search for the updated category
    await page.getByPlaceholder('카테고리명으로 검색...').fill(updatedCategoryName);
    page.getByRole('button', { name: '검색' }).click();


    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200
    );

    //await expect(page.getByText(updatedCategoryName)).toBeVisible();
    await expect(page.getByText(categoryName)).toBeHidden();

    // --- 3. DELETE ---
    // Setup dialog handler before action
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('삭제하시겠습니까');
      await dialog.accept();
    });

    // Find the updated row
    const updatedRow = page.getByRole('row', { name: updatedCategoryName });

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/admin/category') &&
          resp.request().method() === 'DELETE' &&
          resp.status() >= 200 &&
          resp.status() < 300
      ),
      updatedRow.getByRole('button', { name: '삭제' }).click(),
    ]);

    // Wait for the list to refresh
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/admin/category') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200
    );

    // Verify removal
    await expect(page.getByText(updatedCategoryName)).toBeHidden();
  });
});