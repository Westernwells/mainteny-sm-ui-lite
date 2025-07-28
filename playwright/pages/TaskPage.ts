import {Page} from '@playwright/test';
import {format} from 'date-fns';
import {expect} from '../fixtures';
import {asyncLoop} from '../utils';

export type FillTaskFormPayload = {
  name: string;
  description: string;
  status: string;
  dueDateNumber: number;
  assignedToString: string;
  refType: 'ELEVATOR' | 'SERVICE_ORDER';
};

export class TaskPage {
  static TASK_STATUSES = [
    {label: 'To-do', value: 'TO_DO'},
    {label: 'Ongoing', value: 'IN_PROGRESS'},
    {label: 'Paused', value: 'PAUSED'},
    {label: 'Done', value: 'DONE'},
    {label: 'Archived', value: 'ARCHIVED'},
    {label: 'Cancelled', value: 'CANCELLED'},
    {label: 'Overdue', value: 'OVERDUE'},
  ];

  static TABLE_COLUMNS = [
    {label: 'Task name', orderBy: 'NAME'},
    {label: 'Status', orderBy: 'STATUS'},
    {label: 'Date', orderBy: 'OVERDUE'},
    {label: 'Assigned to', orderBy: 'ASSIGNEE_LAST_NAME'},
    {label: 'Author', orderBy: 'CREATOR_LAST_NAME'},
  ];

  constructor(private page: Page) {
    this.page = page;
  }

  async openFilter() {
    return this.page.getByTestId('task-filter-open-button').click();
  }

  async openTableActions(
    clickOnItem?: string,
    options?: {action: 'click' | 'hover'},
  ) {
    const {action = 'click'} = options ?? {};

    await this.page.getByTestId('task-list-table-actions').first().click();

    if (clickOnItem) {
      const elem = this.page.locator("li[role='menuitem']", {
        hasText: clickOnItem,
      });

      if (action === 'click') {
        await elem.click();
      }

      if (action === 'hover') {
        await elem.hover();
      }
    }
  }

  async addDummyTask() {
    await this.openNewTaskDrawer();

    const now = format(new Date(), 'yyyy-MM-dd HH:mm');

    const payload: FillTaskFormPayload = {
      name: `Test - ${now}`,
      description: `Some description here written on ${now}`,
      status: 'TO_DO',
      dueDateNumber: 28,
      assignedToString: 'izaan',
      refType: 'ELEVATOR',
    };

    await this.fillTaskForm(payload);

    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/api\/tasks$/.test(response.url()),
    );

    await this.clickOnCreateTask();

    return responsePromise;
  }

  async openDetailsActions(
    clickOnItem?: string,
    options?: {action: 'click' | 'hover'},
  ) {
    const {action = 'click'} = options ?? {};

    this.page
      .getByTestId('task-details-drawer-main')
      .locator("button[data-role='menu']")
      .click();

    if (clickOnItem) {
      const elem = this.page.locator("li[role='menuitem']", {
        hasText: clickOnItem,
      });

      if (action === 'click') {
        await elem.click();
      }

      if (action === 'hover') {
        await elem.hover();
      }
    }
  }

  async changeStatusPicker(
    newStatusLabel?: string,
    options?: {action: 'next'},
  ) {
    const {action = 'next'} = options ?? {};

    const statusPickerElem = this.page.getByTestId('task-status-picker');

    if (newStatusLabel) {
      await statusPickerElem
        .locator("button[data-role='dropdown-button']")
        .click();
      await this.page
        .locator("li[role='menuitem']", {hasText: newStatusLabel})
        .click();
    } else if (action === 'next') {
      await statusPickerElem.locator("button[data-role='next-arrow']").click();
    }
  }

  async openDetailsDrawer() {
    return this.page
      .locator('td[role="cell"][data-field="NAME"]')
      .first()
      .click();
  }

  async sortTableColumn(columnHeading: string) {
    return this.page
      .locator('th', {hasText: columnHeading})
      .locator('button')
      .click();
  }

  async goToTablePage(pageNumber: number) {
    return this.page
      .getByTestId('task-pagination')
      .getByRole('button', {name: pageNumber.toString(), exact: true})
      .click();
  }

  async export() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('button:has-text("Export")'),
    ]);

    return download;
  }

  async selectDateRange(startDateNumber: number, endDateNumber: number) {
    // Open date range picker
    await this.page.getByTestId('start-end-date').click();
    await this.page.getByTestId('start-end-date-popup').waitFor();

    await this.page
      .getByTestId('start-end-date-popup')
      .getByRole('gridcell', {name: startDateNumber.toString()})
      .first()
      .click();

    await this.page
      .getByTestId('start-end-date-popup')
      .getByRole('gridcell', {name: endDateNumber.toString()})
      .first()
      .click();

    // Apply filter (adjust if your button has a different label)
    await this.page
      .getByTestId('start-end-date-popup')
      .getByRole('button', {name: /confirm/i})
      .click();
  }

  async writeSearchText(searchText: string) {
    await this.page.fill('input[placeholder="Search"]', searchText);
  }

  async clearSearchInput() {
    return this.page.click('button[data-testid="search-input-clear"]');
  }

  async openNewTaskDrawer() {
    await this.page.click('text=New Task');
  }

  async writeIntoNewTaskDescriptionInput(str: string) {
    const editor = this.page
      .getByTestId('new-task-drawer-main')
      .locator('[contenteditable="true"]');
    await editor.click();
    await editor.fill(str); // replaces content
  }

  async selectNewTaskStatusInput(statusValue: string) {
    await this.page
      .getByTestId('status-input-control')
      .getByRole('combobox')
      .click();
    await this.page
      .locator(`li[role="option"][data-value="${statusValue}"]`)
      .click();
  }

  async writeIntoNewTaskNameInput(str: string) {
    return this.page
      .getByTestId('new-task-drawer-main')
      .locator('input[name="name"]')
      .fill(str);
  }

  async selectNewTaskDueDateInput(dateNumber: number) {
    await this.page.getByTestId('duedate-picker').click();
    await this.page.getByTestId('duedate-picker-popup').waitFor();

    await this.page
      .getByTestId('duedate-picker-popup')
      .getByRole('gridcell', {name: dateNumber.toString()})
      .first()
      .click();

    // Apply filter (adjust if your button has a different label)
    await this.page
      .getByTestId('duedate-picker-popup')
      .getByRole('button', {name: /confirm/i})
      .click();
  }

  async selectNewTaskAssignedToInput(searchStr: string) {
    const input = this.page
      .getByTestId('assigned-to-autocomplete-root')
      .locator('input');

    const responsePromise = this.page.waitForResponse((response) => {
      const url = response.url();

      return (
        url.includes('/api/serviceCompanies/') &&
        url.includes('/employees?') &&
        url.includes(`query=${searchStr}`) &&
        response.request().method() === 'GET'
      );
    });

    await input.click();

    await input.pressSequentially(searchStr);

    await responsePromise;

    const options = this.page.locator('[role="listbox"] [role="option"]');

    // Step 4: Select first option
    await options.nth(0).click();
  }

  async selectNewTaskTagsInput() {
    await this.page.getByTestId('tags-form').click();
    const container = this.page.getByTestId('tags-form-search');
    const tagItems = container.locator('[data-role="tag-item"]');
    const count = await tagItems.count();

    const selectedTexts: string[] = [];

    if (count > 0) {
      const firstText = await tagItems.nth(0).textContent();
      await tagItems.nth(0).click();
      selectedTexts.push(firstText?.trim() || '');

      if (count > 1) {
        const lastText = await tagItems.nth(count - 2).textContent();
        await tagItems.nth(count - 2).click();
        selectedTexts.push(lastText?.trim() || '');
      }
    }

    // Now get selected items and compare
    const selectedTags = this.page
      .getByTestId('selected-tag-container')
      .locator('span[data-role="tag-selected-item"]');
    const selectedCount = await selectedTags.count();
    const texts = await Promise.all(
      Array.from({length: selectedCount}, (_, i) =>
        selectedTags.nth(i).textContent(),
      ),
    );

    const selectedValues = texts.map((text) => text?.trim() || '');

    // Compare arrays (ignoring order)
    expect(new Set(selectedValues)).toEqual(new Set(selectedTexts));

    await container.click();
  }

  async selectNewTaskConnectedToInput({
    refType,
  }: {
    refType: 'ELEVATOR' | 'SERVICE_ORDER';
  }) {
    await this.page
      .getByTestId('connected-to-input')
      .getByRole('combobox')
      .click();

    await this.page
      .locator(`li[role="option"][data-value="${refType}"]`)
      .click();

    if (refType === 'ELEVATOR') {
      const refIdContainer = this.page.getByTestId(
        'connected-to-elevator-input',
      );

      const responsePromise = this.page.waitForResponse((response) => {
        const url = response.url();
        const regex = /\/api\/serviceCompanies\/[^/]+\/elevators/;

        const hasPageIndex = url.includes(`pageIndex=0`);
        const hasPageSize = url.includes(`pageSize=20`);

        return (
          regex.test(url) &&
          hasPageIndex &&
          hasPageSize &&
          response.request().method() === 'GET'
        );
      });

      await refIdContainer.locator('input').click();

      await responsePromise;
    }

    if (refType === 'SERVICE_ORDER') {
      const refIdContainer = this.page.getByTestId(
        'connected-to-service-order-input',
      );

      const responsePromise = this.page.waitForResponse((res) => {
        const url = new URL(res.url());
        return (
          url.pathname === '/api/serviceOrders' &&
          url.searchParams.get('pageIndex') === '0' &&
          url.searchParams.get('pageSize') === '20' &&
          res.request().method() === 'GET'
        );
      });

      await refIdContainer.locator('input').click();

      await responsePromise;
    }

    const options = this.page.locator('[role="listbox"] [role="option"]');

    // Step 4: Select first option
    await options.nth(0).click();
  }

  async clickOnCreateTask() {
    return this.page
      .getByTestId('new-task-drawer-main')
      .getByRole('button', {name: 'Create Task'})
      .click();
  }

  async clickOnSaveTask() {
    return this.page
      .getByTestId('new-task-drawer-main')
      .getByRole('button', {name: 'Save'})
      .click();
  }

  async fillTaskForm({
    name,
    description,
    status,
    dueDateNumber,
    assignedToString,
    refType,
  }: FillTaskFormPayload) {
    await this.writeIntoNewTaskNameInput(name);
    await this.writeIntoNewTaskDescriptionInput(description);
    await this.selectNewTaskStatusInput(status);
    await this.selectNewTaskDueDateInput(dueDateNumber);
    await this.selectNewTaskAssignedToInput(assignedToString);
    await this.selectNewTaskTagsInput();
    await this.selectNewTaskConnectedToInput({refType});
  }

  async clearFilters() {
    return this.page
      .getByTestId('task-filters-main')
      .getByRole('button', {name: 'Reset All'})
      .click();
  }

  async selectStatus(statusLabel: string) {
    await this.page
      .getByTestId('task-status-chip-selector')
      .getByRole('button', {name: statusLabel})
      .click();
  }

  async selectQuickFilter(label: string) {
    return this.page.getByRole('button', {name: label, exact: true}).click();
  }

  async applyAllStatusFilters() {
    await this.openFilter();

    await asyncLoop(TaskPage.TASK_STATUSES.length, async (idx) => {
      const status = TaskPage.TASK_STATUSES[idx];

      await this.selectStatus(status.label);
    });

    await this.page
      .getByTestId('task-filters-main')
      .getByText('Show Results')
      .click();
  }
}
