export default class ContractsPage {
  static visit = () => {
    cy.visit(`/contracts`, {
      failOnStatusCode: false,
    });
  };

  static navigateToDetailsPage = () => {
    cy.get('div[data-colindex="1"]').eq(2).click();
  };

  static openDialog = () => {
    cy.get('[data-testid="EditIcon"]').eq(0).click();
    cy.contains('Edit Contract');
  };
}
