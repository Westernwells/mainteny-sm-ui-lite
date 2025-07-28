import {Page} from '@playwright/test';
import percySnapshot from '@percy/playwright';
import {test, expect} from '../fixtures';

const baseUrl = 'http://localhost:5173';
const pdfViewerUrl = `${baseUrl}/pdf-viewer?filename=`;

// skip test if we are not running in percy
// because these tests also run if we are running playwright tests
if (!process.env.PERCY_SERVER_ADDRESS) {
  test.skip();
}

test.describe('PDF Visual testing', () => {
  test.beforeEach(async ({login}) => {
    await login();
  });

  const takeSnapshot = async ({
    page,
    waitForSpinnerToDisappear,
    name,
    invoiceId,
    quotationId,
    url,
    assertText,
  }: {
    page: Page;
    waitForSpinnerToDisappear: () => Promise<void>;
    name: string;
    invoiceId?: string;
    quotationId?: string;
    url?: string;
    assertText?: string;
  }) => {
    if (invoiceId) {
      await page.goto(`${baseUrl}/invoices/details/${invoiceId}`);
    } else if (quotationId) {
      await page.goto(`${baseUrl}/quotations/details/${quotationId}`);
    } else if (url) {
      await page.goto(url);
    }

    await waitForSpinnerToDisappear();

    await page.locator('div[class="react-pdf__Document"]').first().waitFor();

    await page
      .locator('div[class*="react-pdf__Page__textContent"]')
      .first()
      .waitFor();

    if (assertText) {
      const pdfDocument = page
        .locator('div[class="react-pdf__Document"]')
        .first();
      await expect(
        pdfDocument.locator(`text=${assertText}`).first(),
      ).toBeVisible();
    }

    // wait for 2 seconds to make sure the page is fully loaded
    await page.waitForTimeout(2000);

    await percySnapshot(page, name, {
      widths: [1280],
      minHeight: 1200,
      scope: 'div[class^="react-pdf__Document"]',
    });
  };

  test('full invoice pdf', async ({page, waitForSpinnerToDisappear}) => {
    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Full Invoice PDF',
      invoiceId: 'ecc1b104-1a7f-4e8c-935d-28252d32d33f',
      assertText: 'Automatically assigned',
    });
  });

  test('partial invoice pdf', async ({page, waitForSpinnerToDisappear}) => {
    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Partial Invoice PDF',
      invoiceId: '578a95ee-de4c-4019-9147-18dd338a575e',
      assertText: 'Automatically assigned',
    });
  });

  test('upfront invoice pdf', async ({page, waitForSpinnerToDisappear}) => {
    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Upfront Invoice PDF',
      invoiceId: '02584a12-5e18-4c82-8cdd-9df82ab3ebd2',
      assertText: 'INVET1118',
    });
  });

  test('credit note pdf', async ({page, waitForSpinnerToDisappear}) => {
    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Credit Note PDF',
      invoiceId: '7c05566b-d04f-444e-beac-e01bd7f0c65a',
      assertText: 'Automatically assigned',
    });
  });

  test('quotation pdf', async ({page, waitForSpinnerToDisappear}) => {
    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Quotation PDF',
      quotationId: '4e69c528-6301-43f1-a53a-fe7da7200a21',
      assertText: 'Q003168',
    });
  });

  test('job overview pdf', async ({
    page,
    waitForSpinnerToDisappear,
    copyPdfToPublic,
  }) => {
    await page.goto(
      `${baseUrl}/orders/details/cd470173-125f-461f-984e-409665659fd1?tab=0`,
    );
    await waitForSpinnerToDisappear();

    // Set up download handling
    const downloadPromise = page.waitForEvent('download');
    await page
      .locator('button:has-text("Download Job Overview")')
      .first()
      .click();
    const download = await downloadPromise;

    // Copy PDF to public folder for serving
    const filename = await copyPdfToPublic(download);

    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Job Overview PDF',
      url: `${pdfViewerUrl}${filename}`,
      assertText: 'OR00014086',
    });
  });

  test('work report pdf', async ({
    page,
    waitForSpinnerToDisappear,
    copyPdfToPublic,
  }) => {
    await page.goto(
      `${baseUrl}/orders/details/cd470173-125f-461f-984e-409665659fd1?tab=1`,
    );
    await waitForSpinnerToDisappear();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download")').click();
    const download = await downloadPromise;

    const filename = await copyPdfToPublic(download);

    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Work Report PDF',
      url: `${pdfViewerUrl}${filename}`,
      assertText: 'WR00000169',
    });
  });

  test('checklist pdf', async ({
    page,
    waitForSpinnerToDisappear,
    copyPdfToPublic,
  }) => {
    await page.goto(
      `${baseUrl}/orders/details/cd470173-125f-461f-984e-409665659fd1?tab=2`,
    );

    const downloadPromise = page.waitForEvent('download');
    await expect(page.locator('button:has-text("Download")')).toBeEnabled();
    await page.locator('button:has-text("Download")').click();
    const download = await downloadPromise;

    const filename = await copyPdfToPublic(download);

    await takeSnapshot({
      page,
      waitForSpinnerToDisappear,
      name: 'Checklist PDF',
      url: `${pdfViewerUrl}${filename}`,
      assertText: 'CL00000098',
    });
  });
});
