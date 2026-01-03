"""
IBM watsonx.ai Service
Handles embeddings generation and LLM text generation
"""
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai.foundation_models.embeddings import Embeddings
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from typing import List, Dict, Any, Optional
from ..config import (
    WATSONX_API_KEY,
    WATSONX_PROJECT_ID,
    WATSONX_URL,
    WATSONX_EMBEDDING_MODEL,
    WATSONX_CHAT_MODEL
)


class WatsonXService:
    """Service for IBM watsonx.ai operations"""

    def __init__(self):
        """Initialize watsonx credentials"""
        self.api_key = WATSONX_API_KEY
        self.project_id = WATSONX_PROJECT_ID
        self.url = WATSONX_URL

        # Credentials dict for SDK
        self.credentials = {
            "url": self.url,
            "apikey": self.api_key
        }

        self.embedding_model_id = WATSONX_EMBEDDING_MODEL
        self.chat_model_id = WATSONX_CHAT_MODEL

        # Initialize embeddings model
        self.embeddings_model = Embeddings(
            model_id=self.embedding_model_id,
            credentials=self.credentials,
            project_id=self.project_id
        )

        print("✅ WatsonX Service initialized")
        print(f"🔍 Debugging: Chat model ID: {self.chat_model_id}")
        print(f"🔍 Debugging: Embedding model ID: {self.embedding_model_id}")

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single text

        Args:
            text: Input text to embed

        Returns:
            Embedding vector (768 dimensions for ibm/slate-125m-english-rtrvr-v2 model)
        """
        try:
            print(f"🔍 Debugging: Using embedding model ID: {self.embedding_model_id}")
            print(f"🔍 Debugging: Credentials URL: {self.credentials['url']}")
            print(f"🔍 Debugging: Project ID: {self.project_id}")

            print("✅ Embedding model initialized successfully")

            # Generate embedding using Embeddings class
            embedding_vector = self.embeddings_model.embed_query(text=text)
            print(f"🔍 Embedding generated with dimension: {len(embedding_vector)}")

            return embedding_vector

        except Exception as e:
            print(f"❌ Error generating embedding: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            print(f"❌ Model ID: {self.embedding_model_id}")
            raise

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts

        Args:
            texts: List of texts to embed

        Returns:
            List of embedding vectors
        """
        try:
            # Use embed_documents for batch processing
            embeddings = self.embeddings_model.embed_documents(texts=texts)

            print(f"✅ Generated {len(embeddings)} embeddings")
            return embeddings

        except Exception as e:
            print(f"❌ Error in batch embedding: {e}")
            raise

    def generate_text(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7,
        top_p: float = 1.0,
        top_k: int = 50
    ) -> Dict[str, Any]:
        """
        Generate text using IBM Granite LLM

        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-1)
            top_p: Nucleus sampling parameter
            top_k: Top-k sampling parameter

        Returns:
            Dict with generated text and metadata
        """
        try:
            # Set generation parameters
            parameters = {
                GenParams.MAX_NEW_TOKENS: max_tokens,
                GenParams.TEMPERATURE: temperature,
                GenParams.TOP_P: top_p,
                GenParams.TOP_K: top_k,
                GenParams.RETURN_OPTIONS: {
                    "input_text": True,
                    "generated_tokens": True
                }
            }

            # Initialize LLM model
            llm_model = Model(
                model_id=self.chat_model_id,
                params=parameters,
                credentials=self.credentials,
                project_id=self.project_id
            )

            # Generate text
            result = llm_model.generate_text(prompt=prompt)

            # Extract token count if available
            token_count = max_tokens  # Default fallback

            if isinstance(result, dict):
                generated_text = result.get("generated_text", result.get("results", [{}])[0].get("generated_text", ""))
                if "results" in result and len(result["results"]) > 0:
                    token_count = result["results"][0].get("generated_token_count", max_tokens)
            else:
                generated_text = str(result)

            return {
                "text": generated_text.strip(),
                "token_count": token_count,
                "model": self.chat_model_id
            }

        except Exception as e:
            print(f"❌ Error generating text: {e}")
            raise

    def generate_rag_response(
        self,
        query: str,
        context: str,
        system_prompt: str = "You are a helpful assistant that answers questions based on provided documentation.",
        fallback_message: str = "I don't have enough information to answer that question.",
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate RAG response given query and context

        Args:
            query: User question
            context: Retrieved context from documents
            system_prompt: System instruction
            fallback_message: Message when context is insufficient
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            Dict with generated response and metadata
        """
        try:
            # Build RAG prompt
            if context.strip():
                prompt = f"""{system_prompt}

Context from documentation:
{context}

User question: {query}

Please provide a helpful, accurate answer based ONLY on the context above. If the context doesn't contain relevant information, say "{fallback_message}"

Answer:"""
            else:
                # No context available
                return {
                    "text": fallback_message,
                    "token_count": 0,
                    "model": self.chat_model_id
                }

            # Generate response
            return self.generate_text(
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            )

        except Exception as e:
            print(f"❌ Error generating RAG response: {e}")
            raise


# Singleton instance
_watsonx_service: Optional[WatsonXService] = None


def get_watsonx_service() -> WatsonXService:
    """Get or create WatsonX service singleton"""
    global _watsonx_service
    if _watsonx_service is None:
        _watsonx_service = WatsonXService()
    return _watsonx_service
