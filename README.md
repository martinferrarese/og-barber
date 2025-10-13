# OG Barber

Aplicación web para la gestión de costos y ganancias de una barbería.

## Scripts

- `npm run dev` – Ejecuta el servidor de desarrollo
- `npm run build` – Compila la aplicación para producción
- `npm run start` – Sirve la versión de producción
- `npm run lint` – Ejecuta ESLint
- `npm run format` – Formatea el código con Prettier
- `npm run test` – Ejecuta tests unitarios con Jest
- `npm run cypress:open` – Abre la interfaz interactiva de Cypress
- `npm run cypress:run` – Ejecuta los tests E2E en modo headless
- `npm run test:e2e` – Ejecuta todos los tests E2E (alias de cypress:run)
- `npm run test:e2e:headed` – Ejecuta los tests E2E en modo headed (ventana visible)

## Testing

### Tests Unitarios (Jest)

Los tests unitarios se encuentran en la carpeta `__tests__/` y se ejecutan con:

```bash
npm run test
```

### Tests E2E (Cypress)

Los tests End-to-End con Cypress verifican el funcionamiento completo de la aplicación simulando interacciones de usuario reales.

#### Estructura de tests

```
cypress/
├── e2e/                      # Tests E2E
│   ├── navegacion.cy.ts      # Tests de navegación entre páginas
│   ├── barberos.cy.ts        # Tests de gestión de barberos
│   ├── registro-dia.cy.ts    # Tests de registro diario
│   ├── registros-dia.cy.ts   # Tests de visualización de registros
│   └── flujo-completo.cy.ts  # Test del flujo completo E2E
├── fixtures/                 # Datos mockeados para tests
│   ├── barberos.json
│   ├── registros-dia.json
│   └── empty-*.json
└── support/                  # Comandos personalizados y configuración
    ├── commands.ts
    └── e2e.ts
```

#### Ejecutar tests E2E localmente

**Modo interactivo** (recomendado para desarrollo):

```bash
npm run cypress:open
```

**Modo headless** (para CI/CD):

```bash
npm run test:e2e
```

**Modo headed** (con ventana visible):

```bash
npm run test:e2e:headed
```

**Ejecutar un test específico**:

```bash
npx cypress run --spec "cypress/e2e/barberos.cy.ts"
```

#### Comandos personalizados

Los tests incluyen comandos helper personalizados:

- `cy.setupMockedAPIs()` - Configura interceptores con fixtures mockeadas
- `cy.setupEmptyAPIs()` - Configura interceptores con datos vacíos
- `cy.crearBarbero(nombre)` - Helper para crear un barbero
- `cy.eliminarBarbero(nombre)` - Helper para eliminar un barbero
- `cy.irARegistroDia(fecha?)` - Navega a la página de registro
- `cy.seleccionarFecha(fecha)` - Selecciona una fecha en el formulario
- `cy.cerrarDia()` - Cierra el día y guarda el registro

#### Fixtures y mocking

Los tests utilizan fixtures JSON para mockear las respuestas de la API, evitando dependencias con la base de datos real. Esto permite:

- Tests más rápidos y confiables
- Ejecutar tests sin conexión a internet
- Simular diferentes escenarios (datos vacíos, múltiples registros, etc.)

## CI/CD

Se utiliza GitHub Actions para ejecutar lint, tests unitarios y build en cada PR y push a `main` y `develop`. El despliegue a Vercel se realizará automáticamente.

El workflow de CI ejecuta:

1. **Linting** con ESLint
2. **Tests unitarios** con Jest (30 tests)
3. **Build** de Next.js para verificar que compile correctamente

**Nota:** Los tests E2E de Cypress están deshabilitados en CI/CD y solo se ejecutan localmente, ya que requieren acceso a la base de datos. Para ejecutarlos localmente usa `npm run cypress:open` o `npm run test:e2e`

## Persistencia en producción

Si configuras **Vercel KV** agrega estas variables de entorno en Vercel:

| Variable            | Descripción                         |
| ------------------- | ----------------------------------- |
| `KV_REST_API_URL`   | URL REST de la base Redis (Upstash) |
| `KV_REST_API_TOKEN` | Token de acceso REST                |

La API detecta `KV_REST_API_URL` (o las equivalentes de Upstash) y usa Redis; en desarrollo, si no existen, usa el archivo JSON local.
