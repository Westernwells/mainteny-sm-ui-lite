export default class CustomerPage {
  static visit = () => {
    cy.visit('/customer', {
      failOnStatusCode: false,
    });
  };
}
