-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Migration 002: Projects, Documents, Chunks, Conversations, Feedback tables

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    system_prompt TEXT DEFAULT 'You are a helpful AI assistant. Answer questions based on the provided context.',
    welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
    fallback_message TEXT DEFAULT 'I don''t have information about that. Please try rephrasing your question.',
    ui_config JSONB DEFAULT '{"primary_color": "#6366F1", "accent_color": "#3B82F6", "position": "bottom-right", "theme": "dark"}',
    model_config_data JSONB DEFAULT '{"embedding_model": "ibm/slate-125m-english-rtrvr", "chat_model": "ibm/granite-13b-chat-v1", "temperature": 0.7, "max_tokens": 500, "top_k_retrieval": 5}',
    status TEXT DEFAULT 'active',
    doc_count INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Enable Row Level Security for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own tenant projects" ON projects
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant projects" ON projects
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant projects" ON projects
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant projects" ON projects
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    doc_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    chunks_created INTEGER DEFAULT 0,
    content TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    indexed_at TIMESTAMPTZ
);

-- Create indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Enable Row Level Security for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view own tenant documents" ON documents
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant documents" ON documents
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant documents" ON documents
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant documents" ON documents
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));

-- Chunks table
CREATE TABLE IF NOT EXISTS chunks (
    chunk_id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding VECTOR(384),  -- Assuming 384 dimensions for embeddings
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for chunks
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_chunks_project_id ON chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_chunks_tenant_id ON chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security for chunks
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chunks
CREATE POLICY "Users can view own tenant chunks" ON chunks
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant chunks" ON chunks
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant chunks" ON chunks
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant chunks" ON chunks
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Enable Row Level Security for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own tenant conversations" ON conversations
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant conversations" ON conversations
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant conversations" ON conversations
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant conversations" ON conversations
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_conversation_id ON feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

-- Enable Row Level Security for feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
CREATE POLICY "Users can view own tenant feedback" ON feedback
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can insert own tenant feedback" ON feedback
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update own tenant feedback" ON feedback
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete own tenant feedback" ON feedback
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true));