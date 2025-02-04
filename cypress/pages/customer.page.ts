import {navigateCy} from '../utils/utils';

export default class CustomerPage {
  static visit = () => {
    navigateCy('customer-center', 'customers');
  };

  static fillFirstStep = () => {
    const input = cy.get('input[name="name"]');
    input.click();
    cy.get('input[name="email"]').click();
    input
      .parent()
      .siblings('p')
      .should('have.text', 'Customer Name is required');
    cy.contains('button', 'Next').should('be.disabled');
    cy.get('input[name="name"]').type('customer', {delay: 100});
    cy.contains('button', 'Next').should('not.be.disabled');
    cy.get('input[name="externalId"]').type('15', {delay: 100});
    cy.get('input[name="email"]').type('test@test.com', {delay: 100});
    cy.get('input[name="billingEmail"]').type('test1@test.com', {delay: 100});
    cy.get('input[name="phone"]').type('345656565', {delay: 100});
  };

  static fillSecondStep = () => {
    cy.get('div[role="combobox"]').eq(0).click({
      force: true,
    });
    cy.get('ul > li:nth-of-type(1)').click();
    cy.get('div[role="combobox"]').eq(1).click({
      force: true,
    });
    cy.contains('li[role="option"]', 'Baden-Württemberg').click();
  };

  static fillThirdStep = () => {
    cy.get('[data-testid="AddIcon"]').click();
    cy.contains('Add Contact Person');
    cy.get('input[name="userAccount.firstName"]').type('John', {delay: 100});
    cy.get('input[name="userAccount.lastName"]').type('Smith', {delay: 100});
    cy.contains('button', 'Save').click({force: true});
    cy.contains('button', 'Submit').click({force: true});
    cy.contains('Customer created successfully');
  };

  static next = () => {
    cy.contains('button', 'Next').should('not.be.disabled');
    cy.contains('button', 'Next').click({force: true});
  };
}
