describe('Gestión de Barberos', () => {
  it('debe mostrar mensaje cuando no hay barberos', () => {
    cy.setupEmptyAPIs();
    cy.visit('/barberos');

    cy.contains('Aún no hay barberos').should('be.visible');
  });

  it('debe mostrar la lista de barberos existentes', () => {
    cy.setupMockedAPIs();
    cy.visit('/barberos');

    cy.wait('@getBarberos');

    // Verificar que los barberos de la fixture aparecen
    cy.contains('Juan').should('be.visible');
    cy.contains('Pedro').should('be.visible');
    cy.contains('Carlos').should('be.visible');
  });

  it('debe poder agregar un nuevo barbero', () => {
    cy.setupMockedAPIs();

    // Interceptar el POST para agregar barbero
    cy.intercept('POST', '/api/barberos', {
      statusCode: 200,
      body: { success: true },
    }).as('agregarBarbero');

    // Interceptar el GET después del refresh con el nuevo barbero
    cy.intercept('GET', '/api/barberos', {
      body: ['Juan', 'Pedro', 'Carlos', 'Miguel'],
    }).as('getBarberosActualizado');

    cy.visit('/barberos');

    // Agregar nuevo barbero
    cy.get('input[placeholder="Nuevo barbero"]').type('Miguel');
    cy.contains('button', 'Agregar').click();

    cy.wait('@agregarBarbero');
    cy.wait('@getBarberosActualizado');

    // Verificar que el nuevo barbero aparece en la lista
    cy.contains('Miguel').should('be.visible');
  });

  it('debe validar que el campo no esté vacío', () => {
    cy.setupMockedAPIs();
    cy.visit('/barberos');

    // Intentar agregar sin nombre (el campo required debe prevenir el submit)
    cy.get('input[placeholder="Nuevo barbero"]').should(
      'have.attr',
      'required',
    );
  });

  it.skip('debe poder eliminar un barbero', () => {
    // Primero configurar el interceptor GET con los barberos iniciales
    cy.intercept('GET', '/api/barberos', {
      body: ['Juan', 'Pedro', 'Carlos'],
    }).as('getBarberosInicial');

    cy.visit('/barberos');
    cy.wait('@getBarberosInicial');

    // Verificar que Juan está presente
    cy.contains('li', 'Juan').should('be.visible');

    // Ahora interceptar el DELETE (con body JSON, no query params)
    cy.intercept('DELETE', '/api/barberos', (req) => {
      req.reply({
        statusCode: 200,
        body: { ok: true },
      });
    }).as('eliminarBarbero');

    cy.intercept('GET', '/api/barberos', {
      body: ['Pedro', 'Carlos'],
    }).as('getBarberosActualizado');

    // Encontrar el botón de eliminar de Juan y hacer clic
    cy.contains('li', 'Juan').within(() => {
      cy.contains('button', 'Eliminar').click();
    });

    cy.wait('@eliminarBarbero');
    cy.wait('@getBarberosActualizado');

    // Verificar que Juan ya no aparece pero Pedro y Carlos sí
    cy.contains('li', 'Juan').should('not.exist');
    cy.contains('li', 'Pedro').should('be.visible');
    cy.contains('li', 'Carlos').should('be.visible');
  });

  it('debe mostrar el formulario y la lista en la misma página', () => {
    cy.setupMockedAPIs();
    cy.visit('/barberos');

    // Verificar que el formulario está presente
    cy.get('input[placeholder="Nuevo barbero"]').should('be.visible');
    cy.contains('button', 'Agregar').should('be.visible');

    // Verificar que la lista está presente
    cy.contains('h2', 'Lista de barberos').should('be.visible');
    cy.get('ul').should('be.visible');
  });
});
