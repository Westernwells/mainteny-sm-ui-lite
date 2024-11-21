import {navigateCy} from '../utils/utils';

export default class UnitsDetailsPage {
  static visit = () => {
    navigateCy('customer-center', 'units');
  };

  static validatePrioritySorting = (index: number, priority: string) => {
    cy.get('div [class="MuiDataGrid-row "]')
      .children('div[data-field="priority"]')
      .eq(index)
      .should('contain', priority);
  };

  static addPriorityEngineer = (index: number, priority: string) => {
    cy.get('svg[data-testid="add-technician-button-icon"]').click();

    cy.get('input[name="technicianId"]').click({force: true});

    cy.get(`li[data-option-index="${index}"]`).click({force: true});

    cy.get('input[name="priority"]').clear();

    cy.get('input[name="priority"]').type(priority);

    cy.contains('button', 'Save').click({force: true});
  };
}
