-- Respaldo de migración aplicada sin archivo en el repositorio
-- Original: 20260922160000_fix_users_rls_for_parent_lookup
-- SPEC 11: Vinculación de padres con niños - permitir que staff vea otros usuarios

-- Reemplazar política de "solo leer tu propia fila" por "leer todos los usuarios"
-- Esto permite al staff buscar y ver información de padres al gestionar invitaciones

-- Eliminar la política original si aún existe
DROP POLICY IF EXISTS "Users can read own row" ON users;

-- Crear nueva política que permite a usuarios autenticados leer todas las filas
CREATE POLICY authenticated_read_all_users ON users
    FOR SELECT TO authenticated
    USING (true);

-- Función rls_auto_enable: auto-activar RLS en nuevas tablas del schema public
-- Nota: esta función fue creada directamente en la BD sin archivo de migración
-- Se incluye aquí como respaldo, pero con permisos revocados por seguridad

CREATE OR REPLACE FUNCTION rls_auto_enable()
RETURNS event_trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

-- Revocar acceso público para evitar ejecución vía REST (alerta de seguridad)
REVOKE EXECUTE ON FUNCTION rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION rls_auto_enable() FROM authenticated;
