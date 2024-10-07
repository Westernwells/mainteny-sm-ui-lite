import AppTopBarPage from '../pages/appTopBar.page';
import InvoicesPage from '../pages/invoices.page';
import {extractNumbersFromCurrencyString} from '../utils/utils';
import {ServiceCompany} from '../../src/models/service-company';

describe('Mark invoice as paid', () => {
    beforeEach(() => {
        cy.login();
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');

        AppTopBarPage.selectLanguage('English');

        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesApi');

        InvoicesPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@invoicesApi');
    });

    it('should open modal and mark invoice as paid successfully', () => {
        InvoicesPage.createInvoice({setExpiredDueDate: false});
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait(['@invoicesApi', '@invoicesApi']);
        cy.wait(5000);
        InvoicesPage.sendInvoices();
        cy.go('back');
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@invoicesApi')
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
        InvoicesPage.createInvoice({setExpiredDueDate: false});
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait(['@invoicesApi', '@invoicesApi']);
        cy.wait(5000);
        InvoicesPage.sendInvoices();
        cy.go('back');
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@invoicesApi');
        InvoicesPage.createInvoice({setExpiredDueDate: false});
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait(['@invoicesApi', '@invoicesApi']);
        cy.wait(5000);
        InvoicesPage.sendInvoices();
        cy.go('back');
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@invoicesApi');
        cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount

        cy.wait('@serviceCompanyApi').then((interception) => {
            const serviceCompany = interception.response?.body as ServiceCompany;
            const {
                currencies: [firstCurrency],
            } = serviceCompany.settings;
            const {fractionDigits, code: currency} = firstCurrency;
            InvoicesPage.getRowByIndex(0)
                .find('div[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
                .invoke('text')
                .then((amount) => {
                    const amountWithoutCurrency = extractNumbersFromCurrencyString(amount);
                    const formattedAmountWithoutCurrency = amountWithoutCurrency.toLocaleString(currency, {maximumFractionDigits: fractionDigits});
                    InvoicesPage.getRowByIndex(0).find('button[aria-label="Payment"]').click();
                    InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', formattedAmountWithoutCurrency);
                });

            // click outside to close modal
            cy.get('body').click(0, 0);

            InvoicesPage.getRowByIndex(1)
                .find('div[role="cell"][data-field="TOTAL_NET_AMOUNT"]')
                .invoke('text')
                .then((amount) => {
                    const amountWithoutCurrency = extractNumbersFromCurrencyString(amount);
                    const formattedAmountWithoutCurrency = amountWithoutCurrency.toLocaleString(currency, {maximumFractionDigits: fractionDigits});
                    InvoicesPage.getRowByIndex(1).find('button[aria-label="Payment"]').click();
                    InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', formattedAmountWithoutCurrency);
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
                            const formattedAmountWithoutCurrency = amountWithoutCurrency.toLocaleString(currency, {
                                maximumFractionDigits: fractionDigits,
                            });
                            InvoicesPage.getRowByIndex(0).find('button[aria-label="Payment"]').click();
                            InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', formattedAmountWithoutCurrency);
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
                            const formattedAmountWithoutCurrency = amountWithoutCurrency.toLocaleString(currency, {
                                maximumFractionDigits: fractionDigits,
                            });
                            InvoicesPage.getRowByIndex(0).find('button[aria-label="Payment"]').click();
                            InvoicesPage.getInputByLabel('Paid amount (incl. VAT)').should('have.value', formattedAmountWithoutCurrency);
                        });
                });
        });
    });
});
