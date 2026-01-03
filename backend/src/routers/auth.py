from fastapi import APIRouter, HTTPException, Depends, Request
from supabase import Client
from ..models.schemas import UserCreate, UserLogin, TokenResponse, RefreshTokenRequest, UserResponse
from ..dependencies.auth import get_current_user
from ..utils.auth import hash_password, verify_password, create_access_token, create_refresh_token
from ..dependencies.database import get_supabase
from ..config import JWT_SECRET, JWT_ALGORITHM, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
import uuid
import jwt
from datetime import datetime, timezone
from requests_oauthlib import OAuth2Session
from urllib.parse import urlencode

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, supabase: Client = Depends(get_supabase)):
    # Check if user exists
    existing = supabase.table("users").select("id").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    tenant_id = f"tenant_{uuid.uuid4().hex[:12]}"
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "tenant_id": tenant_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "plan": "free",
        "created_at": now,
        "updated_at": now
    }
    
    supabase.table("users").insert(user_doc).execute()
    
    access_token = create_access_token({"sub": user_id, "tenant_id": tenant_id})
    refresh_token = create_refresh_token({"sub": user_id, "tenant_id": tenant_id})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, tenant_id=tenant_id)

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, supabase: Client = Depends(get_supabase)):
    response = supabase.table("users").select("*").eq("email", user_data.email).execute()
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = response.data[0]
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user["id"], "tenant_id": user["tenant_id"]})
    refresh_token = create_refresh_token({"sub": user["id"], "tenant_id": user["tenant_id"]})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, tenant_id=user["tenant_id"])

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest):
    try:
        payload = jwt.decode(data.refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        
        access_token = create_access_token({"sub": user_id, "tenant_id": tenant_id})
        new_refresh_token = create_refresh_token({"sub": user_id, "tenant_id": tenant_id})
        
        return TokenResponse(access_token=access_token, refresh_token=new_refresh_token, tenant_id=tenant_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.get("/google")
async def google_oauth():
    """Initiate Google OAuth flow"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    google = OAuth2Session(
        client_id=GOOGLE_CLIENT_ID,
        redirect_uri="http://localhost:8001/api/auth/google/callback",
        scope=["openid", "email", "profile"]
    )

    authorization_url, state = google.authorization_url(
        'https://accounts.google.com/o/oauth2/auth',
        access_type="offline",
        prompt="select_account"
    )

    return {"authorization_url": authorization_url, "state": state}

@router.get("/google/callback")
async def google_oauth_callback(request: Request, supabase: Client = Depends(get_supabase)):
    """Handle Google OAuth callback"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    code = request.query_params.get('code')
    error = request.query_params.get('error')

    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

    if not code:
        raise HTTPException(status_code=400, detail="Authorization code missing")

    try:
        google = OAuth2Session(
            client_id=GOOGLE_CLIENT_ID,
            redirect_uri="http://localhost:8001/api/auth/google/callback"
        )

        token = google.fetch_token(
            'https://oauth2.googleapis.com/token',
            client_secret=GOOGLE_CLIENT_SECRET,
            code=code
        )

        # Get user info from Google
        user_info = google.get('https://www.googleapis.com/oauth2/v2/userinfo').json()

        email = user_info.get('email')
        name = user_info.get('name')
        google_id = user_info.get('id')

        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

        # Check if user exists
        print(f"Checking if user exists with email: {email}")
        try:
            existing = supabase.table("users").select("*").eq("email", email).execute()
            print(f"User check result: {existing.data}")
        except Exception as e:
            print(f"Error checking user: {e}")
            raise

        if existing.data:
            # User exists, log them in
            user = existing.data[0]
            user_id = user["id"]
            tenant_id = user["tenant_id"]
        else:
            # Create new user
            tenant_id = f"tenant_{uuid.uuid4().hex[:12]}"
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            now = datetime.now(timezone.utc).isoformat()

            user_doc = {
                "id": user_id,
                "tenant_id": tenant_id,
                "email": email,
                "password_hash": None,  # No password for OAuth users
                "full_name": name or email.split('@')[0],
                "plan": "free",
                "created_at": now,
                "updated_at": now,
                "google_id": google_id
            }

            print(f"Creating new user: {user_doc}")
            try:
                supabase.table("users").insert(user_doc).execute()
                print("User created successfully")
            except Exception as e:
                print(f"Error creating user: {e}")
                raise

        # Create tokens
        access_token = create_access_token({"sub": user_id, "tenant_id": tenant_id})
        refresh_token = create_refresh_token({"sub": user_id, "tenant_id": tenant_id})

        # Redirect to frontend with tokens
        frontend_url = "http://localhost:5175"
        params = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "tenant_id": tenant_id
        }
        redirect_url = f"{frontend_url}/auth/callback?{urlencode(params)}"

        return {"redirect_url": redirect_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth processing failed: {str(e)}")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
    response = supabase.table("users").select("*").eq("id", current_user["user_id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = response.data[0]
    return UserResponse(**user)