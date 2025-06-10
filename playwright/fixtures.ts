import {test as base} from '@playwright/test';

type Fixtures = {
  navigatePW: (primaryId: string, secondaryId: string) => void;
  login: () => Promise<void>;
  getRichTextField: (field: string) => Promise<any>;
  waitForSpinnerToDisappear: () => Promise<void>;
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
});

export const {expect} = test;
