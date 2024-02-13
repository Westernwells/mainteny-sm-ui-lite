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
      const propertyOwners = `${
        Cypress.env().REACT_APP_API_URL
      }/api/propertyOwners?*`;

      cy.intercept('GET', propertyOwners).as('propertyOwnersApi');

      AppTopBarPage.selectLanguage('English');

      CustomerPage.visit();
    });
  });

  it('should create new customer', () => {
    cy.contains('button', 'New Customer').eq(0).click();
    CustomerPage.fillFirstStep();
    CustomerPage.next();
    CustomerPage.fillSecondStep();
    CustomerPage.next();
    CustomerPage.fillThirdStep();
  });

  it('should delete created customer', () => {
    cy.wait('@propertyOwnersApi', {timeout: 15000})
      .its('response')
      .then((response) => {
        const {body: propertyOwners} = response;
        if (propertyOwners.data.length) {
          cy.get('[data-testid="DeleteIcon"]').eq(0).click();
          cy.contains('Confirm');
          cy.get('[data-test-id="remove"]').click();
          cy.contains('Customer deleted successfully');
        }
      });
  });
});
