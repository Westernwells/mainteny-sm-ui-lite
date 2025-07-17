import {test, expect} from '../fixtures';
import {asyncLoop} from '../utils';

test.describe('Orders page - list page', () => {
  test.beforeEach(async ({login}) => {
    await login();
  });

  test('filter orders by status', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    const status = 'Overdue';

    navigatePW('jobs', 'list');
    await waitForSpinnerToDisappear();

    const serviceOrderAPIPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders') &&
        response.url().includes(`status=${status.toUpperCase()}`) &&
        response.request().method() === 'GET',
    );
    await page.locator('button', {hasText: status}).click({force: true});

    // Wait for API call
    await serviceOrderAPIPromise;

    // small delay for DOM to get updated
    await page.waitForTimeout(1000);

    // Verify status filter is applied
    await expect(
      page.locator(`[data-testid="status-chip"]:has-text("${status}")`).first(),
    ).toBeVisible();

    // Verify all rows show the correct status
    const rows = page.locator('tbody tr[role="row"]');
    const rowCount = await rows.count();

    await asyncLoop(rowCount, async (idx) => {
      const row = rows.nth(idx);
      const statusCell = row.locator(
        'td[data-field="JOB_STATUS"][role="cell"]',
      );

      if (await statusCell.isVisible()) {
        const statusText = await statusCell.textContent();
        if (statusText && statusText.trim()) {
          expect(statusText.trim()).toContain(status);
        }
      }
    });
  });

  test('filter jobs by type', async ({
    page,
    navigatePW,
    waitForSpinnerToDisappear,
  }) => {
    const ELEVATOR_OPERATION = 'Elevator Operation';

    // Setup API interception
    const serviceOrderAPIPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders') &&
        response.request().method() === 'GET',
    );

    navigatePW('jobs', 'list');
    await waitForSpinnerToDisappear();

    // Open filters
    await page.locator('[data-testid="FilterListIcon"]').locator('..').click();

    // Change type filter
    await page
      .locator('span.MuiChip-label', {hasText: ELEVATOR_OPERATION})
      .click();
    await page.locator('button', {hasText: 'Show Results'}).click();

    // Wait for API call
    await serviceOrderAPIPromise;

    // Verify all rows show the correct type
    const typeCells = page.locator('td[data-field="JOB_TYPE"][role="cell"]');
    const cellCount = await typeCells.count();

    await asyncLoop(cellCount, async (idx) => {
      const cell = typeCells.nth(idx);
      await expect(cell).toContainText(ELEVATOR_OPERATION);
    });
  });
});
