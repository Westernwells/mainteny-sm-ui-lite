import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';

describe('Edit Unit', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');

        const elevatorApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/elevators?query=&pageIndex=0&pageSize=50`;
        cy.intercept('GET', elevatorApi).as('elevatorApi');

        UnitsPage.visit();
    });

    it('should validate unit', () => {
        UnitsPage.navigateToDetailsPage();
        UnitsPage.openDialog();
        cy.get('input[name="category"]').clear();
        cy.get('#alert-dialog-title').click();
        cy.get('button[type="button"]').should('be.disabled');
    });

    it('validate data', () => {
        UnitsPage.navigateToDetailsPage();
        UnitsPage.openDialog();
        cy.get('input[name="category"]').then((input) => {
            const val = input.val();
            if (val === 'Escalator') {
                cy.wrap(input).clear().type('Elevator');
            } else {
                cy.wrap(input).clear().type('Escalator');
            }
        });
        cy.get('#alert-dialog-title').click();
        cy.contains('button', 'Save').should('not.be.disabled');
    });

    it('update spending limit', () => {
        UnitsPage.navigateToDetailsPage();
        UnitsPage.openDialog();
        cy.get('div[data-testid="unit_spending_limit_input_field"]').click().clear().type('1000');
        cy.get('#alert-dialog-title').click();
        cy.contains('button', 'Save').click();

        cy.get('div[data-testid="unit_spending_limit"]').should('contain', '1000');
    });
});
