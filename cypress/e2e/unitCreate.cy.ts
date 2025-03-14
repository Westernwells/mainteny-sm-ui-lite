import {getUniqueId} from 'utils/utils';
import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';
import {navigateCy} from '../utils/utils';

interface CustomerCall {
    request: {
        query: {
            query: string;
        };
    };
}

describe('Create Unit', () => {
    beforeEach(() => {
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
            UnitsPage.visit();
            cy.get('span[role="progressbar"]').should('not.exist');
        });
    });

    it('submit unit', () => {
        UnitsPage.navigateToCreatePage();
        cy.get('span[role="progressbar"]').should('not.exist');
        UnitsPage.getFieldByName('propertyOwnerId').click();
        UnitsPage.getFieldByName('propertyOwnerId').blur();
        UnitsPage.getFieldByName('propertyOwnerId').parent().siblings('p').contains('Please select an existing customer');
        UnitsPage.getFieldByName('propertyOwnerId').click();
        cy.get('ul > li:nth-of-type(2)').click();
        cy.contains('button', 'Next').click();
        cy.wait(5000); // small delay for google autocomplete to load
        cy.get('input[name="address.fullName"]').type('Italy, texas');
        cy.contains('Address not found. Please check and try again').should('not.exist');
        cy.get('ul > li:nth-of-type(1)').click();
        cy.wait(200);
        cy.contains('button', 'Next').click();
        cy.get('input[name="category"]').type('Elev', {delay: 150});
        cy.get('ul > li:nth-of-type(1)').click();
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
        cy.wait('@customerApi', {timeout: 30000});
        cy.get('@customerApi.all').then((calls) => {
            const typedCalls = calls as unknown as CustomerCall[];
            const lastCall = typedCalls[typedCalls.length - 1];
            cy.wrap(lastCall.request.query.query).should('include', expectedSearchTerm);
        });
    });

    it('newly created unit should be shown correctly when creating quotation', () => {
        // Create a unique unit name for this test
        const uniqueUnitId = getUniqueId();

        // Create a new unit
        UnitsPage.navigateToCreatePage();
        cy.get('span[role="progressbar"]').should('not.exist');

        // Select customer (first one in the list)
        UnitsPage.getFieldByName('propertyOwnerId').click();
        cy.get('ul > li:nth-of-type(1)').click();
        cy.contains('button', 'Next').click();

        // Enter address
        cy.wait(5000); // small delay for google autocomplete to load
        cy.get('input[name="address.fullName"]').type('Italy, texas');
        cy.contains('Address not found. Please check and try again').should('not.exist');
        cy.get('ul > li:nth-of-type(1)').click();
        cy.contains('button', 'Next').click();

        // Select category
        cy.get('input[name="category"]').type('Elev', {delay: 150});
        cy.get('ul > li:nth-of-type(1)').click();
        // Add unique identifier to the unit
        cy.get('input[name="externalId"]').clear().type(uniqueUnitId);
        cy.contains('button', 'Next').click();

        // Fill in required fields
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

        // Now navigate to create quotation page
        navigateCy('finance', 'quotations');
        cy.get('span[role="progressbar"]').should('not.exist');

        // Create new quotation
        cy.contains('New Quotation').click();
        cy.get('span[role="progressbar"]').should('not.exist');

        // Select the same customer we used for the unit
        cy.get('input[role="combobox"][name="propertyOwnerId"]').parent().click();
        cy.get(`li[role="option"][id="combo-box-demo-option-0"]`, {timeout: 5000}).should('exist').click();

        // Click on Select Unit button
        cy.contains('button', 'Select Unit').click();

        // Search for our unique unit
        cy.intercept('GET', `${Cypress.env().REACT_APP_API_URL}/api/propertyOwners/*/elevators?*`).as('getUnitsAPI');
        cy.get('input[id="Search"]').clear().type(uniqueUnitId);
        cy.wait('@getUnitsAPI');

        // Verify our unit is in the list
        cy.contains(uniqueUnitId).should('exist');

        // Select the unit
        cy.get('div[data-rowindex="0"]').click();

        // Verify the unit is selected in the quotation form
        cy.contains('button', 'Select Unit').should('not.exist');
        cy.contains(uniqueUnitId).should('exist');
    });
});
