describe('SignUp Page', () => {
  beforeEach(() => {
    cy.intercept(
      'POST',
      '**/auth/v1/token*',
      {
        statusCode: 200,
        body: {
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          user: {
            id: '1',
            name : 'Test',
            email: 'test@test.com'
          }
        }
      }
    ).as('signupRequest')
  })

  it('should signUp Successfully', () => {
    cy.visit('/signup')
    cy.get('input[type="text"]').should('be.visible').type('Test')
    cy.get('input[type="email"]').should('be.visible').type('test@test.com')
    cy.get('input[type="password"]').should('be.visible').type('123456')
    cy.get('Button[type="submit"]').should('be.visible').click()
    cy.wait('@signupRequest')
    cy.url().should('include', '/login')
  })

})