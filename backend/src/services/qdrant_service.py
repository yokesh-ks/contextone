"""
Qdrant Vector Database Service
Handles all vector operations for document embeddings and similarity search
"""
import traceback
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue, PayloadSchemaType
from typing import List, Dict, Any, Optional
import uuid
from ..config import QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION_NAME


class QdrantService:
    """Service for managing vector operations with Qdrant"""

    def __init__(self):
        """Initialize Qdrant client with cloud credentials"""
        self.client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            timeout=30
        )
        self.collection_name = QDRANT_COLLECTION_NAME
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """Create collection if it doesn't exist"""
        try:
            # Expected vector size based on current embedding model (ibm/slate-125m-english-rtrvr-v2)
            expected_vector_size = 768
            print(f"🔍 Expected vector size for embedding model: {expected_vector_size}")

            collections = self.client.get_collections().collections
            collection_names = [col.name for col in collections]

            if self.collection_name not in collection_names:
                # Create collection with expected dimensions
                vector_size = expected_vector_size
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
                )
                print(f"✅ Created Qdrant collection: {self.collection_name} with vector size: {vector_size}")
            else:
                # Get existing collection info and log vector size
                collection_info = self.client.get_collection(collection_name=self.collection_name)
                current_vector_size = collection_info.config.params.vectors.size
                print(f"✅ Qdrant collection already exists: {self.collection_name} with current vector size: {current_vector_size}")

                if current_vector_size != expected_vector_size:
                    print(f"⚠️ Vector size mismatch! Expected: {expected_vector_size}, Current: {current_vector_size}")
                    print("🔄 Recreating collection with correct vector size (this will delete all existing data)")

                    # Delete the existing collection
                    self.client.delete_collection(collection_name=self.collection_name)
                    print(f"🗑️ Deleted collection {self.collection_name}")

                    # Recreate with correct size
                    self.client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=VectorParams(size=expected_vector_size, distance=Distance.COSINE)
                    )
                    print(f"✅ Recreated Qdrant collection: {self.collection_name} with vector size: {expected_vector_size}")

                else:
                    print(f"✅ Vector size matches expected: {expected_vector_size}")

            # Ensure payload indexes exist for filtering fields
            index_fields = ["project_id", "tenant_id", "doc_id"]
            for field in index_fields:
                try:
                    print(f"🔧 Attempting to create payload index for {field} with schema: {PayloadSchemaType.KEYWORD}")
                    self.client.create_payload_index(
                        collection_name=self.collection_name,
                        field_name=field,
                        field_schema=PayloadSchemaType.KEYWORD
                    )
                    print(f"✅ Created payload index for {field}")
                except Exception as e:
                    if "already exists" in str(e).lower():
                        print(f"ℹ️ Payload index for {field} already exists")
                    else:
                        print(f"❌ Error creating payload index for {field}: {e}")
                        raise
        except Exception as e:
            print(f"❌ Error ensuring collection exists: {e}")
            print(traceback.format_exc())
            raise

    def upsert_vectors(
        self,
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]],
        doc_id: str
    ) -> List[str]:
        """
        Insert or update vectors in Qdrant

        Args:
            vectors: List of embedding vectors
            payloads: List of metadata for each vector
            doc_id: Document ID for generating point IDs

        Returns:
            List of vector IDs
        """
        try:
            points = []
            vector_ids = []

            for idx, (vector, payload) in enumerate(zip(vectors, payloads)):
                # Generate unique ID for each vector point
                point_id = str(uuid.uuid4())
                vector_ids.append(point_id)

                points.append(
                    PointStruct(
                        id=point_id,
                        vector=vector,
                        payload=payload
                    )
                )

            # Batch upsert all points
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            print(f"✅ Upserted {len(points)} vectors for doc {doc_id}")
            return vector_ids

        except Exception as e:
            print(f"❌ Error upserting vectors: {e}")
            raise

    def search_similar(
        self,
        query_vector: List[float],
        project_id: str,
        tenant_id: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for similar vectors with filtering by project and tenant

        Args:
            query_vector: Query embedding vector
            project_id: Project ID to filter by
            tenant_id: Tenant ID for multi-tenancy isolation
            limit: Number of results to return

        Returns:
            List of search results with scores and payloads
        """
        try:
            # Build filter for multi-tenant isolation
            print(f"🔍 Searching with filters: project_id={project_id}, tenant_id={tenant_id}")
            search_filter = Filter(
                must=[
                    FieldCondition(
                        key="project_id",
                        match=MatchValue(value=project_id)
                    ),
                    FieldCondition(
                        key="tenant_id",
                        match=MatchValue(value=tenant_id)
                    )
                ]
            )

            # Perform similarity search
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=limit,
                with_payload=True
            )

            # Format results
            results = []
            for hit in search_results:
                results.append({
                    "id": hit.id,
                    "score": hit.score,
                    "chunk_text": hit.payload.get("chunk_text", ""),
                    "doc_id": hit.payload.get("doc_id", ""),
                    "doc_name": hit.payload.get("doc_name", ""),
                    "chunk_index": hit.payload.get("chunk_index", 0),
                    "page_number": hit.payload.get("page_number"),
                })

            print(f"✅ Found {len(results)} similar chunks for project {project_id}")
            return results

        except Exception as e:
            print(f"❌ Error searching vectors: {e}")
            raise

    def delete_document_vectors(self, doc_id: str) -> bool:
        """
        Delete all vectors associated with a document

        Args:
            doc_id: Document ID

        Returns:
            Success status
        """
        try:
            # Delete by filtering on doc_id
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="doc_id",
                            match=MatchValue(value=doc_id)
                        )
                    ]
                )
            )

            print(f"✅ Deleted vectors for doc {doc_id}")
            return True

        except Exception as e:
            print(f"❌ Error deleting vectors: {e}")
            return False

    def delete_project_vectors(self, project_id: str, tenant_id: str) -> bool:
        """
        Delete all vectors for a project (when project is deleted)

        Args:
            project_id: Project ID
            tenant_id: Tenant ID

        Returns:
            Success status
        """
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="project_id",
                            match=MatchValue(value=project_id)
                        ),
                        FieldCondition(
                            key="tenant_id",
                            match=MatchValue(value=tenant_id)
                        )
                    ]
                )
            )

            print(f"✅ Deleted all vectors for project {project_id}")
            return True

        except Exception as e:
            print(f"❌ Error deleting project vectors: {e}")
            return False

    def get_collection_info(self) -> Optional[Dict[str, Any]]:
        """Get collection statistics and info"""
        try:
            info = self.client.get_collection(collection_name=self.collection_name)
            return {
                "name": self.collection_name,
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
                "status": info.status
            }
        except Exception as e:
            print(f"❌ Error getting collection info: {e}")
            return None


# Singleton instance
_qdrant_service: Optional[QdrantService] = None


def get_qdrant_service() -> QdrantService:
    """Get or create Qdrant service singleton"""
    global _qdrant_service
    if _qdrant_service is None:
        _qdrant_service = QdrantService()
    return _qdrant_service
