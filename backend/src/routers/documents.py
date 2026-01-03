from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from supabase import Client
from ..models.schemas import DocumentResponse
from ..dependencies.auth import get_current_user
from ..dependencies.database import get_supabase
from ..services.document_service import process_document, delete_document_vectors
from pydantic import BaseModel
from pathlib import Path
import uuid
from datetime import datetime, timezone

router = APIRouter()

class AddTextRequest(BaseModel):
    title: str
    content: str

@router.post("/projects/{project_id}/documents", response_model=DocumentResponse)
async def upload_document(
    project_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    # Verify project exists
    project_response = supabase.table("projects").select("*").eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    if not project_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate file type
    allowed_types = [".pdf", ".txt", ".md", ".docx", ".html"]
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type not supported. Allowed: {allowed_types}")
    
    content = await file.read()
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    doc_record = {
        "doc_id": doc_id,
        "project_id": project_id,
        "tenant_id": current_user["tenant_id"],
        "filename": file.filename,
        "file_size_bytes": len(content),
        "file_type": file_ext.replace(".", ""),
        "status": "processing",
        "chunks_created": 0,
        "content": content.decode('utf-8', errors='ignore'),
        "uploaded_at": now,
        "indexed_at": None
    }
    
    supabase.table("documents").insert(doc_record).execute()
    
    # Update project doc count
    supabase.table("projects").update({"doc_count": project_response.data[0]["doc_count"] + 1}).eq("project_id", project_id).execute()
    
    # Process in background
    background_tasks.add_task(process_document, doc_id, project_id, current_user["tenant_id"])
    
    return DocumentResponse(**{k: v for k, v in doc_record.items() if k != "content"})

@router.get("/projects/{project_id}/documents", response_model=list[DocumentResponse])
async def get_documents(project_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("documents").select("doc_id, project_id, filename, file_size_bytes, file_type, status, chunks_created, uploaded_at").eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    return [DocumentResponse(**d) for d in response.data]

@router.delete("/projects/{project_id}/documents/{doc_id}")
async def delete_document(project_id: str, doc_id: str, current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("documents").delete().eq("doc_id", doc_id).eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete chunks from Supabase
    supabase.table("chunks").delete().eq("doc_id", doc_id).execute()

    # Delete vectors from Qdrant
    delete_document_vectors(doc_id)

    # Update project doc count
    project = supabase.table("projects").select("doc_count").eq("project_id", project_id).execute()
    if project.data:
        new_count = max(0, project.data[0]["doc_count"] - 1)
        supabase.table("projects").update({"doc_count": new_count}).eq("project_id", project_id).execute()

    return {"success": True}

@router.post("/projects/{project_id}/documents/text", response_model=DocumentResponse)
async def add_text_content(
    project_id: str,
    request: AddTextRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Add text content directly without uploading a file.
    Useful for adding snippets, notes, or pasting content.
    """
    # Verify project exists
    project_response = supabase.table("projects").select("*").eq("project_id", project_id).eq("tenant_id", current_user["tenant_id"]).execute()
    if not project_response.data:
        raise HTTPException(status_code=404, detail="Project not found")

    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    # Create document record with text content
    doc_record = {
        "doc_id": doc_id,
        "project_id": project_id,
        "tenant_id": current_user["tenant_id"],
        "filename": f"{request.title}.txt",
        "file_size_bytes": len(request.content.encode('utf-8')),
        "file_type": "txt",
        "status": "processing",
        "chunks_created": 0,
        "content": request.content,
        "uploaded_at": now,
        "indexed_at": None
    }

    supabase.table("documents").insert(doc_record).execute()

    # Update project doc count
    supabase.table("projects").update({"doc_count": project_response.data[0]["doc_count"] + 1}).eq("project_id", project_id).execute()

    # Process in background
    background_tasks.add_task(process_document, doc_id, project_id, current_user["tenant_id"])

    return DocumentResponse(**{k: v for k, v in doc_record.items() if k != "content"})