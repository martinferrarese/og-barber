describe('Visualización de Registros Diarios', () => {
  it('debe mostrar mensaje cuando no hay registros', () => {
    cy.setupEmptyAPIs();
    cy.visit('/registros-dia');

    cy.contains('Aún no hay registros').should('be.visible');
  });

  it('debe mostrar la lista de registros existentes', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Verificar que aparecen los registros (las fechas en formato local)
    cy.contains('1/10/2025').should('be.visible');
    cy.contains('30/9/2025').should('be.visible');
  });

  it('debe mostrar los totales correctamente calculados', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Para el día 2025-10-01:
    // Juan: 3 cortes (11000) + 2 cortes (11000) + 1 corte_con_barba (12000) + 1 corte_con_barba (12000) + especiales 15000
    // = 3*11000 + 2*11000 + 1*12000 + 1*12000 + 15000 = 33000 + 22000 + 12000 + 12000 + 15000 = 94000
    // Pero está separado por método de pago
    // Efectivo Juan: 3*11000 + 1*12000 = 33000 + 12000 = 45000
    // MP Juan: 2*11000 + 1*12000 = 22000 + 12000 = 34000
    // Pedro efectivo: 4*11000 = 44000
    // Pedro MP: 1*11000 + 2*12000 = 11000 + 24000 = 35000
    // Total efectivo: 45000 + 44000 = 89000
    // Total MP: 34000 + 35000 = 69000
    // Especiales: 15000
    // Total general: 173000

    // Buscar el primer registro y verificar sus totales
    cy.contains('1/10/2025')
      .parent()
      .within(() => {
        cy.contains('Ef. $89.000').should('be.visible');
        cy.contains('MP $69.000').should('be.visible');
        cy.contains('Especiales $15.000').should('be.visible');
        cy.contains('Total: $173.000').should('be.visible');
      });
  });

  it.skip('debe poder expandir los detalles de un registro', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Expandir el primer registro
    cy.contains('summary', '1/10/2025').click();

    // Verificar que se muestran los detalles de los barberos
    cy.contains('h3', 'Juan').should('be.visible');
    cy.contains('h3', 'Pedro').should('be.visible');

    // Verificar servicios
    cy.contains('corte — Ef: 3, MP: 2').should('be.visible');
    cy.contains('corte con barba — Ef: 1, MP: 1').should('be.visible');

    // Verificar cortes especiales
    cy.contains('Cortes especiales:').should('be.visible');
    cy.contains('$15.000').should('be.visible');
  });

  it('debe mostrar el botón de editar día dentro de los detalles', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Expandir el primer registro
    cy.contains('summary', '1/10/2025').click();

    // Verificar que existe el botón de editar
    cy.contains('a', 'Editar día').should('be.visible');
    cy.contains('a', 'Editar día')
      .should('have.attr', 'href')
      .and('include', '/registro-dia?fecha=2025-10-01');
  });

  it('debe navegar a la página de edición al hacer clic en "Editar día"', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Expandir el primer registro
    cy.contains('summary', '1/10/2025').click();

    // Click en editar
    cy.contains('a', 'Editar día').click();

    // Verificar que navegamos a la página de registro con la fecha correcta
    cy.url().should('include', '/registro-dia?fecha=2025-10-01');
    cy.contains('Registro de cortes del día 2025-10-01').should('be.visible');
  });

  it.skip('debe poder eliminar un registro', () => {
    cy.setupMockedAPIs();

    // Interceptar el DELETE
    cy.intercept('DELETE', '/api/registros-dia?fecha=2025-10-01', {
      statusCode: 200,
      body: { success: true },
    }).as('eliminarRegistro');

    // Interceptar el GET después del refresh sin el registro eliminado
    cy.intercept('GET', '/api/registros-dia', {
      body: [
        {
          fecha: '2025-09-30',
          barberos: [
            {
              fecha: '2025-09-30',
              barbero: 'Carlos',
              servicios: [
                { tipo: 'corte', efectivo: 2, mercado_pago: 3 },
                { tipo: 'corte_con_barba', efectivo: 1, mercado_pago: 0 },
              ],
            },
          ],
        },
      ],
    }).as('getRegistrosDiaActualizado');

    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Expandir el primer registro
    cy.contains('summary', '1/10/2025').click();

    // Click en eliminar
    cy.contains('button', 'Eliminar día').click();

    cy.wait('@eliminarRegistro');
    cy.wait('@getRegistrosDiaActualizado');

    // Verificar que el registro ya no aparece
    cy.contains('1/10/2025').should('not.exist');
    cy.contains('30/9/2025').should('be.visible');
  });

  it.skip('debe mostrar los registros ordenados por fecha descendente', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Verificar que el orden es correcto (más reciente primero)
    cy.get('li').first().should('contain', '1/10/2025');
    cy.get('li').last().should('contain', '30/9/2025');
  });

  it.skip('debe mostrar detalles completos de servicios por barbero', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Expandir el segundo registro (Carlos)
    cy.contains('summary', '30/9/2025').click();

    // Verificar los detalles de Carlos
    cy.contains('h3', 'Carlos').should('be.visible');
    cy.contains('corte — Ef: 2, MP: 3').should('be.visible');
    cy.contains('corte con barba — Ef: 1, MP: 0').should('be.visible');
  });

  it('debe calcular correctamente los totales para múltiples barberos', () => {
    cy.setupMockedAPIs();
    cy.visit('/registros-dia');

    cy.wait('@getRegistrosDia');

    // Para el día 2025-09-30:
    // Carlos: 2 cortes efectivo (22000) + 3 cortes MP (33000) + 1 corte_con_barba efectivo (12000)
    // Total efectivo: 34000
    // Total MP: 33000
    // Total: 67000

    cy.contains('30/9/2025')
      .parent()
      .within(() => {
        cy.contains('Ef. $34.000').should('be.visible');
        cy.contains('MP $33.000').should('be.visible');
        cy.contains('Total: $67.000').should('be.visible');
      });
  });
});
