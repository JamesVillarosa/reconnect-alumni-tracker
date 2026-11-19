from .base_model import MongoBaseModel, PyObjectId
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class InfoRequestStatusEnum(str, Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"

class InfoRequestSchema(MongoBaseModel):
    # Model for alumni information requests
    submitted_by: PyObjectId  # ID of the alumni user making the request
    recipient_name: str  # Full name of the intended recipient
    recipient_email: EmailStr  # Email of the recipient
    requested_info: str  # Message or specific info being requested
    status: InfoRequestStatusEnum = InfoRequestStatusEnum.pending  # Default: Pending
