import {navigateCy} from '../utils/utils';

export default class UnitsPage {
  static visit = () => {
    navigateCy('customer-center', 'units');
    cy.waitForSpinnerToDisappear();
  };

  static navigateToDetailsPage = () => {
    cy.get('td[data-field="ADDRESS"]').eq(0).click();
    cy.waitForSpinnerToDisappear();
  };

  static navigateToCreatePage = () => {
    cy.contains('p', 'New Unit').closest('button').click();
  };

  static openDialog = () => {
    cy.get('[data-testid="EditOutlinedIcon"]').eq(0).click();
    cy.contains('Edit General');
  };

  static openAppointmentPreferenceDialog = () => {
    cy.get('[data-test-id="approintment-preference-edit-icon"]').click();
    cy.contains('Edit Appointment Preferences');
  };

  static getFieldByName = (name: string) => cy.get(`input[name=${name}]`);
}
