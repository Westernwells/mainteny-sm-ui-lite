import LoginPage from '../pages/login.page';
import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';

describe('Create Unit', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

      UnitsPage.visit();
    });
  });

  it('submit unit', () => {
    UnitsPage.navigateToCreatePage();
    UnitsPage.getFieldByName('propertyOwnerId').click();
    cy.wait(100);
    cy.get('body').click(0, 0);
    UnitsPage.getFieldByName('propertyOwnerId')
      .parent()
      .siblings('p')
      .contains('Please select an existing customer');
    cy.wait(100);
    UnitsPage.getFieldByName('propertyOwnerId').click();
    cy.wait(100);
    cy.get('ul > li:nth-child(2)').click();
    cy.contains('button', 'Next').click();
    cy.wait(100);
    cy.get('input[name="address.fullName"]').type('Italy, texas', {delay: 150});
    cy.wait(200);
    cy.get('ul > li:nth-child(1)').click();
    cy.get('input[name="address.component.street"]').type('street', {
      delay: 150,
    });
    cy.contains('button', 'Next').click();
    cy.get('input[name="category"]').type('Elev', {delay: 150});
    cy.get('ul > li:nth-child(1)').click();
    cy.contains('button', 'Next').click();
    cy.wait(100);
    cy.get('input[name="lastVisitDate"]').click();
    cy.get('[role="gridcell"]').first().click();
    cy.get('input[name="lastInspectionDate"]').click();
    cy.get('[role="gridcell"]').eq(1).click();
    cy.get('[role="gridcell"]').eq(1).click();
    cy.get('body').click(0, 0);
    cy.get('input[name="serviceTime"]').type('4', {delay: 150});
    cy.get('input[name="technicianNumber"]').type('4', {delay: 150});
    cy.contains('button', 'Next').click();
    cy.wait(100);
    cy.contains('button', 'Submit').click();
    cy.contains('Unit created successfully');
  });
});
