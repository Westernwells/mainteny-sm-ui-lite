// Quotation table
import TableFilter from '../utils/tableFilter';

export default class QuotationsPage {
  static filterQuotationTableByStatus = (status: string) => {
    TableFilter.filterListByStatus(status);
  };

  static navigateToDetailsPage = (index = 0) => {
    cy.get('td[data-field="EXTERNAL_ID"]').eq(index).click();
    cy.waitForSpinnerToDisappear();
  };
}
