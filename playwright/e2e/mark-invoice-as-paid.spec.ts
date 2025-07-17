import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';

test.describe('Mark Invoice as Paid', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('finance', 'invoices');
    await waitForSpinnerToDisappear();
  });

  async function filterInvoicesByStatus(page: Page, statusText: string) {
    // Click the status filter button (e.g., 'Sent' or 'Not Paid')
    const response = page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') &&
        resp.url().includes('status=NOT_PAID'),
    );
    await page.getByRole('button', {name: statusText, exact: true}).click();
    await response;
  }

  test('should open modal and mark invoice as paid successfully', async ({
    page,
  }) => {
    await filterInvoicesByStatus(page, 'Sent');
    // Find the first row with status 'Sent'
    const firstRow = page.locator('tbody tr').first();
    const statusChip = firstRow.locator('[data-testid="status-chip"]');
    await expect(statusChip).toHaveText(/Sent|Not Paid/i);

    // Open payment modal (simulate clicking the action/menu button)
    await firstRow.locator('svg[data-testid="MoreVertIcon"]').click();
    await page.locator('li:has-text("Payment")').click();

    // Mark as paid
    await page.locator('input[name="markAsPaid"]').click();
    await page.locator('button:has-text("Okay")').click();
    await expect(page.locator('text=Invoice marked as paid!')).toBeVisible();
  });

  test('should show correct amount when user opens mark invoice as paid modal (even after search)', async ({
    page,
  }) => {
    await filterInvoicesByStatus(page, 'Sent');
    const secondRow = page.locator('tbody tr').nth(1);
    const statusChip = secondRow.locator('[data-testid="status-chip"]');
    await expect(statusChip).toHaveText(/Sent|Not Paid/i);

    // Open payment modal
    await secondRow.locator('svg[data-testid="MoreVertIcon"]').click();
    await page.locator('li:has-text("Payment")').click();

    // Get paid amount from modal
    const paidAmountModal = page.locator(
      '[aria-labelledby="mark-as-paid-dialog-title"]',
    );
    const paidAmountText = await paidAmountModal.textContent();
    expect(paidAmountText).toBeTruthy();

    // Close modal by clicking outside
    await page.locator('body').click({position: {x: 0, y: 0}});

    // Get invoice number from the row
    const invoiceNumber = await secondRow
      .locator('td[role="cell"][data-field="NUMBER"]')
      .textContent();
    expect(invoiceNumber).toBeTruthy();

    // Search for the invoice by number
    const response = page.waitForResponse(
      (resp) =>
        resp.url().includes('/invoices?') &&
        resp.url().includes(`query=${encodeURIComponent(invoiceNumber || '')}`),
    );
    await page
      .locator('input[placeholder^="Search"]')
      .fill(invoiceNumber || '');
    await response;

    // Open payment modal again
    const filteredRow = page.locator('tbody tr').first();
    await filteredRow.locator('svg[data-testid="MoreVertIcon"]').click();
    await page.locator('li:has-text("Payment")').click();
    const paidAmountModal2 = page.locator(
      '[aria-labelledby="mark-as-paid-dialog-title"]',
    );
    const paidAmountText2 = await paidAmountModal2.textContent();
    expect(paidAmountText2).toBe(paidAmountText);
  });
});
