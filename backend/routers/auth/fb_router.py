from fastapi import Response
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
import os
from dotenv import load_dotenv
import httpx
from datetime import datetime, timedelta, timezone
import jwt
from jwt import PyJWTError
from fastapi.security import OAuth2PasswordBearer
from config.database import users_collection

load_dotenv()

fb_signin_router = APIRouter(prefix="/facebook/auth", tags=["auth"])

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# JWT const
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
 
 # Helper functions
 # EXTRACT TOKEN FROM HEADER
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # tokenUrl is a placeholder here.

# Create JWT TOKEN
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# DECODE AND VERIFY JWT TOKEN
def verify_token(token: str) -> dict:
 
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


# Redirect to Facebook OAuth2
@fb_signin_router.get("/signin")
async def facebook_signin():
    fb_oauth_url = (
        f"https://www.facebook.com/v22.0/dialog/oauth"
        f"?client_id={FACEBOOK_CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=email"
    )
    return RedirectResponse(fb_oauth_url)

# Handle the Facebook callback and issue JWT token
#   1. Exchange the code for a Facebook access token.
#   2. Use the access token to fetch the user's profile.
#   3. Generate a JWT token based on the user info.
@fb_signin_router.get("/callback")
async def facebook_callback(code: str = Query(...), response: Response = None):

    try:
        user_id = ""
        # Exchange CODE => Access Token
        token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        payload = {
            "client_id": FACEBOOK_CLIENT_ID,
            "client_secret": FACEBOOK_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "code": code,
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.get(token_url, params=payload)
            token_response.raise_for_status()
            fb_access_token = token_response.json().get("access_token")
            if not fb_access_token:
                raise HTTPException(status_code=400, detail="No access token provided by Facebook")

            # Get USER details from Facebook
            user_url = "https://graph.facebook.com/me"
            user_params = {"fields": "id,name,email", "access_token": fb_access_token}
            user_response = await client.get(user_url, params=user_params)
            user_response.raise_for_status()
            user_info = user_response.json()

            # ADDED: Check if user exists in MongoDB by email
            user_email = user_info.get("email")
            if not user_email:
                raise HTTPException(status_code=400, detail="Email not provided by Facebook")
            
            # ADDED: Query MongoDB for existing user
            existing_user = users_collection.find_one({"email": user_email})
            if not existing_user:
                # Split name into first and last names
                name_parts = user_info.get("name", "").split(" ")
                first_name = name_parts[0] if len(name_parts) > 0 else ""
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                
                # Create new user following the schema
                new_user = {
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                    "email": user_email,
                    "password": None,  # No password for OAuth users
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": "alumni",
                    "current_career": {
                        "company": "",
                        "classification": "",
                        "industry": "",
                        "tenured_status": False,
                        "salary_range": "",
                        "is_current": True
                    },
                    "auth_provider": "facebook",
                    "account_status": "Active",
                    "verification_status": "Unverified"
                }
                
                # Insert new user
                result = users_collection.insert_one(new_user)
                user_id = result.inserted_id
                existing_user = {**new_user, "_id": result.inserted_id}
            else:
                user_id = str(existing_user["_id"])

        # CREATE JWT TOKEN
        access_token = create_access_token(data={"id": user_id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

        response = RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/auth/callback")

        secure_cookie = os.getenv("API_ENVIRONMENT", "development") == "production"
        same_site_policy = "none" if secure_cookie else "lax"
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=secure_cookie,
            samesite=same_site_policy,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return response
        # # Set the token in an HTTP-only cookie
        # response.set_cookie(
        #     key="access_token",
        #     value=access_token,
        #     httponly=True,  # Prevent JavaScript access (XSS protection)
        #     secure=secure_cookie,  # Ensure it's sent only over HTTPS (true in production)
        #     samesite=same_site_policy,  # Adjust CSRF protection based on environment
        #     max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
        # )
    
        # return RedirectResponse(f"{os.getenv('FRONTEND_URL')}/auth/callback?token={access_token}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"OAuth2 flow failed: {e}")

# Sample protected Route
@fb_signin_router.get("/protected")
async def protected_route(token: str = Depends(oauth2_scheme)):
  
    # Extracts the TOKEN from the Authorization header,
    # Verify
    # Return user data in payload

    payload = verify_token(token)
    return {"message": "You are authenticated!", "user": payload}