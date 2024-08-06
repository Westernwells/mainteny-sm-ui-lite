import OrderPage from '../pages/orders.page';
import LoginPage from '../pages/login.page';
import AppTopBarPage from '../pages/appTopBar.page';

describe('Orders page - list page', () => {
    beforeEach(() => {
        LoginPage.visitLoginPage();
        const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
        cy.intercept('POST', loginURL).as('loginApi');
        LoginPage.login();

        cy.wait('@loginApi').then(() => {
            AppTopBarPage.selectLanguage('English');
            const serviceOrderAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders?*`;
            cy.intercept('GET', serviceOrderAPI).as('serviceOrderAPI');
            OrderPage.visit();
            cy.wait('@serviceOrderAPI');
        });
    });

    it('filter orders by status', () => {
        const statuses = ['Unscheduled', 'Scheduled', 'Completed'];
        OrderPage.changeTab(1);

        cy.wait('@serviceOrderAPI');
        OrderPage.changeStatusFilter(statuses);

        // Recursively wait for all job query api calls until the provided query parameter is matched
        OrderPage.waitForAllJobQueryApi(
            '@serviceOrderAPI',
            {
                selectedOrderStatus: ['READY_TO_SCHEDULE', 'SCHEDULED', 'COMPLETED'],
            },

            () => {
                cy.wait(100); // Very small delay for the DOM to be updated, can be anything any small amount
                const commaSeparatedText = statuses.join(',');

                cy.get('div#Job\\ Status[role="button').should('have.text', commaSeparatedText);

                cy.get(`div[aria-label="jobs-grid"]`)
                    .find('div[role="row"]')
                    .each((rowElement, index) => {
                        const statusText = rowElement.find("div[data-field='status'][role='cell']").text().trim();

                        if (!statusText) return;

                        if (!statuses.includes(statusText)) {
                            throw new Error(`Unexpected status at row ${index + 1}: ${statusText}`);
                        }
                    });
            },
        );
    });

    it('filter jobs by type', () => {
        OrderPage.changeTab(1);
        cy.wait('@serviceOrderAPI');
        const ELEVATOR_OPERATION = 'Elevator Operation';
        OrderPage.changeTypeFilter([ELEVATOR_OPERATION]);
        cy.get("span[role='progressbar']").should('exist');
        cy.wait('@serviceOrderAPI');
        cy.get("span[role='progressbar']").should('not.exist');
        cy.wait(100); // Very small delay for the DOM to be updated, can be anything any small amount
        cy.get('div[data-field="JOB_TYPE"][role="cell"]').each(($el) => {
            cy.wrap($el).contains(ELEVATOR_OPERATION).should('be.visible');
        });
    });
});
