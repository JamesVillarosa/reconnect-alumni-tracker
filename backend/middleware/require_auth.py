from fastapi import Request, HTTPException, Depends
import jwt
import os
from config.database import users_collection
from bson import ObjectId

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# DECODE AND VERIFY JWT TOKEN FROM COOKIE
def verify_token(request: Request) -> dict:
    """
    Middleware to verify JWT token from HTTP-only cookies.
    """
    token = request.cookies.get("access_token")  # Extract token from cookies
    
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Find user in the database
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # Exclude password

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Convert ObjectId fields to string for JSON serialization
        user["_id"] = str(user["_id"])

        return user  # Return user object without password

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
