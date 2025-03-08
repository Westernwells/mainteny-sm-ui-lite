import {
  ArticleBasicFormModel,
  ArticleDescriptionFormModel,
  ArticleStockFormModel,
} from '../../src/models/articleForm';
import {navigateCy} from '../utils/utils';

export default class ArticlesPage {
  static visit = () => {
    navigateCy('inventory', 'articles-&-suppliers');
    cy.waitForSpinnerToDisappear();
  };

  static fillBasicDetails = (article: ArticleBasicFormModel) => {
    cy.fillRichTextField('Name', article.name);
    cy.get('input[name="externalId"]').type(article.externalId);
    cy.get('input[name="category"]').type(article.category);
    cy.get('input[name="manufacturer"]').type(article.manufacturer);
    cy.get('input[name="model"]').type(article.model);
    cy.get('input[name="unitPurchaseVat"]')
      .clear()
      .type(article.unitPurchaseVat.toString());
    cy.get('input[name="unitSellingVat"]')
      .clear()
      .type(article.unitSellingVat.toString());
    cy.get('div[id="select-unit"]').click();
    cy.get('li[role="option"]').contains(article.unit).click();
    cy.get('input[name="storageLocation"]').type(article.storageLocation);
    cy.get('div[inputmode="numeric"]')
      .contains('Purchase Price')
      .parent()
      .find('input')
      .type(article.unitPurchaseAmount.toString());
    cy.get('div[inputmode="numeric"]')
      .contains('Selling Price')
      .parent()
      .find('input')
      .type(article.unitSellingAmount.toString());
    cy.get('div[data-testid="article-type-selector"]').click();
    cy.get('li[role="option"]')
      .contains(article.type, {matchCase: false})
      .click();
  };

  static fillDescription = (article: ArticleDescriptionFormModel) => {
    cy.fillRichTextField('Description', article.description);
  };

  static fillStockDetails = (article: ArticleStockFormModel) => {
    cy.get('input[name="maxStock"]').clear().type(article.maxStock.toString());
    cy.get('input[name="currentStock"]')
      .clear()
      .type(article.currentStock.toString());
    cy.get('input[name="minOrderQuantity"]')
      .clear()
      .type(article.minOrderQuantity.toString());
    cy.get('input[name="minStock"]').clear().type(article.minStock.toString());
  };

  static chooseSupplier = (supplierName: string) => {
    cy.get('input[name="supplierId"').parent().click();
    cy.get('li[role="option"]').contains(supplierName).click();
  };

  static goNext = () => {
    cy.get('button').contains('Next').click();
    cy.wait(200);
  };

  static saveArticle = () => {
    cy.get('button').contains('Submit').click();
  };
}
