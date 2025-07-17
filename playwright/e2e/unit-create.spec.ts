import {test, expect} from '../fixtures';
import {getUniqueId} from '../../src/utils/utils';

test.describe('Create Unit', () => {
  test.beforeEach(async ({login, navigatePW}) => {
    await login();
    await navigatePW('customer-center', 'units');
  });

  test('submit unit', async ({page, waitForSpinnerToDisappear}) => {
    // Navigate to create unit page
    await page.locator('button:has-text("New Unit")').click();
    await waitForSpinnerToDisappear();

    // Test validation - customer field required
    await page.locator('input[name="propertyOwnerId"]').click();
    await page.locator('input[name="propertyOwnerId"]').blur();
    await expect(
      page.locator('text=Please select an existing customer'),
    ).toBeVisible();

    // Select customer
    await page.locator('input[name="propertyOwnerId"]').click();
    await page.locator('li[role="option"]').nth(1).click();
    await page.locator('button:has-text("Next")').click();

    // Fill address
    await page.waitForTimeout(5000); // small delay for google autocomplete to load
    await page.locator('input[name="address.fullName"]').fill('Italy, texas');
    await expect(
      page.locator('text=Address not found. Please check and try again'),
    ).not.toBeVisible();
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Next")').click();

    // Select category
    await page.locator('input[name="category"]').fill('Elev');
    await page.waitForTimeout(150);
    await page.locator('li[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();

    // Fill dates
    await page.locator('input[name="lastVisitDate"]').click();
    await page.locator('[role="gridcell"]').first().click();
    await page.locator('input[name="lastInspectionDate"]').click();
    await page.locator('[role="gridcell"]').nth(1).click();

    // Click Service Information header before filling fields
    await page.locator('h6:has-text("Service Information")').click();
    // Use .pressSequentially to trigger events
    await page
      .locator('input[name="serviceTime"]')
      .pressSequentially('4', {delay: 150});
    await page
      .locator('input[name="technicianNumber"]')
      .pressSequentially('4', {delay: 150});
    await page.locator('input[name="technicianNumber"]').press('Enter');
    await page.locator('h6:has-text("Service Information")').click();
    // Wait for UI to process
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
    await page.locator('button:has-text("Next")').click();

    // Submit the unit
    await expect(page.locator('button:has-text("Submit")')).toBeEnabled();
    await page.locator('button:has-text("Submit")').click();
    await expect(page.locator('text=Unit created successfully')).toBeVisible();
  });

  test('searching customer should use fuzzy name', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    const customerSearchValue = 'E2E test';
    const expectedSearchTerm = `[name:*E2E*][name:*test*]`;

    // Navigate to create unit page
    await page.locator('button:has-text("New Unit")').click();
    await waitForSpinnerToDisappear();

    // Collect all matching API calls
    const apiCalls: any[] = [];
    page.on('request', (request) => {
      if (
        request.method() === 'GET' &&
        request.url().includes('/api/propertyOwners')
      ) {
        apiCalls.push(request);
      }
    });

    // Type customer search value character by character
    const customerInput = page.locator('input[placeholder="Select Customer"]');
    await customerSearchValue
      .split('')
      .reduce(
        (prev, char) => prev.then(() => customerInput.pressSequentially(char)),
        Promise.resolve(),
      );
    // Wait for debounce/network
    await page.waitForTimeout(1000);

    // Check the last API call for the expected query
    const lastCall = apiCalls[apiCalls.length - 1];
    const url = new URL(lastCall.url());
    const query = url.searchParams.get('query');
    expect(query).toContain(expectedSearchTerm);
  });

  test('newly created unit should be shown correctly when creating quotation', async ({
    page,
    waitForSpinnerToDisappear,
    navigatePW,
  }) => {
    // Create a unique unit name for this test
    const uniqueUnitId = getUniqueId();

    // Create a new unit
    await page.locator('button:has-text("New Unit")').click();
    await waitForSpinnerToDisappear();

    // Select customer (first one in the list)
    await page.locator('input[name="propertyOwnerId"]').click();
    await page.locator('li[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();

    // Enter address
    await page.waitForTimeout(5000); // small delay for google autocomplete to load
    await page.locator('input[name="address.fullName"]').fill('Italy, texas');
    await expect(
      page.locator('text=Address not found. Please check and try again'),
    ).not.toBeVisible();
    await page.locator('li[role="option"]').first().click();
    await page.locator('button:has-text("Next")').click();

    // Select category
    await page.locator('input[name="category"]').fill('Elev');
    await page.waitForTimeout(150);
    await page.locator('li[role="option"]').first().click();

    // Add unique identifier to the unit
    await page.locator('input[name="externalId"]').clear();
    await page
      .locator('input[name="externalId"]')
      .pressSequentially(uniqueUnitId);
    await page.locator('button:has-text("Next")').click();

    // Fill in required fields
    await page.locator('input[name="lastVisitDate"]').click();
    await page.locator('[role="gridcell"]').first().click();
    await page.locator('input[name="lastInspectionDate"]').click();
    await page.locator('[role="gridcell"]').nth(1).click();
    // Click Service Information header before filling fields
    await page.locator('h6:has-text("Service Information")').click();
    await page
      .locator('input[name="serviceTime"]')
      .pressSequentially('4', {delay: 150});
    await page
      .locator('input[name="technicianNumber"]')
      .pressSequentially('4', {delay: 150});
    await page.locator('input[name="technicianNumber"]').press('Enter');
    await page.locator('h6:has-text("Service Information")').click();
    // Wait for UI to process
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('button:has-text("Submit")')).toBeEnabled();
    await page.locator('button:has-text("Submit")').click();
    await expect(page.locator('text=Unit created successfully')).toBeVisible();

    // Now navigate to create quotation page
    navigatePW('finance', 'quotations');
    await waitForSpinnerToDisappear();

    // Create new quotation
    await page.locator('button:has-text("New Quotation")').click();
    await waitForSpinnerToDisappear();

    // Select the same customer we used for the unit
    await page
      .locator('input[role="combobox"][name="propertyOwnerId"]')
      .locator('..')
      .click();
    await page
      .locator('li[role="option"][id="combo-box-demo-option-0"]')
      .click();

    // Click on Select Unit button
    await page.locator('button:has-text("Select Unit")').click();

    // Search for our unique unit
    const getUnitsApiPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners/') &&
        resp.url().includes('/elevators') &&
        resp.request().method() === 'GET',
    );

    await page.locator('input[id="Search"]').clear();
    await page.locator('input[id="Search"]').fill(uniqueUnitId);
    await getUnitsApiPromise;

    // Verify our unit is in the list
    await expect(page.locator(`text=${uniqueUnitId}`)).toBeVisible();

    // Select the unit
    await page.locator('div[data-rowindex="0"]').click();

    // Verify the unit is selected in the quotation form
    await expect(
      page.locator('button:has-text("Select Unit")'),
    ).not.toBeVisible();
  });
});
