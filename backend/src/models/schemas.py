from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tenant_id: str
    email: str
    full_name: str
    plan: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    tenant_id: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    welcome_message: Optional[str] = None
    fallback_message: Optional[str] = None
    ui_config: Optional[Dict[str, Any]] = None
    model_config_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    project_id: str
    tenant_id: str
    name: str
    description: str
    system_prompt: str
    welcome_message: str
    fallback_message: str
    ui_config: Dict[str, Any]
    model_config_data: Dict[str, Any]
    status: str
    doc_count: int
    total_conversations: int
    created_at: str
    updated_at: str

class DocumentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    doc_id: str
    project_id: str
    filename: str
    file_size_bytes: int
    file_type: str
    status: str
    chunks_created: int
    uploaded_at: str
    error_message: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    conversation_id: str

class APIKeyCreate(BaseModel):
    name: str

class APIKeyResponse(BaseModel):
    key_id: str
    name: str
    key_preview: str
    created_at: str
    last_used: Optional[str] = None

class FeedbackCreate(BaseModel):
    conversation_id: str
    message_id: str
    rating: int
    comment: Optional[str] = None

class AnalyticsResponse(BaseModel):
    total_conversations: int
    total_messages: int
    avg_satisfaction: float
    conversations_by_day: List[Dict[str, Any]]
    top_queries: List[Dict[str, Any]]