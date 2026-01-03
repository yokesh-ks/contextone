from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get('REFRESH_TOKEN_EXPIRE_DAYS', 7))

# Google OAuth
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')

# CORS Origins
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

# Qdrant Vector Database
QDRANT_URL = os.environ.get('QDRANT_URL', '')
QDRANT_API_KEY = os.environ.get('QDRANT_API_KEY', '')
QDRANT_COLLECTION_NAME = os.environ.get('QDRANT_COLLECTION_NAME', 'contextone_documents')

# IBM watsonx.ai Configuration
WATSONX_API_KEY = os.environ.get('WATSONX_API_KEY', '')
WATSONX_PROJECT_ID = os.environ.get('WATSONX_PROJECT_ID', '')
WATSONX_URL = os.environ.get('WATSONX_URL', 'https://us-south.ml.cloud.ibm.com')
WATSONX_EMBEDDING_MODEL = os.environ.get('WATSONX_EMBEDDING_MODEL', 'ibm/granite-embedding-30m-english')
WATSONX_CHAT_MODEL = os.environ.get('WATSONX_CHAT_MODEL', 'meta-llama/llama-3-3-70b-instruct')

# Redis & Celery Configuration
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Plan Limits
PLAN_LIMITS = {
    'free': {
        'projects': 3,
    },
    'pro': {
        'projects': None,  # Unlimited
    },
    'enterprise': {
        'projects': None,  # Unlimited
    },
}