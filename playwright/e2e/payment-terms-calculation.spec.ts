import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';
import {ServiceOrderTypeKeys} from '../../src/models/service-order';
import {randomEnumKey} from '../utils';

test.describe('Payment Terms Calculation', () => {
  test.beforeEach(async ({login}) => {
    await login();
  });

  const createJobAndOpenInvoice = async (
    page: Page,
    navigatePW: (primaryId: string, secondaryId: string) => void,
    waitForSpinnerToDisappear: () => Promise<void>,
    invoiceType: 'Partial Invoice' | 'Upfront Invoice' | 'Final Invoice',
  ) => {
    // Navigate to orders page
    navigatePW('jobs', 'list');
    await waitForSpinnerToDisappear();

    // Create new job
    await page.locator('button:has-text("New Job")').click();

    const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
    await page.locator(`li:has-text("${randomJobType}")`).click();

    await waitForSpinnerToDisappear();

    // Select first unit
    await page.locator('[role="cell"]').first().click();
    await page.locator('button:has-text("Next")').click();

    // Select due date
    await page.locator('button[aria-label^="Choose date"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();

    // Select date time and technician
    await page.locator('svg[data-testid="CalendarTodayIcon"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();
    await page.locator('tbody tr td label').first().click();

    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Submit")').click();

    await expect(
      page.locator('text=Order scheduled successfully'),
    ).toBeVisible();

    // Wait for articles to load
    await page.waitForTimeout(10000);

    // Create invoice
    await page.locator('[data-testid="add-invoice"]').click();
    await page.locator(`label:has-text("${invoiceType}")`).click();
    await page.locator('button:has-text("Create")').click();
  };

  const addArticleAndSetAmount = async (
    page: Page,
    {
      index = 0,
      amount,
      quantity,
      vat,
      addNew = false,
    }: {
      index: number;
      amount: number;
      quantity: number;
      vat: number;
      addNew?: boolean;
    },
  ) => {
    if (addNew) {
      await page.locator('button:has-text("Add Position")').click();
    }

    const mainRow = page.locator(`tr[data-testid="main-row-${index}"]`);

    // Set article name
    await mainRow.locator(`td[data-testid="article-name-${index}"]`).click();
    await page.locator('#article-combo-box').click();
    await page.keyboard.type('Test Article');
    await page.keyboard.press('Escape');

    // Set quantity
    await mainRow
      .locator(`td[data-testid="position-quantity-${index}"]`)
      .click({force: true});
    await page.locator(`input[name="items.${index}.quantity"]`).clear();
    await page
      .locator(`input[name="items.${index}.quantity"]`)
      .fill(`${quantity}`);

    // Set unit amount
    await mainRow
      .locator(`td[data-testid="position-unitAmount-${index}"]`)
      .click({force: true});
    await page
      .locator(`input[name="items.${index}.unitAmount.netAmount"]`)
      .clear();
    await page
      .locator(`input[name="items.${index}.unitAmount.netAmount"]`)
      .fill(`${amount}`);

    // Set VAT
    await mainRow
      .locator(`td[data-testid="vat-dropdown-table-cell-${index}"]`)
      .click({force: true});
    await page
      .locator(
        `ul[aria-labelledby="select-tax-label-${index}"] li[role="option"]:has-text("${vat}%")`,
      )
      .click({force: true});
  };

  const deleteAllFoundArticles = async (page: Page, rowCount: number) => {
    if (rowCount < 1) return;

    await page
      .locator(
        'table[data-testid="table-container"] [data-testid="MoreVertOutlinedIcon"]',
      )
      .first()
      .click();

    await expect(
      page.locator('[data-testid="DeleteOutlineOutlinedIcon"]').first(),
    ).toBeVisible();
    await page
      .locator('[data-testid="DeleteOutlineOutlinedIcon"]')
      .first()
      .click({force: true});

    await expect(page.locator('button:has-text("Yes")')).toBeVisible();
    await page.locator('button:has-text("Yes")').click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    await deleteAllFoundArticles(page, rowCount - 1);
  };

  test('should calculate correct payment terms for Partial Invoice', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    await createJobAndOpenInvoice(
      page,
      navigatePW,
      waitForSpinnerToDisappear,
      'Partial Invoice',
    );

    // Delete pre-existing articles if any
    const tbody = page
      .locator('table[data-testid="table-container"] tbody')
      .first();
    await tbody.waitFor({state: 'visible'});

    // Wait a bit for table to stabilize
    await page.waitForTimeout(1000);

    // Look for article rows with MoreVertIcon (these are the actual article rows)
    const articleRows = page.locator(
      'table[data-testid="table-container"] tbody tr:has([data-testid="MoreVertOutlinedIcon"])',
    );
    const articleCount = await articleRows.count();

    if (articleCount > 0) {
      // Try to delete existing articles but don't fail if some remain
      await deleteAllFoundArticles(page, articleCount);

      // Wait for deletions to complete
      await page.waitForTimeout(2000);
    }

    // Add article with specific amounts
    await addArticleAndSetAmount(page, {
      index: 0,
      amount: 1000,
      quantity: 1,
      vat: 19,
    });

    // Set partial amount and wait until invoice recalculation finishes
    const partialAmountInput = page.locator('input[id="partial-amount"]');

    // Wait for the input to be visible and enabled
    await partialAmountInput.waitFor({state: 'visible'});
    await expect(partialAmountInput).toBeEnabled();

    // Helper function to set the value
    const setPartialAmount = async () => {
      await partialAmountInput.click();
      await partialAmountInput.clear();
      await page.waitForTimeout(500); // Small wait after clear
      await partialAmountInput.fill('500');
    };

    // Set the value initially
    await setPartialAmount();

    // Retry if the value didn't stick
    if ((await partialAmountInput.inputValue()) !== '500') {
      await setPartialAmount();
    }

    // Final retry if still not set
    if ((await partialAmountInput.inputValue()) !== '500') {
      await setPartialAmount();
    }

    // Verify the value was set
    await expect(partialAmountInput).toHaveValue('500');

    // Wait for the recalculation triggered by the amount change to finish
    // There might be multiple API calls, so let's wait for all of them
    const amountResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/invoices\/amount$/.test(response.url()) &&
        response.request().method() === 'POST',
    );

    // Also wait for any GET request that might fetch invoice details
    const detailsResponsePromise = page
      .waitForResponse(
        (response) =>
          /\/api\/invoices\/[0-9a-f-]+$/.test(response.url()) &&
          response.request().method() === 'GET',
        {timeout: 5000},
      )
      .catch(() => null); // Don't fail if this doesn't happen

    await amountResponsePromise;
    await detailsResponsePromise;

    // Add additional wait for UI to update after API response
    await page.waitForTimeout(1000);

    // Open payment terms dialog
    const paymentTermsField = page.locator(
      'div[data-testid="payment-terms-rich-text-field"]',
    );
    await paymentTermsField
      .locator('svg[data-testid="TextSnippetIcon"]')
      .click();

    // Wait for dialog to be visible and look for specific payment term
    await page.waitForSelector('div[role="presentation"]', {state: 'visible'});

    // Try to find a payment term with 10% and 20% discounts
    const termWith10And20Percent = page
      .locator('div[role="presentation"] label')
      .filter({hasText: '10%'})
      .filter({hasText: '20%'})
      .first();

    if ((await termWith10And20Percent.count()) > 0) {
      await termWith10And20Percent.click();
    } else {
      // If no matching payment term found, try to select one with multiple discount options
      const paymentTermWithDiscounts = page
        .locator('div[role="presentation"] label:has(p:nth-of-type(3))')
        .first();

      if ((await paymentTermWithDiscounts.count()) > 0) {
        await paymentTermWithDiscounts.click();
      } else {
        // If still no payment term with discounts, select the first available term
        await page.locator('div[role="presentation"] label').first().click();
      }
    }

    await page.locator('button:has-text("Confirm")').click();

    // Verify payment terms field contains some text
    await expect(paymentTermsField).not.toBeEmpty();

    // Save invoice
    const getInvoicePromise = page.waitForResponse(
      (response) =>
        /\/api\/invoices\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          response.url(),
        ) && response.request().method() === 'GET',
    );

    await page.locator('button:has-text("Save")').click();
    await getInvoicePromise;

    // Wait for PDF to load and render completely
    await page.waitForSelector('div[class^="react-pdf__Page__textContent"]', {
      state: 'visible',
    });

    // Add additional wait for PDF content to fully render
    await page.waitForTimeout(2000);

    // Verify PDF content
    const textContentArray = await page
      .locator('div[class^="react-pdf__Page__textContent"]')
      .allTextContents();

    const textContent = textContentArray.join('');

    expect(textContent).toContain('€595.00');
    expect(textContent).toContain('10% discount (€59.50)');
    expect(textContent).toContain('€535.50');
    expect(textContent).toContain('20% discount (€119.00)');
    expect(textContent).toContain('€476.00');
  });
});
