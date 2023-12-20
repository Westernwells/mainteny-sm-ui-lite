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
      OrderPage.visit();
      OrderPage.changeTab(1);
      AppTopBarPage.selectLanguage('English');

      cy.get(`div[aria-label="jobs-grid"]`);
    });
  });

  it('filter orders by status', () => {
    const statuses = ['Unscheduled', 'Pending', 'Completed', 'Scheduling', 'Ongoing', 'Cancelled', 'Expired'];

    OrderPage.changeStatusFilter(statuses);

    const commaSeparatedText = statuses.join(',');
    
    cy.get('div#Job\\ Status[role="button"]').should('have.text', commaSeparatedText);

    cy.get(`div[aria-label="jobs-grid"]`)
      .find('div[role="row"]')
      .each((rowElement, index) => {
        const statusText = rowElement
          .find("div[data-field='status'][role='cell']")
          .text()
          .trim();

        if (!statusText) return;

        // Check if the statusText matches any of the expected statuses
        if (!statuses.includes(statusText)) {
          throw new Error(
            `Unexpected status at row ${index + 1}: ${statusText}`,
          );
        }
      });
  });
});
