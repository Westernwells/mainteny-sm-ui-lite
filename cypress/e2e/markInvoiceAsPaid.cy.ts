import {InvoiceStatusView} from 'models/invoice';
import AppTopBarPage from '../pages/appTopBar.page';
import InvoicesPage from '../pages/invoices.page';
import {ServiceCompany} from '../../src/models/service-company';
import InvoiceListingPage from '../pages/invoice-listing.page';

describe('Mark invoice as paid', () => {
    beforeEach(() => {
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`).as('invoicesApi');

            InvoicesPage.visit();
            cy.wait('@invoicesApi');
        });
    });

    it('should open modal and mark invoice as paid successfully', () => {
        InvoiceListingPage.filterInvoicesListByStatus(InvoiceStatusView.NOT_PAID);

        cy.wait('@invoicesApi');

        cy.get('tbody tr', {timeout: 10000}).should('have.length.greaterThan', 0);

        // Confirm that the first row is now "Sent"
        cy.get('tbody tr').first().find('[data-testid="status-chip"]').should('exist').should('contain.text', 'Sent');

        InvoicesPage.openPaymentModal();
        InvoicesPage.markInvoiceAsPaid();
        cy.contains('button', 'Okay').click();
        cy.contains('Invoice marked as paid!');
    });

    it('should show correct amount when user opens mark invoice as paid modal (even after search)', () => {
        InvoiceListingPage.filterInvoicesListByStatus(InvoiceStatusView.NOT_PAID);

        cy.wait('@invoicesApi');

        cy.get('tbody tr', {timeout: 10000}).should('have.length.greaterThan', 0);

        cy.wait('@serviceCompanyApi').then((interception) => {
            const serviceCompany = interception.response?.body as ServiceCompany;
            const {
                currencies: [firstCurrency],
            } = serviceCompany.settings;
            const {fractionDigits, code: currency} = firstCurrency;

            // Check paid amount for row 0
            InvoicesPage.verifyPaidAmountMatchesRow(0, currency, fractionDigits);

            // Click outside to close modal
            cy.get('body').click(0, 0);

            InvoicesPage.getRowByIndex(0)
                .find('td[role="cell"][data-field="NUMBER"]')
                .invoke('text')
                .then((invoiceId) => {
                    cy.get('input[placeholder^="Search"]').type(invoiceId);
                    cy.wait('@invoicesApi');
                    cy.get('span[role="progressbar"]').should('not.exist');
                    cy.wait(300);

                    InvoicesPage.verifyPaidAmountMatchesRow(0, currency, fractionDigits);
                });
        });
    });
});
