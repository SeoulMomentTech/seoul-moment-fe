import { Buffer as NodeBuffer } from 'node:buffer';

import { expect, test } from './fixtures/auth';

test.describe('Product Sub-Category Management', () => {
  const timestamp = Date.now();
  const subCategoryName = `E2E_Sub_${timestamp}`;
  const updatedSubCategoryName = `E2E_Sub_Updated_${timestamp}`;
  const parentCategoryId = '1'; // Assuming ID 1 exists in the environment

  test.beforeEach(async ({ page }) => {
    // Mock Image Upload
    await page.route('**/admin/image/upload', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            imageUrl: 'https://mock.com/image.jpg',
            imagePath: '/mock/image.jpg',
          },
        },
      });
    });

    await page.goto('/products/sub-categories');
  });

  test('should show validation errors and disable submit button when form is empty', async ({ page }) => {
    await page.getByRole('button', { name: '서브 카테고리 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const submitButton = page.getByRole('button', { name: '추가', exact: true });
    await expect(submitButton).toBeDisabled();

    await page.fill('#subcategoryNameKo', 'Test');
    await page.fill('#subcategoryNameKo', ''); // Clear it
    await expect(page.getByText('한국어 이름을 입력해주세요.')).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('should manage sub-category lifecycle (Create -> Search -> Edit -> Delete)', async ({ page }) => {
    // --- 1. CREATE ---
    await page.getByRole('button', { name: '서브 카테고리 추가' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.fill('#subcategoryNameKo', subCategoryName);
    await page.fill('#subcategoryNameEn', subCategoryName);
    await page.fill('#subcategoryNameZh', subCategoryName);
    await page.fill('#parentCategoryId', parentCategoryId);

    // Mock Image Upload
    await page.setInputFiles('input[type="file"]', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: NodeBuffer.from('test'),
    });
    await expect(page.locator('#subcategoryImageUrl')).toHaveValue('/mock/image.jpg');

    page.getByRole('button', { name: '추가', exact: true }).click();
    // Submit
    await page.waitForResponse(r => r.url().includes('/admin/product/category') && r.request().method() === 'POST');

    await expect(page.getByRole('dialog')).toBeHidden();

    // --- 2. SEARCH ---
    await page.getByPlaceholder('서브카테고리명으로 검색...').fill(subCategoryName);
    page.getByRole('button', { name: '검색' }).click();

    await page.waitForResponse(r => r.url().includes('/admin/product/category/list') && r.request().method() === 'GET');

    // --- 3. EDIT ---
    const row = page.getByRole('row', { name: subCategoryName });
    await row.getByRole('button', { name: '수정' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#editSubcategoryNameKo')).toHaveValue(subCategoryName);

    // Wait for the detail data to load (prevent race condition with empty categoryId)
    await expect(page.locator('#editParentCategoryId')).toHaveValue(parentCategoryId);

    await page.fill('#editSubcategoryNameKo', updatedSubCategoryName);
    await page.getByRole('button', { name: '수정제출', exact: true }).click();

    await page.waitForResponse(r => r.url().includes('/admin/product/category') && r.request().method() === 'PATCH');

    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify search for updated name
    await page.getByPlaceholder('서브카테고리명으로 검색...').fill(updatedSubCategoryName);
    await page.getByRole('button', { name: '검색' }).click();
    await expect(page.getByText(updatedSubCategoryName)).toBeVisible();

    // --- 4. DELETE ---
    page.on('dialog', d => d.accept());

    await Promise.all([
      page.waitForResponse(r => r.url().includes('/admin/product/category') && r.request().method() === 'DELETE'),
      page.getByRole('row', { name: updatedSubCategoryName }).getByRole('button', { name: '삭제' }).click(),
    ]);

    await expect(page.getByText(updatedSubCategoryName)).toBeHidden();
  });

  test('should filter by page size', async ({ page }) => {
    // Wait for initial load
    await page.waitForResponse(r => r.url().includes('/admin/product/category/list'));

    // Change page size to 20
    await page.getByRole('combobox').click();
    await Promise.all([
      page.waitForResponse(r => r.url().includes('count=20')),
      page.getByRole('option', { name: '20개씩' }).click(),
    ]);

    // Check if the URL or state reflects the change if possible, 
    // or just verify the response was triggered with correct params.
  });
});
