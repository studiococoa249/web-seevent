-- Table: mongodb_connection
CREATE TABLE IF NOT EXISTS mongodb_connection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Not-Active')) NOT NULL,
    mongodb_config JSONB NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for mongodb_connection
CREATE TRIGGER update_mongodb_connection_modtime
    BEFORE UPDATE ON mongodb_connection
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
