# SPEC 04 — Add child modal

> **Estado:** Aprobado
> **Depende de:** SPEC 02
> **Fecha:** 2026-09-03
> **Objetivo:** Implementar un modal reutilizable y 100% responsivo para agregar niños desde la pantalla `/kids`, con validación visual de campos obligatorios y los campos del template `agregar-nino.dc.html`.

## Por qué existe esta spec

El botón "Agregar niño" en `/kids` es actualmente inerte (disabled). Esta spec lo convierte en un modal funcional sobre la misma página, con los campos del diseño `agregar-nino.dc.html`, validación visual y cierre por múltiples vías.

## Alcance

**In:**

- Modal overlay que se abre al hacer click en "Agregar niño" sobre `/kids`.
- Campos del formulario según `agregar-nino.dc.html`: Nombre completo (obligatorio), Fecha de nacimiento (obligatorio), Sala con `<select>` hardcodeado (obligatorio), Alergias (etiquetas, opcional), Notas médicas (textarea, opcional).
- Validación visual: mensajes de error en rojo bajo cada campo obligatorio vacío al intentar guardar.
- Validación de formato de fecha (dd/mm/aaaa) y que sea una fecha real (no 31/02/2025, no 29/02/2023).
- Cierre del modal por tres vías: botón "Cancelar", click fuera del modal (overlay), tecla Escape.
- Botón "Guardar" cierra el modal sin toast ni persistencia.
- Componente reutilizable en `app/_components/` que puede usarse desde cualquier página.
- 100% responsivo: tarjeta centrada en desktop, pantalla casi completa con padding en móvil (<640px).
- Estética fiel a `agregar-nino.dc.html`: tarjeta `#FBF4EC` con borde `#ECE0D0`, bordes redondeados 24px, sombra, header con Cancelar/Título/Guardar, inputs con bordes redondeados 14px y fondo blanco.

**Fuera de alcance (futuras specs):**

- Persistencia real del niño agregado (sin BD, sin mock update).
- Detección de nombres duplicados.
- CRUD completo (editar, eliminar niños).
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Pantalla "Resumen del día" (`resumen-dia.dc.html`).

## Modelo de datos

Esta spec no introduce nuevas estructuras de datos permanentes. Se agrega un array de salas hardcodeado para el `<select>`:

```ts
// app/_data/mock.ts — extensión
export const rooms = ["Soles", "Lunas", "Estrellas"] as const;
```

## Plan de implementación

1. **Agregar salas al mock.** Añadir `export const rooms` en `app/_data/mock.ts`. Verificar: `npx tsc --noEmit`.

2. **Utilidad de validación de fecha.** Crear `app/_lib/validate-date.ts` con función que:
   - Valide formato dd/mm/aaaa (regex `^\d{2}/\d{2}/\d{4}$`).
   - Parse day, month, year y valide que sea una fecha real (usar `new Date(year, month - 1, day)` y verificar que day/month/year coincidan, para descartar 31/02 o 29/02 en año no bisiesto).
   - Retorne `{ valid: true }` o `{ valid: false; message: string }`.
   Verificar: `npx tsc --noEmit`.

3. **Componente `AddChildModal`.** Crear `app/_components/add-child-modal.tsx` (`"use client"`):
   - Props: `{ open: boolean; onClose: () => void }`.
   - Overlay: fondo semitransparente oscuro, fixed inset-0, z-50, cierra con click.
   - Tarjeta: centrada con flex, max-width 520px, fondo `#FBF4EC`, borde `#ECE0D0`, border-radius 24px, sombra. En móvil (<640px): width ~100%, margin 16px, border-radius 16px.
   - Header: fila con "Cancelar" (gris `#94887B`), título "Agregar niño" (Fredoka 600 18px), "Guardar" (coral `#D9583C`).
   - Formulario con estado local: `fullName`, `birthDate`, `room`, `allergies`, `medicalNotes`.
   - Estado de errores: `errors: { fullName?: string; birthDate?: string; room?: string }`.
   - Al hacer "Guardar":
     - Nombre vacío → error "El nombre es obligatorio".
     - Fecha vacía → error "La fecha de nacimiento es obligatoria".
     - Fecha con formato inválido → error "Formato inválido. Usá dd/mm/aaaa".
     - Fecha que no es real → error "La fecha no es válida".
     - Sala no seleccionada → error "La sala es obligatoria".
     - Todo ok → llamar `onClose()`.
   - Al hacer "Cancelar": llamar `onClose()`.
   - Tecla Escape: cerrar modal.
   - Click en overlay: cerrar modal.
   - Inputs estilizados como el template.
   - `<select>` para Sala con `appearance-none` + chevron SVG.
   - Verificar: el componente compila sin errores.

4. **Integrar modal en `/kids`.** Editar `app/(staff)/kids/page.tsx`:
   - Agregar estado `showAddModal: boolean`.
   - Cambiar botón "Agregar niño": quitar `disabled`, agregar `onClick`.
   - Renderizar `<AddChildModal />`.
   - Verificar: click abre modal.

5. **Responsividad.** Ajustar el modal para desktop y móvil (<640px).

6. **Verificación.** `npm run lint` + `npx tsc --noEmit`; screenshots con Playwright del modal en desktop (1280px) y móvil (375px).

## Criterios de aceptación

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] El botón "Agregar niño" en `/kids` ya no tiene `disabled` y abre el modal al hacer click.
- [ ] El modal renderiza con los 5 campos: Nombre completo, Fecha de nacimiento, Sala (select), Alergias, Notas médicas.
- [ ] Los labels coinciden con el template (NOMBRE COMPLETO, FECHA DE NACIMIENTO, SALA, ALERGIAS (ETIQUETAS), NOTAS MÉDICAS).
- [ ] Los inputs y select tienen el estilo del template (bordes redondeados 14px, fondo blanco, borde `#EADFD0`, padding 13px 16px).
- [ ] El header del modal tiene "Cancelar" (gris), "Agregar niño" (Fredoka 600), "Guardar" (coral).
- [ ] Click en "Cancelar" cierra el modal.
- [ ] Click fuera del modal (overlay) cierra el modal.
- [ ] Tecla Escape cierra el modal.
- [ ] Guardar con Nombre vacío muestra "El nombre es obligatorio" en rojo.
- [ ] Guardar con Fecha vacía muestra "La fecha de nacimiento es obligatoria" en rojo.
- [ ] Guardar con fecha en formato inválido (ej. "1-2-2025", "abc") muestra "Formato inválido. Usá dd/mm/aaaa" en rojo.
- [ ] Guardar con fecha que no existe (ej. "31/02/2025", "29/02/2023") muestra "La fecha no es válida" en rojo.
- [ ] Guardar con Sala no seleccionada muestra "La sala es obligatoria" en rojo.
- [ ] Guardar con todos los campos obligatorios válidos cierra el modal sin toast ni mensajes.
- [ ] El campo Sala es un `<select>` con opciones: Soles, Lunas, Estrellas.
- [ ] En viewport ≥640px el modal es una tarjeta centrada (max-width 520px, border-radius 24px).
- [ ] En viewport <640px el modal ocupa casi todo el ancho con padding y border-radius 16px.
- [ ] Fredoka en título del modal, Nunito en labels y campos.
- [ ] Paleta idéntica al template (`#FBF4EC`, `#ECE0D0`, `#EADFD0`, coral, gris).
- [ ] `AddChildModal` es reutilizable y exportado desde `app/_components/`.
- [ ] Screenshots guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- **Sí:** modal overlay sobre `/kids` (confirmación del usuario).
- **Sí:** cierre por tres vías — Cancelar, click fuera, Escape (confirmación del usuario).
- **Sí:** validación visual con mensajes en rojo, no bloquea "Guardar" (confirmación del usuario).
- **Sí:** validación de formato dd/mm/aaaa y fecha real (pedido del usuario). Función dedicada en `app/_lib/validate-date.ts`.
- **Sí:** `<select>` hardcodeado: Soles, Lunas, Estrellas (confirmación del usuario).
- **Sí:** "Guardar" solo cierra el modal, sin toast (confirmación del usuario).
- **Sí:** componente `"use client"` por la interactividad.
- **No:** persistencia del niño agregado.
- **No:** detección de nombres duplicados.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Modal no centrado en ciertos viewports | `fixed inset-0 flex items-center justify-center` con padding responsive |
| Scroll del body bloqueado | `overflow-hidden` al body con useEffect |
| Discrepancias de estilo vs template | Screenshots lado a lado y ajuste iterativo |
| `<select>` nativo distinto entre navegadores | `appearance-none` + chevron SVG personalizado |

## Lo que **no** está en esta spec

- Persistencia real ni actualización del mock.
- Detección de nombres duplicados.
- CRUD completo (editar, eliminar).
- Pantallas "Vincular padre", "Resumen del día", ni demás del índice.

Cada una de esas, si llega, va en su propia spec.
