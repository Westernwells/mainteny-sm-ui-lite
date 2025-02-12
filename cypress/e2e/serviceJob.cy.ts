import AppTopBarPage from '../pages/appTopBar.page';
import ServiceJobPage from '../pages/serviceJob.page';
import OrderPage from '../pages/orders.page';

describe('Job', () => {
    beforeEach(() => {
        cy.login();

        const technician = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/employees?*`;

        const serviceOrders = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders*`;

        cy.intercept('GET', serviceOrders).as('serviceOrdersApi');
        cy.intercept('GET', technician).as('technicianApi');

        AppTopBarPage.selectLanguage('English');

        ServiceJobPage.visit();
        ServiceJobPage.changeTab(1);
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    it('validate Assign Engineer dialog', () => {
        cy.contains('button', 'Assign Engineer').first().click({waitForAnimations: false});

        cy.get('[data-testid=saveButton]').should('be.disabled');

        ServiceJobPage.selectTechnicianWithIndex(0);

        cy.get('[data-testid=saveButton]').should('be.disabled');

        cy.contains('label', 'Due date').click();
        cy.get('button[aria-current="date"]').should('be.visible').click({force: true});
        cy.contains('button', 'Confirm').click({waitForAnimations: false});

        cy.get('[data-testid=saveButton]').should('be.enabled');

        cy.get('input[type="checkbox"]').check({force: true});
        cy.get('input[type="checkbox"]').should('be.checked');

        cy.wait(500);

        cy.get('[data-testid=start-end-date]').click();
        cy.get('[data-testid=start-end-date-popup]')
            .should('be.visible')
            .within(() => {
                cy.get('button[aria-current="date"]').should('be.visible').click({force: true});
                cy.contains('button', 'Confirm').click({waitForAnimations: false});
            });

        cy.get('body').click();

        cy.get('[data-testid=start-end-date-popup]').should('not.exist');

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

        cy.get('[data-testid=saveButton]').should('be.enabled');
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
        cy.wait(2000);

        cy.get('body').then(($body) => {
            const hasUnscheduledJobs = $body.find('[data-testid="assign-engineer"]:visible').length > 0;

            if (hasUnscheduledJobs) {
                // Click Assign Engineer if it exists
                cy.get('[data-testid="assign-engineer"]:visible', {timeout: 10000}).should('be.visible').first().click({waitForAnimations: false});

                cy.wait('@technicianApi')
                    .its('response')
                    .then((response) => {
                        const {body: technicians} = response;
                        if (technicians.data.length) {
                            ServiceJobPage.submitData({assignEngineersCount: 2});
                        }
                    });
            } else {
                ServiceJobPage.changeTab(0);

                OrderPage.changeStatusFilter('Pending');

                cy.get('table', {timeout: 5000}).should('be.visible');

                ServiceJobPage.getFirstTableElement().should('exist').click();

                cy.contains('td', /Scheduled/, {timeout: 5000})
                    .first()
                    .closest('tr')
                    .within(() => {
                        cy.get('button[aria-haspopup="true"]').click();
                    });

                cy.contains('li', 'Unschedule').click();
                cy.contains('button', 'Yes').click();
                cy.contains('Service job has been unscheduled', {timeout: 5000}).should('be.visible');

                ServiceJobPage.changeTab(1);
                cy.get('[data-testid="assign-engineer"]:visible', {timeout: 5000}).should('be.visible');

                cy.get('[data-testid="assign-engineer"]:visible').first().click({waitForAnimations: false});

                cy.wait('@technicianApi')
                    .its('response')
                    .then((response) => {
                        const {body: technicians} = response;
                        if (technicians.data.length) {
                            ServiceJobPage.submitData({assignEngineersCount: 2});
                        }
                    });
            }
        });
    });

    it('should assign Technician in orders details page', () => {
        ServiceJobPage.changeTab(0);

        cy.get('span[role="progressbar"]').should('not.exist');

        // Click the "Unscheduled" option (use the recorded selector for this action)
        OrderPage.changeStatusFilter('Overdue');

        cy.wait(3000);

        cy.wait('@serviceOrdersApi')
            .its('response')
            .then((response) => {
                const {body: serviceOrders} = response;

                // Check if service orders data is available
                if (serviceOrders && serviceOrders.data.length) {
                    ServiceJobPage.getFirstTableElement().should('exist').click();

                    cy.get('span[role="progressbar"]', {timeout: 120000}).should('not.exist');

                    cy.wait('@serviceOrdersApi');

                    cy.get('button[data-testid="action-menu-horizontal"]').click();

                    cy.get('li[role="menuitem"]').contains('Schedule').click();

                    ServiceJobPage.selectTechnicianWithIndex(2);

                    cy.get('[data-testid="due-date"]').click();
                    cy.get('button[aria-current="date"]').click({force: true});
                    cy.contains('button', 'Confirm').click({waitForAnimations: false});

                    cy.contains('button', 'Save').should('not.be.disabled').click();

                    cy.contains('Service job scheduled successfully');
                } else {
                    cy.get('tbody').children().should('not.exist');
                    throw new Error('No Unscheduled jobs found');
                }
            });
    });

    it('overdue jobs should have the Unschedule menu item', () => {
        ServiceJobPage.changeTab(0);

        cy.get('span[role="progressbar"]').should('not.exist');

        OrderPage.changeStatusFilter('Overdue');
        cy.wait(3000);

        cy.wait('@serviceOrdersApi')
            .its('response')
            .then((response) => {
                const {body: serviceOrders} = response;

                // Check if service orders data is available
                if (serviceOrders && serviceOrders.data.length) {
                    ServiceJobPage.getFirstTableElement().should('exist').click();

                    cy.get('span[role="progressbar"]', {timeout: 120000}).should('not.exist');

                    cy.wait('@serviceOrdersApi');

                    cy.get('button[data-testid="action-menu-horizontal"]').click();

                    cy.get('li[role="menuitem"]').contains('Unschedule').should('exist');
                } else {
                    cy.get('tbody').children().should('not.exist');
                    throw new Error('No Unscheduled jobs found');
                }
            });
    });
});
