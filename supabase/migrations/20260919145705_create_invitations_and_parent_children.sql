-- SPEC 11: Enums relationship_type, invitation_status + tablas invitations y parent_children

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

-- Índices
CREATE INDEX idx_invitations_child_id ON invitations(child_id);
CREATE INDEX idx_invitations_code ON invitations(code);
CREATE INDEX idx_invitations_status_expires ON invitations(status, expires_at);
CREATE INDEX idx_parent_children_parent_id ON parent_children(parent_id);
CREATE INDEX idx_parent_children_child_id ON parent_children(child_id);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- RLS policies: invitations
-- Anon puede leer invitaciones (necesario para la página de activación por código)
CREATE POLICY "invitations_anon_select" ON invitations
    FOR SELECT TO anon
    USING (true);

-- Authenticated puede leer todas las invitaciones (staff y padres)
CREATE POLICY "invitations_authenticated_select" ON invitations
    FOR SELECT TO authenticated
    USING (true);

-- Authenticated puede insertar invitaciones (staff crea invitaciones)
CREATE POLICY "invitations_authenticated_insert" ON invitations
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Authenticated puede actualizar invitaciones (staff o flujo de activación)
CREATE POLICY "invitations_authenticated_update" ON invitations
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS policies: parent_children
-- Authenticated puede leer todos los vínculos (staff necesita conteos, padres sus vínculos)
CREATE POLICY "parent_children_authenticated_select" ON parent_children
    FOR SELECT TO authenticated
    USING (true);

-- Authenticated puede insertar vínculos (flujo de activación)
CREATE POLICY "parent_children_authenticated_insert" ON parent_children
    FOR INSERT TO authenticated
    WITH CHECK (true);
