from .base_model import MongoBaseModel, PyObjectId
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ReportDonationCategoryEnum(str, Enum):
    # Categories for donation report
    suspicious_fundraising = "Suspicious fundraising activity"
    offensive_description = "Offensive or inappropriate content"
    fake_or_duplicate = "Fake or duplicate donation"
    spam_or_ads = "Spam or unrelated ads"
    other = "Other"

class ReportStatusEnum(str, Enum):
    pending = "Pending"
    approved = "Approved"
    dismissed = "Dismissed"

class ReportDonationSchema(MongoBaseModel):
    # Schema for reporting a donation entry
    _donationId: PyObjectId  # ID of the reported donation
    _userId: PyObjectId      # ID of the reporting user
    category: List[ReportDonationCategoryEnum]  # Reason(s) for report
    description: Optional[str] = None  # Optional unless "Other"
    status: ReportStatusEnum = ReportStatusEnum.pending  # Default
