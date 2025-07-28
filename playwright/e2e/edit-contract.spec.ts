import {test, expect} from '../fixtures';

test.describe('Edit Contracts', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('customer-center', 'contracts');
    await waitForSpinnerToDisappear();
  });

  test('validate data', async ({page, waitForSpinnerToDisappear}) => {
    // Set up API interception for contract info
    const contractInfoPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/contracts/') &&
        resp.request().method() === 'GET',
    );

    // Navigate to details page - click on the first contract row
    await page
      .locator(
        'tr[data-rowindex="1"] td[data-field="EXTERNAL_ID"][role="cell"]',
      )
      .click();

    // Wait for spinner to disappear
    await waitForSpinnerToDisappear();

    // Wait for contract info API call and get the response
    const contractResponse = await contractInfoPromise;
    const contractData = await contractResponse.json();

    // Open the edit dialog
    await page.locator('svg[data-testid="MoreVertIcon"]').first().click();
    await page.locator('li[role="menuitem"]:has-text("Edit")').click();

    // Verify the edit dialog is open
    await expect(page.locator('text=Edit Contract')).toBeVisible();

    // Wait for dialog to fully load
    await page.waitForTimeout(1500);

    // Calculate the next annual price value
    const currentAnnualPrice =
      contractData?.additionalInfo?.annualPriceAdjustmentPercentage || 0;
    const nextAnnualPrice = String(currentAnnualPrice + 1);

    // Clear and fill the annual price adjustment percentage field
    const annualPriceField = page.locator(
      'input[name="annualPriceAdjustmentPercentage"]',
    );
    await annualPriceField.clear();
    await annualPriceField.fill(nextAnnualPrice);

    // Click outside the dialog (on the dialog title to trigger validation)
    await page.locator('#alert-dialog-title').click();

    // Verify that the Save button is not disabled
    await expect(page.locator('button:has-text("Save")')).not.toBeDisabled();
  });
});
