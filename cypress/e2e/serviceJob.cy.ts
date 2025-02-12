import AppTopBarPage from '../pages/appTopBar.page';
import ServiceJobPage from '../pages/serviceJob.page';
import OrderPage from '../pages/orders.page';

const technicianApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/employees?*`;
const serviceOrdersApi = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders*`;

const interceptRequests = () => {
    cy.intercept('GET', serviceOrdersApi).as('serviceOrdersApi');
    cy.intercept('GET', technicianApi).as('technicianApi');
};

const setupTest = () => {
    cy.login();
    interceptRequests();
    AppTopBarPage.selectLanguage('English');
    ServiceJobPage.visit();
    ServiceJobPage.changeTab(1);
    cy.get('span[role="progressbar"]').should('not.exist');
};

describe('Job Management Tests', () => {
    beforeEach(setupTest);

    it('should validate Assign Engineer dialog', () => {
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="assign-engineer"]:visible').length > 0) {
                ServiceJobPage.openAssignEngineerDialog();
                ServiceJobPage.assignEngineer();
            } else {
                ServiceJobPage.changeTab(0);
                ServiceJobPage.unscheduleFirstJob();
                ServiceJobPage.changeTab(1);
                ServiceJobPage.openAssignEngineerDialog();
                ServiceJobPage.assignEngineer();
            }
        });
    });

    it('should assign Engineer without schedule', () => {
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="assign-engineer"]:visible').length > 0) {
                ServiceJobPage.openAssignEngineerDialog();
                ServiceJobPage.assignEngineer(false);
            } else {
                ServiceJobPage.changeTab(0);
                ServiceJobPage.unscheduleFirstJob();
                ServiceJobPage.changeTab(1);
                ServiceJobPage.openAssignEngineerDialog();
                ServiceJobPage.assignEngineer(false);
            }
        });
    });

    it('should assign Engineer with schedule', () => {
        cy.contains('button', 'Assign Engineer').eq(0).click({waitForAnimations: false});
        ServiceJobPage.assignEngineer();
    });

    it('should assign multiple Engineers with schedule', () => {
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid="assign-engineer"]:visible').length > 0) {
                ServiceJobPage.openAssignEngineerDialog();
                ServiceJobPage.assignEngineer(true, 2);
            } else {
                ServiceJobPage.changeTab(0);
                ServiceJobPage.unscheduleFirstJob();
                ServiceJobPage.changeTab(1);
                ServiceJobPage.openAssignEngineerDialog();
                ServiceJobPage.assignEngineer(true, 2);
            }
        });
    });

    it('should assign Technician in order details page', () => {
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Overdue');
        cy.wait('@serviceOrdersApi')
            .its('response.body.data')
            .then((serviceOrders) => {
                if (serviceOrders.length) {
                    ServiceJobPage.getFirstTableElement().should('exist').click();
                    cy.get('button[data-testid="action-menu-horizontal"]').click();
                    cy.contains('li', 'Schedule').click();
                    ServiceJobPage.assignEngineer();
                    cy.contains('Service job scheduled successfully');
                } else {
                    cy.get('tbody').children().should('not.exist');
                    throw new Error('No Unscheduled jobs found');
                }
            });
    });

    it('should verify overdue jobs have the Unschedule menu item', () => {
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Overdue');
        cy.wait('@serviceOrdersApi')
            .its('response.body.data')
            .then((serviceOrders) => {
                if (serviceOrders.length) {
                    ServiceJobPage.getFirstTableElement().should('exist').click();
                    cy.get('button[data-testid="action-menu-horizontal"]').click();
                    cy.contains('li', 'Unschedule').should('exist');
                } else {
                    cy.get('tbody').children().should('not.exist');
                    throw new Error('No Unscheduled jobs found');
                }
            });
    });
});
