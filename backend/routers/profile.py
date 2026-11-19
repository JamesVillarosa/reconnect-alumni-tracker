from fastapi import APIRouter, Body, File, HTTPException, Depends, Query, Path, Response, UploadFile, status
from bson import ObjectId
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr, Field, StrictStr
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import os, jwt
from middleware.require_auth import verify_token
from models.users_model import BulkUserRequest, ShortUser, UserSchema
from config.database import education_collection, users_collection, career_collection
from models.education_model import EducationEntryModel
from models.career_model import CareerEntryModel
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from util.cloudinary_config import cloudinary
from cloudinary.uploader import upload as cloudinary_upload
from cloudinary.exceptions import Error as CloudinaryError

router = APIRouter(prefix="/profile", tags=["Profile Router"])

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

class ProfileUpdate(BaseModel):
    # Fields that the user can update via the Edit Profile modal
    first_name: Optional[str] = Field(None, min_length=1, description="User's first name")
    last_name: Optional[str] = Field(None, min_length=1, description="User's last name")
    biography: Optional[str] = Field(None, description="User's profile biography")
    location: Optional[str] = Field(None, description="User's location (e.g., City, Country)")
    contact_number: Optional[str] = Field(None, description="User's contact number")
    email: Optional[str] = Field(None, description="User's email address")

class EducationEntryData(BaseModel):
    school_name: str = Field(..., min_length=1)
    degree: str = Field(..., min_length=1)
    graduation_date: Optional[str] = Field(None)
    logo_url: Optional[str] = Field(None)
    
class CareerEntryData(BaseModel):
    company: str = Field(..., min_length=1)
    position: str = Field(..., min_length=1)
    logo_url: Optional[str] = Field(None)
    start_date: Optional[str] = Field(None)
    end_date: Optional[str] = Field(None)
    is_current: bool = Field(False)



# Updated bulk endpoint
@router.post("/bulk", response_model=List[ShortUser])
def get_users_bulk(request: BulkUserRequest = Body(...)):
    try:
        object_ids = [ObjectId(id) for id in request.user_ids]
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid user IDs format")

    try:
        # print("OBJECT ID's: ", object_ids)

        db_users_cursor = users_collection.find(
            {"_id": {"$in": object_ids}},
            {"password": 0}
        )

        db_users = list(db_users_cursor)

        # print("DB_USERS: ", db_users)

        for user in db_users:
            user["_id"] = str(user["_id"])

        return db_users

    except Exception as e:
        # print(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching users")


# Endpoint Description: Get Profile Details (GET)
# Contributed by: Lawrence Combalicer
@router.get("", response_model=UserSchema)
async def get_user_details(user: dict = Depends(verify_token)):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    # Fetch main user data from DB
    db_user = users_collection.find_one({"_id": user_id_obj})

    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in database")

    # Ensure other potential lists are initialized if missing. Fetch career history separately if needed, or handle if embedded
    db_user['career_history'] = db_user.get('career_history') or []
    db_user['bookmarks'] = db_user.get('bookmarks') or []

    try:
        return UserSchema.model_validate(db_user)
    except Exception as e:
        # print(f"Pydantic Validation Error in get_user_details: {e}")
        raise HTTPException(status_code=500, detail=f"Error validating user profile data: {str(e)}")


# Endpoint Description: Get Education Details (GET)
# Contributed by: Lawrence Combalicer
@router.get("/education", response_model=List[EducationEntryModel]) # Returns a LIST of EducationEntryModel
async def get_education_history(user: dict = Depends(verify_token)):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    education_cursor = education_collection.find({"user_id": user_id_obj})
    education_list = list(education_cursor)

    # --- Return the raw list, let FastAPI handle serialization ---
    # The updated EducationEntryModel should now serialize correctly
    # print(education_list)
    return education_list


# --- NEW Endpoint: Get Career History (GET /profile/career) ---
@router.get("/career", response_model=List[CareerEntryModel]) # Returns a LIST of CareerEntryModel
async def get_career_history(user: dict = Depends(verify_token)):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    career_cursor = career_collection.find({"user_id": user_id_obj})
    career_list = list(career_cursor)

    try:
        return career_list
    except Exception as e:
        # print(f"Error during career list validation for user {user_id_str}: {e}")
        raise HTTPException(status_code=500, detail="Error processing career history.")


# Endpoint Description: Update Profile Details (PUT)
# Contributed by: Lawrence Combalicer
@router.put("", response_model=ProfileUpdate) # Return only the updated fields for confirmation
async def update_user_profile(profile_data: ProfileUpdate = Body(...), user: dict = Depends(verify_token)):
    user_id = user.get("_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

    # Create update document, excluding fields that were NOT sent in the request
    update_fields = profile_data.model_dump(exclude_unset=True)

    # Check if there's anything actually to update
    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

    # Add updated_at timestamp
    update_fields["updated_at"] = datetime.now(timezone.utc)

    # Perform the update in MongoDB
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found during update")

    return ProfileUpdate(**update_fields)


# Endpoint Description: Add Education in Profile (POST)
# Contributed by: Lawrence Combalicer
@router.post("/education", response_model=EducationEntryModel)
async def add_education_entry(
    education_data: EducationEntryData = Body(...),
    user: dict = Depends(verify_token)
):
    user_id = user.get("_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user_id_obj = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    if not users_collection.count_documents({"_id": user_id_obj}, limit=1):
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Authenticated user not found in database")


    now = datetime.now(timezone.utc)    
    
    new_education_document = {
        "user_id": user_id_obj, # Store as ObjectId
        "school_name": education_data.school_name,
        "degree": education_data.degree,
        "graduation_date": education_data.graduation_date,
        "logo_url": education_data.logo_url,
        "created_at": now,
        "updated_at": now
    }

    result = education_collection.insert_one(new_education_document)

    if not result.acknowledged or not result.inserted_id:
            # This indicates a problem with the insert operation itself
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to insert education entry into database.")

    try:
        # Pass the dictionary representation including the _id
        created_doc = education_collection.find_one({"_id": result.inserted_id})
        if not created_doc:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve newly created education entry.")

        # Validate and return the created document
        validated_entry = EducationEntryModel.model_validate(created_doc)
        return validated_entry
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing education entry response.")
     
# Endpoint Description: Add Career in Profile (POST)
# Contributed by: Lawrence Combalicer     
@router.post("/career", response_model=CareerEntryModel) # Return the newly added entry
async def add_career_entry(
    career_data: CareerEntryData = Body(...),
    user: dict = Depends(verify_token)
):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    if not users_collection.count_documents({"_id": user_id_obj}, limit=1):
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Authenticated user not found in database")

    now = datetime.now(timezone.utc)

    new_career_document_data = {
        "user_id": user_id_obj, # Link back to the user
        "company": career_data.company,
        "position": career_data.position,
        "logo_url": career_data.logo_url,
        "start_date": career_data.start_date,
        "end_date": career_data.end_date,
        "is_current": career_data.is_current,
        "created_at": now,
        "updated_at": now
    }

    try:
        result = career_collection.insert_one(new_career_document_data)

        if not result.acknowledged or not result.inserted_id:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to insert career entry into database.")

        created_doc = career_collection.find_one({"_id": result.inserted_id})

        if not created_doc:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve newly created career entry.")

        return CareerEntryModel.model_validate(created_doc)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing career entry: {str(e)}")   
     
     
     
# Endpoint Description: Edit Education in Profile (PUT)
# Contributed by: Lawrence Combalicer
@router.put("/education/{entry_id}", response_model=EducationEntryModel)
async def update_education_entry(
    entry_id: str = Path(..., title="The ID of the education entry to update", min_length=24, max_length=24),
    education_data: EducationEntryData = Body(...), # Use the simpler data model for input
    user: dict = Depends(verify_token)
):
    user_id_str = user.get("_id") # Get user ID from token data
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: User ID missing")

    # Validate User ID format
    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format in token")

    # Validate Entry ID format
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Education Entry ID format")
    entry_id_obj = ObjectId(entry_id)

    update_fields = education_data.model_dump(exclude_unset=True)

    if "user_id" in update_fields:
        del update_fields["user_id"]

    update_fields["updated_at"] = datetime.now(timezone.utc)

    if not update_fields or len(update_fields) == 1 and "updated_at" in update_fields :
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

    update_result = education_collection.update_one(
        {"_id": entry_id_obj, "user_id": user_id_obj}, 
        {"$set": update_fields}
    )

    if update_result.matched_count == 0:
        entry_exists = education_collection.count_documents({"_id": entry_id_obj}, limit=1)
        
        if entry_exists == 0:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Education entry with ID {entry_id} not found")
        else:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to update this education entry")

    updated_doc = education_collection.find_one({"_id": entry_id_obj})

    if not updated_doc:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated education entry after update.")

    try:
        return EducationEntryModel.model_validate(updated_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing updated education entry response.")


# Endpoint Description: Edit Career in Profile (PUT)
# Contributed by: Lawrence Combalicer
@router.put("/career/{entry_id}", response_model=CareerEntryModel, summary="Update a specific career entry", description="Updates the details of a specific career entry belonging to the authenticated user.")
async def update_career_entry(
    entry_id: str = Path(..., title="The ID of the career entry to update"),
    career_data: CareerEntryData = Body(..., description="The new data for the career entry."),
    user: dict = Depends(verify_token),
):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: User ID missing")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format in token")
        
    if not ObjectId.is_valid(entry_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Career Entry ID format")
    entry_id_obj = ObjectId(entry_id)

    # Update document from the request body
    # exclude_unset=True ensures only provided fields are updated
    update_fields = career_data.model_dump(exclude_unset=True)

    # Prevent critical fields from being updated via this endpoint
    if "user_id" in update_fields:
        del update_fields["user_id"]
    if "_id" in update_fields:
        del update_fields["_id"]
    if "created_at" in update_fields:
        del update_fields["created_at"]

    # Add the 'updated_at' timestamp
    update_fields["updated_at"] = datetime.now(timezone.utc)

    if not update_fields or len(update_fields) == 1 and "updated_at" in update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

    # Update MongoDB
    update_result = career_collection.update_one(
        {"_id": entry_id_obj, "user_id": user_id_obj}, {"$set": update_fields}
    )

    # Check if the document was found and potentially modified
    if update_result.matched_count == 0:
        # Check if the entry exists at all to differentiate 404 vs 403
        entry_exists = career_collection.count_documents({"_id": entry_id_obj}, limit=1)
        if entry_exists == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Career entry with ID {entry_id} not found")
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to update this career entry")

    # Fetch the updated document from the database to return it
    updated_doc = career_collection.find_one({"_id": entry_id_obj})

    if not updated_doc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated career entry after update.")

    try:
        validated_entry = CareerEntryModel.model_validate(updated_doc)
        return validated_entry
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing updated career entry response.")


# --- Endpoint: Delete Education Entry (DELETE) ---
@router.delete(
    "/education/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT, # Standard success code for DELETE
    summary="Delete an education entry by its ID"
)
async def delete_education_entry(
    entry_id: str = Path(..., title="The ID of the education entry to delete", min_length=24, max_length=24),
    user: dict = Depends(verify_token)
):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    try:
        entry_id_obj = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid education entry ID format")

    delete_result = education_collection.delete_one(
        {"_id": entry_id_obj, "user_id": user_id_obj} 
    )

    if delete_result.deleted_count == 0:
        # Entry ID didn't exist OR it didn't belong to this user
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Education entry with ID {entry_id} not found or user not authorized to delete"
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Endpoint: Delete Career Entry (DELETE) ---
@router.delete(
    "/career/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT, 
    summary="Delete a career entry by its ID"
)
async def delete_career_entry(
    entry_id: str = Path(..., title="The ID of the career entry to delete", min_length=24, max_length=24),
    user: dict = Depends(verify_token)
):
    user_id_str = user.get("_id")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user_id_obj = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format in token")

    try:
        entry_id_obj = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid career entry ID format")

    delete_result = career_collection.delete_one(
        {"_id": entry_id_obj, "user_id": user_id_obj} 
    )

    if delete_result.deleted_count == 0:
        # Entry ID didn't exist OR it didn't belong to this user
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career entry with ID {entry_id} not found or user not authorized to delete"
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


## EDIT PROFILE/COVER PICTURE
@router.put("/upload/image")
async def upload_and_set_picture(
    file: UploadFile = File(...),
    pic_type: str = Query(..., description="Type of picture to upload (profile/header)"),
    user: dict = Depends(verify_token)  # Assumes this returns the logged-in user
):
    try:
        result = cloudinary_upload(file.file)
        cloud_url = result["secure_url"]

        update_field = (
            "profile_picture" if pic_type == "profile" else "header_picture"
        )

        update_result = users_collection.update_one(
            {"_id": ObjectId(user["_id"])},
            {"$set": {update_field: cloud_url}}
        )

        if update_result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found or already up-to-date.")

        return {
            "message": f"{update_field} updated successfully.",
            "cloud_url": cloud_url
        }

    except CloudinaryError as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")