from fastapi import Response, APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
import os
from dotenv import load_dotenv  
import httpx  
from datetime import datetime, timedelta, timezone  # Date/time handling
import jwt  # JWT handling
from jwt import PyJWTError  
from fastapi.security import OAuth2PasswordBearer  
from config.database import users_collection  

load_dotenv()

router = APIRouter(prefix="/google/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# JWT config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# util function to create a JWT access token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta  # Set expiration time
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# util function to verify a JWT token
def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub") or payload.get("id")  # Accept either 'sub' or 'id'
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# redirect user to Google sign-in page
@router.get("/signin")
async def google_sign_in():
    # Google's OAuth 2.0 authorization URL
    google_oauth_url = (
        f"https://accounts.google.com/o/oauth2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    return RedirectResponse(google_oauth_url)

# handle Google's callback after user consents
@router.get("/callback")
async def google_callback(code: str = Query(...), response: Response = None):
    try:
        async with httpx.AsyncClient() as client:
            # exchange authorization code for access token
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_data = token_response.json()

            if "access_token" not in token_data:
                raise HTTPException(status_code=400, detail="Failed to retrieve access token")
            
            # fetch user information using access token
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            user_info = user_response.json()

            # extract email from user info
            user_email = user_info.get("email")
            if not user_email:
                raise HTTPException(status_code=400, detail="Email not provided by Google")
            
            # check if user already exists in database
            existing_user = users_collection.find_one({"email": user_email})
            if not existing_user:
                # parse full name into first and last names
                name_parts = user_info.get("name", "").split(" ")
                first_name = name_parts[0] if len(name_parts) > 0 else ""
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                
                # create new user document
                new_user = {
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                    "email": user_email,
                    "password": None,  # no password since it's OAuth
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
                    "auth_provider": "google",
                    "account_status": "Active",
                    "verification_status": "Unverified"
                }
                result = users_collection.insert_one(new_user)
                existing_user = {**new_user, "_id": result.inserted_id}

        # create JWT token using user id
        access_token = create_access_token(
            data={"id": str(existing_user["_id"])},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        # redirect to frontend callback route
        response = RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/user")

        secure_cookie = os.getenv("API_ENVIRONMENT", "development") == "production"
        same_site_policy = "none" if secure_cookie else "lax"

        # set JWT token as HTTP-only secure cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=secure_cookie,
            samesite=same_site_policy,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return response

    except httpx.HTTPError as e:
        # Handle possible HTTP errors during token or user info retrieval
        raise HTTPException(status_code=400, detail=f"OAuth2 flow failed: {e}")

# Sample protected route requiring authentication via token
@router.get("/protected")
async def protected_route(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    return {"message": "You are authenticated!", "user": payload}
