# **ContextOne: Multi-Tenant RAG-as-a-Service Platform**

**Version:** 1.0 Final
**Technology Stack:** React + Vite + Shadcn UI (Frontend) | FastAPI + Python (Backend) | Supabase (Database & Auth) | Qdrant (Vector DB) | IBM watsonx.ai (LLM)
**Deployment:** Vercel (Frontend) + Hostinger VPS (Backend)
**Timeline:** 30 Days MVP
**Status:** Ready for Development

---

## **1. EXECUTIVE SUMMARY**

**ContextOne** is an enterprise-grade, multi-tenant Retrieval-Augmented Generation (RAG) platform that enables businesses to transform static documentation into intelligent, context-aware AI chatbots deployable in under 2 minutes via a lightweight JavaScript widget.

### **Core Differentiators:**
- ✅ **Zero-Config Intelligence:** No ML/DevOps expertise required
- ✅ **Strict Data Privacy:** Multi-tenant isolation with Supabase RLS + Qdrant partitioning
- ✅ **Frictionless Integration:** Single `<script>` tag deployment
- ✅ **Production-Grade:** Scales to 10,000+ concurrent users with Supabase + VPS
- ✅ **Resume-Ready:** Full-stack SaaS architecture demonstrating AI, DevOps, and system design

---

## **2. PROBLEM STATEMENT**

| Problem | Impact | ContextOne Solution |
|---------|--------|-------------------|
| Documentation goes unread | Support teams overwhelmed with repetitive questions | AI agent answers 24/7 from your docs |
| RAG requires ML engineers | Cost prohibitive for most companies | No-code dashboard abstracts complexity |
| Data privacy fears | Cannot use public LLM APIs (ChatGPT, Claude) | Self-hosted on your VPS; complete isolation |
| Weeks to deploy | Long sales cycles, slow time-to-value | Embed in 30 seconds with a script tag |
| No visibility into quality | Cannot audit which docs powered answers | Full citation tracking + analytics dashboard |

---

## **3. TARGET USERS & USE CASES**

### **Primary Users:**
1. **SaaS Product Companies** (Flinkk CRM, project management tools) → Self-serve documentation bots
2. **E-commerce & Retail** → Customer support via FAQ automation
3. **Professional Services** (consulting, law firms) → Client-facing knowledge assistants
4. **Enterprise IT Teams** → Private internal knowledge bases

### **Typical Workflow:**
1. **Maker** signs up → Creates "Flinkk Documentation" project
2. **Maker** uploads 50 PDFs (API docs, feature guides, troubleshooting)
3. **Maker** copies a `<script>` tag and pastes into Flinkk's website
4. **End-User (Visitor)** sees chat bubble on Flinkk.com → Asks "How do I reset my API key?"
5. **ContextOne** retrieves relevant docs and generates answer in 2.3 seconds
6. **Maker** views analytics: 1,000 conversations solved; 87% satisfaction rate

---

## **4. PRODUCT ARCHITECTURE**

### **High-Level System Design**

```
┌─────────────────────────────────────────────────────────────────┐
│                    External Users (End-Users)                   │
│              (Visiting Maker's Website with Widget)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  widget.js      │
                    │  (Vanilla JS)   │
                    │  15KB gzipped   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   (Chat)            (Upload)              (Stream Tokens)
        │                    │                    │
┌───────▼────────────────────▼────────────────────▼─────────────┐
│                     HOSTINGER VPS (Docker)                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  FastAPI Backend (Python)                               │ │
│  │  ├── POST /api/v1/chat (Query + Retrieval)             │ │
│  │  ├── POST /api/v1/upload (Document Ingestion)          │ │
│  │  ├── GET /api/v1/projects (Project Management)         │ │
│  │  └── Middleware: Auth, Rate Limiting, CORS             │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│        ┌───────────────┼───────────────┐                    │
│        │               │               │                    │
│        ▼               ▼               ▼                    │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐          │
│  │  Supabase   │ │  Qdrant     │ │ IBM watsonx  │          │
│  │  (Postgres) │ │  (Vectors)  │ │   (LLM API)  │          │
│  └─────────────┘ └─────────────┘ └──────────────┘          │
│                                                              │
│  Supabase Tables (PostgreSQL):                              │
│  ├── profiles (user data, tenant isolation via RLS)         │
│  ├── projects (chatbot configs)                             │
│  ├── conversations (logs, analytics)                        │
│  ├── documents (metadata: filename, chunk count, status)    │
│  └── feedback (user thumbs up/down for retraining)          │
│                                                              │
│  Qdrant Collections:                                        │
│  └── documents (vectors + payloads: project_id, user_id)    │
│                                                              │
└────────────────────────────────────────────────────────────────┘
        ▲
        │
        │ (API calls)
        │
    ┌───┴──────────────────────────────────────────────────────┐
    │          React + Vite + Shadcn UI Dashboard               │
    │                  (Hosted on Vercel)                       │
    │  ├── Sign up / Login (Supabase Auth)                      │
    │  ├── Create Projects                                      │
    │  ├── Upload Documents                                     │
    │  ├── Configure System Prompt                              │
    │  ├── Test Chat (Sandbox)                                  │
    │  └── View Analytics                                       │
    └────────────────────────────────────────────────────────────┘
```

---

## **5. TECHNOLOGY STACK**

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend (Maker Dashboard)** | React 18 + Vite + TypeScript + Shadcn UI | Modern, fast builds, beautiful pre-built components, excellent DX |
| **Frontend (Widget)** | Vanilla JavaScript (no deps) | Lightweight (~15KB gzipped), works everywhere |
| **Backend API** | FastAPI (Python 3.11+) | Async/await, auto-generated OpenAPI docs, fast |
| **Database** | Supabase (PostgreSQL) | Built-in auth, real-time, RLS for multi-tenancy, generous free tier |
| **Vector DB** | Qdrant (Docker) | Rust-based, fast, native multi-tenancy via payloads |
| **LLM Provider** | IBM watsonx.ai | Granite/Llama models, no cost for trial, enterprise-grade |
| **Auth** | Supabase Auth + API Keys | OAuth, magic links, JWT built-in, RLS integration |
| **Hosting (Frontend)** | Vercel | Zero-config deployment, edge functions, perfect for React |
| **Hosting (Backend)** | Hostinger VPS (Docker) | Affordable, full control for FastAPI + Qdrant |
| **CDN (Widget)** | Cloudflare or VPS static files | Fast global delivery of widget.js |

---

## **6. CORE FEATURES DETAILED SPECIFICATIONS**

### **6.1 MAKER DASHBOARD (React + Vite + Shadcn UI)**

#### **Feature 1: Authentication & Multi-Tenancy**

**Screens:**
- Sign-up form (email, password)
- Login form
- Forgot Password (email recovery)

**Database Schema (Supabase - PostgreSQL):**

**Table: `profiles` (extends Supabase auth.users)**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Table: `api_keys`**
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- e.g., "pk_live_abc123..." (first 12 chars for display)
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own API keys
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);
```

**Authentication Flow (Supabase Built-in):**
```typescript
// Frontend (React) - Using Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

**Backend Endpoints (FastAPI - Optional, for API key validation):**
```python
GET /auth/me
- Header: Authorization: Bearer <supabase_jwt>
- Response: { user object }

POST /api/keys
- Header: Authorization: Bearer <supabase_jwt>
- Body: { name: "Production API Key" }
- Response: { key_id, key: "pk_live_xyz..." }  # Only returned once

DELETE /api/keys/{key_id}
- Response: { success: true }
```

---

#### **Feature 2: Project Management**

**Database Schema (Supabase - PostgreSQL):**

**Table: `projects`**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Configuration
  system_prompt TEXT DEFAULT 'You are a helpful assistant that answers questions based on the provided documentation.',
  welcome_message TEXT DEFAULT 'How can I help you today?',
  fallback_message TEXT DEFAULT 'I don''t have information about that. Please contact support.',

  -- UI Customization (JSONB for flexibility)
  ui_config JSONB DEFAULT '{
    "primary_color": "#0F172A",
    "accent_color": "#3B82F6",
    "position": "bottom-right",
    "theme": "light"
  }'::jsonb,

  -- Model Configuration
  model_config JSONB DEFAULT '{
    "embedding_model": "ibm/slate-125m-english-rtrvr",
    "chat_model": "ibm/granite-13b-chat-v1",
    "temperature": 0.7,
    "max_tokens": 500,
    "top_k_retrieval": 5
  }'::jsonb,

  -- Status & Metrics
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  doc_count INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Backend Endpoints:**
```python
POST /projects
- Body: { name, description }
- Response: { project }

GET /projects
- Response: { projects: [] }

GET /projects/{project_id}
- Response: { project }

PATCH /projects/{project_id}
- Body: { name, system_prompt, ui_config, model_config }
- Response: { updated project }

DELETE /projects/{project_id}
- Response: { success: true }
```

---

#### **Feature 3: Document Ingestion**

**Database Schema (Supabase - PostgreSQL):**

**Table: `documents`**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  filename TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'html', 'txt', 'md')),
  storage_path TEXT, -- Supabase Storage path

  -- Processing metadata
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'indexed', 'failed')),
  chunks_created INTEGER DEFAULT 0,
  embedding_model TEXT DEFAULT 'ibm/slate-125m-english-rtrvr',
  error_message TEXT,

  -- Vector DB reference
  qdrant_collection TEXT DEFAULT 'documents',
  qdrant_vector_ids TEXT[], -- Array of vector IDs

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_status ON documents(status);
```

**Qdrant Payload (Vectors):**
```javascript
{
  id: "chunk_12345",
  vector: [0.123, 0.456, 0.789, ...],  // 384-dimensional embedding
  payload: {
    project_id: "proj_x9z_22",
    user_id: "user_abc123",  // Changed from tenant_id
    chunk_text: "Flinkk One supports multi-currency transactions...",
    doc_id: "doc_abc123",
    doc_name: "Features_Guide.pdf",
    page_number: 3,
    chunk_index: 2,
    created_at: "2026-01-02T19:38:00Z"
  }
}
```

**Processing Pipeline (FastAPI Background Task):**
```python
from fastapi import UploadFile, Header
from celery import Celery
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

@app.post("/api/v1/upload")
async def upload_document(
    file: UploadFile,
    project_id: str,
    authorization: str = Header(...)
):
    # 1. Validate Supabase JWT token
    token = authorization.replace("Bearer ", "")
    user = supabase.auth.get_user(token)
    user_id = user.user.id

    # 2. Upload file to Supabase Storage
    file_content = await file.read()
    storage_path = f"{user_id}/{project_id}/{file.filename}"

    supabase.storage.from_("documents").upload(
        storage_path,
        file_content,
        {"content-type": file.content_type}
    )

    # 3. Create document record in Supabase
    doc_record = supabase.table("documents").insert({
        "project_id": project_id,
        "user_id": user_id,
        "filename": file.filename,
        "file_size_bytes": len(file_content),
        "file_type": file.filename.split(".")[-1],
        "storage_path": storage_path,
        "status": "uploading"
    }).execute()

    doc_id = doc_record.data[0]["id"]

    # 4. Queue background task for processing
    process_document.delay(storage_path, doc_id, project_id, user_id)

    return {"status": "uploading", "doc_id": doc_id}

# Background task
@celery_app.task
def process_document(storage_path, doc_id, project_id, user_id):
    try:
        # 5. Download file from Supabase Storage
        file_content = supabase.storage.from_("documents").download(storage_path)

        # 6. Parse document (pypdf, python-docx, BeautifulSoup, etc.)
        text = parse_file(file_content)

        # 7. Chunk text
        chunks = chunk_text(text, chunk_size=500, overlap=50)

        # 8. Get embeddings from IBM watsonx
        embeddings = []
        for chunk in chunks:
            embedding = watsonx_client.embed_text(
                text=chunk,
                model_id="ibm/slate-125m-english-rtrvr"
            )
            embeddings.append(embedding)

        # 9. Store vectors in Qdrant
        vector_ids = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            vector_id = f"{doc_id}_chunk_{idx}"
            qdrant_client.upsert(
                collection_name="documents",
                points=[{
                    "id": vector_id,
                    "vector": embedding,
                    "payload": {
                        "project_id": str(project_id),
                        "user_id": str(user_id),
                        "chunk_text": chunk,
                        "doc_id": str(doc_id),
                        "chunk_index": idx
                    }
                }]
            )
            vector_ids.append(vector_id)

        # 10. Update document status in Supabase
        supabase.table("documents").update({
            "status": "indexed",
            "chunks_created": len(chunks),
            "qdrant_vector_ids": vector_ids,
            "indexed_at": datetime.utcnow().isoformat()
        }).eq("id", doc_id).execute()

        # 11. Update project doc_count
        supabase.rpc("increment_project_doc_count", {"project_id": project_id}).execute()

    except Exception as e:
        # Handle errors
        supabase.table("documents").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", doc_id).execute()
```

**Supabase Database Function (for incrementing doc_count):**
```sql
CREATE OR REPLACE FUNCTION increment_project_doc_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET doc_count = doc_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Backend Endpoints:**
```python
POST /api/v1/projects/{project_id}/documents
- Header: Authorization: Bearer <token>
- Body: multipart/form-data (file)
- Response: { doc_id, status: "uploading" }

GET /api/v1/projects/{project_id}/documents
- Response: { documents: [] }

GET /api/v1/documents/{doc_id}/status
- Response: { status, chunks_created, error_message }

DELETE /api/v1/documents/{doc_id}
- Response: { success: true }
```

---

#### **Feature 4: Widget Code Generator**

**UI Component:**
- Display copyable `<script>` tag
- Show installation instructions
- Preview widget in sandbox

**Generated Code:**
```html
<!-- Copy this code into your website's <body> tag -->
<script>
  (function() {
    window.ContextOneConfig = {
      projectId: 'proj_x9z_22',
      apiKey: 'pk_live_abc123'
    };
    var script = document.createElement('script');
    script.src = 'https://cdn.contextone.io/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

**Backend Endpoint:**
```python
GET /api/v1/projects/{project_id}/embed-code
- Response: { embed_code: "<script>...</script>", instructions: "..." }
```

---

#### **Feature 5: Analytics Dashboard**

**Database Schema (Supabase - PostgreSQL):**

**Table: `conversations`**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Project owner, nullable for widget users

  -- Session tracking
  session_id TEXT NOT NULL,
  user_ip TEXT,
  user_agent TEXT,

  -- Feedback
  rating INTEGER CHECK (rating IN (-1, 1)), -- 1 = thumbs up, -1 = thumbs down
  feedback_comment TEXT,
  feedback_submitted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Project owners can view conversations"
  ON conversations FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
```

**Table: `messages` (separate table for better querying)**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,

  -- Assistant message metadata
  sources JSONB, -- Array of {doc_id, doc_name, chunk_text, relevance_score}
  tokens_used INTEGER,
  response_time_ms INTEGER, -- Time taken to generate response

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Project owners can view messages"
  ON messages FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Trigger
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Analytics Metrics:**
- Total conversations
- Average response time
- User satisfaction rate (% thumbs up)
- Most asked questions
- Document usage statistics
- Token consumption over time
- Peak usage hours

**Backend Endpoints:**
```python
GET /api/v1/projects/{project_id}/analytics
- Query: ?start_date=2026-01-01&end_date=2026-01-31
- Response: {
    total_conversations: 1000,
    avg_response_time: 2.3,
    satisfaction_rate: 0.87,
    top_questions: [...],
    token_usage: {...}
  }

GET /api/v1/projects/{project_id}/conversations
- Query: ?limit=50&offset=0
- Response: { conversations: [] }

GET /api/v1/conversations/{conversation_id}
- Response: { conversation }
```

---

### **6.2 CHAT WIDGET (Vanilla JavaScript)**

#### **Core Functionality:**

**1. Initialization**
```javascript
// widget.js
(function() {
  const config = window.ContextOneConfig;

  // Create chat UI
  function createChatUI() {
    const container = document.createElement('div');
    container.id = 'contextone-widget';
    container.innerHTML = `
      <div class="contextone-chat-bubble">💬</div>
      <div class="contextone-chat-window" style="display: none;">
        <div class="contextone-header">
          <h3>Support Chat</h3>
          <button class="contextone-close">×</button>
        </div>
        <div class="contextone-messages"></div>
        <div class="contextone-input-container">
          <input type="text" placeholder="Ask a question..." />
          <button class="contextone-send">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  // Initialize widget
  createChatUI();
  attachEventListeners();
  loadStyles();
})();
```

**2. Chat API Integration**
```javascript
async function sendMessage(message) {
  const response = await fetch('https://api.contextone.io/api/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey
    },
    body: JSON.stringify({
      project_id: config.projectId,
      message: message,
      session_id: getSessionId()
    })
  });

  const data = await response.json();
  displayMessage(data.response, 'assistant');
  displaySources(data.sources);
}
```

**3. Features:**
- Minimizable chat bubble
- Real-time typing indicators
- Message history persistence (localStorage)
- Source citations with links
- Feedback buttons (thumbs up/down)
- Mobile responsive design
- Customizable colors/position

---

### **6.3 BACKEND RAG ENGINE (FastAPI)**

#### **Chat Endpoint Implementation:**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from qdrant_client import QdrantClient
from ibm_watson_machine_learning.foundation_models import Model

app = FastAPI()

class ChatRequest(BaseModel):
    project_id: str
    message: str
    session_id: str
    conversation_id: str = None

@app.post("/api/v1/chat")
async def chat(request: ChatRequest, api_key: str = Header(...)):
    start_time = time.time()

    # 1. Validate API key and get project from Supabase
    project = validate_and_get_project(api_key, request.project_id)
    user_id = project["user_id"]

    # 2. Generate embedding for user query
    query_embedding = watsonx_client.embed_text(
        text=request.message,
        model_id=project["model_config"]["embedding_model"]
    )

    # 3. Search Qdrant for relevant chunks
    search_results = qdrant_client.search(
        collection_name="documents",
        query_vector=query_embedding,
        query_filter={
            "must": [
                {"key": "project_id", "match": {"value": str(request.project_id)}},
                {"key": "user_id", "match": {"value": str(user_id)}}
            ]
        },
        limit=project["model_config"]["top_k_retrieval"]
    )

    # 4. Extract context from search results
    context = "\n\n".join([
        f"[Document: {hit.payload['doc_name']}]\n{hit.payload['chunk_text']}"
        for hit in search_results
    ])

    # 5. Build prompt
    prompt = f"""
{project["system_prompt"]}

Context from documentation:
{context}

User question: {request.message}

Please provide a helpful answer based on the context above. If the context doesn't contain relevant information, say "{project["fallback_message"]}"
"""

    # 6. Generate response from IBM watsonx
    response = watsonx_client.generate(
        model_id=project["model_config"]["chat_model"],
        prompt=prompt,
        params={
            "temperature": project["model_config"]["temperature"],
            "max_new_tokens": project["model_config"]["max_tokens"]
        }
    )

    response_time_ms = int((time.time() - start_time) * 1000)

    # 7. Save conversation to Supabase
    if request.conversation_id:
        # Get existing conversation
        conv = supabase.table("conversations").select("*").eq("id", request.conversation_id).execute()
        conversation_id = request.conversation_id
    else:
        # Create new conversation
        conv_data = supabase.table("conversations").insert({
            "project_id": request.project_id,
            "user_id": user_id,
            "session_id": request.session_id
        }).execute()
        conversation_id = conv_data.data[0]["id"]

    # 8. Insert user message
    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "project_id": request.project_id,
        "role": "user",
        "content": request.message
    }).execute()

    # 9. Insert assistant message with sources
    sources_data = [
        {
            "doc_id": hit.payload["doc_id"],
            "doc_name": hit.payload["doc_name"],
            "chunk_text": hit.payload["chunk_text"][:200],
            "relevance_score": hit.score
        }
        for hit in search_results
    ]

    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "project_id": request.project_id,
        "role": "assistant",
        "content": response.text,
        "sources": sources_data,
        "tokens_used": response.token_count,
        "response_time_ms": response_time_ms
    }).execute()

    # 10. Update project statistics using stored procedure
    supabase.rpc("update_project_stats", {
        "p_project_id": request.project_id,
        "p_tokens": response.token_count
    }).execute()

    # 11. Return response
    return {
        "response": response.text,
        "sources": [
            {
                "doc_name": hit.payload["doc_name"],
                "relevance_score": hit.score,
                "excerpt": hit.payload["chunk_text"][:200]
            }
            for hit in search_results
        ],
        "conversation_id": str(conversation_id)
    }

# Supabase Database Function (for updating project stats)
"""
CREATE OR REPLACE FUNCTION update_project_stats(p_project_id UUID, p_tokens INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET
    total_conversations = total_conversations + 1,
    total_tokens_used = total_tokens_used + p_tokens,
    last_used = NOW()
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""
```

---

## **7. NON-FUNCTIONAL REQUIREMENTS**

### **7.1 Performance**
- Chat response time: < 3 seconds (95th percentile)
- Document processing: < 30 seconds for 10MB PDF
- Widget load time: < 500ms
- Concurrent users: Support 10,000+ simultaneous chats

### **7.2 Security**
- All API endpoints require authentication
- HTTPS only (TLS 1.3)
- API keys hashed with bcrypt
- Rate limiting: 100 requests/minute per API key
- CORS whitelist for widget domains
- Input sanitization to prevent injection attacks
- Multi-tenant data isolation via tenant_id filtering

### **7.3 Scalability**
- Horizontal scaling via Docker Swarm/Kubernetes
- MongoDB replica set for high availability
- Qdrant sharding for vector storage
- Redis for caching (future optimization)
- CDN for widget.js distribution

### **7.4 Monitoring & Logging**
- Application logs (structured JSON)
- Error tracking (Sentry or similar)
- Performance monitoring (response times, throughput)
- Resource usage (CPU, memory, disk)
- Uptime monitoring (99.9% SLA target)

### **7.5 Compliance**
- GDPR compliance (data export, deletion)
- SOC 2 Type II preparation
- User consent for data collection
- Data retention policies

---

## **8. DEPLOYMENT ARCHITECTURE**

### **Docker Compose Configuration (Backend VPS):**

```yaml
version: '3.8'

services:
  fastapi:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      # Supabase Configuration
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

      # Vector DB
      - QDRANT_URL=http://qdrant:6333

      # LLM Provider
      - WATSONX_API_KEY=${WATSONX_API_KEY}
      - WATSONX_PROJECT_ID=${WATSONX_PROJECT_ID}

      # Celery for background tasks
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - qdrant
      - redis
    restart: always

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: always

  celery:
    build: ./backend
    command: celery -A app.celery worker --loglevel=info
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - QDRANT_URL=http://qdrant:6333
      - WATSONX_API_KEY=${WATSONX_API_KEY}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - qdrant
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - fastapi
    restart: always

volumes:
  qdrant_data:
```

### **Frontend Deployment (Vercel):**

**Project Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/ (Shadcn UI components)
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── documents/
│   │   └── analytics/
│   ├── lib/
│   │   ├── supabase.ts (Supabase client)
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── vercel.json
```

**Environment Variables (Vercel):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://api.contextone.io
```

**Deploy Command:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

---

## **9. DEVELOPMENT ROADMAP (30 Days)**

### **Week 1: Foundation**
- Day 1-2: Project setup (repos, Docker, Supabase setup, environment)
- Day 3-4: Supabase database schema + RLS policies + authentication
- Day 5-7: React + Vite + Shadcn UI setup + project management UI

### **Week 2: Core RAG Engine**
- Day 8-10: Document upload + parsing (PDF, DOCX, TXT)
- Day 11-12: Text chunking + embedding pipeline
- Day 13-14: Qdrant integration + vector storage

### **Week 3: Chat & Widget**
- Day 15-17: Chat API endpoint (retrieval + generation)
- Day 18-20: Widget development (UI + API integration)
- Day 21: Widget customization (colors, position)

### **Week 4: Polish & Deploy**
- Day 22-24: Analytics dashboard
- Day 25-26: Testing (unit, integration, E2E)
- Day 27-28: VPS deployment + SSL setup
- Day 29: Documentation + demo video
- Day 30: Final testing + launch

---

## **10. SUCCESS METRICS**

### **Technical Metrics:**
- ✅ 99.5%+ uptime
- ✅ < 3s average response time
- ✅ Support 1,000 documents per project
- ✅ Process 100 uploads/day

### **Business Metrics:**
- ✅ 10+ beta users in first month
- ✅ 100+ conversations handled
- ✅ 80%+ user satisfaction (thumbs up)
- ✅ 5+ testimonials/case studies

---

## **11. FUTURE ENHANCEMENTS (Post-MVP)**

1. **Advanced Features:**
   - Multi-language support
   - Voice chat integration
   - Slack/Discord bot integration
   - API webhooks for custom workflows
   - A/B testing for system prompts

2. **Enterprise Features:**
   - SSO (SAML, OAuth)
   - Custom domain for widget
   - Advanced analytics (funnel, cohorts)
   - Role-based access control (RBAC)
   - SLA guarantees

3. **AI Improvements:**
   - Fine-tuning on conversation data
   - Active learning from feedback
   - Multi-modal support (images, videos)
   - Conversational memory (context across sessions)

---

## **12. RISKS & MITIGATIONS**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| IBM watsonx API downtime | High | Implement fallback to OpenAI/Anthropic |
| Vector DB performance issues | Medium | Optimize indexing, add caching layer |
| VPS resource constraints | Medium | Monitor usage, plan scaling strategy |
| Data privacy concerns | High | Conduct security audit, document compliance |
| User adoption challenges | Medium | Focus on UX, provide excellent onboarding |

---

## **13. CONCLUSION**

ContextOne represents a complete, production-ready RAG platform that balances technical sophistication with user-friendly design. The 30-day timeline is aggressive but achievable by focusing on core functionality first and deferring advanced features to post-MVP iterations.

**Technology Stack Advantages:**
1. **Supabase**: Built-in authentication, real-time capabilities, and RLS for secure multi-tenancy eliminates custom auth implementation
2. **React + Vite + Shadcn UI**: Modern, fast development with beautiful pre-built components
3. **Vercel**: Zero-config frontend deployment with edge functions
4. **FastAPI + Qdrant**: High-performance backend for RAG operations
5. **IBM watsonx.ai**: Enterprise-grade LLM with free trial credits

**Key Success Factors:**
1. Robust multi-tenancy via Supabase RLS from day one
2. Simple, intuitive user experience with Shadcn UI components
3. Fast, reliable chat responses (< 3 seconds)
4. Clear documentation and support
5. Transparent pricing and data policies
6. Generous free tier via Supabase (50,000 monthly active users)

**Cost Efficiency:**
- **Frontend**: Free on Vercel (hobby tier)
- **Database**: Free on Supabase (up to 500MB, 50K MAU)
- **Backend**: ~$10-20/month VPS (Hostinger)
- **Total MVP Cost**: < $25/month

This PRD serves as the single source of truth for development. All stakeholders should refer to this document for feature specifications, technical requirements, and success criteria.

---

**Document Version:** 2.0 (Updated Tech Stack)
**Last Updated:** 2026-01-02
**Author:** Product Team
**Tech Stack:** React + Vite + Shadcn UI | FastAPI | Supabase | Qdrant | IBM watsonx.ai
**Status:** Approved for Development
