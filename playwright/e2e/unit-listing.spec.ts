import {test, expect} from '../fixtures';

test.describe('Unit Listing', () => {
  test.beforeEach(async ({login, navigatePW}) => {
    await login();
    await navigatePW('customer-center', 'units');
  });

  test('should handle all search scenarios', async ({page}) => {
    // Set up API interception for units API
    const waitForUnitsApi = () =>
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/serviceCompanies/') &&
          response.url().includes('/elevators?') &&
          response.request().method() === 'GET',
      );

    // Test searching by address
    const addressSearchTerm = 'Italy, Texas';
    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.fill(addressSearchTerm);

    const addressResponse = await waitForUnitsApi();
    const addressUrl = new URL(addressResponse.url());
    expect(addressUrl.searchParams.get('query')).toContain(addressSearchTerm);

    // Verify results are displayed
    await expect(page.locator('tbody tr[role="row"]').first()).toBeVisible();

    // Test searching by unit ID
    const unitId = 'UNIT00000145';
    await searchInput.clear();
    await searchInput.fill(unitId);

    const unitIdResponse = await waitForUnitsApi();
    const unitIdUrl = new URL(unitIdResponse.url());
    expect(unitIdUrl.searchParams.get('query')).toContain(unitId);

    // Verify results are displayed
    await expect(page.locator('tbody tr[role="row"]').first()).toBeVisible();

    // Test searching with special characters
    const specialCharsSearch = 'Test@#$%^&*()';
    await searchInput.clear();
    await searchInput.fill(specialCharsSearch);

    const specialCharsResponse = await waitForUnitsApi();
    const specialCharsUrl = new URL(specialCharsResponse.url());
    expect(specialCharsUrl.searchParams.get('query')).toContain(
      specialCharsSearch,
    );

    // Verify results are displayed
    await expect(page.locator('tbody tr[role="row"]').first()).toBeVisible();

    // Test clearing search to show all units
    await searchInput.clear();

    const clearSearchResponse = await waitForUnitsApi();
    const clearSearchUrl = new URL(clearSearchResponse.url());
    const queryParam = clearSearchUrl.searchParams.get('query');
    expect(queryParam === null || queryParam === '').toBe(true);

    // Verify results are displayed
    await expect(page.locator('tbody tr[role="row"]').first()).toBeVisible();
  });
});
