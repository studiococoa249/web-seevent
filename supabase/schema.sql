-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM Types
CREATE TYPE user_status AS ENUM ('Active', 'Not-Active', 'Suspend');
CREATE TYPE payment_status AS ENUM ('Pending', 'Error', 'Expired', 'Success');
CREATE TYPE tripay_mode AS ENUM ('Sandbox', 'Production');
CREATE TYPE membership_state AS ENUM ('No', 'Yes');
CREATE TYPE user_level AS ENUM ('Admin', 'Member');

-- 2. Trigger Function for Automatic update_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Table: membership_plan
CREATE TABLE IF NOT EXISTS membership_plan (
    id SERIAL PRIMARY KEY,
    name_plan VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL, -- Duration in days/months
    total_post_get INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for membership_plan
CREATE TRIGGER update_membership_plan_modtime
    BEFORE UPDATE ON membership_plan
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    level user_level DEFAULT 'Member' NOT NULL,
    membership membership_state DEFAULT 'No' NOT NULL,
    id_membership_plan INTEGER REFERENCES membership_plan(id) ON DELETE SET NULL,
    start_membership TIMESTAMP WITH TIME ZONE,
    end_membership TIMESTAMP WITH TIME ZONE,
    status user_status DEFAULT 'Not-Active' NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for users
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Table: profile
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_users UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    instagram_url TEXT,
    tiktok_url TEXT,
    email VARCHAR(255),
    profile_url_imagekit TEXT,
    youtube_url TEXT,
    banner_url TEXT,
    bio TEXT,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for profile
CREATE TRIGGER update_profile_modtime
    BEFORE UPDATE ON profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Table: trx_membership
CREATE TABLE IF NOT EXISTS trx_membership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status_payment payment_status DEFAULT 'Pending' NOT NULL,
    detail_payment JSONB, -- JSON format (using jsonb for better query performance and index support)
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for trx_membership
CREATE TRIGGER update_trx_membership_modtime
    BEFORE UPDATE ON trx_membership
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Table: tripay_config
CREATE TABLE IF NOT EXISTS tripay_config (
    id SERIAL PRIMARY KEY,
    api_key TEXT NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    private_key TEXT NOT NULL,
    mode tripay_mode DEFAULT 'Sandbox' NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for tripay_config
CREATE TRIGGER update_tripay_config_modtime
    BEFORE UPDATE ON tripay_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Table: category_event
CREATE TABLE IF NOT EXISTS category_event (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for category_event
CREATE TRIGGER update_category_event_modtime
    BEFORE UPDATE ON category_event
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 1. Buat tipe enum baru
CREATE TYPE user_level AS ENUM ('Admin', 'Member');

-- 2. Tambahkan kolom level ke tabel users
ALTER TABLE users ADD COLUMN level user_level DEFAULT 'Member' NOT NULL;
