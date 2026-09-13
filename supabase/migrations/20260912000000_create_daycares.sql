-- Create daycares table
CREATE TABLE daycares (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

-- RLS policies (temporary - read only)
CREATE POLICY "Allow read to authenticated" ON daycares
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow read to anon" ON daycares
    FOR SELECT TO anon
    USING (true);

-- Seed data
INSERT INTO daycares (name) VALUES
    ('Guardería Sala Soles'),
    ('Guardería Estrellitas'),
    ('Guardería Arcoíris'),
    ('Guardería Pequeños Pasos');
