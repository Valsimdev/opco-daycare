# SPEC 08 — Tabla `users` y enums `user_role` / `user_status`

> **Estado:** Implementado
> **Depende de:** SPEC 07
> **Fecha:** 2026-09-12
> **Objetivo:** Crear los enums `user_role` y `user_status` y la tabla `users` en Supabase con RLS, trigger de auto-creación desde `auth.users`, y seed de un usuario staff de prueba.

## Por qué existe esta spec

`users` es la segunda tabla del schema y depende directamente de `daycares` (SPEC 07). Sin esta tabla no se pueden crear las siguientes (`rooms`, `children`, `invitations`, etc.) que referencian `users`. Además, el trigger `AFTER INSERT` sobre `auth.users` es la pieza que conecta Supabase Auth con los datos de dominio.

## Alcance

**In:**

- Migración SQL que crea los enums `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`).
- Creación de la tabla `users` con columnas según el schema: `id` (FK → `auth.users`), `daycare_id` (FK → `daycares`), `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at`, `updated_at`.
- Habilitar RLS en la tabla `users`.
- Políticas RLS: `SELECT TO authenticated` (solo su propia fila) + `SELECT TO anon` (temporal, coherente con `daycares`).
- Trigger `AFTER INSERT` en `auth.users` que crea automáticamente la fila en `users` pasando `daycare_id`, `role` y `full_name` desde `raw_user_meta_data`. Función `SECURITY DEFINER`.
- Seed de un usuario staff: email `nelsy@google.com`, nombre "Nelsy Luna", role `staff`, status `active`, vinculado a "Guardería Sala Soles".

**Fuera de alcance (futuras specs):**

- Resto de enums (`relationship_type`, `invitation_status`, `post_type`, `child_status`).
- Resto de tablas (`rooms`, `children`, `invitations`, `posts`, etc.).
- UI de gestión de usuarios.
- Auth real en la app (login funcional).
- Políticas RLS de `INSERT`/`UPDATE`/`DELETE` para `users`.

## Modelo de datos

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active');

-- Tabla users
CREATE TABLE users (
    id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daycare_id            uuid NOT NULL REFERENCES daycares(id),
    role                  user_role NOT NULL,
    status                user_status NOT NULL DEFAULT 'active',
    full_name             text NOT NULL,
    avatar_url            text,
    notify_on_post        boolean NOT NULL DEFAULT true,
    daily_summary_enabled boolean NOT NULL DEFAULT true,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow read to anon (temporary)" ON users
    FOR SELECT TO anon
    USING (true);
```

La relación es: un daycare tiene muchos usuarios (1:N), pero un usuario tiene exactamente un daycare.

## Plan de implementación

1. **Crear archivo de migración.** Crear `supabase/migrations/YYYYMMDDHHMMSS_create_users_and_enums.sql` con:
   - `CREATE TYPE user_role` y `CREATE TYPE user_status`.
   - `CREATE TABLE users` con todas las columnas, FKs y defaults.
   - `ALTER TABLE users ENABLE ROW LEVEL SECURITY`.
   - Políticas RLS de `SELECT` para `authenticated` (propia fila) y `anon` (temporal).
   - Función `SECURITY DEFINER` + trigger `AFTER INSERT ON auth.users` que inserta en `users` desde `raw_user_meta_data`.
   Verificar: el archivo de migración tiene sintaxis SQL válida.

2. **Aplicar migración.** Usar la herramienta `supabase_apply_migration` para aplicar la migración al proyecto. Verificar: la migración se aplica sin errores.

3. **Verificar estructura.** Ejecutar SQL para confirmar que los enums, la tabla y las políticas existen:
   ```sql
   SELECT enum_range(NULL::user_role);
   SELECT enum_range(NULL::user_status);
   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```
   Verificar: los resultados coinciden con el modelo esperado.

4. **Seed del usuario staff.** Insertar manualmente el usuario de prueba. Dado que el trigger requiere un signup real por `auth.users`, insertamos directamente la fila en `users` con un UUID nuevo y el `daycare_id` de "Guardería Sala Soles":
   ```sql
   -- Obtener el daycare_id de "Guardería Sala Soles"
   -- Insertar en users con los datos de Nelsy Luna
   ```
   Verificar: `SELECT * FROM users WHERE full_name = 'Nelsy Luna';` retorna la fila correcta.

5. **Ejecutar advisor de seguridad.** Usar `supabase_get_advisors` con tipo `security` para verificar que RLS está correctamente configurado en la tabla `users`.

6. **Verificar build.** Ejecutar `npm run lint` y `npx tsc --noEmit` para confirmar que no hay errores.

## Criterios de aceptación

- [ ] La migración se aplica sin errores al proyecto Supabase.
- [ ] Existen los enums `user_role` con valores `staff`, `parent`, `admin`.
- [ ] Existe el enum `user_status` con valores `pending`, `active`.
- [ ] La tabla `users` existe con todas las columnas según el schema.
- [ ] `users.id` es FK → `auth.users(id)` ON DELETE CASCADE.
- [ ] `users.daycare_id` es FK → `daycares(id)`.
- [ ] RLS está habilitado en `users`.
- [ ] Existe política `SELECT TO authenticated` con `auth.uid() = id`.
- [ ] Existe política `SELECT TO anon` temporal con `USING (true)`.
- [ ] Existe trigger `AFTER INSERT` en `auth.users` que crea fila en `users`.
- [ ] Existe un usuario staff con nombre "Nelsy Luna" y email `nelsy@google.com`.
- [ ] El usuario staff tiene role `staff`, status `active`, vinculado a "Guardería Sala Soles".
- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] `npm run lint` pasa sin errores.

## Decisiones

- **Sí:** solo crear `user_role` y `user_status` en esta migración. Los demás enums se crearán cuando se hagan sus tablas respectivas (evita migración gigante).
- **Sí:** función `SECURITY DEFINER` para el trigger sobre `auth.users` — es necesario porque el trigger necesita acceder a `auth.users` desde contexto no privilegiado.
- **Sí:** `SELECT TO anon` temporal en `users`, coherente con la decisión de `daycares` en SPEC 07. Se acotará cuando se implementen políticas granulares.
- **Sí:** seed manual directo en `users` para el usuario de prueba (en lugar de signup real), porque no tenemos autenticación funcional todavía.
- **No:** crear `auth.users` real con `supabase.auth.signUp()` — la app no tiene login funcional aún, se haría en una spec de auth.
- **No:** enums `relationship_type`, `invitation_status`, `post_type`, `child_status` — van en specs de sus tablas respectivas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El trigger `AFTER INSERT` en `auth.users` puede fallar si `raw_user_meta_data` no tiene las claves esperadas | La función debe validar que `daycare_id`, `role` y `full_name` existen antes de insertar, con manejo de errores. |
| RLS `anon` abierto en `users` expone datos de todos los usuarios | Es temporal y ya aceptado en SPEC 07 para `daycares`. Se acotará en specs de auth. |
| Seed manual en `users` sin `auth.users` correspondiente puede causar inconsistencia | Para pruebas de desarrollo es aceptable; en producción siempre se usará el trigger. |

## Lo que **no** está en esta spec

- Resto de enums del schema.
- Resto de tablas (`rooms`, `children`, `invitations`, `posts`, `post_children`, `post_photos`, `reactions`, `comments`, `daily_summaries`, `devices`).
- Autenticación real en la aplicación.
- UI de gestión de usuarios.
- Políticas RLS de write (`INSERT`/`UPDATE`/`DELETE`) en `users`.

Cada uno de esos, si llega, va en su propia spec.
