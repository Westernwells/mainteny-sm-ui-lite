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
      const serviceOrders = `${
        Cypress.env().REACT_APP_API_URL
      }/api/serviceOrders/*`;

      cy.intercept('GET', serviceOrders).as('serviceOrdersApi');

      AppTopBarPage.selectLanguage('English');

      ServiceJobPage.visit();
    });
  });

  it('validate Assign Technician dialog', () => {
    cy.contains('button', 'Assign Technician').eq(0).click();
    cy.get('input[name="date"]')
      .click()
      .parent()
      .siblings('p')
      .should('have.text', 'date is required');
    cy.get('input[name="startTime"]')
      .click()
      .parent()
      .siblings('p')
      .should('have.text', 'start time is required');
    cy.get('input[name="endTime"]')
      .click()
      .parent()
      .siblings('p')
      .should('have.text', 'end time is required');
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('should assign Technician in jobs page', () => {
    cy.contains('button', 'Assign Technician').eq(0).click();
    ServiceJobPage.submitData();
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

  it('create new job', () => {
    ServiceJobPage.changeTab(1);
    cy.wait('@serviceOrdersApi', {timeout: 15000})
      .its('response')
      .then((response) => {
        const {body: serviceOrders} = response;
        if (serviceOrders.data.length) {
          cy.contains('button', 'New Job').should('not.be.disabled').click();
          cy.contains('li', 'Maintenance').click();
          cy.get('[role="cell"]').first().click();
          cy.contains('button', 'Next').should('not.be.disabled').click();
          cy.get('[value="SCHEDULE_TECHNICIAN"]').click({force: true});
          cy.get('input[name="technicianId"]').click({force: true});
          cy.get('ul > li:nth-child(1)').click({force: true});
          cy.contains('button', 'Next').should('not.be.disabled').click();
          cy.wait(100);
          cy.contains('button', 'Submit').should('not.be.disabled').click();
          cy.contains('Order scheduled successfully');
        }
      });
  });
});
