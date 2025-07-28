import {test, expect} from '../fixtures';

test.describe('Edit Article', () => {
  test.beforeEach(
    async ({page, login, navigatePW, waitForSpinnerToDisappear}) => {
      await login();

      // Navigate to Articles page
      navigatePW('inventory', 'articles-&-suppliers');
      await waitForSpinnerToDisappear();

      // Navigate to details page (click on article)
      await page.locator('tr[role="row"]').nth(1).click();
      await waitForSpinnerToDisappear();

      // Wait for the article details page to fully load
      await page.waitForSelector('[data-testid="CreateIcon"]', {
        state: 'visible',
      });
    },
  );

  test('should validate article details', async ({page}) => {
    // Open the dialog - equivalent to ArticlesPage.openArticleDialog('Edit Basic Information', 0)
    await page.locator('[data-testid="CreateIcon"]').first().click();
    await expect(page.locator('#alert-dialog-title')).toContainText(
      'Edit Basic Information',
    );

    // Validate that the Name field is required
    await page.locator('input[name="name"]').clear();
    await page.locator('#alert-dialog-title').click(); // Click outside to trigger validation
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(
      page.locator('[role="dialog"] button:has-text("Save")'),
    ).toBeDisabled();

    // Fill the name field
    await page.locator('input[name="name"]').fill('Test Article');

    // Select a random Purchase VAT option
    await page.locator('#mui-component-select-unitPurchaseVat').click();
    await page.waitForSelector('li[role="option"]', {state: 'visible'});
    const purchaseVatOptions = page.locator('li[role="option"]');
    const purchaseVatCount = await purchaseVatOptions.count();
    if (purchaseVatCount > 0) {
      const randomPurchaseIndex = Math.floor(Math.random() * purchaseVatCount);
      await purchaseVatOptions.nth(randomPurchaseIndex).click();
    }

    // Select a random Selling VAT option
    const sellingVatSelector = page.locator(
      '#mui-component-select-unitSellingVat',
    );
    await expect(sellingVatSelector).toBeVisible();
    await sellingVatSelector.click();
    await page.waitForSelector('li[role="option"]', {state: 'visible'});
    const sellingVatOptions = page.locator('li[role="option"]');
    const sellingVatCount = await sellingVatOptions.count();
    if (sellingVatCount > 0) {
      const randomSellingIndex = Math.floor(Math.random() * sellingVatCount);
      await sellingVatOptions.nth(randomSellingIndex).click();
    }

    // Ensure the Save button is now enabled
    await expect(
      page.locator('[role="dialog"] button:has-text("Save")'),
    ).not.toBeDisabled();
  });

  test('should show delete article modal with its content and delete article', async ({
    page,
  }) => {
    // Check if delete button is visible (equivalent to checking canDelete)
    const deleteButton = page.locator('button[data-testid="articleDelete"]');
    await deleteButton.isVisible();
    // Open delete modal
    await deleteButton.click();

    // Validate modal content
    await expect(page.locator('#alert-dialog-title')).toContainText('Delete');
    await expect(page.locator('#alert-dialog-description')).toContainText(
      'Do you want to delete this article?',
    );
    await expect(page.locator('[data-test-id="remove"]')).toContainText('Yes');

    // Delete the article
    await page.locator('button:has-text("Yes")').click();
    await expect(
      page.locator('text=Article deleted successfully'),
    ).toBeVisible();
  });

  test('should edit article description', async ({page}) => {
    // Open edit description dialog
    await page.locator('[data-testid="CreateIcon"]').nth(1).click();
    await expect(page.locator('#alert-dialog-title')).toContainText(
      'Edit Description',
    );

    // Save and verify success message
    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Article updated successfully.'),
    ).toBeVisible();
  });

  test('should edit article stock information', async ({page}) => {
    // Open edit stock information dialog
    await page.locator('[data-testid="CreateIcon"]').nth(2).click();
    await expect(page.locator('#alert-dialog-title')).toContainText(
      'Edit Stock Information',
    );

    // Save and verify success message
    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Article updated successfully.'),
    ).toBeVisible();
  });

  test('should edit article supplier information', async ({page}) => {
    // Open edit supplier information dialog
    await page.locator('[data-testid="CreateIcon"]').nth(3).click();
    await expect(page.locator('#alert-dialog-title')).toContainText(
      'Edit Suppliers Information',
    );

    // Save and verify success message
    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Supplier updated successfully.'),
    ).toBeVisible();
  });

  test('should edit article qr code information', async ({page}) => {
    // Open edit QR code dialog
    await page.locator('[data-testid="CreateIcon"]').nth(4).click();
    await expect(page.locator('#alert-dialog-title')).toContainText(
      'Edit QR Code',
    );

    // Verify save button is visible but disabled
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });
});
