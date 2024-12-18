import InvoicesPage from '../pages/invoices.page';
import AppTopBarPage from '../pages/appTopBar.page';

describe('Send Invoice via Email', () => {
    beforeEach(() => {
        cy.login();

        AppTopBarPage.selectLanguage('English');

        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesApi');
        const sendInvoiceAPI = `${Cypress.env().REACT_APP_API_URL}/api/invoices/*/send`;
        cy.intercept('POST', sendInvoiceAPI).as('sendInvoiceAPI');

        InvoicesPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@invoicesApi');
    });

    it('should send invoice and all form inputs are required', () => {
        // create invoice
        InvoicesPage.createInvoice();

        cy.go('back');
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait(['@invoicesApi', '@invoicesApi', '@invoicesApi']);
        cy.wait(300); // Very small delay for the DOM to be updated, can be anything any small amount

        // send invoice
        cy.get('button[data-testid="invoice-action-menu-button"]').eq(0).click();
        cy.get('svg[data-testid="SendIcon"]').eq(0).click();
        cy.get('input[id="multiple-asynchronous-demo"]').should('have.attr', 'required');
        cy.get('input[name="subject"]').should('have.attr', 'required');
        cy.contains('label', 'Text *');
        cy.contains('label', 'Send to').click();
        cy.focused().type('{backspace}noman+1@mainteny.com{enter}');
        cy.get('div[contenteditable="true"]').type('I am Text!');
        cy.contains('button', 'Send email').click();
        cy.wait('@sendInvoiceAPI', {timeout: 30000});
        cy.contains('Invoice sent successfully');
    });
});
