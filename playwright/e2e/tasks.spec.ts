import {format} from 'date-fns';
import {test, expect} from '../fixtures';
import {FillTaskFormPayload, TaskPage} from '../pages/TaskPage';
import {stripHTMLTagsLight} from '../../src/utils/text-block';
import {
  CreateTaskBody,
  TaskAssignmentType,
  TaskRefEntityType,
} from '../../src/models/tasks';

test.describe('Tasks Screen', () => {
  test.beforeEach(
    async ({login, navigateSingleDrawer, waitForSpinnerToDisappear}) => {
      await login();
      await navigateSingleDrawer('tasks');
      await waitForSpinnerToDisappear();
    },
  );

  // Group 1: Filtering & Sorting
  test.describe('Filtering and Sorting', () => {
    test('should filter data by assignment type', async ({
      page,
      getAuthUserAccount,
    }) => {
      const taskPage = new TaskPage(page);
      const user = (await getAuthUserAccount())!;

      const statuses = [
        {
          view: 'My tasks',
          assignmentType: 'SINGLE',
          assignedEmployeeId: user.userData.employeeId,
        },
        {
          view: 'All',
        },
        {
          view: 'Technicians',
          assignmentType: 'TECHNICIANS',
        },
        {
          view: 'Office',
          assignmentType: 'OFFICE',
        },
      ];

      await statuses.reduce(
        async (prevPromise, {view, assignmentType, assignedEmployeeId}) =>
          prevPromise.then(async () => {
            const responsePromise = page.waitForResponse(
              (resp) =>
                resp.url().includes('/tasks?') &&
                (assignmentType
                  ? resp.url().includes(`assignmentType=${assignmentType}`)
                  : true) &&
                (assignedEmployeeId
                  ? resp
                      .url()
                      .includes(`assignedEmployeeId=${assignedEmployeeId}`)
                  : true),
            );

            await taskPage.selectQuickFilter(view);
            await responsePromise;
          }),
        Promise.resolve(),
      );
    });

    test('should filter with search text and verify API call', async ({
      page,
    }) => {
      const taskPage = new TaskPage(page);

      const searchText = 'test';
      const responsePromise = page.waitForResponse((resp) => {
        const url = resp.url();
        const regex =
          /\/serviceCompanies\/[^/]+\/tasks\?(?=.*query=[^&]+)(?=.*pageSize=25)/;
        return regex.test(url);
      });

      await taskPage.writeSearchText(searchText);

      await page.waitForURL(new RegExp(`.*searchTasks.*${searchText}.*`));
      const response = await responsePromise;
      const body = await response.json();

      expect(body.data.length).toBeGreaterThan(0);

      await taskPage.clearSearchInput();
      await expect(page.locator('input[placeholder="Search"]')).toHaveValue('');
    });

    test('should filter tasks by date range', async ({page}) => {
      const taskPage = new TaskPage(page);

      const responsePromise = page.waitForResponse((resp) => {
        const url = resp.url();
        return (
          url.includes('/tasks?') &&
          url.includes('dueDateStart=') &&
          url.includes('dueDateEnd=')
        );
      });

      await taskPage.selectDateRange(1, 10);

      // Verify API call includes the date range
      const response = await responsePromise;

      const body = await response.json();
      expect(body.data).toBeDefined();
    });

    test('should sort tasks by different columns', async ({page}) => {
      const taskPage = new TaskPage(page);

      await TaskPage.TABLE_COLUMNS.reduce<Promise<void>>(
        (chain, column) =>
          chain.then(() => {
            // start waiting for the network call
            const responsePromise = page.waitForResponse((resp) => {
              const url = new URL(resp.url());
              return (
                /^\/api\/serviceCompanies\/[0-9a-fA-F-]+\/tasks$/.test(
                  url.pathname,
                ) &&
                url.searchParams.has('pageSize') &&
                url.searchParams.has('pageIndex') &&
                url.searchParams.get('orderBy') === column.orderBy &&
                url.searchParams.has('order')
              );
            });

            // click the header, then wait, then swallow the response
            return taskPage
              .sortTableColumn(column.label)
              .then(() => responsePromise)
              .then((response) => response.json())
              .then((body) => {
                expect(body.data).toBeDefined();
              });
          }),
        Promise.resolve(),
      );
    });

    test('should filter tasks by status', async ({page}) => {
      const taskPage = new TaskPage(page);

      const expectedStatuses = TaskPage.TASK_STATUSES.map(
        (s) => s.value,
      ).sort();

      // Verify API call includes status filter
      const responsePromise = page.waitForResponse((resp) => {
        const url = new URL(resp.url());

        const actualStatuses = url.searchParams.getAll('status').sort();

        const sameStatuses =
          actualStatuses.length === expectedStatuses.length &&
          actualStatuses.every((val, idx) => val === expectedStatuses[idx]);

        return (
          /^\/api\/serviceCompanies\/[0-9a-fA-F-]+\/tasks$/.test(
            url.pathname,
          ) &&
          url.searchParams.has('pageSize') &&
          url.searchParams.has('pageIndex') &&
          sameStatuses
        );
      });

      await taskPage.applyAllStatusFilters();

      // Wait for the response with exact status matching
      const response = await responsePromise;

      const body = await response.json();
      expect(body.data).toBeDefined();
    });

    test('should clear all filters', async ({page}) => {
      const taskPage = new TaskPage(page);

      // Apply some filters first
      await taskPage.applyAllStatusFilters();

      // Expect status filter is applied
      expect(page.url()).toContain('selectedStatus');

      // Clear all filters
      await taskPage.openFilter();
      await taskPage.clearFilters();

      // Verify URL is reset
      expect(page.url()).not.toContain('selectedStatus');
    });
  });

  // Group 2: CRUD Operations
  test.describe('Task CRUD Operations', () => {
    test('should create a new task attached to unit', async ({page}) => {
      const taskPage = new TaskPage(page);

      await taskPage.openNewTaskDrawer();

      const now = format(new Date(), 'yyyy-MM-dd HH:mm');

      const payload: FillTaskFormPayload = {
        name: `Unit task - ${now}`,
        description: `Some description here written on ${now}. This task is for the unit`,
        status: 'TO_DO',
        dueDateNumber: 28,
        assignedToString: 'izaan',
        refType: TaskRefEntityType.ELEVATOR,
      };

      await taskPage.fillTaskForm(payload);

      const responsePromise = page.waitForResponse(
        (apiResponse) =>
          apiResponse.request().method() === 'POST' &&
          /\/api\/tasks$/.test(apiResponse.url()),
      );

      await taskPage.clickOnCreateTask();

      const response = await responsePromise;

      const requestPostData = response.request().postData()!;

      const postData = JSON.parse(requestPostData) as never as CreateTaskBody;

      expect(postData.name).toBe(payload.name);
      expect(postData.status).toBe(payload.status);
      expect(postData.dueDate).toBeDefined();
      expect(postData.tags).toBeDefined();
      expect(postData.tags?.length).toBeGreaterThan(0);
      expect(postData.assignment?.employeeId).toBeDefined();
      expect(postData.assignment?.type).toEqual(TaskAssignmentType.SINGLE);
      expect(postData.refEntity?.id).toBeDefined();
      expect(postData.refEntity?.type).toEqual(TaskRefEntityType.ELEVATOR);
      expect(stripHTMLTagsLight(postData.description)).toBe(
        payload.description,
      );
    });

    test('should create a new task attached to job', async ({page}) => {
      const taskPage = new TaskPage(page);

      await taskPage.openNewTaskDrawer();

      const now = format(new Date(), 'yyyy-MM-dd HH:mm');

      const payload: FillTaskFormPayload = {
        name: `Job task - ${now}`,
        description: `Some description here written on ${now}. This task is for the job`,
        status: 'TO_DO',
        dueDateNumber: 28,
        assignedToString: 'izaan',
        refType: TaskRefEntityType.SERVICE_ORDER,
      };

      await taskPage.fillTaskForm(payload);

      const responsePromise = page.waitForResponse(
        (apiResponse) =>
          apiResponse.request().method() === 'POST' &&
          /\/api\/tasks$/.test(apiResponse.url()),
      );

      await taskPage.clickOnCreateTask();

      const response = await responsePromise;

      const requestPostData = response.request().postData()!;

      const postData = JSON.parse(requestPostData) as never as CreateTaskBody;

      expect(postData.name).toBe(payload.name);
      expect(postData.status).toBe(payload.status);
      expect(postData.dueDate).toBeDefined();
      expect(postData.tags).toBeDefined();
      expect(postData.tags?.length).toBeGreaterThan(0);
      expect(postData.assignment?.employeeId).toBeDefined();
      expect(postData.assignment?.type).toEqual(TaskAssignmentType.SINGLE);
      expect(postData.refEntity?.id).toBeDefined();
      expect(postData.refEntity?.type).toEqual(TaskRefEntityType.SERVICE_ORDER);
      expect(stripHTMLTagsLight(postData.description)).toBe(
        payload.description,
      );
    });

    test('should edit task', async ({page}) => {
      const taskPage = new TaskPage(page);

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks/`) &&
          resp.request().method() === 'GET',
      );

      await taskPage.openTableActions('Edit');

      const url = page.url();
      const taskId = new URL(url).searchParams.get('taskId');

      const response = await responsePromise;
      const json = await response.json();

      const payload = {
        name: `${json.name} - updated`,
        status: 'IN_PROGRESS',
      };

      await taskPage.writeIntoNewTaskNameInput(payload.name);
      await taskPage.selectNewTaskStatusInput(payload.status);

      const responsePromise2 = page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks/${taskId}`) &&
          resp.request().method() === 'PUT',
      );

      await taskPage.clickOnSaveTask();

      const putResponse = await responsePromise2;

      const requestPostData = putResponse.request().postData()!;

      const postData = JSON.parse(requestPostData) as never as {
        [key: string]: string;
      };

      expect(postData.name).toBe(payload.name);
      expect(postData.status).toBe(payload.status);
    });

    test('should delete task using table actions', async ({page}) => {
      const taskPage = new TaskPage(page);

      // Adding new task before delete so that task don't run out
      await taskPage.addDummyTask();
      await taskPage.openTableActions('Delete');

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks`) &&
          resp.request().method() === 'DELETE',
      );

      await page.locator('button', {hasText: 'Yes'}).click();

      await responsePromise;
    });

    test('should delete task using table details actions', async ({page}) => {
      const taskPage = new TaskPage(page);

      // Adding new task before delete so that task don't run out
      await taskPage.addDummyTask();

      await taskPage.openDetailsDrawer();
      await taskPage.openDetailsActions('Delete');

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks`) &&
          resp.request().method() === 'DELETE',
      );

      await page.locator('button', {hasText: 'Yes'}).click();

      await responsePromise;
    });

    test('should duplicate task', async ({page}) => {
      const taskPage = new TaskPage(page);

      await taskPage.openTableActions('Duplicate');

      const response = await page.waitForResponse(
        (apiResponse) =>
          apiResponse.request().method() === 'POST' &&
          /\/api\/tasks$/.test(apiResponse.url()),
      );

      const json = await response.json();

      expect(response.status()).toBe(200);
      expect(json).toBeDefined();
    });
  });

  // Group 3: Status Management
  test.describe('Task Status Management', () => {
    test('should change status using table action', async ({page}) => {
      const taskPage = new TaskPage(page);

      await taskPage.openTableActions('Move to', {action: 'hover'});

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks`) &&
          resp.request().method() === 'PUT',
      );

      await page
        .locator("li[role='menuitem']", {
          hasText: 'Paused',
        })
        .click();

      const putResponse = await responsePromise;

      const requestPostData = putResponse.request().postData()!;

      const postData = JSON.parse(requestPostData) as never as {
        [key: string]: string;
      };

      expect(postData.status).toBe('PAUSED');
    });

    test('should change status using task details status picker', async ({
      page,
    }) => {
      const taskPage = new TaskPage(page);

      await taskPage.openDetailsDrawer();

      await taskPage.changeStatusPicker('Done');

      const url = page.url();
      const taskId = new URL(url).searchParams.get('taskId');

      const putResponse = await page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks`) &&
          resp.request().method() === 'PUT',
      );

      const requestPostData = putResponse.request().postData()!;

      const postData = JSON.parse(requestPostData) as never as {
        [key: string]: string;
      };

      expect(postData.status).toBe('DONE');

      await page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks/${taskId}`) &&
          resp.request().method() === 'GET',
      );

      await taskPage.changeStatusPicker(undefined, {action: 'next'});

      const putResponse2 = await page.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/tasks`) &&
          resp.request().method() === 'PUT',
      );

      const requestPostData2 = putResponse2.request().postData()!;

      const postData2 = JSON.parse(requestPostData2) as never as {
        [key: string]: string;
      };

      expect(postData2.status).toBe('ARCHIVED');
    });
  });

  // Group 4: UI & Misc
  test.describe('UI and Miscellaneous', () => {
    test('should show no entries message when filter returns nothing', async ({
      page,
    }) => {
      const taskPage = new TaskPage(page);
      const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';
      const responsePromise = page.waitForResponse(
        `**/api/serviceCompanies/**/tasks?**query=${searchText}**`,
      );
      await taskPage.writeSearchText(searchText);
      await page.waitForURL(new RegExp(`.*searchTasks.*${searchText}.*`));
      expect(page.url()).toContain(searchText);
      const response = await responsePromise;
      const body = await response.json();
      expect(body.data).toHaveLength(0);

      await expect(
        page.locator('text=No matching search results'),
      ).toBeVisible();
    });

    test('should open the new task drawer on clicking new task button', async ({
      page,
    }) => {
      const taskPage = new TaskPage(page);
      await taskPage.openNewTaskDrawer();
      await page.waitForURL(/.*tasks\?.*mode=create.*/);
      await expect(page.getByTestId('new-task-drawer-main')).toBeVisible();
    });

    test('should open task details drawer', async ({page}) => {
      const taskPage = new TaskPage(page);

      await taskPage.openDetailsDrawer();

      await expect(page.getByTestId('task-details-drawer-main')).toBeVisible();
    });

    test('should paginate through task list', async ({page}) => {
      const taskPage = new TaskPage(page);

      const responsePromise = page.waitForResponse((resp) => {
        const url = new URL(resp.url());

        return (
          /^\/api\/serviceCompanies\/[0-9a-fA-F-]+\/tasks$/.test(
            url.pathname,
          ) &&
          url.searchParams.has('pageSize') &&
          url.searchParams.has('pageIndex') &&
          url.searchParams.get('pageIndex') === '1'
        );
      });

      const response2Promise = page.waitForResponse((resp) => {
        const url = new URL(resp.url());

        return (
          /^\/api\/serviceCompanies\/[0-9a-fA-F-]+\/tasks$/.test(
            url.pathname,
          ) &&
          url.searchParams.has('pageSize') &&
          url.searchParams.has('pageIndex') &&
          url.searchParams.get('pageIndex') === '1'
        );
      });

      // Click page 2 button
      await taskPage.goToTablePage(2);

      // Verify API call includes page parameter
      const response = await responsePromise;

      await response2Promise;

      const body = await response.json();
      expect(body.data).toBeDefined();

      // Verify URL updated
      const url = new URL(page.url()); // your actual url string
      const pageParam = url.searchParams.get('page');

      const decoded = JSON.parse(decodeURIComponent(pageParam || ''));

      expect(decoded.pageIndex).toBe(1);
    });

    test('should export tasks to sheet', async ({page}) => {
      const taskPage = new TaskPage(page);

      const filename = 'Tasks';
      const download = await taskPage.export();

      const suggestedFilename = download.suggestedFilename();
      expect(suggestedFilename).toContain(`${filename}_`);
      expect(suggestedFilename).toMatch(/\.xlsx$/);
    });

    test('should disable Create Task button when name is empty', async ({
      page,
    }) => {
      const taskPage = new TaskPage(page);

      await taskPage.openNewTaskDrawer();

      const createButton = page
        .getByTestId('new-task-drawer-main')
        .getByRole('button', {name: 'Create Task'});

      await expect(createButton).toBeDisabled();
    });
  });
});
