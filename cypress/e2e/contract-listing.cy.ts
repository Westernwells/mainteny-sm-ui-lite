import {CONTRACT_STATUS_FILTER, ContractStatus} from 'models/contract';
import AppTopBarPage from '../pages/appTopBar.page';
import ContractListingPage from '../pages/contact-listing.page';

describe('Contract listing page', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/contracts?*`).as('getContracts');
        ContractListingPage.visit();
    });

    it('should route to new contract page on clicking new contract button', () => {
        cy.wait('@getContracts');
        cy.contains('New Contract').click();
        cy.url().should('include', `contracts/new`);
    });

    it('should filter with search text and verify API call', () => {
        cy.wait('@getContracts');

        // create a new interceptor for latest call
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/contracts?*`).as('searchContracts');

        const searchText = 'es';

        cy.get('input[placeholder="Search"]').clear({force: true});
        cy.get('input[placeholder="Search"]')
            .type(searchText, {force: true})
            .invoke('val')
            .then((inputValue: string) => {
                cy.url().should('include', 'searchContracts');
                cy.url().should('include', inputValue);
            });

        cy.wait('@searchContracts').then((interception) => {
            const url = new URL(interception.request.url);
            const pageIndex = url.searchParams.get('pageIndex');
            const pageSize = url.searchParams.get('pageSize');
            const query = url.searchParams.get('query');
            cy.log(query);
            expect(pageIndex).to.equal('0');
            expect(pageSize).to.equal('25');
            expect(query).to.equal(searchText);
        });

        ContractListingPage.clearFilter();
        cy.get('input[placeholder="Search"]').should('have.value', '');
    });

    it(`should show no entries message when filter returns nothing`, () => {
        cy.wait('@getContracts');
        const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';

        cy.get('input[placeholder="Search"]').clear({force: true});
        cy.get('input[placeholder="Search"]')
            .type(searchText, {force: true})
            .invoke('val')
            .then((inputValue: string) => {
                cy.url().should('include', 'searchContracts');
                cy.url().should('include', inputValue);
            });

        cy.wait('@getContracts').then((interception) => {
            if (interception.response.body && interception.response.body.data.length === 0) {
                expect(interception.response.body.data).to.have.lengthOf(0);
                cy.contains('There are no entries for the applied filters.').should('exist');
            }
        });
    });

    it(`should route to the contract details page`, () => {
        ContractListingPage.navigateToDetailsPage();
    });

    it('should filter with price', () => {
        cy.wait('@getContracts');

        // create a new interceptor for latest call
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/contracts?*`).as('searchContracts');

        ContractListingPage.filterByPrice({from: '40', to: '50000'});
        cy.url().should('include', 'netAmountMax=50000');
        cy.url().should('include', 'netAmountMin=40');

        cy.wait('@searchContracts').then((interception) => {
            expect(interception.request.url).to.include('totalYearNetAmountStart=40');
            expect(interception.request.url).to.include('totalYearNetAmountEnd=50000');
        });
    });

    it('should filter the grid based on selected statuses', () => {
        cy.wait('@getContracts');

        const statusExclusions = {
            [CONTRACT_STATUS_FILTER.ACTIVE]: [ContractStatus.PENDING, ContractStatus.EXPIRED, ContractStatus.EXPIRING],
            [CONTRACT_STATUS_FILTER.EXPIRING]: [ContractStatus.PENDING, ContractStatus.EXPIRED, ContractStatus.VALID],
            [CONTRACT_STATUS_FILTER.INACTIVE]: [ContractStatus.EXPIRING, ContractStatus.VALID],
        };

        Object.entries(statusExclusions).forEach(([status, exclusions]) => {
            const enumStatus: CONTRACT_STATUS_FILTER = status as CONTRACT_STATUS_FILTER;
            ContractListingPage.checkGridForStatusExclusion(enumStatus, exclusions);
        });
    });
});
