import {Locator, Page} from '@playwright/test';
import {addDays} from 'date-fns';
import {test, expect} from '../fixtures';

async function fillInvoiceForm({
  page,
  hasDueDate,
  clearRichTextField,
  getRichTextField,
  fillRichTextField,
}: {
  page: Page;
  hasDueDate: boolean;
  clearRichTextField: (field: string) => Promise<void>;
  getRichTextField: (field: string) => Promise<Locator>;
  fillRichTextField: (field: string, value: string) => Promise<void>;
}) {
  await page
    .locator('input[role="combobox"][name="propertyOwnerId"]')
    .locator('..')
    .click();
  await page.locator(`li[role="option"][id="combo-box-demo-option-0"]`).click();

  await page.locator('td[data-testid="article-name-0"]').click();

  await page
    .locator('#article-combo-box-listbox')
    .locator('li')
    .nth(2)
    .click({force: true});
  await page.locator('#article-combo-box').click();
  await page.locator('#article-combo-box').clear();
  await page.locator('#article-combo-box').fill('Test Article');
  await page.keyboard.press('Escape');

  await page
    .locator(`td[data-testid="position-quantity-0"]`)
    .click({force: true});
  await page.locator('input[name="items.0.quantity"]').clear();
  await page.locator('input[name="items.0.quantity"]').fill('1');
  await page
    .locator(`td[data-testid="position-unitAmount-0"]`)
    .click({force: true});
  await page.locator('input[name="items.0.unitAmount.netAmount"]').clear();
  await page.locator('input[name="items.0.unitAmount.netAmount"]').fill('100');

  if (hasDueDate) {
    const paymentTerms = await getRichTextField('Payment terms');
    const paymentTermsText = await paymentTerms.textContent();

    const dateInput = page.locator('[data-testid="payment-due-date"]');
    if (await dateInput.isDisabled()) {
      await clearRichTextField('Payment terms');

      const valueStr = await dateInput.inputValue();
      const [day, month, year] = valueStr.split('.');
      const dateObj = new Date(+year, +month - 1, +day);

      if (dateObj < new Date()) {
        await dateInput.click({force: true});

        await page.locator('button:has-text("Clear")').click();

        await page.waitForTimeout(500);
        await dateInput.click({force: true});

        await expect(
          page.locator('[data-testid="payment-due-date-popup"]'),
        ).toBeVisible();

        const currentDate = await page
          .locator('button[aria-current="date"]')
          .getAttribute('data-timestamp');
        const previousDate = addDays(new Date(currentDate || ''), -3);
        const previousDayTimestamp = previousDate.getTime();
        await page
          .locator(`button[data-timestamp="${previousDayTimestamp}"]`)
          .click();

        await page.locator('button:has-text("Confirm")').click();
        await fillRichTextField('Payment terms', paymentTermsText || '');
      }
    }
  } else {
    await page
      .locator('div[data-testid="payment-terms-rich-text-field"]')
      .locator('svg[data-testid="TextSnippetIcon"]')
      .click();

    await page.locator('button:has-text("Clear")').click();

    await clearRichTextField('Payment terms');

    await page.locator('[data-testid="payment-due-date"]').click({force: true});

    await page
      .locator('[data-testid="payment-due-date-popup"]')
      .locator('button:has-text("Clear")')
      .click();
  }
}

test.describe('Invoice Printing Flow', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    await navigatePW('finance', 'invoices');
    await waitForSpinnerToDisappear();
  });

  async function createInvoice({
    page,
    hasDueDate,
    waitForSpinnerToDisappear,
    clearRichTextField,
    getRichTextField,
    fillRichTextField,
  }: {
    page: Page;
    hasDueDate: boolean;
    waitForSpinnerToDisappear: () => Promise<void>;
    clearRichTextField: (field: string) => Promise<void>;
    getRichTextField: (field: string) => Promise<Locator>;
    fillRichTextField: (field: string, value: string) => Promise<void>;
  }) {
    await page.locator('text=New Invoice').click();
    await waitForSpinnerToDisappear();
    await fillInvoiceForm({
      page,
      hasDueDate,
      clearRichTextField,
      getRichTextField,
      fillRichTextField,
    });
    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Invoice created successfully'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/invoices\/details\//);
  }

  async function printInvoices({page}: {page: Page}) {
    await page
      .locator('[data-testid="bottom-drawer"]')
      .locator('button svg[data-testid="MoreVertIcon"]')
      .click();

    await page.locator('li:has-text("Print")').click();
    await expect(page.locator('text=Print invoice')).toBeVisible();
    await page.locator('button:has-text("Print")').click();
  }

  test('should not print if there is no due date', async ({
    page,
    waitForSpinnerToDisappear,
    clearRichTextField,
    getRichTextField,
    fillRichTextField,
  }) => {
    const hasDueDate = false;
    await createInvoice({
      page,
      hasDueDate,
      waitForSpinnerToDisappear,
      clearRichTextField,
      getRichTextField,
      fillRichTextField,
    });
    await printInvoices({page});
    await expect(
      page.locator(
        'text=Error: A payment due date is required to send the invoice. Please add this information to proceed',
      ),
    ).toBeVisible();
  });

  test('should print invoice if there is a valid due date', async ({
    page,
    waitForSpinnerToDisappear,
    clearRichTextField,
    getRichTextField,
    fillRichTextField,
  }) => {
    await createInvoice({
      page,
      hasDueDate: true,
      waitForSpinnerToDisappear,
      clearRichTextField,
      getRichTextField,
      fillRichTextField,
    });
    await printInvoices({page});
    await expect(
      page.locator('text=Invoice updated successfully'),
    ).toBeVisible();
  });
});
