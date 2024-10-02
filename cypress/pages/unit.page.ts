export default class UnitsPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="units-nav-item"]').click();
  };

  static navigateToDetailsPage = () => {
    cy.get('div[data-colindex="1"]').eq(0).click();
  };

  static navigateToCreatePage = () => {
    cy.contains('p', 'New Unit').closest('button').click();
  };

  static openDialog = () => {
    cy.get('[data-testid="EditOutlinedIcon"]').eq(0).click();
    cy.contains('Edit General');
  };

  static getFieldByName = (name: string) => cy.get(`input[name=${name}]`);
}
