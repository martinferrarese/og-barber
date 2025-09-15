# OG Barber

Aplicación web para la gestión de costos y ganancias de una barbería.

## Scripts

- `npm run dev` – Ejecuta el servidor de desarrollo
- `npm run build` – Compila la aplicación para producción
- `npm run start` – Sirve la versión de producción
- `npm run lint` – Ejecuta ESLint
- `npm run format` – Formatea el código con Prettier
- `npm run test` – Ejecuta Jest

## CI/CD

Se utiliza GitHub Actions para ejecutar lint y tests en cada PR y push a `main`. El despliegue a Vercel se realizará automáticamente.

## Persistencia en producción

Si configuras **Vercel KV** agrega estas variables de entorno en Vercel:

| Variable | Descripción |
|----------|-------------|
| `KV_REST_API_URL` | URL que provee Vercel |
| `KV_REST_API_TOKEN` | Token de acceso |

La API detecta `KV_REST_API_URL` y usa KV; en desarrollo sigue usando el archivo JSON local.
