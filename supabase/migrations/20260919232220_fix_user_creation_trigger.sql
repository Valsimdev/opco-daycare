-- Hacer daycare_id nullable para permitir creación de usuarios sin daycare_id inicial
ALTER TABLE users ALTER COLUMN daycare_id DROP NOT NULL;

-- Actualizar trigger para manejar daycare_id null
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL
       AND NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        INSERT INTO public.users (id, daycare_id, role, status, full_name)
        VALUES (
            NEW.id,
            CASE 
                WHEN NEW.raw_user_meta_data->>'daycare_id' IS NOT NULL 
                THEN (NEW.raw_user_meta_data->>'daycare_id')::uuid 
                ELSE NULL 
            END,
            (NEW.raw_user_meta_data->>'role')::user_role,
            'active',
            NEW.raw_user_meta_data->>'full_name'
        );
    END IF;
    RETURN NEW;
END;
$$;
