import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';

test.describe('Edit Customer Address', () => {
  test.beforeEach(
    async ({page, login, navigatePW, waitForSpinnerToDisappear}) => {
      await login();

      // Set up API intercept for property owners
      const propertyOwnersPromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/propertyOwners') &&
          resp.request().method() === 'GET',
      );

      // Navigate to customers page
      navigatePW('customer-center', 'customers');
      await waitForSpinnerToDisappear();

      await propertyOwnersPromise;
    },
  );

  const editAddress = async (
    page: Page,
    type: 'billingAddress' | 'otherAddress' | 'beneficiaryAddress',
    address: Record<string, string>,
  ) => {
    // Click edit button (second EditOutlinedIcon)
    await page.locator('[data-testid="EditOutlinedIcon"]').nth(1).click();

    if (type === 'otherAddress') {
      await page.locator('button:has-text("Send invoice via")').click();
    } else if (type === 'beneficiaryAddress') {
      await page.locator('button:has-text("Beneficiary address")').click();
    }

    // Edit address fields
    await page.locator(`input[name="${type}.component.name"]`).clear();
    await page
      .locator(`input[name="${type}.component.name"]`)
      .fill(address.name);

    await page.locator(`input[name="${type}.component.street"]`).clear();
    await page
      .locator(`input[name="${type}.component.street"]`)
      .fill(address.street);

    await page.locator(`input[name="${type}.component.street2"]`).clear();
    await page
      .locator(`input[name="${type}.component.street2"]`)
      .fill(address.street2);

    await page.locator(`input[name="${type}.component.postalCode"]`).clear();
    await page
      .locator(`input[name="${type}.component.postalCode"]`)
      .fill(address.postalCode);

    await page.locator(`input[name="${type}.component.city"]`).clear();
    await page
      .locator(`input[name="${type}.component.city"]`)
      .fill(address.city);

    // Select country
    await page.locator(`div[id$="${type}.component.country"]`).click();
    await page
      .locator(`li[role="option"]:has-text("${address.country}")`)
      .click();

    // Select state
    await page
      .locator(`div[id$="${type}.component.state"]`)
      .locator('..')
      .click({position: {x: 23, y: 32}});
    await page
      .locator(`li[role="option"]:has-text("${address.state}")`)
      .click({force: true});

    // Wait for update API response and save
    const updateCustomerPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners/') &&
        resp.request().method() === 'PUT',
    );
    await page.locator('button:has-text("Save")').click();

    await updateCustomerPromise;

    // Verify success message
    await expect(
      page.locator('text=Customer updated successfully').first(),
    ).toBeVisible();

    // wait for model to close
    await page.locator('div[role="dialog"]').waitFor({state: 'hidden'});

    // Verify address fields are displayed
    await expect(page.locator(`text=${address.name}`)).toBeVisible();
    await expect(page.locator(`text=${address.street}`)).toBeVisible();
    await expect(page.locator(`text=${address.city}`)).toBeVisible();
  };

  test('should edit all customer address types', async ({page}) => {
    // Click on the first customer row (index 2 for aria-rowindex)
    await page.locator('div[role="row"][aria-rowindex="2"]').first().click();

    // Verify we're on the customer details page
    await expect(
      page.locator('[data-testid="EditOutlinedIcon"]').nth(1),
    ).toBeVisible();

    // Edit billing address
    await editAddress(page, 'billingAddress', {
      name: 'Updated Billing Name',
      street: '456 Billing Street, Munich',
      street2: 'Suite 101',
      postalCode: '80331',
      city: 'Munich',
      country: 'Germany',
      state: 'Bavaria',
    });

    // Edit other address (Send invoice via)
    await editAddress(page, 'otherAddress', {
      name: 'Updated Send Invoice via Name',
      street: '123 New Street, Berlin',
      street2: 'Floor 2',
      postalCode: '10115',
      city: 'Berlin',
      country: 'Germany',
      state: 'Berlin',
    });

    // Edit beneficiary address
    await editAddress(page, 'beneficiaryAddress', {
      name: 'Updated Beneficiary Name',
      street: '789 Beneficiary Street, Hamburg',
      street2: 'PO Box 123',
      postalCode: '20095',
      city: 'Hamburg',
      country: 'Germany',
      state: 'Hamburg',
    });
  });
});
