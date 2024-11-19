import UnitsDetailsPage from '../pages/unitDetails.page';
import AppTopBarPage from '../pages/appTopBar.page';
import UnitsPage from '../pages/unit.page';

describe('Create Unit', () => {
    beforeEach(() => {
        cy.login();
        AppTopBarPage.selectLanguage('English');
        UnitsPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    it('add unit technician and validate priority', () => {
        cy.get('td[data-field="EXTERNAL_ID"]').eq(0).click({force: true});

        UnitsDetailsPage.addPriorityEngineer(0, '2');
        UnitsDetailsPage.addPriorityEngineer(1, '1');

        // validate sorting
        UnitsDetailsPage.validatePrioritySorting(0, '1');
        UnitsDetailsPage.validatePrioritySorting(1, '2');
    });
});
