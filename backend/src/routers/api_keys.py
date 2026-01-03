from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..models.schemas import APIKeyCreate, APIKeyResponse
from ..dependencies.auth import get_current_user
from ..dependencies.database import get_supabase
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.post("", response_model=APIKeyResponse)
async def create_api_key(key_data: APIKeyCreate, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    key_id = f"key_{uuid.uuid4().hex[:12]}"
    raw_key = f"ctx_{uuid.uuid4().hex}"
    now = datetime.now(timezone.utc).isoformat()
    
    key_doc = {
        "key_id": key_id,
        "user_id": current_user["user_id"],
        "tenant_id": current_user["tenant_id"],
        "name": key_data.name,
        "key": raw_key,
        "is_active": True,
        "created_at": now,
        "last_used": None
    }
    
    supabase.table("api_keys").insert(key_doc).execute()
    
    return APIKeyResponse(key_id=key_id, name=key_data.name, key_preview=raw_key, created_at=now)

@router.get("", response_model=list[APIKeyResponse])
async def get_api_keys(current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("api_keys").select("*").eq("user_id", current_user["user_id"]).eq("is_active", True).execute()
    
    return [
        APIKeyResponse(
            key_id=k["key_id"],
            name=k["name"],
            key_preview=f"{k['key'][:8]}...{k['key'][-4:]}",
            created_at=k["created_at"],
            last_used=k.get("last_used")
        )
        for k in response.data
    ]

@router.delete("/{key_id}")
async def delete_api_key(key_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("api_keys").update({"is_active": False}).eq("key_id", key_id).eq("user_id", current_user["user_id"]).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"success": True}