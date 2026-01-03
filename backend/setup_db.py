#!/usr/bin/env python3

import os
from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Supabase credentials not found in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Create users table
create_table_sql = """
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
"""

# Create api_keys table
create_api_keys_sql = """
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
"""

# Create projects table
create_projects_sql = """
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    system_prompt TEXT DEFAULT '',
    welcome_message TEXT DEFAULT '',
    fallback_message TEXT DEFAULT '',
    ui_config JSONB DEFAULT '{}',
    model_config_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active',
    doc_count INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant's projects
CREATE POLICY "Users can view own tenant projects" ON projects
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant projects" ON projects
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant projects" ON projects
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant projects" ON projects
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));
"""

# Create documents table
create_documents_sql = """
CREATE TABLE IF NOT EXISTS documents (
    doc_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    chunks_created INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant's documents
CREATE POLICY "Users can view own tenant documents" ON documents
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant documents" ON documents
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant documents" ON documents
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant documents" ON documents
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));
"""

# Create chunks table
create_chunks_sql = """
CREATE TABLE IF NOT EXISTS chunks (
    chunk_id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- Assuming OpenAI embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (doc_id) REFERENCES documents(doc_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Create index on doc_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chunks_project_id ON chunks(project_id);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_chunks_tenant_id ON chunks(tenant_id);

-- Enable Row Level Security
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant's chunks
CREATE POLICY "Users can view own tenant chunks" ON chunks
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant chunks" ON chunks
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant chunks" ON chunks
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant chunks" ON chunks
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));
"""

# Create conversations table
create_conversations_sql = """
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    user_id TEXT,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant's conversations
CREATE POLICY "Users can view own tenant conversations" ON conversations
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant conversations" ON conversations
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant conversations" ON conversations
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant conversations" ON conversations
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));
"""

# Create feedback table
create_feedback_sql = """
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE
);

-- Create index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_conversation_id ON feedback(conversation_id);

-- Create index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tenant's feedback
CREATE POLICY "Users can view own tenant feedback" ON feedback
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant feedback" ON feedback
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant feedback" ON feedback
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant feedback" ON feedback
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));
"""

# Manual table creation instructions
print("Database setup requires manual table creation in Supabase dashboard.")
print("Please run the following SQL in the Supabase SQL Editor:")
print("CREATE EXTENSION IF NOT EXISTS vector;")
print(create_table_sql)
print(create_api_keys_sql)
print(create_projects_sql)
print(create_documents_sql)
print(create_chunks_sql)
print(create_conversations_sql)
print(create_feedback_sql)

# Add any other initialization tasks here if needed