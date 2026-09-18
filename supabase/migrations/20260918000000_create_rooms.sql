-- Create rooms table
CREATE TABLE rooms (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    daycare_id uuid NOT NULL REFERENCES daycares(id),
    name       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies (temporary - read only)
CREATE POLICY "Allow read to authenticated" ON rooms
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow read to anon" ON rooms
    FOR SELECT TO anon
    USING (true);

-- Seed data: 3 salas vinculadas a "Guardería Sala Soles"
INSERT INTO rooms (daycare_id, name)
SELECT id, 'Soles' FROM daycares WHERE name = 'Guardería Sala Soles';

INSERT INTO rooms (daycare_id, name)
SELECT id, 'Lunas' FROM daycares WHERE name = 'Guardería Sala Soles';

INSERT INTO rooms (daycare_id, name)
SELECT id, 'Estrellas' FROM daycares WHERE name = 'Guardería Sala Soles';
