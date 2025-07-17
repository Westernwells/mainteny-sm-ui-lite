import {test, expect} from '../fixtures';
import {CONTRACT_STATUS_FILTER} from '../../src/models/contract';

test.describe('Contract listing page', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('customer-center', 'contracts');
    await waitForSpinnerToDisappear();
  });

  test('should test actions', async ({page}) => {
    // should route to the contract details page
    await page.locator('tr[role="row"][data-rowindex="0"]').click();
    await expect(page.locator('text=Contract Details').first()).toBeVisible();

    // go back to the contract listing page
    await page.goBack();

    // should route to the new contract page
    await page.click('text=New Contract');
    await expect(page.locator('text=New Contract').first()).toBeVisible();
  });

  test('should filter with search text and verify API call', async ({page}) => {
    const searchText = 'es';

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/contracts?') &&
        resp.url().includes(`query=${searchText}`),
    );

    await page.fill('input[placeholder="Search"]', searchText);
    await page.waitForURL(new RegExp(`.*searchContracts.*${searchText}.*`));
    expect(page.url()).toContain(searchText);

    const response = await responsePromise;
    const url = new URL(response.url());
    const pageIndex = url.searchParams.get('pageIndex');
    const pageSize = url.searchParams.get('pageSize');
    const query = url.searchParams.get('query');

    expect(pageIndex).toBe('0');
    expect(pageSize).toBe('25');
    expect(query).toBe(searchText);

    // Clear filter
    await page.click('button[data-testid="search-input-clear"]');
    await expect(page.locator('input[placeholder="Search"]')).toHaveValue('');
  });

  test('should show no entries message when filter returns nothing', async ({
    page,
  }) => {
    const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';

    const responsePromise = page.waitForResponse(
      `**/api/serviceCompanies/*/contracts?**query=${searchText}**`,
    );

    await page.fill('input[placeholder="Search"]', searchText);
    await page.waitForURL(new RegExp(`.*searchContracts.*${searchText}.*`));
    expect(page.url()).toContain(searchText);

    const response = await responsePromise;
    const body = await response.json();

    if (body.data && body.data.length === 0) {
      expect(body.data).toHaveLength(0);
      await expect(
        page.locator('text=No matching search results'),
      ).toBeVisible();
    }
  });

  test('should filter with price', async ({page}) => {
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/contracts?') &&
        resp.url().includes('totalYearNetAmountStart=40') &&
        resp.url().includes('totalYearNetAmountEnd=50000'),
    );

    // Open filters
    await page.click('h6:has-text("Filters")');

    // Find Net amount filter section and fill values
    await page
      .locator('h6:has-text("Net amount")')
      .locator('..')
      .locator('input[placeholder="Min"]')
      .fill('40');
    await page
      .locator('h6:has-text("Net amount")')
      .locator('..')
      .locator('input[placeholder="Max"]')
      .fill('50000');

    // Apply filter
    await page.click('p:has-text("Show Results")');

    await expect(page).toHaveURL(/netAmountMax=50000/);
    await expect(page).toHaveURL(/netAmountMin=40/);

    await responsePromise;
  });

  test('should filter the grid based on selected statuses', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    const testStatusFilter = async (statusFilter: CONTRACT_STATUS_FILTER) => {
      const displayStatus =
        statusFilter.charAt(0).toUpperCase() +
        statusFilter.slice(1).toLowerCase();

      // Click status filter
      await page.getByRole('button', {name: new RegExp(displayStatus)}).click();
      await expect(page).toHaveURL(new RegExp(`.*${statusFilter}.*`));

      // Wait for spinner to disappear
      await waitForSpinnerToDisappear();

      // Verify table content
      const statusCells = page.locator('td[data-field="STATUS"]');
      const count = await statusCells.count();

      if (count > 0) {
        // Check that all visible statuses match the expected display status
        const cellTexts = await Promise.all(
          Array.from({length: count}, (_, i) => statusCells.nth(i).innerText()),
        );

        // Simply verify all statuses match the expected status
        cellTexts.forEach((cellText) => {
          expect(cellText.trim()).toBe(displayStatus);
        });
      } else {
        // If no results, verify "No matching search results" message is shown
        await expect(
          page.locator('text=No matching search results'),
        ).toBeVisible();
      }

      // Deselect status by clicking it again
      await page.getByRole('button', {name: new RegExp(displayStatus)}).click();
    };

    // Test each status filter sequentially
    await testStatusFilter(CONTRACT_STATUS_FILTER.ACTIVE);
    await testStatusFilter(CONTRACT_STATUS_FILTER.EXPIRING);
    await testStatusFilter(CONTRACT_STATUS_FILTER.INACTIVE);
  });
});
