export default class TableFilter {
  static openFilter = () => {
    cy.contains('h6', 'Filters').click({force: true});
  };

  static acceptFilter = () => {
    cy.contains('p', 'Show Results').click({force: true});
  };

  static clearQuerySearchFilter = () => {
    cy.get('button[data-testid="search-input-clear"]').click({force: true});
  };
}
