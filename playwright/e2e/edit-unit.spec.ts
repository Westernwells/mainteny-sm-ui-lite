import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';

test.describe('Edit Unit', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('customer-center', 'units');
    await waitForSpinnerToDisappear();
  });

  const navigateToDetailsPage = async (
    page: Page,
    waitForSpinnerToDisappear: () => Promise<void>,
  ) => {
    await page.locator('td[data-field="ADDRESS"]').first().click();
    await waitForSpinnerToDisappear();
  };

  const openDialog = async (page: Page) => {
    await page.locator('[data-testid="EditOutlinedIcon"]').first().click();
    await expect(page.locator('text=Edit General')).toBeVisible();
  };

  const openAppointmentPreferenceDialog = async (page: Page) => {
    await page
      .locator('[data-test-id="approintment-preference-edit-icon"]')
      .click();
    await expect(
      page.locator('text=Edit Appointment Preferences'),
    ).toBeVisible();
  };

  test('should validate unit category field', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    await navigateToDetailsPage(page, waitForSpinnerToDisappear);
    await openDialog(page);

    const categoryInput = page.locator('input[name="category"]');
    const currentValue = await categoryInput.inputValue();

    // Test validation: button should be disabled when category field is empty
    await categoryInput.clear();
    await page.locator('#alert-dialog-title').click();
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();

    // Test valid data: button should be enabled when category field has valid data
    if (currentValue === 'Escalator') {
      await categoryInput.fill('Elevator');
    } else {
      await categoryInput.fill('Escalator');
    }

    await page.locator('#alert-dialog-title').click();
    await expect(page.locator('button:has-text("Save")')).not.toBeDisabled();
  });

  test('update spending limit', async ({page, waitForSpinnerToDisappear}) => {
    await navigateToDetailsPage(page, waitForSpinnerToDisappear);
    await openDialog(page);

    await page
      .locator('div[data-testid="unit_spending_limit_input_field"]')
      .click();
    await page
      .locator('div[data-testid="unit_spending_limit_input_field"] input')
      .clear();
    await page
      .locator('div[data-testid="unit_spending_limit_input_field"] input')
      .fill('1000');

    await page.locator('#alert-dialog-title').click();

    await page.locator('button:has-text("Save")').click();

    await expect(
      page.locator('div[data-testid="unit_spending_limit"]'),
    ).toContainText('1000');
  });

  test('should search contacts for Appointment Preference', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    await navigateToDetailsPage(page, waitForSpinnerToDisappear);
    await openAppointmentPreferenceDialog(page);

    const searchText = 'Schönhauser';

    // Set up API intercept for contact search
    const searchContactPersonApiPromise = page.waitForResponse((resp) => {
      if (
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/contactPersons') &&
        resp.request().method() === 'GET'
      ) {
        const url = new URL(resp.url());
        const query = url.searchParams.get('query');
        return query === searchText;
      }
      return false;
    });

    await page.locator('input[placeholder="Select contact"]').clear();
    await page.locator('input[placeholder="Select contact"]').fill(searchText);

    // Verify the input value
    await expect(
      page.locator('input[placeholder="Select contact"]'),
    ).toHaveValue(searchText);

    // Wait for and verify the API call
    const response = await searchContactPersonApiPromise;
    const url = new URL(response.url());
    const query = url.searchParams.get('query');
    expect(query).toBe(searchText);
    expect(response.url()).toContain(`query=${encodeURIComponent(searchText)}`);
  });
});
