# SPEC 03 — Login & Account Activation

> **Estado:** Implementado
> **Depende de:** ninguna
> **Fecha:** 2026-09-02
> **Objetivo:** Implementar las pantallas de login (`/auth/login`) y activar cuenta (`/auth/activate`) visualmente idénticas a sus templates `.dc.html`, sin sidebar, con navegación real entre ambas y componentes reutilizables.

## Por qué existe esta spec

Son las dos pantallas de autenticación del producto. Establecen el route group `(auth)` sin sidebar y los componentes reutilizables `AuthField`, `AuthButton`, `AuthLogo` y `InviteCard` que se usarán en futuras pantallas (vincular padre, recuperar contraseña).

## Alcance

**In:**

- Ruta `/auth/login` — formulario de login según `references/pantallas/login.dc.html`: panel izquierdo con branding (logo, título, descripción), panel derecho con formulario (email, contraseña, link «¿Olvidaste tu contraseña?», botón «Iniciar sesión», link a activar cuenta).
- Sección "INGRESO COMO" (botones Personal/Familia) oculta con `display: none` pero presente en el código para uso futuro.
- Ruta `/auth/activate` — formulario de activación según `references/pantallas/activar-cuenta.dc.html`: tarjeta de invitación ("Te invitaron a seguir a Mateo · Sala Soles"), código de invitación, email, crear contraseña, checkbox de autorización de fotos, botón «Activar mi cuenta», link a login.
- Ambas pantallas sin sidebar, centradas vertical y horizontalmente.
- Route group `(auth)` con layout compartido sin sidebar.
- Navegación real entre `/auth/login` ↔ `/auth/activate`.
- Componentes reutilizables en `app/_components/`: `AuthField`, `AuthButton`, `AuthLogo`, `InviteCard`.
- Versión 100% responsiva: panel de branding se oculta en móvil, formulario centrado.

**Fuera de alcance (futuras specs):**

- Autenticación real, validación de formularios, envío de datos.
- Pantalla «¿Olvidaste tu contraseña?».
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Feed de staff o feed de familia (ya cubiertos por otras specs).
- Datos dinámicos: todo es estático/visual.

## Modelo de datos

Esta spec no introduce nuevas estructuras de datos. Reutiliza los tokens de diseño de `app/globals.css` (SPEC 01). Los datos visuales (textos, valores de ejemplo) son estáticos en las páginas.

## Plan de implementación

1. **Route group `(auth)`.** Crear `app/(auth)/layout.tsx`: layout simple con fondo crema (`#FBF4EC`), sin sidebar, sin mobile-nav. Solo un `<div>` contenedor con `min-h-screen`. Server component. Verificar: ruta accesible sin errores.

2. **Componentes atómicos de auth.** Crear en `app/_components/`:
   - `auth-logo.tsx`: icono SVG del sol con fondo degradado + texto "OpenDayCare" (Fredoka 600). Server component.
   - `auth-field.tsx`: label + input estilizado (bordes redondeados, fondo blanco, padding). Server component.
   - `auth-button.tsx`: botón con degradado coral, sombra y bordes redondeados. Server component.
   Verificar: `npx tsc --noEmit`.

3. **Página `/auth/login`.** Crear `app/(auth)/login/page.tsx`:
   - Layout de dos columnas (grid 1.05fr / 1fr) en desktop, una columna en móvil.
   - Panel izquierdo: branding con círculos decorativos, logo, título "El día de cada niño, compartido con su familia.", descripción, badge "Guardería Sala Soles". Se oculta en móvil (`hidden lg:flex`).
   - Panel derecho: título "Iniciar sesión", subtítulo, sección "INGRESO COMO" con `display: none` (botones Personal/Familia con iconos SVG), campos email y contraseña, link «¿Olvidaste tu contraseña?», botón «Iniciar sesión», link «¿Te invitó la guardería? Activá tu cuenta» → `/auth/activate`.
   - Todos los enlaces funcionales; inputs y botones visuales/inertes.
   Verificar: `/auth/login` renderiza idéntico al template en http://localhost:3000/auth/login.

4. **Componente `InviteCard`.** Crear `app/_components/invite-card.tsx`: tarjeta con avatar circular (inicial, fondo cielo), texto "Te invitaron a seguir a" y nombre del niño + sala. Server component. Verificar: renderiza con datos de Mateo.

5. **Página `/auth/activate`.** Crear `app/(auth)/activate/page.tsx`:
   - Layout centrado (flex, alineación center), max-width 440px.
   - Logo arriba, título "Bienvenida a OpenDayCare", subtítulo.
   - `InviteCard` con datos de Mateo · Sala Soles.
   - Campo "Código de invitación" (valor "7K4P9", fuente Fredoka, letter-spacing).
   - Campo email (valor ejemplo), campo "Crear contraseña" (con borde naranja indicando foco visual).
   - Checkbox de autorización de fotos (pre-marcado, caja verde con check SVG, texto explicativo).
   - Botón «Activar mi cuenta» → link funcional a `/` (o feed).
   - Link «¿Ya tenés cuenta? Iniciar sesión» → `/auth/login`.
   Verificar: `/auth/activate` renderiza idéntico al template en http://localhost:3000/auth/activate.

6. **Responsividad.** Ajustar ambas pantallas:
   - Login: panel izquierdo se oculta en móvil (`hidden lg:block`), formulario ocupa todo el ancho con padding.
   - Activate: centrado con padding adecuado en pantallas pequeñas.
   Verificar: vistas desktop (1280px) y móvil (375px) coinciden con los templates.

7. **Verificación.** `npm run lint` + `npx tsc --noEmit`; screenshots con Playwright de ambas pantallas en desktop (1280px) y móvil (375px) en `.playwright-mcp/screenshots/`; comparación visual lado a lado con `login.dc.html` y `activar-cuenta.dc.html`.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] `/auth/login` renderiza sin errores de consola: panel de branding izquierdo (logo, título, descripción, badge), formulario derecho (título, subtítulo, campos email y contraseña, link "Olvidaste tu contraseña", botón "Iniciar sesión", link a activar cuenta).
- [x] La sección "INGRESO COMO" existe en el DOM pero está oculta (`display: none`).
- [x] `/auth/activate` renderiza sin errores: logo, título, subtítulo, InviteCard (Mateo · Sala Soles), campo código invitación, email, contraseña, checkbox autorización, botón "Activar mi cuenta", link a login.
- [x] Link "Activá tu cuenta" en login navega a `/auth/activate`.
- [x] Link "Iniciar sesión" en activate navega a `/auth/login`.
- [x] En viewport ≥1024px login muestra layout de dos columnas coincidente con `login.dc.html`.
- [x] En viewport ≥1024px activate muestra formulario centrado (max-width 440px) coincidente con `activar-cuenta.dc.html`.
- [x] En viewport <768px login oculta panel izquierdo y muestra solo formulario centrado con padding.
- [x] En viewport <768px activate mantiene centrado con padding adecuado.
- [x] Fredoka en títulos, Nunito en cuerpo de texto.
- [x] Paleta idéntica al template (fondos, bordes, degradados coral, badge verde checkbox).
- [x] No queda rastro del boilerplate de create-next-app en las rutas `/auth/login` ni `/auth/activate`.
- [x] Screenshots de verificación (desktop y móvil para ambas pantallas) guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** ruta `/auth/login` y `/auth/activate` (confirmación del usuario). Seguir convención de ruta con prefijo `/auth`.
- **Sí:** navegación real entre ambas pantallas (confirmación del usuario).
- **Sí:** formularios visuales/inertes, sin validación ni envío (confirmación del usuario; coherente con specs anteriores).
- **Sí:** sección "INGRESO COMO" oculta con `display: none` (pedido del usuario). Facilita habilitarla en el futuro sin reescribir.
- **Sí:** route group `(auth)` sin sidebar. Las pantallas de autenticación no necesitan navegación lateral.
- **Sí:** checkbox de autorización de fotos pre-marcado visualmente (como el template).
- **Sí:** InviteCard con datos estáticos de Mateo (coherente con mock del SPEC 02).
- **No:** lógica de autenticación, validación, ni persistencia.
- **No:** pantalla de recuperar contraseña — spec futura.
- **No:** datos dinámicos de invitación — siempre muestra a Mateo · Sala Soles hasta que exista la spec de vincular padre.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Panel de branding en login puede verse comprimido en pantallas intermedias (768px–1024px) | Usar `hidden lg:block` (breakpoint 1024px de Tailwind) para ocultarlo completamente debajo de ese ancho. |
| Los campos de formulario pueden no coincidir exactamente en padding/bordes con el template | Fuente de verdad: `.dc.html` en navegador; screenshots lado a lado y ajuste iterativo. |
| El checkbox pre-marcado necesita SVG inline del check | Extraer el SVG directamente del template (ya existe en `activar-cuenta.dc.html`). |

## Lo que **no** está en esta spec

- Autenticación real, login funcional, validación de formularios.
- Pantalla de recuperar contraseña.
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Datos dinámicos de invitación (siempre muestra a Mateo).
- Las demás pantallas del índice.

Cada una de esas, si llega, va en su propia spec.
