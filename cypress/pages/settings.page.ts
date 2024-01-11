export default class SettingsPage {
    static visit = () => {
        cy.visit(`/settings`, {
            failOnStatusCode: false,
        });
    };

    static changeTab = (index: number) => {
        cy.get(`[data-aria-label="tab-item-${index}"]`).click();
    };
}
