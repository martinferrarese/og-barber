describe('Flujo completo E2E', () => {
  it.skip('debe completar el flujo completo: crear barbero → registrar día → verificar en registros', () => {
    const nuevoBarbero = 'TestBarbero';
    const fecha = '2025-10-15';

    // Paso 1: Crear un nuevo barbero
    cy.intercept('GET', '/api/barberos', { body: ['Juan', 'Pedro'] }).as(
      'getBarberosInicial',
    );
    cy.intercept('POST', '/api/barberos', {
      statusCode: 200,
      body: { success: true },
    }).as('crearBarbero');
    cy.intercept('GET', '/api/barberos', {
      body: ['Juan', 'Pedro', nuevoBarbero],
    }).as('getBarberosActualizado');

    cy.visit('/barberos');
    cy.wait('@getBarberosInicial');

    // Crear el barbero
    cy.get('input[placeholder="Nuevo barbero"]').type(nuevoBarbero);
    cy.contains('button', 'Agregar').click();
    cy.wait('@crearBarbero');
    cy.wait('@getBarberosActualizado');

    // Verificar que aparece
    cy.contains(nuevoBarbero).should('be.visible');

    // Paso 2: Ir a registrar un día para este barbero
    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/');
    cy.contains('a', 'Cargar día').click();

    // Seleccionar fecha
    cy.get('input[type="date"]').first().clear().type(fecha);
    cy.contains('button', 'Seleccionar fecha').click();
    cy.wait('@getRegistrosDiaVacio');

    // Esperar a que carguen los barberos y seleccionar el nuevo
    cy.wait('@getBarberosActualizado');
    cy.get('select[name="barbero"]').select(nuevoBarbero);
    cy.contains('button', 'Continuar').click();

    // Paso 3: Ingresar servicios
    cy.contains(`Servicios para ${nuevoBarbero}`).should('be.visible');

    // Ingresar cortes normales en efectivo
    cy.get('input[type="number"]').eq(0).clear().type('3');
    // Ingresar cortes normales en MP
    cy.get('input[type="number"]').eq(1).clear().type('2');
    // Ingresar cortes con barba en efectivo
    cy.get('input[type="number"]').eq(2).clear().type('1');
    // Ingresar cortes con barba en MP
    cy.get('input[type="number"]').eq(3).clear().type('1');

    // Agregar un corte especial
    cy.contains('button', 'Agregar corte especial').click();
    cy.get('input[type="number"]').last().clear().type('20000');
    cy.contains('button', 'Agregar').click();

    // Continuar
    cy.contains('button', 'Continuar').click();

    // Verificar que el barbero se agregó
    cy.contains('Barberos cargados').should('be.visible');
    cy.contains('li', nuevoBarbero).should('be.visible');

    // Paso 4: Cerrar día
    cy.intercept('POST', '/api/registros-dia', {
      statusCode: 200,
      body: { success: true },
    }).as('cerrarDia');

    cy.contains('button', 'Cerrar día').click();
    cy.wait('@cerrarDia');

    // Verificar redirección y toast
    cy.url().should('include', '/?diaCargada=');
    cy.contains(`Se cargó el día ${fecha}`).should('be.visible');

    // Paso 5: Verificar que aparece en registros diarios
    const registroCompleto = {
      fecha: fecha,
      barberos: [
        {
          fecha: fecha,
          barbero: nuevoBarbero,
          servicios: [
            { tipo: 'corte', efectivo: 3, mercado_pago: 2 },
            { tipo: 'corte_con_barba', efectivo: 1, mercado_pago: 1 },
          ],
          cortesEspeciales: [{ monto: 20000 }],
        },
      ],
    };

    cy.intercept('GET', '/api/registros-dia', {
      body: [registroCompleto],
    }).as('getRegistrosConNuevo');

    cy.visit('/registros-dia');
    cy.wait('@getRegistrosConNuevo');

    // Verificar que aparece el registro con la fecha
    cy.contains('15/10/2025').should('be.visible');

    // Paso 6: Verificar los totales
    // Cálculos: 3*11000 + 2*11000 + 1*12000 + 1*12000 + 20000
    // Efectivo: 3*11000 + 1*12000 = 45000
    // MP: 2*11000 + 1*12000 = 34000
    // Especiales: 20000
    // Total: 99000

    cy.contains('15/10/2025')
      .parent()
      .within(() => {
        cy.contains('Ef. $45.000').should('be.visible');
        cy.contains('MP $34.000').should('be.visible');
        cy.contains('Especiales $20.000').should('be.visible');
        cy.contains('Total: $99.000').should('be.visible');
      });

    // Expandir y verificar detalles
    cy.contains('summary', '15/10/2025').click();
    cy.contains('h3', nuevoBarbero).should('be.visible');
    cy.contains('corte — Ef: 3, MP: 2').should('be.visible');
    cy.contains('corte con barba — Ef: 1, MP: 1').should('be.visible');
    cy.contains('Cortes especiales:').should('be.visible');
    cy.contains('$20.000').should('be.visible');
  });

  it.skip('debe manejar el flujo con múltiples barberos en un día', () => {
    const fecha = '2025-10-16';

    cy.intercept('GET', '/api/barberos', {
      body: ['Juan', 'Pedro', 'Carlos'],
    }).as('getBarberos');
    cy.intercept('GET', '/api/registros-dia', { body: [] }).as(
      'getRegistrosDiaVacio',
    );

    cy.visit('/registro-dia');

    // Seleccionar fecha
    cy.get('input[type="date"]').first().clear().type(fecha);
    cy.contains('button', 'Seleccionar fecha').click();
    cy.wait('@getRegistrosDiaVacio');
    cy.wait('@getBarberos');

    // Agregar primer barbero (Juan)
    cy.get('select[name="barbero"]').select('Juan');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').eq(0).clear().type('5');
    cy.contains('button', 'Continuar').click();

    // Agregar segundo barbero (Pedro)
    cy.contains('button', 'Agregar otro barbero').click();
    cy.get('select[name="barbero"]').select('Pedro');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').eq(0).clear().type('3');
    cy.contains('button', 'Continuar').click();

    // Agregar tercer barbero (Carlos)
    cy.contains('button', 'Agregar otro barbero').click();
    cy.get('select[name="barbero"]').select('Carlos');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').eq(0).clear().type('4');
    cy.contains('button', 'Continuar').click();

    // Verificar que todos están en la lista
    cy.contains('li', 'Juan').should('be.visible');
    cy.contains('li', 'Pedro').should('be.visible');
    cy.contains('li', 'Carlos').should('be.visible');

    // Cerrar día
    cy.intercept('POST', '/api/registros-dia', {
      statusCode: 200,
      body: { success: true },
    }).as('cerrarDia');

    cy.contains('button', 'Cerrar día').click();
    cy.wait('@cerrarDia');

    // Verificar redirección
    cy.url().should('include', '/?diaCargada=');
  });

  it.skip('debe poder editar un registro existente y guardar los cambios', () => {
    const fecha = '2025-10-01';

    // Configurar registro existente
    cy.intercept('GET', '/api/registros-dia', {
      body: [
        {
          fecha: fecha,
          barberos: [
            {
              fecha: fecha,
              barbero: 'Juan',
              servicios: [{ tipo: 'corte', efectivo: 2, mercado_pago: 1 }],
            },
          ],
        },
      ],
    }).as('getRegistrosExistente');

    cy.intercept('GET', '/api/barberos', { body: ['Juan', 'Pedro'] }).as(
      'getBarberos',
    );

    // Ir a registros y editar
    cy.visit('/registros-dia');
    cy.wait('@getRegistrosExistente');

    cy.contains('summary', '1/10/2025').click();
    cy.contains('a', 'Editar día').click();

    // Esperar a que cargue el día
    cy.url().should('include', `/registro-dia?fecha=${fecha}`);
    cy.wait('@getRegistrosExistente');
    cy.wait('@getBarberos');

    // Verificar que el barbero existente está cargado
    cy.contains('Barberos cargados').should('be.visible');
    cy.contains('li', 'Juan').should('be.visible');

    // Agregar otro barbero
    cy.contains('button', 'Agregar otro barbero').click();
    cy.get('select[name="barbero"]').select('Pedro');
    cy.contains('button', 'Continuar').click();
    cy.get('input[type="number"]').eq(0).clear().type('3');
    cy.contains('button', 'Continuar').click();

    // Verificar que ambos están
    cy.contains('li', 'Juan').should('be.visible');
    cy.contains('li', 'Pedro').should('be.visible');

    // Cerrar día
    cy.intercept('POST', '/api/registros-dia', {
      statusCode: 200,
      body: { success: true },
    }).as('actualizarDia');

    cy.contains('button', 'Cerrar día').click();
    cy.wait('@actualizarDia');

    cy.url().should('include', '/?diaCargada=');
  });
});
