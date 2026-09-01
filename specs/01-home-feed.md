# SPEC 01 — Home: feed de la guardería

> **Estado:** Implementado
> **Depende de:** ninguna
> **Fecha:** 2026-08-31
> **Objetivo:** Implementar la pantalla Feed (`references/pantallas/feed.dc.html`) como home `/` de la app, visualmente idéntica a la plantilla, con datos ficticios y componentes reutilizables, sin autenticación ni base de datos.

## Por qué existe esta spec

Es la primera pantalla del producto. Además del feed en sí, establece el sistema de diseño (tokens de color y tipografía en `@theme`) y los componentes base (sidebar, tarjeta de publicación) que reutilizarán las pantallas 04–10 del índice.

## Alcance

**In:**

- La ruta `/` renderiza el feed de staff según `references/pantallas/feed.dc.html`: sidebar (logo OpenDayCare · Sala Soles, botón «Nueva publicación», nav Feed · Niños · Avisos · Mi cuenta con Feed activo, perfil «Caro Giménez»), encabezado («GUARDERÍA · SALA SOLES», «Buenas, Caro», «12 niños · martes 17 jun»), caja compositora «Compartí un momento…», separador «PUBLICADO HOY» y las 3 publicaciones (LOGRO de Mateo, ACTIVIDAD de Mateo con placeholder de foto, ANUNCIO general).
- Sistema de diseño base: paleta y tipografías (Fredoka/Nunito) como tokens `@theme` en `app/globals.css`.
- Componentes reutilizables en `app/_components/`.
- Datos ficticios tipados en `app/_data/mock.ts`.
- Layout de grupo `(staff)` con sidebar, para que futuras pantallas de staff la hereden.
- Versión móvil: header compacto + drawer con la misma sidebar (sidebar visible ≥1024px).
- Ajustes del layout raíz: `lang="es"`, metadata «OpenDayCare», fuentes Fredoka/Nunito vía `next/font`.

**Fuera de alcance (futuras specs):**

- Las demás pantallas del índice: login, activar cuenta, crear publicación, niños, perfil de niño, agregar niño, vincular padre, avisos, mi cuenta, feed del padre, detalle de publicación, visor de foto, resumen del día, cuenta familia.
- Autenticación, base de datos y cualquier persistencia.
- Interacción real (reaccionar, comentar, editar, publicar): todos los controles son visibles pero inertes.
- Imágenes reales: la «foto» de la actividad es el placeholder punteado de la plantilla.
- Modo oscuro (se elimina el del boilerplate; la plantilla no lo define).

## Modelo de datos

```ts
// app/_data/mock.ts — fictional data, no persistence
export type PostType = "achievement" | "activity" | "announcement";

export interface Post {
  id: string;
  type: PostType;
  title: string;              // "Mateo" | "Anuncio general" (display text, Spanish)
  time: string;               // "14:20"
  publishedBy: string;        // "publicado por vos" (display text, Spanish)
  recipients: string;         // "familia de Mateo" | "toda la sala" (display text, Spanish)
  text: string;
  photoPlaceholder?: string;  // "Foto · pintando con témperas" (display text, Spanish)
  reactions: number;
  comments: number;
}

export interface StaffProfile {
  name: string;    // "Caro Giménez"
  role: string;    // "Maestra · Soles"
  initial: string; // "C"
}

export const classroom = { name: "Soles", children: 12, dateLabel: "martes 17 jun" };
export const profile: StaffProfile = { /* Caro */ };
export const posts: Post[] = [ /* the 3 posts from the template */ ];
```

Convención de esta sección: los identificadores de código van en inglés (regla de código limpio del proyecto); los valores de texto que ve el usuario final (títulos, «publicado por vos», fecha) quedan en español porque son contenido visual. Los colores de avatar y badge, y las etiquetas visibles (LOGRO, ACTIVIDAD, ANUNCIO), se resuelven por tipo en los componentes (asunto visual), no en el mock.

## Plan de implementación

1. **Tokens y raíz.** Editar `app/globals.css`: quitar dark mode y variables del boilerplate; definir tokens `@theme` con la paleta de la plantilla (fondos `#F6ECDF`/`#FFFDF9`, bordes `#ECE0D0`/`#F0E6D8`/`#E7DAC8`, textos `#3F362E`…`#A89A8B`, corales `#F4977E`/`#EE8164`/`#D9583C`/`#E0654A`/`#C5503A`, melocotón `#FBE3D8`, cielo `#A9D9E8`/`#1F7A93`, verde `#CFEBD8`/`#3E9B6C`, azul `#C7E7F1`/`#2E89A6`, índigo `#CCD8F4`/`#4E72C8`) y `--font-sans`/`--font-display`; scrollbar estilo plantilla. Editar `app/layout.tsx`: Fredoka + Nunito con `next/font` (variables `--font-fredoka`/`--font-nunito`), `lang="es"`, metadata «OpenDayCare». Verificar: `npm run dev` carga sin errores sobre fondo crema.
2. **Mock.** Crear `app/_data/mock.ts` (carpeta privada, no genera rutas) con los tipos y las 3 publicaciones + textos del encabezado. Verificar: `npx tsc --noEmit`.
3. **Componentes atómicos.** Crear en `app/_components/`: `avatar.tsx` (círculo con inicial; admite color e icono para el anuncio), `tag-badge.tsx` (píldora con punto + etiqueta por tipo), `nav-link.tsx` (ícono + texto con estado activo). Server components.
4. **PostCard.** Crear `app/_components/post-card.tsx`: encabezado (avatar/título/hora/badge), «Para: …», texto, placeholder de foto opcional y pie (reacciones, comentarios, «Editar») — enlaces inertes.
5. **Sidebar y móvil.** Crear `sidebar.tsx` (logo, botón «Nueva publicación», nav con Feed activo, perfil con «cerrar sesión» inerte) y `mobile-nav.tsx` (`"use client"`: header con hamburguesa que abre la sidebar como drawer; visible <1024px).
6. **Route group y página.** Crear `app/(staff)/layout.tsx` (Sidebar + MobileNav + `<main>`) y `app/(staff)/page.tsx` (encabezado estático, caja «Compartí un momento…», separador «PUBLICADO HOY», lista de `posts` con `PostCard`); eliminar `app/page.tsx`. Verificar: `/` renderiza el feed completo en http://localhost:3000.
7. **Verificación.** `npm run lint` + `npx tsc --noEmit`; screenshots con Playwright (desktop 1280px y móvil 375px) en `.playwright-mcp/screenshots/` con la nomenclatura del proyecto; comparación visual lado a lado con `feed.dc.html` abierto en el navegador (su `support.js` existe) y ajuste fino hasta paridad.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] `/` renderiza sin errores de consola: sidebar, encabezado, caja compositora, separador y las 3 publicaciones (LOGRO, ACTIVIDAD con placeholder de foto, ANUNCIO).
- [x] En viewport ≥1024px la composición coincide con `feed.dc.html`: sidebar fija de 248px con «Feed» activo, columna max-width 760px, Fredoka en títulos y Nunito en cuerpo, badges y paleta de la plantilla.
- [x] En viewport <1024px la sidebar se oculta, aparece el header con hamburguesa y el drawer abre/cierra.
- [x] Ningún control navega fuera de `/` (Nueva publicación, Niños, Avisos, Mi cuenta, Editar, foto, comentarios y cerrar sesión son inertes).
- [x] No queda rastro del boilerplate de create-next-app en `/`.
- [x] Screenshots de verificación (desktop y móvil) guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** datos ficticios en `app/_data/mock.ts` (elección del usuario; `_data` es carpeta privada). Facilita el futuro cambio a BD.
- **Sí:** componentes reutilizables en `app/_components/` (decisión del usuario): sidebar y tarjetas se repiten en las pantallas 04–10.
- **Sí:** Tailwind v4 + tokens `@theme` (decisión del usuario; stack del proyecto, paridad exacta con valores arbitrarios).
- **Sí:** `next/font` para Fredoka/Nunito: self-hosted, sin flash, mismo mecanismo que ya usa el layout con Geist.
- **Sí:** route group `app/(staff)/` con layout de sidebar: las pantallas staff futuras lo heredan y login/activar-cuenta quedan fuera.
- **Sí:** enlaces visibles pero inertes (decisión del usuario).
- **Sí:** móvil con header + drawer hamburguesa (decisión del usuario; no hay diseño móvil de referencia).
- **Sí:** textos del encabezado estáticos servidos desde el mock; sin lógica de fecha ni sesión.
- **Sí:** eliminar el dark mode del boilerplate: la plantilla solo define tema claro cálido.
- **No:** rutas 404 hacia pantallas futuras.
- **No:** fecha/saludo dinámicos.
- **No:** interacción de reacciones/comentarios/edición ni subida real de fotos.
- **No:** bottom tabs en móvil.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Fredoka/Nunito podrían no estar en `next/font/google` con esos pesos | Verificar contra la docs local de Next 16 en el paso 1; plan B: `<link>` de Google Fonts como la plantilla. |
| Next 16 cambia convenciones conocidas (aviso de AGENTS.md) | Leer `node_modules/next/dist/docs` (`route-groups`, `layout`, `font`) antes de los pasos que las usan. |
| «Idéntico» es subjetivo | Fuente de verdad: `feed.dc.html` en el navegador; screenshots lado a lado y ajuste iterativo. |

## Lo que **no** está en esta spec

- Las 14 pantallas restantes del índice: cada una irá en su propia spec.
- Autenticación y base de datos.
- Interacción real del feed (reacciones, comentarios, edición, compositor).
- Imágenes reales y modo oscuro.

Cada una de esas, si llega, va en su propia spec.
