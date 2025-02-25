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
    cy.login();
    interceptRequests();
    AppTopBarPage.selectLanguage('English');
    ServiceJobPage.visit();
    ServiceJobPage.changeTab(1);
    cy.get('span[role="progressbar"]').should('not.exist');
};

describe('Service Job Tests', () => {
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
                    cy.get('[id="action-menu"]').find('[data-testid^="container-menu-option-"]');
                    cy.contains('li', /^(Reschedule|Schedule)$/i) // Matches "Schedule" or "Reschedule"
                        .should('be.visible')
                        .click();

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
                    cy.get('[id="action-menu"]')
                        .find('[data-testid^="container-menu-option-"]')
                        .contains('li', /^Unschedule$/) // Match exactly "Unschedule"
                        .should('exist');
                } else {
                    cy.get('tbody').children().should('not.exist');
                    throw new Error('No Unscheduled jobs found');
                }
            });
    });

    it('should download work report', () => {
        ServiceJobPage.changeTab(0);
        OrderPage.changeStatusFilter('Completed');

        cy.wait('@serviceOrdersApi')
            .its('response.body.data')
            .then((serviceOrders) => {
                if (serviceOrders.length) {
                    ServiceJobPage.getFirstTableElement().should('exist').click();
                    ServiceJobPage.changeTab(1);

                    cy.get('body').then(($body) => {
                        if ($body.find('[data-testid="report-images"] div div img').length) {
                            cy.wait('@imageDownloadUrlsApi').its('response.statusCode').should('eq', 200);

                            cy.get('[data-testid="report-images"] div div img').should('have.length.at.least', 1).and('be.visible');
                        }
                    });

                    const downloadsFolder = Cypress.config('downloadsFolder');

                    // Delete existing files before download
                    cy.task('deleteFilesStartingWith', {folder: downloadsFolder, prefix: 'WR'});

                    // Click download button
                    cy.contains('button', 'Download', {timeout: 5000}).should('not.be.disabled').click();

                    // Wait for file download
                    cy.task('findFileStartingWith', {folder: downloadsFolder, prefix: 'WR'}, {timeout: 15000}).then((filePath) => {
                        // Ensure filePath is a string before using it
                        if (typeof filePath !== 'string') {
                            throw new Error('No downloaded file found with prefix "WR"');
                        }

                        cy.log(`Found downloaded file: ${filePath}`);

                        cy.readFile(filePath).should('exist');
                    });
                } else {
                    cy.get('tbody').children().should('not.exist');
                    throw new Error('No completed jobs found');
                }
            });
    });
});
