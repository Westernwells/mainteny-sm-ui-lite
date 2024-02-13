import { ServiceOrderTypeKeys } from "../../src/models/service-order";
import AppTopBarPage from "../pages/appTopBar.page";
import LoginPage from "../pages/login.page";
import ServiceJobPage from "../pages/serviceJob.page";
import NewServiceJobPage from "../pages/new-service.page";
import { randomEnumKey } from "../utils/utils";

const secondStep: Record<ServiceOrderTypeKeys, Array<() => void>> = {
  [ServiceOrderTypeKeys.Emergency]: [NewServiceJobPage.selectTechnician],
  [ServiceOrderTypeKeys.Callout]: [NewServiceJobPage.selectImmediate, NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
  [ServiceOrderTypeKeys.Repair]: [NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
  [ServiceOrderTypeKeys.Maintenance]: [NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
  [ServiceOrderTypeKeys.Inspection]: [NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
  [ServiceOrderTypeKeys.Installation]: [NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
  [ServiceOrderTypeKeys.Modernization]: [NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
  [ServiceOrderTypeKeys.General]: [NewServiceJobPage.selectADueDate, NewServiceJobPage.selectADateTimeAndTechnician],
}

describe('Create Job', () => {
	beforeEach(() => {
    LoginPage.visitLoginPage();
    const loginURL = `${Cypress.env().REACT_APP_API_URL}/api/sessions/login`;
    cy.intercept('POST', loginURL).as('loginApi');
    LoginPage.login();

    cy.wait('@loginApi').then(() => {
      AppTopBarPage.selectLanguage('English');

      const unitsURL = `${Cypress.env().REACT_APP_API_URL}/api/serviceCompanies/*/elevators`;

      cy.intercept('GET', unitsURL).as('unitsApi');

			ServiceJobPage.visit();
    });
  });

  it('should create a job', () => {
    cy.contains('button', 'New Job').should('not.be.disabled').click();

    const randomJobType = randomEnumKey(ServiceOrderTypeKeys);
    cy.contains('li', randomJobType).click();
    
    cy.wait(1000);
    ServiceJobPage.getFirstTableElement().click();
    ServiceJobPage.goNext();

    // Execute the steps for the selected job type, each option should be checked
    secondStep[ServiceOrderTypeKeys[randomJobType]].forEach(step => step());
    ServiceJobPage.goNext();

    cy.wait(100);
    cy.contains('button', 'Submit').should('not.be.disabled').click();
    cy.contains('Order scheduled successfully');
  });
});