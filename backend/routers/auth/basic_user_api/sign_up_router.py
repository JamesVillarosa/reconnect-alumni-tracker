import os
from fastapi import APIRouter, HTTPException, Response
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId
from models.users_model import UserSchema, CareerEntry
from config.database import users_collection
from datetime import datetime, timedelta, timezone
import jwt

router = APIRouter(prefix="/basic", tags=["Basic User Sign In/Up"])

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/sign-up")
async def sign_up(user: UserSchema, response: Response):

    # Check if user already exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Convert Pydantic model to dictionary
    user_data = user.model_dump(by_alias=True, exclude_none=True)
    user_data["biography"] = ""
    user_data["location"] = ""
    user_data["profile_picture"] = ""
    user_data["header_picture"] = ""
    user_data["contact_number"] = ""
    user_data["password"] = hashed_password
    user_data["role"] = "alumni"

    if isinstance(user.current_career, CareerEntry):
        user_data["current_career"] = user.current_career.model_dump()

    # Insert into database
    db_insert_response = users_collection.insert_one(user_data)

    access_token = create_access_token(
        data={"id": str(db_insert_response.inserted_id)}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Set the token in an HTTP-only cookie
    secure_cookie = os.getenv("API_ENVIRONMENT", "development") == "production"
    same_site_policy = "none" if secure_cookie else "lax"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Prevent JavaScript access (XSS protection)
        secure=secure_cookie, # Ensure it's sent only over HTTPS (true in production)
        samesite=same_site_policy,  # Adjust CSRF protection based on environment
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
    )

    # Prompt result
    return {"message": "User registered successfully", "user_id": str(db_insert_response.inserted_id)}
