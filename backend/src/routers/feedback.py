from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..models.schemas import FeedbackCreate
from ..dependencies.auth import get_current_user
from ..dependencies.database import get_supabase
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.post("")
async def submit_feedback(feedback_data: FeedbackCreate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    conv_response = supabase.table("conversations").select("project_id").eq("conversation_id", feedback_data.conversation_id).execute()
    if not conv_response.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    feedback_doc = {
        "feedback_id": f"fb_{uuid.uuid4().hex[:12]}",
        "conversation_id": feedback_data.conversation_id,
        "message_id": feedback_data.message_id,
        "project_id": conv_response.data[0]["project_id"],
        "tenant_id": current_user["tenant_id"],
        "rating": feedback_data.rating,
        "comment": feedback_data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("feedback").insert(feedback_doc).execute()
    return {"success": True}