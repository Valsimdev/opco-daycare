-- SPEC 08: Tabla users y enums user_role / user_status

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

-- Trigger function para auto-crear fila en users desde auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'daycare_id' IS NOT NULL
       AND NEW.raw_user_meta_data->>'role' IS NOT NULL
       AND NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        INSERT INTO public.users (id, daycare_id, role, status, full_name)
        VALUES (
            NEW.id,
            (NEW.raw_user_meta_data->>'daycare_id')::uuid,
            (NEW.raw_user_meta_data->>'role')::user_role,
            'active',
            NEW.raw_user_meta_data->>'full_name'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Revocar acceso público a la función SECURITY DEFINER (advisor de seguridad)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Seed del usuario staff de prueba
-- Primero insertamos en auth.users para que el trigger cree la fila en users
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud
)
VALUES (
    gen_random_uuid(),
    'nelsy@google.com',
    now(),
    jsonb_build_object(
        'daycare_id', '3892f2b5-3dfc-484c-8bd1-be0a332c0c96',
        'role', 'staff',
        'full_name', 'Nelsy Luna'
    ),
    now(),
    now(),
    'authenticated'
);
