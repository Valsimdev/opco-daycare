# SPEC 06 — Create post modal

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-04
> **Objetivo:** Implementar un modal reutilizable y 100% responsivo para crear publicaciones desde el sidebar, fiel al template `crear-publicacion.dc.html`, con estados interactivos y cierre por múltiples vías.

## Por qué existe esta spec

El botón "+ Nueva publicación" en el sidebar actualmente navega a `/crear-publicacion`. Esta spec lo convierte en un modal funcional sobre cualquier página, con los campos del diseño `crear-publicacion.dc.html`, usando datos del mock para los niños y con cierre por múltiples vías.

## Alcance

**In:**

- Modal overlay que se abre al hacer click en "+ Nueva publicación" del sidebar.
- Campos del formulario según `crear-publicacion.dc.html`:
  - **Para:** botones tipo píldora con los nombres de los niños (del mock) + botón "Toda la sala". Selección visual (solo uno).
  - **Tipo:** botones de categoría — Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio. Selección visual (solo uno).
  - **Descripción:** textarea con placeholder "Contá cómo le fue hoy…".
  - **Fotos:** thumbnail placeholder + botón "Agregar" que abre el file picker nativo sin subida ni preview.
- Header con "Cancelar" (gris `#94887B`), título "Nueva publicación" (Fredoka 600 18px), "Publicar" (coral `#D9583C`).
- Cierre por cuatro vías: botón "Cancelar", click fuera del modal (overlay), tecla Escape, botón "Publicar".
- Botón "Publicar" cierra el modal sin toast ni persistencia (patrón de specs anteriores).
- Componente reutilizable en `app/_components/` que puede usarse desde cualquier página.
- 100% responsivo: tarjeta centrada en desktop (max-width 580px), casi pantalla completa con padding en móvil (<640px).
- Estética fiel a `crear-publicacion.dc.html`: paleta, bordes redondeados 24px, sombra, inputs con bordes redondeados 14px y fondo blanco.

**Fuera de alcance (futuras specs):**

- Persistencia real de la publicación (sin BD, sin mock update).
- Preview de fotos subidas.
- Validación de campos obligatorios.
- CRUD de publicaciones.

## Modelo de datos

```ts
interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}
```

Los nombres de los niños se obtienen del mock actual:

```ts
// app/_data/mock.ts
interface Child {
  id: string;
  name: string;
  initial: string;
  variant: string; // color del avatar
}
```

Tipos de publicación hardcodeados con colores del template:

```ts
const postTypes = [
  { label: "Comida", color: "#9A7B1E", textColor: "#fff" },
  { label: "Siesta", color: "#E7DCF6", textColor: "#7B5FC0" },
  { label: "Actividad", color: "#2E89A6", textColor: "#fff" },
  { label: "Logro", color: "#CFEBD8", textColor: "#3E9B6C" },
  { label: "Ánimo", color: "#F9D2DE", textColor: "#C56486" },
  { label: "Foto", color: "#FBD8CC", textColor: "#D9684A" },
  { label: "Anuncio", color: "#CCD8F4", textColor: "#4E72C8" },
] as const;
```

## Plan de implementación

1. **Componente `CreatePostModal`** (`app/_components/create-post-modal.tsx`, `"use client"`):
   - Props: `{ open: boolean; onClose: () => void }`.
   - Overlay: fixed inset-0 z-50, fondo semitransparente oscuro, cierra con click fuera.
   - Tarjeta: centrada, max-width 580px, fondo `#FBF4EC`, borde `#ECE0D0`, border-radius 24px, sombra. En móvil (<640px): width ~100%, margin 16px, border-radius 16px.
   - Header: fila con "Cancelar" (gris `#94887B`), "Nueva publicación" (Fredoka 600 18px), "Publicar" (coral `#D9583C`).
   - Sección "Para": botones píldora con avatares de niños (del mock) + "Toda la sala". Selección única visual.
   - Sección "Tipo": 7 botones de categoría con colores hardcodeados. Selección única visual.
   - Sección "Descripción": textarea con placeholder, min-height 120px, resize vertical.
   - Sección "Fotos": thumbnail placeholder + botón "Agregar" que abre file picker nativo.
   - "Publicar" → `onClose()`.
   - "Cancelar" → `onClose()`.
   - Escape → cerrar.
   - Click overlay → cerrar.
   - `overflow-hidden` al body cuando abierto.
   - Verificar: compila sin errores.

2. **Integrar en el sidebar.** Editar `app/_components/sidebar.tsx`:
   - Agregar estado `showCreatePostModal`.
   - Cambiar `<Link href="/crear-publicacion">` por `<button onClick>` que abre el modal.
   - Renderizar `<CreatePostModal />` dentro del sidebar.
   - Verificar: click abre modal.

3. **Responsividad:** desktop vs móvil (<640px).

4. **Verificación:** `npm run lint` + `npx tsc --noEmit` + screenshots Playwright desktop (1280px) y móvil (375px).

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] El botón "+ Nueva publicación" en el sidebar abre el modal al hacer click.
- [x] El modal renderiza las 4 secciones: Para, Tipo, Descripción, Fotos.
- [x] Labels coinciden con el template: PARA, TIPO, DESCRIPCIÓN, FOTOS.
- [x] Header: "Cancelar" (gris `#94887B`), "Nueva publicación" (Fredoka 600 18px), "Publicar" (coral `#D9583C`).
- [x] Sección "Para" muestra botones con avatares de niños (del mock) + botón "Toda la sala".
- [x] Sección "Tipo" muestra 7 botones: Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio, con colores del template.
- [x] Textarea con placeholder "Contá cómo le fue hoy…", min-height 120px.
- [x] Fotos: thumbnail placeholder + botón "Agregar".
- [x] Click en "Cancelar" cierra el modal.
- [x] Click fuera del modal (overlay) cierra el modal.
- [x] Tecla Escape cierra el modal.
- [x] Click en "Publicar" cierra el modal sin toast ni mensajes.
- [x] Selección visual única en "Para" y "Tipo" (estilos de seleccionado vs no seleccionado).
- [x] En viewport ≥640px: tarjeta centrada (max-width 580px, border-radius 24px).
- [x] En viewport <640px: casi pantalla completa con padding (border-radius 16px).
- [x] Fredoka en título, Nunito en labels y campos.
- [x] Paleta idéntica al template (`#FBF4EC`, `#ECE0D0`, `#EADFD0`, coral, gris).
- [x] `CreatePostModal` es reutilizable y exportado desde `app/_components/`.
- [x] Botón "Agregar" en fotos abre file picker nativo.
- [x] Screenshots guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** modal overlay desde el sidebar, sin navegar a `/crear-publicacion` (confirmación del usuario).
- **Sí:** cierre por 4 vías — Cancelar, click fuera, Escape, Publicar (confirmación del usuario).
- **Sí:** datos de niños del mock actual (confirmación del usuario).
- **Sí:** "Publicar" solo cierra el modal, sin toast (confirmación del usuario).
- **Sí:** file picker nativo en "Agregar" sin subida ni preview (confirmación del usuario).
- **Sí:** componente `"use client"` por la interactividad.
- **No:** validación de campos obligatorios (no está en el template).
- **No:** persistencia de la publicación.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Modal no centrado en ciertos viewports | `fixed inset-0 flex items-center justify-center` con padding responsive |
| Scroll del body bloqueado | `overflow-hidden` al body con useEffect |
| Discrepancias de estilo vs template | Screenshots lado a lado y ajuste iterativo |
| Sidebar como layout padre puede afectar z-index | z-50 en overlay, verificar stacking context |

## Lo que **no** está en esta spec

- Persistencia real de la publicación.
- Preview de fotos subidas.
- Validación de campos obligatorios.
- CRUD de publicaciones.
- Pantallas "Resumen del día" ni demás del índice.

Cada una de esas, si llega, va en su propia spec.

## Verificación (2026-09-05)

- `npm run lint` (0 errores) y `npx tsc --noEmit` sin errores; `npm run build` compila (genera `next-env.d.ts`, necesario para tsc en un clon fresco).
- 35/35 checks de comportamiento verificados con Playwright (Chromium headless): apertura desde el sidebar, 4 vías de cierre, selección única en Para/Tipo, colores y tipografías por estilos computados, geometría desktop (580px / radio 24px, centrada) y móvil (343px / radio 16px, padding 16px).
- Correcciones aplicadas durante la verificación: radios responsivos invertidos (móvil 16px / ≥640px 24px), selección única en "Para" (era múltiple y "Toda la sala" no se podía seleccionar desde cero), colores exactos del template (placeholder `#B6A99B`, icono del thumbnail `#CBB89F`, ring-offset `#FBF4EC`) y scroll interno de la tarjeta en todos los viewports.
- Screenshots en `.playwright-mcp/screenshots/`: `create-post-modal-desktop_…` (1280px), `create-post-modal-seleccion_…` (selecciones activas) y `create-post-modal-movil_…` (375px).
