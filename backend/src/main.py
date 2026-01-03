from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .routers import auth, projects, documents, chat, api_keys, analytics, feedback, widget

app = FastAPI(title="ContextOne API", version="1.0.0")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(api_keys.router, prefix="/api/api-keys", tags=["api-keys"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(feedback.router, prefix="/api", tags=["feedback"])
app.include_router(widget.router, prefix="/api", tags=["widget"])

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    from .dependencies.database import get_supabase
    supabase = get_supabase()
    db_status = "connected" if supabase else "not configured"
    return {"status": "healthy", "service": "ContextOne API", "version": "1.0.0", "database": db_status}