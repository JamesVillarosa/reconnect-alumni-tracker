from .base_model import MongoBaseModel, PyObjectId
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, EmailStr

class ApprovalStatusEnum(str, Enum):
    # Defines possible approval states for events
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"
    flagged = "Flagged"
    archived = "Archived"
    closed = "Closed"

class OrganizerEntry(BaseModel):
    # Represents a single organizer's contact info
    name: str  # Full name of the organizer
    email: EmailStr  # Organizer's email address

class EventSchema(MongoBaseModel):
    # Event model schema for managing events and RSVP tracking
    created_by: PyObjectId  # Reference to user who created the event
    title: str  # Event title
    description: str  # Event description
    event_date: str  # Date of the event
    location: str  # Event location
    organizers: List[OrganizerEntry]  # List of organizers with name and email
    approval_status: ApprovalStatusEnum = ApprovalStatusEnum.pending  # Approval status
    eventImageURL: str  # URL to event image
    rsvp_count: int = 0  # Count of RSVPs (retained for summary view)
    commentId: Optional[PyObjectId] = None  # Reference to comment thread


class CreateEventSchema(BaseModel):
    title: str  # Event title
    description: str  # Event description
    event_date: str  # Date of the event
    location: str  # Event location
    organizers: List[OrganizerEntry] = []  # List of organizers with name and email
    eventImageURL: str = ""  # URL to event image