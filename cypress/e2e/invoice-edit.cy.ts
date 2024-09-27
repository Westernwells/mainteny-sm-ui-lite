import {DiscountType, PaymentType, InvoiceItemPaymentType} from 'models/invoice';
import InvoiceEditPage from '../pages/invoice-edit.page';
import AppTopBarPage from '../pages/appTopBar.page';
import invoiceDetails from '../fixtures/invoiceDetails.json';
import invoiceAmountDetails from '../fixtures/invoiceAmountDetails.json';
import {getFormattedPaymentValues, replacePaymentTermsPlaceholders} from '../utils/payment-terms';

const mapJsonToEnum = (json: any): any => {
    json.discount.type = DiscountType[json.discount.type as keyof typeof DiscountType];
    json.payment.type = PaymentType[json.payment.type as keyof typeof PaymentType];

    json.items = json.items.map((item: any) => ({
        ...item,
        discount: {
            ...item.discount,
            type: DiscountType[item.discount.type as keyof typeof DiscountType],
        },
        payment: {
            ...item.payment,
            type: InvoiceItemPaymentType[item.payment.type as keyof typeof InvoiceItemPaymentType],
        },
    }));

    return json;
};

const mockInvoiceDetails = (invoiceId: string) => {
    cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/invoices/${invoiceId}`, {
        statusCode: 200,
        body: invoiceDetails,
    }).as('getInvoiceDetails');
};

const mockInvoiceAmountDetails = (invoiceId: string) => {
    cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/invoices/${invoiceId}/amount`, {
        statusCode: 200,
        body: invoiceAmountDetails,
    }).as('getInvoiceAmountDetails');
};

const mockInvoiceUpdate = (invoiceId: string) => {
    cy.intercept('PUT', `${Cypress.env().REACT_APP_API_URL}/api/invoices/${invoiceId}`, {
        statusCode: 200,
        body: {success: true},
    }).as('updateInvoice');
};

const invoiceAmountDetailsWithEnums = mapJsonToEnum(invoiceAmountDetails);

describe('Invoice Edit Flow with Payment Terms', () => {
    const INVOICE_ID = '58191ee4-5e63-4fc1-9b61-dead56321fc9';

    beforeEach(() => {
        cy.login();
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');

        AppTopBarPage.selectLanguage('English');

        mockInvoiceDetails(INVOICE_ID);
        mockInvoiceAmountDetails(INVOICE_ID);
        mockInvoiceUpdate(INVOICE_ID);
    });

    it('should validate Payment Terms text with correct placeholders replaced', () => {
        InvoiceEditPage.visit(INVOICE_ID);

        // Wait for the invoice details to load
        cy.wait('@getInvoiceDetails').then(({response}) => {
            const invoice = response.body;
            const invoiceAmountDetail = invoiceAmountDetailsWithEnums;

            cy.contains('If you pay before {DUE_DATE}').should('exist');
            cy.contains('{DISCOUNT_AMOUNT}').should('exist');
            cy.contains('{INVOICE_AMOUNT}').should('exist');
            cy.contains('{PAYMENT_AMOUNT}').should('exist');

            InvoiceEditPage.saveInvoice();
            
            // After saving, calculate the dynamic values
            const discountValues = getFormattedPaymentValues(invoice.additionalInfo.paymentTerm, invoice, invoiceAmountDetail, {
                code: 'EUR',
                fractionDigits: 2,
                symbol: '€',
            });

            const formattedTerms = replacePaymentTermsPlaceholders(invoice.additionalInfo?.paymentTerm?.term, discountValues, {
                code: 'EUR',
                fractionDigits: 2,
                symbol: '€',
            });

            InvoiceEditPage.verifyPaymentTerms(formattedTerms);
        });
    });
});
