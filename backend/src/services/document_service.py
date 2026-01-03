"""
Document Processing Service
Handles document parsing, chunking, embedding generation, and vector storage
"""
from typing import List, Dict, Any
from datetime import datetime, timezone
from .document_parser import DocumentParser
from .watsonx_service import get_watsonx_service
from .qdrant_service import get_qdrant_service
from ..dependencies.database import get_supabase
import traceback


def process_document(doc_id: str, project_id: str, tenant_id: str):
    """
    Process document: parse, chunk, embed, and store vectors

    This is the main background task for document processing.
    Steps:
    1. Retrieve document from Supabase
    2. Parse document based on file type
    3. Split into chunks
    4. Generate embeddings for each chunk
    5. Store vectors in Qdrant
    6. Update document status in Supabase
    """
    supabase = get_supabase()
    if not supabase:
        print("❌ Supabase not configured")
        return

    try:
        print(f"📄 Processing document {doc_id}...")

        # 1. Get document from database
        doc_response = supabase.table("documents").select("*").eq("doc_id", doc_id).execute()

        if not doc_response.data:
            print(f"❌ Document {doc_id} not found")
            return

        doc = doc_response.data[0]
        content = doc.get("content", "")
        filename = doc.get("filename", "")
        file_type = doc.get("file_type", "txt")

        print(f"📝 Document: {filename} ({file_type})")

        # 2. Parse and chunk document
        try:
            # For binary files (PDF, DOCX), we need to handle differently
            # If content is stored as text in DB, we need to handle it properly
            if file_type in ['pdf', 'docx']:
                # In a real scenario, we'd fetch from Supabase Storage
                # For now, if content is string, try to parse as text
                if isinstance(content, str):
                    chunks = DocumentParser.parse_and_chunk(
                        content=content,
                        file_type='txt',  # Fallback to text
                        filename=filename,
                        chunk_size=500,
                        overlap=50
                    )
                else:
                    chunks = DocumentParser.parse_and_chunk(
                        content=content,
                        file_type=file_type,
                        filename=filename,
                        chunk_size=500,
                        overlap=50
                    )
            else:
                # Text-based files
                chunks = DocumentParser.parse_and_chunk(
                    content=content,
                    file_type=file_type,
                    filename=filename,
                    chunk_size=500,
                    overlap=50
                )

            if not chunks:
                raise Exception("No chunks generated from document")

            print(f"✂️ Created {len(chunks)} chunks")

        except Exception as e:
            print(f"❌ Error parsing document: {e}")
            supabase.table("documents").update({
                "status": "failed",
                "error_message": f"Parsing error: {str(e)}"
            }).eq("doc_id", doc_id).execute()
            return

        # 3. Generate embeddings using watsonx
        try:
            watsonx = get_watsonx_service()

            # Extract chunk texts
            chunk_texts = [chunk["chunk_text"] for chunk in chunks]

            # Generate embeddings for all chunks
            print(f"🧠 Generating embeddings for {len(chunk_texts)} chunks...")
            embeddings = watsonx.generate_embeddings_batch(chunk_texts)

            if len(embeddings) != len(chunks):
                raise Exception(f"Embedding count mismatch: {len(embeddings)} != {len(chunks)}")

            print(f"✅ Generated {len(embeddings)} embeddings")

        except Exception as e:
            print(f"❌ Error generating embeddings: {e}")
            traceback.print_exc()
            supabase.table("documents").update({
                "status": "failed",
                "error_message": f"Embedding error: {str(e)}"
            }).eq("doc_id", doc_id).execute()
            return

        # 4. Store vectors in Qdrant
        try:
            qdrant = get_qdrant_service()

            # Build payloads for Qdrant
            payloads = []
            for chunk in chunks:
                payload = {
                    "project_id": project_id,
                    "tenant_id": tenant_id,
                    "doc_id": doc_id,
                    "doc_name": filename,
                    "chunk_text": chunk["chunk_text"],
                    "chunk_index": chunk["chunk_index"],
                    "char_count": chunk.get("char_count", len(chunk["chunk_text"])),
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                payloads.append(payload)

            # Upsert vectors to Qdrant
            print(f"💾 Storing {len(embeddings)} vectors in Qdrant...")
            vector_ids = qdrant.upsert_vectors(
                vectors=embeddings,
                payloads=payloads,
                doc_id=doc_id
            )

            print(f"✅ Stored {len(vector_ids)} vectors in Qdrant")

        except Exception as e:
            print(f"❌ Error storing vectors: {e}")
            traceback.print_exc()
            supabase.table("documents").update({
                "status": "failed",
                "error_message": f"Vector storage error: {str(e)}"
            }).eq("doc_id", doc_id).execute()
            return

        # 5. Store chunks in Supabase for reference
        try:
            for i, chunk in enumerate(chunks):
                chunk_doc = {
                    "chunk_id": vector_ids[i] if i < len(vector_ids) else f"chunk_{i}",
                    "doc_id": doc_id,
                    "project_id": project_id,
                    "tenant_id": tenant_id,
                    "content": chunk["chunk_text"],
                    "chunk_index": chunk["chunk_index"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                supabase.table("chunks").insert(chunk_doc).execute()

            print(f"✅ Stored {len(chunks)} chunks in Supabase")

        except Exception as e:
            print(f"⚠️ Warning: Error storing chunks in Supabase: {e}")
            # Don't fail the whole process if chunk storage fails

        # 6. Update document status to indexed
        try:
            supabase.table("documents").update({
                "status": "indexed",
                "chunks_created": len(chunks),
                "indexed_at": datetime.now(timezone.utc).isoformat(),
                "error_message": None
            }).eq("doc_id", doc_id).execute()

            print(f"✅ Document {doc_id} successfully processed and indexed!")

        except Exception as e:
            print(f"❌ Error updating document status: {e}")

    except Exception as e:
        print(f"❌ Unexpected error processing document {doc_id}: {e}")
        traceback.print_exc()

        try:
            supabase.table("documents").update({
                "status": "failed",
                "error_message": f"Processing error: {str(e)}"
            }).eq("doc_id", doc_id).execute()
        except:
            pass


def delete_document_vectors(doc_id: str):
    """Delete all vectors associated with a document from Qdrant"""
    try:
        qdrant = get_qdrant_service()
        qdrant.delete_document_vectors(doc_id)
        print(f"✅ Deleted vectors for document {doc_id}")
    except Exception as e:
        print(f"❌ Error deleting document vectors: {e}")


def delete_project_vectors(project_id: str, tenant_id: str):
    """Delete all vectors for a project from Qdrant"""
    try:
        qdrant = get_qdrant_service()
        qdrant.delete_project_vectors(project_id, tenant_id)
        print(f"✅ Deleted all vectors for project {project_id}")
    except Exception as e:
        print(f"❌ Error deleting project vectors: {e}")
