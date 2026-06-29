-- 1. Trigger Function for Automatic update_at (in case it is run separately)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Table: setting
CREATE TABLE IF NOT EXISTS setting (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    favicon_url_imagekit TEXT,
    logo_url_imagekit TEXT,
    email VARCHAR(255),
    instagram_url TEXT,
    facebook_url TEXT,
    max_post_free_membership INTEGER DEFAULT 0 NOT NULL,
    head_code JSONB, -- JSON format (using jsonb for performance and query features)
    footer_code JSONB, -- JSON format
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for setting
CREATE TRIGGER update_setting_modtime
    BEFORE UPDATE ON setting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Table: imagekit_api
CREATE TABLE IF NOT EXISTS imagekit_api (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    endpoint_url TEXT NOT NULL,
    apikey TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for imagekit_api
CREATE TRIGGER update_imagekit_api_modtime
    BEFORE UPDATE ON imagekit_api
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
