CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    google_id TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant's data
CREATE POLICY "Users can view own tenant" ON users
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant" ON users
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant" ON users
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

-- For signup/login, we need to allow access without tenant_id context
-- This is handled in the application logic by checking credentials first

CREATE TABLE IF NOT EXISTS api_keys (
    key_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);

-- Create index on key for authentication lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own API keys
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own api keys" ON api_keys
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own api keys" ON api_keys
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own api keys" ON api_keys
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));