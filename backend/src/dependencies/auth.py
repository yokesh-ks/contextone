from fastapi import HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from typing import Optional
import jwt
from ..config import JWT_SECRET, JWT_ALGORITHM
from .database import get_supabase

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), supabase: Client = Depends(get_supabase)) -> dict:
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        token = credentials.credentials
        print(f"Received token: {token[:20]}...")  # Log first 20 chars
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print(f"Decoded payload: {payload}")
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        if not user_id or not tenant_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "tenant_id": tenant_id}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_api_key(x_api_key: str = Header(None), supabase: Client = Depends(get_supabase)) -> dict:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    # Find user by API key
    response = supabase.table("api_keys").select("user_id, tenant_id").eq("key", x_api_key).eq("is_active", True).execute()
    
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    key_data = response.data[0]
    
    # Update last used
    from datetime import datetime, timezone
    supabase.table("api_keys").update({"last_used": datetime.now(timezone.utc).isoformat()}).eq("key", x_api_key).execute()
    
    return {"user_id": key_data["user_id"], "tenant_id": key_data["tenant_id"]}