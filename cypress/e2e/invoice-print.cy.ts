import AppTopBarPage from '../pages/appTopBar.page';
import {navigateCy} from '../utils/utils';
import InvoicesPage from '../pages/invoices.page';

describe('Invoice flow', () => {
    beforeEach(() => {
        const getServiceCompany = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`;
        cy.intercept('GET', getServiceCompany).as('getServiceCompany');
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
        });
    });

    const visitAndCreateInvoice = ({setExpiredDueDate, hasDueDate}: {hasDueDate?: boolean; setExpiredDueDate?: boolean}) => {
        navigateCy('finance', 'invoices');
        InvoicesPage.createInvoice({setExpiredDueDate, hasDueDate});
        cy.get('span[role="progressbar"]').should('not.exist');
    };

    describe('Invoice printing flow', () => {
        it('should not print if there is no due date', () => {
            visitAndCreateInvoice({hasDueDate: false});
            InvoicesPage.printInvoices({hasDueDate: false});
        });

        it('should print invoice if there is a valid due date', () => {
            visitAndCreateInvoice({hasDueDate: true});
            InvoicesPage.printInvoices({hasDueDate: true});
        });
    });
});
