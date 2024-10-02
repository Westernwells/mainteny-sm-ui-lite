export default class ArticlesPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="articles-nav-item"]').click();
  };

  static navigateToDetailsPage = () => {
    cy.get('div[data-colindex="1"]').eq(1).click();
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
