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
    cy.visit('/#/entry')// Go to the entry page
    cy.get('[aria-label="Name"]').type('Blank Location')
    cy.contains('Save').click()

    cy.visit('/#/')// Go to the list page
    cy.contains('Blank Location')
  })
})
