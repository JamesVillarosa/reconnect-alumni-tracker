import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field, StrictStr
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from config.database import users_collection

router = APIRouter(prefix="/basic", tags=["Basic User Sign In/Up"])

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REMEMBER_ME_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserLogin(BaseModel):
    email: EmailStr = Field("sample@user.com", min_length=1)  
    password: StrictStr = Field("ABCabc123!", min_length=1)
    rememberMe: Optional[bool] = False  

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/sign-in")
async def login(user: UserLogin, response: Response):
    db_user = users_collection.find_one({"email": user.email})
    
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(db_user["_id"])

    if user.rememberMe:
        token_expires_delta = timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
        # Cookie max_age is in seconds
        cookie_max_age = REMEMBER_ME_EXPIRE_DAYS * 24 * 60 * 60
        print(f"Remember Me is ON: Setting expiration for {REMEMBER_ME_EXPIRE_DAYS} days.")
    else:
        token_expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        # Cookie max_age is in seconds
        cookie_max_age = ACCESS_TOKEN_EXPIRE_MINUTES * 60
        print(f"Remember Me is OFF: Setting default expiration for {ACCESS_TOKEN_EXPIRE_MINUTES} minutes.")

    access_token = create_access_token(
        data={"id": user_id}, expires_delta=token_expires_delta
    )

    # Set the token in an HTTP-only cookie
    secure_cookie = os.getenv("API_ENVIRONMENT", "development") == "production"
    same_site_policy = "none" if secure_cookie else "lax"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Prevent JavaScript access (XSS protection)
        secure=secure_cookie,  # Ensure it's sent only over HTTPS (true in production)
        samesite=same_site_policy,  # Adjust CSRF protection based on environment
        max_age=cookie_max_age,  # Convert minutes to seconds
    )

    return {"message": "Login successful"}
