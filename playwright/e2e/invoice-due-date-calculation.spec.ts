import {Page} from '@playwright/test';
import {addDays, format} from 'date-fns';
import {test, expect} from '../fixtures';
import {ServiceOrderTypeKeys} from '../../src/models/service-order';
import {randomEnumKey} from '../utils';

const paymentTerms = {
  '30 days': "(DON'T DELETE) e2e test 30 days",
  '15 days': "(DON'T DELETE) e2e test 15 days",
};

test.describe('Invoice Due Date Calculation', () => {
  test.beforeEach(async ({login}) => {
    await login();
  });

  const createJobAndNavigateToInvoice = async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }: {
    page: Page;
    navigatePW: (primaryId: string, secondaryId: string) => Promise<void>;
    waitForSpinnerToDisappear: () => Promise<void>;
  }) => {
    await navigatePW('jobs', 'list');
    await waitForSpinnerToDisappear();

    await page.locator('button:has-text("New Job")').click();

    const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
    await page.locator(`li:has-text("${randomJobType}")`).click();

    await waitForSpinnerToDisappear();

    await page.locator('[role="cell"]').first().click();
    await page.locator('button:has-text("Next")').click();

    await page.locator('button[aria-label^="Choose date"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();

    await page.locator('svg[data-testid="CalendarTodayIcon"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();
    await page.locator('tbody tr td label').first().click();

    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Submit")').click();

    await expect(
      page.locator('text=Order scheduled successfully'),
    ).toBeVisible();

    await page.locator('[data-testid="add-invoice"]').click();
    await page.locator('label:has-text("Full Invoice")').click();
    await page.locator('button:has-text("Create")').click();

    await waitForSpinnerToDisappear();
  };

  const addBasicArticle = async ({
    page,
    index = 0,
  }: {
    page: Page;
    index?: number;
  }) => {
    const mainRow = page.locator(`tr[data-testid="main-row-${index}"]`);

    await mainRow.locator(`td[data-testid="article-name-${index}"]`).click();
    await page.locator('#article-combo-box').click();
    await page.keyboard.type('Test Article');
    await page.keyboard.press('Escape');

    await mainRow
      .locator(`td[data-testid="position-quantity-${index}"]`)
      .click({force: true});
    await page.locator(`input[name="items.${index}.quantity"]`).clear();
    await page.locator(`input[name="items.${index}.quantity"]`).fill('1');

    await mainRow
      .locator(`td[data-testid="position-unitAmount-${index}"]`)
      .click({force: true});
    await page
      .locator(`input[name="items.${index}.unitAmount.netAmount"]`)
      .clear();
    await page
      .locator(`input[name="items.${index}.unitAmount.netAmount"]`)
      .fill('100');

    await mainRow
      .locator(`td[data-testid="vat-dropdown-table-cell-${index}"]`)
      .click({force: true});
    await page
      .locator(
        `ul[aria-labelledby="select-tax-label-${index}"] li[role="option"]:has-text("19%")`,
      )
      .click({force: true});
  };

  const setPaymentTerms = async ({
    page,
    dueDays,
  }: {
    page: Page;
    dueDays: number;
  }) => {
    await page
      .locator('div[data-testid="payment-terms-rich-text-field"]')
      .locator('svg[data-testid="TextSnippetIcon"]')
      .click();

    // Look for the payment terms option with the specified due days
    const paymentTermsOption = page.locator(
      `text=${paymentTerms[`${dueDays} days`]}`,
    );

    await paymentTermsOption.first().click();
    await page.locator('button:has-text("Confirm")').click();
  };

  const setInvoiceDate = async ({
    page,
    invoiceDate,
  }: {
    page: Page;
    invoiceDate: Date;
  }) => {
    await page.locator('input[name="sentDate"]').click();
    await page.locator('button:has-text("Clear")').click();
    const formattedInvoiceDate = format(invoiceDate, 'dd.MM.yyyy');
    await page.locator('input[name="sentDate"]').fill(formattedInvoiceDate);
  };

  const setDueDate = async ({page, dueDate}: {page: Page; dueDate: Date}) => {
    await page.locator('input[name="dueDate"]').click();
    await page.locator('button:has-text("Clear")').click();
    const formattedDueDate = format(dueDate, 'dd.MM.yyyy');
    await page.locator('input[name="dueDate"]').fill(formattedDueDate);
  };

  test('should calculate due date based on invoice date when payment terms are set', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    await createJobAndNavigateToInvoice({
      page,
      navigatePW,
      waitForSpinnerToDisappear,
    });

    await addBasicArticle({page});

    const invoiceDate = addDays(new Date(), -5);
    await setInvoiceDate({page, invoiceDate});

    const paymentTermDays = 30;
    await setPaymentTerms({page, dueDays: paymentTermDays});

    // The due date should be calculated as invoiceDate + paymentTermDays
    const expectedDueDate = addDays(invoiceDate, paymentTermDays);
    const formattedExpectedDueDate = format(expectedDueDate, 'dd.MM.yyyy');
    await expect(page.locator('input[name="dueDate"]')).toHaveValue(
      formattedExpectedDueDate,
    );

    await page.locator('button:has-text("Save")').click();

    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedExpectedDueDate}`),
    ).toBeVisible();
  });

  test('should calculate due date based on current date when no invoice date is set', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    await createJobAndNavigateToInvoice({
      page,
      navigatePW,
      waitForSpinnerToDisappear,
    });

    await addBasicArticle({page});

    const paymentTermDays = 15;
    await setPaymentTerms({
      page,
      dueDays: paymentTermDays,
    });

    // The due date should be calculated as current date + paymentTermDays
    const invoiceDate = new Date();
    const formattedInvoiceDate = format(invoiceDate, 'dd.MM.yyyy');

    const expectedDueDate = addDays(invoiceDate, paymentTermDays);
    const formattedExpectedDueDate = format(expectedDueDate, 'dd.MM.yyyy');
    await expect(page.locator('input[name="dueDate"]')).toHaveValue(
      formattedExpectedDueDate,
    );

    await page.locator('button:has-text("Save")').click();

    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=Invoice date`),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedInvoiceDate}`)
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedExpectedDueDate}`),
    ).toBeVisible();
  });

  test('should update due date when invoice date is changed with existing payment terms', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    await createJobAndNavigateToInvoice({
      page,
      navigatePW,
      waitForSpinnerToDisappear,
    });

    await addBasicArticle({page});

    const paymentTermDays = 15;
    await setPaymentTerms({
      page,
      dueDays: paymentTermDays,
    });

    const initialInvoiceDate = addDays(new Date(), -3);
    await setInvoiceDate({page, invoiceDate: initialInvoiceDate});

    // Verify initial due date calculation
    const initialExpectedDueDate = addDays(initialInvoiceDate, paymentTermDays);
    const formattedInitialExpectedDate = format(
      initialExpectedDueDate,
      'dd.MM.yyyy',
    );
    await expect(page.locator('input[name="dueDate"]')).toHaveValue(
      formattedInitialExpectedDate,
    );

    const newInvoiceDate = addDays(new Date(), -7);
    await setInvoiceDate({page, invoiceDate: newInvoiceDate});
    const formattedNewInvoiceDate = format(newInvoiceDate, 'dd.MM.yyyy');

    // Verify due date is updated based on new invoice date
    const newExpectedDueDate = addDays(newInvoiceDate, paymentTermDays);
    const formattedNewExpectedDate = format(newExpectedDueDate, 'dd.MM.yyyy');
    await expect(page.locator('input[name="dueDate"]')).toHaveValue(
      formattedNewExpectedDate,
    );

    await page.locator('button:has-text("Save")').click();

    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=Invoice date`),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedNewInvoiceDate}`)
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedNewExpectedDate}`),
    ).toBeVisible();
  });

  test('should maintain manual due date when no payment terms are set', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    await createJobAndNavigateToInvoice({
      page,
      navigatePW,
      waitForSpinnerToDisappear,
    });

    await addBasicArticle({page});

    // Clear payment terms if any
    await page
      .locator('div[data-testid="payment-terms-rich-text-field"]')
      .locator('svg[data-testid="TextSnippetIcon"]')
      .click();

    if (await page.locator('button:has-text("Clear")').isEnabled()) {
      await page.locator('button:has-text("Clear")').click();
    } else {
      await page.locator('button:has-text("Cancel")').click();
    }

    const manualDueDate = addDays(new Date(), 45);
    await setDueDate({page, dueDate: manualDueDate});

    const invoiceDate = addDays(new Date(), -2);
    await setInvoiceDate({page, invoiceDate});
    const formattedInvoiceDate = format(invoiceDate, 'dd.MM.yyyy');

    // Verify due date remains the manually set date (not affected by invoice date)
    const formattedManualDueDate = format(manualDueDate, 'dd.MM.yyyy');
    await expect(page.locator('input[name="dueDate"]')).toHaveValue(
      formattedManualDueDate,
    );

    await page.locator('button:has-text("Save")').click();

    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=Invoice date`),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedInvoiceDate}`),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedManualDueDate}`),
    ).toBeVisible();
  });

  test('should recalculate due date when payment terms are added after invoice date is set', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    await createJobAndNavigateToInvoice({
      page,
      navigatePW,
      waitForSpinnerToDisappear,
    });

    await addBasicArticle({page});

    const invoiceDate = addDays(new Date(), -10);
    await setInvoiceDate({page, invoiceDate});
    const formattedInvoiceDate = format(invoiceDate, 'dd.MM.yyyy');

    const initialDueDate = addDays(new Date(), 25);
    await setDueDate({page, dueDate: initialDueDate});

    const paymentTermDays = 30;
    await setPaymentTerms({
      page,
      dueDays: paymentTermDays,
    });

    // Due date should now be calculated as invoiceDate + paymentTermDays
    const expectedDueDate = addDays(invoiceDate, paymentTermDays);
    const formattedExpectedDueDate = format(expectedDueDate, 'dd.MM.yyyy');

    await expect(page.locator('input[name="dueDate"]')).toHaveValue(
      formattedExpectedDueDate,
    );

    await page.locator('button:has-text("Save")').click();

    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=Invoice date`),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedInvoiceDate}`),
    ).toBeVisible();
    await expect(
      page
        .locator('div[class^="react-pdf__Page__textContent"]')
        .first()
        .locator(`text=${formattedExpectedDueDate}`),
    ).toBeVisible();
  });
});
