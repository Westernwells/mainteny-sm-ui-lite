import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';

describe('Unit Listing', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');

        // Intercept the units API call
        const unitsApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/elevators?*`;
        cy.intercept('GET', unitsApi).as('unitsApi');

        UnitsPage.visit();
        cy.waitForSpinnerToDisappear();
    });

    it('should handle all search scenarios', () => {
        // Wait for initial units load
        cy.wait('@unitsApi');

        // Test searching by address
        const addressSearchTerm = 'Italy, Texas';
        cy.get('input[placeholder*="Search"]').type(addressSearchTerm);
        cy.wait('@unitsApi').then((interception) => {
            expect(interception.request.query.query).to.include(addressSearchTerm);
        });
        cy.get('tbody tr[role="row"]').should('exist');

        // Test searching by unit ID
        const unitId = 'UNIT00000145';
        cy.get('input[placeholder*="Search"]').clear().type(unitId);
        cy.wait('@unitsApi').then((interception) => {
            expect(interception.request.query.query).to.include(unitId);
        });
        cy.get('tbody tr[role="row"]').should('exist');

        // Test searching with special characters
        const specialCharsSearch = 'Test@#$%^&*()';
        cy.get('input[placeholder*="Search"]').clear().type(specialCharsSearch);
        cy.wait('@unitsApi').then((interception) => {
            expect(interception.request.query.query).to.include(specialCharsSearch);
        });
        cy.get('tbody tr[role="row"]').should('exist');

        // Test clearing search to show all units
        cy.get('input[placeholder*="Search"]').clear();
        cy.wait('@unitsApi').then((interception) => {
            expect(interception.request.query?.query).to.satisfy(
                (q) => q === undefined || q === '',
                'Query should be either undefined or an empty string',
            );
        });
        cy.get('tbody tr[role="row"]').should('exist');
    });
});
