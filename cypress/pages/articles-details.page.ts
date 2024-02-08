export default class ArticlesPage {
  static visit = () => {
    cy.visit(`/articles`, {
      failOnStatusCode: false,
    });
  };

  static navigateToDetailsPage = () => {
    cy.get('div[data-colindex="1"]').eq(1).click();
  };

  static orderArticle = () => {
    cy.get('[data-test-id="orderArticle"]').click();
  };

  static openDeleteArticleModal = () => {
    cy.get('[data-test-id="articleDelete"]').click();
  };

  static deleteArticle = () => {
    cy.get('[data-test-id="remove"]').click()
    cy.contains('Article deleted successfully')
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
