import {removeControlCharsAndSpaces} from 'utils/utils';
import TableFilter from '../utils/tableFilter';
import InvoiceListingPage from '../pages/invoice-listing.page';
import AppTopBarPage from '../pages/appTopBar.page';
import {InvoiceStatusView, InvoiceType} from '../../src/models/invoice';
import {getPlainStringFromHtml} from '../../src/utils/rich-field-string';
import {calculateArticlesAmount} from '../../src/utils/calculate-total';
import {formatCurrency} from '../../src/utils/currency';
import {ServiceCompany} from '../../src/models/service-company';

describe('Invoice listing page', () => {
    beforeEach(() => {
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
            cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`).as('getInvoices');
            InvoiceListingPage.visit();
        });
    });

    it('should show no entries message when filter returns nothing', () => {
        cy.wait('@getInvoices');

        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesURL');

        const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';

        cy.get('input[placeholder="Search"]').should('be.visible').clear({force: true}).type(searchText, {force: true});

        cy.url().should('include', 'searchInvoices');
        cy.url().should('include', searchText);

        cy.wait('@invoicesURL')
            .its('response.body.data')
            .then((data) => {
                expect(data).to.have.lengthOf(0);
            });

        cy.contains('No matching search results').should('exist');
    });

    it('should route to new invoice page on clicking new invoice button', () => {
        cy.wait('@getInvoices');
        cy.contains('New Invoice').click();
        cy.url().should('include', `invoices/new`);
    });

    it('should filter data by status', () => {
        cy.wait('@getInvoices');

        const statusExclusions = {
            [InvoiceStatusView.PAID]: [
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.CREDITED,
                InvoiceStatusView.CANCELLED,
            ],
            [InvoiceStatusView.NOT_PAID]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.PARTIALLY_PAID,
                InvoiceStatusView.CREDITED,
            ],
            [InvoiceStatusView.DRAFT]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
                InvoiceStatusView.CREDITED,
            ],
            [InvoiceStatusView.CANCELLED]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
                InvoiceStatusView.CREDITED,
            ],
            [InvoiceStatusView.EXPIRED]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
                InvoiceStatusView.CREDITED,
            ],
            [InvoiceStatusView.PARTIALLY_PAID]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.CREDITED,
            ],
            [InvoiceStatusView.CREDITED]: [
                InvoiceStatusView.PAID,
                InvoiceStatusView.DRAFT,
                InvoiceStatusView.CANCELLED,
                InvoiceStatusView.EXPIRED,
                InvoiceStatusView.NOT_PAID,
                InvoiceStatusView.PARTIALLY_PAID,
            ],
        };

        Object.entries(statusExclusions).forEach(([status, exclusions]) => {
            InvoiceListingPage.checkGridForStatusExclusion(status as InvoiceStatusView, exclusions);
        });
    });

    it('should filter with search text and verify API call', () => {
        cy.wait('@getInvoices');

        const invoicesURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`;
        cy.intercept('GET', invoicesURL).as('invoicesURL');

        const searchText = 'es';
        cy.get('input[placeholder="Search"]').should('be.visible').clear({force: true}).type(searchText, {force: true});
        cy.url().should('include', 'searchInvoices').should('include', searchText);

        cy.wait('@invoicesURL').its('response.body.data').should('have.length.greaterThan', 0);
        TableFilter.clearQuerySearchFilter();
        cy.get('input[placeholder="Search"]').should('have.value', '');
    });

    it('should filter with price', () => {
        cy.wait('@getInvoices');
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/invoices?*`).as('invoicesURL');
        InvoiceListingPage.filterInvoicesByPrice({from: '100', to: '50000'});

        cy.wait('@invoicesURL');
        cy.url().should('include', 'grossAmountMin').should('include', 'grossAmountMax');
    });

    it(`should route to the invoice details page`, () => {
        cy.wait('@getInvoices');
        InvoiceListingPage.navigateToDetailsPage();
    });

    it('should create credit note invoice', () => {
        cy.wait('@getInvoices');
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*`).as('serviceCompanyApi');
        InvoiceListingPage.filterInvoicesListByStatus(InvoiceStatusView.NOT_PAID);
        cy.get('span[role="progressbar"]').should('not.exist');

        cy.wait('@getInvoices').then((interception) => {
            cy.wait(1000);
            // pick a sent invoice row
            const {data} = interception.response.body;
            const firstFullSentInvoice = data.find((d) => d.type === InvoiceType.FULL);

            if (!firstFullSentInvoice) {
                cy.log('No full sent invoice found');
                return;
            }

            // extract invoice number
            const invoiceNumber = firstFullSentInvoice.externalId;

            // open action menu and click create credit note
            cy.contains('td[data-field="NUMBER"]', invoiceNumber)
                .should('exist')
                .parents('tr[role="row"]')
                .find('button[data-testid="invoice-action-menu-button"]')
                .click();

            cy.contains('li', 'Create Credit note').click();
            cy.contains('button', 'Yes').click();

            // validate credit note invoice subject
            cy.getRichTextField('Subject').contains(`Credit note for ${invoiceNumber}`);

            // validate credit note invoice items are same as original invoice items but with negative net amount
            const originalInvoiceItems = firstFullSentInvoice.items;
            cy.get('td[data-testid="article-name-0"]').click();
            cy.get('#article-combo-box')
                .invoke('val')
                .then((value) => {
                    expect(removeControlCharsAndSpaces(value as string)).to.contain(
                        removeControlCharsAndSpaces(getPlainStringFromHtml(originalInvoiceItems[0].name)),
                    );
                });

            cy.get(`td[data-testid="position-unitAmount-0"]`).click({force: true});
            cy.get('input[name="items.0.unitAmount.netAmount"]')
                .invoke('attr', 'value')
                .should(
                    'eq',
                    (-originalInvoiceItems[0].unitAmount.netAmount / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                );

            // validate credit note invoice total amount is same as original invoice but in negative
            const {amountAfterGlobalDiscountWithVAT} = calculateArticlesAmount({
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
