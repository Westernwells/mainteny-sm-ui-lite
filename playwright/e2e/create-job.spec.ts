import {test, expect} from '../fixtures';
import {ServiceOrderTypeKeys} from '../../src/models/service-order';
import {randomEnumKey} from '../utils';

test.describe('Create Job', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();

    navigatePW('jobs', 'list');

    await waitForSpinnerToDisappear();
  });

  test('should create a job', async ({page, waitForSpinnerToDisappear}) => {
    await expect(page.locator('button:has-text("New Job")')).not.toBeDisabled();
    await page.locator('button:has-text("New Job")').click();

    const unitsAPIPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceCompanies/') &&
        response.url().includes('/elevators') &&
        response.request().method() === 'GET',
    );

    const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
    await page.locator(`li:has-text("${randomJobType}")`).click();

    await waitForSpinnerToDisappear();

    await unitsAPIPromise;

    // Select first unit from table
    await page.locator('.MuiDataGrid-row').first().click();

    // Go to next step
    await page.locator('button:has-text("Next")').click();

    // Select a due date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await page.locator('button[aria-label^="Choose date"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();
    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();

    await page.locator('svg[data-testid="CalendarTodayIcon"]').click();
    await page.locator('button[aria-current="date"]').click();
    await page.locator('button:has-text("Confirm")').click();

    await page.locator('tbody tr td label').first().click();

    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();

    await page.locator('button:has-text("Next")').click();

    await expect(page.locator('button:has-text("Submit")')).not.toBeDisabled();
    await page.locator('button:has-text("Submit")').click();

    await expect(
      page.locator('text=Order scheduled successfully'),
    ).toBeVisible();
  });
});
