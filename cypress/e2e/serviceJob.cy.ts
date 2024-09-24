import AppTopBarPage from '../pages/appTopBar.page';
import ServiceJobPage from '../pages/serviceJob.page';

describe('Job', () => {
    beforeEach(() => {
        cy.login();

        const technician = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/technicians?*`;

        const serviceOrders = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders/*`;

        cy.intercept('GET', serviceOrders).as('serviceOrdersApi');
        cy.intercept('GET', technician).as('technicianApi');

        AppTopBarPage.selectLanguage('English');

        ServiceJobPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    it('validate Assign Engineer dialog', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click({waitForAnimations: false});

        cy.contains('button', 'Save').should('be.disabled');

        ServiceJobPage.selectTechnicianWithIndex(0);

        cy.contains('button', 'Save').should('be.disabled');

        cy.contains('label', 'Due date').click();
        cy.get('button[aria-current="date"]').click();
        cy.contains('button', 'Confirm').click({waitForAnimations: false});

        cy.contains('button', 'Save').should('be.enabled');

        cy.get('[type="checkbox"]').check();

        // clear start and end date in case it's already set
        cy.contains('label', 'Start and end date').click();
        cy.get('div[class^="MuiPickersLayout"]').contains('button', 'Cancel').click({waitForAnimations: false});

        cy.contains('button', 'Save').should('be.disabled');

        // select start and end date
        cy.get('button[aria-current="date"]').click();
        cy.contains('button', 'Confirm').click({waitForAnimations: false});

        // clear start time and end time in case it's already set
        cy.contains('label', 'Start Time').click();
        cy.contains('button', 'Clear').click({waitForAnimations: false});
        cy.contains('label', 'End Time').click();
        cy.contains('button', 'Clear').click({waitForAnimations: false});

        cy.contains('button', 'Save').should('be.disabled');

        // select start time
        cy.contains('label', 'Start Time').click();
        cy.get('ul[aria-label="Select hours"]').get('li[aria-label="0 hours"]').click();
        cy.get('ul[aria-label="Select minutes"]').get('li[aria-label="0 minutes"]').click();
        cy.contains('button', 'Confirm').click();
        cy.get('ul[aria-label="Select hours"]').should('not.exist');

        cy.contains('button', 'Save').should('be.enabled');
    });

    it('should assign Engineer without schedule in jobs page', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click({waitForAnimations: false});
        cy.wait('@technicianApi')
            .its('response')
            .then((response) => {
                const {body: technicians} = response;
                if (technicians.data.length) {
                    ServiceJobPage.submitData({withSchedule: false});
                }
            });
    });

    it('should assign Engineer with schedule in jobs page', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click({waitForAnimations: false});
        cy.wait('@technicianApi')
            .its('response')
            .then((response) => {
                const {body: technicians} = response;
                if (technicians.data.length) {
                    ServiceJobPage.submitData();
                }
            });
    });

    it('should assign multiple Engineers with schedule in jobs page', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click({waitForAnimations: false});
        cy.wait('@technicianApi')
            .its('response')
            .then((response) => {
                const {body: technicians} = response;
                if (technicians.data.length) {
                    ServiceJobPage.submitData({assignEngineersCount: 2});
                }
            });
    });

    it('should assign Technician in orders details page', () => {
        ServiceJobPage.changeTab(1);
        cy.get('span[role="progressbar"]').should('not.exist');
        cy.wait('@serviceOrdersApi')
            .its('response')
            .then((response) => {
                const {body: serviceOrders} = response;
                if (serviceOrders.data.length) {
                    cy.contains('Unscheduled').eq(0).click();
                    cy.get('span[role="progressbar"]', {timeout: 120000}).should('not.exist');
                    cy.wait('@serviceOrdersApi');
                    cy.get('#long-button').click();
                    cy.get('li[role="menuitem"]').contains('Schedule').click();
                    cy.contains('button', 'Save').should('not.be.disabled').click();
                    cy.contains('Service job scheduled successfully');
                }
            });
    });
});
