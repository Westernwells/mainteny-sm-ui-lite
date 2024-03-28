import AppTopBarPage from '../pages/appTopBar.page';
import ServiceJobPage from '../pages/serviceJob.page';
import LoginPage from '../pages/login.page';

describe('Job', () => {
    beforeEach(() => {
        LoginPage.visitLoginPage();
        const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
        cy.intercept('POST', loginURL).as('loginApi');
        LoginPage.login();

        cy.wait('@loginApi').then(() => {
            const technician = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/technicians?*`;

            const serviceOrders = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders/*`;

            cy.intercept('GET', serviceOrders).as('serviceOrdersApi');
            cy.intercept('GET', technician).as('technicianApi');

            AppTopBarPage.selectLanguage('English');

            ServiceJobPage.visit();
        });
    });

    it('validate Assign Engineer dialog', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click();

        cy.contains('button', 'Save').should('be.disabled');

        ServiceJobPage.selectTechnicianWithIndex(0);

        cy.contains('button', 'Save').should('be.enabled');

        cy.get('[type="checkbox"]').check();

        cy.contains('button', 'Save').should('be.disabled');

        // select start and end date
        cy.contains('label', 'Start and end date').click();
        cy.get('button[aria-current="date"]').click();
        cy.contains('button', 'Confirm').click();

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
        cy.contains('button', 'Assign Engineer').eq(0).click();
        cy.wait('@technicianApi', {timeout: 15000})
            .its('response')
            .then((response) => {
                const {body: technicians} = response;
                if (technicians.data.length) {
                    ServiceJobPage.submitData({withSchedule: false});
                }
            });
    });

    it('should assign Engineer with schedule in jobs page', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click();
        cy.wait('@technicianApi', {timeout: 15000})
            .its('response')
            .then((response) => {
                const {body: technicians} = response;
                if (technicians.data.length) {
                    ServiceJobPage.submitData();
                }
            });
    });

    it('should assign multiple Engineers with schedule in jobs page', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click();
        cy.wait('@technicianApi', {timeout: 15000})
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
        cy.wait('@serviceOrdersApi', {timeout: 15000})
            .its('response')
            .then((response) => {
                const {body: serviceOrders} = response;
                if (serviceOrders.data.length) {
                    cy.contains('Pending').eq(0).click({force: true});
                    cy.get('#long-button').click({force: true});
                    cy.get('ul > li:nth-child(1)').click({force: true});
                    cy.contains('button', 'Save').should('not.be.disabled').click();
                    cy.contains('Service job scheduled successfully');
                }
            });
    });
});
