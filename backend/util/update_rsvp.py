from bson import ObjectId
from pymongo.errors import PyMongoError
from config.database import events_collection

# Helper to increment or decrement the rsvp_count on an event.
# Increment should be +1 or -1.
def update_event_rsvp_count(event_id: ObjectId, increment: int):
    try:
        events_collection.update_one(
            {"_id": event_id},
            {"$inc": {"rsvp_count": increment}}
        )
    except PyMongoError as e:
        print(f"Error updating rsvp_count for event {event_id}: {e}")