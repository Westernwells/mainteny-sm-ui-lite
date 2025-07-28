import {test, expect} from '../fixtures';

const normalizeExtractedText = (text: string): string =>
  text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/€\s/g, '€') // Ensure no space after the Euro symbol
    .trim();

test.describe('Invoice Edit Flow with Payment Terms', () => {
  const INVOICE_ID = '58191ee4-5e63-4fc1-9b61-dead56321fc9';

  test.beforeEach(async ({login}) => {
    await login();
  });

  test('should validate Payment Terms text with correct placeholders replaced', async ({
    page,
  }) => {
    // Navigate to invoice details page
    const invoiceDetailsResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes(`/invoices/${INVOICE_ID}`) &&
        resp.request().method() === 'GET',
    );
    await page.goto(`/invoices/details/${INVOICE_ID}`);

    await invoiceDetailsResponse;

    // Click edit button
    await page
      .locator('[data-testid="bottom-drawer"]')
      .locator('button svg[data-testid="MoreVertIcon"]')
      .click();
    await page.locator('li:has-text("Edit")').click();

    // Verify placeholders exist before saving
    await expect(
      page.locator('text=If you pay before {DUE_DATE}'),
    ).toBeVisible();
    await expect(page.locator('text={DISCOUNT_AMOUNT}')).toBeVisible();
    await expect(page.locator('text={INVOICE_AMOUNT}')).toBeVisible();
    await expect(page.locator('text={PAYMENT_AMOUNT}')).toBeVisible();

    // Select valid VAT for all items
    const vatDropdowns = page.locator(
      '[data-testid^="vat-dropdown-table-cell"]',
    );
    const vatCount = await vatDropdowns.count();

    await Array.from({length: vatCount}).reduce(async (promise, _, i) => {
      await promise;
      await vatDropdowns.nth(i).click({force: true});
      await page.locator('ul[role="listbox"]').waitFor({state: 'visible'});
      await page.locator('ul[role="listbox"] li').first().click();
      await page.locator('ul[role="listbox"]').waitFor({state: 'detached'});
    }, Promise.resolve());

    // Save invoice
    const updateInvoiceResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes(`/invoices/${INVOICE_ID}`) &&
        resp.request().method() === 'GET',
    );
    await page.locator('button[type="submit"]').click();

    // Wait for update API call
    await updateInvoiceResponse;

    // Verify URL contains details page
    await expect(page).toHaveURL(/\/invoices\/details/);

    // Verify URL contains details page
    await expect(page).toHaveURL(/\/invoices\/details/);

    // Verify payment terms in PDF
    const pdfTextLayer = page.locator(
      'div[class^="react-pdf__Page__textContent"]',
    );
    await expect(pdfTextLayer.last()).toBeVisible();

    // Wait for PDF content to load and contain text
    await expect(pdfTextLayer.locator('span').first()).toBeVisible();
    await page.waitForFunction(
      () => {
        const textLayers = document.querySelectorAll(
          'div[class^="react-pdf__Page__textContent"]',
        );
        const allText = Array.from(textLayers)
          .map((layer) => layer.textContent)
          .join('');
        return allText.length > 100; // Wait for substantial content
      },
      {timeout: 10000},
    );

    const textContent = await pdfTextLayer.allTextContents();
    const cleanTextContent = normalizeExtractedText(textContent.join(''));

    // Verify that placeholders have been replaced with actual values
    // Check that the payment terms text contains the expected structure
    expect(cleanTextContent).toContain('If you pay before');
    expect(cleanTextContent).toContain('we grant');
    expect(cleanTextContent).toContain('discount');
    expect(cleanTextContent).toContain('Paymentamount:');

    // Verify that actual monetary values and percentages are present (not placeholders)
    expect(cleanTextContent).toMatch(/€[\d,]+\.[\d]{2}/); // Euro amounts like €1,536.09
    expect(cleanTextContent).toMatch(/\d{1,2}%/); // Percentage like 3% or 5%
    expect(cleanTextContent).toMatch(/\d{2}\.\d{2}\.\d{4}/); // Dates like 15.07.2025

    // Verify placeholders are NOT present (they should be replaced)
    expect(cleanTextContent).not.toContain('{DUE_DATE}');
    expect(cleanTextContent).not.toContain('{DISCOUNT_AMOUNT}');
    expect(cleanTextContent).not.toContain('{INVOICE_AMOUNT}');
    expect(cleanTextContent).not.toContain('{PAYMENT_AMOUNT}');
  });

  test('should keep Material & Labor Cost text field value when customer or job is changed', async ({
    page,
    waitForSpinnerToDisappear,
    navigatePW,
  }) => {
    const laborCostText = 'Labor costs without VAT: {LABOR_COST}';
    const materialCostText = 'Material costs without VAT: {MATERIAL_COST}';

    navigatePW('finance', 'invoices');

    await waitForSpinnerToDisappear();

    // Click New Invoice
    await page.locator('text=New Invoice').click();

    // Verify initial text exists
    await expect(page.locator(`text=${laborCostText}`)).toBeVisible();
    await expect(page.locator(`text=${materialCostText}`)).toBeVisible();

    // Change customer
    await page.locator('input[name="propertyOwnerId"]').click();
    await page.locator('li[role="option"]').first().click();

    // Verify text still exists after customer change
    await expect(page.locator(`text=${laborCostText}`)).toBeVisible();
    await expect(page.locator(`text=${materialCostText}`)).toBeVisible();

    // Change job
    await page.locator('button:has-text("Select Job")').click();
    await page.locator('div[role="row"]').first().click();

    // Verify text still exists after job change
    await expect(page.locator(`text=${laborCostText}`)).toBeVisible();
    await expect(page.locator(`text=${materialCostText}`)).toBeVisible();
  });
});
