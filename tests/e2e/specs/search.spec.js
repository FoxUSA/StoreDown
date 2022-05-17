describe('List View', () => {
  before(() => { //Don't need to reset anything
    cy.localMode()
    cy.loadTestData()
  })

  it('can find a uuid', () => {
    cy.visit('/#/')// Go to the entry page
    cy.get('input[placeholder="Search items"').type('8e71919a-4f03-4fa4-bdce-5767e38ed48e{enter}')
    cy.contains('USB A to USB C cable')

    //Partial uuid
    cy.get('input[placeholder="Search items"').clear().type('1a76be8{enter}')
    cy.contains('Dental floss pick')

    //Click search with name
    cy.get('input[placeholder="Search items"').clear().type('USB A to USB C cable')
    cy.get('.v-btn__content').contains('Search').click()
    cy.contains('8ed48e')
  })
})
