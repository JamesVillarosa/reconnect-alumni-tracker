from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Annotated, List, Optional 
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import PyMongoError
from middleware.require_auth import verify_token
from config.database import users_collection, jobs_collection, donations_collection, events_collection
from models.base_model import MongoBaseModel, PyObjectId
from models.jobs_model import JobFieldEnum, JobStatusEnum
from models.users_model import AccountStatusEnum, CareerEntry, UserSchema, RoleEnum, VerificationStatusEnum
from models.donations_model import DonationSchema, DonationStatusEnum, ItemRequirement
from models.events_model import EventSchema

router = APIRouter(prefix="/admin", tags=["Admin Minor/Miscellaneous Router"])

class AdminUserView(MongoBaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: RoleEnum
    bookmarked_jobs: Optional[List[str]] = [] 
    bookmarked_events: Optional[List[str]] = [] 
    biography: Optional[str] = None
    location: Optional[str] = None
    profile_picture: Optional[str] = None
    header_picture: Optional[str] = None
    current_career: Optional[CareerEntry] = None
    account_status: AccountStatusEnum
    verification_status: VerificationStatusEnum
    rsvpd_events: Optional[List[str]] = [] 
    surveys_taken: Optional[List[str]] = [] 

class AlumniSignupStatsResponse(BaseModel):
    first_three_pending: List[AdminUserView] = Field(..., description="Details of the first 3 pending alumni sign-ups (sorted by creation date)")
    total_pending: int = Field(..., description="Total no. of alumni sign-ups pending verification")
    total_alumni: int = Field(..., description="Total no. of registered alumni (verified and unverified)")
    
class JobStatsResponse(BaseModel):
    total_jobs: int = Field(..., description="Total number of job postings in the system.")
    total_open_jobs: int = Field(..., description="Total number of job postings currently marked as 'Still Hiring'.")
    jobs_by_field: Dict[str, int] = Field(..., description="A dictionary mapping each job field (enum value) to the total count of jobs in that field.")    
    
class RecentDonationInfo(BaseModel):
    id: PyObjectId = Field(..., alias="_id", description="Donation drive's unique ID")
    title: str
    raised_funds: int = Field(..., description="Funds raised specifically for this drive")
    items_collected: int = Field(..., description="Total items collected specifically for this drive")    

class DonationStatsResponse(BaseModel):
    total_raised_funds: int = Field(..., description="Total monetary funds raised across all donation drives.")
    total_items_collected: int = Field(..., description="Total count of individual items collected across all non-monetary drives.")
    total_active_drives: int = Field(..., description="Total number of donation drives currently marked as 'Active'.")
    recent_active_drives: List[RecentDonationInfo] = Field(..., description="Details of the 3 most recently created 'Active' donation drives.")

@router.get("/total-sign-ups", response_model=AlumniSignupStatsResponse, summary="Get Alumni Sign-up Statistics (Admin View)")
async def get_alumni_signup_stats(user: dict = Depends(verify_token)):
    """
    Provides statistics about alumni user sign-ups using an admin-safe view:
    - User details (excluding sensitive info) of the first 3 users with 'alumni' role and 'Unverified' status.
    - Total count of users with 'alumni' role and 'Unverified' status.
    - Total count of all users with 'alumni' role.
    """
    
    if user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required to access sign-up statistics.")

    alumni_filter = {"role": RoleEnum.alumni.value}
    pending_alumni_filter = {"role": RoleEnum.alumni.value, "verification_status": VerificationStatusEnum.unverified.value}

    try:
        total_alumni_count = users_collection.count_documents(alumni_filter)
        total_pending_count = users_collection.count_documents(pending_alumni_filter)

        pending_users_cursor = users_collection.find(pending_alumni_filter).sort("created_at", 1).limit(3)

        first_three_pending_list = list(pending_users_cursor)

    except PyMongoError as e:
        print(f"Database error fetching alumni stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred while retrieving alumni sign-up statistics.")
    except Exception as e:
        print(f"Unexpected error fetching alumni stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred while processing alumni sign-up statistics.")

    return AlumniSignupStatsResponse(
        first_three_pending=first_three_pending_list,
        total_pending=total_pending_count,
        total_alumni=total_alumni_count
    )
    
@router.get("/total-jobs", response_model=JobStatsResponse, summary="Get Job Posting Statistics by Field")
async def get_job_statistics(user: dict = Depends(verify_token)):
    """
    Provides statistics about job postings:
    - Total count of all job postings.
    - Count of job postings with status 'Still Hiring'.
    - A count of jobs grouped by the 'job_field'.
    """
    
    if user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required to access job statistics.")

    open_jobs_filter = {"status": JobStatusEnum.still_hiring.value}
    jobs_by_field_pipeline = [
        {
            # Group by the 'job_field'
            "$group": {
                "_id": "$job_field",  
                "count": {"$sum": 1}  
            }
        },
        {
            # Reshape the output documents
            "$project": {
                "_id": 0,            
                "field": "$_id",   
                "count": 1
            }
        }
    ]

    try:
        total_jobs_count = jobs_collection.count_documents({}) 

        total_open_jobs_count = jobs_collection.count_documents(open_jobs_filter)

        aggregation_results = list(jobs_collection.aggregate(jobs_by_field_pipeline))

        jobs_by_field_dict = {
            item['field']: item['count']
            for item in aggregation_results if item.get('field')
        }

        all_fields = {field_enum.value: 0 for field_enum in JobFieldEnum}
        all_fields.update(jobs_by_field_dict) # Update with actual counts
        jobs_by_field_final = all_fields


    except PyMongoError as e:
        print(f"Database error fetching job stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred while retrieving job statistics.")
    except Exception as e:
        print(f"Unexpected error fetching job stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred while processing job statistics.")

    return JobStatsResponse(
        total_jobs=total_jobs_count,
        total_open_jobs=total_open_jobs_count,
        jobs_by_field=jobs_by_field_final
    )
    

@router.get("/total-donations", response_model=DonationStatsResponse, summary="Get Cumulative Donation Statistics")
async def get_donation_statistics(user: dict = Depends(verify_token)):
    """
    Provides cumulative statistics about donation drives:
    - Total monetary funds raised (`raised_funds`).
    - Total count of items collected (`current_quantity` summed across all items/drives).
    - Total number of donation drives currently marked as 'Active'.
    - Details of the 3 most recently created 'Active' donation drives.
    """
    
    if user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required to access donation statistics.")

    active_drives_filter = {"status": DonationStatusEnum.active.value}

    total_funds_pipeline = [
        {
            "$match": {
                 "allow_monetary": True
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$raised_funds"}
            }
        }
    ]

    total_items_pipeline = [
        {
            "$match": {
                "allow_non_monetary": True,
                "item_requirements": {"$exists": True, "$ne": None, "$not": {"$size": 0}}
            }
        },
        {
            "$unwind": "$item_requirements"
        },
        {
            "$group": {
                "_id": None, 
                "total": {"$sum": "$item_requirements.current_quantity"}
            }
        }
    ]

    try:
        # Get total count of active donation drives
        total_active_count = donations_collection.count_documents(active_drives_filter)

        # Calculate total raised funds
        funds_result = list(donations_collection.aggregate(total_funds_pipeline))
        total_raised_funds_amount = funds_result[0]['total'] if funds_result else 0

        # Calculate total items collected
        items_result = list(donations_collection.aggregate(total_items_pipeline))
        total_items_collected_count = items_result[0]['total'] if items_result else 0

        # Get 3 most recent active drives
        recent_drives_cursor = donations_collection.find(
            active_drives_filter,
            {
                "_id": 1,
                "title": 1,
                "raised_funds": 1,
                "item_requirements.current_quantity": 1,
                "allow_non_monetary": 1
            }
        ).sort("created_at", -1).limit(3) 

        recent_active_drives_list = []
        for drive_doc in recent_drives_cursor:
            items_collected_for_drive = 0
            if drive_doc.get("allow_non_monetary") and drive_doc.get("item_requirements"):
                 items_collected_for_drive = sum(item.get('current_quantity', 0) for item in drive_doc['item_requirements'])

            recent_info = RecentDonationInfo(
                _id=drive_doc['_id'],
                title=drive_doc.get('title', 'N/A'),
                raised_funds=drive_doc.get('raised_funds', 0),
                items_collected=items_collected_for_drive
            )
            recent_active_drives_list.append(recent_info)


    except PyMongoError as e:
        print(f"Database error fetching donation stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred while retrieving donation statistics.")
    except Exception as e:
        print(f"Unexpected error fetching donation stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred while processing donation statistics.")

    return DonationStatsResponse(
        total_raised_funds=total_raised_funds_amount,
        total_items_collected=total_items_collected_count,
        total_active_drives=total_active_count,
        recent_active_drives=recent_active_drives_list
    )

# Get events within a specific range
@router.get("/calendar")
async def get_events_by_date(
    start_date: str,
    end_date: str,
    user: dict = Depends(verify_token)
):
    # Admin privileges required
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges")
    
    try:
        # validate (YYYY-MM-DDTHH:MM:SSZ)
        try:
            start = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%SZ")
            end = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%SZ")
            if start > end:
                raise HTTPException(
                    status_code=400,
                    detail="Start date must be before end date"
                )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f'Invalid date format, should be "YYYY-MM-DDTHH:MM:SSZ": {str(e)}')
        
        query = {
            "event_date": {
                "$gte": str(start),
                "$lte": str(end)
            }
        }
        
        # find
        events_cursor = events_collection.find(query)
        events = list(events_cursor)

        # serialize
        if events:
            for event in events:
                event["_id"] = str(event["_id"])
                event["created_by"] = str(event["created_by"])
                event["rsvp_list"] = [str(rsvp) for rsvp in event["rsvp_list"]]

        return events

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching events: {str(e)}"
        )