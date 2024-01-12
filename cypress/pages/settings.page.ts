export default class SettingsPage {
    static visit = () => {
        cy.visit(`/settings`, {
            failOnStatusCode: false,
        });
    };

    static changeTab = (index: number) => {
        cy.get(`[data-aria-label="tab-item-${index}"]`).click();
    };

    static changeModalInput = (attributeValue: string, value: string, id: string, clear?: boolean) => {
        cy.get(`[data-test-id="${id}"]`).click();
        const attribute = `input[name="${attributeValue}"]`;
        if (!clear) {
            cy.get(attribute).invoke('val', value);
        } else {
            cy.get(attribute).focus().clear();
        }
    };

    static fillContractName = (text) => {
        cy.get('input[name="contractName"]').type(text);
    };


    static checkContract = () => {
        cy.get('input[value="SERVICE"]').click();
    };

    static createContract = () => {
        SettingsPage.fillContractName('TEST1');
        SettingsPage.checkContract();
        cy.get('button[type="submit"]').click();

    };
}
