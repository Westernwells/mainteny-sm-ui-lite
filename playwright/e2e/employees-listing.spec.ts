import {addDays} from 'date-fns';
import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';
import {formatDate} from '../../src/utils/datetime';

async function pickNextEnabledDay(
  page: Page,
  timestamp: number,
  attempts = 14,
): Promise<Date> {
  if (attempts <= 0) {
    throw new Error(
      'Could not find an enabled (non-weekend) day within 14 attempts.',
    );
  }

  const nextDayTimestamp = addDays(new Date(timestamp), 1).getTime();
  const dayOfWeek = new Date(nextDayTimestamp).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)

  const dayButton = page.locator(
    `button[data-timestamp="${nextDayTimestamp}"]`,
  );
  const buttonExists = (await dayButton.count()) > 0;

  if (!buttonExists || isWeekend) {
    return pickNextEnabledDay(page, nextDayTimestamp, attempts - 1);
  }

  const isDisabled = await dayButton.isDisabled();
  if (isDisabled) {
    return pickNextEnabledDay(page, nextDayTimestamp, attempts - 1);
  }

  await dayButton.click({force: true});
  return new Date(nextDayTimestamp);
}

async function addHoliday(page: Page): Promise<Date> {
  // Wait for add icon to be visible and clickable
  await page.waitForSelector('svg[data-testid="AddIcon"]', {state: 'visible'});
  await page.locator('svg[data-testid="AddIcon"]').click();

  // Wait for holiday type icon to be visible and clickable
  await page.waitForSelector('svg[data-testid="WbSunnyIcon"]', {
    state: 'visible',
  });
  await page.locator('svg[data-testid="WbSunnyIcon"]').click();

  // Wait for date field to be visible
  await page.waitForSelector('label:has-text("Date")', {state: 'visible'});
  await page.locator('label:has-text("Date")').click();

  // Wait for calendar to be visible
  await page.waitForSelector('button[aria-current="date"]', {state: 'visible'});

  // Get today's timestamp
  const todayButton = page.locator('button[aria-current="date"]');
  const todayTimestamp = await todayButton.getAttribute('data-timestamp');

  if (!todayTimestamp) {
    throw new Error("Could not get today's timestamp from calendar");
  }

  const todayNum = parseInt(todayTimestamp, 10);

  // Pick next enabled (non-weekend) day
  const pickedDate = await pickNextEnabledDay(page, todayNum);

  // Wait for confirm button and click
  await page.waitForSelector('button:has-text("Confirm")', {state: 'visible'});
  await page.locator('button:has-text("Confirm")').click();

  // Wait for technician events API and save
  const technicianEventsPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/technicians/') &&
      resp.url().includes('/events?') &&
      resp.request().method() === 'GET',
  );

  // Wait for save button and click
  await page.waitForSelector('button:has-text("Save")', {state: 'visible'});
  await page.locator('button:has-text("Save")').click();

  // Wait for success message
  await expect(
    page.locator('text=Absence created successfully!'),
  ).toBeVisible();

  await technicianEventsPromise;

  return pickedDate;
}

async function verifyHoliday(page: Page, holidayDate: Date) {
  // Wait for the absence details to be visible
  await page.waitForSelector('h6:has-text("Absence")', {state: 'visible'});

  // Use h6 selectors since they are level 6 headings
  const absenceHeading = page.locator('h6:has-text("Absence")').first();
  await expect(absenceHeading).toBeVisible();

  // Wait for holiday type to be visible
  await page.waitForSelector('h6:has-text("Holiday")', {state: 'visible'});

  // Select the first holiday heading since there might be multiple
  const holidayHeading = page.locator('h6:has-text("Holiday")').first();
  await expect(holidayHeading).toBeVisible();

  // Wait for days text to be visible
  await page.waitForSelector('text=/\\d+ days/', {state: 'visible'});

  // Select the first days text since there might be multiple
  await expect(page.locator('text=/\\d+ days/').first()).toBeVisible();

  // Format date and wait for it to be visible
  const formattedDate = formatDate(holidayDate);
  await page.waitForSelector(`text=${formattedDate}`, {state: 'visible'});

  // Select the first date text since there might be multiple
  await expect(page.locator(`text=${formattedDate}`).first()).toBeVisible();
}

async function checkEmployeeAvailabilityUpdated(page: Page, rowIndex: string) {
  const employeeRow = page.locator(`tr[data-rowindex="${rowIndex}"]`);
  await expect(employeeRow.locator('text=Available')).toBeVisible();
}

async function removeHoliday(page: Page, rowIndex: string) {
  // Wait for employee row to be visible
  await page.waitForSelector(`tr[data-rowindex="${rowIndex}"]`, {
    state: 'visible',
  });

  // Click on employee again
  const technicianEventsAPIPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/technicians/') &&
      resp.url().includes('/events?') &&
      resp.request().method() === 'GET',
  );

  const employeeRow = page.locator(`tr[data-rowindex="${rowIndex}"]`);
  await employeeRow.click();

  // Wait for technician API
  await technicianEventsAPIPromise;

  // Wait for delete icon to be visible
  await page.waitForSelector('svg[data-testid="DeleteIcon"]', {
    state: 'visible',
  });

  // Delete the holiday
  await page.locator('svg[data-testid="DeleteIcon"]').first().click();

  // Wait for confirmation dialog
  await page.waitForSelector('button:has-text("Yes")', {
    state: 'visible',
  });
  const deleteAPI = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/technicianEvents/') &&
      resp.request().method() === 'DELETE',
  );
  await page.locator('button:has-text("Yes")').click();

  // Wait for success message
  await deleteAPI;
  await expect(page.locator('text=Absence deleted successfully')).toBeVisible();
}

test.describe('Employees page - list page', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('my-company', 'employees');
    await waitForSpinnerToDisappear();
  });

  test('employee availability status is showing correctly', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    // Find available employee row index
    const availableEmployeeRow = page
      .locator('text=Available')
      .first()
      .locator('xpath=ancestor::tr');
    const rowIndex = await availableEmployeeRow.getAttribute('data-rowindex');

    if (!rowIndex) {
      throw new Error('No available employee found');
    }

    // Click on the employee
    const employeeRow = page.locator(`tr[data-rowindex="${rowIndex}"]`);
    const usersAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/users?') &&
        resp.request().method() === 'GET',
    );

    await employeeRow.click();
    await waitForSpinnerToDisappear();

    // Wait for the technician API call after clicking employee
    await usersAPIPromise;

    // Add holiday
    const holidayDate = await addHoliday(page);

    // Verify holiday was added
    await verifyHoliday(page, holidayDate);

    const technicianEventsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/technicianEvents?') &&
        resp.request().method() === 'GET',
    );
    await page.goBack();

    // Wait for APIs to reload
    await technicianEventsAPIPromise;
    await usersAPIPromise;

    // Check if employee availability is updated on employees listing page
    await checkEmployeeAvailabilityUpdated(page, rowIndex);

    // Clean up
    await removeHoliday(page, rowIndex);
  });

  test('employee availability status is showing correctly on employees listing 2nd page', async ({
    page,
    waitForSpinnerToDisappear,
  }) => {
    const usersAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/users?') &&
        resp.request().method() === 'GET',
    );
    // Go to second page
    await page.locator('svg[data-testid="KeyboardArrowRightIcon"]').click();

    await usersAPIPromise;

    // Small delay for DOM to update
    await page.waitForTimeout(300);

    // Find available employee row index on page 2 (using same pattern as first test)
    const availableEmployeeRow = page
      .locator('text=Available')
      .first()
      .locator('xpath=ancestor::tr');
    const rowIndex = await availableEmployeeRow.getAttribute('data-rowindex');

    if (!rowIndex) {
      throw new Error('No available employee found on page 2');
    }

    // Click on the employee
    const employeeRow = page.locator(`tr[data-rowindex="${rowIndex}"]`);
    await employeeRow.click();
    await waitForSpinnerToDisappear();

    // Wait for the technician API call after clicking employee
    await usersAPIPromise;

    // Add holiday
    const holidayDate = await addHoliday(page);

    // Verify holiday was added
    await verifyHoliday(page, holidayDate);

    // Go back to employees listing page
    const technicianEventsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/technicianEvents?') &&
        resp.request().method() === 'GET',
    );
    await page.goBack();

    // Wait for APIs to reload
    await usersAPIPromise;
    await technicianEventsAPIPromise;

    // Check if employee availability is updated on employees listing page
    await checkEmployeeAvailabilityUpdated(page, rowIndex);

    // Clean up
    await removeHoliday(page, rowIndex);
  });
});
