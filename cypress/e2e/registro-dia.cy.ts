describe('Registro de día', () => {
  beforeEach(() => {
    cy.setupMockedAPIs();
  });

  it('debe permitir seleccionar una fecha para cargar el día', () => {
    cy.visit('/registro-dia');

    // Verificar que estamos en la fase de selección de fecha
    cy.contains('Fecha del día').should('be.visible');
    cy.get('input[type="date"]').should('be.visible');
    cy.contains('button', 'Seleccionar fecha').should('be.visible');

    // Seleccionar una fecha
    const fecha = '2025-10-10';
    cy.get('input[type="date"]').first().clear().type(fecha);
    cy.contains('button', 'Seleccionar fecha').click();

    // Verificar que pasamos a la fase de formulario
    cy.contains(`Registro de cortes del día ${fecha}`).should('be.visible');
  });

  it('debe cargar datos existentes al editar un día', () => {
    // Interceptar con datos específicos para esta fecha
    cy.intercept('GET', '/api/registros-dia', {
      body: [
        {
          fecha: '2025-10-01',
          barberos: [
            {
              fecha: '2025-10-01',
              barbero: 'Juan',
              servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
            },
          ],
        },
      ],
    }).as('getRegistrosDia');

    cy.visit('/registro-dia?fecha=2025-10-01');

    cy.wait('@getRegistrosDia');

    // Verificar que el día se cargó y muestra los barberos
    cy.contains('Registro de cortes del día 2025-10-01').should('be.visible');
    cy.contains('Barberos cargados').should('be.visible');
    cy.contains('Juan').should('be.visible');
  });

  it.skip('debe poder registrar servicios para un barbero', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    // Esperar a que carguen los barberos
    cy.wait('@getBarberos');

    // Seleccionar barbero
    cy.get('select[name="barbero"]').select('Juan');
    cy.contains('button', 'Continuar').click();

    // Ahora estamos en el paso 2: ingresar servicios
    cy.contains('Servicios para Juan').should('be.visible');

    // Ingresar cantidades de cortes normales en efectivo
    cy.get('input[type="number"]').first().clear().type('3');

    // Continuar (esto debería agregar el barbero)
    cy.contains('button', 'Continuar').click();

    // Verificar que el barbero se agregó a la lista
    cy.contains('Barberos cargados').should('be.visible');
    cy.contains('li', 'Juan').should('be.visible');
  });

  it.skip('debe poder agregar cortes especiales', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    cy.wait('@getBarberos');

    // Seleccionar barbero
    cy.get('select[name="barbero"]').select('Pedro');
    cy.contains('button', 'Continuar').click();

    // Agregar corte especial
    cy.contains('button', 'Agregar corte especial').click();
    cy.get('input[type="number"]').last().clear().type('15000');
    cy.contains('button', 'Agregar').click();

    // Verificar que se agregó
    cy.contains('$15.000').should('be.visible');
  });

  it.skip('debe poder agregar múltiples barberos en un día', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    cy.wait('@getBarberos');

    // Agregar primer barbero
    cy.get('select[name="barbero"]').select('Juan');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').first().clear().type('2');
    cy.contains('button', 'Continuar').click();

    // Verificar que Juan se agregó
    cy.contains('li', 'Juan').should('be.visible');

    // Agregar otro barbero
    cy.contains('button', 'Agregar otro barbero').click();

    cy.get('select[name="barbero"]').select('Pedro');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').first().clear().type('3');
    cy.contains('button', 'Continuar').click();

    // Verificar que ambos están en la lista
    cy.contains('li', 'Juan').should('be.visible');
    cy.contains('li', 'Pedro').should('be.visible');
  });

  it.skip('debe poder editar un barbero ya agregado', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    cy.wait('@getBarberos');

    // Agregar barbero
    cy.get('select[name="barbero"]').select('Juan');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').first().clear().type('2');
    cy.contains('button', 'Continuar').click();

    // Editar el barbero
    cy.contains('li', 'Juan').within(() => {
      cy.contains('button', 'Editar').click();
    });

    // Verificar que el formulario de edición está visible
    cy.contains('Servicios para Juan').should('be.visible');
  });

  it.skip('debe poder eliminar un barbero antes de cerrar el día', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    cy.wait('@getBarberos');

    // Agregar barbero
    cy.get('select[name="barbero"]').select('Carlos');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').first().clear().type('1');
    cy.contains('button', 'Continuar').click();

    // Verificar que está en la lista
    cy.contains('li', 'Carlos').should('be.visible');

    // Eliminar el barbero
    cy.contains('li', 'Carlos').within(() => {
      cy.contains('button', 'Eliminar').click();
    });

    // Verificar que ya no está
    cy.contains('li', 'Carlos').should('not.exist');
  });

  it.skip('debe poder cerrar el día y redirigir a home con confirmación', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );
    cy.intercept('POST', '/api/registros-dia', {
      statusCode: 200,
      body: { success: true },
    }).as('cerrarDia');

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    cy.wait('@getBarberos');

    // Agregar un barbero
    cy.get('select[name="barbero"]').select('Juan');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').first().clear().type('5');
    cy.contains('button', 'Continuar').click();

    // Cerrar día
    cy.contains('button', 'Cerrar día').click();

    cy.wait('@cerrarDia');

    // Verificar redirección a home con query param
    cy.url().should('include', '/?diaCargada=');

    // Verificar que aparece el toast de confirmación
    cy.contains(`Se cargó el día ${fecha}`).should('be.visible');
  });

  it.skip('no debe permitir agregar más barberos cuando se están editando', () => {
    const fecha = '2025-10-10';

    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');
    cy.seleccionarFecha(fecha);

    cy.wait('@getBarberos');

    // Agregar barbero
    cy.get('select[name="barbero"]').select('Juan');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').first().clear().type('2');
    cy.contains('button', 'Continuar').click();

    // Editar el barbero
    cy.contains('li', 'Juan').within(() => {
      cy.contains('button', 'Editar').click();
    });

    // El botón "Agregar otro barbero" no debería estar visible durante la edición
    cy.contains('button', 'Agregar otro barbero').should('not.exist');
  });
});
