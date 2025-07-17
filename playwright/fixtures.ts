import {test as base, Download, Locator} from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import {UserSession} from '../src/models/session';
import {
  USER_ACCOUNT_LOCALSTORAGE_KEY,
  USER_LOCALSTORAGE_KEY,
} from '../src/userStorage/index';
import {UserView} from '../src/models/user';

type Fixtures = {
  navigatePW: (primaryId: string, secondaryId: string) => Promise<void>;
  navigateSingleDrawer: (primaryId: string) => Promise<void>;
  login: () => Promise<void>;
  getRichTextField: (field: string) => Promise<Locator>;
  fillRichTextField: (field: string, value: string) => Promise<void>;
  clearRichTextField: (field: string) => Promise<void>;
  fillTiptapRichTextField: (field: string, value: string) => Promise<void>;
  waitForSpinnerToDisappear: () => Promise<void>;
  getAuthUser: () => Promise<UserSession | null>;
  getAuthUserAccount: () => Promise<UserView | null>;
  copyPdfToPublic: (download: Download) => Promise<string>;
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

      // Wait for redirect after login
      await page.waitForURL((url) => !url.toString().includes('/login'));
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
  fillRichTextField: async ({page}, use) => {
    const fillRichTextField = async (field: string, value: string) => {
      const fieldset = page
        .locator('fieldset')
        .filter({has: page.locator('legend', {hasText: field})});
      const contentEditable = fieldset.locator('div[contenteditable="true"]');
      await contentEditable.focus();
      await contentEditable.click();
      await contentEditable.fill(value);
    };
    await use(fillRichTextField);
  },
  clearRichTextField: async ({page}, use) => {
    const clearRichTextField = async (field: string) => {
      const fieldset = page
        .locator('fieldset')
        .filter({has: page.locator('legend', {hasText: field})});
      const contentEditable = fieldset.locator('div[contenteditable="true"]');
      await contentEditable.focus();
      await contentEditable.click();
      await contentEditable.click({clickCount: 3});
      await contentEditable.press('Backspace');
    };
    await use(clearRichTextField);
  },
  fillTiptapRichTextField: async ({page}, use) => {
    const fillTiptapRichTextField = async (field: string, value: string) => {
      const label = page.locator('label', {hasText: field});
      const container = label.locator('..');
      const contentEditable = container.locator('div[contenteditable="true"]');
      await contentEditable.focus();
      await contentEditable.click();
      await contentEditable.fill(value);
    };
    await use(fillTiptapRichTextField);
  },
  waitForSpinnerToDisappear: async ({page}, use) => {
    const waitForSpinnerToDisappear = async () => {
      const spinner = page.locator('span[role="progressbar"]').first();

      try {
        // Check if spinner is already visible
        const isVisible = await spinner.isVisible();

        if (isVisible) {
          // If spinner is visible, wait for it to disappear
          await spinner.waitFor({state: 'detached'});
        } else {
          // If not visible, wait briefly for it to appear, then disappear
          await spinner.waitFor({state: 'visible', timeout: 5000});
          await spinner.waitFor({state: 'detached'});
        }
      } catch (error) {
        // If spinner doesn't appear within timeout, assume page is already loaded
        console.log('No spinner detected, assuming page already loaded');
      }
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
  // eslint-disable-next-line no-empty-pattern
  copyPdfToPublic: async ({}, use) => {
    const copyPdfToPublic = async (download: Download): Promise<string> => {
      // Save the downloaded file
      const downloadsDir = path.join(__dirname, '../playwright/downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, {recursive: true});
      }

      const downloadPath = path.join(
        downloadsDir,
        download.suggestedFilename(),
      );
      await download.saveAs(downloadPath);

      // Copy to public folder for serving
      const publicDir = path.join(__dirname, '../public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, {recursive: true});
      }

      const publicPath = path.join(publicDir, download.suggestedFilename());
      fs.copyFileSync(downloadPath, publicPath);

      return download.suggestedFilename();
    };
    await use(copyPdfToPublic);
  },
});

export const {expect} = test;
