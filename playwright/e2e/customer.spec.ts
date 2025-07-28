import {test, expect} from '../fixtures';
import {getUniqueId} from '../../src/utils/utils';

test.describe('Customer', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();

    // Navigate to customers page
    navigatePW('customer-center', 'customers');
    await waitForSpinnerToDisappear();
  });

  test('should create and delete customer', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    const uniqueId = getUniqueId();
    const customerName = `customer-${uniqueId}`;
    const email = `test-${uniqueId}@test.com`;
    const billingEmail = `test-billing-${uniqueId}@test.com`;
    const phone = '345656565';

    // CREATE CUSTOMER
    // Click New Customer button
    await page.locator('button:has-text("New Customer")').first().click();
    await waitForSpinnerToDisappear();

    // Fill first step - Basic Information
    // Test validation first
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="email"]').click();

    // Check validation message
    await expect(page.locator('text=Customer Name is required')).toBeVisible();
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();

    // Fill the form fields
    await page.locator('input[name="name"]').fill(customerName);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="billingEmail"]').fill(billingEmail);
    await page.locator('input[name="phone"]').fill(phone);

    // Verify Next button is enabled
    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();

    // Click Next to go to second step
    await page.locator('button:has-text("Next")').click();

    // Fill second step - Address Information
    // Select country (first combobox)
    await page.locator('div[role="combobox"]').nth(1).click();
    await page.locator('ul > li').first().click();

    // Select state/region (second combobox)
    await page.locator('div[role="combobox"]').first().click();
    await page
      .locator('li[role="option"]:has-text("Baden-Württemberg")')
      .click();

    // Click Next to go to third step
    await page.locator('button:has-text("Next")').click();

    // Fill third step - Contact Persons
    // Add contact person
    await page.locator('[data-testid="AddIcon"]').click();
    await expect(
      page.locator('h2:has-text("Add Contact Person")'),
    ).toBeVisible();

    // Fill contact person details
    await page.locator('input[name="userAccount.firstName"]').fill('John');
    await page.locator('input[name="userAccount.lastName"]').fill('Smith');

    // Save contact person
    await page.locator('button:has-text("Save")').click();

    // Wait for API response when creating customer
    const createCustomerPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners') &&
        resp.request().method() === 'POST',
    );

    // Submit the customer creation
    await page.locator('button:has-text("Submit")').click();

    await createCustomerPromise;

    // Verify success message
    await expect(
      page.locator('text=Customer created successfully'),
    ).toBeVisible();

    // Wait for navigation back to customer list
    await page.goBack();
    await waitForSpinnerToDisappear();

    // DELETE CUSTOMER
    // Find and click delete icon for the customer we just created
    // Look for the customer by name in the table
    const customerRow = page
      .locator(
        `div[role="cell"][data-field="NAME"]:has-text("${customerName}")`,
      )
      .locator('..');
    await expect(customerRow).toBeVisible();

    // Click delete icon for this specific customer
    await customerRow.locator('[data-testid="DeleteIcon"]').click();

    // Confirm deletion
    await expect(page.locator('text=Confirm')).toBeVisible();

    // Wait for delete API response
    const deleteCustomerPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners/') &&
        resp.request().method() === 'DELETE',
    );

    await page.locator('[data-test-id="remove"]').click();

    await deleteCustomerPromise;

    // Verify success message
    await expect(
      page.locator('text=Customer deleted successfully'),
    ).toBeVisible();

    // Verify the customer is no longer in the table
    await expect(
      page.locator(`td[data-field="NAME"]:has-text("${customerName}")`),
    ).not.toBeVisible();
  });
});
