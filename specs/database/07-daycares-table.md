# SPEC 07 — Tabla `daycares` con migración a Supabase

> **Estado:** Implementado
> **Depende de:** ninguna
> **Fecha:** 2026-09-12
> **Objetivo:** Crear la tabla `daycares` en Supabase vía migración con RLS básico y seed data de 4 guarderías.

## Por qué existe esta spec

Es la primera migración de base de datos del proyecto. `daycares` es la entidad raíz del schema: toda demás tabla (`users`, `rooms`, `children`, etc.) depende de ella. Sin esta tabla no se puede construir el resto del modelo relacional.

## Alcance

**In:**

- Migración SQL que crea la tabla `daycares` con columnas: `id uuid PK` (default `gen_random_uuid()`), `name text NOT NULL`, `created_at timestamptz NOT NULL DEFAULT now()`.
- Habilitar RLS en la tabla `daycares`.
- Políticas RLS básicas (temporales): permitir `SELECT` a `authenticated` y `anon` (RLS mínimo, categoría "c" de las preguntas de clarificación).
- Seed data: 4 guarderías de prueba incluyendo "Guardería Sala Soles".

**Fuera de alcance (futuras specs):**

- Resto de tablas del schema (`users`, `rooms`, `children`, `invitations`, `posts`, etc.).
- Edge Functions para CRUD de daycares.
- Políticas RLS granulares (insert/update/delete).
- Migraciones para enums (`user_role`, `user_status`, etc.) y otras tablas.
- UI para gestionar guarderías.

## Modelo de datos

```sql
-- Tabla daycares
CREATE TABLE daycares (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed data
INSERT INTO daycares (id, name) VALUES
    (gen_random_uuid(), 'Guardería Sala Soles'),
    (gen_random_uuid(), 'Guardería Estrellitas'),
    (gen_random_uuid(), 'Guardería Arcoíris'),
    (gen_random_uuid(), 'Guardería Pequeños Pasos');
```

La tabla es la más simple del schema — no tiene FK hacia otras tablas porque es la raíz. Las demás tablas (cuando se creen) apuntarán hacia `daycares.id`.

## Plan de implementación

1. **Crear archivo de migración.** Crear `supabase/migrations/YYYYMMDDHHMMSS_create_daycares.sql` con:
   - `CREATE TABLE daycares` con las 3 columnas.
   - `ALTER TABLE daycares ENABLE ROW LEVEL SECURITY`.
   - Política RLS: `CREATE POLICY "Allow read to authenticated" ON daycares FOR SELECT TO authenticated USING (true)`.
   - Política RLS: `CREATE POLICY "Allow read to anon" ON daycares FOR SELECT TO anon USING (true)`.
   - Seed data: 4 INSERTs con `gen_random_uuid()` y los nombres de las guarderías.
   Verificar: la migración se aplica correctamente con la herramienta Supabase.

2. **Aplicar migración.** Usar la herramienta Supabase MCP para aplicar la migración al proyecto. Verificar: la tabla existe y tiene 4 filas.

3. **Verificar con SQL.** Ejecutar `SELECT * FROM daycares;` para confirmar las 4 filas. Verificar: la consulta retorna "Guardería Sala Soles" + 3 más.

4. **Ejecutar advisor de seguridad.** Usar la herramienta `supabase_get_advisors` con tipo `security` para verificar que RLS está correctamente configurado en la tabla nueva.

## Criterios de aceptación

- [x] La migración se aplica sin errores al proyecto Supabase.
- [x] La tabla `daycares` existe con columnas `id` (uuid), `name` (text), `created_at` (timestamptz).
- [x] RLS está habilitado en la tabla `daycares`.
- [x] Existen 2 políticas RLS: una para `SELECT TO authenticated` y otra para `SELECT TO anon`.
- [x] La tabla contiene al menos 4 filas, incluyendo "Guardería Sala Soles".
- [x] `npx tsc --noEmit` pasa sin errores (sin cambios de código TypeScript).
- [x] `npm run lint` pasa sin errores (sin cambios de código JavaScript/TypeScript).

## Decisiones

- **Sí:** solo `SELECT` en RLS por ahora (decisión del usuario, RLS mínimo). Se ampliará cuando se creen las demás tablas y se necesite write access.
- **Sí:** 4 guarderías de seed con UUIDs autogenerados (pedido del usuario). Nombres ficticios pero realistas en español.
- **Sí:** migración pura SQL, sin Edge Functions (decisión del usuario). Mantiene el alcance acotado.
- **Sí:** `created_at` con `DEFAULT now()` en lugar de calcularlo en la app. Convención Postgres estándar.
- **No:** enums ni constraints adicionales en esta migración — solo lo mínimo para que `daycares` exista.
- **No:** políticas de `INSERT`/`UPDATE`/`DELETE` — se definirán cuando se construya la UI de gestión.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| RLS `anon` abierto puede ser demasiado permisivo en producción | Es temporal: se acotará cuando se implementen las políticas granulares en specs futuras. |
| `gen_random_uuid()` produce UUIDs distintos en cada migración | No es problema para seed data de prueba; si se necesitan IDs estables, se hardcodearán en una migración futura. |

## Lo que **no** está en esta spec

- Resto de tablas del schema (users, rooms, children, invitations, posts, post_children, post_photos, reactions, comments, daily_summaries, devices).
- Enums del schema (user_role, user_status, relationship_type, etc.).
- Edge Functions o API para daycares.
- UI para crear/editar/eliminar guarderías.

Cada uno de esos, si llega, va en su propia spec.
