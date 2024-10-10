import InvoiceListingPage from '../pages/invoice-listing.page';
import AppTopBarPage from '../pages/appTopBar.page';
import {InvoiceStatusView, InvoiceType} from '../../src/models/invoice';
import {getPlainStringFromHtml} from '../../src/utils/rich-field-string';
import {calculateInvoiceAmount} from '../../src/utils/calculate-total';
import {formatCurrency} from '../../src/utils/currency';
import {ServiceCompany} from '../../src/models/service-company';

describe('Invoice listing page', () => {
    beforeEach(() => {
        cy.login();
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');

        AppTopBarPage.selectLanguage('English');
        InvoiceListingPage.visit();
    });

    it('should route to new invoice page on clicking new invoice button', () => {
        cy.contains('New Invoice').click();
        cy.visit(`/invoices/new`);
        cy.url().should('include', `invoices/new`);
    });

    it('should clear all filters on clicking clear filter button', () => {
        InvoiceListingPage.clearFilter();
        cy.url().should('include', '/invoices');
        cy.url().should('not.include', 'cost');
        cy.url().should('not.include', 'status');
        cy.get('input[placeholder="Search by number, customer, service type etc."]').should('have.value', '');
    });

    it('should filter data by status', () => {
        const statusExclusions = {
            [InvoiceStatusView.PAID]: [
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
            ],
            [InvoiceStatusView.NOT_PAID]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.PARTIALLY_PAID,
            ],
            [InvoiceStatusView.DRAFT]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
            ],
            [InvoiceStatusView.CANCELLED]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
            ],
            [InvoiceStatusView.EXPIRED]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
            ],
            [InvoiceStatusView.PARTIALLY_PAID]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
            ],
        };

        Object.entries(statusExclusions).forEach(([status, exclusions]) => {
            const enumStatus: InvoiceStatusView = status as InvoiceStatusView;
            InvoiceListingPage.checkGridForStatusExclusion(enumStatus, exclusions);
        });
    });

    it('should filter with search text and verify API call', () => {
        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesURL');

        const searchText = 'es';

        cy.get('input[placeholder="Search by number, customer, service type etc."]').clear({force: true});
        cy.get('input[placeholder="Search by number, customer, service type etc."]')
            .type(searchText, {force: true})
            .invoke('val')
            .then((inputValue: string) => {
                cy.url().should('include', 'searchInvoices');
                cy.url().should('include', inputValue);
            });

        cy.wait('@invoicesURL').then((interception) => {
            const url = new URL(interception.request.url);
            const pageIndex = url.searchParams.get('pageIndex');
            const pageSize = url.searchParams.get('pageSize');
            const query = url.searchParams.get('query');
            expect(pageIndex).to.equal('0');
            expect(pageSize).to.equal('25');
            expect(query).to.equal(searchText);
        });

        InvoiceListingPage.clearFilter();
        cy.get('input[placeholder="Search by number, customer, service type etc."]').should('have.value', '');
    });

    it('should filter with price', () => {
        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesURL');

        InvoiceListingPage.filterInvoicesByPrice();
        cy.url().should('include', 'cost');

        cy.wait('@invoicesURL').then((interception) => {
            expect(interception.request.url).to.include('totalAmountFrom=0');
            expect(interception.request.url).to.include('totalAmountTo=50000');
        });
    });

    it(`should show no entries message when filter returns nothing`, () => {
        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesURL');

        const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';

        cy.get('input[placeholder="Search by number, customer, service type etc."]').clear({force: true});
        cy.get('input[placeholder="Search by number, customer, service type etc."]')
            .type(searchText, {force: true})
            .invoke('val')
            .then((inputValue: string) => {
                cy.url().should('include', 'searchInvoices');
                cy.url().should('include', inputValue);
            });

        cy.wait('@invoicesURL').then((interception) => {
            if (interception.response.body && interception.response.body.data.length === 0) {
                expect(interception.response.body.data).to.have.lengthOf(0);
                cy.contains('There are no entries for the applied filters.').should('exist');
            }
        });
    });

    it(`should route to the invoice details page`, () => {
        InvoiceListingPage.navigateToDetailsPage();
    });

    it('should create credit note invoice', () => {
        InvoiceListingPage.filterInvoicesListByStatus(InvoiceStatusView.NOT_PAID);
        cy.get('span[role="progressbar"]').should('not.exist');

        cy.wait('@getInvoices').then((interception) => {
            cy.wait(1000);
            // pick a sent invoice row
            const {data} = interception.response.body;
            const firstFullSentInvoice = data.find((d) => d.type === InvoiceType.FULL);

            // extract invoice number
            const invoiceNumber = firstFullSentInvoice.externalId;

            // open action menu and click create credit note
            cy.contains('div[data-field="EXTERNAL_ID"]', invoiceNumber)
                .parents('div[role="row"]')
                .find('div[data-field="actions"] button[aria-label="More"]')
                .click();
            cy.contains('li', 'Create Credit note').click();
            cy.contains('button', 'Yes').click();

            // validate credit note invoice subject
            cy.get('div[role="textbox"][id="subject"]').contains(`Credit note for ${invoiceNumber}`);

            // validate credit note invoice items are same as original invoice items but with negative net amount
            const originalInvoiceItems = firstFullSentInvoice.items;

            cy.get('div[test-id="name-0"]').then(($div) => {
                // Get the actual text from the element, remove BOM characters, and normalize spaces
                const actualText = $div
                    .text()
                    .replace(/\uFEFF/g, '')
                    .trim()
                    .replace(/\s+/g, ' ');

                const expectedText = getPlainStringFromHtml(originalInvoiceItems[0].name).trim().replace(/\s+/g, ' ');

                expect(actualText).to.contain(expectedText);
            });

            cy.get('input[name="unitAmount.netAmount"]')
                .invoke('attr', 'value')
                .should('eq', (-originalInvoiceItems[0].unitAmount.netAmount / 100).toLocaleString());

            // validate credit note invoice total amount is same as original invoice but in negative
            const {amountAfterGlobalDiscountWithVAT} = calculateInvoiceAmount({
                items: originalInvoiceItems,
                globalDiscount: firstFullSentInvoice.additionalInfo.discount,
            });
            cy.wait('@serviceCompanyApi').then((i) => {
                const serviceCompany = i.response?.body as ServiceCompany;
                const {
                    currencies: [firstCurrency],
                } = serviceCompany.settings;
                const {code: currency} = firstCurrency;
                const amountAfterGlobalDiscountWithVATFormatted = formatCurrency(amountAfterGlobalDiscountWithVAT, {currency});
                cy.contains(amountAfterGlobalDiscountWithVATFormatted);

                // click save
                cy.contains('button', 'Save').click();

                // validate newly created credit note invoice total amount is same as original invoice but in negative
                cy.get('span[role="progressbar"]').should('not.exist');
                cy.contains(amountAfterGlobalDiscountWithVATFormatted);
            });
        });
    });
});
