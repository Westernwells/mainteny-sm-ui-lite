import {formatDate} from '../../src/utils/datetime';
import {navigateCy} from '../utils/utils';

export default class EmployeesPage {
  static visit = () => {
    navigateCy('my-company', 'employees');
  };

  static getAvailableEmployeeRowIndex() {
    return cy
      .get('div span')
      .contains('Available')
      .parents('tr[role="row"]')
      .invoke('attr', 'data-rowindex');
  }

  static getEmployeeByIndex(index: string) {
    return cy.get(`tr[data-rowindex=${index}]`);
  }

  static addHoliday() {
    cy.get('svg[data-testid="AddIcon"]').click();
    cy.get('svg[data-testid="WbSunnyIcon"]').click();
    cy.contains('label', 'Date').click();
    cy.get('button[aria-current="date"]').click({force: true});
    cy.contains('button', 'Confirm').click({waitForAnimations: false});
    const currentTechnicianAPI = `${
      Cypress.env().REACT_APP_API_URL
    }/api/technicians/*/events?*`;
    cy.intercept('GET', currentTechnicianAPI).as('currentTechnicianAPI');
    cy.contains('button', 'Save').click();
    cy.contains('Absence created successfully!');
    cy.wait('@currentTechnicianAPI');
  }

  static verifyHoliday() {
    const absenceCard = () =>
      cy.contains('Absence').parents('div.MuiPaper-root');
    absenceCard().contains('Holiday');
    absenceCard().contains(/\d+ days/); // 1 days
    absenceCard().contains(formatDate(new Date()));
  }

  static checkEmployeeAvailabilityUpdated(index: string) {
    this.getEmployeeByIndex(index).contains('Holiday').should('exist');
  }

  static removeHoliday(index: string) {
    this.getEmployeeByIndex(index).click();
    cy.wait('@currentTechnicianAPI');
    cy.get('svg[data-testid="DeleteIcon"]').first().click();
    cy.contains('button', 'Yes').click();
    cy.wait('@currentTechnicianAPI');
  }
}
