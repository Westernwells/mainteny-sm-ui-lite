import {test, expect} from '../fixtures';
import {getUniqueId} from '../../src/utils/utils';
import { selectLanguage } from '../utils/language';

test.describe('Customer Contact Person Step (Full Flow)', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear, page}) => {
    await login();
    navigatePW('customer-center', 'customers');
    await waitForSpinnerToDisappear();
    await selectLanguage(page, 'English');
    await expect(page.locator('button:has-text("New Customer")')).toBeVisible();
  });

  test('should validate phone, add multiple contacts, and submit', async ({ page }) => {
    const uniqueId = getUniqueId();
    const customerName = `customer-${uniqueId}`;
    const email = `test-${uniqueId}@test.com`;
    const billingEmail = `test-billing-${uniqueId}@test.com`;
    const phone = '345656565';

    await page.locator('button:has-text("New Customer")').click();
    await expect(page).toHaveURL(/\/customers\/new/);

    // Fill first step - Basic Information
    await page.locator('input[name="name"]').fill(customerName);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="billingEmail"]').fill(billingEmail);
    await page.locator('input[name="phone"]').fill(phone);
    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();
    await page.locator('button:has-text("Next")').click();

    // Second step - Address Information
    await page.locator('button:has-text("Next")').click();

    // Fill third step - Contact Persons
    await page.locator('[data-testid="AddIcon"]').click();
    await expect(page.locator('h2:has-text("Add Contact Person")')).toBeVisible();

    // Fill with invalid phone, blur, assert error/save disabled
    await page.locator('input[name="userAccount.firstName"]').fill('John');
    await page.locator('input[name="userAccount.lastName"]').fill('Smith');
    const phoneInput = page.locator('input[name="userAccount.contact.phone"]');
    await phoneInput.fill('not-a-phone');
    await phoneInput.blur();
    await expect(page.locator('text=Phone number is not valid')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();

    // Correct the phone, blur, assert error gone/save enabled
    await phoneInput.fill('+4915164103011');
    await phoneInput.blur();
    await expect(page.locator('text=Phone number is not valid')).toHaveCount(0);
    await expect(page.locator('button:has-text("Save")')).not.toBeDisabled();
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=John Smith')).toBeVisible();

    // Add a second valid contact
    await page.locator('[data-testid="AddIcon"]').click();
    await page.locator('input[name="userAccount.firstName"]').fill('Jane');
    await page.locator('input[name="userAccount.lastName"]').fill('Doe');
    await page.locator('input[name="userAccount.contact.phone"]').fill('4915164103012');
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=Jane Doe')).toBeVisible();

    const createCustomerPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners') &&
        resp.request().method() === 'POST',
    );
    await page.locator('button:has-text("Submit")').click();
    await createCustomerPromise;
    await expect(page.locator('text=Customer created successfully')).toBeVisible();
  });
});
