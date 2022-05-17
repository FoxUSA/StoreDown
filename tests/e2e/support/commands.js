// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Call via cy.localMode()
Cypress.Commands.add('localMode', () => {
  localStorage.clear()
  indexedDB.deleteDatabase('_pouch_StoreDown')

  cy.visit('/#/login/')
  cy.contains('Run in local/demo mode').click()
  cy.hash().should('eq', '#/')//Give the DB a moment after we click into local mode to redirect us. Or we could have used a time wait
})

Cypress.Commands.add('loadTestData', () => {
  const testData = `
  - status:
      checkInDate: '2022-04-23T19:31:22.030Z'
      checkInBy: Local
      status: true
    name: Refrigerator
    location: House 1/Kitchen
    tags:
      - '#Appliance'
    imageURLs:
      - >-
        https://www.homedepot.com/p/LG-Electronics-27-8-cu-ft-4-Door-French-Door-Smart-Refrigerator-with-2-Freezer-Drawers-and-Wi-Fi-Enabled-in-Stainless-Steel-LMXS28626S/302253240
    acquiredFrom: The Home Depot
    manufacturer: LG
    type: item
    manualPaths:
      - >-
        https://images.thdstatic.com/catalog/pdfImages/34/3425ea2f-97bf-4094-9cf3-7c2af2e8087f.pdf
      - >-
        https://images.thdstatic.com/catalog/pdfImages/2d/2d84e853-04e3-42b6-a6b0-2c125d060611.pdf
    receiptURLS:
      - >-
        https://image.shutterstock.com/image-vector/cash-receipt-receipts-financialcheck-isolated-260nw-1757944976.jpg
    acquireDate: '2022-04-23'
    warranty: 1 year
    pricePaid: '12345.1'
    weight: A lot
    expirationDate: '2023-04-24'
    holdReason: Put food in it.
    description: Stainless steel
    _id: 0f0fbfd9-8884-4160-8183-19bf39908f1e
  
  - status: {}
    location: House 1/Shed/Box4
    description: 90 flossers
    tags:
      - '#Dental'
      - '#Teeth'
      - '#Hygiene'
    code:
      - '842379146930'
    name: Dental floss pick
    acquiredFrom: Amazon
    pricePaid: '1.69'
    acquireDate: '2023-04-20'
    manufacturer: Solimo
    imageURLs:
      - >-
        https://smile.amazon.com/gp/product/B07CMR1BFM/ref=ppx_od_dt_b_asin_title_s00?ie=UTF8&th=1
    type: item
    _id: 45591d42-30e5-4131-800a-fe2241a76be8
  
  - status: {}
    name: USB A to USB C cable
    location: box01
    description: Red. 15W max.
    dimensions: 6ft
    imageURLs:
      - >-
        https://smile.amazon.com/gp/product/B07VYWJP71/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1&sa-no-redirect=1
    acquiredFrom: Amazon
    type: item
    lastModified: '2022-04-23T19:30:57.021Z'
    _id: 8e71919a-4f03-4fa4-bdce-5767e38ed48e
  
  - status: {}
    name: Backup Documents
    location: House 2/Attic/Behind picture of Grandma
    tags:
      - '#Backup'
    type: item
    _id: d51a2c0f-fe54-4ed5-8d18-19518af2cd9e`

  cy.visit('/#/import-export')

  cy.get('textarea').invoke('val', testData).trigger('input')
  cy.contains('Import YML').click()
})

//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
