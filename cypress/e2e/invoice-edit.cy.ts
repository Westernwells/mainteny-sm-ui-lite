import {DiscountType, PaymentType, InvoiceItemPaymentType} from 'models/invoice';
import {centsToMoney} from 'utils/currency';
import InvoiceEditPage from '../pages/invoice-edit.page';
import AppTopBarPage from '../pages/appTopBar.page';
import invoiceDetails from '../fixtures/invoiceDetails.json';
import invoiceAmountDetails from '../fixtures/invoiceAmountDetails.json';
import {getFormattedPaymentValues, replacePaymentTermsPlaceholders} from '../utils/payment-terms';
import InvoicesPage from '../pages/invoices.page';

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
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');

            mockInvoiceDetails(INVOICE_ID);
            mockInvoiceAmountDetails(INVOICE_ID);
            mockInvoiceUpdate(INVOICE_ID);
        });
    });

    it('should validate Payment Terms text with correct placeholders replaced', () => {
        InvoiceEditPage.visit(INVOICE_ID);

        // Wait for the invoice details to load
        cy.wait('@getInvoiceDetails').then(({response}) => {
            const invoice = response.body;
            const invoiceAmountDetail = invoiceAmountDetailsWithEnums;
            const currentCurrency = {
                code: 'EUR',
                fractionDigits: 2,
                symbol: '€',
            };
            const grossInvoiceAmount = centsToMoney(currentCurrency?.code!, invoiceAmountDetail?.amountAfterGlobalDiscount.grossAmount);

            cy.contains('If you pay before {DUE_DATE}').should('exist');
            cy.contains('{DISCOUNT_AMOUNT}').should('exist');
            cy.contains('{INVOICE_AMOUNT}').should('exist');
            cy.contains('{PAYMENT_AMOUNT}').should('exist');

            InvoiceEditPage.saveInvoice();
            cy.contains('Loading PDF').should('exist');
            cy.contains('Loading PDF').should('not.exist');

            // After saving, calculate the dynamic values
            const discountValues = getFormattedPaymentValues(
                invoice.additionalInfo.paymentTerm,
                invoice,
                invoiceAmountDetail,
                grossInvoiceAmount,
                currentCurrency,
            );

            const formattedTerms = replacePaymentTermsPlaceholders(invoice.additionalInfo?.paymentTerm?.term, discountValues, currentCurrency);

            InvoiceEditPage.verifyPaymentTerms(formattedTerms);
        });
    });

    it('should keep Material & Labor Cost text field value when customer or job is changed', () => {
        const laborCostText = 'Labor costs without VAT: {LABOR_COST}';
        const materialCostText = 'Material costs without VAT: {MATERIAL_COST}';
        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesApi');

        InvoicesPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@invoicesApi');

        cy.contains('New Invoice').click();

        cy.contains(laborCostText);
        cy.contains(materialCostText);

        // change customer
        cy.get('input[name="propertyOwnerId"]').click();
        cy.get('li[role="option"]').first().click();
        cy.contains(laborCostText);
        cy.contains(materialCostText);

        // change job
        cy.contains('button', 'Select Job').click();
        cy.get('div[role="row"]').first().click();
        cy.contains(laborCostText);
        cy.contains(materialCostText);
    });
});
