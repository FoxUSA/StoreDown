describe('Item Entry', () => {
  beforeEach(() => {
    cy.localMode()
  })

  it('uses prefix', () => {
    cy.visit('/#/entry')// Go to the entry page
    cy.get('[aria-label="Location"]').type('box01')
    cy.get('div.v-text-field__prefix').should('have.text', 'House1/Room1/')

    // Test case insensitive
    cy.get('[aria-label="Location"]').clear().type('boX01')
    cy.get('div.v-text-field__prefix').should('have.text', 'House1/Room1/')

    // Test free form text, no prefix expected
    cy.get('[aria-label="Location"]').clear().type('box02')
    cy.get('div.v-text-field__prefix').should('not.exist')// test
  })
})
