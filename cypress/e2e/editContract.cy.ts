import LoginPage from '../pages/login.page';
import AppTopBarPage from '../pages/appTopBar.page';
import ContractsPage from '../pages/contracts.page';

describe('Edit Contracts', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

      const elevatorApi = `${
        Cypress.env().REACT_APP_API_URL
      }/api/contracts?order=DESC&orderBy=CREATED_TIME&pageIndex=0&pageSize=25&query=&serviceCompanyId=*`;
      cy.intercept('GET', elevatorApi).as('contractApi');

      ContractsPage.visit();
    });
  });

  it('validate and submit data', () => {
    ContractsPage.navigateToDetailsPage();
    ContractsPage.openDialog();
    const outside = cy.get('#alert-dialog-title');
    cy.get('#typeSelect').click();
    cy.get('#typeSelect').then((input) => {
      const val = input.val();
      if (val === 'PREMIUM') {
        cy.get('[data-value="BASIC"]').click();
      } else {
        cy.get('[data-value="PREMIUM"]').click();
      }
      cy.get('input[name="annualPriceAdjustmentPercentage"]').type('42');
      cy.get('input[name="externalId"]').type('42');
      cy.get('input[name="visitsNumber"]').type('7');
      outside.click();
      cy.contains('button', 'Save').should('not.be.disabled').click();
      cy.contains('Contract updated');
    });
  });
});
