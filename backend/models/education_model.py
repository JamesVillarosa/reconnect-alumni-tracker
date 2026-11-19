from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from .base_model import MongoBaseModel, PyObjectId

class EducationEntryModel(MongoBaseModel):
    user_id: PyObjectId  # References the User's _id
    school_name: str
    degree: str
    logo_url: Optional[str] = None
    graduation_date: Optional[str] = None  # Format: YYYY-MM
