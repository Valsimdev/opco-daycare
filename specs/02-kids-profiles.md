# SPEC 02 — Kids & child profile

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-01
> **Objetivo:** Implementar las pantallas Niños (`/kids`) y Perfil de Niño (`/kids/[id]`) visualmente idénticas a sus templates `.dc.html`, reutilizando sidebar y layout existentes, con datos ficticios de 8 niños completos y versión responsiva.

## Por qué existe esta spec

Extiende la app con las dos pantallas de gestión de niños del índice, reutilizando el sistema de diseño y la sidebar del SPEC 01. Establece los componentes `KidCard`, `SearchBar`, `AlertBox`, `InfoRow` y `ParentList` que se reutilizarán en pantallas futuras (agregar niño, vincular padre).

## Alcance

**In:**

- Ruta `/kids` — lista de niños con buscador, encabezado de sala y grilla de tarjetas, según `references/pantallas/ninos.dc.html`.
- Ruta `/kids/[id]` — perfil individual de un niño con avatar, alergias, datos, y padres vinculados, según `references/pantallas/perfil-nino.dc.html`.
- Mock completo de 8 niños en `app/_data/mock.ts` con todos los campos visuales (nombre, edad, sala, avatar, padres, badges, alergias, fechas).
- Componentes reutilizables nuevos en `app/_components/`: `KidCard`, `SearchBar`, `AlertBox`, `InfoRow`, `ParentList`.
- Navegación funcional: sidebar "Niños" → `/kids`, click en niño → `/kids/[id]`, "Volver a Niños" → `/kids`.
- Versión responsiva: grilla de 2 columnas → 1 columna en móvil; perfil apilado con sidebar drawer.

**Fuera de alcance (futuras specs):**

- Pantalla "Agregar niño" (`agregar-nino.dc.html`).
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Pantalla "Resumen del día" (`resumen-dia.dc.html`).
- CRUD real (crear, editar, eliminar niños).
- Autenticación, base de datos y persistencia.
- Interacción real de "Editar" o "Vincular otro padre": botones visibles pero inertes.

## Modelo de datos

```ts
// app/_data/mock.ts — extensión del mock del SPEC 01

export interface Kid {
  id: string;
  name: string;
  age: number;
  room: string;
  avatarInitial: string;
  avatarBg: string;
  avatarTextColor: string;
  parentCount: number;
  badges: KidBadge[];
  birthDate: string;       // "12 mar 2022"
  enrollmentDate: string;  // "feb 2025"
  allergies?: string;
  parents: Parent[];
}

export interface KidBadge {
  label: string;     // "MANÍ" | "LACTOSA" | "VINCULAR"
  bg: string;
  textColor: string;
}

export interface Parent {
  name: string;
  role: string;            // "Mamá" | "Papá"
  status: "activa" | "invitación enviada";
  avatarInitial: string;
  avatarBg: string;
}
```

Los 8 niños del mock (datos extraídos de `ninos.dc.html` y `perfil-nino.dc.html`):

| # | id | Nombre | Edad | Padres | Badges |
|---|----|--------|------|--------|--------|
| 1 | `mateo-fernandez` | Mateo Fernández | 3 | 2 | MANÍ |
| 2 | `sofia-mendez` | Sofía Méndez | 2 | 1 | — |
| 3 | `benjamin-ruiz` | Benjamín Ruiz | 3 | 2 | — |
| 4 | `valentina-soto` | Valentina Soto | 2 | 0 | VINCULAR |
| 5 | `tomas-diaz` | Tomás Díaz | 3 | 1 | LACTOSA |
| 6 | `emma-castro` | Emma Castro | 2 | 1 | — |
| 7 | `lucas-romero` | Lucas Romero | 3 | 1 | — |
| 8 | `olivia-vega` | Olivia Vega | 2 | 1 | — |

Mateo (id `mateo-fernandez`) es el único con perfil completo en el mock (alergias, padres con detalle, fechas) ya que es la pantalla de referencia de `perfil-nino.dc.html`. Los demás niños tendrán datos mínimos suficientes para renderizar su tarjeta.

## Plan de implementación

1. **Extender mock.** Agregar al archivo `app/_data/mock.ts` los tipos `Kid`, `KidBadge`, `Parent` y el array `kids: Kid[]` con los 8 niños completos. Verificar: `npx tsc --noEmit`.

2. **Componente `KidCard`.** Crear `app/_components/kid-card.tsx`: avatar circular con inicial, nombre (Fredoka 600 16px), subtítulo "N años · N padre(s) vinculado(s)", badge opcional con estilo de píldora. Enlace inerte por defecto, prop `href` para navegación. Server component. Verificar: renderiza con los datos de Mateo del mock.

3. **Componente `SearchBar`.** Crear `app/_components/search-bar.tsx`: contenedor con ícono de lupa, input con placeholder "Buscar niño…", bordes y sombra del template. `"use client"` por el input. Verificar: se ve idéntico al template desktop.

4. **Componente `SectionHeader`.** Crear `app/_components/section-header.tsx`: etiqueta superior ("SALA SOLES"), conteo de niños ("8 niños"), línea separadora. Server component. Verificar: renderiza correctamente.

5. **Página `/kids`.** Crear `app/(staff)/kids/page.tsx`: encabezado "GESTIÓN / Niños" con botón "Agregar niño" (inerte), `SearchBar`, `SectionHeader`, grilla de `KidCard`s (2 columnas → 1 en móvil, `grid-cols-1 md:grid-cols-2`). Link en cada card a `/kids/${kid.id}`. Verificar: `/kids` renderiza los 8 niños en http://localhost:3000/kids.

6. **Componente `AlertBox`.** Crear `app/_components/alert-box.tsx`: caja con ícono de advertencia, fondo coral, título "Alergias y notas", texto descriptivo. Server component. Verificar: renderiza con datos de Mateo.

7. **Componente `InfoRow`.** Crear `app/_components/info-row.tsx`: fila con etiqueta y valor separados por espacio, borde inferior (excepto última). Server component. Verificar: renderiza "Fecha de nacimiento · 12 mar 2022".

8. **Componente `ParentList`.** Crear `app/_components/parent-list.tsx`: sección "PADRES VINCULADOS" con lista de padres (avatar, nombre, rol, estado, badge ACTIVA/PENDIENTE) y enlace "Vincular otro padre" (inerte). Server component. Verificar: renderiza los 2 padres de Mateo.

9. **Componente `ProfileHeader`.** Crear `app/_components/profile-header.tsx`: avatar grande (84px), nombre (Fredoka 600 28px), subtítulo "N años · Sala Soles", botón "Editar" (inerte). Server component. Verificar: renderiza correctamente.

10. **Página `/kids/[id]`.** Crear `app/(staff)/kids/[id]/page.tsx`: link "Volver a Niños", layout de dos columnas (izq: `ProfileHeader`, `AlertBox` si hay alergias, `InfoRow`s; der: botón "Resumen del día" inerte, `ParentList`). Busca el niño por `id` en el mock; si no existe, muestra mensaje genérico. Layout responsivo: 2 columnas → apilado en móvil. Verificar: `/kids/mateo-fernandez` renderiza el perfil completo.

11. **Responsividad.** Ajustar ambas páginas: grilla `grid-cols-1 md:grid-cols-2` en `/kids`, perfil `flex-col md:flex-row` con sidebar drawer en móvil (<1024px, ya implementado en SPEC 01). Verificar: vistas desktop (≥1024px) y móvil (<768px) coinciden con los templates redimensionados.

12. **Verificación.** `npm run lint` + `npx tsc --noEmit`; screenshots con Playwright de `/kids` y `/kids/mateo-fernandez` en desktop (1280px) y móvil (375px) en `.playwright-mcp/screenshots/`; comparación visual lado a lado con `ninos.dc.html` y `perfil-nino.dc.html`.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] `/kids` renderiza sin errores de consola: sidebar con "Niños" activo, encabezado "GESTIÓN / Niños", botón "Agregar niño", buscador, sección "SALA SOLES · 8 niños", grilla de 8 `KidCard`s.
- [x] Click en cualquier `KidCard` navega a `/kids/{id}` del niño.
- [x] `/kids/mateo-fernandez` renderiza sin errores: link "Volver a Niños", avatar grande, nombre, edad, sala, botón "Editar", caja de alergias (si aplica), datos de nacimiento/sala/ingreso, botón "Resumen del día", padres vinculados con estados, "Vincular otro padre".
- [x] En viewport ≥1024px la composición de `/kids` coincide con `ninos.dc.html`: sidebar fija, grilla de 2 columnas, max-width 880px.
- [x] En viewport ≥1024px la composición de `/kids/[id]` coincide con `perfil-nino.dc.html`: sidebar fija, layout de dos columnas (perfil + padres), max-width 820px.
- [x] En viewport <768px `/kids` muestra grilla de 1 columna con sidebar oculta y drawer hamburguesa funcional.
- [x] En viewport <768px `/kids/[id]` apila verticalmente (perfil arriba, padres abajo) con sidebar oculta y drawer hamburguesa funcional.
- [x] "Volver a Niños" navega a `/kids`.
- [x] Los botones "Agregar niño", "Editar", "Resumen del día" y "Vincular otro padre" son visibles pero inertes.
- [x] No queda rastro del boilerplate de create-next-app en las rutas `/kids` ni `/kids/[id]`.
- [x] Screenshots de verificación (desktop y móvil para ambas pantallas) guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** reutilizar sidebar y layout `(staff)` del SPEC 01 (confirmación del usuario). Evita duplicación.
- **Sí:** 8 niños completos en el mock (confirmación del usuario). Cubre todos los casos visuales del template.
- **Sí:** navegación funcional `/kids` → `/kids/[id]` (confirmación del usuario). Solo estas rutas navegan; botones "Agregar niño", "Editar", "Resumen del día", "Vincular otro padre" siguen inertes.
- **Sí:** versión responsiva completa con grilla 2→1 columna y perfil apilado en móvil (confirmación del usuario).
- **Sí:** solo Mateo tiene perfil completo en el mock; los demás tienen datos mínimos para la tarjeta. Reduce boilerplate innecesario hasta que se necesiten otros perfiles.
- **Sí:** IDs en kebab-case (`mateo-fernandez`) para URLs amigables.
- **No:** implementar CRUD de niños ni vinculación real de padres.
- **No:** pantallas "Agregar niño", "Vincular padre", "Resumen del día" — specs futuras.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Discrepancias de espaciado/padding vs templates | Fuente de verdad: `.dc.html` en navegador; screenshots lado a lado y ajuste iterativo. |
| Los 8 niños completos pueden hacer el mock muy largo | Si supera ~120 líneas, separar en `app/_data/mock-kids.ts`. |
| Next 16 cambia convenciones de route params (`[id]`) | Leer `node_modules/next/dist/docs` antes del paso 10. |

## Lo que **no** está en esta spec

- Pantalla "Agregar niño" (`agregar-nino.dc.html`).
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Pantalla "Resumen del día" (`resumen-dia.dc.html`).
- CRUD real de niños (crear, editar, eliminar).
- Autenticación y base de datos.
- Las demás pantallas del índice.

Cada una de esas, si llega, va en su propia spec.

## Verificación

**Fecha:** 2026-09-02
**Verificado por:** spec-verifier

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | `npm run lint` y `npx tsc --noEmit` pasan sin errores | ✅ | Ambos comandos ejecutados sin salida de error. |
| 2 | `/kids` renderiza sin errores de consola | ✅ | Snapshot confirma: sidebar con "Niños" activo (bg-peach, text-coral-800), encabezado "GESTIÓN / Niños", botón "Agregar niño" disabled, SearchBar, SectionHeader "SALA SOLES · 8 niños", 8 KidCards renderizadas. 0 errores de consola. Screenshot: `kids-desktop_2026-09-02_18-19-47.png`. |
| 3 | Click en KidCard navega a `/kids/{id}` | ✅ | Click en "Mateo Fernández" → URL cambió a `/kids/mateo-fernandez`. Confirmado por snapshot con link href `/kids/mateo-fernandez`. |
| 4 | `/kids/mateo-fernandez` renderiza sin errores | ✅ | Snapshot confirma: link "Volver a Niños" (/kids), avatar 84px con "M", nombre "Mateo Fernández" (Fredoka 28px), "3 años · Sala Soles", botón "Editar" disabled, AlertBox "Alergias y notas", InfoRows (nacimiento, sala, ingreso), botón "Resumen del día" disabled, ParentList con Lucía (ACTIVA) y Diego (PENDIENTE), "Vincular otro padre". 0 errores de consola. Screenshot: `kids-profile-desktop_2026-09-02_18-20-27.png`. |
| 5 | Desktop `/kids` coincide con `ninos.dc.html` | ✅ | Comparación visual: sidebar fija 248px, grid 2 columnas (`md:grid-cols-2`), max-width 880px, espaciado y paleta coinciden con template. |
| 6 | Desktop `/kids/[id]` coincide con `perfil-nino.dc.html` | ✅ | Comparación visual: sidebar fija 248px, layout dos columnas (`flex-col md:flex-row`), max-width 820px, avatar 84px, AlertBox coral, InfoRows con bordes, ParentList con badges. Coincide con template. |
| 7 | Mobile `/kids` responsivo | ✅ | Viewport 375px: sidebar oculta (`max-lg:hidden`), header hamburguesa "Abrir menú" visible, grid 1 columna (`grid-cols-1`), 8 KidCards. Drawer funcional: click en hamburguesa abre sidebar con navegación, "Cerrar menú" funciona. Screenshot: `kids-mobile_2026-09-02_18-21-04.png`. |
| 8 | Mobile `/kids/[id]` responsivo | ✅ | Viewport 375px: sidebar oculta, perfil apilado verticalmente (ProfileHeader + AlertBox + InfoRows arriba, Resumen + ParentList abajo). Drawer hamburguesa funcional. Screenshot: `kids-profile-mobile_2026-09-02_18-21-19.png`. |
| 9 | "Volver a Niños" navega a `/kids` | ✅ | Click en link → URL cambió de `/kids/mateo-fernandez` a `/kids`. Confirmado por snapshot. |
| 10 | Botones inertes | ✅ | "Agregar niño" tiene atributo `disabled`. "Editar" tiene atributo `disabled`. "Resumen del día" tiene atributo `disabled`. "Vincular otro padre" es `<button>` sin handler ni href — click no cambia URL ni causa errores. |
| 11 | Sin boilerplate | ✅ | `app/page.tsx` eliminado. `globals.css` limpio con `@theme`. `layout.tsx` limpio con fuentes Fredoka/Nunito. No hay texto de boilerplate ni dark mode. |
| 12 | Screenshots guardados | ✅ | 4 screenshots en `.playwright-mcp/screenshots/`: `kids-desktop_2026-09-02_18-19-47.png`, `kids-mobile_2026-09-02_18-21-04.png`, `kids-profile-desktop_2026-09-02_18-20-27.png`, `kids-profile-mobile_2026-09-02_18-21-19.png`. |
