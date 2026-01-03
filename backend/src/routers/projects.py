from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..models.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from ..dependencies.auth import get_current_user
from ..dependencies.database import get_supabase
from ..config import PLAN_LIMITS, WATSONX_EMBEDDING_MODEL, WATSONX_CHAT_MODEL
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.post("", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    # Get user plan
    user_response = supabase.table("users").select("plan").eq("id", current_user["user_id"]).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_plan = user_response.data[0]["plan"]
    plan_limits = PLAN_LIMITS.get(user_plan, {})

    # Check project limit
    if plan_limits.get("projects") is not None:
        # Count existing projects for this tenant
        existing_projects = supabase.table("projects").select("project_id").eq("tenant_id", current_user["tenant_id"]).execute()
        current_count = len(existing_projects.data) if existing_projects.data else 0

        if current_count >= plan_limits["projects"]:
            raise HTTPException(
                status_code=403,
                detail=f"Project limit exceeded. Your {user_plan} plan allows {plan_limits['projects']} projects. Current: {current_count}"
            )

    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    project_doc = {
        "project_id": project_id,
        "tenant_id": current_user["tenant_id"],
        "name": project_data.name,
        "description": project_data.description or "",
        "system_prompt": "You are a helpful AI assistant. Answer questions based on the provided context.",
        "welcome_message": "Hello! How can I help you today?",
        "fallback_message": "I don't have information about that. Please try rephrasing your question.",
        "ui_config": {
            "primary_color": "#6366F1",
            "accent_color": "#3B82F6",
            "position": "bottom-right",
            "theme": "dark"
        },
        "model_config_data": {
            "embedding_model": WATSONX_EMBEDDING_MODEL,
            "chat_model": WATSONX_CHAT_MODEL,
            "temperature": 0.7,
            "max_tokens": 500,
            "top_k_retrieval": 5
        },
        "status": "active",
        "doc_count": 0,
        "total_conversations": 0,
        "total_tokens_used": 0,
        "created_at": now,
        "updated_at": now
    }

    supabase.table("projects").insert(project_doc).execute()
    return ProjectResponse(**project_doc)

@router.get("", response_model=list[ProjectResponse])
async def get_projects(current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("projects").select("*").eq("tenant_id", current_user["tenant_id"]).execute()
    return [ProjectResponse(**p) for p in response.data]

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("projects").select("*").eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**response.data[0])

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, update_data: ProjectUpdate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    response = supabase.table("projects").update(update_dict).eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(**response.data[0])

@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("projects").delete().eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Also delete related documents, chunks, conversations
    supabase.table("documents").delete().eq("project_id", project_id).execute()
    supabase.table("chunks").delete().eq("project_id", project_id).execute()
    supabase.table("conversations").delete().eq("project_id", project_id).execute()
    
    return {"success": True}