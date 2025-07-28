import {test, expect} from '../fixtures';
import {asyncLoop} from '../utils';

test.describe('Invoice listing page', () => {
  test.beforeEach(async ({page, login, navigatePW}) => {
    await login();

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies') &&
        resp.url().includes('/invoices'),
    );
    await navigatePW('finance', 'invoices');
    await responsePromise;
  });

  test('should show no entries message when filter returns nothing', async ({
    page,
  }) => {
    const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';
    const responsePromise = page.waitForResponse(
      `**/api/serviceCompanies/*/invoices?**query=${searchText}**`,
    );
    await page.fill('input[placeholder="Search"]', searchText);
    await page.waitForURL(new RegExp(`.*searchInvoices.*${searchText}.*`));
    expect(page.url()).toContain(searchText);
    const response = await responsePromise;
    const body = await response.json();
    expect(body.data).toHaveLength(0);

    await expect(page.locator('text=No matching search results')).toBeVisible();
  });

  test('should route to new invoice page on clicking new invoice button', async ({
    page,
  }) => {
    await page.click('text=New Invoice');
    await expect(page).toHaveURL(/\/invoices\/new/);
  });

  test('should filter data by status', async ({page}) => {
    const statuses = [
      {
        view: 'Paid',
        server: 'PAID',
        exclude: [
          'Draft',
          'Sent',
          'Partially Paid',
          'Overdue',
          'Cancelled',
          'Credited',
        ],
      },
      {
        view: 'Sent',
        server: 'NOT_PAID',
        exclude: [
          'Paid',
          'Draft',
          'Partially Paid',
          'Overdue',
          'Cancelled',
          'Credited',
        ],
      },
      {
        view: 'Draft',
        server: 'DRAFT',
        exclude: [
          'Paid',
          'Sent',
          'Partially Paid',
          'Overdue',
          'Cancelled',
          'Credited',
        ],
      },
      {
        view: 'Cancelled',
        server: 'CANCELLED',
        exclude: [
          'Paid',
          'Sent',
          'Draft',
          'Partially Paid',
          'Overdue',
          'Credited',
        ],
      },
      {
        view: 'Overdue',
        server: 'EXPIRED',
        exclude: [
          'Paid',
          'Sent',
          'Draft',
          'Partially Paid',
          'Cancelled',
          'Credited',
        ],
      },
      {
        view: 'Partially Paid',
        server: 'PARTIALLY_PAID',
        exclude: ['Paid', 'Sent', 'Draft', 'Overdue', 'Cancelled', 'Credited'],
      },
      {
        view: 'Credited',
        server: 'CREDITED',
        exclude: [
          'Paid',
          'Sent',
          'Draft',
          'Overdue',
          'Partially Paid',
          'Cancelled',
        ],
      },
    ];

    await asyncLoop(statuses.length, async (index) => {
      const {view, server} = statuses[index];
      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/invoices?') &&
          resp.url().includes(`status=${server}`),
      );
      await page.getByRole('button', {name: view, exact: true}).click();
      await responsePromise;

      // Wait for the table to update with filtered results
      await page.waitForFunction(async (expectedStatus) => {
        const statusCells = document.querySelectorAll(
          'td[data-field="STATUS"]',
        );

        const statusCellsText = Array.from(statusCells).map((cell) =>
          cell.textContent?.trim(),
        );

        if (!statusCellsText) {
          return false;
        }
        return statusCellsText.every((cell) => cell === expectedStatus);
      }, view);

      await page.getByRole('button', {name: 'All', exact: true}).click();
    });
  });

  test('should filter with search text and verify API call', async ({page}) => {
    const searchText = 'es';
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') &&
        resp.url().includes(`query=${searchText}`),
    );
    await page.fill('input[placeholder="Search"]', searchText);
    await page.waitForURL(new RegExp(`.*searchInvoices.*${searchText}.*`));
    const response = await responsePromise;
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
    await page.click('button[data-testid="search-input-clear"]');
    await expect(page.locator('input[placeholder="Search"]')).toHaveValue('');
  });

  test('should filter with price', async ({page}) => {
    await page.click('h6:has-text("Filters")');
    await page.fill('input[placeholder="Min"]', '100');
    await page.fill('input[placeholder="Max"]', '50000');
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') &&
        resp.url().includes('totalGrossAmountFrom=100') &&
        resp.url().includes('totalGrossAmountTo=50000'),
    );
    await page.click('p:has-text("Show Results")');
    await responsePromise;
    await expect(page).toHaveURL(/grossAmountMin=100/);
    await expect(page).toHaveURL(/grossAmountMax=50000/);
  });

  test('should route to the invoice details page', async ({page}) => {
    await page.locator('tr[role="row"][data-rowindex="0"]').click();
    await expect(page.locator('text=Invoice Details')).toBeVisible();
  });

  test('should create credit note invoice', async ({
    page,
    getRichTextField,
  }) => {
    const statusRequest = page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') &&
        resp.url().includes('status=NOT_PAID'),
    );
    await page.click('button:has-text("Sent")');
    const statusResponse = await statusRequest;
    await page.waitForTimeout(1000);

    const json = await statusResponse.json();
    const invoice = json.data.find((i) => i.type === 'FULL');
    if (!invoice) {
      console.warn('No FULL invoice found');
      return;
    }
    const invoiceNumber = invoice.externalId;

    const row = page.locator('tr[role="row"]', {
      has: page.locator(`td[data-field="NUMBER"]`, {hasText: invoiceNumber}),
    });
    await row
      .locator('button[data-testid="invoice-action-menu-button"]')
      .click();
    await page.click('li:has-text("Create Credit note")');
    const firstAmountAPI = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/invoices/amount') &&
        resp.request().method() === 'POST',
    );
    const secondAmountAPI = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/invoices/amount') &&
        resp.request().method() === 'POST',
    );
    await page.click('button:has-text("Yes")');
    await firstAmountAPI;
    const amountResponse = await secondAmountAPI;
    const amountJson = await amountResponse.json();

    const subjectField = await getRichTextField('Subject');
    await expect(subjectField).toContainText(
      `Credit note for ${invoiceNumber}`,
    );

    const formatCurrency = (amount: number, options: {currency: string}) =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: options.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount / 100);
    const {currency} = amountJson.amountAfterGlobalDiscount;

    const expectedNegativeAmount = formatCurrency(
      amountJson.items[0].amountBeforeItemDiscount.netAmount,
      {currency},
    );
    await expect(
      page.locator(`text=${expectedNegativeAmount}`).first(),
    ).toBeVisible();

    const expectedFormattedAmount = formatCurrency(
      -amountJson.amountAfterGlobalDiscount.grossAmount,
      {currency},
    );

    await expect(
      page.locator(`text=${expectedFormattedAmount}`).first(),
    ).toBeVisible();

    await page.click('button:has-text("Save")');

    await expect(
      page.locator(`text=${expectedFormattedAmount}`).first(),
    ).toBeVisible();
  });
});
