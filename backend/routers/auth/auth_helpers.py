import os
import random
import bcrypt
from fastapi import APIRouter, BackgroundTasks, HTTPException, Response, Request, Depends
import jwt
from config.database import users_collection, db
from bson import ObjectId
from middleware.require_auth import verify_token
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from passlib.context import CryptContext


router = APIRouter(prefix="/auth", tags=["Auth Helpers"])

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Route to validate if user is logged in
@router.get("/validate_user")
async def validate_user(user: dict = Depends(verify_token)):
    """
    Route to verify JWT token from HTTP-only cookies.
    """
    return {"message": "Token is valid", "user": user}


# Route to log out user by removing the cookie
@router.post("/logout")
async def logout(response: Response):
    """
    Clears JWT in cookies
    """
    secure_cookie = os.getenv("API_ENVIRONMENT", "development") == "production"
    same_site_policy = "none" if secure_cookie else "lax"
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=secure_cookie, # Ensure it's sent only over HTTPS (true in production)
        samesite=same_site_policy,  # Adjust CSRF protection based on environment
        path="/",
        
    )
    return {"message": "Logged out successfully"}


# ----- SEND RESET CODE FOR FORGOT PASSWORD
class SendResetCodeRequest(BaseModel):
    email: EmailStr

def get_user_by_email(email: str):
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
    

    user["_id"] = str(user["_id"])


    return user

async def save_reset_code(user_id: str, code: str):
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    db["password_reset_codes"].replace_one(
        {"user_id": str(user_id)},
        {"user_id": str(user_id), "code": code, "expires_at": expires_at},
        upsert=True
    )

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="Re:Connect Support",
    MAIL_STARTTLS=True,  
    MAIL_SSL_TLS=False,  
    USE_CREDENTIALS=True
)

async def send_email_code(email: str, code: str):
    message = MessageSchema(
        subject="Your Password Reset Code",
        recipients=[email],
        body=f"Your reset code is: {code}",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)



@router.post("/send-reset-code")
async def send_reset_code(data: SendResetCodeRequest, background_tasks: BackgroundTasks):
    user = get_user_by_email(data.email)
    print("USER: ", user)
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    code = f"{random.randint(0, 9999):04}"  # always 4 digits

    await save_reset_code(user["_id"], code)  # Save to DB or cache
    background_tasks.add_task(send_email_code, email=data.email, code=code)

    return {"message": "Verification code sent"}

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=4)
    new_password: str = Field(..., min_length=6)

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    #  Find reset code
    record = db["password_reset_codes"].find_one({
        "user_id": {"$exists": True},
        "code": data.code
    })

    # print("RECORD: ", record)

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    # Convert user_id string from record into ObjectId
    try:
        user_id = ObjectId(record["user_id"])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    #  Match user and email
    user = get_user_by_email(data.email)
    # print("USER: ", user)
    if not user or user["_id"] != record["user_id"] :
        raise HTTPException(status_code=400, detail="Code does not match email")

    #  Hash new password
    hashed_pw = pwd_context.hash(data.new_password)

    #  Update user's password
    result = users_collection.update_one(
        {"_id": user_id},
        {"$set": {"password": hashed_pw}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update password")

    #  Delete used code
    db["password_reset_codes"].delete_one({"user_id": record["user_id"]})

    return {"message": "Password reset successful"}

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=4)

@router.post("/verify-code")
async def verify_code(data: VerifyCodeRequest):
    # Get user
    user = get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")

    # Fetch stored reset code
    record = db["password_reset_codes"].find_one({
        "user_id": str(user["_id"]),
        "code": data.code
    })

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset code has expired")

    return {"message": "Code verified"}
