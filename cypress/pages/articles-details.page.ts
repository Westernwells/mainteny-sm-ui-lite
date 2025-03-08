import {navigateCy} from '../utils/utils';

export default class ArticlesPage {
  static visit = () => {
    navigateCy('inventory', 'articles-&-suppliers');
    cy.waitForSpinnerToDisappear();
  };

  static navigateToDetailsPage = () => {
    cy.get('td[role="cell"][data-field="TYPE"]').eq(1).click({force: true});
  };

  static orderArticle = () => {
    cy.get('[data-test-id="orderArticle"]').click();
  };

  static openDeleteArticleModal = () => {
    cy.get('button[data-testid="articleDelete"]').click();
  };

  static deleteArticle = () => {
    cy.contains('button', 'Yes').click();
    cy.contains('Article deleted successfully');
  };

  static openArticleDialog = (dialogTitle: string, eqValue: number) => {
    cy.get('[data-testid="CreateIcon"]').eq(eqValue).click();
    cy.contains(dialogTitle);
  };

  static saveArticleDetail = (successMessage: string) => {
    cy.get('button').contains('Save').click();
    cy.contains(successMessage);
  };
}
