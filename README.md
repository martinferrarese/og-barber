# OG Barber

Aplicación web para la gestión de costos y ganancias de una barbería.

## Scripts

- `npm run dev` – Ejecuta el servidor de desarrollo
- `npm run build` – Compila la aplicación para producción
- `npm run start` – Sirve la versión de producción
- `npm run lint` – Ejecuta ESLint
- `npm run format` – Formatea el código con Prettier
- `npm run test` – Ejecuta tests unitarios con Jest

## Testing

El proyecto utiliza **Jest** con **Testing Library** para tests unitarios y de integración.

### Ejecutar tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test -- --watch

# Ejecutar tests en modo CI
npm run test -- --ci
```

### Estructura de tests

Los tests se encuentran en la carpeta `__tests__/` e incluyen:

- **Tests de componentes**: Verifican el renderizado y comportamiento de componentes individuales
- **Tests de páginas**: Verifican la lógica de Server Components y renderizado
- **Tests de utilidades**: Verifican funciones helper y cálculos de negocio

### Cobertura actual

- Tests cubren: Componentes de formularios, páginas, cálculos de totales, interacciones de usuario

## CI/CD

Se utiliza GitHub Actions para ejecutar lint, tests unitarios y build en cada PR y push a `main` y `develop`. El despliegue a Vercel se realizará automáticamente.

El workflow de CI ejecuta:

1. **Linting** con ESLint para verificar calidad de código
2. **Tests unitarios** con Jest (30 tests)
3. **Build** de Next.js para verificar que compile correctamente

## Persistencia en producción

Si configuras **Vercel KV** agrega estas variables de entorno en Vercel:

| Variable            | Descripción                         |
| ------------------- | ----------------------------------- |
| `KV_REST_API_URL`   | URL REST de la base Redis (Upstash) |
| `KV_REST_API_TOKEN` | Token de acceso REST                |

La API detecta `KV_REST_API_URL` (o las equivalentes de Upstash) y usa Redis; en desarrollo, si no existen, usa el archivo JSON local.
