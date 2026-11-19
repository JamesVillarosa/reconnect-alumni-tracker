from models.rsvp_model import RSVPSchema, RSVPStatusEnum
from middleware.require_auth import verify_token
from fastapi import APIRouter, HTTPException, status, Query, Depends
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient
from pymongo.results import UpdateResult
from models.events_model import EventSchema, ApprovalStatusEnum, CreateEventSchema
from pydantic import BaseModel
from typing import List, Optional
from config.database import events_collection, rsvp_collection
from middleware.require_auth import verify_token
from datetime import datetime, timezone

router = APIRouter(prefix="/events", tags=["Event Router"])

# Added schema for updating events
class UpdateEventSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    location: Optional[str] = None
    approval_status: Optional[ApprovalStatusEnum] = None
    eventImageURL: Optional[str] = None

@router.post("/")
async def create_event(event: CreateEventSchema, user: dict = Depends(verify_token)):
    """
    Endpoint to create a new event.
    """
    try:
        # Get userId
        creator_oid = ObjectId(user.get("_id"))
        
        # Convert Pydantic model to dictionary
        event_data = event.model_dump(exclude_unset=True)
        
        # Ensure created_by is converted to ObjectId
        now = datetime.utcnow()
        event_data["created_by"] = creator_oid
        event_data["created_at"] = now
        event_data["updated_at"] = now
        event_data["approval_status"] = ApprovalStatusEnum.pending
        event_data["rsvp_count"] = 0 
        
        # # Generate a unique ObjectId for the event itself
        # event_data["_id"] = ObjectId()
        
        # Insert into database
        result = events_collection.insert_one(event_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create event")
        
        # MODIFIED: Directly checks the DB to see if document is inside
        # Convert ObjectId fields to string for JSON response
        event_data["_id"] = str(event_data["_id"])
        event_data["created_by"] = str(event_data["created_by"])
        
        return {"message": "Event created successfully", "event": event_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

@router.get("/your_rsvps", response_model=List[EventSchema])
async def get_rsvped_events(
    user: dict = Depends(verify_token)
):
    
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")

    try:
        user_oid = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format")

    try:
        rsvps_cursor = rsvp_collection.find({
            "user_id": user_oid,
            "status": RSVPStatusEnum.going
        })

        event_ids = [rsvp["event_id"] for rsvp in rsvps_cursor]

        if not event_ids:
            return [] 

        events_cursor = events_collection.find({
            "_id": {"$in": event_ids}
        })

        rsvped_events = [EventSchema.model_validate(event) for event in events_cursor]

        return rsvped_events

    except Exception as e:
        print(f"Error fetching RSVP'd events for user {user_id_str}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred while retrieving your RSVP'd events: {str(e)}")


@router.get("/")
async def get_all_events(
    skip: int = Query(0, description="The number of events to skip for pagination."),
    limit: int = Query(10, description="The number of events to return (default is 10)."),
    user: dict = Depends(verify_token)
):
    """
    Retrieve events from the database with pagination.
    """
    try:
        events_cursor = events_collection.find({}).skip(skip).limit(limit)
        events = list(events_cursor)

        if not events:
            raise HTTPException(status_code=404, detail="No events found")

        # Convert ObjectId fields to strings for JSON serialization
        for event in events:
            event["_id"] = str(event["_id"])
            event["created_by"] = str(event["created_by"])
            # event["rsvp_list"] = [str(rsvp) for rsvp in event["rsvp_list"]] # MODIFIED: removed rsvp_list parser

        return events

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving events: {str(e)}")

# Endpoint Description: Get Event Details
# Contributed by: Lawrence Combalicer
@router.get("/{event_id}")
async def get_event_details(event_id: str, user: dict = Depends(verify_token)):
    try:
        object_event_id = ObjectId(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Event ID!")

    event = events_collection.find_one({"_id": object_event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Convert ObjectId fields to strings for JSON serialization
    event["_id"] = str(event["_id"])
    event["created_by"] = str(event["created_by"])
    event["rsvp_list"] = [str(rsvp) for rsvp in event.get("rsvp_list", [])]

    return event

# Endpoint Description: Alumni RSVP (POST)
# Contributed by: Lawrence Combalicer, Kelvin James Beliber
@router.post("/{event_id}")
async def alumni_rsvp(event_id: str, user: dict = Depends(verify_token)):
    try:
        object_event_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Event ID!")

    user_id = user.get("_id")
    first_name = user.get("first_name")
    last_name = user.get("last_name")
    user_email = user.get("email")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing user ID in token")

    user_full_name = f"{first_name} {last_name}".strip()

    try:
        object_user_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid User ID in token")

    event = events_collection.find_one({"_id": object_event_id}, {"_id": 1})

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    rsvp_filter = {"user_id": object_user_id, "event_id": object_event_id}
    now = datetime.now(timezone.utc)
    rsvp_change = 0
    
    existing_rsvp = rsvp_collection.find_one(rsvp_filter)
    
    if existing_rsvp:
        current_status = RSVPStatusEnum(existing_rsvp.get("status"))
        
        if current_status == RSVPStatusEnum.going:
            new_status = RSVPStatusEnum.cancelled
            update_fields = {"status": new_status, "date": now, "updated_at": now}
            rsvp_change = -1
        else:
            # User exists but is 'Cancelled' or maybe 'Done', they want to RSVP again
            new_status = RSVPStatusEnum.going
            rsvp_change = 1
            
        update_fields = {"status": new_status, "date": now, "updated_at": now}
        update_res = rsvp_collection.update_one(rsvp_filter, {"$set": update_fields})
        
        if update_res.matched_count == 0:
             raise HTTPException(status_code=500, detail="Failed to find RSVP record for update")
        
    else:
        # No existing RSVP, create a new one as 'Going'
        new_status = RSVPStatusEnum.going
        new_rsvp_doc = {
            "event_id": object_event_id,
            "user_id": object_user_id,
            "name": user_full_name,
            "email": user_email,
            "status": new_status,
            "date": now,
            "created_at": now, # Set explicitly since we are building the dict
            "updated_at": now, # Set explicitly
        }
        
        insert_result = rsvp_collection.insert_one(new_rsvp_doc)
        if not insert_result.inserted_id:
             raise HTTPException(status_code=500, detail="Failed to create RSVP record")
        rsvp_change = 1 # Increment count for new 'Going' RSVP
        
    if rsvp_change != 0:
        update_event_result = events_collection.update_one(
            {"_id": object_event_id},
            {"$inc": {"rsvp_count": rsvp_change}}
        )
        
    final_rsvp = rsvp_collection.find_one(rsvp_filter)
    if not final_rsvp:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve final RSVP status")
        
    return RSVPSchema.model_validate(final_rsvp)

# Endpoint Description: Check if the current user has RSVP'ed 
# Contributed by: Kelvin James A. Beliber
@router.get("/{event_id}/rsvp-status")
async def check_rsvp_status(event_id: str, user: dict = Depends(verify_token)):
    try:
        object_event_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Event ID!")

    user_id = user.get("_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing user ID in token")

    try:
        object_user_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid User ID in token")

    event = events_collection.find_one({"_id": object_event_id}, {"_id": 1})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    rsvp_filter = {"user_id": object_user_id, "event_id": object_event_id}
    existing_rsvp = rsvp_collection.find_one(rsvp_filter, {"status": 1})

    is_rsvped_going = False
    if existing_rsvp and RSVPStatusEnum(existing_rsvp.get("status")) == RSVPStatusEnum.going:
        is_rsvped_going = True

    return {"isRSVPed": is_rsvped_going}


# Endpoint Description: Update Event Details (PATCH)
# Contributed by: Kelvin James A. Beliber
@router.patch("/{event_id}")
async def update_event(event_id: str, update_data: UpdateEventSchema, user: dict = Depends(verify_token)):
    try:
        event_object_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event_id format")

    update_fields = update_data.model_dump(exclude_none=True)
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields['updated_at'] = datetime.now(timezone.utc)

    result = events_collection.update_one({"_id": event_object_id}, {"$set": update_fields})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {"message": "Event updated successfully"}

# Endpoint Description: Delete Event (DELETE)
# Contributed by: Kelvin James A. Beliber
@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: str, user: dict = Depends(verify_token)):
    try:
        event_object_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event_id format")

    result = events_collection.delete_one({"_id": event_object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {"message": "Event deleted successfully"}
