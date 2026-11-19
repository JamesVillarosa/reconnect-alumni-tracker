# Projected JSON format:
# {
#   "_id": ObjectId("65f4e1b07d98f3a8a4e8b2c9"),
#   "created_at": "2024-03-15T10:00:00Z",
#   "updated_at": "2024-03-15T10:00:00Z",
#   "email": "user@example.com",
#   "password": "hashed_password_here",
#   "first_name": "John",
#   "last_name": "Doe",
#   "role": "alumni",
#   "graduation_year": 2020,
#   "student_number": 2020123456,
#   "bookmarks": [
#     "65f4e1e97d98f3a8a4e8b2d4",
#     "65f4e1e97d98f3a8a4e8b2d5"
#   ],
#   "biography": "Software engineer passionate about AI and education.",
#   "location": "Los Baños, Laguna",
#   "profile_picture": "https://yourcdn.com/uploads/users/john-profile.jpg",
#   "header_picture": "https://yourcdn.com/uploads/users/john-header.jpg",
#   "education_history": [
#     {
#       "school_name": "University of the Philippines Los Baños (UPLB)",
#       "degree": "Bachelor of Science in Computer Science",
#       "logo_url": "https://yourcdn.com/logos/uplb.png",
#       "graduation_date": "2025-06"
#     },
#     {
#       "school_name": "Carnegie Mellon University",
#       "degree": "Master of Human-Computer Interaction",
#       "logo_url": "https://yourcdn.com/logos/cmu.png",
#       "graduation_date": "2027-06"
#     }
#   ],
#   "career_history": [
#     {
#       "company": "TechCorp",
#       "position": "Software Engineer",
#       "logo_url": "https://yourcdn.com/logos/techcorp.png",
#       "start_date": "2022-06",
#       "end_date": null,
#       "is_current": true
#     },
#     {
#       "company": "Figma",
#       "position": "Design Intern",
#       "logo_url": "https://yourcdn.com/logos/figma.png",
#       "start_date": "2024-12",
#       "end_date": "2025-05",
#       "is_current": false
#     }
#   ],
#   "current_career": {
#     "company": "TechCorp",
#     "classification": "Private",
#     "industry": "Software Development",
#     "tenured_status": true,
#     "salary_range": "70,000 - 90,000",
#     "is_current": true
#   },
#   "auth_provider": "google",
#   "account_status": "Active",
#   "verification_status": "Verified"
# }

from .base_model import MongoBaseModel
from pydantic import EmailStr, BaseModel, Field
from typing import List, Optional
from enum import Enum

class RoleEnum(str, Enum):
    # Defines possible user roles in the system
    admin = "admin"
    alumni = "alumni"

class AccountStatusEnum(str, Enum):
    # Defines possible account statuses
    active = "Active"
    inactive = "Inactive"
    new = "New"

class VerificationStatusEnum(str, Enum):
    # Defines possible account verification status
    verified = "Verified"
    unverified = "Unverified"

class AuthProviderEnum(str, Enum):
    # Defines authentication provider options
    local = "local"
    google = "google"
    facebook = "facebook"

class CareerEntry(BaseModel):
    # Represents a single career entry in user's career history
    company: str  # Company name
    classification: str # Classification of the company (created by backend)
    industry: str # Current industry a part of (created by backend)
    tenured_status: bool = False # Does user have a tenured status
    salary_range: Optional[str] # Current salary range
    # position: str  # Job title/position
    # start_date: Optional[str]  # Employment start date
    # end_date: Optional[str]  # Employment end date
    is_current: Optional[bool]  # Indicates if this is current employment

# class ProfileCareerEntry(BaseModel):
#     # Represents a single career entry in user's career history
#     company: str  # Company name
#     position: str  # Job title/position
#     logo_url: Optional[str] = None  # Company logo image
#     start_date: Optional[str] = None  # e.g. # Format: "YYYY-MM"
#     end_date: Optional[str] = None  # e.g. # Format: "YYYY-MM" or none if current
#     is_current: bool = False  # Whether this job is ongoing

# class ProfileEducationEntry(BaseModel):
#     # Represents a single educational attainment
#     school_name: str  # School or university name
#     degree: str  # Degree or course title
#     logo_url: Optional[str] = None  # School logo image
#     graduation_date: Optional[str] = None  # Format: "YYYY-MM"

class UserSchema(MongoBaseModel):
    # Main user model schema containing all user-related information
    email: EmailStr  # User's email address (unique identifier)
    password: Optional[str]  # Hashed password (optional for OAuth users)
    first_name: str  # User's first name
    last_name: str  # User's last name
    role: RoleEnum = RoleEnum.alumni  # User's role in the system
    # graduation_year: Optional[int]  # Year of graduation
    student_number: str # Student number of alumni (can just get first 4 digits for year)
    bookmarked_jobs: Optional[List[str]] = []  # List of bookmarked posts
    bookmarked_events: Optional[List[str]] = []  # List of bookmarked events
    biography: Optional[str] = None  # User's biography or description
    location: Optional[str] = None  # Assumed string format, not sure lang if ibang data type if api gagamitin
    profile_picture: Optional[str] = None  # URL to user's profile picture
    header_picture: Optional[str] = None  # URL to user's header picture
    current_career: Optional[CareerEntry] = None  # Current career of the user (used for signup)
    # skills: Optional[List[str]] = []  # List of user's skills
    auth_provider: AuthProviderEnum = AuthProviderEnum.local  # Authentication method
    account_status: AccountStatusEnum = AccountStatusEnum.active  # Account status
    verification_status: VerificationStatusEnum = VerificationStatusEnum.unverified # Approval status
    rsvpd_events: Optional[List[str]] = []  # List of events the user has RSVP'd to
    surveys_taken: Optional[List[str]] = []  # List of surveys the user has completed
    is_flagged: bool = False
    contact_number: str


class ShortUser(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    first_name: str
    last_name: str

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class BulkUserRequest(BaseModel):
    user_ids: List[str]
