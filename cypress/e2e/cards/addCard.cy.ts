describe("user can add Card", () => {
      beforeEach(() => {
            cy.visit('/') 
    });
    it("should be add Category Card", () => {
   const newCardText = 'In Progress'
    cy.get('[data-testid="card-modal"]').click()
    cy.get('[data-testid="new-category"]').type(`${newCardText}{enter}`)
    cy.get('[data-testid="add-btn"]').click()
    })
})