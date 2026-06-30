-- Table: rekomendasi_event
CREATE TABLE IF NOT EXISTS rekomendasi_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    "desc" TEXT,
    detail_event JSONB,
    banner_imagekit_url TEXT,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for rekomendasi_event
CREATE TRIGGER update_rekomendasi_event_modtime
    BEFORE UPDATE ON rekomendasi_event
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
