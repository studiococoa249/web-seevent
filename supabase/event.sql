-- 1. ENUM Types
CREATE TYPE event_status AS ENUM ('Draft', 'Publish', 'Cancelled', 'Completed');
CREATE TYPE participant_status AS ENUM ('Pending', 'Confirmed', 'Declined');

-- 2. Trigger Function for Automatic update_at (in case it is run separately)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Table: event
CREATE TABLE IF NOT EXISTS event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_users UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_category_event INTEGER REFERENCES category_event(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title_seo VARCHAR(255),
    desc_seo TEXT,
    location TEXT NOT NULL,
    desc_full TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER NOT NULL CHECK (max_participants >= 0), -- 0 could represent unlimited
    status event_status DEFAULT 'Draft' NOT NULL,
    image_url_imagekit TEXT,
    pesan_ajakan TEXT,
    patungan NUMERIC,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for event
CREATE TRIGGER update_event_modtime
    BEFORE UPDATE ON event
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Table: event_participants
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_event UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    id_users UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joint_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status participant_status DEFAULT 'Pending' NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent a user from joining the same event multiple times
    CONSTRAINT unique_event_participant UNIQUE (id_event, id_users)
);

-- Trigger for event_participants
CREATE TRIGGER update_event_participants_modtime
    BEFORE UPDATE ON event_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
