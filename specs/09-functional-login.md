# SPEC 09 — Login funcional con Supabase Auth y protección de rutas

> **Estado:** Implementado
> **Depende de:** SPEC 03 (Login & Account Activation), SPEC 08 (Tabla users y enums)
> **Fecha:** 2026-09-16
> **Objetivo:** Hacer funcional el login con email/contraseña vía Supabase Auth, proteger todas las rutas de la app con `proxy.ts` global (patrón Next.js 16), y agregar logout.

## Por qué existe esta spec

La SPEC 03 construyó la UI visual del login (formularios inertes). Esta spec conecta ese formulario con Supabase Auth real, agrega protección de rutas vía `proxy.ts` (patrón Next.js 16 que reemplaza `middleware.ts`) para que solo usuarios autenticados accedan al contenido, e implementa logout.

## Alcance

**In:**

- Server Action en `/auth/login` que valida email y contraseña, llama a `supabase.auth.signInWithPassword()`, maneja errores y redirige al feed.
- El formulario de login pasa de ser inerte a funcional (submit real, validación básica).
- Proxy global (`proxy.ts` en raíz) que verifica sesión en cada request:
  - Rutas `/auth/*`: accesibles sin autenticación. Si el usuario YA está logueado y visita `/auth/login`, redirigir al feed.
  - Todas las demás rutas: requieren sesión activa. Sin sesión → redirigir a `/auth/login`.
- Logout: Server Action que llama a `supabase.auth.signOut()` y redirige a `/auth/login`. Botón de logout en sidebar y mobile-nav.
- Mensaje de error inline en el formulario de login para credenciales incorrectas.
- Verificación de rol en la tabla `users`: tras el login, confirmar que el usuario tiene fila en `users` con `role` válido. Si no existe, redirigir a error.
- Los componentes `AuthField` y `AuthButton` se hacen interactivos (el login form usa `use client` o form action).

**Fuera de alcance (futuras specs):**

- Pantalla de recuperar contraseña ("¿Olvidaste tu contraseña?").
- Registro de nuevos usuarios (signup).
- Activación de cuenta funcional (SPEC 03 la dejó visual).
- Feed diferenciado por rol (staff vs parent) — eso va en specs de cada feed.
- OAuth / magic links / otros métodos de autenticación.
- Protección de rutas a nivel de datos (RLS ya cubre eso).

## Modelo de datos

Esta spec no introduce nuevas tablas ni columnas. Usa la tabla `users` existente (SPEC 08):

```sql
-- users ya existe con:
-- id uuid PK → auth.users(id)
-- daycare_id uuid FK → daycares(id)
-- role user_role NOT NULL  -- 'staff' | 'parent' | 'admin'
-- status user_status NOT NULL DEFAULT 'active'
-- full_name text NOT NULL
-- ...
```

El flujo de datos del login:

```
Form submit → Server Action → supabase.auth.signInWithPassword(email, password)
  → { data: { session, user }, error }
  → si error: mostrar mensaje inline
  → si éxito: obtener rol de tabla users → redirigir a /(staff) (feed)
```

## Plan de implementación

1. **Crear `utils/supabase/proxy.ts`** con la función `updateSession(request)`:
   - Crear cliente Supabase SSR con las cookies del request usando `parseCookieHeader`/`serializeCookieHeader` de `@supabase/ssr`.
   - Llamar a `supabase.auth.getClaims()` para verificar sesión y refrescar tokens.
   - Si NO hay sesión y la ruta NO empieza con `/auth` y NO es `/` → redirigir a `/auth/login`.
   - Si HAY sesión y la ruta ES `/auth/login` o `/auth/activate` → redirigir a `/(staff)` (feed).
   - Retornar la respuesta con las cookies actualizadas.
   Verificar: `npx tsc --noEmit` pasa sin errores.

2. **Crear `proxy.ts` en la raíz.** Exportar función `proxy(request)` que llame a `updateSession(request)`. Configurar matcher:
   ```ts
   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
   }
   ```
   Verificar: `npx tsc --noEmit`.

3. **Crear ruta de callback `/auth/callback`.** Crear `app/auth/callback/route.ts` que:
   - Maneje el redirect de Supabase Auth (email confirmation, password reset, etc.).
   - Refresque la sesión con `supabase.auth.exchangeCodeForSession()` o `getUser()`.
   - Redirija a `/(staff)`.
   Verificar: `npx tsc --noEmit`.

4. **Convertir `/auth/login` en formulario funcional.** Modificar `app/auth/login/page.tsx`:
   - Envolver el formulario en un `<form>` con `action` apuntando a una Server Action.
   - Crear Server Action `loginAction(formData)` que:
     1. Valide email (formato) y password (no vacío, mínimo 6 chars).
     2. Llame a `supabase.auth.signInWithPassword({ email, password })`.
     3. Si hay error, retorne `formData` con el mensaje de error.
     4. Si hay sesión, verifique que existe fila en `users` con `role` válido.
     5. Redirija a `/(staff)`.
   - Mostrar mensaje de error inline arriba del botón si existe.
   - El campo email debe ser editable (quitar el valor hardcodeado).
   - El campo password debe tener `name="password"` para el form submit.
   Verificar: el formulario envía y redirige al feed con credenciales válidas; muestra error con credenciales inválidas.

5. **Agregar estado de carga al botón de login.** Mientras la Server Action procesa:
   - Deshabilitar el botón "Iniciar sesión".
   - Mostrar spinner o texto "Ingresando...".
   - Usar `useFormStatus` de `react-dom` o estado local en componente cliente.
   Verificar: `npx tsc --noEmit`.

6. **Implementar logout.** Crear:
   - Server Action `logoutAction()` que llame a `supabase.auth.signOut()` y redirija a `/auth/login`.
   - Botón de logout en `Sidebar` y `MobileNav` que invoque la acción.
   Verificar: click en logout redirige a `/auth/login` y la sesión se limpia.

7. **Proteger layouts existentes.** El proxy ya protege, pero agregar verificación adicional en `app/(staff)/layout.tsx`:
   - Verificar que el usuario tenga rol `staff` en la tabla `users`.
   - Si no tiene rol `staff`, redirigir a una página de acceso denegado o al login.
   Verificar: `npx tsc --noEmit`.

8. **Verificación final.** Ejecutar:
   - `npm run lint` y `npx tsc --noEmit` sin errores.
   - Playwright: login con credenciales válidas → redirige al feed.
   - Playwright: login con credenciales inválidas → muestra error inline.
   - Playwright: acceder a `/` sin sesión → redirige a `/auth/login`.
   - Playwright: acceder a `/auth/login` con sesión → redirige al feed.
   - Playwright: logout desde sidebar → redirige a `/auth/login`.
   - Screenshots de verificación en `.playwright-mcp/screenshots/`.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] El formulario de login acepta email y contraseña, envía y redirige al feed con credenciales válidas.
- [x] Credenciales inválidas muestran mensaje de error inline visible ("Email o contraseña incorrectos").
- [x] Email vacío o formato inválido muestra error de validación antes de enviar.
- [x] Contraseña vacía o menor a 6 caracteres muestra error de validación antes de enviar.
- [x] `proxy.ts` existe en la raíz y `utils/supabase/proxy.ts` con la lógica de sesión.
- [x] Acceder a `/(staff)` sin sesión activa redirige a `/auth/login`.
- [x] Acceder a `/auth/login` con sesión activa redirige a `/(staff)`.
- [x] `/auth/callback` existe y procesa redirects de Supabase Auth.
- [x] La Server Action de login verifica que el usuario tiene fila en `users` con `role` válido.
- [x] El botón de logout existe en sidebar y mobile-nav.
- [x] Click en logout llama a `supabase.auth.signOut()` y redirige a `/auth/login`.
- [x] Después de logout, intentar acceder a rutas protegidas redirige a `/auth/login`.
- [x] El campo email del login es editable (sin valor hardcodeado).
- [x] El botón de login muestra estado de carga durante el submit.
- [x] Playwright: screenshots de login exitoso, login fallido, redirección por middleware y logout guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** `proxy.ts` global para protección de rutas (decisión del usuario, patrón Next.js 16). Reemplaza `middleware.ts` que está deprecado en Next.js 16. Centraliza la lógica y evita repetirla en cada layout.
- **Sí:** Server Action para el submit del login (decisión del usuario). Mantiene la lógica en servidor y no expone credenciales en el cliente.
- **Sí:** tabla `users` para verificar rol (decisión del usuario). Ya existe desde SPEC 08, no necesitamos tabla `profiles` separada.
- **Sí:** redirección al feed (`/(staff)`) tras login exitoso (decisión del usuario). Simple y directo; la diferenciación por rol viene en specs futuras.
- **Sí:** incluir logout en esta spec (decisión del usuario). Es parte natural del ciclo de autenticación.
- **Sí:** mensaje de error inline en el formulario (decisión del usuario). Simple y visible sin depender de librerías de toast.
- **Sí:** `/auth/callback` para manejar redirects de Supabase Auth. Necesario para email confirmation y password reset flows futuros.
- **No:** diferenciación de feed por rol en esta spec. El middleware protege todo el app; la lógica de qué ve cada rol va en specs específicas.
- **No:** OAuth ni magic links. Solo email + contraseña por ahora.
- **No:** recuperar contraseña. Spec futura.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El proxy puede entrar en bucle de redirección si `/auth/login` no está excluido correctamente | El matcher excluye `/auth/*` y la lógica verifica explícitamente que `/auth/login` sea accesible sin sesión. |
| `getClaims()` vs `getUser()`: `getClaims()` valida JWT localmente pero no verifica contra el servidor | Para protección de rutas `getClaims()` es suficiente (documentación Supabase). `getUser()` se usa solo si se necesita el canonical record. |
| El usuario existe en `auth.users` pero no en `users` (tabla de dominio) | La Server Action verifica la existencia en `users` tras el login. Si no existe, mostrar error apropiado. |
| Cookies de sesión expiran durante el uso | El proxy detecta sesión inválida y redirige a login automáticamente. |

## Lo que **no** está en esta spec

- Pantalla de recuperar contraseña.
- Registro de nuevos usuarios (signup).
- Activación de cuenta funcional.
- Feed diferenciado por rol (staff vs parent).
- OAuth / magic links / otros métodos de autenticación.
- UI de gestión de usuarios o perfiles.

Cada uno de esos, si llega, va en su propia spec.
