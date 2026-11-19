import os
import pymongo
from models.users_model import RoleEnum
from models.rsvp_model import RSVPSchema
from middleware.require_auth import verify_token
from fastapi import APIRouter, HTTPException, status, Query, Depends
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.results import UpdateResult
from pymongo.errors import PyMongoError
from models.events_model import EventSchema, ApprovalStatusEnum
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from config.database import events_collection, rsvp_collection, users_collection
from middleware.require_auth import verify_token
from datetime import datetime, timezone

router = APIRouter(prefix="/admin/events", tags=["Admin Event Router"])

class EventCountsResponse(BaseModel):
    approved_count: int
    total_count: int


# Endpoint Description: Get Events with Pagination 
# Contributed by: Sigmund Baybay
@router.get("/")
async def get_all_events(
    skip: int = Query(0, description="The number of events to skip for pagination."),
    limit: int = Query(9, description="The number of events to return (default is 9)."),
    user: dict = Depends(verify_token)
):
    """
    Retrieve events from the database with pagination.
    """
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only admins can access this endpoint.")
    
    try:
        events_cursor = events_collection.find({}).skip(skip).limit(limit)
        events = list(events_cursor)

        if not events:
            raise HTTPException(status_code=404, detail="No events found")

        # Convert ObjectId fields to strigs for JSON serialization
        for event in events:
            event["_id"] = str(event["_id"])
            event["created_by"] = str(event["created_by"])
            event["rsvp_list"] = [str(rsvp) for rsvp in event["rsvp_list"]]

        return {"events":events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving events: {str(e)}")
 

# Endpoint Description: GET Event Details (Admin)
# Contributed by: Kelvin James A. Beliber
@router.get("/{event_id}")
async def get_event_details(
    event_id: str,
    user: dict = Depends(verify_token)
):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only admins can access this endpoint."
        )
    
    try:
        # Validate event ID format
        if not ObjectId.is_valid(event_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Event ID format"
            )
        
        object_event_id = ObjectId(event_id)
        
        # Find the event with all fields
        event = events_collection.find_one({"_id": object_event_id})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Convert ObjectId fields to strings for JSON serialization
        event["_id"] = str(event["_id"])
        event["created_by"] = str(event["created_by"])
        
        # Convert RSVP list if it exists
        if "rsvp_list" in event:
            event["rsvp_list"] = [str(rsvp) for rsvp in event["rsvp_list"]]
        
        # Get RSVP count from the RSVP collection for accuracy
        rsvp_count = rsvp_collection.count_documents({"event_id": object_event_id})
        event["rsvp_count"] = rsvp_count
        
        # Validate the event data against our schema
        try:
            validated_event = EventSchema.model_validate(event)
            return validated_event
        except Exception as validation_error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Event data validation failed: {str(validation_error)}"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions we've already created
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving event details: {str(e)}"
        )


# Endpoint Description: GET All Events of an Alumni Details (Admin)
# Contributed by: Lawrence
@router.get("/alumni/{alumni_id}")
async def get_events_by_alumni(
    alumni_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user: dict = Depends(verify_token)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only admins can access this endpoint.")

    try:
        alumni_object_id = ObjectId(alumni_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Alumni ID format")

    try:
        alumni_user = users_collection.find_one(
            { "_id": alumni_object_id }
        )
        if not alumni_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alumni with ID {alumni_id} not found or is not an alumni role.")

        # Query for total events created by the specified alumni
        created_by_query = {"created_by": alumni_object_id}
        total_events_created_by_alumni = events_collection.count_documents(created_by_query)

        # Query for total approved events created by the specified alumni
        approved_events_query = { "created_by": alumni_object_id, "approval_status": ApprovalStatusEnum.approved.value }
        total_approved_events_by_alumni = events_collection.count_documents(approved_events_query)

        if total_events_created_by_alumni == 0:
            return {
                "events": [],
                "total_events_created": 0,
                "total_approved_events": 0, # Will 
                "skip": skip,
                "limit": limit,
                "has_more": False
            }

        # Fetch paginated list of events
        events_cursor = events_collection.find(created_by_query).sort("created_at", DESCENDING).skip(skip).limit(limit)
        
        events_list = list(events_cursor)
        
        formatted_events: List[Dict[str, Any]] = []
        for event_doc in events_list:
            event_doc["_id"] = str(event_doc["_id"])
            if event_doc.get("created_by"):
                event_doc["created_by"] = str(event_doc["created_by"])
            
            if event_doc.get("commentId"):
                event_doc["commentId"] = str(event_doc["commentId"])

            if "rsvp_list" in event_doc and isinstance(event_doc.get("rsvp_list"), list):
                event_doc["rsvp_list"] = [str(item_id) for item_id in event_doc["rsvp_list"]]
            
            formatted_events.append(event_doc)

        return {
            "events": formatted_events, 
            "total_events_created": total_events_created_by_alumni,
            "total_approved_events": total_approved_events_by_alumni,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_events_created_by_alumni
        }

    except HTTPException:
        raise
    except PyMongoError as e:
        # Log the error e for server-side debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        # Log the error e for server-side debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

# Endpoint Description: Get Event Counts (Approved and Total)
@router.get("/counts", response_model=EventCountsResponse)
async def get_event_counts(user: dict = Depends(verify_token)):
    """
    ADMIN: Retrieves the count of events with 'Approved' status
    and the total count of all events. Requires admin privileges.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admin role required.")

    try:
        approved_filter = {"approval_status": ApprovalStatusEnum.approved.value} 
        approved_count = events_collection.count_documents(approved_filter)

        # Count all events
        total_count = events_collection.count_documents({})

        return EventCountsResponse(approved_count=approved_count, total_count=total_count)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve event counts: {str(e)}")
    
@router.get("/months")
async def get_events_by_month(user: dict = Depends(verify_token)):
    """
    ADMIN: Get the count of events posted (created) per month.
    Requires admin privileges.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admin role required.")

    try:
        pipeline = [
            {
                "$match": {
                    "created_at": {"$exists": True}
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
                    "total_posts": "$count"
                }
            },
            {
                "$sort": {
                    "year": ASCENDING,
                    "month": ASCENDING
                }
            }
        ]

        # Execute the aggregation pipeline
        monthly_counts = list(events_collection.aggregate(pipeline))

        return monthly_counts

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.get("/rsvp/alumni/{alumni_id}")
async def get_rsvp_by_alumni(
    alumni_id: str,
    skip: int = Query(0, description="Number of RSVPs to skip for pagination"),
    limit: int = Query(10, description="Number of RSVPs to return per page"),
    user: dict = Depends(verify_token)
):
    """
    ADMIN: Get all RSVP records of a specific alumni by their alumni_id.
    Includes counts for total RSVPs, RSVPs with 'Going' status, and RSVPs with 'Done' status.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only admins can access this endpoint.")

    try:
        alumni_object_id = ObjectId(alumni_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alumni ID format")

    try:
        # Count total RSVP records for the alumni
        total_rsvps = rsvp_collection.count_documents({"user_id": alumni_object_id})

        # Count RSVPs with "Going" status
        total_to_attend = rsvp_collection.count_documents({"user_id": alumni_object_id, "status": "Going"})

        # Count RSVPs with "Done" status
        total_attended = rsvp_collection.count_documents({"user_id": alumni_object_id, "status": "Done"})

        if total_rsvps == 0:
            return {
                "alumni_id": alumni_id,
                "rsvp_records": [],
                "total_rsvps": 0,
                "total_to_attend": 0,
                "total_attended": 0,
                "has_more": False,
                "skip": skip,
                "limit": limit,
            }

        # Fetch paginated RSVP records for the given alumni_id
        rsvp_cursor = rsvp_collection.find(
            {"user_id": alumni_object_id},
            {"_id": 1, "event_id": 1, "status": 1, "date": 1} # Assuming 'date' is RSVP date
        ).sort("date", DESCENDING).skip(skip).limit(limit) # Added sort by date as an example

        rsvp_records = list(rsvp_cursor)

        # Convert ObjectId fields to strings in RSVP records
        event_ids_to_fetch = []
        for rsvp in rsvp_records:
            rsvp["_id"] = str(rsvp["_id"])
            if rsvp.get("event_id"): # Check if event_id exists
                rsvp["event_id"] = str(rsvp["event_id"])
                try:
                    event_ids_to_fetch.append(ObjectId(rsvp["event_id"]))
                except InvalidId:
                    # Handle cases where an event_id might be malformed, though less likely if DB is consistent
                    rsvp["event_title"] = "Invalid Event ID" 
                    continue # Skip fetching details for this malformed ID


        # Fetch event details for the RSVP records if there are any valid event_ids
        events_details_map = {}
        if event_ids_to_fetch:
            events_cursor = events_collection.find(
                {"_id": {"$in": event_ids_to_fetch}},
                {"_id": 1, "title": 1, "event_date": 1, "location": 1}
            )
            for event_doc in events_cursor:
                events_details_map[str(event_doc["_id"])] = {
                    "title": event_doc.get("title"),
                    "event_date": event_doc.get("event_date"),
                    "location": event_doc.get("location")
                }
        
        # Map event details to RSVP records
        for rsvp in rsvp_records:
            event_detail = events_details_map.get(rsvp.get("event_id"))
            if event_detail:
                rsvp["event_title"] = event_detail["title"]
                rsvp["event_date"] = event_detail["event_date"]
                rsvp["event_location"] = event_detail["location"]
            elif rsvp.get("event_id") and "event_title" not in rsvp : # If event_id was valid but not found, or not fetched due to previous error
                rsvp["event_title"] = "Event details not found"


        return {
            "alumni_id": alumni_id,
            "rsvp_records": rsvp_records,
            "total_rsvps": total_rsvps,
            "total_to_attend": total_to_attend,
            "total_attended": total_attended,
            "has_more": (skip + limit) < total_rsvps,
            "skip": skip,
            "limit": limit
        }

    except PyMongoError as e: # More specific MongoDB error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except HTTPException: # Re-raise HTTPExceptions directly
        raise
    except Exception as e:
        # Log the error e for server-side debugging
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred while retrieving RSVP records: {str(e)}")


@router.patch("/approve/{event_id}") 
async def approve_event(event_id: str, admin_user: dict = Depends(verify_token)):
    if admin_user.get("role") != RoleEnum.admin.value: 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        event_oid = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Event ID format.")

    try:
        event = events_collection.find_one({"_id": event_oid})
    except PyMongoError as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error occurred while fetching event: {str(e)}")

    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with ID {event_id} not found.")

    if event.get("approval_status") == ApprovalStatusEnum.approved.value:
        try:
            
            return {"message":"Event already verified"}
        except Exception as e: 
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data validation error for already approved event: {str(e)}")

    update_data = {"approval_status": ApprovalStatusEnum.approved.value, "updated_at": datetime.utcnow()}

    try:
        result = events_collection.update_one({"_id": event_oid}, {"$set": update_data})
        
        if result.matched_count == 0:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with ID {event_id} not found during update attempt.")


        updated_event = events_collection.find_one({"_id": event_oid}) 
        
        if not updated_event: 

            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Critical error: Failed to retrieve event details after update.")
        
        return {"message": "success"}

    except PyMongoError as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error during event approval: {str(e)}")
    except Exception as e: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred during event approval processing: {str(e)}")