# Monetary donation example:
# {
#   "_id": ObjectId("65f4e1b97d98f3a8a4e8b2d2"),
#   "created_at": "2024-03-15T10:00:00Z",
#   "updated_at": "2024-03-15T10:00:00Z",
#   "title": "Support the Alumni Scholarship Program",
#   "description": "Help fund scholarships for ICS students.",
#   "organized_by": "ICS Alumni Association",
#   "donationImageURL": "https://example.com/images/scholarship-drive.jpg",
#   "status": "Active",
#   "beneficiaries": [
#     ObjectId("65f501d47d98f3a8a4e8b601")
#   ],
#   "location": "University of the Philippines Los Baños",
#   "end_date": "2024-06-30",
#   "donorId_list": [
#     ObjectId("65f4e1a07d98f3a8a4e8b2c3"),
#     ObjectId("65f4e1c27d98f3a8a4e8b2d5")
#   ],
#   "allow_monetary": true,
#   "target_funds": 100000,
#   "raised_funds": 50000,
#   "allow_item_donation": false,
#   "item_requirements": null
# }


# Non-Monetary donation example:
# {
#   "_id": ObjectId("65f4f2b97d98f3a8a4e8b3d4"),
#   "created_at": "2024-03-20T09:30:00Z",
#   "updated_at": "2024-03-20T09:30:00Z",
#   "title": "Relief Goods for Flood Victims",
#   "description": "We are collecting non-perishable goods for affected families.",
#   "organized_by": "UPLB Student Council",
#   "donationImageURL": "https://example.com/images/relief-drive.jpg",
#   "status": "Active",
#   "beneficiaries": [],
#   "location": "Laguna, Philippines",
#   "end_date": "2024-04-15",
#   "donorId_list": [],
#   "allow_monetary": false,
#   "target_funds": null,
#   "raised_funds": 0,
#   "allow_item_donation": true,
#   "item_requirements": [
#     {
#       "item_name": "Canned Goods",
#       "target_quantity": 100,
#       "current_quantity": 45
#     },
#     {
#       "item_name": "Bottled Water",
#       "target_quantity": 200,
#       "current_quantity": 75
#     }
#   ]
# }


# Both Monetary and Non-Monetary donation example:
# {
#   "_id": ObjectId("65f4f5c97d98f3a8a4e8b4e9"),
#   "created_at": "2024-03-25T15:45:00Z",
#   "updated_at": "2024-03-25T15:45:00Z",
#   "title": "Typhoon Relief Drive",
#   "description": "Help by donating funds or essential supplies.",
#   "organized_by": "Operation Bayanihan",
#   "donationImageURL": "https://example.com/images/typhoon-relief.jpg",
#   "status": "Active",
#   "beneficiaries": [
#     ObjectId("65f501d47d98f3a8a4e8b601"),
#     ObjectId("65f501d47d98f3a8a4e8b602")
#   ],
#   "location": "Bicol Region",
#   "end_date": "2024-05-15",
#   "donorId_list": [
#     ObjectId("65f4f5d07d98f3a8a4e8b500")
#   ],
#   "allow_monetary": true,
#   "target_funds": 50000,
#   "raised_funds": 12500,
#   "allow_item_donation": true,
#   "item_requirements": [
#     {
#       "item_name": "Blankets",
#       "target_quantity": 100,
#       "current_quantity": 30
#     },
#     {
#       "item_name": "Rice (kg)",
#       "target_quantity": 300,
#       "current_quantity": 180
#     }
#   ]
# }

from datetime import datetime
from .base_model import MongoBaseModel, PyObjectId
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, EmailStr

class DonationStatusEnum(str, Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"
    active = "Active"
    completed = "Completed"
    cancelled = "Cancelled"
    ongoing = "Ongoing"
    archived = "Archived"
    flagged = "Flagged"

class ItemRequirement(BaseModel):
    item_name: str  # Name of the item needed
    target_quantity: int  # Target quantity of the item
    current_quantity: int = 0  # Amount received so far

class OrganizerEntry(BaseModel):
    # Represents a single organizer's contact info
    name: str  # Full name of the organizer
    email: EmailStr  # Organizer's email address

class BankingDetails(BaseModel):
    bdo: str = "BDO 555-666-777"
    bpi: str = "BPI 444-333-222"
    landbank: str = "Landbank 999-888-777"
    gcash: str = "09179997777"
    maya: str = "09173334444"

class DonationSchema(MongoBaseModel):
    title: str  # Title of the donation cause
    description: str  # Description of the donation
    organizers: List[OrganizerEntry]  # List of organizers with name and email
    prioritized_items: Optional[List[str]] = None  # List of prioritized items for donation (non-monetary)
    donationImageURL: str  # URL of the image associated with the donation cause
    status: DonationStatusEnum = DonationStatusEnum.active
    beneficiaries: List[str] = []  # List of beneficiaries (e.g., students, organizations)
    location: str  # Location of the donation cause
    end_date: Optional[str] = None  # End date for the donation cause
    donorId_list: List[str] = []  # List of donor IDs


    # Monetary donation
    allow_monetary: bool = False
    target_funds: Optional[int] = None
    raised_funds: int = 0

    # Item donation
    allow_non_monetary: bool = False
    item_requirements: Optional[List[ItemRequirement]] = None

    # Newly added fields
    bankingDetails: BankingDetails = BankingDetails()  # Banking details for fund donations
    address: Optional[str] = None  # Physical address related to the donation event
    contactNumber: Optional[str] = None  # Contact number for inquiries

    commentId: Optional[PyObjectId]  # Reference to comment thread

## Added for inital creation of Donation Object (for POST)
class CreateDonationSchema(BaseModel):
    title: str
    description: str
    organizers: List[OrganizerEntry]
    prioritized_items: Optional[List[str]] = None
    donationImageURL: str = ""
    status: DonationStatusEnum = DonationStatusEnum.active
    beneficiaries: Optional[List[str]] = None
    location: str
    end_date: Optional[str] = None
    allow_monetary: bool = False
    target_funds: Optional[int] = None
    allow_non_monetary: bool = False
    item_requirements: Optional[List[ItemRequirement]] = None
    bankingDetails: Optional[BankingDetails] = BankingDetails()
    address: Optional[str] = None
    contactNumber: Optional[str] = None


## Added for PATCH job details endpoint
class UpdateDonationSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    organized_by: Optional[str] = None
    donationImageURL: Optional[str] = None
    status: Optional[DonationStatusEnum] = None
    beneficiaries: Optional[List[str]] = None
    location: Optional[str] = None
    end_date: Optional[str] = None
    allow_monetary: Optional[bool] = None
    target_funds: Optional[int] = None
    raised_funds: Optional[int] = None
    allow_item_donation: Optional[bool] = None
    item_requirements: Optional[List[ItemRequirement]] = None
    bankingDetails: Optional[BankingDetails] = None
    address: Optional[str] = None
    contactNumber: Optional[str] = None
    commentId: Optional[PyObjectId] = None