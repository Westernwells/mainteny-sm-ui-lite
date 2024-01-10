export default class ForgotPassword {
    static visitForgotPasswordPage = () => {
        cy.visit(`/reset-password`, {
            failOnStatusCode: false,
        });
    };

    static resetPassword = () => {
        ForgotPassword.fillEmail('e2etest@mainteny.com');
        ForgotPassword.submitResetPasswordForm();
    };

    static fillEmail = (email) => {
        cy.get('#email').type(email);
    };

    static fillPassword = (password) => {
        cy.get('#token').type(password);
    };

    static submitResetPasswordForm = () => {
        cy.get('button[type="submit"]').click();
    };

    static resendCode = () => {
        cy.get('[data-testid="resend"]').click();
    };

    static backToResetPassword = () => {
        cy.get('[data-testid="back"]').click();
    };

    static shouldSubmitBtnDisabled = (shouldBeDisabled = true) => {
        const button = cy.get('button[type="submit"]');
        if (shouldBeDisabled) {
            button.should('be.disabled');
        } else {
            button.should('not.be.disabled');
        }
    };
}
