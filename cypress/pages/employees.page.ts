export default class EmployeesPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="Employees-nav-item"]').click();
  };
}
