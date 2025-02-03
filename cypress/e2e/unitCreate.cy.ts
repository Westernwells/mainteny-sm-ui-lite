import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';

describe('Create Unit', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');
        UnitsPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    it('submit unit', () => {
        UnitsPage.navigateToCreatePage();
        cy.get('span[role="progressbar"]').should('not.exist');
        UnitsPage.getFieldByName('propertyOwnerId').click();
        UnitsPage.getFieldByName('propertyOwnerId').blur();
        UnitsPage.getFieldByName('propertyOwnerId').parent().siblings('p').contains('Please select an existing customer');
        UnitsPage.getFieldByName('propertyOwnerId').click();
        cy.get('ul > li:nth-child(2)').click();
        cy.contains('button', 'Next').click();
        cy.wait(5000); // small delay for google autocomplete to load
        cy.get('input[name="address.fullName"]').type('Italy, texas');
        cy.contains('Address not found. Please check and try again').should('not.exist');
        cy.get('ul > li:nth-child(1)').click();
        cy.wait(200);
        cy.contains('button', 'Next').click();
        cy.get('input[name="category"]').type('Elev', {delay: 150});
        cy.get('ul > li:nth-child(1)').click();
        cy.contains('button', 'Next').click();
        cy.get('input[name="lastVisitDate"]').click();
        cy.get('[role="gridcell"]').first().click();
        cy.get('input[name="lastInspectionDate"]').click();
        cy.get('[role="gridcell"]').eq(1).click();
        cy.contains('h6', 'Service Information').click();
        cy.get('input[name="serviceTime"]').type('4', {delay: 150});
        cy.get('input[name="technicianNumber"]').type('4', {delay: 150});
        cy.contains('button', 'Next').click();
        cy.contains('button', 'Submit').click();
        cy.contains('Unit created successfully');
    });

    it('searching customer should use fuzzy name', () => {
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/propertyOwners*`).as('customerApi');

        const customerSearchValue = 'E2E test';
        const expectedSearchTerm = `[name:*E2E*][name:*test*]`;

        UnitsPage.navigateToCreatePage();
        cy.get('span[role="progressbar"]').should('not.exist');
        customerSearchValue.split('').forEach((char) => {
            cy.get('input[placeholder="Select Customer"]').type(char);
        });
        cy.wait(5000);
        cy.get('@customerApi.all').then((call) => {
            cy.wrap(Cypress._.last(call)).its('request.query.query').should('include', expectedSearchTerm);
        });
    });
});
