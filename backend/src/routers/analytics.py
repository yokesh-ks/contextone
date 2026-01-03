from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..models.schemas import AnalyticsResponse
from ..dependencies.auth import get_current_user
from ..dependencies.database import get_supabase

router = APIRouter()

@router.get("/projects/{project_id}/analytics", response_model=AnalyticsResponse)
async def get_analytics(project_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    project_response = supabase.table("projects").select("*").eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    if not project_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    conversations_response = supabase.table("conversations").select("*").eq("project_id", project_id).execute()
    conversations = conversations_response.data if conversations_response.data else []
    total_conversations = len(conversations)
    total_messages = sum(len(c.get("messages", [])) for c in conversations)
    
    feedback_response = supabase.table("feedback").select("rating").eq("project_id", project_id).execute()
    feedback = feedback_response.data if feedback_response.data else []
    avg_satisfaction = sum(f.get("rating", 0) for f in feedback) / len(feedback) if feedback else 0
    
    return AnalyticsResponse(
        total_conversations=total_conversations,
        total_messages=total_messages,
        avg_satisfaction=avg_satisfaction,
        conversations_by_day=[],
        top_queries=[]
    )