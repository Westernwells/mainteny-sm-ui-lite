import {test, expect} from '../fixtures';

test.describe('Login Page', () => {
  test.beforeEach(async ({page, waitForSpinnerToDisappear}) => {
    await page.goto('/login', {waitUntil: 'domcontentloaded'});
    await waitForSpinnerToDisappear();
  });

  test('login functionality - validation, error handling, and successful login', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    // Test 1: Button should be disabled when fields are empty
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Fill email only
    await page.locator('#email').fill('e2etest@mainteny.com');

    // Button should still be disabled as password field is empty
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Test 2: Show incorrect email/password error
    await page.locator('#password').fill('12345678');

    // Now button should be enabled as both fields have values
    await expect(page.locator('button[type="submit"]')).not.toBeDisabled();

    await page.locator('button[type="submit"]').click();

    await expect(
      page.locator('text=Email or password entered is incorrect'),
    ).toBeVisible();

    // Test 3: Successful login and navigation to dashboard
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/sessions/login') &&
        response.request().method() === 'POST',
    );

    // Clear the wrong password and enter correct credentials
    await page.locator('#password').clear();
    await page.locator('#password').fill('!!abc123');
    await page.locator('button[type="submit"]').click();

    await loginResponsePromise;

    await waitForSpinnerToDisappear();

    await expect(page.getByTestId('dashboard-nav-item')).toBeVisible();
  });
});
