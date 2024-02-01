import {InvoiceStatusView} from '../../src/models/invoice';
import AppTopBarPage from '../pages/appTopBar.page';
import InvoicesPage from '../pages/invoices.page';
import LoginPage from '../pages/login.page';

describe('Mark invoice as paid', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

      const invoicesURL = `${
        Cypress.env().REACT_APP_API_URL
      }/api/serviceCompanies/*/invoices?pageIndex=0&pageSize=25&query=&status=NOT_PAID`;
      cy.intercept('GET', invoicesURL).as('invoicesApi');

      InvoicesPage.visit();
      InvoicesPage.filterInvoicesListByStatus(InvoiceStatusView.NOT_PAID);
    });
  });

  it('should open modal and mark invoice as paid successfully', () => {
    cy.wait('@invoicesApi', {timeout: 15000})
      .its('response')
      .then((response) => {
        const {
          body: {data},
        } = response;
        if (!data.length) return;
        InvoicesPage.openPaymentModal();
        InvoicesPage.markInvoiceAsPaid();
        cy.contains('button', 'Okay').click();

        cy.contains('Invoice marked as paid!');
      });
  });
});
