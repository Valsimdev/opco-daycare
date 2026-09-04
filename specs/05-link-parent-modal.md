# SPEC 05 — Link parent modal

> **Estado:** Approved
> **Depende de:** SPEC 02
> **Fecha:** 2026-09-04
> **Objetivo:** Implementar un modal reutilizable e independiente para vincular un padre/madre desde el perfil de un niño (`/kids/[id]`), fiel al template `vincular-padre.dc.html`, con validación de campos obligatorios y 100% responsivo.

## Por qué existe esta spec

El botón "Vincular otro padre" en `/kids/[id]` es actualmente inerte (SPEC 02). Esta spec lo convierte en un modal funcional con los campos del diseño `vincular-padre.dc.html`, validación de email y cierre por múltiples vías.

## Alcance

**In:**

- Modal overlay que se abre al hacer click en "Vincular otro padre" en `/kids/[id]`.
- Campos del formulario según `vincular-padre.dc.html`:
  - Nombre del padre/madre (obligatorio, validación de no vacío).
  - Email (obligatorio, validación de formato de email válido).
  - Parentesco (selector visual: Mamá / Papá / Tutor/a — selección obligatoria).
  - Código de invitación (display solo, no editable, generado ficticiamente).
- Header con título "Vincular padre" y subtítulo "a {nombre del niño}".
- Botón de cierre (X) en esquina superior derecha del modal.
- Cierre por tres vías: botón X, click fuera del modal (overlay), tecla Escape.
- Botón "Enviar invitación" cierra el modal sin persistencia ni toast (igual que SPEC 04).
- Validación visual: mensajes de error en rojo bajo cada campo obligatorio inválido al intentar enviar.
- Validación de email con regex de formato válido.
- Componente independiente en `app/_components/`, no comparte estructura con `AddChildModal`.
- 100% responsivo: tarjeta centrada en desktop (max-width 480px), casi pantalla completa con padding en móvil (<640px).
- Estética fiel a `vincular-padre.dc.html`: paleta, bordes redondeados, tipografías y estructura del template.

**Fuera de alcance (futuras specs):**

- Envío real de correo de invitación.
- Persistencia del padre vinculado.
- Generación real de códigos de invitación.
- CRUD de padres vinculados.

## Modelo de datos

```ts
interface LinkParentModalProps {
  open: boolean;
  childName: string;
  onClose: () => void;
}
```

Código de invitación ficticio hardcodeado: `"7K4P9"`.

## Plan de implementación

1. **Componente `LinkParentModal`** (`app/_components/link-parent-modal.tsx`, `"use client"`):
   - Overlay fixed inset-0 z-50, cierra con click fuera.
   - Tarjeta centrada max-width 480px, responsiva.
   - Header: título "Vincular padre" + subtítulo "a {childName}" + botón X.
   - Info box azul con mensaje informativo.
   - Campo Nombre (obligatorio).
   - Campo Email (obligatorio, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`).
   - Parentesco: 3 botones píldora (Mamá / Papá / Tutor/a).
   - Código de invitación display-only "7K4P9".
   - Botón "Enviar invitación" (gradiente coral).
   - Validación al enviar: nombre vacío, email vacío/inválido, parentesco no seleccionado.
   - Cierre por X / Escape / click overlay.
   - `overflow-hidden` al body cuando abierto.

2. **Integrar en `/kids/[id]`**: agregar estado `showLinkParentModal`, conectar botón "Vincular otro padre", renderizar `<LinkParentModal>`.

3. **Responsividad**: desktop vs móvil (<640px).

4. **Verificación**: `npm run lint` + `npx tsc --noEmit` + screenshots Playwright.

## Criterios de aceptación

- [ ] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] "Vincular otro padre" abre el modal.
- [ ] Modal muestra header, info box, nombre, email, parentesco, código, botón enviar.
- [ ] Header muestra nombre del niño correctamente interpolado.
- [ ] Botón X, click overlay, Escape cierran el modal.
- [ ] Validación: nombre vacío, email vacío, email inválido, parentesco no seleccionado.
- [ ] Email válido (ej. "correo@ejemplo.com") no muestra error.
- [ ] Todos válidos → cierra modal sin toast.
- [ ] Parentesco seleccionado cambia estilo a azul.
- [ ] Responsivo: desktop 480px centrado, móvil ~100% con padding.
- [ ] Componente independiente (no comparte código con `AddChildModal`).
- [ ] Screenshots guardados en `.playwright-mcp/screenshots/`.

## Decisiones

- Modal independiente del `AddChildModal` (pedido del usuario).
- Cierre por 3 vías: botón X, click fuera, Escape.
- Código hardcodeado "7K4P9" (display-only).
- "Enviar invitación" solo cierra el modal, sin toast.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Modal no centrado en ciertos viewports | `fixed inset-0 flex items-center justify-center` con padding responsive |
| Scroll del body bloqueado | `overflow-hidden` al body con useEffect |
| Discrepancias de estilo vs template | Screenshots lado a lado y ajuste iterativo |
| Botones de parentesco sin estado inicial claro | Default vacío + validación "Seleccioná un parentesco" |

## Lo que **no** está en esta spec

- Envío real de correo de invitación.
- Persistencia ni actualización del mock.
- Generación real de códigos de invitación.
- CRUD de padres vinculados.
- Pantallas "Resumen del día" ni demás del índice.

Cada una de esas, si llega, va en su propia spec.
