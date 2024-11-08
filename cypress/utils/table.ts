export default class Table {
  static validateTableShouldHaveNoMatch = () => {
    cy.contains('h5', 'No matching search results').should('exist');
  };
}
