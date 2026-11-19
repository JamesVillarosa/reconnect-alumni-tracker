from .base_model import MongoBaseModel, PyObjectId
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class NotificationTypeEnum(str, Enum):
    article = "Article"
    job = "Job"
    event = "Event"
    donation = "Donation"

class NotificationSchema(MongoBaseModel):
    # Model for user notifications
    userId: Optional[PyObjectId] = None  # If None, it's a public notification
    type: NotificationTypeEnum  # Type of the notification (article, job, event, donation)
    referenceId: PyObjectId  # ID of the related object (Article, Job, Event, Donation)
    title: str  # Hardcoded: "New Story", "Jobs", "New Event", "New Cause"
    description: str  # The actual Event/Job/Donation/Article title
    is_read: bool = False  # Read/unread
