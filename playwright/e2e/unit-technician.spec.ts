import {test, expect} from '../fixtures';

test.describe('Unit Technician', () => {
  test.beforeEach(async ({login, navigatePW}) => {
    await login();
    await navigatePW('customer-center', 'units');
  });

  test('should add unit technician and validate priority', async ({page}) => {
    // Navigate to a unit details based on parallel worker index to avoid collisions when tests run in parallel
    const rowIndex = 1 + ((test.info().parallelIndex ?? 0) % 5); // cycle first 5 units if more workers
    await page.locator('tr').nth(rowIndex).click({force: true});

    const addTechnician = async (optionIndex: number, priority: string) => {
      // Open the add-technician dialog
      await page
        .locator('svg[data-testid="add-technician-button-icon"]')
        .click();

      // Ensure the dialog is visible before interacting
      const dialog = page.locator('[role="dialog"]').last();
      await expect(dialog).toBeVisible();

      // Select technician
      await dialog.locator('input[name="technicianId"]').click({force: true});
      await page
        .locator(`li[data-option-index="${optionIndex}"]`)
        .click({force: true});

      // Fill priority
      await dialog.locator('input[name="priority"]').fill(priority);

      // Save and wait for dialog to close ensuring the grid is refreshed
      await dialog.locator('button:has-text("Save")').click({force: true});
      await dialog.waitFor({state: 'detached'});
    };

    // Add first engineer with priority 2
    await addTechnician(0, '2');

    // Add second engineer with priority 1
    await addTechnician(1, '1');

    // Validate sorting – the first cell should eventually show "1" and the second "2"
    const priorityCells = page.locator(
      'div[data-field="priority"][role="cell"]',
    );
    await expect(priorityCells.nth(0)).toHaveText('1');
    await expect(priorityCells.nth(1)).toHaveText('2');
  });
});
