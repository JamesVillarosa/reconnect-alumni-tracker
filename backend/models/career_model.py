from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from .base_model import MongoBaseModel, PyObjectId

class CareerEntryModel(MongoBaseModel):
    user_id: PyObjectId  # References the User's _id
    company: str
    position: str
    logo_url: Optional[str] = None
    start_date: Optional[str] = None  # Format: YYYY-MM
    end_date: Optional[str] = None
    is_current: bool = False
