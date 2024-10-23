import {navigateCy} from '../utils/utils';

export default class ContractsPage {
  static visit = () => {
    navigateCy('customer-center', 'contracts');
  };

  static navigateToDetailsPage = () => {
    cy.get('div[data-colindex="1"]').eq(2).click();
  };

  static openDialog = () => {
    cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click();
    cy.get('li[role="menuitem"]').contains('Edit').click();
    cy.contains('Edit Contract');
  };
}
