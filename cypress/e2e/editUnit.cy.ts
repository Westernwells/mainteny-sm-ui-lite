import LoginPage from '../pages/login.page';
import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';

describe('Edit Unit', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

      const elevatorApi = `${
        Cypress.env().REACT_APP_API_URL
      }/api/serviceCompanies/*/elevators?query=&pageIndex=0&pageSize=50`;
      cy.intercept('GET', elevatorApi).as('elevatorApi');

      UnitsPage.visit();
    });
  });

  it('should validate unit', () => {
    UnitsPage.navigateToDetailsPage();
    UnitsPage.openDialog();
    const categoryField = cy.get('input[name="category"]');
    const outside = cy.get('#alert-dialog-title');
    categoryField.clear();
    outside.click();
    categoryField
      .parent()
      .siblings('p')
      .should('have.text', 'Category is required');
    cy.get('button[type="button"]').should('be.disabled');
    categoryField.type('test1477');
    outside.click();
    cy.get('#combo-box-helper-text').should(
      'have.text',
      'Invalid unit category',
    );
  });

  it('validate and submit data', () => {
    UnitsPage.navigateToDetailsPage();
    UnitsPage.openDialog();
    const outside = cy.get('#alert-dialog-title');
    cy.get('input[name="category"]').click();
    cy.get('input[name="category"]').then((input) => {
      const val = input.val();
      if (val === 'Escalator') {
        cy.get('input[name="category"]').type('Elevator');
      } else {
        cy.get('input[name="category"]').type('Escalator');
      }
      cy.get('input[name="externalId"]').type('42');
      cy.get('input[name="manufacturer"]').type('42');
      cy.get('input[name="numberOfStops"]').type('7');
      cy.get('input[name="cabinType"]').type('test');
      outside.click();
      cy.contains('button', 'Save').should('not.be.disabled').click();
      cy.contains('Unit details updated successfully');
    });
  });
});
