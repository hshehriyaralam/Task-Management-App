describe('Login Page', () => {
  beforeEach(() => {
    cy.intercept(
      'POST', '**/auth/v1/token*',
      {
        statusCode: 200,
        body: {
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          user: {
            id: '1',
            email: 'test@test.com'
          }
        }
      }
    ).as('loginRequest')
  })

  it('should login successfully', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible').type('test@test.com')
    cy.get('input[type="password"]').should('be.visible').type('123456')
    cy.get('button[type="submit"]').should('be.visible').click()
    cy.wait('@loginRequest')
    cy.url().should('include', '/')
  })

})