import {test as base} from '@playwright/test';

import {UserSession} from '../src/models/session';
import {
  USER_ACCOUNT_LOCALSTORAGE_KEY,
  USER_LOCALSTORAGE_KEY,
} from '../src/userStorage/index';
import {UserView} from '../src/models/user';

type Fixtures = {
  navigatePW: (primaryId: string, secondaryId: string) => void;
  navigateSingleDrawer: (primaryId: string) => Promise<void>;
  login: () => Promise<void>;
  getRichTextField: (field: string) => Promise<any>;
  waitForSpinnerToDisappear: () => Promise<void>;
  getAuthUser: () => Promise<UserSession | null>;
  getAuthUserAccount: () => Promise<UserView | null>;
};

export const test = base.extend<Fixtures>({
  navigatePW: async ({page}, use) => {
    const navigate = async (primaryId: string, secondaryId: string) => {
      await page.locator(`[data-testid="${primaryId}-nav-item"]`).hover();
      await page
        .locator(
          `[data-testid="${primaryId}-nav-item"] [data-testid="ExpandLessIcon"]`,
        )
        .click();
      await page.locator(`[data-testid="${secondaryId}-nav-item"]`).click();
    };
    await use(navigate);
  },
  navigateSingleDrawer: async ({page}, use) => {
    const navigate = async (primaryId: string) => {
      await page.locator(`[data-testid="${primaryId}-nav-item"]`).hover();
      await page.locator(`[data-testid="${primaryId}-nav-item"]`).click();
      await page.mouse.move(500, 0); // Move the mouse to 500px to un hover
    };
    await use(navigate);
  },
  login: async ({page}, use) => {
    const login = async () => {
      await page.goto('/login', {waitUntil: 'domcontentloaded'});

      const loginResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/sessions/login') &&
          response.request().method() === 'POST',
      );

      await page.locator('#email').fill('e2etest@mainteny.com');
      await page.locator('#password').fill('!!abc123');
      await page.locator('button[type="submit"]').click();

      await loginResponsePromise;
    };
    await use(login);
  },
  getRichTextField: async ({page}, use) => {
    const getRichTextField = async (field: string) => {
      const fieldset = page
        .locator('fieldset')
        .filter({has: page.locator('legend', {hasText: field})});
      return fieldset.locator('div[contenteditable="true"]');
    };
    await use(getRichTextField);
  },
  waitForSpinnerToDisappear: async ({page}, use) => {
    const waitForSpinnerToDisappear = async () => {
      await page
        .locator('span[role="progressbar"]')
        .waitFor({state: 'visible'});
      await page
        .locator('span[role="progressbar"]')
        .waitFor({state: 'detached'});
    };
    await use(waitForSpinnerToDisappear);
  },
  getAuthUser: async ({page}, use) => {
    await use(() =>
      page.evaluate((key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }, USER_LOCALSTORAGE_KEY),
    );
  },
  getAuthUserAccount: async ({page}, use) => {
    await use(() =>
      page.evaluate((key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }, USER_ACCOUNT_LOCALSTORAGE_KEY),
    );
  },
});

export const {expect} = test;
