from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Dict, Annotated, List
from pymongo.errors import PyMongoError
from bson import ObjectId
from models.users_model import RoleEnum
from middleware.require_auth import verify_token
from config.database import users_collection, donations_collection, donors_collection, donation_reports_collection
from pymongo import MongoClient, ASCENDING, DESCENDING
from pydantic import BaseModel, EmailStr, Field, StrictStr
from bson.errors import InvalidId
from typing import List
from datetime import datetime, timedelta
from models.donations_model import DonationSchema, DonationStatusEnum, UpdateDonationSchema
from models.donors_model import DonationTypeEnum, DonorSchema, DonationApprovalEnum
from schema.schemas import donation_serializer, donations_serializer, reports_serializer
from datetime import datetime
from collections import defaultdict

router = APIRouter(prefix="/admin/donation", tags=["Admin Donation Router"])

class TotalDrivesResponse(BaseModel):
    total_drives: int

class AlumniInitiativesAndContributionsInfo(BaseModel):
    initiatives_created: List[DonationSchema] 
    total_initiatives_created: int                    
    total_open_initiatives: int                         
    skip: int
    limit: int
    has_more_initiatives: bool
    
class AlumniContributionsInfo(BaseModel):
    contributions: List[DonorSchema] # Paginated list of contributions
    total_contributions_count: int        # For pagination
    total_monetary_donated_amount: float  # Sum of all monetary donations by this alumni
    total_in_kind_donations_count: int    # Count of all in-kind donation instances by this alumni
    skip: int
    limit: int
    has_more: bool

class MonthlyContributionCounts(BaseModel):
    year: int = Field(..., description="The year of the contributions.")
    month: int = Field(..., description="The month of the contributions (1-12).")
    monetary_donations_count: int = Field(..., description="Number of monetary donations in this month.")
    non_monetary_donations_count: int = Field(..., description="Number of non-monetary (in-kind) donations in this month.")

class DriveMonthlyContributionsResponse(BaseModel):
    donation_id: str
    contributions_by_month: List[MonthlyContributionCounts]


# Endpoint Description: Get All Donation (paginated, 9 per page)
# Contributed by: Kelvin James Beliber
@router.get("/")
async def get_all_donations_admin(
    skip: int = Query(0, description="The number of donations to skip for pagination."),
    limit: int = Query(9, description="The number of donations to return."),
    user: dict = Depends(verify_token)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges")

    if limit == 0:
        donations = list(donations_collection.find({}).skip(skip))
    else:
        donations = list(donations_collection.find({}).skip(skip).limit(limit))

    total_count = donations_collection.count_documents({})

    if not donations:
        raise HTTPException(status_code=404, detail="No donations found")

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

# Endpoint Description: Get All Donations of an Alumni (paginated, 9 per page)
# Contributed by: Gabriel Virtucio
@router.get("/alumni/{alumni_id}", response_model=AlumniInitiativesAndContributionsInfo)
async def get_alumni_initiatives_and_contributions_info( # Renamed for clarity
    alumni_id: str,
    skip: int = Query(0, ge=0, description="The number of donation initiatives to skip for pagination."),
    limit: int = Query(9, ge=1, le=100, description="The number of donation initiatives to return (default is 9)."),
    user: dict = Depends(verify_token)
):
    # Admin authentication
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges.")
    
    try:
        alumni_oid = ObjectId(alumni_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Alumni ID")

    try:
        initiatives_query = {"created_by": alumni_oid} 
        
        total_initiatives_created = donations_collection.count_documents(initiatives_query)
        
        initiatives_list_raw = []
        if total_initiatives_created > 0:
            initiatives_cursor = donations_collection.find(initiatives_query).sort("created_at", DESCENDING).skip(skip).limit(limit)
            for doc in initiatives_cursor:
                doc["_id"] = str(doc["_id"])
                if doc.get("created_by"):
                    doc["created_by"] = str(doc["created_by"])
                initiatives_list_raw.append(doc)

        total_open_initiatives = donations_collection.count_documents({
            "created_by": alumni_oid,
            "status": {"$in": ["Active", "Ongoing"]} 
        })

        return AlumniInitiativesAndContributionsInfo(
            initiatives_created=initiatives_list_raw,
            total_initiatives_created=total_initiatives_created,
            total_open_initiatives=total_open_initiatives,
            skip=skip,
            limit=limit,
            has_more_initiatives=(skip + limit) < total_initiatives_created
        )

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error while retrieving data for alumni {alumni_id}: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred while retrieving data for alumni {alumni_id}.")

# Endpoint Description: Get No. of Donations Started by Month Started
# Contributed by: Kelvin James Beliber
@router.get("/months")
async def get_donations_count_by_month(user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges")

    donations = list(donations_collection.find({}, {"created_at": 1}))

    if not donations:
        raise HTTPException(status_code=404, detail="No donations found")

    month_counts = defaultdict(int)

    for donation in donations:
        created_at = donation.get("created_at")
        if created_at:
            # Ensure created_at is parsed to datetime if it's a string
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            month_key = created_at.strftime("%Y-%m")
            month_counts[month_key] += 1

    # Sort the dictionary by month (ascending)
    sorted_counts = dict(sorted(month_counts.items()))

    return {
        "donations_by_month": sorted_counts
    }


# Endpoint Description: Delete Donation
# Contributed by: Gabriel Virtuctio
@router.delete("/{donation_id}")
async def delete_item(donation_id: str, user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges")
    try:
        donation_object_id = ObjectId(donation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donation_id format")

    result = donations_collection.delete_one({"_id": donation_object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="donation not found")

    return {"message": "donation deleted successfully"}

  
# Endpoint Description: Archive Donation
# Contributed by: Tim Clemente
@router.put("/archive/{donation_id}")
async def archive_donation(donation_id: str, user=Depends(verify_token)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    donation = donations_collection.find_one({"_id": ObjectId(donation_id)})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    donations_collection.update_one(
        {"_id": ObjectId(donation_id)},
        {"$set": {"status": "Archived"}}

    )
    updated_donation = donations_collection.find_one({"_id": ObjectId(donation_id)})
    return {
        "message": "Donation archived successfully",
        "donation": donation_serializer(updated_donation)
    }

# Endpoint Description: Get All Reports of a Donation
# Contributed by: Tim Clemente
@router.get("/{donation_id}")
async def get_all_donation_reports(donation_id: str, user=Depends(verify_token)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    reports_cursor = donation_reports_collection.find({"donation_id": donation_id})
    reports_list = list(reports_cursor)
    if not reports_list:
        return {"message": "No reports found for this donation", "reports": []}

    return {"reports": reports_serializer(reports_list)}


@router.get("/summary/total-drives", response_model=TotalDrivesResponse)
async def get_total_donation_drives(user: dict = Depends(verify_token)):
    """
    ADMIN: Retrieves the total count of all donation drives.
    Requires admin privileges.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admin role required.")

    try:
        total_count = donations_collection.count_documents({})
        return TotalDrivesResponse(total_drives=total_count)

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred while counting donation drives.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")


# Endpoint Description: Get Donation Details
@router.get("/{donation_id}/details", response_model=DonationSchema)
async def get_donation_details(
    donation_id: str,
    user: dict = Depends(verify_token)
):
    # CHECK FOR ADMIN PERMISSIONS FIRST
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admin role required.")

    try:
        obj_id = ObjectId(donation_id)
    except InvalidId: # FIX: Use specific InvalidId exception
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid donation ID format") # FIX: Changed status to 400
    
    try: # 
        donation = donations_collection.find_one({"_id": obj_id})
    except PyMongoError as e: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred.")
    
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")
    
    # Convert ObjectId fields to strings
    donation["_id"] = str(donation["_id"])
    
    if "beneficiaries" in donation:
        donation["beneficiaries"] = [str(ben) for ben in donation["beneficiaries"]]
    
    if "donorId_list" in donation:
        donation["donorId_list"] = [str(donor) for donor in donation["donorId_list"]]
    
    return donation

# Endpoint Description: Get All Donation Contributions of an Alumni
@router.get("/donors/alumni/{alumni_id}", response_model=AlumniContributionsInfo)
async def get_alumni_contributions_details( # Renamed for clarity
    alumni_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user: dict = Depends(verify_token)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    try:
        alumni_obj_id = ObjectId(alumni_id)
    except InvalidId: # More specific exception
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid alumni ID format")

    try:
        contributions_query = {"userId": alumni_obj_id}
        total_contributions_count = donors_collection.count_documents(contributions_query)

        contributions_list_raw = []
        if total_contributions_count > 0:
            donor_entries_cursor = donors_collection.find(contributions_query).sort("transaction_date", DESCENDING).skip(skip).limit(limit)
            contributions_list_raw = list(donor_entries_cursor)
        
        aggregation_pipeline = [
            {"$match": {"userId": alumni_obj_id}},
            {"$group": {
                "_id": "$userId",
                "total_monetary": {
                    "$sum": {
                        "$cond": [{"$eq": ["$donation_type", "monetary"]}, "$amount", 0]
                    }
                },
                "count_in_kind": {
                    "$sum": {
                        "$cond": [{"$eq": ["$donation_type", "in-kind"]}, 1, 0]
                    }
                }
            }}
        ]
        
        aggregate_result = list(donors_collection.aggregate(aggregation_pipeline))
        
        total_monetary_donated_amount = 0.0
        total_in_kind_donations_count = 0
        
        if aggregate_result:
            result_doc = aggregate_result[0]
            total_monetary_donated_amount = result_doc.get("total_monetary", 0.0)
            total_in_kind_donations_count = result_doc.get("count_in_kind", 0)

        return AlumniContributionsInfo(
            contributions=contributions_list_raw, 
            total_contributions_count=total_contributions_count,
            total_monetary_donated_amount=total_monetary_donated_amount,
            total_in_kind_donations_count=total_in_kind_donations_count,
            skip=skip,
            limit=limit,
            has_more=(skip + limit) < total_contributions_count
        )

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        # import logging
        # logging.exception(f"Unexpected error for alumni {alumni_id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")
    
@router.patch("/approve/{donation_id}")
async def approve_donation_drive(donation_id: str, admin_user: dict = Depends(verify_token)):
    if admin_user.get("role") != RoleEnum.admin.value: # Using your RoleEnum if available
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        donation_oid = ObjectId(donation_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Donation ID format.")

    try:
        donation_drive = donations_collection.find_one({"_id": donation_oid})
    except PyMongoError as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error occurred while fetching donation drive: {str(e)}")

    if not donation_drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Donation drive with ID {donation_id} not found.")

    target_approved_status = DonationStatusEnum.approved.value
    already_effectively_approved_statuses = {
        DonationStatusEnum.approved.value,
        DonationStatusEnum.active.value,
        DonationStatusEnum.ongoing.value
    }

    current_status = donation_drive.get("status")
    if current_status in already_effectively_approved_statuses:
        try:
            return {"message":"Donation already verified"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data validation error for already approved/active donation drive: {str(e)}")

    update_data = {"status": target_approved_status, "updated_at": datetime.utcnow()}

    try:
        result = donations_collection.update_one({"_id": donation_oid}, {"$set": update_data})
        
        if result.matched_count == 0:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Donation drive with ID {donation_id} not found during update attempt.")
        
        updated_donation_drive = donations_collection.find_one({"_id": donation_oid}) # Re-fetch
        
        if not updated_donation_drive:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Critical error: Failed to retrieve donation drive details after update.")
        
        return {"message": "success"}

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error during donation drive approval: {str(e)}")
    except Exception as e: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred during donation drive approval processing: {str(e)}")
    
@router.get("/{donation_id}/contributions-by-month", response_model=DriveMonthlyContributionsResponse)
async def get_drive_contributions_by_month(
    donation_id: str,
    user: dict = Depends(verify_token) 
):
    if user.get("role") != RoleEnum.admin.value: 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        drive_obj_id = ObjectId(donation_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Donation Drive ID format.")

    try:
        drive_exists = donations_collection.find_one({"_id": drive_obj_id}, {"_id": 1})
        if not drive_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Donation drive with ID {donation_id} not found.")
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error checking donation drive existence: {str(e)}")

    pipeline = [
        { # Filter contributions for the specific donation drive
            "$match": {
                "driveId": drive_obj_id,
                "created_at": {"$exists": True, "$type": "date"} 
            }
        },
        { # Group by year, month, and donation_type to get counts for each type
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "type": "$donation_type" 
                },
                "count_per_type": {"$sum": 1}
            }
        },
        { # Regroup by just year and month to pivot donation_type counts into separate fields
            "$group": {
                "_id": { # Group by year and month
                    "year": "$_id.year",
                    "month": "$_id.month"
                },
                # Create an array of {type: <type>, count: <count_per_type>} for each year-month
                "type_counts": {
                    "$push": {
                        "type": "$_id.type",
                        "count": "$count_per_type"
                    }
                }
            }
        },
        { 
            "$project": {
                "_id": 0,
                "year": "$_id.year",
                "month": "$_id.month",
                "monetary_donations_count": {
                    "$ifNull": [ 
                        {
                            "$let": {
                                "vars": {"monetary_entry": {"$arrayElemAt": [{"$filter": {"input": "$type_counts", "as": "item", "cond": {"$eq": ["$$item.type", DonationTypeEnum.monetary.value]}}}, 0]}},
                                "in": "$$monetary_entry.count"
                            }
                        },
                        0 # Default value if no monetary donations
                    ]
                },
                "non_monetary_donations_count": {
                     "$ifNull": [ 
                        {
                            "$let": {
                                "vars": {"non_monetary_entry": {"$arrayElemAt": [{"$filter": {"input": "$type_counts", "as": "item", "cond": {"$eq": ["$$item.type", DonationTypeEnum.non_monetary.value]}}}, 0]}},
                                "in": "$$non_monetary_entry.count"
                            }
                        },
                        0 # Default value if no non-monetary donations
                    ]
                }
            }
        },
        { # Sort by year and then by month
            "$sort": {
                "year": 1,
                "month": 1
            }
        }
    ]

    try:
        monthly_contribution_stats = list(donors_collection.aggregate(pipeline))
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error during contribution aggregation: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred during contribution aggregation: {str(e)}")

    return DriveMonthlyContributionsResponse(
        donation_id=donation_id,
        contributions_by_month=monthly_contribution_stats
    )
