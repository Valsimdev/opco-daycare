# Plan: Agente db-migrator

## Contexto

Crear un agente `db-migrator` que gestione las migraciones de la base de datos Supabase: verificar estado, crear archivos de migración y aplicarlos de forma segura.

## Archivos a crear

### 1. `.opencode/agent/db-migrator.md`

Estructura del archivo con YAML frontmatter (formato idéntico a `spec-verifier.md` y `react-best-practices.md`):

```yaml
---
description: Gestiona las migraciones de la base de datos Supabase: diagnostica el estado, crea archivos de migración con RLS obligatorio, aplica migraciones en orden y verifica el schema. Usar tras implementar specs de base de datos, cuando se pidan cambios de schema o para verificar el estado de migraciones.
mode: all
model: opencode-go/qwen3.6-plus
permission:
  edit: allow
  bash:
    "*": ask
    "git status*": allow
    "git branch*": allow
    "git log*": allow
    "git diff*": allow
    "ls supabase/migrations/*": allow
---
```

Secciones del agente:

#### Carga obligatoria de skills

- `supabase` — para interactuar con el MCP de Supabase (migraciones, SQL, logs, asesores).
- `supabase-postgres-best-practices` — para seguir las mejores prácticas de Postgres (RLS, índices, triggers, etc.).

#### Fase 1 — Diagnosticar el estado actual

1. Listar archivos en `supabase/migrations/*.sql`.
2. Usar `supabase_list_migrations` del MCP para migraciones aplicadas.
3. Comparar y detectar pendientes.
4. Usar `supabase_list_tables(verbose: true)` para ver schema actual.
5. Ejecutar `supabase_get_advisors` con `type: "security"` y `type: "performance"`.

#### Fase 2 — Crear migraciones nuevas

1. **Nomenclatura**: `YYYYMMDDHHMMSS_slug_descriptivo.sql` (timestamp UTC + slug en inglés kebab-case).
2. **Contenido mínimo**:
   - Comentario de cabecera: `-- SPEC NN: Descripción del cambio`
   - DDL/DML necesario (CREATE TABLE, ALTER TABLE, CREATE INDEX, etc.)
   - `ALTER TABLE nombre ENABLE ROW LEVEL SECURITY;` obligatorio
   - Políticas RLS apropiadas
   - Índices para FKs y columnas de uso frecuente
3. **Reglas de seguridad**:
   - Nunca exponer `service_role` ni secret keys.
   - `auth.role()` deprecado; usar `TO authenticated` / `TO anon`.
   - Views con `security_invoker = true`.
   - `SECURITY DEFINER` bypass RLS; evitar salvo justificación.
   - Revocar acceso público a funciones `SECURITY DEFINER`.
4. Mostrar contenido al usuario antes de guardar. No aplicar automáticamente.

#### Fase 3 — Aplicar migraciones

1. Confirmar con el usuario cuáles migraciones se van a aplicar.
2. Aplicar una por una con `supabase_apply_migration(name, query)`.
3. Verificar tras cada una:
   - `supabase_list_migrations` confirma aplicación.
   - `supabase_list_tables(verbose: true)` si se crearon tablas.
   - `supabase_get_advisors(type: "security")` para nuevas vulnerabilidades.
4. **Manejo de errores**: No continuar, diagnosticar, corregir, reintentar.

#### Fase 4 — Verificación final

1. `supabase_list_tables(verbose: true)` para estado final.
2. Ambos asesores (`security` y `performance`).
3. Comparar con referencia `references/DB-Schema/` si existe.

#### Comandos de uso

| Comando | Descripción |
|---|---|
| `/db-migrator status` | Diagnosticar estado actual: migraciones en archivos, aplicadas, pendientes, schema. |
| `/db-migrator apply` | Aplicar todas las migraciones pendientes con revisión previa. |
| `/db-migrator create <slug> <descripción>` | Crear nuevo archivo de migración con SQL base para revisión. |
| `/db-migrator verify` | Verificar schema contra referencia y ejecutar asesores. |

#### Reglas duras

- **Nunca** modificar BD directamente con `supabase_execute_sql` para cambios de schema. Siempre `supabase_apply_migration`.
- **Nunca** aplicar sin revisión del usuario.
- **Siempre** crear archivo en `supabase/migrations/` antes de aplicar.
- **Siempre** habilitar RLS en toda tabla de schema expuesto.
- **Siempre** aplicar en orden cronológico.
- **Siempre** verificar aplicación exitosa.
- **Siempre** ejecutar asesores tras cambios de schema.
- **Nunca** commitear automáticamente.
- Nombres de objetos de BD en **inglés**, comentarios en **español**.

### 2. Actualización de `AGENTS.md`

Agregar en la sección `# Agentes`:

```markdown
- `db-migrator` (`.opencode/agent/db-migrator.md`): Gestiona las migraciones de la base de datos Supabase: diagnostica el estado, crea archivos de migración con RLS obligatorio, aplica migraciones en orden y verifica el schema. Se activa con `/db-migrator status`, `/db-migrator apply`, `/db-migrator create` o `/db-migrator verify`.
```

## Convenciones a seguir

- Nomenclatura de migraciones: `YYYYMMDDHHMMSS_slug_descriptivo.sql`
- RLS obligatorio en toda tabla de schema expuesto (`public`)
- `auth.role()` deprecado; usar `TO authenticated` / `TO anon`
- Nombres de objetos de BD en inglés, comentarios en español
- Aplicar migraciones en orden cronológico
- Verificar siempre tras aplicar (lista de migraciones, tablas, asesores)
- Nunca commitear automáticamente

## Herramientas del MCP Supabase a usar

| Herramienta | Uso |
|---|---|
| `supabase_list_migrations` | Listar migraciones aplicadas |
| `supabase_apply_migration` | Aplicar una migración |
| `supabase_list_tables` | Ver schema actual (verbose para detalles) |
| `supabase_get_advisors` | Verificar seguridad y rendimiento |
| `supabase_execute_sql` | Solo consultas de lectura (nunca para schema) |
| `supabase_search_docs` | Buscar documentación cuando sea necesario |
