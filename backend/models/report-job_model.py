from .base_model import MongoBaseModel, PyObjectId
from typing import List, Optional
from enum import Enum
from datetime import datetime

class ReportCategoryEnum(str, Enum):
    # Defines categories of job reports
    offensive_or_discriminatory = "It's offensive and/or discriminatory"
    fake_job_or_money = "Asking for money or a fake job"
    inaccurate_info = "Inaccurate information provided"
    unrelated_selling = "I think it's trying to sell something unrelated"
    other = "Other"

class ReportStatusEnum(str, Enum):
    # Status of the report
    pending = "Pending"
    approved = "Approved"
    dismissed = "Dismissed"

class ReportJobSchema(MongoBaseModel):
    # Schema for job report submitted by a user
    _jobId: PyObjectId  # ID of the reported job
    _userId: PyObjectId  # ID of the reporting user
    category: List[ReportCategoryEnum]  # One or more report categories
    description: Optional[str] = None  # Optional unless "Other" is selected
    status: ReportStatusEnum = ReportStatusEnum.pending  # Default is pending
