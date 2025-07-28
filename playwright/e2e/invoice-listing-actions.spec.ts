import {test, expect} from '../fixtures';

test.describe('Invoice Listing Page Actions', () => {
  test.beforeEach(async ({page, login, navigatePW}) => {
    await login();

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies') &&
        resp.url().includes('/invoices'),
    );
    await navigatePW('finance', 'invoices');
    await responsePromise;
    await page.waitForTimeout(1000);
  });

  test('should have invoice amount details for draft invoices before sending', async ({
    page,
  }) => {
    const draftResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') &&
        resp.url().includes('status=DRAFT'),
    );
    await page.getByRole('button', {name: 'Draft'}).click();
    await draftResponsePromise;
    await page.waitForTimeout(1000);

    const draftRow = page
      .locator('tr[role="row"]', {
        has: page.locator('td[data-field="STATUS"]', {hasText: 'Draft'}),
      })
      .first();

    await expect(draftRow).toBeVisible();

    const amountDetailResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/invoices/') && resp.url().includes('/amount'),
    );

    await draftRow
      .locator('button[data-testid="invoice-action-menu-button"]')
      .click({force: true});

    await page.waitForSelector('[data-testid="invoice-action-menu"]', {
      state: 'visible',
    });

    const sendMenuElement = page.locator(
      '[data-testid="invoice-action-menu-item-Send"]',
    );

    await sendMenuElement.waitFor({state: 'visible'});
    await sendMenuElement.click({force: true});

    const amountDetailResponse = await amountDetailResponsePromise;
    const responseBody = await amountDetailResponse.json();

    expect(
      responseBody,
      'Invoice amount detail response should not be undefined',
    ).toBeDefined();
    expect(
      responseBody,
      'Invoice amount detail response should be an object',
    ).toBeInstanceOf(Object);

    expect(responseBody).toHaveProperty('payment');
    expect(responseBody).toHaveProperty('discount');
    expect(responseBody).toHaveProperty('amountBeforeGlobalDiscount');
    expect(responseBody).toHaveProperty('amountAfterGlobalDiscount');

    expect(responseBody.payment).toHaveProperty('type');
    expect(responseBody.payment).toHaveProperty('amount');
    expect(responseBody.payment.amount).toHaveProperty('netAmount');
    expect(responseBody.payment.amount).toHaveProperty('grossAmount');

    expect(responseBody.amountBeforeGlobalDiscount).toHaveProperty('netAmount');
    expect(responseBody.amountBeforeGlobalDiscount).toHaveProperty(
      'grossAmount',
    );

    expect(responseBody.amountAfterGlobalDiscount).toHaveProperty('netAmount');
    expect(responseBody.amountAfterGlobalDiscount).toHaveProperty(
      'grossAmount',
    );

    await expect(page.getByRole('button', {name: 'Send email'})).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', {name: 'Cancel'}).click({force: true});

    await expect(page.getByRole('button', {name: 'Draft'})).toBeVisible();
  });
});
