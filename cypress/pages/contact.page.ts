import {navigateCy} from '../utils/utils';

export default class ContactPage {
  static visit = () => {
    navigateCy('customer-center', 'contacts');
    cy.waitForSpinnerToDisappear();
  };
}
