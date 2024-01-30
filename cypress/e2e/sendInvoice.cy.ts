import InvoicesPage from '../pages/invoices.page';
import LoginPage from '../pages/login.page';
import { InvoiceStatusView } from '../../src/models/invoice';
import AppTopBarPage from '../pages/appTopBar.page';
import {getInvoicePDFStatuses, isDueDateInPast} from '../../src/utils/invoice-utils';


describe('Send Invoice via Email', () => {
    beforeEach(() => {
        LoginPage.visitLoginPage();
        const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
        cy.intercept('POST', loginURL).as('loginApi');
        LoginPage.login();

        cy.wait('@loginApi').then(() => {
            AppTopBarPage.selectLanguage('English');
      
            const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?pageIndex=0&pageSize=25&query=&status=DRAFT`;
            cy.intercept('GET', invoicesURL).as('invoicesApi');
            
            InvoicesPage.visit();
            InvoicesPage.filterInvoicesListByStatus(InvoiceStatusView.DRAFT);
        });
    });

    it('should send invoice and all form inputs are required', () => {
        cy.wait('@invoicesApi', { timeout: 15000 }).its('response').then(response => {
            const { body } = response;
            const invoicesData = body.data;

            // First valid invoice
            const validInvoice = invoicesData.find((invoice) => {
                const {isPDFsGenerated} = getInvoicePDFStatuses(invoice);
                return invoice?.dueDate && !isDueDateInPast(invoice) && isPDFsGenerated && invoice?.number;
            });

            // if valid invoice was found
            if(validInvoice){
                InvoicesPage.openSendInvoiceModalByInvoiceNumber(validInvoice?.number);
    
                cy.get('input[name="email"]').should('have.attr', 'required');
                cy.get('input[name="subject"]').should('have.attr', 'required');
                cy.get('textarea[name="content"]').should('have.attr', 'required');
    
                cy.fixture('invoices').then(invoices => InvoicesPage.fillInvoiceDetails(invoices.validInvoice))
                InvoicesPage.sendInvoice()
    
                cy.contains('Invoice sent successfully');
            }
        })
    });

    it('Should not be able to send email, if invoice.dueDate is empty(undefined) or expired', () => {
        cy.wait('@invoicesApi', { timeout: 15000 }).its('response').then(response => {
            const { body } = response;
            const invoicesData = body.data;

            // First invoice where invoice.dueDate is expired or undefined
            const invoiceWithDateIssues = invoicesData.find(invoice => {
                const {isPDFsGenerated} = getInvoicePDFStatuses(invoice);
                return !invoice?.dueDate || (!invoice?.dueDate && isDueDateInPast(invoice)) && isPDFsGenerated && invoice.number;
            });

            // if invoice with dueDate issues was found
            if(invoiceWithDateIssues?.number){
                InvoicesPage.openSendInvoiceModalByInvoiceNumber(invoiceWithDateIssues.number);
                cy.contains(!invoiceWithDateIssues.dueDate ? 'The due date is missing for this invoice' : 'The due date for the invoice has expired');
            }
        });
    });
});

