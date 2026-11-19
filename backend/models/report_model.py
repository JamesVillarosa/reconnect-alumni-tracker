from pydantic import BaseModel, Field
from typing import List, Optional

class ReportJobRequest(BaseModel):
    job_id: Optional[str] = Field(None, alias="_jobId")
    donation_id: Optional[str] = Field(None, alias="_donationId")
    user_id: str = Field(..., alias="_userId")
    category: List[str]
    description: Optional[str] = None
    status: Optional[str] = "Pending"
