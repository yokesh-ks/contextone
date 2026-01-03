#!/usr/bin/env python3

import os
from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Supabase credentials not found in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

try:
    # Try to select from users table
    response = supabase.table("users").select("id").limit(1).execute()
    print("Users table exists!")
    print(f"Sample data: {response.data}")
except Exception as e:
    print(f"Error accessing users table: {e}")

try:
    # Try to select from api_keys table
    response = supabase.table("api_keys").select("key_id").limit(1).execute()
    print("API keys table exists!")
    print(f"Sample data: {response.data}")
except Exception as e:
    print(f"Error accessing api_keys table: {e}")