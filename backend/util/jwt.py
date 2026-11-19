
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError as PyJWTError
from fastapi import HTTPException

# Credits to: Cabrera, Jan Carlo
# NOT USED YET
# JWT const
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

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