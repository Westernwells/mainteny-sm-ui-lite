export default class ContactPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="contacts-nav-item"]').click();
  };
}
