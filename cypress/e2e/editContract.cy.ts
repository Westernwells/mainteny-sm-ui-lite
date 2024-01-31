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

      const contractInfoURL = `${
        Cypress.env().REACT_APP_API_URL
      }/api/contracts/*`;
      cy.intercept('GET', contractInfoURL).as('contractInfoApi');

      ContractsPage.visit();
    });
  });

  it('validate data', () => {
    ContractsPage.navigateToDetailsPage();

    cy.wait('@contractInfoApi', {timeout: 15000})
      .its('response')
      .then((response) => {
        const {body: contractData} = response;

        ContractsPage.openDialog();
        cy.wait(1500);
        const outside = cy.get('#alert-dialog-title');

        const nextAnnualPrice: string = String(
          (contractData?.additionalInfo?.annualPriceAdjustmentPercentage || 0) +
            1,
        );
        cy.get('input[name="annualPriceAdjustmentPercentage"]')
          .clear()
          .type(nextAnnualPrice);
        outside.click();
        cy.contains('button', 'Save').should('not.be.disabled');
      });
  });
});
