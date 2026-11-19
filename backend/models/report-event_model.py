from .base_model import MongoBaseModel, PyObjectId
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ReportEventCategoryEnum(str, Enum):
    # Categories for event reports
    inappropriate_content = "Inappropriate or offensive event"
    misleading_info = "Misleading or incorrect details"
    spam_or_ads = "Spam or promotional content"
    duplicate_event = "Duplicate or fake event"
    other = "Other"

class ReportStatusEnum(str, Enum):
    pending = "Pending"
    approved = "Approved"
    dismissed = "Dismissed"

class ReportEventSchema(MongoBaseModel):
    # Schema for reporting an event
    _eventId: PyObjectId  # ID of the reported event
    _userId: PyObjectId   # ID of the reporting user
    category: List[ReportEventCategoryEnum]  # One or more selected categories
    description: Optional[str] = None  # Optional, required for "Other"
    status: ReportStatusEnum = ReportStatusEnum.pending  # Initial status
