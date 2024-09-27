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
        cy.contains('button', 'Assign Engineer').first().click({ waitForAnimations: false });
    
        cy.contains('button', 'Save').should('be.disabled');
    
        ServiceJobPage.selectTechnicianWithIndex(0);
    
        cy.contains('button', 'Save').should('be.disabled');

        cy.contains('label', 'Due date').click();
        cy.get('button[aria-current="date"]').should('be.visible').click({ force: true });
        cy.contains('button', 'Confirm').click({ waitForAnimations: false });
    
        cy.contains('button', 'Save').should('be.enabled');
    
        cy.get('input[type="checkbox"]').check({ force: true });
        cy.get('input[type="checkbox"]').should('be.checked');
    
        cy.wait(500);
    
        cy.get('[data-testid=start-end-date]').click();
        cy.get('[data-testid=start-end-date-popup]').should('be.visible').within(() => {
            cy.get('button[aria-current="date"]').should('be.visible').click({ force: true });
            cy.contains('button', 'Confirm').click({ waitForAnimations: false });
        });
    
        cy.get('body').click();
    
        cy.get('[data-testid=start-end-date-popup]').should('not.exist');

        cy.contains('button', 'Save').should('be.disabled');

        cy.get('[data-testid=start-time]').click();
        cy.get('[data-testid=start-time-popup]').should('be.visible');
  
        cy.get('[data-testid=start-time-popup]').within(() => {
          cy.get('ul[aria-label="Select hours"]').should('be.visible');
          cy.get('li[aria-label="2 hours"]').click();
  
          cy.get('ul[aria-label="Select minutes"]').should('be.visible');
          cy.get('li[aria-label="30 minutes"]').click();
  
          cy.contains('button', 'Confirm').click();
        });
  
        cy.get('[data-testid=start-time-popup]').should('not.exist');
    
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
