import {ServiceOrderTypeKeys} from '../../src/models/service-order';
import AppTopBarPage from '../pages/appTopBar.page';
import ServiceJobPage from '../pages/serviceJob.page';
import NewServiceJobPage from '../pages/new-service.page';
import {randomEnumKey} from '../utils/utils';

describe('Create Job', () => {
    beforeEach(() => {
        cy.login().then(() => {
            AppTopBarPage.selectLanguage('English');
            const unitsURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/elevators?*`;
            cy.intercept('GET', unitsURL).as('unitsApi');

            ServiceJobPage.visit();
            cy.get('span[role="progressbar"]').should('not.exist');
        });
    });

    it('should create a job', () => {
        cy.contains('button', 'New Job').should('not.be.disabled').click();

        const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
        cy.contains('li', randomJobType).click();

        cy.get("span[role='progressbar']").should('exist');
        cy.get("span[role='progressbar']").should('not.exist');
        cy.wait('@unitsApi');
        ServiceJobPage.getUnitFirstTableElement().click();
        ServiceJobPage.goNext();

        // Execute the steps for the selected job type
        NewServiceJobPage.selectADueDate();
        NewServiceJobPage.selectADateTimeAndTechnician();
        ServiceJobPage.goNext();

        cy.contains('button', 'Submit').should('not.be.disabled').click();
        cy.contains('Order scheduled successfully');
    });
});
