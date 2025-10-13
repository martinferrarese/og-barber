describe('Navegación principal', () => {
  beforeEach(() => {
    cy.setupMockedAPIs();
  });

  it('debe mostrar la página de inicio correctamente', () => {
    cy.visit('/');

    // Verificar que el logo está presente
    cy.get('img[alt="OG Barber"]').should('be.visible');

    // Verificar que los tres botones principales están presentes
    cy.contains('a', 'Cargar día').should('be.visible');
    cy.contains('a', 'Ver registros diarios').should('be.visible');
    cy.contains('a', 'Administrar barberos').should('be.visible');
  });

  it('debe navegar correctamente a "Cargar día"', () => {
    cy.visit('/');
    cy.contains('a', 'Cargar día').click();

    cy.url().should('include', '/registro-dia');
    cy.contains('Fecha del día').should('be.visible');
  });

  it('debe navegar correctamente a "Ver registros diarios"', () => {
    cy.visit('/');
    cy.contains('a', 'Ver registros diarios').click();

    cy.url().should('include', '/registros-dia');
    cy.contains('h1', 'Registros diarios').should('be.visible');
  });

  it('debe navegar correctamente a "Administrar barberos"', () => {
    cy.visit('/');
    cy.contains('a', 'Administrar barberos').click();

    cy.url().should('include', '/barberos');
    cy.contains('h1', 'Administrar barberos').should('be.visible');
  });

  it('debe mostrar los títulos correctos en cada página', () => {
    // Página de barberos
    cy.visit('/barberos');
    cy.contains('h1', 'Administrar barberos').should('be.visible');
    cy.contains('h2', 'Lista de barberos').should('be.visible');

    // Página de registros diarios
    cy.visit('/registros-dia');
    cy.contains('h1', 'Registros diarios').should('be.visible');

    // Página de registro de día
    cy.visit('/registro-dia');
    cy.contains('Fecha del día').should('be.visible');
  });
});
