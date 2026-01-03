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

# Migration SQL
migration_sql = """
ALTER TABLE documents ADD COLUMN IF NOT EXISTS error_message TEXT;
"""

try:
    # Execute the migration
    result = supabase.rpc('exec_sql', {'sql': migration_sql})
    print("✅ Migration applied successfully")
except Exception as e:
    print(f"❌ Error applying migration: {e}")
    # Fallback: try direct execution if rpc doesn't work
    try:
        supabase.table('documents').select('*').limit(1).execute()
        print("Table exists, trying direct ALTER...")
        # Note: Supabase client doesn't support DDL directly, but we can try
        print("Please run the SQL manually in Supabase dashboard:")
        print(migration_sql)
    except Exception as e2:
        print(f"❌ Error checking table: {e2}")
        print("Please run the SQL manually in Supabase dashboard:")
        print(migration_sql)