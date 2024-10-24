import OrderPage from '../pages/orders.page';
import AppTopBarPage from '../pages/appTopBar.page';

describe('Orders page - list page', () => {
    beforeEach(() => {
        cy.login();

        AppTopBarPage.selectLanguage('English');
        const serviceOrderAPI = `${Cypress.env().REACT_APP_API_URL}/api/serviceOrders?*`;
        cy.intercept('GET', serviceOrderAPI).as('serviceOrderAPI');
        OrderPage.visit();
        cy.get('span[role="progressbar"]').should('not.exist');
    });

    it('filter orders by status', () => {
        const status = 'Overdue';

        cy.wait('@serviceOrderAPI');
        OrderPage.changeStatusFilter(status);

        // Recursively wait for all job query api calls until the provided query parameter is matched
        OrderPage.waitForAllJobQueryApi(
            '@serviceOrderAPI',
            {
                status: ['OVERDUE'],
            },

            () => {
                cy.wait(100); // Very small delay for the DOM to be updated, can be anything any small amount
                cy.contains('div', status).should('exist');

                cy.get(`tbody`)
                    .find('tr[role="row"]')
                    .each((rowElement, index) => {
                        const statusText = rowElement.find("td[data-field='JOB_STATUS'][role='cell']").text().trim();

                        if (!statusText) return;

                        if (!status.includes(statusText)) {
                            throw new Error(`Unexpected status at row ${index + 1}: ${statusText}`);
                        }
                    });
            },
        );
    });

    it('filter jobs by type', () => {
        cy.wait('@serviceOrderAPI');
        const ELEVATOR_OPERATION = 'Elevator Operation';
        OrderPage.openFilters();
        OrderPage.changeTypeFilter(ELEVATOR_OPERATION);

        cy.wait('@serviceOrderAPI');
        cy.wait(100); // Very small delay for the DOM to be updated, can be anything any small amount
        cy.get('td[data-field="JOB_TYPE"][role="cell"]').each(($el) => {
            cy.wrap($el).scrollIntoView();
            cy.wrap($el).contains(ELEVATOR_OPERATION).should('be.visible');
        });
    });
});
