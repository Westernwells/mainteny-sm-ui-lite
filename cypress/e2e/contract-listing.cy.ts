import AppTopBarPage from '../pages/appTopBar.page';
import ContractListingPage from '../pages/contact-listing.page';
import {statusMapping, convertToMacro} from '../utils/utils';

describe('Contract listing page', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/contracts?*`).as('getContracts');
        ContractListingPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    it('should route to new contract page on clicking new contract button', () => {
        cy.wait('@getContracts');
        cy.contains('New Contract').click();
        cy.url().should('include', `contracts/new`);
    });

    it('should clear all filters', () => {
        cy.wait('@getContracts');
        ContractListingPage.clearFilter();
        cy.url().should('include', '/contracts');
        cy.url().should('not.include', 'cost');
        cy.url().should('not.include', 'searchContracts');
        cy.url().should('not.include', 'status');
        cy.get('input[placeholder="Search by number, customer, contract type etc."]').should('have.value', '');
    });

    it('should filter with search text and verify API call', () => {
        cy.wait('@getContracts');

        const searchText = 'es';

        cy.get('input[placeholder="Search by number, customer, contract type etc."]').clear({force: true});
        cy.get('input[placeholder="Search by number, customer, contract type etc."]')
            .type(searchText, {force: true})
            .invoke('val')
            .then((inputValue: string) => {
                cy.url().should('include', 'searchContracts');
                cy.url().should('include', inputValue);
            });

        cy.wait('@getContracts').then((interception) => {
            const url = new URL(interception.request.url);
            const pageIndex = url.searchParams.get('pageIndex');
            const pageSize = url.searchParams.get('pageSize');
            const query = url.searchParams.get('query');
            expect(pageIndex).to.equal('0');
            expect(pageSize).to.equal('25');
            expect(query).to.equal(searchText);
        });

        ContractListingPage.clearFilter();
        cy.get('input[placeholder="Search by number, customer, contract type etc."]').should('have.value', '');
    });

    it(`should show no entries message when filter returns nothing`, () => {
        cy.wait('@getContracts');
        const searchText = 'zzzghhdgsshgdhsggdddtuwowuakfdyrdjdjfhssg';

        cy.get('input[placeholder="Search by number, customer, contract type etc."]').clear({force: true});
        cy.get('input[placeholder="Search by number, customer, contract type etc."]')
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

        ContractListingPage.filterContractByPrice();
        cy.url().should('include', 'cost');

        cy.wait('@getContracts').then((interception) => {
            expect(interception.request.url).to.include('priceStart=0');
            expect(interception.request.url).to.include('priceEnd=50000');
        });
    });

    it('should filter the grid based on selected statuses', () => {
        cy.wait('@getContracts');
        cy.get('div[role="combobox"][id="Status"]').click({force: true});

        const statuses = ['Active', 'Inactive', 'Expiring'];

        statuses.forEach((status, index) => {
            ContractListingPage.filterContractByStatus(status);
            cy.get('span[role="progressbar"]').should('not.exist');
            ContractListingPage.waitForContractApi(
                '@getContracts',
                {
                    status: statusMapping[status],
                },
                () => {
                    cy.get('ul[role="listbox"] li')
                        .invoke('text')
                        .then((selectedStatusText) => {
                            const transformedText = selectedStatusText.replace(/([A-Z])/g, ',$1').slice(1);
                            const selectedStatuses = transformedText.split(',').map((transformedStatus) => transformedStatus.trim());
                            const macroStatuses = selectedStatuses.map((selectedStatus) => convertToMacro(statusMapping[selectedStatus]));

                            cy.wait(300);

                            cy.get('div[role="grid"]')
                                .find("div[data-field='STATUS'][role='cell']")
                                .each((row) => {
                                    const statusInGrid = row.text().trim();
                                    expect(macroStatuses[index]).to.equal(statusMapping[statusInGrid]);
                                });
                        });

                    cy.get('ul[role="listbox"]').contains(status).click({force: true});
                },
            );
        });
    });
});
