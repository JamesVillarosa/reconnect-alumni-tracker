from .base_model import MongoBaseModel, PyObjectId
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class DonationApprovalEnum(str, Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"

class DonationTypeEnum(str, Enum):
    monetary = "Monetary"
    non_monetary = "Non-Monetary"

class MonetaryMethodEnum(str, Enum):
    bank_transfer = "Bank Transfer"
    gcash_maya = "GCash/Maya"

class NonMonetaryMethodEnum(str, Enum):
    pick_up = "Pick-up"
    drop_off = "Drop-off"

class DonatedItem(BaseModel):
    name: str           # Name of the donated item
    quantity: int       # Quantity of that item

class DonorSchema(MongoBaseModel):
    userId: Optional[PyObjectId] = None  # ID of the user who is a donor (optional for anonymous)
    driveId: PyObjectId # ID of the donation drive
    donation_type: DonationTypeEnum 
    donationProofURL: Optional[str] = None
    status: DonationApprovalEnum = DonationApprovalEnum.pending

    # Monetary fields
    amount: Optional[int] = None
    monetary_method: Optional[MonetaryMethodEnum] = None

    # Non-monetary fields
    non_monetary_method: Optional[NonMonetaryMethodEnum] = None
    items: Optional[List[DonatedItem]] = None  # List of items with name + quantity
    total_weight_kg: Optional[float] = None
    pickup_address: Optional[str] = None
    contact_number: Optional[str] = None
    preferred_date: Optional[str] = None  # Format: YYYY-MM-DD
    preferred_time: Optional[str] = None  # Format: HH:MM
