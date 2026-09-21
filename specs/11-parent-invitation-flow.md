# SPEC 11 — Parent invitation flow

> **Estado:** Implementado
> **Depende de:** SPEC 02, SPEC 05, SPEC 08
> **Fecha:** 2026-09-19
> **Objetivo:** Convertir el modal "Vincular padre" en un flujo completo con persistencia en DB, generación dinámica de código, envío de invitación por correo vía Resend, y pantalla de activación de cuenta para el padre/tutor.

## Por qué existe esta spec

El SPEC 05 implementó el modal "Vincular padre" con código hardcodeado "7K4P9" y sin persistencia ni envío real de email. Esta spec convierte ese modal inerte en un flujo funcional completo: genera códigos únicos, persiste invitaciones en DB, envía correos reales con Resend, y permite que el padre/tutor active su cuenta desde `/activate`.

## Alcance

**In:**

- Botón dinámico en `ParentList`: "Vincular padre/tutor" si `parentCount === 0`, "Vincular otro padre" si `parentCount >= 1`.
- Migración: enums `relationship_type`, `invitation_status` + tablas `invitations` y `parent_children` con RLS.
- Generación dinámica de código de invitación (5 chars alfanuméricos, único, expira en 7 días).
- Server Action `linkParentAction`: valida form, inserta en `invitations`, envía email con Resend.
- Integración de `resend` package desde Next.js Server Action.
- Ruta `/activate` fiel a `activar-cuenta.dc.html`: valida código, muestra formulario de activación.
- Server Action `activateAccountAction`: valida código, crea usuario en Supabase Auth, inserta vínculo `parent_children`, marca invitación `accepted`.
- El modal mantiene su estética actual sin cambios visuales.

**Fuera de alcance (futuras specs):**

- CRUD de padres ya vinculados (editar, eliminar).
- Reenvío de invitaciones expiradas desde la UI.
- Notificaciones push.
- Pantalla "Mi cuenta (familia)" completa.

## Modelo de datos

Nuevas tablas en la base de datos:

```sql
-- Enums
CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Tabla invitations
CREATE TABLE invitations (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id     uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    invited_by   uuid NOT NULL REFERENCES users(id),
    full_name    text NOT NULL,
    email        text NOT NULL,
    relationship relationship_type NOT NULL,
    code         text UNIQUE NOT NULL,
    status       invitation_status NOT NULL DEFAULT 'pending',
    expires_at   timestamptz NOT NULL,
    accepted_at  timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- Tabla parent_children
CREATE TABLE parent_children (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id     uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship relationship_type NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (parent_id, child_id)
);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
```

Traducción de enums a UI (español):

| DB value        | UI label |
| --------------- | -------- |
| `father`        | Papá     |
| `mother`        | Mamá     |
| `guardian`      | Tutor/a  |
| `pending`       | PENDIENTE |
| `accepted`      | ACTIVA   |
| `expired`       | EXPIRADA |
| `cancelled`     | CANCELADA |

## Plan de implementación

1. **Migración: enums + tablas `invitations` y `parent_children`.** Crear migración con enums, tablas, índices únicos, y políticas RLS básicas (staff puede leer/insertar invitaciones, padres leen sus vínculos). Aplicar con `supabase_apply_migration`. Verificar: tablas aparecen en `supabase_list_tables`.

2. **Instalar `resend` package.** `npm i resend`. Agregar `RESEND_API_KEY` y `NEXT_PUBLIC_APP_URL` a `.env.local`.

3. **Server Action `linkParentAction`** en `app/_actions/parent-actions.ts`:
   - `generateInvitationCode()`: 5 chars alfanuméricos mayúsculos, loop hasta encontrar uno único en DB.
   - `linkParentAction({ childId, fullName, email, relationship })`: valida staff autenticado, datos del form, genera código, inserta `invitations` con `expires_at = now + 7 days`, envía email HTML con Resend (saludo, nombre del niño, código, link `/activate?code=XXXXX`). Retorna `{ success, error }`.
   - Email usa `RESEND_API_KEY` como header de autorización.

4. **Botón dinámico en `ParentList`.** Modificar `app/_components/parent-list.tsx`:
   - Agregar prop `parentCount: number`.
   - Texto: `parentCount === 0 ? "Vincular padre/tutor" : "Vincular otro padre"`.
   - Mantener toda la estética y estructura actual.

5. **Obtener `parentCount` desde DB.** En `app/_actions/child-actions.ts`:
   - Modificar `getChildById` para incluir un join con `parent_children` y contar padres, o agregar función separada `getChildParentCount(childId)`.
   - Actualizar `mapChildToKid` en `app/_lib/db-types.ts` para recibir y usar el conteo real.
   - Verificar: `npx tsc --noEmit`.

6. **Integrar `linkParentAction` en `LinkParentModal`.** Modificar `app/_components/link-parent-modal.tsx`:
   - Pre-generar código al abrir el modal (llamar función que genera código disponible o mostrar "Generando...").
   - Al enviar, llamar `linkParentAction` con los datos del form + `childId` (nueva prop).
   - Mostrar estado de carga (botón disabled + texto "Enviando...").
   - Si éxito: cerrar modal, invocar `onSuccess` callback para refrescar la página.
   - Si error: mostrar mensaje debajo del botón.
   - El código mostrado en el modal se genera dinámicamente, no hardcodeado.

7. **Ruta `/activate`** en `app/(auth)/activate/page.tsx`:
   - Server component que lee `?code=XXXXX` de search params.
   - Busca invitación vigente en DB.
   - Si válida: renderiza formulario fiel a `activar-cuenta.dc.html` con código (readonly), email (pre-llenado), contraseña, checkbox consentimiento de fotos.
   - Si inválida/expirada: muestra mensaje de error con link a login.

8. **Server Action `activateAccountAction`** en `app/_actions/auth-actions.ts`:
   - Recibe `{ code, password, photoConsent }`.
   - Busca invitación por código: valida que exista, status `pending`, `expires_at > now`.
   - `supabase.auth.signUp({ email, password })` — el trigger `handle_new_user` crea la fila en `users` con role `parent`.
   - Inserta en `parent_children` con el `parent_id` del nuevo usuario, `child_id` de la invitación, y `relationship`.
   - Actualiza invitación: `status = 'accepted'`, `accepted_at = now()`.
   - Si la invitación tenía `photo_consent`, actualizar el niño.
   - Retorna `{ success, error }` y redirige al login o feed de familia.

9. **Refrescar perfil tras vincular.** Tras éxito en `linkParentAction`, el cliente recarga los datos del perfil (revalidatePath o window.location.reload) para mostrar el nuevo padre con estado "invitación enviada".

10. **Verificación final.** `npm run lint` + `npx tsc --noEmit` + screenshots Playwright de perfil (desktop/móvil) y activación.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] El botón en `ParentList` muestra "Vincular padre/tutor" si el niño tiene 0 padres vinculados.
- [x] El botón en `ParentList` muestra "Vincular otro padre" si el niño tiene ≥1 padre vinculado.
- [x] El modal "Vincular padre" mantiene su estética actual sin cambios visuales.
- [x] El código de invitación es dinámico (5 chars alfanuméricos), no hardcodeado.
- [x] Al enviar el formulario del modal se crea un registro en `invitations` con código único.
- [x] El registro en `invitations` tiene `expires_at` a 7 días del momento de creación.
- [x] Se envía un email con Resend al email capturado con el código y link de activación.
- [x] La ruta `/activate` renderiza la pantalla de activación fiel a `activar-cuenta.dc.html`.
- [x] `/activate?code=XXXXX` muestra el formulario cuando el código es válido y vigente.
- [x] `/activate?code=INVALID` muestra mensaje de error.
- [x] Crear contraseña + enviar activa la cuenta: usuario en `auth.users`, fila en `users` con role `parent`, vínculo en `parent_children`, invitación marcada `accepted`.
- [x] Tras vincular exitosamente, el perfil del niño muestra al nuevo padre con estado "invitación enviada".
- [x] Las tablas `invitations` y `parent_children` tienen RLS habilitado.
- [x] Se crearon migraciones SQL para todas las manipulaciones de base de datos.

## Decisiones

- **Sí:** una sola spec cubriendo todo el flujo (pedido del usuario).
- **Sí:** envío de email desde Next.js Server Action con paquete `resend` (pedido del usuario).
- **Sí:** estética del modal sin cambios, solo lógica interna (pedido del usuario).
- **Sí:** código de 5 chars alfanuméricos mayúsculos, mismo formato visual que "7K4P9".
- **Sí:** usar `signUp` de Supabase Auth para crear cuenta del padre — el trigger `handle_new_user` existente ya crea la fila en `users` automáticamente.
- **Sí:** `RESEND_API_KEY` como variable de entorno en `.env.local`.
- **No:** CRUD de padres vinculados — otra spec.
- **No:** reenvío de invitaciones expiradas — otra spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Código duplicado por colisión de hash | `generateInvitationCode` verifica unicidad en DB con loop; con 36^5 ≈ 60M combinaciones, colisión extremadamente rara |
| Email no llega sin API key válida | Validar presencia de `RESEND_API_KEY` en `.env.local` con error claro |
| Supabase Auth requiere email confirmado antes de login | Configurar `email_confirm_required = false` en proyecto o usar magic link como alternativa |
| RLS bloquea operaciones de staff | Políticas RLS deben permitir staff insertar invitaciones; verificar con advisors de seguridad |

## Lo que **no** está en esta spec

- CRUD de padres vinculados (editar, eliminar).
- Reenvío de invitaciones expiradas.
- Notificaciones push.
- Pantalla "Mi cuenta (familia)" completa.
- Las demás pantallas del índice.

Cada una de esas, si llega, va en su propia spec.
