import InvoiceListingPage from '../pages/invoice-listing.page';
import LoginPage from '../pages/login.page';
import AppTopBarPage from '../pages/appTopBar.page';
import {InvoiceStatusView} from '../../src/models/invoice';

describe('Invoice listing page', () => {
    beforeEach(() => {
        LoginPage.visitLoginPage();
        const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
        cy.intercept('POST', loginURL).as('loginApi');

        LoginPage.login();

        cy.wait('@loginApi').then(() => {
            InvoiceListingPage.visit();
            AppTopBarPage.selectLanguage('English');
        });
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
});
