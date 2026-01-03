# ContextOne Backend - FastAPI RAG Service

## 🚀 Quick Start

Complete backend implementation with real RAG capabilities using Qdrant, IBM watsonx, and Supabase.

## 🔒 Security Notice

**IMPORTANT:**
- Never commit your `.env` file to version control
- Never share your API keys publicly
- The `.env` file contains sensitive credentials and is already in `.gitignore`
- Use environment-specific `.env` files for development, staging, and production

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Starting the Application](#starting-the-application)
5. [Testing the API](#testing-the-api)
6. [Project Structure](#project-structure)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

- **Python 3.11+** (recommended: 3.11 or 3.12)
- **pip** (Python package manager)
- **Git** (for cloning repository)

### Optional (but recommended)

- **Docker** and **Docker Compose** (for Redis)
- **Python virtual environment** (venv or conda)

### Required Accounts & API Keys

You already have these configured in `.env`:
- ✅ **Supabase** project (database & auth)
- ✅ **Qdrant Cloud** instance (vector database)
- ✅ **IBM watsonx** API key (LLM & embeddings)

---

## 📦 Installation

### Step 1: Clone Repository (if not already)

```bash
cd /Users/increscotechnologysolutionsprivatelimited/Downloads/personal/contextone/backend
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Supabase** - Database client
- **Qdrant Client** - Vector database
- **IBM Watson ML** - watsonx SDK
- **PyPDF2, python-docx** - Document parsing
- **BeautifulSoup4** - HTML parsing
- **Celery, Redis** - Background tasks
- And more...

**Installation time:** ~2-3 minutes

### Step 4: Verify Installation

```bash
python -c "import fastapi, qdrant_client, supabase; print('✅ All core packages installed successfully!')"
```

If you see the success message, you're ready to proceed!

---

## 🔧 Environment Setup

### Step 1: Check Environment Variables

The `.env` file is already configured with all credentials:

```bash
cat .env
```

You should see:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Qdrant Vector Database
QDRANT_URL=https://your-instance.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION_NAME=contextone_documents

# IBM watsonx.ai
WATSONX_API_KEY=your-watsonx-api-key
WATSONX_PROJECT_ID=your-project-id
WATSONX_URL=https://eu-de.ml.cloud.ibm.com
WATSONX_EMBEDDING_MODEL=ibm/slate-125m-english-rtrvr
WATSONX_CHAT_MODEL=meta-llama/llama-3-3-70b-instruct

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5174,http://localhost:5175
```

✅ **All credentials are already configured!**

### Step 2: Verify Connections (Optional)

Test your credentials:

```bash
# Test Qdrant connection
python -c "
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()
client = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY')
)
print('✅ Qdrant connection successful!')
print('Collections:', [c.name for c in client.get_collections().collections])
"
```

---

## 🚀 Starting the Application

### Option 1: Development Mode (Recommended)

This starts the server with auto-reload enabled - changes to code will automatically restart the server.

```bash
# Make sure you're in the backend directory and virtual environment is activated
cd /Users/increscotechnologysolutionsprivatelimited/Downloads/personal/contextone/backend

# Start the server
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['/Users/.../backend']
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
✅ WatsonX Service initialized
✅ Qdrant collection already exists: contextone_documents
```

**Server is now running!** 🎉

### Option 2: Production Mode

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

### Option 3: Docker Compose

```bash
# Start all services (API + Redis)
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🧪 Testing the API

### 1. Access API Documentation

Open your browser and go to:

**Swagger UI (Interactive):**
```
http://localhost:8001/docs
```

**ReDoc (Alternative):**
```
http://localhost:8001/redoc
```

### 2. Test Health Check

```bash
curl http://localhost:8001/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ContextOne API",
  "version": "1.0.0",
  "database": "connected"
}
```

### 3. Test Authentication

You'll need to authenticate via the frontend first, or use the API docs to test endpoints.

### 4. Test RAG Pipeline (After Frontend Setup)

1. **Upload a Document:**
   - Use frontend at `http://localhost:5174`
   - Or use Swagger UI at `/docs`
   - POST `/api/projects/{project_id}/documents`

2. **Chat with Documents:**
   - POST `/api/projects/{project_id}/chat`
   - Body:
   ```json
   {
     "query": "What is this document about?"
   }
   ```

3. **Expected Response:**
   ```json
   {
     "answer": "Based on your documents, ...",
     "sources": [
       {
         "doc_id": "doc_abc123",
         "doc_name": "guide.pdf",
         "chunk": "Relevant text...",
         "relevance_score": 0.92
       }
     ],
     "conversation_id": "conv_xyz789"
   }
   ```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Environment configuration
│   │
│   ├── routers/                     # API endpoints
│   │   ├── auth.py                  # Authentication (Google OAuth)
│   │   ├── projects.py              # Project CRUD
│   │   ├── documents.py             # Document upload/delete
│   │   ├── chat.py                  # RAG chat endpoint ⭐
│   │   ├── api_keys.py              # API key management
│   │   ├── analytics.py             # Analytics endpoints
│   │   ├── feedback.py              # User feedback
│   │   └── widget.py                # Widget config & JS serve
│   │
│   ├── services/                    # Business logic
│   │   ├── qdrant_service.py       # ⭐ Vector DB operations
│   │   ├── watsonx_service.py      # ⭐ Embeddings & LLM
│   │   ├── document_parser.py      # ⭐ Multi-format parsing
│   │   └── document_service.py     # ⭐ RAG pipeline
│   │
│   ├── models/
│   │   └── schemas.py               # Pydantic models
│   │
│   ├── dependencies/
│   │   ├── auth.py                  # Auth dependencies
│   │   └── database.py              # Database clients
│   │
│   └── utils/
│       └── auth.py                  # Auth utilities
│
├── .env                             # Environment variables ✅
├── .env.example                     # Template for .env
├── requirements.txt                 # Python dependencies ✅
├── docker-compose.yml               # Docker services ✅
├── Dockerfile                       # Docker image
└── README.md                        # This file
```

⭐ = **New RAG implementation files**

---

## 🔍 API Endpoints

### Authentication
```
POST   /api/auth/google              # Google OAuth login
POST   /api/auth/refresh             # Refresh access token
GET    /api/auth/me                  # Get current user
```

### Projects
```
GET    /api/projects                 # List projects
POST   /api/projects                 # Create project
GET    /api/projects/{id}            # Get project details
PATCH  /api/projects/{id}            # Update project
DELETE /api/projects/{id}            # Delete project
```

### Documents
```
POST   /api/projects/{id}/documents        # Upload document
GET    /api/projects/{id}/documents        # List documents
DELETE /api/projects/{id}/documents/{doc}  # Delete document
```

### Chat (RAG)
```
POST   /api/projects/{id}/chat       # Dashboard chat (JWT auth)
POST   /api/widget/{id}/chat         # Widget chat (API key auth)
```

### API Keys
```
POST   /api/api-keys                 # Create API key
GET    /api/api-keys                 # List API keys
DELETE /api/api-keys/{id}            # Delete API key
```

### Analytics
```
GET    /api/projects/{id}/analytics  # Project analytics
GET    /api/projects/{id}/conversations  # Conversation history
```

### Widget
```
GET    /api/widget/{project_id}/config   # Widget configuration
GET    /api/widget.js                    # Widget JavaScript file
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Port 8001 already in use"

**Solution:**
```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn src.main:app --port 8002 --reload
```

### Issue: "Qdrant connection failed"

**Solution:**
1. Check your internet connection
2. Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
3. Test connection manually:
```bash
# Load your QDRANT_URL and QDRANT_API_KEY from .env first
curl $QDRANT_URL:6333/collections \
  -H "api-key: $QDRANT_API_KEY"
```

### Issue: "watsonx API error"

**Solution:**
1. Verify `WATSONX_API_KEY` is correct
2. Check API key has credits
3. Ensure `WATSONX_PROJECT_ID` is valid

### Issue: "No collection found in Qdrant"

**Solution:**
The collection is auto-created on first use. Just restart the backend:
```bash
# Stop server (Ctrl+C)
# Restart
uvicorn src.main:app --port 8001 --reload
```

You should see:
```
✅ Created Qdrant collection: contextone_documents
```

### Issue: "CORS errors from frontend"

**Solution:**
Add your frontend URL to `CORS_ORIGINS` in `.env`:
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:5174,http://localhost:5175
```

Then restart the server.

### Issue: "Document processing stuck on 'processing'"

**Solution:**
1. Check backend logs for errors
2. Verify watsonx API key is working
3. Try uploading a simple TXT file first
4. Check document parsing dependencies:
```bash
pip install PyPDF2 python-docx beautifulsoup4 lxml
```

---

## 🔄 Workflow: How RAG Works

### Document Upload Flow

```
1. User uploads PDF via frontend/API
   ↓
2. FastAPI receives file → saves to Supabase
   ↓
3. Background task starts: document_service.process_document()
   ↓
4. Parse PDF → Extract text (PyPDF2)
   ↓
5. Chunk text → ~500 char chunks with 50 char overlap
   ↓
6. Generate embeddings → Each chunk → watsonx slate-125m (384-dim vector)
   ↓
7. Store vectors → Qdrant with metadata (project_id, tenant_id, doc_id)
   ↓
8. Update status → "indexed"
   ↓
9. ✅ Document ready for chat!
```

### Chat Query Flow

```
1. User asks: "What is X?"
   ↓
2. Query → watsonx embedding (384-dim vector)
   ↓
3. Search Qdrant → Find top-5 most similar chunks
   ↓
4. Build context → Concatenate retrieved chunks
   ↓
5. Prompt → System prompt + Context + Query
   ↓
6. LLM generation → watsonx Granite model
   ↓
7. Response → Answer + Source citations
   ↓
8. Save conversation → Supabase
   ↓
9. ✅ Return to user
```

---

## 📊 Performance Tips

### 1. Use Redis for Caching (Optional)

```bash
# Start Redis with Docker
docker-compose up -d redis

# Or install locally
brew install redis
brew services start redis
```

### 2. Optimize Chunk Size

Edit in `src/services/document_parser.py`:
```python
chunk_size=500  # Smaller = more precise, slower
chunk_size=1000 # Larger = faster, less precise
```

### 3. Adjust Top-K Retrieval

Edit project `model_config`:
```json
{
  "top_k_retrieval": 5  // Default
  "top_k_retrieval": 10 // More context, slower
  "top_k_retrieval": 3  // Less context, faster
}
```

### 4. Enable Celery for Background Tasks

```bash
# Start Celery worker (future enhancement)
celery -A src.celery_app worker --loglevel=info
```

---

## 🚀 Next Steps

1. **Start the backend** (you're here!)
2. **Start the frontend** - See [frontend/README.md](../frontend/README.md)
3. **Test the RAG system** - Upload docs, ask questions
4. **Deploy to production** - Railway, Render, or VPS

---

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Qdrant Docs:** https://qdrant.tech/documentation
- **IBM watsonx Docs:** https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-overview.html
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Checklist

Before running:
- [ ] Python 3.11+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file exists with credentials
- [ ] Port 8001 available

Ready to start:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🎉 Success!

If you see:
```
✅ WatsonX Service initialized
✅ Qdrant collection already exists: contextone_documents
INFO:     Application startup complete.
```

**Your backend is running! 🚀**

Access:
- API: http://localhost:8001
- Docs: http://localhost:8001/docs
- Health: http://localhost:8001/api/health

---

## 📞 Support

For issues:
1. Check logs in terminal
2. Verify `.env` credentials
3. Test individual services (Qdrant, watsonx, Supabase)
4. See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) for detailed troubleshooting

**Happy coding! 🎨**
