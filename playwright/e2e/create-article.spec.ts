import {Page} from '@playwright/test';
import {test, expect} from '../fixtures';
import {ArticleType} from '../../src/models/article';
import {
  ArticleBasicFormModel,
  ArticleDescriptionFormModel,
  ArticleStockFormModel,
} from '../../src/models/articleForm';
import {getUniqueId} from '../../src/utils/utils';

interface ICreateArticleForm {
  firstStep: ArticleBasicFormModel;
  secondStep: ArticleDescriptionFormModel;
  thirdStep: ArticleStockFormModel;
}

const validArticle: ICreateArticleForm = {
  firstStep: {
    name: 'Test Article',
    externalId: getUniqueId(),
    category: 'Test Category',
    manufacturer: 'Test Manufacturer',
    model: 'Test Model',
    unitPurchaseVat: '7',
    unitSellingVat: '19',
    unitPurchaseAmountCurrency: 'EUR',
    unitSellingAmountCurrency: 'EUR',
    unit: 'pcs',
    storageLocation: 'Test Location',
    type: ArticleType.MATERIAL,
    unitPurchaseAmount: '300',
    unitSellingAmount: '500',
  },
  secondStep: {
    description: 'Test Description',
  },
  thirdStep: {
    suppliers: [],
    currentStock: 5,
    maxStock: 10,
    minOrderQuantity: 1,
    minStock: 0,
  },
};

test.describe('Create Article', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('inventory', 'articles-&-suppliers');
    await waitForSpinnerToDisappear();
  });

  const fillBasicDetails = async (
    page: Page,
    article: ArticleBasicFormModel,
  ) => {
    // Fill in text fields
    await page.locator('input[name="name"]').fill(article.name);
    await page.locator('input[name="externalId"]').fill(article.externalId);
    await page.locator('input[name="category"]').fill(article.category);
    await page.locator('input[name="manufacturer"]').fill(article.manufacturer);
    await page.locator('input[name="model"]').fill(article.model!);

    // Select Purchase VAT from MUI Select
    await page.locator('#mui-component-select-unitPurchaseVat').click();
    await page
      .locator(`li[role="option"]:has-text("${article.unitPurchaseVat}%")`)
      .click();

    // Select Selling VAT from MUI Select
    await page.locator('#mui-component-select-unitSellingVat').click();
    await page
      .locator(`li[role="option"]:has-text("${article.unitSellingVat}%")`)
      .click();

    // Select Unit
    await page.locator('div[id="select-unit"]').click();
    await page.locator(`li[role="option"]:has-text("${article.unit}")`).click();

    // Fill the storage location
    await page
      .locator('input[name="storageLocation"]')
      .fill(article.storageLocation);

    // Fill numeric fields for purchase/selling price
    const purchasePriceInput = page
      .locator('div[inputmode="numeric"]:has-text("Purchase Price")')
      .locator('input');
    await purchasePriceInput.fill(article.unitPurchaseAmount.toString());

    const sellingPriceInput = page
      .locator('div[inputmode="numeric"]:has-text("Selling Price")')
      .locator('input');
    await sellingPriceInput.fill(article.unitSellingAmount.toString());

    // Select Article Type
    await page.locator('div[data-testid="article-type-selector"]').click();
    await page.locator(`li[role="option"]:has-text("${article.type}")`).click();
  };

  const fillStockDetails = async (
    page: Page,
    article: ArticleStockFormModel,
  ) => {
    await page.locator('input[name="maxStock"]').clear();
    await page
      .locator('input[name="maxStock"]')
      .fill(article.maxStock.toString());

    await page.locator('input[name="currentStock"]').clear();
    await page
      .locator('input[name="currentStock"]')
      .fill(article.currentStock.toString());

    await page.locator('input[name="minOrderQuantity"]').clear();
    await page
      .locator('input[name="minOrderQuantity"]')
      .fill(article.minOrderQuantity.toString());

    await page.locator('input[name="minStock"]').clear();
    await page
      .locator('input[name="minStock"]')
      .fill(article.minStock.toString());
  };

  const chooseSupplier = async (page: Page, supplierName: string) => {
    await page.locator('input[name="supplierId"]').locator('..').click();
    await page.waitForSelector('li[role="option"]', {state: 'visible'});
    await page
      .locator(`li[role="option"]:has-text("${supplierName.trim()}")`)
      .click();
  };

  const goNext = async (page: Page) => {
    await page.locator('button:has-text("Next")').click();
  };

  const saveArticle = async (page: Page) => {
    await page.locator('button:has-text("Submit")').click();
  };

  const navigateToDetailsPage = async (page: Page) => {
    await page
      .locator('td[role="cell"][data-field="TYPE"]')
      .nth(1)
      .click({force: true});
  };

  test('should create article', async ({page, fillTiptapRichTextField}) => {
    await page.locator('button:has-text("New Article")').click();

    await fillBasicDetails(page, validArticle.firstStep);
    await goNext(page);

    await fillTiptapRichTextField(
      'Description',
      validArticle.secondStep.description!,
    );
    const articleSuppliersAPIPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/serviceCompanies/') &&
        response.url().includes('/articleSuppliers') &&
        response.request().method() === 'GET',
    );
    await goNext(page);

    const response = await articleSuppliersAPIPromise;
    const responseData = await response.json();
    const suppliers = responseData.data;
    const firstSupplier = suppliers.find(
      (supplier: {name?: string}) => supplier?.name,
    );

    if (firstSupplier) {
      await fillStockDetails(page, validArticle.thirdStep);
      await chooseSupplier(page, firstSupplier.name);
      await saveArticle(page);
      await expect(
        page.locator('text=Article created successfully'),
      ).toBeVisible();
    }
  });

  test('should order article', async ({page, fillRichTextField}) => {
    await navigateToDetailsPage(page);
    await page.locator('button:has-text("Order Article")').click();

    // Check and select supplier if needed
    const selectSupplierButton = page.locator(
      'button:has-text("Select Supplier")',
    );
    if (await selectSupplierButton.isVisible()) {
      await selectSupplierButton.click();
      await page.locator('text=SUP00002').click();
    }

    await fillRichTextField('Description', 'Test Description');

    const supplierArticleNumber = getUniqueId();
    await page
      .locator('div[data-testid="supplier-article-number"] input')
      .clear();
    await page
      .locator('div[data-testid="supplier-article-number"] input')
      .fill(supplierArticleNumber);
    // Blur the input to ensure the value is committed (flakiness fix)
    await page
      .locator('div[data-testid="supplier-article-number"] input')
      .press('Tab');

    // Wait for the Save button to become enabled before clicking
    const saveButton = page.locator('button:has-text("Save")');
    try {
      await expect(saveButton).toBeEnabled({timeout: 10000});
    } catch {
      // If the button is still disabled, supplier might not have been selected due to late rendering. Retry supplier selection.
      const retrySelectSupplierBtn = page.locator(
        'button:has-text("Select Supplier")',
      );
      if (await retrySelectSupplierBtn.isVisible()) {
        await retrySelectSupplierBtn.click();
        await page.locator('text=SUP00002').click();
      }
      // Re-assert that Save becomes enabled after selecting supplier.
      await expect(saveButton).toBeEnabled();
    }

    // Set up API interceptors
    const createArticleOrderAPIPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/articleOrders') &&
        response.request().method() === 'POST',
    );

    const articleOrderAPIPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/articleOrders/') &&
        response.request().method() === 'GET',
    );

    const downloadPromise = page.waitForEvent('download');

    await page.locator('button:has-text("Save")').click();
    await createArticleOrderAPIPromise;

    await expect(
      page.locator('text=PDF generation is in progress'),
    ).toBeVisible();
    await downloadPromise;
    await articleOrderAPIPromise;

    // Check PDF content
    await expect(
      page.locator('div[class^="react-pdf__Page__textContent"]'),
    ).toContainText(supplierArticleNumber);

    // Check print function
    await page.locator('button:has-text("Print order")').click();
    await expect(page.locator('#printJS-Modal')).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
