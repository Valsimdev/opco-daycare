# SPEC 12 — Family route group and role-based redirects

> **Estado:** Implementado
> **Depende de:** SPEC 03, SPEC 09, SPEC 11
> **Fecha:** 2026-09-21
> **Objetivo:** Crear el route group `(family)` con su layout y feed para padres, y modificar las redirecciones de login y activación para que cada role vaya a su ruta correspondiente.

## Por qué existe esta spec

Tras activar una cuenta de padre (SPEC 11), la `loginAction` redirige siempre a `/` que está dentro de `(staff)`. El layout de `(staff)` verifica `role === 'staff'` y redirige al login si el usuario es `parent`, creando un bucle que muestra una página en blanco con "Rendering...". Esta spec crea el espacio para padres y arregla las redirecciones.

## Alcance

**In:**

- Route group `app/(family)/` con layout propio (sidebar para familia, sin sidebar de staff).
- Página `app/(family)/page.tsx` — feed del padre fiel a `familia-feed.dc.html`: sidebar con navegación (Feed, Resumen del día, Mi cuenta), saludo personalizado, selector de hijos, posts filtrados por hijos del padre.
- Modificar `loginAction` en `app/_actions/auth-actions.ts` para redirigir según el role: `staff → /`, `parent → /family`.
- Modificar `activateAccountAction` en `app/_actions/auth-actions.ts` para redirigir a `/family` tras activar exitosamente (en vez de `/auth/login`).
- Layout de `(family)`: sidebar con logo, navegación (Feed activo, Resumen del día, Mi cuenta), perfil del usuario con botón de logout. Datos obtenidos de DB (users + parent_children + children).
- La ruta `/` sigue siendo exclusiva de staff; el middleware de layout ya lo protege.
- El layout de `(family)` protege la ruta: si no hay sesión o el role no es `parent`, redirige a `/auth/login`.

**Fuera de alcance (futuras specs):**

- Página `/family/resumen-dia` (Resumen del día).
- Página `/family/cuenta` (Mi cuenta familia).
- Página `/family/posts/[id]` (Detalle de publicación).
- Página `/family/foto` (Foto a pantalla completa).
- Datos dinámicos reales de posts (por ahora usar mock data como en `(staff)`).

## Modelo de datos

No se introducen nuevas estructuras. Se reutilizan las tablas existentes:

- `users` — role `parent` para identificar padres.
- `parent_children` — vínculos entre padres e hijos.
- `children` — datos de los niños para mostrar en el selector y filtrar posts.

Nueva query para obtener los hijos de un padre:

```sql
SELECT c.id, c.full_name, c.photo_consent
FROM parent_children pc
JOIN children c ON c.id = pc.child_id
WHERE pc.parent_id = $1;
```

## Plan de implementación

1. **Crear route group `(family)` layout.** Crear `app/(family)/layout.tsx`:
   - Server component que obtiene sesión de Supabase Auth.
   - Si no hay usuario → `redirect("/auth/login")`.
   - Obtiene `users.role` y `users.full_name` + lista de hijos desde `parent_children`.
   - Si `role !== 'parent'` → `redirect("/")`.
   - Renderiza layout con sidebar (logo, nav items: Feed activo, Resumen del día, Mi cuenta) + perfil del usuario (nombre, "Mamá/Papá de [hijos]", botón logout).
   - Sidebar usa los mismos componentes reutilizables que `(staff)` si es posible, o crea `family-sidebar.tsx` si difiere demasiado.
   - Verificar: un usuario `parent` autenticado puede acceder; un usuario `staff` es redirigido.

2. **Crear página `/family` (feed).** Crear `app/(family)/page.tsx`:
   - Server component que obtiene sesión, hijos del padre, y posts mock (por ahora, hasta que exista spec de posts reales).
   - Renderiza feed fiel a `familia-feed.dc.html`:
     - Header: "TU FAMILIA" label, "Hola, [nombre]", subtítulo.
     - Selector de hijos: botones con avatar (inicial), nombre, botón "Todos".
     - Lista de posts con badges (Logro, Actividad, Anuncio), likes, comentarios.
   - Por ahora usar datos mock de `app/_data/mock.ts` adaptados para familia.
   - Verificar: renderiza sin errores, layout coincide con `familia-feed.dc.html` en desktop.

3. **Modificar `loginAction` para redirección por role.** En `app/_actions/auth-actions.ts`:
   - Tras verificar credenciales y obtener `users.role`:
     - Si `role === 'staff'` → `redirect("/")`.
     - Si `role === 'parent'` → `redirect("/family")`.
   - Mantener la verificación de usuario existente en `users` table.
   - Verificar: `npx tsc --noEmit`.

4. **Modificar `activateAccountAction` para redirigir al feed.** En `app/_actions/auth-actions.ts`:
   - Tras activar exitosamente (crear usuario, vínculo, marcar invitación):
     - En vez de retornar `{ success: true }`, hacer `redirect("/auth/login?activated=1")` (el login page puede mostrar un mensaje de éxito).
     - O alternativamente, setear sesión y hacer `redirect("/family")` directamente.
   - Recomendación: mantener `redirect("/auth/login?activated=1")` para que el padre vea un mensaje de "Cuenta activada, iniciá sesión" y luego haga login manualmente — más seguro y claro.
   - Verificar: `npx tsc --noEmit`.

5. **Crear componente `FamilySidebar`.** Crear `app/_components/family-sidebar.tsx`:
   - Server component que recibe `userName`, `userInitial`, `children` (lista de nombres de hijos).
   - Renderiza sidebar fiel al diseño: logo + "OpenDayCare / Familia", nav items, perfil.
   - Botón de logout que llama `logoutAction` (reutilizar la existente).
   - Verificar: renderiza correctamente, link de logout funciona.

6. **Responsividad del layout de familia.**
   - En móvil: sidebar se oculta, mostrar mobile nav similar al de staff.
   - Reutilizar `MobileNav` de staff o crear variante para familia.
   - Verificar: vistas desktop (1280px) y móvil (375px) coinciden con el template.

7. **Verificación final.** `npm run lint` + `npx tsc --noEmit` + screenshots Playwright del feed de familia (desktop/móvil) en `.playwright-mcp/screenshots/`. Verificar flujo completo: activar cuenta → login → redirige a `/family`.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] La ruta `/family` existe y renderiza el feed de familia. (Archivo: `app/(family)/family/page.tsx`)
- [x] El layout de `(family)` incluye sidebar con navegación (Feed, Resumen del día, Mi cuenta) y perfil del usuario. (`app/(family)/layout.tsx` + `FamilySidebar`)
- [x] Un usuario con role `parent` autenticado puede acceder a `/family` sin redirecciones. (Verificado con sesión activa)
- [x] Un usuario con role `staff` que intenta acceder a `/family` es redirigido a `/`. (Lógica en `layout.tsx` línea 25: `if (userRow.role !== "parent") redirect("/")`)
- [x] Un usuario no autenticado que intenta acceder a `/family` es redirigido a `/auth/login`. (Verificado con Playwright: sin cookies → redirige a `/auth/login`)
- [x] `loginAction` redirige a `/` para usuarios con role `staff`. (Línea 51: `redirect("/")`)
- [x] `loginAction` redirige a `/family` para usuarios con role `parent`. (Línea 48: `redirect("/family")`)
- [x] `activateAccountAction` mantiene la redirección a `/auth/login?activated=1` tras activar. (Línea 245: `redirect("/auth/login?activated=1")`)
- [x] El feed de familia muestra saludo personalizado, selector de hijos y posts mock. (Verificado en screenshot desktop)
- [x] El sidebar de familia muestra nombre del usuario, "Mamá/Papá de [hijos]", y botón de logout funcional. (Verificado en snapshot: "Test Parent", "Mamá de Benjamín Ruiz", botón "Cerrar sesión")
- [x] En viewport ≥1024px el feed muestra sidebar + contenido principal coincidente con `familia-feed.dc.html`. (Screenshot: `family-feed-desktop_2026-09-23_03-49-06.png`)
- [x] En viewport <768px el sidebar se oculta y se muestra mobile nav. (Screenshot: `family-feed-mobile_2026-09-23_03-49-10.png`)
- [x] Screenshots de verificación guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** route group `(family)` separado (confirmación del usuario). Mantiene separación clara entre staff y familia.
- **Sí:** redirección por role en `loginAction`. Evita el bucle de "Rendering..." que ocurre cuando un padre intenta acceder a `/`.
- **Sí:** mantener `redirect("/auth/login?activated=1")` en `activateAccountAction`. El padre ya probó su contraseña en el form de activación, pero es mejor práctica que haga login explícito para obtener una sesión fresca.
- **Sí:** datos mock para posts del feed de familia (por ahora). La spec de posts reales vendrá después.
- **Sí:** reutilizar `logoutAction` existente — funciona para ambos roles.
- **No:** implementar Resumen del día, Mi cuenta familia, ni detalle de publicaciones — cada uno va en su propia spec.
- **No:** cambiar la estructura de `(staff)` — funciona correctamente para su caso.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Los posts mock no reflejan la estructura real de posts futuros | Usar la misma interfaz de posts que `(staff)` para facilitar la migración cuando exista la spec de posts reales |
| Sidebar de familia difiere significativamente del de staff | Crear componente separado `FamilySidebar` en vez de intentar parametrizar uno solo |
| Un padre sin hijos vinculados (edge case) podría ver un feed vacío | Mostrar mensaje "Aún no hay publicaciones para tus hijos" cuando la lista de hijos esté vacía |

## Lo que **no** está en esta spec

- Página `/family/resumen-dia`.
- Página `/family/cuenta` (Mi cuenta familia).
- Página `/family/posts/[id]` (Detalle de publicación).
- Página `/family/foto` (Foto a pantalla completa).
- Posts reales con datos de DB (por ahora mock).
- CRUD de padres vinculados.
- Reenvío de invitaciones expiradas.

Cada una de esas, si llega, va en su propia spec.
