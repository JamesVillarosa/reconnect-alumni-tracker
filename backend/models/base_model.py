from pydantic import BaseModel, BeforeValidator, ConfigDict, Field
from typing import Annotated, Any, Optional
from bson import ObjectId
from datetime import datetime, timezone


# --- Define the Validator Function ---
# This function will be used by Pydantic v2's validation system
def validate_object_id(v: Any) -> ObjectId:
    """Checks if v is a valid ObjectId or can be converted to one."""
    if isinstance(v, ObjectId):
        return v
    if ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError(f"Invalid ObjectId format: {v}")

# class BsonObjectId(str):
#     # Custom type for handling MongoDB ObjectId fields, validates and converts ObjectId to string format
#     @classmethod
#     def __get_validators__(cls):
#         yield cls.validate

#     @classmethod
#     def validate(cls, v):
#         if not ObjectId.is_valid(v):
#             raise ValueError("Invalid ObjectId")
#         return str(v)

PyObjectId = Annotated[str, BeforeValidator(str)]

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,  # IMPORTANT: Allows using the alias '_id' during validation
        arbitrary_types_allowed=True, # IMPORTANT: Needed for types like ObjectId
        json_encoders={
            ObjectId: str, # How to convert ObjectId to JSON string for responses
            # Optional: Add encoder for datetime if needed
            # datetime: lambda dt: dt.isoformat().replace('+00:00', 'Z')
        },
    )