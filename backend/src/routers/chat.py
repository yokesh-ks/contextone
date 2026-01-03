"""
Chat API Endpoint with Real RAG Implementation
Uses Qdrant for vector similarity search and watsonx for LLM generation
"""
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..models.schemas import ChatRequest, ChatResponse
from ..dependencies.auth import get_current_user, verify_api_key
from ..dependencies.database import get_supabase
from ..services.watsonx_service import get_watsonx_service
from ..services.qdrant_service import get_qdrant_service
import uuid
from datetime import datetime, timezone
import time

router = APIRouter()


@router.post("/projects/{project_id}/chat", response_model=ChatResponse)
async def chat(
    project_id: str,
    chat_data: ChatRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    RAG Chat endpoint for authenticated users (dashboard)

    Steps:
    1. Validate project exists and user has access
    2. Generate embedding for user query
    3. Search Qdrant for similar document chunks
    4. Build context from retrieved chunks
    5. Generate response using watsonx LLM
    6. Save conversation to database
    7. Return response with sources
    """
    start_time = time.time()

    # 1. Validate project access
    project_response = supabase.table("projects").select("*").eq(
        "project_id", project_id
    ).eq("tenant_id", current_user["tenant_id"]).execute()

    if not project_response.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_response.data[0]

    try:
        # 2. Generate embedding for user query
        watsonx = get_watsonx_service()
        query_embedding = watsonx.generate_embedding(chat_data.query)

        # 3. Search Qdrant for similar chunks
        qdrant = get_qdrant_service()
        top_k = project.get("model_config", {}).get("top_k_retrieval", 5) if isinstance(project.get("model_config"), dict) else 5

        search_results = qdrant.search_similar(
            query_vector=query_embedding,
            project_id=project_id,
            tenant_id=current_user["tenant_id"],
            limit=top_k
        )

        # 4. Build context from search results
        context = ""
        sources = []

        if search_results:
            context_parts = []
            for hit in search_results:
                context_parts.append(
                    f"[Document: {hit['doc_name']}]\n{hit['chunk_text']}"
                )
                sources.append({
                    "doc_id": hit["doc_id"],
                    "doc_name": hit["doc_name"],
                    "chunk": hit["chunk_text"][:200] + "..." if len(hit["chunk_text"]) > 200 else hit["chunk_text"],
                    "relevance_score": hit["score"]
                })

            context = "\n\n".join(context_parts)

        # 5. Generate response using watsonx LLM
        system_prompt = project.get("system_prompt", "You are a helpful assistant.")
        fallback_message = project.get("fallback_message", "I don't have enough information to answer that.")

        model_config = project.get("model_config", {}) if isinstance(project.get("model_config"), dict) else {}
        temperature = model_config.get("temperature", 0.7)
        max_tokens = model_config.get("max_tokens", 500)

        llm_response = watsonx.generate_rag_response(
            query=chat_data.query,
            context=context,
            system_prompt=system_prompt,
            fallback_message=fallback_message,
            max_tokens=max_tokens,
            temperature=temperature
        )

        answer = llm_response["text"]
        token_count = llm_response["token_count"]

    except Exception as e:
        # Fallback to default message on error
        print(f"❌ Error in RAG pipeline: {e}")
        import traceback
        traceback.print_exc()

        answer = project.get("fallback_message", "I encountered an error processing your question. Please try again.")
        sources = []
        token_count = 0

    # 6. Save conversation to database
    conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    response_time_ms = int((time.time() - start_time) * 1000)

    try:
        conv_doc = {
            "conversation_id": conversation_id,
            "project_id": project_id,
            "tenant_id": current_user["tenant_id"],
            "messages": [
                {"role": "user", "content": chat_data.query, "timestamp": now},
                {"role": "assistant", "content": answer, "timestamp": now, "sources": sources}
            ],
            "created_at": now,
            "updated_at": now
        }
        supabase.table("conversations").insert(conv_doc).execute()

        # Update project stats
        current_conversations = project.get("total_conversations", 0)
        current_tokens = project.get("total_tokens_used", 0)

        supabase.table("projects").update({
            "total_conversations": current_conversations + 1,
            "total_tokens_used": current_tokens + token_count
        }).eq("project_id", project_id).execute()

    except Exception as e:
        print(f"⚠️ Error saving conversation: {e}")

    # 7. Return response
    return ChatResponse(
        answer=answer,
        sources=sources,
        conversation_id=conversation_id
    )


@router.post("/widget/{project_id}/chat", response_model=ChatResponse)
async def widget_chat(
    project_id: str,
    chat_data: ChatRequest,
    auth: dict = Depends(verify_api_key),
    supabase: Client = Depends(get_supabase)
):
    """
    RAG Chat endpoint for widget (API key authentication)

    This endpoint is called by the embedded JavaScript widget
    on end-user websites. Uses API key for authentication.
    """
    start_time = time.time()

    # 1. Validate project access via API key
    project_response = supabase.table("projects").select("*").eq(
        "project_id", project_id
    ).eq("tenant_id", auth["tenant_id"]).execute()

    if not project_response.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_response.data[0]

    try:
        # 2. Generate embedding for user query
        watsonx = get_watsonx_service()
        query_embedding = watsonx.generate_embedding(chat_data.query)

        # 3. Search Qdrant for similar chunks
        qdrant = get_qdrant_service()
        top_k = project.get("model_config", {}).get("top_k_retrieval", 5) if isinstance(project.get("model_config"), dict) else 5

        search_results = qdrant.search_similar(
            query_vector=query_embedding,
            project_id=project_id,
            tenant_id=auth["tenant_id"],
            limit=top_k
        )

        # 4. Build context from search results
        context = ""
        sources = []

        if search_results:
            context_parts = []
            for hit in search_results:
                context_parts.append(
                    f"[Document: {hit['doc_name']}]\n{hit['chunk_text']}"
                )
                sources.append({
                    "doc_id": hit["doc_id"],
                    "doc_name": hit["doc_name"],
                    "chunk": hit["chunk_text"][:150] + "...",
                    "relevance_score": hit["score"]
                })

            context = "\n\n".join(context_parts)

        # 5. Generate response using watsonx LLM
        system_prompt = project.get("system_prompt", "You are a helpful assistant.")
        fallback_message = project.get("fallback_message", "I don't have enough information to answer that.")

        model_config = project.get("model_config", {}) if isinstance(project.get("model_config"), dict) else {}
        temperature = model_config.get("temperature", 0.7)
        max_tokens = model_config.get("max_tokens", 500)

        llm_response = watsonx.generate_rag_response(
            query=chat_data.query,
            context=context,
            system_prompt=system_prompt,
            fallback_message=fallback_message,
            max_tokens=max_tokens,
            temperature=temperature
        )

        answer = llm_response["text"]
        token_count = llm_response["token_count"]

    except Exception as e:
        # Fallback to default message on error
        print(f"❌ Error in RAG pipeline: {e}")
        import traceback
        traceback.print_exc()

        answer = project.get("fallback_message", "I'm having trouble answering that. Please try rephrasing.")
        sources = []
        token_count = 0

    # 6. Save conversation to database
    conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    response_time_ms = int((time.time() - start_time) * 1000)

    try:
        conv_doc = {
            "conversation_id": conversation_id,
            "project_id": project_id,
            "tenant_id": auth["tenant_id"],
            "messages": [
                {"role": "user", "content": chat_data.query, "timestamp": now},
                {"role": "assistant", "content": answer, "timestamp": now, "sources": sources}
            ],
            "created_at": now
        }
        supabase.table("conversations").insert(conv_doc).execute()

        # Update project stats
        current_conversations = project.get("total_conversations", 0)
        current_tokens = project.get("total_tokens_used", 0)

        supabase.table("projects").update({
            "total_conversations": current_conversations + 1,
            "total_tokens_used": current_tokens + token_count
        }).eq("project_id", project_id).execute()

    except Exception as e:
        print(f"⚠️ Error saving conversation: {e}")

    # 7. Return response
    return ChatResponse(
        answer=answer,
        sources=sources,
        conversation_id=conversation_id
    )
