import AppTopBarPage from '../pages/appTopBar.page';
import LoginPage from '../pages/login.page';
import QuotationPage from '../pages/quotation.page';

describe('Create Quotation', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

      const addressURL =
        'https://maps.googleapis.com/maps/api/place/js/AutocompletionService.GetPredictionsJson?*';

      cy.intercept('GET', addressURL).as('addressURLApi');

      QuotationPage.visit();
      QuotationPage.navigateTo('new');
    });
  });

  it('should add new customer on quotation page', () => {
    QuotationPage.addNewCustomer();
  });

  it('should create new unit on quotation page', () => {
    QuotationPage.addNewUnit();
  });

  it('should disable button if required fields are not filled', () => {
    cy.get('#combo-box-demo').should('have.value', '');
    cy.contains('button', 'Save').should('be.disabled');

    cy.contains('Select Unit');
    cy.contains('button', 'Save').should('be.disabled');

    cy.get('input[name="subject"]').clear({force: true});
    cy.get('textarea[name="description"]').click({force: true});
    cy.get('input[name="subject"]')
      .parent()
      .siblings('p')
      .should('have.text', 'Subject is required');

    cy.contains('button', 'Save').should('be.disabled');

    cy.get('[data-test-id="AddArticle"]').should('exist');
    cy.contains('button', 'Save').should('be.disabled');

    cy.get('[data-test-id="AddArticle"]').click({force: true});

    const outside = cy.get('input[name="name"]');
    cy.get('input[name="name"]').click({force: true});
    outside.click({force: true});

    cy.contains('Article cannot be empty');
    cy.contains('button', 'Save').should('be.disabled');
  });
});
