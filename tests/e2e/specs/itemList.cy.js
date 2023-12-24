describe('List View', () => {
  beforeEach(() => {
    cy.localMode()
  })

  it('uses prefix', () => {
    cy.loadTestData()
    cy.visit('/#/')// Go to the entry page
    cy.contains('House1/Room1/box01')
  })

  it('handles a blank location save', () => {
    // https://github.com/FoxUSA/StoreDown/issues/10 - There was an issue where if you saved an item with no location it would crash the list views
    cy.visit('/#/entry')// Go to the entry page
    cy.get('[aria-label="Name"]').type('Blank Location')
    cy.contains('Save').click()
    cy.hash().should('match', /#\/entry\/.+$/) // Wait for the save to be confirmed

    cy.visit('/#/')// Go to the list page
    cy.contains('Blank Location')
  })
})
