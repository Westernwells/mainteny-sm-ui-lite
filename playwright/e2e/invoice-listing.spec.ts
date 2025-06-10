/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-plusplus, no-restricted-syntax */
import {test, expect} from '../fixtures';

test.describe('Invoice listing page', () => {
  test.beforeEach(async ({page, login, navigatePW}) => {
    await login();

    navigatePW('finance', 'invoices');
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies') &&
        resp.url().includes('/invoices'),
    );
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

    for (const {view, server, exclude} of statuses) {
      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/invoices?') &&
          resp.url().includes(`status=${server}`),
      );
      await page.getByRole('button', {name: view, exact: true}).click();
      await responsePromise;

      // Wait for the table to update with filtered results
      await page.waitForFunction((expectedStatus) => {
        const statusCells = document.querySelectorAll(
          'td[data-field="STATUS"]',
        );

        for (const cell of statusCells) {
          if (cell.textContent?.trim() !== expectedStatus) {
            return false;
          }
        }
        return true;
      }, view);

      const rows = page.locator(`td[data-field="STATUS"]`);
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).innerText();
        expect(text).toBe(view);
        for (const ex of exclude) {
          expect(text).not.toBe(ex);
        }
      }

      await page.getByRole('button', {name: 'All', exact: true}).click();
    }
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
    const response = await page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') && resp.request().method() === 'GET',
    );
    const data = await response.json();
    const invoiceId = data?.data?.[0]?.id;

    await page
      .locator('td[role="cell"][data-field="SENT_DATE"]')
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`.*${invoiceId}.*`));
  });

  test('should create credit note invoice', async ({
    page,
    getRichTextField,
  }) => {
    const serviceCompanyPromise = await page.waitForResponse(
      '**/api/serviceCompanies/*',
    );

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
    const originalInvoiceItems = invoice.items;

    const row = page.locator('tr[role="row"]', {
      has: page.locator(`td[data-field="NUMBER"]`, {hasText: invoiceNumber}),
    });
    await row
      .locator('button[data-testid="invoice-action-menu-button"]')
      .click();
    await page.click('li:has-text("Create Credit note")');
    await page.click('button:has-text("Yes")');

    const subjectField = await getRichTextField('Subject');
    await expect(subjectField).toContainText(
      `Credit note for ${invoiceNumber}`,
    );

    await page.locator('td[data-testid="article-name-0"]').click();
    const articleComboValue = await page
      .locator('#article-combo-box')
      .inputValue();

    const removeControlCharsAndSpaces = (str: string) =>
      str.replace(/\p{C}/gu, '').replaceAll(' ', '').replaceAll('\n', '');

    const cleanComboValue = removeControlCharsAndSpaces(articleComboValue);
    const cleanOriginalName = removeControlCharsAndSpaces(
      await page.evaluate((html) => {
        if (!html.startsWith('<')) return html;
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent?.trim() ?? '';
      }, originalInvoiceItems[0].name),
    );
    expect(cleanComboValue).toContain(cleanOriginalName);

    await page.locator('td[data-testid="position-unitAmount-0"]').click();
    const unitAmountInput = page.locator(
      'input[name="items.0.unitAmount.netAmount"]',
    );
    const unitAmountValue = await unitAmountInput.getAttribute('value');

    const expectedNegativeAmount = (
      -originalInvoiceItems[0].unitAmount.netAmount / 100
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(unitAmountValue).toBe(expectedNegativeAmount);

    const serviceCompany = await serviceCompanyPromise.json();

    const currency = serviceCompany.settings.currencies[0].code;

    const originalTotal = invoice.totalAmount.grossAmount || 0;
    const expectedNegativeTotal = -originalTotal;

    const formatCurrency = (amount: number, options: {currency: string}) =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: options.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount / 100);
    const expectedFormattedAmount = formatCurrency(expectedNegativeTotal, {
      currency,
    });
    await expect(page.locator(`text=${expectedFormattedAmount}`)).toBeVisible();

    await page.click('button:has-text("Save")');

    await expect(page.locator(`text=${expectedFormattedAmount}`)).toBeVisible();
  });
});
