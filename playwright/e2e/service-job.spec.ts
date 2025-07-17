import {Page} from '@playwright/test';
import {addDays} from 'date-fns';
import {test, expect} from '../fixtures';
import {asyncLoop} from '../utils';

const createJob = async (page: Page) => {
  await page.locator('button:has-text("New Job")').click();

  // Select job type (using first available option)
  await page.locator('li').first().click();

  // Wait for units to load
  await page.waitForResponse(
    (response) =>
      response.url().includes('/elevators') &&
      response.request().method() === 'GET',
  );

  // Select first unit
  await page.locator('.MuiDataGrid-row').first().click();

  // Go to next step
  await page.locator('button:has-text("Next")').click();

  // Select due date (today)
  await page.locator('button[aria-label^="Choose date"]').click();
  await page.locator('button[aria-current="date"]').click();
  await page.locator('button:has-text("Confirm")').click();

  // Select time slot
  await page.locator('svg[data-testid="CalendarTodayIcon"]').click();
  await page.locator('button[aria-current="date"]').click();
  await page.locator('button:has-text("Confirm")').click();

  // Select first checkbox
  await page.locator('tbody tr td label').first().click();

  // Go to next step
  await page.locator('button:has-text("Next")').click();

  // Submit
  await page.locator('button:has-text("Submit")').click();

  // Wait for success message
  await expect(page.locator('text=Order scheduled successfully')).toBeVisible();
};

const changeTab = async (page: Page, tabIndex: number) => {
  await page.locator('.MuiTab-root').nth(tabIndex).click();
};

const openAssignEngineerDialog = async (page: Page) => {
  await page.locator('[data-testid="assign-engineer"]').first().click();
};

const assignEngineer = async ({
  page,
  changeDueDate = true,
  withSchedule = true,
  removeSchedule = false,
  assignEngineersCount = 1,
}: {
  page: Page;
  changeDueDate?: boolean;
  withSchedule?: boolean;
  removeSchedule?: boolean;
  assignEngineersCount?: number;
}) => {
  await asyncLoop(assignEngineersCount, async (idx) => {
    await page.locator('button[aria-label="Open"]').click({force: true});
    const option = page.locator(
      `li[role="option"][id="combo-box-demo-option-${idx}"]`,
    );
    // Only select if it's NOT already checked
    const checkbox = option.locator('input[type="checkbox"]');
    if (!(await checkbox.isChecked())) {
      await option.click({force: true});
    } else {
      // Click on the dialog itself to close the dropdown
      await page.locator('[role="dialog"]').click({force: true});
    }
  });

  if (changeDueDate) {
    await page.locator('[data-testid=due-date]').click();

    await expect(page.locator('[data-testid=due-date-popup]')).toBeVisible();

    await page
      .locator('[data-testid=due-date-popup]')
      .locator('button:has-text("Clear")')
      .click();

    await page.locator('[data-testid=due-date]').click();

    await expect(page.locator('[data-testid=due-date-popup]')).toBeVisible();

    const timestamp = await page
      .locator('button[aria-current="date"]')
      .getAttribute('data-timestamp');

    if (timestamp) {
      const currentDate = new Date(parseInt(timestamp, 10));
      const futureDate = addDays(currentDate, 3);
      const newTimestamp = futureDate.getTime();

      await page.locator(`button[data-timestamp="${newTimestamp}"]`).click();
      await page.locator('button:has-text("Confirm")').click();
    }
  }

  if (withSchedule) {
    const checkbox = page
      .locator('label')
      .filter({
        has: page.locator('[data-testid="schedule-dialog-fixed-date-switch"]'),
      })
      .locator('input[type="checkbox"][class*="MuiSwitch-input"]');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }

    await page.locator('label:has-text("Start and end date")').click();
    await page.locator('button[aria-current="date"]').first().click();

    const timestamp = await page
      .locator('button[aria-current="date"]')
      .getAttribute('data-timestamp');

    if (timestamp) {
      const currentDate = new Date(parseInt(timestamp, 10));
      const newDate = addDays(currentDate, 10);
      const newTimestamp = newDate.getTime();

      await page.locator(`button[data-timestamp="${newTimestamp}"]`).click();
    }

    await page.locator('button:has-text("Confirm")').click();

    await page
      .locator('label')
      .filter({
        hasText: 'Start Time',
      })
      .click({force: true});
    await expect(
      page.locator('[data-testid="start-time-popup"]'),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-testid="start-time-popup"]')
        .locator('ul[aria-label="Select hours"]'),
    ).toBeVisible();
    await page
      .locator('[data-testid="start-time-popup"]')
      .locator('li[aria-label="2 hours"]')
      .click();
    await expect(
      page
        .locator('[data-testid="start-time-popup"]')
        .locator('ul[aria-label="Select minutes"]'),
    ).toBeVisible();
    await page
      .locator('[data-testid="start-time-popup"]')
      .locator('li[aria-label="30 minutes"]')
      .click();
    await page
      .locator('[data-testid="start-time-popup"]')
      .locator('button:has-text("Confirm")')
      .click();

    await page
      .locator('label')
      .filter({
        hasText: 'End Time',
      })
      .click({force: true});
    await expect(page.locator('[data-testid="end-time-popup"]')).toBeVisible();
    await expect(
      page
        .locator('[data-testid="end-time-popup"]')
        .locator('ul[aria-label="Select hours"]'),
    ).toBeVisible();
    await page
      .locator('[data-testid="end-time-popup"]')
      .locator('li[aria-label="4 hours"]')
      .click();
    await expect(
      page
        .locator('[data-testid="end-time-popup"]')
        .locator('ul[aria-label="Select minutes"]'),
    ).toBeVisible();
    await page
      .locator('[data-testid="end-time-popup"]')
      .locator('li[aria-label="45 minutes"]')
      .click();
    await page
      .locator('[data-testid="end-time-popup"]')
      .locator('button:has-text("Confirm")')
      .click({force: true});
  }

  if (removeSchedule) {
    const checkbox = page.locator(
      'input[type="checkbox"][class*="MuiSwitch-input"]',
    );
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
  }

  await page
    .locator('[aria-describedby="schedule-dialog-description"]')
    .click();
  await expect(
    page.locator('[data-testid=saveScheduleButton]'),
  ).not.toBeDisabled();
  await page.locator('[data-testid=saveScheduleButton]').click();
  await expect(
    page.locator('text=Service job scheduled successfully'),
  ).toBeVisible();
};

const unscheduleFirstJob = async (page: Page) => {
  await page
    .locator('tbody tr')
    .first()
    .locator('button[data-testid="action-menu-horizontal"]')
    .click();
  await page.locator('li:has-text("Unschedule")').click();
  await page.locator('button:has-text("Confirm")').click();
};

const changeStatusFilter = async (page: Page, status: string) => {
  await page.locator(`button:has-text("${status}")`).click();
};

test.describe('Service Job Tests', () => {
  test.beforeEach(async ({page, login, navigatePW}) => {
    await login();

    // Navigate to service jobs
    await navigatePW('jobs', 'list');

    // Change to unscheduled tab
    await changeTab(page, 1);
  });

  test('should assign Engineer without schedule', async ({page}) => {
    await createJob(page);
    const serviceOrdersApi = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders?') &&
        response.request().method() === 'GET',
    );
    await page.goBack();

    await serviceOrdersApi;

    await expect(
      page.locator('[data-testid="assign-engineer"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="assign-engineer"]').first(),
    ).toContainText('Assign Engineer');

    const assignButton = page
      .locator('[data-testid="assign-engineer"]')
      .first();
    const isVisible = await assignButton.isVisible();

    if (!isVisible) {
      await changeTab(page, 0);
      await unscheduleFirstJob(page);
      await changeTab(page, 1);
    }

    await openAssignEngineerDialog(page);
    await assignEngineer({page, withSchedule: false});
  });

  test('should assign Engineer with schedule', async ({page}) => {
    await createJob(page);
    const serviceOrdersApi = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders?') &&
        response.request().method() === 'GET',
    );
    await page.goBack();

    await serviceOrdersApi;

    await expect(
      page.locator('[data-testid="assign-engineer"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="assign-engineer"]').first(),
    ).toContainText('Assign Engineer');

    await openAssignEngineerDialog(page);
    await assignEngineer({page});
  });

  test('should assign multiple Engineers with schedule', async ({page}) => {
    await createJob(page);
    const serviceOrdersApi = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders?') &&
        response.request().method() === 'GET',
    );
    await page.goBack();

    await serviceOrdersApi;

    await expect(
      page.locator('[data-testid="assign-engineer"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="assign-engineer"]').first(),
    ).toContainText('Assign Engineer');

    const assignButton = page
      .locator('[data-testid="assign-engineer"]')
      .first();
    const isVisible = await assignButton.isVisible();

    if (!isVisible) {
      await changeTab(page, 0);
      await unscheduleFirstJob(page);
      await changeTab(page, 1);
    }

    await openAssignEngineerDialog(page);
    await assignEngineer({page, assignEngineersCount: 2});
  });

  test('should assign Technician in order details page', async ({page}) => {
    await createJob(page);

    // Open action menu
    await page.locator('button[data-testid="action-menu-horizontal"]').click();
    await page
      .locator('[id="action-menu"]')
      .locator('[data-testid^="container-menu-option-"]')
      .first()
      .waitFor();

    // Click Schedule or Reschedule
    await page
      .locator('li')
      .filter({hasText: /^(Reschedule|Schedule)$/i})
      .click();

    await assignEngineer({page});
    await expect(
      page.locator('text=Service job scheduled successfully'),
    ).toBeVisible();
  });

  test('should not reset Technician when rescheduling without changing technicians field', async ({
    page,
  }) => {
    await createJob(page);

    await page.locator('button[data-testid="action-menu-horizontal"]').click();
    await page
      .locator('[id="action-menu"]')
      .locator('[data-testid^="container-menu-option-"]')
      .first()
      .waitFor();
    await page
      .locator('li')
      .filter({hasText: /^(Reschedule|Schedule)$/i})
      .click();

    // Wait for PUT request
    const putJobPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders/') &&
        response.request().method() === 'PUT',
    );

    await assignEngineer({
      page,
      withSchedule: true,
      removeSchedule: false,
      changeDueDate: false,
    });

    await putJobPromise;

    // Reschedule again
    await page.locator('button[data-testid="action-menu-horizontal"]').click();
    await page.locator('li:has-text("Reschedule")').click();

    const putJobPromise2 = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders/') &&
        response.request().method() === 'PUT',
    );

    await assignEngineer({
      page,
      withSchedule: false,
      removeSchedule: true,
      changeDueDate: false,
      assignEngineersCount: 0,
    });

    await putJobPromise2;

    // Verify technician is not reset
    await expect(
      page.locator('div[data-testid="technician-card"]'),
    ).not.toContainText('-');
    await expect(
      page.locator('div[data-testid="job-details-status-chip"]'),
    ).toContainText('Assigned');
  });

  test('should verify overdue jobs have the Unschedule menu item', async ({
    page,
  }) => {
    await changeTab(page, 0);
    const serviceOrdersApi = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders?') &&
        response.request().method() === 'GET',
    );
    await changeStatusFilter(page, 'Overdue');

    await serviceOrdersApi;

    // small wait to ensure the table is loaded
    await page.waitForTimeout(1000);

    // Find overdue job and click on it
    await page
      .locator('tbody tr')
      .filter({
        has: page.locator('[data-testid="status-chip"]:has-text("Overdue")'),
      })
      .first()
      .locator('td[data-field="EXTERNAL_ID"]')
      .click();

    // Open action menu
    await page.locator('button[data-testid="action-menu-horizontal"]').click();

    // Verify Unschedule option exists
    await expect(
      page
        .locator('[id="action-menu"]')
        .locator('[data-testid^="container-menu-option-"]')
        .filter({hasText: /^Unschedule$/}),
    ).toBeVisible();
  });

  test('should download work report', async ({page, copyPdfToPublic}) => {
    await changeTab(page, 0);
    const serviceOrdersApi = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceOrders?') &&
        response.request().method() === 'GET',
    );
    await changeStatusFilter(page, 'Completed');

    await serviceOrdersApi;
    // small wait to ensure the table is loaded
    await page.waitForTimeout(1000);

    // Verify first row is completed
    await expect(
      page.locator('tbody tr').first().locator('[data-testid="status-chip"]'),
    ).toContainText('Completed');

    // Click on completed job
    await page
      .locator(
        'tr[data-testid^="service-order-row"] td[data-field="EXTERNAL_ID"]',
      )
      .first()
      .click();

    // Click Work Report tab
    await page.locator('text=Work Report').click();

    // Check if images exist and wait for download URLs
    const reportImages = page.locator(
      '[data-testid="report-images"] div div img',
    );
    const imageCount = await reportImages.count();

    if (imageCount > 0) {
      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/media/signedUrl/download') &&
          response.status() === 200,
      );

      await expect(reportImages.first()).toBeVisible();
    }

    // Download work report
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download")').click();
    const download = await downloadPromise;

    // Get report ID for verification
    const reportId = await page
      .locator('p[data-testid="reportId"]')
      .textContent();

    // Save download to verify content

    const filename = await copyPdfToPublic(download);

    const baseUrl = 'http://localhost:5173';
    const pdfViewerUrl = `${baseUrl}/pdf-viewer?filename=`;
    await page.goto(`${pdfViewerUrl}${filename}`);

    await page.locator('div[class="react-pdf__Document"]').first().waitFor();

    await page
      .locator('div[class*="react-pdf__Page__textContent"]')
      .first()
      .waitFor();

    await expect(page.locator(`text=${reportId}`).first()).toBeVisible();
  });
});
