import AppTopBarPage from '../pages/appTopBar.page';
import ServiceJobPage from '../pages/serviceJob.page';
import OrderPage from '../pages/orders.page';

const technicianApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/employees?*`;
const serviceOrdersApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders*`;
const imageDownloadUrlsApi = `${Cypress.env().REACT_APP_API_URL}/api/media/signedUrl/download*`;

const interceptRequests = () => {
    cy.intercept('GET', serviceOrdersApi).as('serviceOrdersApi');
    cy.intercept('GET', technicianApi).as('technicianApi');
    cy.intercept('GET', imageDownloadUrlsApi).as('imageDownloadUrlsApi');
};

const setupTest = () => {
    cy.login().then(() => {
        AppTopBarPage.selectLanguage('English');
        interceptRequests();
        ServiceJobPage.visit();
        ServiceJobPage.changeTab(1);
        cy.get('span[role="progressbar"]').should('not.exist');
    });
};

describe('Service Job Tests', () => {
    beforeEach(setupTest);

    it('should validate Assign Engineer dialog', () => {
        ServiceJobPage.createJob();
        cy.go('back');
        cy.wait('@serviceOrdersApi');

        cy.get('body').find('[data-testid="assign-engineer"]').should('exist').should('contain.text', 'Assign Engineer');

        cy.get('body').then(($body) => {
            const isVisible = $body.find('[data-testid="assign-engineer"]:visible').length > 0;

            if (!isVisible) {
                ServiceJobPage.changeTab(0);
                ServiceJobPage.unscheduleFirstJob();
                ServiceJobPage.changeTab(1);
            }
            ServiceJobPage.openAssignEngineerDialog();
            ServiceJobPage.assignEngineer();
        });
    });

    it('should assign Engineer without schedule', () => {
        ServiceJobPage.createJob();
        cy.go('back');
        cy.wait('@serviceOrdersApi');

        cy.get('body').find('[data-testid="assign-engineer"]').should('exist').should('contain.text', 'Assign Engineer');

        cy.get('body').then(($body) => {
            const isVisible = $body.find('[data-testid="assign-engineer"]:visible').length > 0;

            if (!isVisible) {
                ServiceJobPage.changeTab(0);
                ServiceJobPage.unscheduleFirstJob();
                ServiceJobPage.changeTab(1);
            }
            ServiceJobPage.openAssignEngineerDialog();
            ServiceJobPage.assignEngineer({withSchedule: false});
        });
    });

    it('should assign Engineer with schedule', () => {
        ServiceJobPage.createJob();
        cy.go('back');
        cy.wait('@serviceOrdersApi');

        cy.get('body').find('[data-testid="assign-engineer"]').should('exist').should('contain.text', 'Assign Engineer');

        cy.contains('button', 'Assign Engineer').eq(0).click({waitForAnimations: false});
        ServiceJobPage.assignEngineer();
    });

    it('should assign multiple Engineers with schedule', () => {
        ServiceJobPage.createJob();
        cy.go('back');
        cy.wait('@serviceOrdersApi');

        cy.get('body').find('[data-testid="assign-engineer"]').should('exist').should('contain.text', 'Assign Engineer');

        cy.get('body').then(($body) => {
            const isVisible = $body.find('[data-testid="assign-engineer"]:visible').length > 0;

            if (!isVisible) {
                ServiceJobPage.changeTab(0);
                ServiceJobPage.unscheduleFirstJob();
                ServiceJobPage.changeTab(1);
            }

            ServiceJobPage.openAssignEngineerDialog();
            ServiceJobPage.assignEngineer({assignEngineersCount: 2});
        });
    });

    it('should assign Technician in order details page', () => {
        ServiceJobPage.createJob();
        cy.go('back');
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Pending');

        cy.wait('@serviceOrdersApi');

        cy.get('tbody tr', {timeout: 10000}).should('have.length.greaterThan', 0);

        cy.contains('Unscheduled').should('exist').parents('tr').find('td[data-field="EXTERNAL_ID"]').click();

        cy.get('button[data-testid="action-menu-horizontal"]').click();
        cy.get('[id="action-menu"]').find('[data-testid^="container-menu-option-"]');
        cy.contains('li', /^(Reschedule|Schedule)$/i) // Matches "Schedule" or "Reschedule"
            .should('be.visible')
            .click();

        ServiceJobPage.assignEngineer();
        cy.contains('Service job scheduled successfully');
    });

    it('should not reset Technician when rescheduling without changing technicians field', () => {
        ServiceJobPage.createJob();
        cy.go('back');
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Pending');

        cy.wait('@serviceOrdersApi');

        cy.get('tbody tr', {timeout: 10000}).should('have.length.greaterThan', 0);

        cy.contains('Unscheduled').should('exist').parents('tr').find('td[data-field="EXTERNAL_ID"]').click();

        cy.get('button[data-testid="action-menu-horizontal"]').click();
        cy.get('[id="action-menu"]').find('[data-testid^="container-menu-option-"]');
        cy.contains('li', /^(Reschedule|Schedule)$/i) // Matches "Schedule" or "Reschedule"
            .should('be.visible')
            .click();
        const putJobAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders/*`;
        cy.intercept('PUT', putJobAPI).as('putJobAPI');
        ServiceJobPage.assignEngineer({
            withSchedule: true,
            removeSchedule: false,
            changeDueDate: false,
        });
        cy.wait('@putJobAPI');
        cy.get('button[data-testid="action-menu-horizontal"]').click();
        cy.contains('li', 'Reschedule').should('be.visible').click();
        ServiceJobPage.submitData({
            withSchedule: false,
            removeSchedule: true,
            changeDueDate: false,
            assignEngineersCount: 0,
        });
        cy.wait('@putJobAPI');
        cy.get('div[data-testid="technician-card"]').should('not.have', '-');
        cy.get('div[data-testid="job-details-status-chip"]').contains('Assigned');
    });

    it('should verify overdue jobs have the Unschedule menu item', () => {
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Overdue');
        cy.wait('@serviceOrdersApi');

        cy.get('tbody tr', {timeout: 10000}).should('have.length.greaterThan', 0);

        cy.get('tbody tr')
            .find('[data-testid="status-chip"]')
            .should('exist')
            .should('contain.text', 'Overdue')
            .first()
            .parents('tr')
            .find('td[data-field="EXTERNAL_ID"]')
            .click();

        cy.get('button[data-testid="action-menu-horizontal"]').click();
        cy.get('[id="action-menu"]')
            .find('[data-testid^="container-menu-option-"]')
            .contains('li', /^Unschedule$/) // Match exactly "Unschedule"
            .should('exist');
    });

    it('should download work report', () => {
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Completed');

        // Wait for the service orders to load
        cy.wait('@serviceOrdersApi');
        cy.get('tbody tr', {timeout: 10000}).should('have.length.greaterThan', 0);

        // Confirm that the first row is now "Completed"
        cy.get('tbody tr').first().find('[data-testid="status-chip"]').should('exist').should('contain.text', 'Completed');

        cy.get('tr[data-testid^="service-order-row"] td[data-field="EXTERNAL_ID"]').should('be.visible').first().click();

        cy.contains('Work Report').should('exist').should('be.visible').click();

        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="report-images"] div div img').length) {
                cy.wait('@imageDownloadUrlsApi').its('response.statusCode').should('eq', 200);

                cy.get('[data-testid="report-images"] div div img').should('have.length.at.least', 1).and('be.visible');
            }
        });

        cy.contains('button', 'Download', {timeout: 5000}).should('not.be.disabled').click();
        cy.wait(1000);
        cy.get('p[data-testid="reportId"]')
            .invoke('text')
            .then((text) => {
                cy.waitUntil(() => cy.task('downloads', 'cypress/downloads').then((d: string[]) => d && d.length > 0), {
                    timeout: 15000,
                    interval: 500,
                }).then(() => {
                    cy.task('downloads', 'cypress/downloads').then((d: string[]) => {
                        const lastDownloadedFile = d[d.length - 1];
                        cy.task('readPdf', `cypress/downloads/${lastDownloadedFile}`).its('text').should('contain', text);
                    });
                });
            });
    });
});
