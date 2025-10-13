/// <reference types="cypress" />

// ***********************************************
// Comandos personalizados para tests E2E de OG Barber
// ***********************************************

/**
 * Configura todos los interceptores de API necesarios con fixtures mockeadas
 */
Cypress.Commands.add('setupMockedAPIs', () => {
  cy.intercept('GET', '/api/barberos', { fixture: 'barberos.json' }).as(
    'getBarberos',
  );
  cy.intercept('GET', '/api/registros-dia', {
    fixture: 'registros-dia.json',
  }).as('getRegistrosDia');
});

/**
 * Configura interceptores con fixtures vacías
 */
Cypress.Commands.add('setupEmptyAPIs', () => {
  cy.intercept('GET', '/api/barberos', { fixture: 'empty-barberos.json' }).as(
    'getBarberos',
  );
  cy.intercept('GET', '/api/registros-dia', {
    fixture: 'empty-registros.json',
  }).as('getRegistrosDia');
});

/**
 * Helper para crear un barbero
 */
Cypress.Commands.add('crearBarbero', (nombre: string) => {
  cy.intercept('POST', '/api/barberos', {
    statusCode: 200,
    body: { success: true },
  }).as('crearBarbero');

  cy.get('input[placeholder="Nuevo barbero"]').type(nombre);
  cy.contains('button', 'Agregar').click();
});

/**
 * Helper para eliminar un barbero
 */
Cypress.Commands.add('eliminarBarbero', (nombre: string) => {
  cy.intercept('DELETE', `/api/barberos?nombre=${encodeURIComponent(nombre)}`, {
    statusCode: 200,
    body: { success: true },
  }).as('eliminarBarbero');
});

/**
 * Helper para navegar a la página de registro de día con fecha específica
 */
Cypress.Commands.add('irARegistroDia', (fecha?: string) => {
  if (fecha) {
    cy.visit(`/registro-dia?fecha=${fecha}`);
  } else {
    cy.visit('/registro-dia');
  }
});

/**
 * Helper para seleccionar una fecha en el formulario
 */
Cypress.Commands.add('seleccionarFecha', (fecha: string) => {
  cy.get('input[type="date"]').first().clear().type(fecha);
  cy.contains('button', 'Seleccionar fecha').click();
});

/**
 * Helper para cerrar el día y guardar el registro
 */
Cypress.Commands.add('cerrarDia', () => {
  cy.intercept('POST', '/api/registros-dia', {
    statusCode: 200,
    body: { success: true },
  }).as('cerrarDia');

  cy.contains('button', 'Cerrar día').click();
});

// Declaración de tipos TypeScript para los comandos personalizados
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      setupMockedAPIs(): Chainable<void>;
      setupEmptyAPIs(): Chainable<void>;
      crearBarbero(nombre: string): Chainable<void>;
      eliminarBarbero(nombre: string): Chainable<void>;
      irARegistroDia(fecha?: string): Chainable<void>;
      seleccionarFecha(fecha: string): Chainable<void>;
      cerrarDia(): Chainable<void>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export {};
