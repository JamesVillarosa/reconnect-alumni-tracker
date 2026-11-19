from .base_model import MongoBaseModel, PyObjectId
from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime

class RSVPStatusEnum(str, Enum):
    # Defines RSVP state options
    going = "Going"
    cancelled = "Cancelled"
    done = "Done"

class RSVPSchema(MongoBaseModel):
    # RSVP model schema for user-event participation tracking
    event_id: PyObjectId  # Reference to the Event
    user_id: PyObjectId  # Reference to the User who RSVP'd
    name: str  # Name of the user
    email: EmailStr  # Email of the user
    status: RSVPStatusEnum  # Current RSVP status
    date: datetime  # Date of RSVP action
