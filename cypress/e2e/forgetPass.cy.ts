import ForgotPasswordPage from '../pages/forgotPassword.page';

describe('Forget Password Page', () => {
    beforeEach(() => {
        ForgotPasswordPage.visitForgotPasswordPage();
    });

    it('shows incorrect email error', () => {
        ForgotPasswordPage.fillEmail('test123.h@test478.com');
        ForgotPasswordPage.submitResetPasswordForm();
        cy.contains('Sorry, user account wasn\'t found');
    });

    it('show success message', () => {
        ForgotPasswordPage.resetPassword();
        cy.contains('Code sent successfully to your email');
    });

    it('should redirect to reset pass page', () => {
        ForgotPasswordPage.resetPassword();
        cy.url().should('eq', `${Cypress.config().baseUrl}/reset-password?type=reset`);
    });

    it('should disable the button when email or password is empty', () => {
        ForgotPasswordPage.shouldSubmitBtnDisabled(true);

        ForgotPasswordPage.fillEmail('e2etest@mainteny.com');

        ForgotPasswordPage.shouldSubmitBtnDisabled(false);
    });

    it('should display error for insufficient password length', () => {
        ForgotPasswordPage.resetPassword();
        ForgotPasswordPage.fillPassword('fake');
        cy.contains('Reset code must be at least 6 characters');
    });

    it('should resend code', () => {
        ForgotPasswordPage.resetPassword();
        cy.url().should('eq', `${Cypress.config().baseUrl}/reset-password?type=reset`);
        ForgotPasswordPage.resendCode();
        cy.contains('Code sent successfully to your');
    });

    it('should redirect to /reset-password', () => {
        ForgotPasswordPage.resetPassword();
        cy.url().should('eq', `${Cypress.config().baseUrl}/reset-password?type=reset`);
        ForgotPasswordPage.backToResetPassword();
        cy.url().should('eq', `${Cypress.config().baseUrl}/reset-password`);
    });
});
