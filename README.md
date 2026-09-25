# Open Daycare

App de gestión para una guardería. Desarrollada con Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4 y Supabase.

## Requisitos previos

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/) o tu gestor de paquetes preferido
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (opcional, para desarrollo local con Supabase)

## Instalación

1. Clona el repositorio e instala las dependencias:

```bash
npm install
```

2. Copia el archivo de variables de entorno y completa los valores:

```bash
cp .env.template .env.local
```

Edita `.env.local` con las credenciales de tu proyecto Supabase y otros servicios:

```env
SUPABASE_DB_PASSWORD = XXXXXX

# https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxx

SUPABASE_SERVICE_ROLE_KEY=xxxxxx

# https://resend.com
RESEND_API_KEY=re_xxxxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Supabase

### Autenticación del MCP

Para que OpenCode pueda usar el servidor MCP de Supabase, necesitas autenticarlo:

```bash
opencode mcp auth supabase
```

Este comando abre el navegador para iniciar sesión en tu cuenta de Supabase y vincula el token de acceso con OpenCode.

### Autenticación con el CLI

Para usar los comandos locales del CLI de Supabase:

```bash
npx supabase login
```

Este comando abrirá el navegador para que inicies sesión en [https://supabase.com/dashboard](https://supabase.com/dashboard). Una vez autenticado, obtendrás un token de acceso que se guarda localmente.

### Enlazar un proyecto remoto

Si aún no has enlazado el proyecto local con tu proyecto remoto de Supabase:

```bash
npx supabase link --project-ref <tu-project-ref>
```

El `<tu-project-ref>` lo encuentras en la URL del dashboard: `https://supabase.com/dashboard/project/<tu-project-ref>`.

### Levantar Supabase localmente

Para correr toda la pila de Supabase en local (Postgres, Auth, Studio, Edge Functions, etc.):

```bash
npx supabase start
```

Esto levantará los servicios en los puertos definidos en `supabase/config.toml`:

| Servicio     | Puerto |
|--------------|--------|
| API (Kong)   | 54321  |
| Base de datos| 54322  |
| Studio       | 54323  |
| SMTP (Mailpit)| 54324 |
| Analytics    | 54327  |

### Aplicar migraciones

Las migraciones se encuentran en `supabase/migrations/`. Para aplicarlas al entorno local:

```bash
npx supabase db push
```

### Edge Functions

Para servir las Edge Functions localmente:

```bash
npx supabase functions serve
```

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |

## Estructura del proyecto

- `app/` — Rutas y componentes de Next.js (App Router)
- `supabase/` — Configuración de Supabase, migraciones y Edge Functions
- `specs/` — Especificaciones de features (desarrollo spec-driven)
- `references/` — Diseños HTML (`.dc.html`), screenshots y schema de BD
- `utils/supabase/` — Helpers para crear clientes de Supabase (server, client, middleware)
