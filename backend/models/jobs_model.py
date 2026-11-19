# Projected JSON format:
# {
#   "_id": ObjectId("65f4e1b97d98f3a8a4e8b2d1"),
#   "created_at": "2024-03-15T10:00:00Z",
#   "updated_at": "2024-03-15T10:00:00Z",
#   "authorId": ObjectId("65f4e1a07d98f3a8a4e8b2c3"),
#   "title": "Software Engineer",
#   "company_name": "TechCorp",
#   "company_url": "https://techcorp.com",
#   "location": "Manila, Philippines",
#   "job_field": "Web Developer", 
#   "job_type": "Full-Time",
#   "job_level": "Mid_Level",
#   "min_salary": 60000,
#   "max_salary": 80000,
#   "description": "Exciting opportunity in software development...",
#   "application_link": "https://company.com/apply",
#   "flagged": false
#   "qualifications": ["Bachelor's degree in Computer Science", "2+ years of experience"],
#   "start_date": "2024-04-01",
#   "end_date": "2024-06-01",
#   "status": "Still Hiring",
#   "date_posted": "2024-03-15T10:00:00Z",
#   "author_name": "John Doe"
# }

from pydantic import BaseModel
from .base_model import MongoBaseModel, PyObjectId
from typing import Optional, List
from enum import Enum
from datetime import datetime

class JobTypeEnum(str, Enum):
    # Defines types of job positions available
    full_time = "Full-Time"
    part_time = "Part-Time"

class JobLevelEnum(str, Enum):
    # Defines level of job positions available
    internship = "Intern"
    entry_level = "Entry Level"
    junior = "Junior"
    mid_level = "Mid Level"
    senior = "Senior"
    lead = "Lead"
    principal = "Principal"

class JobFieldEnum(str, Enum):
    # Defines field of job available
    web_dev = "Web Developer"
    mobile_dev = "Mobile Developer"
    backend_dev = "Backend Developer"
    frontend_dev = "Frontend Developer"
    fullstack_dev = "Full Stack Developer"
    uiux_dev = "UI/UX Developer"
    qa_tester = "QA Tester"
    devops_eng = "DevOps Engineer"
    data_analyst = "Data Analyst"
    project_manager = "Project Manager"

class JobStatusEnum(str, Enum):
    # Defines job status for admin visibility
    still_hiring = "Still Hiring"
    closed = "Closed"
    archived = "Archived"

class JobPostingSchema(MongoBaseModel):
    # Job posting model schema containing job details and application information
    authorId: str = "65f4e1a07d98f3a8a4e8b2c3" # Reference to user who posted the job
    title: str = "Software Engineer"  # Job title
    company_name: str = "LinoFlap"  # Company offering the job
    company_url: str = "linoflap.com"  # Company website URL
    location: str  # Job location
    job_field: JobFieldEnum  # Field/discipline of the job
    job_type: JobTypeEnum  # Type of employment
    job_level: JobLevelEnum  # Level of employment
    min_salary: Optional[float] = None  # Minimum salary
    max_salary: Optional[float] = None  # Maximum salary 
    description: str  # Job description
    application_link: str  # Link to apply for the job
    flagged: bool = False  # Flag for inappropriate content
    # applicants: List[str] = []  # List of applicants for the job
    qualifications: List[str]  # List of qualifications for the job
    start_date: datetime  # Start date (required)
    end_date: datetime  # End date (required)
    commentId: Optional[PyObjectId]  # Reference to comment thread

    # Added for admin - job posting page
    status: JobStatusEnum  # Status of the job posting (Still Hiring or Closed)
    date_posted: Optional[datetime] = None  # Date when job was posted
    author_name: str  # Name of the job author

# Added a schema for creating a Body() for Create Job
class CreateJobSchema(BaseModel):
    # Fields provided by the client
    title: str
    company_name: str
    company_url: str = ""
    location: str
    job_field: JobFieldEnum
    job_type: JobTypeEnum
    job_level: JobLevelEnum
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    description: str
    application_link: str
    qualifications: List[str]
    start_date: datetime
    end_date: datetime
    status: JobStatusEnum # Client specifies initial status


# Added a schema that makes every field optional for PATCH Endpoint
class UpdateJobSchema(MongoBaseModel):
    title: Optional[str] = None  
    company_name: Optional[str] = None  
    company_url: Optional[str] = None  
    location: Optional[str] = None  
    job_field: Optional[JobFieldEnum] = None  
    job_type: Optional[JobTypeEnum] = None  
    job_level: Optional[JobLevelEnum] = None  
    min_salary: Optional[float] = None  
    max_salary: Optional[float] = None  
    description: Optional[str] = None  
    application_link: Optional[str] = None  
    flagged: Optional[bool] = None  
    qualifications: Optional[List[str]] = None  
    start_date: Optional[datetime] = None  
    end_date: Optional[datetime] = None  
    status: Optional[JobStatusEnum] = None  
    date_posted: Optional[datetime] = None  
    author_name: Optional[str] = None  

class SavedJobSchema(MongoBaseModel):
    # Schema for saved job postings
    jobId: str  # Reference to the job posting that was saved

