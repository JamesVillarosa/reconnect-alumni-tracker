from datetime import datetime
from fastapi import APIRouter, Body, Depends, HTTPException, Path, Response, status, Query
from typing import Dict, Annotated, List, Optional 
from bson.errors import InvalidId
from bson import ObjectId
from pydantic import EmailStr, Field
from pymongo.errors import PyMongoError
from config.database import users_collection
from models.base_model import BaseModel
from models.users_model import AccountStatusEnum, AuthProviderEnum, CareerEntry, UserSchema, RoleEnum, VerificationStatusEnum
from middleware.require_auth import verify_token

router = APIRouter(prefix="/admin/alumni", tags=["Admin Alumni Router"])

class AlumniResponeModel(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr  
    first_name: str  
    last_name: str 
    contact_number: str 
    role: RoleEnum 
    bookmarked_jobs: Optional[List[str]] = []
    bookmarked_events: Optional[List[str]] = []
    biography: Optional[str] = ""
    location: Optional[str] = ""
    profile_picture: Optional[str] = "" 
    header_picture: Optional[str] = ""
    current_career: Optional[CareerEntry] = None
    auth_provider: AuthProviderEnum
    account_status: AccountStatusEnum
    verification_status: VerificationStatusEnum
    is_flagged: bool
    rsvpd_events: Optional[List[str]] = []
    surveys_taken: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

class AlumniStatusRequest(BaseModel):
    new_verification_status: str = Field(...)
    

class AlumniFlagStatusRequest(BaseModel):
    is_flagged: bool = Field(..., description="The new flagged status for the alumni.")

@router.get("/")
async def get_all_alumni(
    skip: int = Query(0, description="The number of alumni to skip for pagination."),
    limit: int = Query(9, description="The number of alumni to return (default is 9)."),
    user: dict = Depends(verify_token)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this route.")

    query = {"role": "alumni"}
    projection = {"password": 0}  # exclude password field

    if limit == 0:
        alumni = list(users_collection.find(query, projection).skip(skip))
    else:
        alumni = list(users_collection.find(query, projection).skip(skip).limit(limit))

    total_count = users_collection.count_documents(query)

    if not alumni:
        raise HTTPException(status_code=404, detail="No alumni found")

    for alum in alumni:
        alum["_id"] = str(alum["_id"])
        # Clean up nested ObjectIds if you have any (optional)
        if "bookmarked_jobs" in alum:
            alum["bookmarked_jobs"] = [str(job_id) for job_id in alum["bookmarked_jobs"]]
        if "bookmarked_events" in alum:
            alum["bookmarked_events"] = [str(event_id) for event_id in alum["bookmarked_events"]]
        if "rsvpd_events" in alum:
            alum["rsvpd_events"] = [str(event_id) for event_id in alum["rsvpd_events"]]
        if "surveys_taken" in alum:
            alum["surveys_taken"] = [str(survey_id) for survey_id in alum["surveys_taken"]]

    return {
        "alumni": alumni,
        "hasMore": skip + (limit if limit != 0 else total_count) < total_count,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }


# Endpoint Description: Get Profile Details (GET)
# Contributed by: Lawrence Combalicer
@router.get("/country", response_model=Dict[str, int])
async def get_alumni_count_by_country(user: dict = Depends(verify_token)):
    """
    Aggregates alumni users based on the country part of their location.

    Assumes the country is the last element after splitting the 'location'
    string by comma. Handles missing or empty location fields.
    """
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges")
    pipeline = [
        {
            # Filter for alumni users with a non-empty location
            "$match": {
                "role": RoleEnum.alumni.value,
                "location": {"$exists": True, "$ne": None, "$ne": ""}
            }
        },
        {
            # Group by country extracted from location
            "$group": {
                "_id": {
                    "$toUpper": {
                       "$trim": {
                           "input": {
                               "$last": {"$split": ["$location", ","]}
                            }
                        }
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {
            # Create the output document
            "$project": {
                "_id": 0, 
                "country": "$_id", 
                "count": 1 
            }
        }
    ]

    try:
        results = list(users_collection.aggregate(pipeline))
    except PyMongoError as e:
        print(f"Database error during aggregation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve alumni country data due to a database error.")
    except Exception as e:
        print(f"Unexpected error during aggregation: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred while processing the request.")

    country_counts = {item['country']: item['count'] for item in results if item.get('country')} # Ensure country key exists

    return country_counts


# Endpoint Description: Get Alumni All Details
# Contributed by: Lawrence Combalicer
@router.get("/{alumni_id}", response_model=AlumniResponeModel)
async def get_alumni_details(
    alumni_id: str,
    user: dict = Depends(verify_token)
):
    # Admin authentication
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges.")

    # Alumni ID authentication
    try:
        alumni_oid = ObjectId(alumni_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Alumni ID.")
    
    # Get Alumni Document
    alumni = users_collection.find_one({"_id": alumni_oid}, {"password": 0})
    if not alumni:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alumni not found in the database.")
    
    # Parse to dictionary
    alumni_response = dict(alumni)
    alumni_response["_id"] = str(alumni_response["_id"])
    
    # Return the document
    try:
        return AlumniResponeModel(**alumni_response)
    except Exception as e: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing alumni data: {str(e)}")

@router.delete("/{alumni_id}")
async def delete_alumni_profile(alumni_id: str, admin_user: dict = Depends(verify_token)):
    
    # Check for admin privileges
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required to delete alumni profiles.")

    # Validate the alumni_id format
    try:
        alumni_oid = ObjectId(alumni_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Alumni ID format: {alumni_id}.")

    # Attempt to delete the alumni user
    try:
        delete_query = {"_id": alumni_oid, "role": RoleEnum.alumni.value}
        result = users_collection.delete_one(delete_query)

        if result.deleted_count == 0:
            user_exists = users_collection.find_one({"_id": alumni_oid})
            if not user_exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No user found with ID: {alumni_id}.")
            else: # User exists but is not an alumni or didn't match other criteria
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {alumni_id} is not an alumni or could not be deleted.")
        
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="A database error occurred while attempting to delete the alumni profile.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred while processing the deletion request.")
        

@router.get("/months")
async def get_alumni_signups_per_month(user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this route.")
    
    pipeline = [
        {
            "$match": {
                "role": "alumni"
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": {"$toDate": "$_id"}},
                    "month": {"$month": {"$toDate": "$_id"}}
                },
                "total_signups": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "_id.year": 1,
                "_id.month": 1
            }
        },
        {
            "$project": {
                "_id": 0,
                "year": "$_id.year",
                "month": "$_id.month",
                "total_signups": 1
            }
        }
    ]

    results = list(users_collection.aggregate(pipeline))
    return results

# Edited by: Arianna Domingo
@router.patch("/{alumni_id}/change_verification_status", status_code=status.HTTP_200_OK) 
async def approve_alumni(alumni_id: str = Path(...), status_request: AlumniStatusRequest = Body(...), admin_user: dict = Depends(verify_token)):
    
    # Check for admin privileges
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required."
        )

    # Validate the alumni_id format
    try:
        alumni_oid = ObjectId(alumni_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Alumni ID format: {alumni_id}.")

    # Validate the incoming status string against VerificationStatusEnum
    try:
        target_account_status = VerificationStatusEnum(status_request.new_verification_status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid account status: '{status_request.new_verification_status}'.")

    # Prepare the update document
    update_data = {
        "verification_status": status_request.new_verification_status, 
        "updated_at": datetime.utcnow()
    }

    # Perform the update operation
    try:
        result = users_collection.update_one(
            {"_id": alumni_oid, "role": RoleEnum.alumni.value}, 
            {"$set": update_data}
        )

        if result.matched_count == 0:
            user_exists = users_collection.count_documents({"_id": alumni_oid}) > 0
            if not user_exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No user found with ID: {alumni_id}.")
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {alumni_id} is not an alumni or could not be updated.")

        # Retrieve and return the updated alumni document
        updated_alumni_doc = users_collection.find_one({"_id": alumni_oid}, {"password": 0}) # Exclude password
        if not updated_alumni_doc:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Critical: Failed to retrieve alumni details after update.")
        
        # Convert ObjectId for Pydantic model
        updated_alumni_doc["_id"] = str(updated_alumni_doc["_id"])
        return {"message": "success"}

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="A database error occurred.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")



@router.patch("/{alumni_id}/flag_status", status_code=status.HTTP_200_OK)
async def update_alumni_flag_status( # Renamed function for clarity
    alumni_id: str = Path(..., description="The ID of the alumni whose flagged status is to be updated."),
    flag_request: AlumniFlagStatusRequest = Body(...), # Changed parameter name and type
    admin_user: dict = Depends(verify_token)
):
    # Check for admin privileges
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    # Validate the alumni_id format
    try:
        alumni_oid = ObjectId(alumni_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid Alumni ID format: {alumni_id}.")

    # Prepare the update document
    update_data = {
        "is_flagged": flag_request.is_flagged,
        "updated_at": datetime.utcnow()
    }

    # Perform the update operation
    try:
        result = users_collection.update_one(
            {"_id": alumni_oid, "role": RoleEnum.alumni.value}, 
            {"$set": update_data}
        )

        if result.matched_count == 0:
            user_exists = users_collection.count_documents({"_id": alumni_oid}) > 0
            if not user_exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No user found with ID: {alumni_id}.")
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {alumni_id} is not an alumni or could not be updated.")

        # 5. Retrieve and return the updated alumni document
        updated_alumni_doc = users_collection.find_one({"_id": alumni_oid}, {"password": 0}) # Exclude password
        if not updated_alumni_doc:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Critical: Failed to retrieve alumni details after update.")
        
        updated_alumni_doc["_id"] = str(updated_alumni_doc["_id"])
        return {"message": "success"}

    except PyMongoError as e:
        print(f"Database error during alumni flag status update: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="A database error occurred.")
    except Exception as e:
        print(f"Unexpected error during alumni flag status update: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

