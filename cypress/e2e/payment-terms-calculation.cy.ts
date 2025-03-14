import {ServiceOrderTypeKeys} from 'models/service-order';
import AppTopBarPage from '../pages/appTopBar.page';
import OrdersPage from '../pages/orders.page';
import NewServiceJobPage from '../pages/new-service.page';
import {randomEnumKey} from '../utils/utils';
import InvoiceEditPage from '../pages/invoice-edit.page';

describe('Payment Terms Calculation', () => {
    beforeEach(() => {
        const getServiceCompany = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`;
        cy.intercept('GET', getServiceCompany).as('getServiceCompany');
        cy.login();
        AppTopBarPage.selectLanguage('English');
    });

    const createJobAndOpenInvoice = (invoiceType: 'Partial Invoice' | 'Upfront Invoice' | 'Final Invoice') => {
        OrdersPage.visit();
        cy.waitForSpinnerToDisappear();
        cy.contains('button', 'New Job').click();
        const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
        cy.contains('li', randomJobType).click();
        cy.waitForSpinnerToDisappear();
        cy.get('[role="cell"]').first().click();
        cy.contains('button', 'Next').click();
        NewServiceJobPage.selectADueDate();
        NewServiceJobPage.selectADateTimeAndTechnician();
        cy.contains('button', 'Next').click();
        cy.contains('button', 'Submit').click();
        cy.contains('Order scheduled successfully');

        // Create invoice
        cy.get('[data-testid="add-invoice"]').click();
        cy.contains('label', invoiceType).click();
        cy.contains('button', 'Create').click();
    };

    const addArticleAndSetAmount = ({index = 0, amount, quantity, vat}: {index: number; amount: number; quantity: number; vat: number}) => {
        cy.contains('button', 'Add Article').click();
        cy.get(`tr[data-rbd-draggable-id^="${index}"]`).within(() => {
            cy.get(`div[test-id="name-${index}"]`).within(() => {
                cy.get('div[contenteditable="true"]').focus().click().wait(1000).realType('Test Article');
            });
            cy.get('input[name="quantity"]').clear().type(`${quantity}`);
            cy.get('input[name="unitAmount.netAmount"]').clear().type(`{selectAll}${amount}`);

            cy.get(`div[id="unitAmount.vatId-${index}"]`).click();
            cy.document().its('body').find(`ul[aria-labelledby="select-tax-label-${index}"] li[role="option"]`).contains(`${vat}%`).click();
        });
    };

    const deleteAllFoundArticles = (rowCount: number) => {
        if (rowCount < 1) return;
        cy.get('table[aria-label="articles section table"] [data-testid="DeleteIcon"]').first().click();
        deleteAllFoundArticles(rowCount - 1);
    };

    it('should calculate correct payment terms for Partial Invoice', () => {
        createJobAndOpenInvoice('Partial Invoice');

        cy.get('table[aria-label="articles section table"] [data-testid="DeleteIcon"]').then((rows) => deleteAllFoundArticles(rows.length));

        addArticleAndSetAmount({index: 0, amount: 1000, quantity: 1, vat: 19});

        cy.get('input[id="partial-amount"]').clear().type('500');

        InvoiceEditPage.openPaymentTermsDialog();
        cy.contains('e2e test payment term').click();
        cy.contains('button', 'Confirm').click();
        const paymentTerm = InvoiceEditPage.getPaymentTermsField().find('div[role="textbox"]').invoke('text');
        paymentTerm.should('contain', 'e2e test payment term');

        const getInvoice = `${Cypress.env().REACT_APP_API_URL}/api/invoices/*`;
        cy.intercept('GET', getInvoice).as('getInvoice');
        cy.contains('button', 'Save').click();
        cy.wait('@getInvoice');

        cy.contains('Loading PDF').should('exist');
        cy.contains('Loading PDF').should('not.exist');

        cy.get('div[class^="react-pdf__Document"]')
            .first()
            .within(() => {
                cy.contains('e2e test payment term');
                cy.contains('€595.00');
                cy.contains('10% discount (€59.50)');
                cy.contains('€535.50');
                cy.contains('20% discount (€119.00)');
                cy.contains('€476.00');
            });
    });
});
