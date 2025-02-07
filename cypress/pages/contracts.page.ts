import {navigateCy} from '../utils/utils';

export default class ContractsPage {
  static visit = () => {
    navigateCy('customer-center', 'contracts');
  };

  static navigateToDetailsPage = () => {
    cy.get('tr[data-rowindex="1"]').then((row) => {
      cy.wrap(row).find("td[data-field='EXTERNAL_ID'][role='cell']").click();
    });
  };

  static openDialog = () => {
    cy.get('svg[data-testid="MoreVertIcon"]').eq(0).click();
    cy.get('li[role="menuitem"]').contains('Edit').click();
    cy.contains('Edit Contract');
  };
}
