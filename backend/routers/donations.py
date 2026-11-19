from fastapi import APIRouter, Body, HTTPException, Depends, Query, status
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr, Field, StrictStr, ValidationError
from typing import List, Optional
from models.base_model import PyObjectId
from config.database import donations_collection, donors_collection
from middleware.require_auth import verify_token
from datetime import datetime, timedelta
from models.donations_model import BankingDetails, CreateDonationSchema, DonationSchema, DonationStatusEnum, ItemRequirement, OrganizerEntry, UpdateDonationSchema
from models.donors_model import DonorSchema, DonationApprovalEnum

router = APIRouter(prefix="/donation", tags=["Donations Router"])

class CashDonationRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Cash amount to donate (must be greater than 0)")


class DonationDetailsResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str  
    description: str  
    organizers: List[OrganizerEntry]  
    prioritized_items: Optional[List[str]] = None 
    donationImageURL: str  
    status: DonationStatusEnum
    beneficiaries: List[str] 
    location: str  
    end_date: Optional[str] = None
    donorId_list: List[str] = []
    allow_monetary: bool
    target_funds: Optional[int] = 0
    raised_funds: int
    allow_non_monetary: bool
    item_requirements: Optional[List[ItemRequirement]] = []
    bankingDetails: BankingDetails
    address: Optional[str] = None  
    contactNumber: Optional[str] = None 
    commentId: Optional[str] = None

class RecentDonationsResponse(BaseModel):
    id: str = Field(alias="_id")



@router.get("/your_donations", response_model=List[DonorSchema])
async def get_all_alumni_donations(
    user: dict = Depends(verify_token)
):
    try:
        uid = user.get("_id")
        user_oid = ObjectId(uid)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format in token")

    try:
        query = {"userId": user_oid}
        donors_cursor = donors_collection.find(query).sort("created_at", -1)
        donations_list = list(donors_cursor)

        return donations_list

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while retrieving your donations.")


@router.get("/")
async def get_all_donations(
    skip: int = Query(0, description="The number of donations to skip for pagination."),
    limit: int = Query(10, description="The number of donations to return."),
    keywords: Optional[str] = Query(None, description="Keyword to search in title or description."),
    sortBy: Optional[str] = Query("Most Recent", description="Sort order."),
    status: Optional[str] = Query(None, description="Status filter."),
    user: dict = Depends(verify_token)
):
    query = {}

    # Handle keywords filter
    if keywords:
        query["$or"] = [
            {"title": {"$regex": keywords, "$options": "i"}},
            {"description": {"$regex": keywords, "$options": "i"}}
        ]

    # Handle status filter based on the enum values
    if status:
        if status == "Active":
            query["status"] = "Active"
        elif status == "Completed":
            query["status"] = "Completed"
        elif status == "Cancelled":
            query["status"] = "Cancelled"
        elif status == "Ongoing":
            query["status"] = "Ongoing"
        elif status == "Archived":
            query["status"] = "Archived"

    # Determine sort order
    sort_field = "created_at"
    sort_order = -1

    if sortBy == "Alphabetical":
        sort_field = "title"
        sort_order = 1
    elif sortBy == "Most Popular":
        sort_field = "raised_funds"
        sort_order = -1

    # Count total matching documents
    total_count = donations_collection.count_documents(query)

    # Apply pagination and sorting
    cursor = donations_collection.find(query).sort(sort_field, sort_order).skip(skip)
    if limit != 0:
        cursor = cursor.limit(limit)
    donations = list(cursor)

    if not donations:
        raise HTTPException(status_code=404, detail="No donations found")

    # Convert ObjectId and list entries to strings
    for donation in donations:
        donation["_id"] = str(donation["_id"])
        if "beneficiaries" in donation:
            donation["beneficiaries"] = [str(ben) for ben in donation["beneficiaries"]]
        if "donorId_list" in donation:
            donation["donorId_list"] = [str(donor) for donor in donation["donorId_list"]]

    return {
        "donations": donations,
        "hasMore": skip + (limit if limit != 0 else total_count) < total_count,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }

# For user donate details page
@router.get("/{donation_id}/recent-donations", response_model=List[RecentDonationsResponse])
async def get_recent_donations(
    donation_id: str,
    user: dict = Depends(verify_token)
):
    try:
        drive_id = ObjectId(donation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donation_id")

    recent_donations_cursor = donors_collection.find(
        {"driveId": drive_id, "status": {"$in": ["Approved"]}}, # Corrected $in
        {
            "userId": 1,
            "amount": 1,
            "items": 1,
            "donation_type": 1,
            "created_at": 1
        }
    ).sort("created_at", -1).limit(3)
    
    recent_donations_list = list(recent_donations_cursor)
    
    processed_donations = []
    for donation in recent_donations_list:
        doc_id = donation.get("_id")
        
        if doc_id: 
            processed_donations.append({"_id": str(doc_id)}) 

    return processed_donations


## Get single donation details (GET)
@router.get("/{donation_id}", response_model=DonationDetailsResponse)
async def get_donation_details(
    donation_id: str,
    user: dict = Depends(verify_token)
):
    
    try:
        # Convert string ID to MongoDB ObjectId
        obj_id = ObjectId(donation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donation ID format")
    
    # Find the donation in MongoDB
    donation = donations_collection.find_one({"_id": obj_id})
    
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # Convert ObjectId fields to strings
    donation["_id"] = str(donation["_id"])
    
    if "donorId_list" in donation:
        donation["donorId_list"] = [str(donor) for donor in donation["donorId_list"]]
    
    # MODIFICATION: Added commentID parser to str
    if "commentId" in donation and donation["commentId"] is not None:
        donation["commentId"] = str(donation["commentId"])
    
    return donation



## Edit donationd details endpoint (PATCH)
@router.patch("/{donation_id}")
async def update_donation(
    donation_id: str, 
    update_data: UpdateDonationSchema, 
    user: dict = Depends(verify_token)
):
    try:
        donation_object_id = ObjectId(donation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donation_id format")

    # Convert to dictionary and exclude unset fields
    update_fields = update_data.model_dump(exclude_none=True)
    
    # Convert beneficiaries from string to ObjectId if present
    # if "beneficiaries" in update_fields:
    #     try:
    #         update_fields["beneficiaries"] = [ObjectId(ben) for ben in update_fields["beneficiaries"]]
    #     except Exception:
    #         raise HTTPException(status_code=400, detail="Invalid beneficiary ID format")
    
    # Add updated_at timestamp
    update_fields["updated_at"] = datetime.utcnow()

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = donations_collection.update_one(
        {"_id": donation_object_id},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Donation not found")

    return {"message": "Donation updated successfully"}


# Endpoint Description: Donation via Bank Transfer or GCash/Maya (POST)
# Contributed by: Lawrence S. Combalicer
class BankDonationRequest(BaseModel):
    amount: int = Field(..., gt=0)
    proof_url: str

@router.post("/donation/{donation_id}/donate/bank")
async def donate_bank_transfer(
    donation_id: str,
    donation_data: BankDonationRequest = Body(...),
    user: dict = Depends(verify_token)
):
    # Check if donation exists
    donation = donations_collection.find_one({"_id": ObjectId(donation_id)})

    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")

    if not donation.get("allow_monetary", False):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This donation does not accept cash donations")

    if donation.get("status") != "Active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Donation is not active")
    
    updated_raised_funds = donation.get("raised_funds", 0) + donation_data.amount
    donor_id = ObjectId(user["_id"])
    
    update_fields = {
        "raised_funds": updated_raised_funds,
        "updated_at": datetime.utcnow()
    }

    if donor_id not in donation.get("donorId_list", []):
        update_fields["donorId_list"] = donation.get("donorId_list", []) + [donor_id]

    result = donations_collection.update_one(
        {"_id": ObjectId(donation_id)},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Donation update failed")
    
    # create donor transaction entry for every donation
    new_donor_document = {
        "userId": donor_id,
        "driveId": ObjectId(donation_id),
        "donation_type": "Monetary",
        "amount": donation_data.amount,
        "status": "Pending",  
        "donationProofURL": donation_data.proof_url,  
    }

    result = donors_collection.insert_one(new_donor_document)

    if not result.acknowledged or not result.inserted_id:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to insert donor entry into database.")

    try:
        created_doc = donors_collection.find_one({"_id": result.inserted_id})
        if not created_doc:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve newly created donor entry.")

        validated_entry = DonorSchema.model_validate(created_doc)
        return validated_entry
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing donor entry response.")



# Endpoint Description: Donation via Cash Donations (POST)
# Contributed by: Kelvin James A. Beliber

@router.post("/{donation_id}/donate/cash")
async def donate_cash_to_donation(
    donation_id: str,
    donation_data: CashDonationRequest,
    user: dict = Depends(verify_token)  # comment this out if you want to test without asking for authentication token
):
    # Check if donation exists
    donation = donations_collection.find_one({"_id": ObjectId(donation_id)})

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if not donation.get("allow_monetary", False):
        raise HTTPException(status_code=400, detail="This donation does not accept cash donations")

    if donation.get("status") != "Active":
        raise HTTPException(status_code=400, detail="Donation is not active")

    # update the raised funds and donorId_list
    updated_raised_funds = donation.get("raised_funds", 0) + donation_data.amount
    donor_id = ObjectId(user["_id"]) # comment this out if you want to test without asking for authentication token

    update_fields = {
        "raised_funds": updated_raised_funds,
        "updated_at": datetime.utcnow()
    }

    # add donor only if not already in list (comment this out if you want to test without asking for authentication token)
    if donor_id not in donation.get("donorId_list", []):
        update_fields["donorId_list"] = donation.get("donorId_list", []) + [donor_id]

    result = donations_collection.update_one(
        {"_id": ObjectId(donation_id)},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Donation update failed")
    
        # create donor transaction entry for every donation
    donors_collection.insert_one({
        "userId": donor_id,
        "driveId": ObjectId(donation_id),
        "donation_type": "Monetary",
        "amount": donation_data.amount,
        "status": "Pending",  
        "receiptImageURL": "",  
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    return {
        "message": "Cash donation successful",
        "donated_amount": donation_data.amount,
        "new_raised_funds": updated_raised_funds
    }

# Endpoint Description: Donation via Non-Monetary Donations (POST)
# Contributed by: Kelvin James A. Beliber

class InKindDonationRequest(BaseModel):
    item_name: str
    quantity: int = Field(..., gt=0, description="Quantity of the item to donate (must be greater than 0)")

@router.post("/{donation_id}/donate/inkind")
async def donate_item_to_donation(
    donation_id: str,
    donation_data: DonorSchema,
    user: dict = Depends(verify_token)  # comment this out if you want to test without token
):
    donation = donations_collection.find_one({"_id": ObjectId(donation_id)})

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if not donation.get("allow_non_monetary", False):
        raise HTTPException(status_code=400, detail="This donation does not accept item donations")

    if donation.get("status") != "Active":
        raise HTTPException(status_code=400, detail="Donation is not active")

    item_requirements = donation.get("item_requirements", [])

    if not donation_data.items:
        raise HTTPException(status_code=400, detail="No items provided for donation")

    for donated_item in donation_data.items:
        requested_item_name = donated_item.name.strip().lower()
        matched = False

        for item in item_requirements:
            if item["item_name"].strip().lower() == requested_item_name:
                item["current_quantity"] += donated_item.quantity
                matched = True
                break

        if not matched:
            raise HTTPException(
                status_code=400,
                detail=f"Item '{donated_item.name}' is not listed in the item requirements"
            )

    update_fields = {
        "item_requirements": item_requirements,
        "updated_at": datetime.utcnow()
    }

    donor_id = ObjectId(user["_id"])
    if donor_id not in donation.get("donorId_list", []):
        update_fields["donorId_list"] = donation.get("donorId_list", []) + [donor_id]

    result = donations_collection.update_one(
        {"_id": ObjectId(donation_id)},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update donation with item donation")

    donors_collection.insert_one({
        "userId": donor_id,
        "driveId": ObjectId(donation_id),
        "donation_type": donation_data.donation_type,
        "donationProofURL": donation_data.donationProofURL,
        "status": "Pending",
        "items": [item.dict() for item in donation_data.items],
        "non_monetary_method": donation_data.non_monetary_method,
        "total_weight_kg": donation_data.total_weight_kg,
        "pickup_address": donation_data.pickup_address,
        "contact_number": donation_data.contact_number,
        "preferred_date": donation_data.preferred_date,
        "preferred_time": donation_data.preferred_time,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    return {
        "message": "Item donation successful",
        "donated_items": [item.name for item in donation_data.items]
    }

  
@router.post("/")
async def create_donation(
    donation: CreateDonationSchema,
    user: dict = Depends(verify_token)
):
    try:
        donation_data = donation.model_dump(exclude_unset=True)

        # NEW MODIFICATION: beneficiaries will be Names instead of Ids
        # Add inital data and timestamps
        current_time = datetime.utcnow()
        donation_data["created_at"] = current_time
        donation_data["updated_at"] = current_time
        donation_data["raised_funds"] = 0
        donation_data["donorId_list"] = []

        # Insert into the database
        result = donations_collection.insert_one(donation_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create donation")

        # Prepare the response
        donation_data["_id"] = str(donation_data["_id"])
        donation_data["beneficiaries"] = [str(ben) for ben in donation_data.get("beneficiaries", [])]
        donation_data["donorId_list"] = [str(donor) for donor in donation_data.get("donorId_list", [])]

        return {
            "message": "Donation created successfully",
            "donation": donation_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating donation: {str(e)}")


@router.delete("/{donation_id}")
async def delete_donation(
    donation_id: str,
    user: dict = Depends(verify_token)
):
    try:
        # Validate the donation_id format and convert to ObjectId
        donation_object_id = ObjectId(donation_id)
    except Exception:
        # Handle invalid ObjectId format
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid donation ID format: {donation_id}")

    # Perform the delete operation in the database
    delete_result = donations_collection.delete_one(
        {"_id": donation_object_id}
    )

    # Check if a document was actually deleted
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Donation with ID {donation_id} not found")

    return {"message": f"Donation with ID {donation_id} deleted successfully"}