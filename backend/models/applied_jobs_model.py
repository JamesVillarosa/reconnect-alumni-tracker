from .base_model import MongoBaseModel, PyObjectId
from datetime import datetime

class AppliedJobSchema(MongoBaseModel):
    user_id: PyObjectId  # Reference to the user
    job_id: PyObjectId   # Reference to the job
    date: datetime  # Date of application to job
