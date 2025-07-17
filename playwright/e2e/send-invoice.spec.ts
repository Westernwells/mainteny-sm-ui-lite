import {test, expect} from '../fixtures';

test.describe('Send Invoice via Email', () => {
  test.beforeEach(async ({login, navigatePW}) => {
    await login();
    await navigatePW('finance', 'invoices');
  });

  test('should send invoice and all form inputs are required', async ({
    page,
  }) => {
    // Create invoice first
    await page.locator('button:has-text("New Invoice")').click();
    await expect(page).toHaveURL(/\/invoices\/new/);

    // Select customer
    await page
      .locator('input[role="combobox"][name="propertyOwnerId"]')
      .locator('..')
      .click();
    await page
      .locator('li[role="option"][id="combo-box-demo-option-0"]')
      .click();

    // Add article
    const articleField = page.locator('[data-testid="article-name-0"]');
    await articleField.click();

    const articlesTable = page.locator('#article-combo-box-listbox');
    await expect(articlesTable).toBeVisible();
    await articlesTable.locator('li').nth(2).click();

    // Set article name
    const articleComboBox = page.locator('#article-combo-box');
    await articleComboBox.click();
    await page.waitForTimeout(500);
    await articleComboBox.clear();
    const uniqueArticleName = `Test Article ${Date.now()}`;
    await articleComboBox.fill(uniqueArticleName);
    await page.keyboard.press('Escape');

    // Set quantity
    await page
      .locator('td[data-testid="position-quantity-0"]')
      .click({force: true});
    await page.locator('input[name="items.0.quantity"]').clear();
    await page.locator('input[name="items.0.quantity"]').fill('1');

    // Set unit amount
    await page
      .locator('td[data-testid="position-unitAmount-0"]')
      .click({force: true});
    await page.locator('input[name="items.0.unitAmount.netAmount"]').clear();
    await page
      .locator('input[name="items.0.unitAmount.netAmount"]')
      .fill('100');

    // Set VAT (required for Save button to be enabled)
    await page.locator('td[data-testid="vat-dropdown-table-cell-0"]').click();
    await page
      .locator('ul[role="listbox"] li[role="option"]:has-text("%")')
      .first()
      .click();

    // Save invoice
    await expect(page.locator('button:has-text("Save")')).toBeEnabled();
    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Invoice created successfully'),
    ).toBeVisible();

    // Go back to invoices listing
    await page.goBack();
    await page.waitForTimeout(2000); // Wait for page to reload

    // Send invoice - click action menu button
    await page
      .locator('button[data-testid="invoice-action-menu-button"]')
      .first()
      .click();
    await page.locator('svg[data-testid="SendIcon"]').first().click();

    // Verify all form inputs are required
    await expect(page.getByRole('combobox', {name: 'Send to'})).toHaveAttribute(
      'required',
    );
    await expect(page.locator('input[name="subject"]')).toHaveAttribute(
      'required',
    );
    await expect(page.locator('label:has-text("Text *")')).toBeVisible();

    // Fill out the form
    await page.getByRole('combobox', {name: 'Send to'}).click();
    await page.keyboard.press('Backspace');
    const uniqueEmail = `noman+test${Date.now()}@mainteny.com`;
    await page.keyboard.type(uniqueEmail);
    await page.keyboard.press('Enter');

    await page.locator('div[contenteditable="true"]').fill('I am Text!');

    // Set up API interceptor for send invoice
    const sendInvoiceAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/invoices/') &&
        resp.url().includes('/send') &&
        resp.request().method() === 'POST',
    );

    // Send email
    await page.locator('button:has-text("Send email")').click();

    await sendInvoiceAPIPromise;

    await expect(page.locator('text=Invoice sent successfully')).toBeVisible();
  });
});
