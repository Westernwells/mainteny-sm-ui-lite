import AppTopBarPage from '../pages/appTopBar.page';
import CustomerPage from '../pages/customer.page';
import LoginPage from '../pages/login.page';

describe('Customer', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      const technician = `${
        Cypress.env().REACT_APP_API_URL
      }/api/serviceCompanies/*/technicians?*`;

      const serviceOrders = `${
        Cypress.env().REACT_APP_API_URL
      }/api/serviceOrders/*`;

      cy.intercept('GET', serviceOrders).as('serviceOrdersApi');
      cy.intercept('GET', technician).as('technicianApi');

      AppTopBarPage.selectLanguage('English');

      CustomerPage.visit();
    });
  });

  it('validate Add basic info', () => {
    cy.contains('button', 'New Customer').eq(0).click();
    cy.get('input[name="name"]')
      .click()
      .parent()
      .siblings('p')
      .should('have.text', 'Customer Name is required');
    cy.contains('button', 'Next').should('be.disabled');
  });
});
