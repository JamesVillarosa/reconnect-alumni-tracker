from datetime import datetime
from enum import Enum
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from bson import ObjectId
from bson.errors import InvalidId
from util.update_rsvp import update_event_rsvp_count
from models.base_model import PyObjectId
from models.users_model import RoleEnum
from models.rsvp_model import RSVPSchema, RSVPStatusEnum
from pymongo.errors import PyMongoError
from pymongo import ReturnDocument
from config.database import rsvp_collection, events_collection, users_collection
from middleware.require_auth import verify_token

router = APIRouter(prefix="/admin/rsvp", tags=["Admin RSVP Router"])

class CreateRSVPRequest(BaseModel):
    event_id: PyObjectId
    status: RSVPStatusEnum = RSVPStatusEnum.going # Default to "Going" on creation

class UpdateRSVPRequest(BaseModel):
    status: RSVPStatusEnum

class PaginatedRSVPsResponse(BaseModel):
    rsvps: List[RSVPSchema]
    total: int
    skip: int
    limit: int
    has_more: bool
    

class BatchRsvpCount(BaseModel):
    batch_year: int = Field(..., description="The batch year derived from the student number.")
    count: int = Field(..., description="The number of RSVPs from users in this batch year for the specific event.")

class BatchRsvpResponse(BaseModel): 
    event_id: str
    rsvps_by_batch: List[BatchRsvpCount]

class RsvpMonthlyCount(BaseModel):
    year: int = Field(..., description="The year of the RSVPs.")
    month: int = Field(..., description="The month of the RSVPs (1-12).")
    count: int = Field(..., description="The number of RSVPs in that month for the event.")

class EventRsvpMonthlyResponse(BaseModel):
    event_id: str # The ID of the event these stats are for
    rsvps_by_month: List[RsvpMonthlyCount]


@router.post("/", response_model=RSVPSchema, status_code=status.HTTP_201_CREATED)
async def create_rsvp(
    rsvp_data: CreateRSVPRequest,
    current_user: dict = Depends(verify_token)
):
    user_id_str = current_user.get("user_id")
    user_email = current_user.get("email")
    user_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip()

    if not all([user_id_str, user_email, user_name]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User details incomplete in token.")

    try:
        user_obj_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format in token.")

    event = events_collection.find_one({"_id": rsvp_data.event_id})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with ID {rsvp_data.event_id} not found.")

    existing_rsvp = rsvp_collection.find_one({"user_id": user_obj_id, "event_id": rsvp_data.event_id})
    if existing_rsvp:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already RSVP'd to this event. Use the update endpoint to change your status.")

    now = datetime.utcnow()
    new_rsvp_doc = {
        "event_id": rsvp_data.event_id,
        "user_id": user_obj_id,
        "name": user_name,
        "email": user_email,
        "status": rsvp_data.status.value,
        "date": now,
        "created_at": now,
        "updated_at": now
    }

    try:
        insert_result = rsvp_collection.insert_one(new_rsvp_doc)
        created_rsvp = rsvp_collection.find_one({"_id": insert_result.inserted_id})

        if not created_rsvp: 
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create or retrieve RSVP.")

        # Update event's rsvp_count if status is "Going"
        if rsvp_data.status == RSVPStatusEnum.going:
            update_event_rsvp_count(rsvp_data.event_id, 1)
        
        return RSVPSchema(**created_rsvp)

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error creating RSVP: {str(e)}")


@router.get("/event/{event_id}", response_model=PaginatedRSVPsResponse)
async def get_rsvps_for_event(
    event_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(verify_token) # Assuming admins or event organizers can view
):
    if current_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    try:
        event_obj_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Event ID format.")

    query = {"event_id": event_obj_id}
    try:
        total_rsvps = rsvp_collection.count_documents(query)
        rsvps_cursor = rsvp_collection.find(query).sort("date", -1).skip(skip).limit(limit)
        rsvps_list = [RSVPSchema(**rsvp) for rsvp in rsvps_cursor]

        return PaginatedRSVPsResponse(
            rsvps=rsvps_list,
            total=total_rsvps,
            skip=skip,
            limit=limit,
            has_more=(skip + limit) < total_rsvps
        )
    except PyMongoError as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error fetching RSVPs: {str(e)}")

# NOTE: get total RSVPs, get 3 most recent RSVPs, get recent 3 RSVPs
# Endpoint Description: Get RSVP Stats
# Contributed by: Aaron Zamora
@router.get("/stats")
async def get_rsvp_stats(
    user: dict = Depends(verify_token)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only admins can access this endpoint.")
    
     # Get latest 3 RSVPs that are not "Cancelled"
    recentRSVPS = list(rsvp_collection.find(
        {"status": {"$ne": "Cancelled"}}
    ).sort("date", -1).limit(3))

     # Get latest 3 RSVPs that are "Cancelled"
    recentCancelledRSVPS = list(rsvp_collection.find(
        {"status": "Cancelled"}
    ).sort("date", -1).limit(3))

    # Serialize ObjectId and datetime fields
    def serialize_rsvp(rsvp):
        rsvp["_id"] = str(rsvp["_id"])
        rsvp["event_id"] = str(rsvp["event_id"])
        rsvp["user_id"] = str(rsvp["user_id"])
        return rsvp

    recentRSVPS = [serialize_rsvp(rsvp) for rsvp in recentRSVPS]
    recentCancelledRSVPS = [serialize_rsvp(rsvp) for rsvp in recentCancelledRSVPS]

    # Count total RSVPs
    rsvp_count = rsvp_collection.count_documents({})

    # Count total events
    total_events = events_collection.count_documents({})

    return {
        "recentRSVPS": recentRSVPS,
        "recentCancelledRSVPS": recentCancelledRSVPS,
        "rsvpCount": rsvp_count,
        "totalEvents": total_events
    }

@router.put("/{rsvp_id}", response_model=RSVPSchema)
async def update_rsvp(rsvp_id: str, rsvp_update_data: UpdateRSVPRequest, user: dict = Depends(verify_token)
):
    try:
        rsvp_obj_id = ObjectId(rsvp_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid RSVP ID format.")

    user_id_str = user.get("user_id")
    user_role = user.get("role")
    if not user_id_str:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User ID not found in token.")
    try:
        current_user_obj_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format in token.")

    try:
        # Fetch existing RSVP to check ownership and current status
        existing_rsvp = rsvp_collection.find_one({"_id": rsvp_obj_id})
        if not existing_rsvp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RSVP not found.")

        # Authorization: Only owner or admin can update
        if existing_rsvp.get("user_id") != current_user_obj_id and user_role != RoleEnum.admin.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this RSVP.")

        if existing_rsvp.get("status") == rsvp_update_data.status.value:
            return RSVPSchema(**existing_rsvp)

        now = datetime.utcnow()
        update_doc = {
            "status": rsvp_update_data.status.value,
            "date": now, 
            "updated_at": now 
        }
        
        updated_rsvp = rsvp_collection.find_one_and_update(
            {"_id": rsvp_obj_id},
            {"$set": update_doc},
            return_document=ReturnDocument.AFTER 
        )

        if not updated_rsvp: 
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RSVP not found during update.")

        # Update event's rsvp_count
        event_id = existing_rsvp.get("event_id")
        old_status_was_going = existing_rsvp.get("status") == RSVPStatusEnum.going.value
        new_status_is_going = rsvp_update_data.status == RSVPStatusEnum.going

        if old_status_was_going and not new_status_is_going:
            update_event_rsvp_count(event_id, -1) 
        elif not old_status_was_going and new_status_is_going:
            update_event_rsvp_count(event_id, 1) 
            
        return RSVPSchema(**updated_rsvp)

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error updating RSVP: {str(e)}")


@router.delete("/{rsvp_id}")
async def delete_rsvp(rsvp_id: str, user: dict = Depends(verify_token)):
    try:
        rsvp_obj_id = ObjectId(rsvp_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid RSVP ID format.")

    user_id_str = user.get("user_id")
    user_role = user.get("role")
    if not user_id_str:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User ID not found in token.")
    try:
        current_user_obj_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format in token.")

    try:
        # Fetch RSVP to check ownership and get event_id for count update
        rsvp_to_delete = rsvp_collection.find_one({"_id": rsvp_obj_id})
        if not rsvp_to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RSVP not found.")

        # Authorization: Only owner or admin can delete
        if rsvp_to_delete.get("user_id") != current_user_obj_id and user_role != RoleEnum.admin.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this RSVP.")

        event_id = rsvp_to_delete.get("event_id")
        status_was_going = rsvp_to_delete.get("status") == RSVPStatusEnum.going.value

        delete_result = rsvp_collection.delete_one({"_id": rsvp_obj_id})

        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RSVP not found during delete attempt.")

        if status_was_going and event_id:
            update_event_rsvp_count(event_id, -1)

        return 

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error deleting RSVP: {str(e)}")


# Endpoint Description: Get RSVP of a User to an Event (Admin)
# Contributed by: Kelvin James A. Beliber
@router.get("/{rsvp_id}", response_model=RSVPSchema)
async def get_user_rsvp(
    rsvp_id: str,
    user: dict = Depends(verify_token)
):
    """
    ADMIN: Retrieve detailed information about a specific RSVP by its ID.
    Returns the RSVP details along with user and event information.
    Requires admin privileges.
    """
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only admins can access this endpoint."
        )
    
    try:
        # Validate RSVP ID format
        if not ObjectId.is_valid(rsvp_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid RSVP ID format"
            )
        
        object_rsvp_id = ObjectId(rsvp_id)
        
        # Find the RSVP record
        rsvp = rsvp_collection.find_one({"_id": object_rsvp_id})
        if not rsvp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RSVP record not found"
            )
        
        # Get user details
        user_details = users_collection.find_one(
            {"_id": rsvp["user_id"]},
            {"email": 1, "first_name": 1, "last_name": 1}
        )
        
        # Get event details
        event_details = events_collection.find_one(
            {"_id": rsvp["event_id"]},
            {"title": 1, "event_date": 1, "location": 1}
        )
        
        # Convert ObjectId fields to strings for JSON serialization
        rsvp["_id"] = str(rsvp["_id"])
        rsvp["event_id"] = str(rsvp["event_id"])
        rsvp["user_id"] = str(rsvp["user_id"])
        
        # Add user and event details to the response
        rsvp["user_details"] = {
            "email": user_details["email"],
            "first_name": user_details["first_name"],
            "last_name": user_details["last_name"]
        } if user_details else None
        
        rsvp["event_details"] = {
            "title": event_details["title"],
            "event_date": event_details["event_date"],
            "location": event_details["location"]
        } if event_details else None
        
        # Validate the RSVP data against our schema
        try:
            validated_rsvp = RSVPSchema.model_validate(rsvp)
            return validated_rsvp
        except Exception as validation_error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"RSVP data validation failed: {str(validation_error)}"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions we've already created
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving RSVP details: {str(e)}"
        )

# Endpoint Description: Get RSVP List of an Event with Pagination
# Contributed by: Sigmund Baybay   
@router.get("/{event_id}/rsvp-list")
async def get_rsvp_list(
    event_id: str,
    skip: int = Query(0, description="The number of RSVPs to skip for pagination."),
    limit: int = Query(9, description="The number of RSVPs to return (default is 9)."),
    user: dict = Depends(verify_token)):
    """
    Retrieve the RSVP list for a specific event with pagination.
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only admins can access this endpoint.")
    
    try:
        if not ObjectId.is_valid(event_id):
            raise HTTPException(status_code=400, detail="Invalid event ID format")

        object_event_id = ObjectId(event_id)

        event = events_collection.find_one({"_id": ObjectId(event_id)}, {"_id": 1})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        rsvp_filter: Dict[str, Any] = {"event_id": object_event_id}
        total_rsvps = rsvp_collection.count_documents(rsvp_filter)
        
        rsvps_cursor = rsvp_collection.find(rsvp_filter).sort("date", -1).skip(skip).limit(limit) # Sort by RSVP date desc
        rsvps_list = list(rsvps_cursor)
        
        validated_rsvps = [RSVPSchema.model_validate(rsvp) for rsvp in rsvps_list]
        has_more = total_rsvps > (skip + limit)
        
        return {
            "rsvp_list": validated_rsvps,
            "hasMore": has_more,
            "total": total_rsvps,
            "skip": skip,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving RSVP list: {str(e)}")
    
# Endpoint Description: Get _______
# Contributed by: ________
@router.get("/{rsvp_id}")
async def get_rsvp_details():
    pass


@router.get("/event/{event_id}/rsvps-by-batch", response_model=BatchRsvpResponse)
async def get_rsvp_per_batch_for_event(
    event_id: str,
    user: dict = Depends(verify_token)
):
    if user.get("role") != RoleEnum.admin.value: # Make sure RoleEnum.admin.value is correct
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        event_obj_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Event ID format.")

    try:
        event_exists = events_collection.find_one({"_id": event_obj_id}, {"_id": 1})
        if not event_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with ID {event_id} not found.")
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error checking event existence: {str(e)}")

    pipeline = [
        {
            "$match": {
                "event_id": event_obj_id
            }
        },
        {
            "$lookup": {
                "from": users_collection.name,
                "localField": "userId",
                "foreignField": "_id",
                "as": "user_details"
            }
        },
        {
            "$unwind": "$user_details"
        },
        {
            "$match": {
                "user_details.role": RoleEnum.alumni.value, 
                "user_details.student_number": {
                    "$exists": True,
                    "$type": "string", 
                    "$regex": r"^\d{4,}" 
                }
            }
        },
        {
            "$addFields": {
                "batch_year_str": { 
                    "$substrCP": ["$user_details.student_number", 0, 4] 
                }
            }
        },
        {
             "$addFields": { 
                "batch_year": {
                    "$toInt": "$batch_year_str" 
                }
            }
        },
        {
            "$group": {
                "_id": "$batch_year",
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "batch_year": "$_id",
                "count": 1
            }
        },
        {
            "$sort": {
                "batch_year": 1
            }
        }
    ]

    try:
        results = list(rsvp_collection.aggregate(pipeline))
        valid_results = [res for res in results if res.get("batch_year") is not None]
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error during aggregation: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")

    return BatchRsvpResponse(event_id=event_id, rsvps_by_batch=valid_results)



@router.get("/event/{event_id}/rsvps-by-month", response_model=EventRsvpMonthlyResponse)
async def get_rsvps_per_month_for_event(
    event_id: str,
    user: dict = Depends(verify_token) 
):
    if user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        event_obj_id = ObjectId(event_id)
    except InvalidId: 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Event ID format.")


    try:
        event_exists = events_collection.find_one({"_id": event_obj_id}, {"_id": 1})
        if not event_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with ID {event_id} not found.")
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error checking event existence: {str(e)}")

    pipeline = [
        { 
            "$match": {
                "event_id": event_obj_id,
                "created_at": {"$exists": True, "$type": "date"} 
            }
        },
        { 
            "$group": {
                "_id": { 
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "count": {"$sum": 1} 
            }
        },
        { 
            "$project": {
                "_id": 0, 
                "year": "$_id.year",
                "month": "$_id.month",
                "count": 1
            }
        },
        { 
            "$sort": {
                "year": 1,
                "month": 1
            }
        }
    ]

    try:
        monthly_counts = list(rsvp_collection.aggregate(pipeline))
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error during RSVP aggregation: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred during RSVP aggregation: {str(e)}")

    return EventRsvpMonthlyResponse(
        event_id=event_id,
        rsvps_by_month=monthly_counts
    )
    
