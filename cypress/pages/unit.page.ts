export default class UnitsPage {
  static visit = () => {
    cy.visit(`/units`, {
      failOnStatusCode: false,
    });
  };

  static navigateToDetailsPage = () => {
    cy.get('div[data-colindex="1"]').eq(0).click();
  };

  static openDialog = () => {
    cy.get('[data-testid="EditIcon"]').eq(1).click();
    cy.contains('Edit Unit Details');
  };
}
