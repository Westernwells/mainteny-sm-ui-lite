import {InvoiceStatusView} from '../../src/models/invoice';
import AppTopBarPage from '../pages/appTopBar.page';
import InvoicesPage from '../pages/invoices.page';
import {extractNumbersFromCurrencyString} from '../utils/utils';

describe('Mark invoice as paid', () => {
    beforeEach(() => {
        cy.login();

        AppTopBarPage.selectLanguage('English');

        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesApi');

        InvoicesPage.visit();
        cy.wait('@invoicesApi');
        InvoicesPage.filterInvoicesListByStatus(InvoiceStatusView.NOT_PAID);
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

    it('should show correct amount when user open mark invoice as paid modal (even after search)', () => {
        cy.get("span[role='progressbar']").should('exist');
        cy.wait('@invoicesApi');
        cy.get("span[role='progressbar']").should('not.exist');
        cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount

        InvoicesPage.getRowByIndex(0)
            .find('div[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
            .invoke('text')
            .then((amount) => {
                const amountWithoutCurrency = extractNumbersFromCurrencyString(amount);
                InvoicesPage.getRowByIndex(0).find('button[aria-label="Payment"]').click();
                InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', amountWithoutCurrency);
            });

        // click outside to close modal
        cy.get('body').click(0, 0);

        InvoicesPage.getRowByIndex(1)
            .find('div[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
            .invoke('text')
            .then((amount) => {
                const amountWithoutCurrency = extractNumbersFromCurrencyString(amount);
                InvoicesPage.getRowByIndex(1).find('button[aria-label="Payment"]').click();
                InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', amountWithoutCurrency);
            });

        // click outside to close modal
        cy.get('body').click(0, 0);

        InvoicesPage.getRowByIndex(0)
            .find('div[role="cell"][data-field="EXTERNAL_ID"]')
            .invoke('text')
            .then((invoiceId) => {
                // search for invoice
                cy.get('input[placeholder^="Search by"]').type(invoiceId);
                cy.get("span[role='progressbar']").should('exist');
                cy.wait('@invoicesApi');
                cy.get("span[role='progressbar']").should('not.exist');
                cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount
                InvoicesPage.getRowByIndex(0)
                    .find('div[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
                    .invoke('text')
                    .then((amount) => {
                        const amountWithoutCurrency = extractNumbersFromCurrencyString(amount);
                        InvoicesPage.getRowByIndex(0).find('button[aria-label="Payment"]').click();
                        InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', amountWithoutCurrency);
                    });
            });

        // click outside to close modal
        cy.get('body').click(0, 0);

        // clear search
        cy.get('input[placeholder^="Search by"]').clear();
        cy.get("span[role='progressbar']").should('exist');
        cy.wait('@invoicesApi');
        cy.get("span[role='progressbar']").should('not.exist');
        cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount

        InvoicesPage.getRowByIndex(1)
            .find('div[role="cell"][data-field="EXTERNAL_ID"]')
            .invoke('text')
            .then((invoiceId) => {
                // search for invoice
                cy.get('input[placeholder^="Search by"]').type(invoiceId);
                cy.get("span[role='progressbar']").should('exist');
                cy.wait('@invoicesApi');
                cy.get("span[role='progressbar']").should('not.exist');
                cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount
                InvoicesPage.getRowByIndex(0)
                    .find('div[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
                    .invoke('text')
                    .then((amount) => {
                        const amountWithoutCurrency = extractNumbersFromCurrencyString(amount);
                        InvoicesPage.getRowByIndex(0).find('button[aria-label="Payment"]').click();
                        InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', amountWithoutCurrency);
                    });
            });
    });
});
