import {Download, Page} from '@playwright/test';
import {test, expect} from '../fixtures';

test.describe('Quotation Details', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    await navigatePW('finance', 'quotations');
    await waitForSpinnerToDisappear();
  });

  const filterQuotationTableByStatus = async (page: Page, status: string) => {
    const filteredQuotationsPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/quotations?') &&
        response.url().includes(`status=${status.toUpperCase()}`) &&
        response.request().method() === 'GET',
    );
    await page
      .locator('button', {hasText: new RegExp(`^${status}[a-zA-Z]*`)})
      .click({force: true});
    await filteredQuotationsPromise;
    // small delay to ensure the table is filtered
    await page.waitForTimeout(1000);
  };

  const navigateToFirstQuotation = async (page: Page) => {
    await page.locator('tbody tr').first().click();
  };

  const verifyDownloadedPDF = async (
    page: Page,
    downloadPromise: Promise<Download>,
    copyPdfToPublic: (download: Download) => Promise<string>,
    quotationNumber: string,
  ) => {
    const download = await downloadPromise;

    const filename = await copyPdfToPublic(download);

    const baseUrl = 'http://localhost:5173';
    const pdfViewerUrl = `${baseUrl}/pdf-viewer?filename=`;
    await page.goto(`${pdfViewerUrl}${filename}`);

    await page.locator('div[class="react-pdf__Document"]').first().waitFor();

    await page
      .locator('div[class*="react-pdf__Page__textContent"]')
      .first()
      .waitFor();

    await expect(page.locator(`text=${quotationNumber}`).first()).toBeVisible();
  };

  test('from primary action', async ({page, copyPdfToPublic}) => {
    await filterQuotationTableByStatus(page, 'Accepted');
    await navigateToFirstQuotation(page);
    const quotationNumber =
      (await page
        .locator('h6[data-testid="quotation-number"]')
        .textContent()) || '';

    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator(
      'button[data-testid="primary-button"]:has-text("Download")',
    );
    await expect(downloadButton).not.toBeDisabled();
    await downloadButton.click();

    await verifyDownloadedPDF(
      page,
      downloadPromise,
      copyPdfToPublic,
      quotationNumber,
    );
  });

  test('from top right download quotation action', async ({
    page,
    copyPdfToPublic,
  }) => {
    await filterQuotationTableByStatus(page, 'Accepted');
    await navigateToFirstQuotation(page);
    const quotationNumber =
      (await page
        .locator('h6[data-testid="quotation-number"]')
        .textContent()) || '';

    const downloadPromise = page.waitForEvent('download');
    const downloadQuotationButton = page.locator('text=Download Quotation');
    await expect(downloadQuotationButton).toBeVisible();
    await downloadQuotationButton.click();

    await verifyDownloadedPDF(
      page,
      downloadPromise,
      copyPdfToPublic,
      quotationNumber,
    );
  });

  test('from action menu', async ({page, copyPdfToPublic}) => {
    await filterQuotationTableByStatus(page, 'Draft');
    await navigateToFirstQuotation(page);
    const quotationNumber =
      (await page
        .locator('h6[data-testid="quotation-number"]')
        .textContent()) || '';

    // Wait for PDF to be rendered
    const pdfTextContent = page
      .locator('div[class^="react-pdf__Page__textContent"]')
      .first();
    await expect(pdfTextContent).toBeVisible();

    // Open action menu
    await page.locator('svg[data-testid="MoreVertIcon"]').first().click();

    const menu = page.locator('ul[role="menu"]');
    await expect(menu).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    const downloadMenuItem = menu.locator(
      'li[role="menuitem"]:has-text("Download")',
    );
    await expect(downloadMenuItem).not.toBeDisabled();
    await downloadMenuItem.click({force: true});

    await verifyDownloadedPDF(
      page,
      downloadPromise,
      copyPdfToPublic,
      quotationNumber,
    );
  });
});
