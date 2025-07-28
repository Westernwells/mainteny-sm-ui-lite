import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';
import {ServiceOrderTypeKeys} from '../../src/models/service-order';
import {DiscountType} from '../../src/models/invoice';
import {asyncLoop, randomEnumKey} from '../utils';

const normalizeTextContent = (text: string): string =>
  text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/€\s/g, '€')
    .trim();

const getRandomIntInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const addMockArticle = async (page: Page, article: any, index: number) => {
  await page.locator('button:has-text("Add Position")').click();

  // Select article
  await page.locator(`td[data-testid="article-name-${index}"]`).click();
  await page.locator('ul[role="listbox"]').waitFor();
  await page.locator('ul[role="listbox"] li').nth(2).click({force: true});

  // Set article name
  await page.locator(`td[data-testid="article-name-${index}"]`).click();
  await page.locator('#article-combo-box').focus();
  await page.keyboard.press('Meta+A');
  await page.keyboard.press('Delete');
  await page.locator('#article-combo-box').fill(article.name);

  // Set quantity
  await page.locator(`td[data-testid="position-quantity-${index}"]`).click();
  await page
    .locator(`input[name="items.${index}.quantity"]`)
    .fill(article.quantity.toString());

  // Set unit amount
  await page.locator(`td[data-testid="position-unitAmount-${index}"]`).click();
  await page
    .locator(`input[name="items.${index}.unitAmount.netAmount"]`)
    .fill((article.unitAmount.netAmount / 100).toString());

  // Set VAT
  await page
    .locator(`td[data-testid="vat-dropdown-table-cell-${index}"]`)
    .click();
  await page
    .locator(
      `ul[aria-labelledby="select-tax-label-${index}"] li[role="option"]:has-text("${article.unitAmount.percentageVat}%")`,
    )
    .click({force: true});

  // Set discount
  await page.locator(`td[data-testid="discount-${index}"]`).click();
  if (
    article.discount.type === DiscountType.AMOUNT &&
    article.discount.amount
  ) {
    await page
      .locator(`input[name="items.${index}.discount"]`)
      .locator('..')
      .locator('button')
      .click();
    await page.locator(`td[data-testid="discount-${index}"]`).click();
    await page
      .locator(`input[name="items.${index}.discount"]`)
      .fill(article.discount.amount.value.toString());
  } else if (
    article.discount.type === DiscountType.PERCENTAGE &&
    article.discount.percentage !== undefined
  ) {
    await page
      .locator(`input[name="items.${index}.discount"]`)
      .fill(article.discount.percentage.toString());
  }
};

const deleteArticle = async (page: Page) => {
  await page
    .locator(
      'table[data-testid="table-container"] [data-testid="MoreVertOutlinedIcon"]',
    )
    .first()
    .click();
  await page.waitForTimeout(300);
  await expect(
    page.locator('[data-testid="DeleteOutlineOutlinedIcon"]').first(),
  ).toBeVisible();
  await page
    .locator('[data-testid="DeleteOutlineOutlinedIcon"]')
    .first()
    .click({force: true});
  await page.waitForTimeout(300);
  await expect(page.locator('button:has-text("Yes")')).toBeVisible();
  await page.locator('button:has-text("Yes")').click();
};

test.describe('Invoice Flow', () => {
  test('should test full invoice type flow', async ({
    login,
    page,
    navigatePW,
    waitForSpinnerToDisappear,
    getRichTextField,
    copyPdfToPublic,
  }) => {
    // increase timeout for this test
    test.setTimeout(240000);

    const serviceCompanyResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.request().method() === 'GET',
    );
    await login();
    await waitForSpinnerToDisappear();

    // Navigate to jobs page
    await navigatePW('jobs', 'list');

    // Create job
    await expect(page.locator('button:has-text("New Job")')).not.toBeDisabled();
    await page.locator('button:has-text("New Job")').click();

    const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
    await page.locator(`li:has-text("${randomJobType}")`).click();
    await waitForSpinnerToDisappear();

    // Select first unit from table
    await page.locator('.MuiDataGrid-row').first().click();
    await page.locator('button:has-text("Next")').click();

    // Select a due date
    await page.locator('button[aria-label^="Choose date"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();

    // Select date and technician
    await page.locator('svg[data-testid="CalendarTodayIcon"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();
    await page.locator('tbody tr td label').first().click();

    await page.locator('button:has-text("Next")').click();

    const jobResponse = page.waitForResponse(
      (resp) =>
        /\/api\/serviceOrders\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          resp.url(),
        ) && resp.request().method() === 'GET',
    );

    await page.locator('button:has-text("Submit")').click();

    await expect(
      page.locator('text=Order scheduled successfully'),
    ).toBeVisible();

    // Wait for articles to load
    await page.waitForTimeout(10000);

    // Set up API interceptors
    const customerResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners/') &&
        resp.request().method() === 'GET',
    );

    // Create invoice
    await page.locator('[data-testid="add-invoice"]').click();
    await page.locator('label:has-text("Full Invoice")').click();

    await page.locator('button:has-text("Create")').click();

    // Wait for responses
    const serviceCompanyData = await serviceCompanyResponse;
    const customerData = await customerResponse;

    // Assert Header section
    const subjectField = await getRichTextField('Subject');
    await expect(subjectField).toContainText('Full Invoice');

    // Assert company information
    const serviceCompany = await serviceCompanyData.json();
    await expect(page.locator(`text=${serviceCompany.name}`)).toBeVisible();

    // Assert Footer section
    await expect(
      page.locator('text=Labor costs without VAT: {LABOR_COST}'),
    ).toBeVisible();
    await expect(
      page.locator('text=Material costs without VAT: {MATERIAL_COST}'),
    ).toBeVisible();

    // Test payment terms
    const paymentTermsField = page.locator(
      'div[data-testid="payment-terms-rich-text-field"]',
    );
    await paymentTermsField
      .locator('svg[data-testid="TextSnippetIcon"]')
      .click();
    await page
      .locator('div[role="presentation"] label:has(p:only-child)')
      .first()
      .click();
    await page.locator('button:has-text("Confirm")').click();

    // Test payment terms with discount
    await paymentTermsField
      .locator('svg[data-testid="TextSnippetIcon"]')
      .click();
    await page
      .locator('div[role="presentation"] label:has(p:nth-of-type(3))')
      .first()
      .click();
    await page.locator('button:has-text("Confirm")').click();

    // Assert customer information
    const customer = await customerData.json();
    await expect(page.locator('input[name="propertyOwnerId"]')).toHaveValue(
      customer.name,
    );

    // Handle job articles
    const jobData = await jobResponse;
    const job = await jobData.json();
    await expect(page.locator(`text=${job.externalId}`)).toBeVisible();

    // Handle articles section
    // Always start with a clean slate: remove any pre-existing positions to avoid validation issues
    const existingArticles = page.locator(
      'table[data-testid="table-container"] [data-testid="MoreVertOutlinedIcon"]',
    );
    const existingArticlesCount = await existingArticles.count();

    await asyncLoop(existingArticlesCount, async () => {
      await page.waitForTimeout(500);
      await deleteArticle(page);
    });

    // Add a new valid position
    await page.locator('td[data-testid="article-name-0"]').click();
    await page.locator('#article-combo-box-listbox li').nth(2).click();

    await page.locator('#article-combo-box').click();
    await page.locator('#article-combo-box').fill('Test Article');
    await page.keyboard.press('Escape');

    const quantity = getRandomIntInRange(1, 5);
    const unitAmount = getRandomIntInRange(10, 100);

    await page.locator('td[data-testid="position-quantity-0"]').click();
    await page
      .locator('input[name="items.0.quantity"]')
      .fill(quantity.toString());

    await page.locator('td[data-testid="position-unitAmount-0"]').click();
    await page
      .locator('input[name="items.0.unitAmount.netAmount"]')
      .fill(unitAmount.toString());

    // Save invoice
    const invoiceResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/invoices/') &&
        resp.request().method() === 'GET',
    );

    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Invoice created successfully'),
    ).toBeVisible();

    // Wait for invoice data
    const invoiceData = await invoiceResponse;
    const invoice = await invoiceData.json();

    // Wait for PDF to load
    await page.locator('div[class^="react-pdf__Document"]').first().waitFor();
    await page
      .locator('div[class^="react-pdf__Page__textContent"]')
      .first()
      .waitFor();

    // Assert invoice details page
    await expect(
      page.locator('text=Automatically assigned').first(),
    ).toBeVisible();
    await expect(page.locator('text=Full invoice').first()).toBeVisible();

    // Assert PDF content
    const pdfDocument = page
      .locator('div[class^="react-pdf__Document"]')
      .first();

    // Verify company name in PDF
    await expect(
      pdfDocument.locator(`text=${serviceCompany.name}`).first(),
    ).toBeVisible();

    // Verify invoice details in PDF
    await expect(
      pdfDocument.locator('text=Automatically assigned'),
    ).toBeVisible();

    if (invoice.serviceOrder?.externalId) {
      await expect(
        pdfDocument.locator(`text=${invoice.serviceOrder.externalId}`),
      ).toBeVisible();
    }

    // Test discount functionality
    await page
      .locator('[data-testid="bottom-drawer"] svg[data-testid="MoreVertIcon"]')
      .click();
    await page.locator('li:has-text("Edit")').click();

    await waitForSpinnerToDisappear();

    // Remove existing articles
    const deleteButtons = page.locator(
      'table[data-testid="table-container"] [data-testid="MoreVertOutlinedIcon"]',
    );
    const deleteCount = await deleteButtons.count();

    await asyncLoop(deleteCount, async () => {
      await page.waitForTimeout(500);
      await deleteArticle(page);
    });

    // Add mock articles with discounts
    const mockArticles = [
      {
        name: 'Article 1',
        unitAmount: {netAmount: 100000, percentageVat: 7},
        quantity: 1,
        discount: {type: DiscountType.PERCENTAGE, percentage: 10},
      },
      {
        name: 'Article 2',
        unitAmount: {netAmount: 200000, percentageVat: 7},
        quantity: 2,
        discount: {type: DiscountType.AMOUNT, amount: {value: 500}},
      },
      {
        name: 'Article 3',
        unitAmount: {netAmount: 200000, percentageVat: 19},
        quantity: 2,
        discount: {type: DiscountType.PERCENTAGE, percentage: 15},
      },
    ];

    await asyncLoop(mockArticles.length, async (index) => {
      const article = mockArticles[index];
      await addMockArticle(page, article, index);
    });

    // Add global discount
    await page.locator('button:has-text("Add Discount")').click();
    await page.locator('input[name="globalDiscount"]').fill('500');

    // Verify calculations
    const expectedValues = [
      '7,800.00',
      '7,300.00',
      'VAT 7%',
      '288.25',
      'VAT 19%',
      '604.59',
      '8,192.84',
    ];
    await Promise.all(
      expectedValues.map(async (value) =>
        expect(page.locator(`text=${value}`).first()).toBeVisible(),
      ),
    );

    const updatedInvoiceResponse = page.waitForResponse(
      (resp) =>
        /\/api\/invoices\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          resp.url(),
        ) && resp.request().method() === 'GET',
    );

    await page.locator('button:has-text("Save")').click();

    await expect(
      page.locator('text=Invoice updated successfully'),
    ).toBeVisible();

    await updatedInvoiceResponse;

    // Verify PDF content with discounts
    await page
      .locator('div[class^="react-pdf__Page__textContent"]')
      .first()
      .waitFor();
    const pdfTextContent = await page
      .locator('div[class^="react-pdf__Document"]')
      .allTextContents();
    const cleanPdfText = normalizeTextContent(pdfTextContent.join(''));

    const expectedPdfValues = [
      '7,300.00',
      'VAT 7%',
      '288.25',
      'VAT 19%',
      '604.59',
      '8,192.84',
    ];
    expectedPdfValues.forEach((value) => {
      expect(cleanPdfText).toContain(value);
    });

    // Test PDF download
    await page.goBack();
    await page
      .locator('div[role="row"]')
      .filter({has: page.locator('text=€8,192.84')})
      .locator('svg[data-testid="MoreVertIcon"]')
      .click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('li:has-text("Download")').click({force: true});
    const download = await downloadPromise;

    // Verify download occurred
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    const filename = await copyPdfToPublic(download);

    const baseUrl = 'http://localhost:5173';
    const pdfViewerUrl = `${baseUrl}/pdf-viewer?filename=`;
    await page.goto(`${pdfViewerUrl}${filename}`);

    await waitForSpinnerToDisappear();

    await page.locator('div[class="react-pdf__Document"]').first().waitFor();

    await page
      .locator('div[class*="react-pdf__Page__textContent"]')
      .first()
      .waitFor();

    await expect(page.locator('text=8,192.84').first()).toBeVisible();
  });
});
