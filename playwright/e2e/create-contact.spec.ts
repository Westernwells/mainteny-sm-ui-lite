import {test, expect} from '../fixtures';
import {getUniqueId} from '../../src/utils/utils';

test.describe('Create Contact', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();

    navigatePW('customer-center', 'contacts');
    await waitForSpinnerToDisappear();
  });

  test('should create contact and assign it to a unit and a customer', async ({
    page,
  }) => {
    // Create new contact
    await page.locator('button:has-text("New Contact")').click();
    const uniqueId = getUniqueId();
    const firstName = `First${uniqueId}`;
    const lastName = 'Last';
    const fullName = `${firstName} ${lastName}`;

    await page.locator('input[name="userAccount.firstName"]').fill(firstName);
    await page.locator('input[name="userAccount.lastName"]').fill(lastName);

    await page
      .locator('div[role="combobox"][aria-labelledby$="contactPerson.roles"]')
      .click();
    await page
      .locator('li[role="option"][data-value="CONTACT_PERSON"]')
      .click();

    await page
      .locator('input[name="userAccount.contact.email"]')
      .fill(`${firstName}@example.com`);

    // Wait for API response and create contact
    const contactPersonsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/contactPersons') &&
        resp.request().method() === 'GET',
    );

    await page.locator('button:has-text("Confirm")').click();

    const createResponse = await contactPersonsAPIPromise;
    expect(createResponse.status()).toBe(200);

    await expect(
      page.locator('text=Contact person created successfully'),
    ).toBeVisible();

    // Open contact person details
    const contactPersonsAssociationsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/contactPersons/') &&
        resp.url().includes('/associations') &&
        resp.request().method() === 'GET',
    );

    await page
      .locator(`td[role="cell"][data-field="NAME"]:has-text("${fullName}")`)
      .click();
    await contactPersonsAssociationsAPIPromise;

    // Assign contact to unit
    await page.locator('button:has-text("New connection")').click();
    await page
      .locator(
        'div[role="combobox"][aria-labelledby^="connection-type-select-label"]',
      )
      .click();
    await page.locator('li[role="option"][data-value="ELEVATOR"]').click();

    const unitsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/elevators') &&
        resp.request().method() === 'GET',
    );

    await page
      .locator('input[id="asynchronous-demo-refId"]')
      .locator('..')
      .click();
    await unitsAPIPromise;

    await page
      .locator('li[role="option"][id="asynchronous-demo-refId-option-0"]')
      .click();
    await page.locator('button:has-text("Confirm")').click();

    const contactPersonsAssociationsAPI2Promise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/contactPersons/') &&
        resp.url().includes('/associations') &&
        resp.request().method() === 'GET',
    );
    await contactPersonsAssociationsAPI2Promise;

    await expect(
      page.locator('text=Connection successfully added'),
    ).toBeVisible();

    // Assign contact to customer
    await page.locator('svg[data-testid="AddOutlinedIcon"]').click();
    await page
      .locator(
        'div[role="combobox"][aria-labelledby^="connection-type-select-label"]',
      )
      .click();
    await page
      .locator('li[role="option"][data-value="PROPERTY_OWNER"]')
      .click();

    const customersAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners') &&
        resp.request().method() === 'GET',
    );

    await page
      .locator('input[id="asynchronous-demo-customerId"]')
      .locator('..')
      .click();
    await customersAPIPromise;

    await page
      .locator('li[role="option"][id="asynchronous-demo-customerId-option-0"]')
      .click();
    await page.locator('button:has-text("Confirm")').click();

    const contactPersonsAssociationsAPI3Promise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/contactPersons/') &&
        resp.url().includes('/associations') &&
        resp.request().method() === 'GET',
    );
    await contactPersonsAssociationsAPI3Promise;

    await expect(
      page.locator('text=Connection successfully added').first(),
    ).toBeVisible();

    // Close contact details
    await page.locator('body').click({position: {x: 0, y: 0}});

    // Open actions menu
    await page
      .locator(`td[role="cell"][data-field="NAME"]:has-text("${fullName}")`)
      .locator('..')
      .locator('svg[data-testid="MoreVertIcon"]')
      .click();

    // Delete contact
    await page.locator('li:has-text("Delete")').click();

    const deleteContactPersonAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/contactPersons/') &&
        resp.request().method() === 'DELETE',
    );

    await page.locator('button:has-text("Yes")').click();
    await deleteContactPersonAPIPromise;

    await expect(
      page.locator('text=Contact person deleted successfully'),
    ).toBeVisible();
  });

  test('should validate form submission requirements', async ({page}) => {
    const uniqueId = getUniqueId();
    const firstName = `First${uniqueId}`;
    const lastName = 'Last';

    // Test 1: Should be able to submit with all mandatory fields filled
    await page.locator('button:has-text("New Contact")').click();

    await page.locator('input[name="userAccount.firstName"]').fill(firstName);
    await page.locator('input[name="userAccount.lastName"]').fill(lastName);
    await page
      .locator('div[role="combobox"][aria-labelledby$="contactPerson.roles"]')
      .click();
    await page
      .locator('li[role="option"][data-value="CONTACT_PERSON"]')
      .click();
    await page
      .locator('input[name="userAccount.contact.email"]')
      .fill(`${firstName}@example.com`);

    await expect(page.locator('button:has-text("Confirm")')).not.toBeDisabled();

    // Close dialog to reset for next test
    await page.locator('button:has-text("Cancel")').click();

    // Test 2: Should be able to submit without optional "First Name" field
    await page.locator('button:has-text("New Contact")').click();

    await page.locator('input[name="userAccount.lastName"]').fill(lastName);
    await page
      .locator('div[role="combobox"][aria-labelledby$="contactPerson.roles"]')
      .click();
    await page
      .locator('li[role="option"][data-value="CONTACT_PERSON"]')
      .click();
    await page.locator('input[name="userAccount.contact.email"]').click();

    await expect(page.locator('button:has-text("Confirm")')).not.toBeDisabled();

    // Close dialog to reset for next test
    await page.locator('button:has-text("Cancel")').click();

    // Test 3: Should not be able to submit without mandatory "Last Name" field
    await page.locator('button:has-text("New Contact")').click();

    await page.locator('input[name="userAccount.firstName"]').fill(firstName);
    await page
      .locator('div[role="combobox"][aria-labelledby$="contactPerson.roles"]')
      .click();
    await page
      .locator('li[role="option"][data-value="CONTACT_PERSON"]')
      .click();
    await page
      .locator('input[name="userAccount.contact.email"]')
      .fill(`${firstName}@example.com`);

    await expect(page.locator('button:has-text("Confirm")')).toBeDisabled();

    // Close dialog to reset for next test
    await page.locator('button:has-text("Cancel")').click();

    // Test 4: Should not be able to submit without mandatory "Role" field
    await page.locator('button:has-text("New Contact")').click();

    await page.locator('input[name="userAccount.lastName"]').fill(lastName);

    await expect(page.locator('button:has-text("Confirm")')).toBeDisabled();

    // Close dialog
    await page.locator('button:has-text("Cancel")').click();
  });
});
