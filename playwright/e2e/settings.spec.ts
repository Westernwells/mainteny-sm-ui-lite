import {test, expect} from '../fixtures';

test.describe('Settings Page', () => {
  test.beforeEach(async ({login, navigateSingleDrawer}) => {
    await login();
    await navigateSingleDrawer('settings');
  });

  test('navigate to checklist and render new checklist page', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    // Click on Checklists menu item
    await page
      .locator('li div[role="button"]')
      .filter({hasText: 'Checklists'})
      .click();

    await waitForSpinnerToDisappear();

    // Click on New Checklist button
    await page
      .locator('button')
      .filter({hasText: 'New Checklist'})
      .first()
      .click();

    // Verify the page shows the expected content
    await expect(page.locator('text=Start adding components')).toBeVisible();
  });

  test('test edit basic info modal', async ({page}) => {
    // Click on the second edit icon
    await page.locator('svg[data-testid="EditOutlinedIcon"]').nth(1).click();

    // Test email validation
    const emailInput = page.locator('input[name="email"]');
    const nameInput = page.locator('input[name="name"]');
    const submitButton = page.locator('button[type="submit"]');

    // Get original email value
    const originalEmail = await emailInput.inputValue();

    // Clear email and check that submit button is disabled
    await emailInput.clear();
    await expect(submitButton).toBeDisabled();

    // Enter invalid email
    await emailInput.fill('invalid');
    await expect(submitButton).toBeDisabled();

    // Click on name field to trigger validation
    await nameInput.click();

    // Check for validation error message
    await expect(page.locator('text=Enter a valid email')).toBeVisible();

    // Clear and enter valid email
    await emailInput.clear();
    await emailInput.fill(originalEmail);

    // Verify validation error is gone
    await expect(page.locator('text=Enter a valid email')).not.toBeVisible();
    await expect(submitButton).not.toBeDisabled();

    // Test name validation
    const originalName = await nameInput.inputValue();

    // Clear name and check that submit button is disabled
    await nameInput.clear();
    await expect(submitButton).toBeDisabled();

    // Enter original name back
    await nameInput.fill(originalName);
    await expect(submitButton).not.toBeDisabled();

    // Submit the form
    await submitButton.click();

    // Verify success message
    await expect(
      page.locator('text=Company updated successfully'),
    ).toBeVisible();
  });
});
