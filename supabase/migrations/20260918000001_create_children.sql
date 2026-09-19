-- Create child_status enum
CREATE TYPE child_status AS ENUM ('active', 'archived');

-- Create children table
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

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow read to authenticated" ON children
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow read to anon" ON children
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Allow insert to authenticated" ON children
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Seed data: 8 niños vinculados a la sala "Soles"
INSERT INTO children (room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags)
SELECT
    r.id,
    'Mateo Fernández',
    '2022-03-12',
    '2025-02-01',
    'Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.',
    ARRAY['peanut']
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at)
SELECT
    r.id,
    'Sofía Méndez',
    '2023-08-05',
    '2025-03-01'
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at)
SELECT
    r.id,
    'Benjamín Ruiz',
    '2022-01-22',
    '2025-02-01'
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at)
SELECT
    r.id,
    'Valentina Soto',
    '2023-11-15',
    '2025-06-01'
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags)
SELECT
    r.id,
    'Tomás Díaz',
    '2022-04-08',
    '2025-02-01',
    'Intolerancia a la lactosa. Leche sin lactosa.',
    ARRAY['lactose']
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at)
SELECT
    r.id,
    'Emma Castro',
    '2023-07-30',
    '2025-03-01'
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at)
SELECT
    r.id,
    'Lucas Romero',
    '2022-02-17',
    '2025-02-01'
FROM rooms r
WHERE r.name = 'Soles';

INSERT INTO children (room_id, full_name, birth_date, enrolled_at)
SELECT
    r.id,
    'Olivia Vega',
    '2023-09-09',
    '2025-04-01'
FROM rooms r
WHERE r.name = 'Soles';
