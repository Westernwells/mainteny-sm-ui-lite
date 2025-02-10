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

    return cy
      .get('button[aria-current="date"]')
      .invoke('attr', 'data-timestamp')
      .then((todayTs) => {
        const todayNum = parseInt(todayTs || '0', 10);

        return EmployeesPage.pickNextEnabledDay(todayNum).then((pickedTs) => {
          cy.wrap({date: pickedTs}).as('holidayTimestamp');

          cy.contains('button', 'Confirm').click({waitForAnimations: false});

          const currentTechnicianAPI = `${
            Cypress.env().REACT_APP_API_URL
          }/api/technicians/*/events?*`;
          cy.intercept('GET', currentTechnicianAPI).as('currentTechnicianAPI');

          cy.contains('button', 'Save').click();
          cy.contains('Absence created successfully!');
          cy.wait('@currentTechnicianAPI');
        });
      });
  }

  static pickNextEnabledDay(
    timestamp: number,
    attempts = 14,
  ): Cypress.Chainable<number> {
    if (attempts <= 0) {
      throw new Error(
        'Could not find an enabled (non-weekend) day within 14 days.',
      );
    }

    const nextDayTimestamp = timestamp + 86400000;
    return cy
      .get(`button[data-timestamp="${nextDayTimestamp}"]`)
      .then(($btn) => {
        const isWeekend = [0, 6].includes(new Date(nextDayTimestamp).getDay());
        if (!$btn.length || $btn.is(':disabled') || isWeekend) {
          return EmployeesPage.pickNextEnabledDay(
            nextDayTimestamp,
            attempts - 1,
          );
        }
        cy.wrap($btn).click({force: true});
        return cy.wrap(nextDayTimestamp);
      });
  }

  static verifyHoliday() {
    cy.get<{date: number}>('@holidayTimestamp').then(({date}) => {
      const pickedDate = new Date(date);
      const absenceCard = () =>
        cy.contains('Absence').parents('div.MuiPaper-root');
      absenceCard().contains('Holiday');
      absenceCard().contains(/\d+ days/);
      absenceCard().contains(formatDate(pickedDate));
    });
  }

  static checkEmployeeAvailabilityUpdated(index: string) {
    this.getEmployeeByIndex(index).contains('Available').should('exist');
  }

  static removeHoliday(index: string) {
    this.getEmployeeByIndex(index).click();
    cy.wait('@currentTechnicianAPI');
    cy.get('svg[data-testid="DeleteIcon"]').first().click();
    cy.contains('button', 'Yes').click();
    cy.wait('@currentTechnicianAPI');
  }
}
