export default class SettingsPage {
  static visit = () => {
    cy.get('ul > div[role="button"][data-testid="settings-nav-item"]').click({
      force: true,
    });
  };
}
