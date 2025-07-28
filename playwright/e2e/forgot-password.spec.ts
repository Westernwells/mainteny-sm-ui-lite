import {test, expect} from '../fixtures';

test.describe('Forgot Password Page', () => {
  test('complete forgot password flow - validation, errors, success, and reset page functionality', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    await page.goto('/reset-password', {
      waitUntil: 'domcontentloaded',
    });
    await waitForSpinnerToDisappear();

    // Test initial state - button should be disabled when email is empty
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Fill email - button should now be enabled
    await page.locator('#email').fill('e2etest@mainteny.com');
    await expect(page.locator('button[type="submit"]')).not.toBeDisabled();

    // Test error case with incorrect email
    await page.locator('#email').clear();
    await page.locator('#email').fill('test123.h@test478.com');
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator("text=Sorry, user account wasn't found"),
    ).toBeVisible();

    // Test successful flow with valid email
    await page.locator('#email').clear();
    await page.locator('#email').fill('e2etest@mainteny.com');
    await page.locator('button[type="submit"]').click();

    // Should show success message
    await expect(
      page.locator('text=Code sent successfully to your email').first(),
    ).toBeVisible();

    // Should redirect to reset password page with type=reset
    await expect(page).toHaveURL(/reset-password\?type=reset/);

    // Test token validation - insufficient length
    await page.locator('#token').fill('fake');
    await expect(
      page.locator('text=Reset code must be at least 6 characters'),
    ).toBeVisible();

    // Test resend code functionality
    await page.locator('[data-testid="resend"]').click();
    await expect(
      page.locator('text=Code sent successfully to your email').first(),
    ).toBeVisible();

    // Test back navigation
    await page.locator('[data-testid="back"]').click();
    await expect(page).toHaveURL(/reset-password$/);
  });
});
