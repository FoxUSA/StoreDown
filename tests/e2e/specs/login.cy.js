// https://docs.cypress.io/api/introduction/api.html

describe('Login Experience', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.hash().should('eq', '#/login/')
    cy.contains('.v-toolbar__title', 'Database login')
  })

  it('has a config when started in local mode', () => {
    cy.localMode()

    cy.visit('/#/config')// Go to the config page
    cy.get('textarea').should('not.be.empty')
  })
})
