# SPEC 10 — Agregar niño a sala desde BD

> **Estado:** Implementado
> **Depende de:** SPEC 04 (Add child modal), SPEC 07 (daycares), SPEC 08 (users)
> **Fecha:** 2026-09-18
> **Objetivo:** Crear las tablas `rooms` y `children` con RLS, seedear los datos iniciales (daycare, 3 salas, 8 niños), conectar el modal "Agregar niño" a la base de datos para registrar niños reales, y hacer que `/kids` y `/kids/[id]` consuman desde BD (dejando los padres vinculados hardcodeados en el perfil).

## Por qué existe esta spec

El modal "Agregar niño" (SPEC 04) es actualmente inerte — no persiste nada. Las listas de niños y los perfiles leen de `mock.ts` hardcodeado. Esta spec introduce las tablas `rooms` y `children` del schema, pobla la BD con los 8 niños existentes, y conecta la UI para consumir datos reales de la base de datos.

## Alcance

**In:**

- Migración SQL para crear la tabla `rooms` con FK a `daycares`, RLS habilitado, y política de lectura.
- Migración SQL para crear la tabla `children` con FK a `rooms`, enum `child_status`, RLS habilitado, y políticas de lectura/escritura.
- Seed data: 3 salas ("Soles", "Lunas", "Estrellas") vinculadas a "Guardería Sala Soles".
- Seed data: los 8 niños actuales del mock insertados en `children` con sus datos reales (nombre, fecha nacimiento, sala, alergias, notas médicas, etc.).
- Server Action para crear un niño (`createChild`) que el modal invoca al hacer "Guardar".
- El modal "Agregar niño" pasa de ser inerte a persistir en la tabla `children`.
- La página `/kids` consume la lista de niños desde la tabla `children` en vez del mock.
- La página `/kids/[id]` consume los datos del niño desde `children` (nombre, edad, sala, alergias, fechas) dejando SOLO los padres vinculados hardcodeados.
- Las salas del `<select>` del modal vienen desde la tabla `rooms` en vez del array hardcodeado.

**Fuera de alcance (futuras specs):**

- CRUD completo (editar, eliminar niños).
- Tabla `parent_children` ni vinculación real de padres.
- Tabla `posts`, `post_children`, `daily_summaries`, etc.
- Tabla `invitations`.
- UI para crear/editar/eliminar salas.
- Búsqueda/filtrado real en el SearchBar.
- Validación de duplicados (niños con mismo nombre).

## Modelo de datos

### Tabla `rooms`

```sql
CREATE TABLE rooms (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    daycare_id uuid NOT NULL REFERENCES daycares(id),
    name       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read to authenticated" ON rooms
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read to anon" ON rooms
    FOR SELECT TO anon USING (true);
```

### Tabla `children`

```sql
CREATE TYPE child_status AS ENUM ('active', 'archived');

CREATE TABLE children (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id       uuid NOT NULL REFERENCES rooms(id),
    full_name     text NOT NULL,
    birth_date    date NOT NULL,
    enrolled_at   date NOT NULL,
    medical_notes text,
    allergy_tags  text[],
    photo_consent boolean NOT NULL DEFAULT true,
    status        child_status NOT NULL DEFAULT 'active',
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read to authenticated" ON children
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read to anon" ON children
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert to authenticated" ON children
    FOR INSERT TO authenticated WITH CHECK (true);
```

### Seed data — Salas

Las 3 salas se vinculan al daycare "Guardería Sala Soles" (ya existente por SPEC 07). Se usa `WHERE name = 'Guardería Sala Soles'` para obtener el `daycare_id`.

### Seed data — 8 Niños

Los 8 niños del mock se insertan con sus datos reales. La sala "Soles" se asigna a todos (como está en el mock actual). Las fechas se convierten del formato visual al formato SQL:

| # | Nombre | Edad | birth_date | enrolled_at | Alergias | Notas médicas |
|---|--------|------|------------|-------------|----------|---------------|
| 1 | Mateo Fernández | 3 | 2022-03-12 | 2025-02-01 | {peanut} | Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila. |
| 2 | Sofía Méndez | 2 | 2023-08-05 | 2025-03-01 | {} | — |
| 3 | Benjamín Ruiz | 3 | 2022-01-22 | 2025-02-01 | {} | — |
| 4 | Valentina Soto | 2 | 2023-11-15 | 2025-06-01 | {} | — |
| 5 | Tomás Díaz | 3 | 2022-04-08 | 2025-02-01 | {lactose} | Intolerancia a la lactosa. Leche sin lactosa. |
| 6 | Emma Castro | 2 | 2023-07-30 | 2025-03-01 | {} | — |
| 7 | Lucas Romero | 3 | 2022-02-17 | 2025-02-01 | {} | — |
| 8 | Olivia Vega | 2 | 2023-09-09 | 2025-04-01 | {} | — |

## Plan de implementación

1. **Crear enums y tabla `rooms`.** Crear migración `supabase/migrations/YYYYMMDDHHMMSS_create_rooms.sql` con:
   - `CREATE TABLE rooms` con FK a `daycares`.
   - RLS habilitado + políticas de `SELECT` para `authenticated` y `anon`.
   - Seed: 3 INSERTs para "Soles", "Lunas", "Estrellas" vinculados a "Guardería Sala Soles".
   Verificar: `supabase_apply_migration` sin errores. `SELECT * FROM rooms;` retorna 3 filas.

2. **Crear enum `child_status` y tabla `children`.** Crear migración `supabase/migrations/YYYYMMDDHHMMSS_create_children.sql` con:
   - `CREATE TYPE child_status AS ENUM ('active', 'archived')`.
   - `CREATE TABLE children` con todas las columnas según schema.
   - RLS habilitado + políticas `SELECT` e `INSERT` para `authenticated`, `SELECT` para `anon`.
   - Seed: 8 INSERTs con los datos de los niños del mock, vinculados a la sala "Soles".
   Verificar: `supabase_apply_migration` sin errores. `SELECT count(*) FROM children;` retorna 8.

3. **Server Action `createChild`.** Crear `app/_actions/create-child.ts` con:
   - Función `createChild(formData: { fullName, birthDate, room, allergies, medicalNotes })`.
   - Usa el cliente Supabase de servidor (`utils/supabase/server.ts`).
   - Inserta en `children` con los campos mapeados.
   - Convierte `birthDate` de dd/mm/aaaa a formato SQL `YYYY-MM-DD`.
   - Parsea `allergies` (string separado por comas) a `allergy_tags` array en inglés.
   - Retorna `{ success: boolean; error?: string }`.
   Verificar: `npx tsc --noEmit`.

4. **Conectar modal a Server Action.** Editar `app/_components/add-child-modal.tsx`:
   - Importar `createChild` de `@/app/_actions/create-child`.
   - En `handleSave`, después de validar, llamar `await createChild({...})`.
   - Si `success`, cerrar modal; si `error`, mostrar mensaje de error.
   - Las salas del `<select>` se reciben como prop `rooms: { id: string; name: string }[]`.
   Verificar: el modal compila y valida correctamente.

5. **Página `/kids` consume desde BD.** Editar `app/(staff)/kids/page.tsx`:
   - Convertir a Server Component (quitar `"use client"` si no es necesario para el estado del modal).
   - Query a `children` JOIN `rooms` para obtener la lista de niños activos.
   - Pasar las salas como prop al componente cliente que maneja el modal.
   - Renderizar `KidCard` con los datos de BD.
   - Calcular `roomName` desde el primer niño o por query a `rooms`.
   Verificar: `/kids` renderiza los 8 niños desde BD.

6. **Página `/kids/[id]` consume desde BD.** Editar `app/(staff)/kids/[id]/page.tsx`:
   - Query a `children` JOIN `rooms` por ID.
   - Calcular `age` desde `birth_date`.
   - Formatear fechas para UI (`birthDate`, `enrollmentDate`).
   - Mapear `allergy_tags` a string legible con etiquetas en español.
   - Pasar el objeto `Kid` al `KidProfileClient`.
   - Los `parents` del `Kid` siguen hardcodeados (vacío por defecto, otro spec los llenará).
   Verificar: `/kids/mateo-fernandez` renderiza perfil desde BD.

7. **Tipos compartidos.** Crear `app/_lib/db-types.ts` con:
   - Interface `ChildRow` (columnas de `children`).
   - Interface `Kid` (compatible con la UI actual) — función `mapChildToKid(row, roomName)` para convertir.
   Verificar: `npx tsc --noEmit`.

8. **Verificación.** `npm run lint` + `npx tsc --noEmit`. Playwright: verificar que `/kids` muestra 8 niños, que el modal agrega un niño nuevo que aparece en la lista, y que `/kids/[id]` muestra datos correctos.

## Criterios de aceptación

- [x] `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] La tabla `rooms` existe con 3 filas: "Soles", "Lunas", "Estrellas".
- [x] La tabla `children` existe con 8 filas (los niños del mock).
- [x] RLS habilitado en `rooms` y `children`.
- [x] Políticas RLS: `SELECT TO authenticated`, `SELECT TO anon`, `INSERT TO authenticated` en `children`.
- [x] El modal "Agregar niño" persiste un nuevo registro en `children` al hacer click en "Guardar".
- [x] El `<select>` de salas en el modal muestra las salas desde la tabla `rooms`.
- [x] `/kids` renderiza la lista de niños desde la tabla `children` (no del mock).
- [x] `/kids/[id]` renderiza los datos del niño desde la tabla `children` (nombre, edad, sala, alergias, fechas).
- [x] El recuadro "PADRES VINCULADOS" en el perfil sigue hardcodeado (sin cambios de esta spec).
- [x] Un niño agregado desde el modal aparece automáticamente en la lista de `/kids`.
- [x] El `KidCard` muestra correctamente badges de alergia (MANÍ, LACTOSA) traducidos del array `allergy_tags`.

## Decisiones

- **Sí:** `allergy_tags` como `text[]` de Postgres (confirmación del schema de referencia). La UI traduce de inglés a español.
- **Sí:** Server Action para `createChild` (patrón Next.js 16 estándar para mutaciones).
- **Sí:** Los padres vinculados siguen hardcodeados en el perfil (pedido explícito del usuario — otro spec los manejará).
- **Sí:** Seed de los 8 niños en migración (confirmación del usuario).
- **Sí:** `<select>` de salas consume desde tabla `rooms` (confirmación del usuario).
- **Sí:** Las salas y daycare se seedean en migraciones separadas pero secuenciales (rooms depende de daycares).
- **No:** CRUD completo — solo alta/registro de niños.
- **No:** Validación de duplicados por nombre.
- **No:** Tabla `parent_children` ni vinculación real de padres.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| RLS bloquea reads desde el cliente | Políticas temporales `SELECT TO authenticated` y `SELECT TO anon` permiten lectura completa. |
| `allergy_tags` en inglés vs UI en español | Función de mapeo `mapChildToKid` traduce las etiquetas al renderizar. |
| `birth_date` en formato SQL vs formato visual | Función de formateo convierte `2022-03-12` → `12 mar 2022` para la UI. |
| El modal no recibe las salas si no hay en BD | El modal muestra un estado apropiado si la query retorna vacío (por ahora siempre hay 3 salas seedeadas). |
| UUIDs distintos para rooms entre seed y children insert | Usar subquery `WHERE name = 'Soles'` en el INSERT de children para obtener el `room_id` correcto. |

## Lo que **no** está en esta spec

- Editar o eliminar niños.
- Vincular padres reales a niños (tabla `parent_children`).
- Tablas `invitations`, `posts`, `post_children`, `daily_summaries`, etc.
- UI para gestionar salas.
- Búsqueda real en SearchBar.
- Detección de nombres duplicados.

Cada una de esas, si llega, va en su propia spec.
