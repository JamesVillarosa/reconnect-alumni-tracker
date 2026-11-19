from datetime import datetime
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from bson.errors import InvalidId
from bson import ObjectId
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from models.users_model import RoleEnum
from models.comments_model import CommentResponse, UserInfo
from models.base_model import MongoBaseModel, PyObjectId
from models.comments_model import CommentSchema
from models.comment_thread_model import CommentThreadSchema
from config.database import comments_collection, comment_threads_collection, users_collection
from middleware.require_auth import verify_token

router = APIRouter(prefix="/comments", tags=["Comments and Threads"])

class CreateCommentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    parent_comment_id: Optional[PyObjectId] = None

class UpdateCommentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


# These are migrated to comment_models.py
# class UserInfo(BaseModel): 
#     id: PyObjectId = Field(alias="_id")
#     first_name: str
#     last_name: str
#     profile_picture: Optional[str] = None

# class CommentResponse(CommentSchema): 
#     author: Optional[UserInfo] = None 
#     replies: List['CommentResponse'] = Field(default_factory=list) 

def build_comment_tree(comments: List[dict], authors_map: Dict[ObjectId, UserInfo]) -> List[CommentResponse]:
    """
    Build a nested comment tree from a flat list of comments.
    Each comment with a `parent_comment_id` is added as a child of its parent.
    """
    comment_map: Dict[ObjectId, CommentResponse] = {}
    root_comments: List[CommentResponse] = []

    # First pass: create CommentResponse objects
    for comment in comments:
        author_info = authors_map.get(comment.get("authorId"))
        comment_obj = CommentResponse(**comment, author=author_info)
        comment_map[comment_obj.id] = comment_obj

    # Second pass: build the tree
    for comment in comment_map.values():
        parent_id = comment.parent_comment_id
        if parent_id and parent_id in comment_map:
            comment_map[parent_id].replies.append(comment)
        else:
            root_comments.append(comment)

    return root_comments

class CommentThreadDetailResponse(MongoBaseModel):
    originId: PyObjectId
    comments: List[CommentResponse] = Field(default_factory=list)

@router.post("/origin/{origin_id}", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(origin_id: str, comment_data: CreateCommentRequest, current_user: dict = Depends(verify_token)):
    try:
        origin_obj_id = ObjectId(origin_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid origin_id format.")

    # Get user ID from token
    user_id_str = current_user.get("_id")  # Assuming verify_token provides 'user_id'
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User ID not found in token.")
    
    try:
        author_obj_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format in token.")

    parent_comment_obj_id: Optional[ObjectId] = None
    parent_comment_doc = None
    if comment_data.parent_comment_id:
        # Validate parent_comment_id if provided
        try:
            parent_id = ObjectId(comment_data.parent_comment_id)
        except InvalidId:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent_comment_id format.")
        
        parent_comment_doc = comments_collection.find_one({"_id": parent_id})
        if not parent_comment_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found.")
        
        parent_comment_obj_id = parent_id

    now = datetime.utcnow()

    try:
        # Determine threadId based on whether it's a top-level comment or a reply
        if parent_comment_doc:
            # If it's a reply, use the parent's threadId
            thread_id = parent_comment_doc["threadId"]
        else:
            # If it's a top-level comment, find or create a comment thread for the origin
            comment_thread = comment_threads_collection.find_one({"originId": origin_obj_id})
            if not comment_thread:
                new_thread_data = {
                    "originId": origin_obj_id,
                    "commentId_list": [],
                    "created_at": now,
                    "updated_at": now
                }
                insert_result = comment_threads_collection.insert_one(new_thread_data)
                thread_id = insert_result.inserted_id
            else:
                thread_id = comment_thread["_id"]

        # Create the new comment
        new_comment_doc = {
            "text": comment_data.text,
            "authorId": author_obj_id,
            "threadId": thread_id,
            "parent_comment_id": parent_comment_obj_id,
            "created_at": now,
            "updated_at": now
        }
        comment_insert_result = comments_collection.insert_one(new_comment_doc)
        new_comment_id = comment_insert_result.inserted_id

        # Add comment ID to thread's commentId_list
        comment_threads_collection.update_one(
            {"_id": thread_id},
            {"$addToSet": {"commentId_list": new_comment_id}, "$set": {"updated_at": now}}
        )

        # Fetch the created comment to return (including its new _id)
        created_comment = comments_collection.find_one({"_id": new_comment_id})
        if not created_comment:  # Should not happen
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve created comment.")

        # Populate author for response
        author_info_doc = users_collection.find_one(
            {"_id": created_comment["authorId"]},
            {"first_name": 1, "last_name": 1, "profile_picture": 1}
        )
        author_info = UserInfo.model_validate(author_info_doc) if author_info_doc else None

        return CommentResponse(**created_comment, author=author_info)

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")

    
    
@router.get("/thread/origin/{origin_id}", response_model=CommentThreadDetailResponse)
async def get_comment_thread_for_origin(origin_id: str):
    """
    Retrieves all comments for a given origin, structured hierarchically.
    """
    try:
        origin_obj_id = ObjectId(origin_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid origin_id format.")

    try:
        comment_thread_doc = comment_threads_collection.find_one({"originId": origin_obj_id})
        if not comment_thread_doc:
            # Return an empty thread response if no thread exists for the origin
            return CommentThreadDetailResponse(
                id=PyObjectId(), # Dummy ID, or fetch/create an empty thread
                created_at=datetime.utcnow(), # Dummy time
                updated_at=datetime.utcnow(), # Dummy time
                originId=origin_obj_id,
                comments=[]
            )
            # Alternatively, raise 404:
            # raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment thread not found for this origin.")


        comment_ids = comment_thread_doc.get("commentId_list", [])
        if not comment_ids:
            return CommentThreadDetailResponse(**comment_thread_doc, comments=[]) # Use thread's actual id, created_at, etc.

        # Fetch all comments in the thread
        # Sort by created_at to help with chronological display if not relying on parent_comment_id solely for order
        comments_cursor = comments_collection.find({"_id": {"$in": comment_ids}}).sort("created_at", 1)
        comments_list_from_db = list(comments_cursor)

        if not comments_list_from_db:
             return CommentThreadDetailResponse(**comment_thread_doc, comments=[])

        # Fetch author details for all comments efficiently
        author_ids = list(set(c["authorId"] for c in comments_list_from_db if c.get("authorId")))
        authors_map: Dict[ObjectId, UserInfo] = {}
        if author_ids:
            authors_cursor = users_collection.find(
                {"_id": {"$in": author_ids}},
                {"first_name": 1, "last_name": 1, "profile_picture": 1} # Only fetch needed fields
            )
            for author_doc in authors_cursor:
                authors_map[author_doc["_id"]] = UserInfo.model_validate(author_doc)
        
        # Build hierarchical comment tree
        structured_comments = build_comment_tree(comments_list_from_db, authors_map)
        
        return CommentThreadDetailResponse(**comment_thread_doc, comments=structured_comments)

    except PyMongoError as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")
    
    
@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    comment_data: UpdateCommentRequest,
    current_user: dict = Depends(verify_token)
):
    try:
        comment_obj_id = ObjectId(comment_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid comment_id format.")

    user_id_str = current_user.get("user_id")
    user_role = current_user.get("role")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User ID not found in token.")
    
    try:
        current_user_obj_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format in token.")


    try:
        comment_doc = comments_collection.find_one({"_id": comment_obj_id})
        if not comment_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

        # Authorization check: Must be author or admin
        if comment_doc.get("authorId") != current_user_obj_id and user_role != RoleEnum.admin.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this comment.")

        update_result = comments_collection.update_one(
            {"_id": comment_obj_id},
            {"$set": {"text": comment_data.text, "updated_at": datetime.utcnow()}}
        )

        if update_result.matched_count == 0: 
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found during update.")
        

        updated_comment_doc = comments_collection.find_one({"_id": comment_obj_id})
        if not updated_comment_doc:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated comment.")

        author_info_doc = users_collection.find_one({"_id": updated_comment_doc["authorId"]}, {"first_name": 1, "last_name": 1, "profile_picture": 1})
        author_info = UserInfo.model_validate(author_info_doc) if author_info_doc else None
        
        return CommentResponse(**updated_comment_doc, author=author_info)

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")
    
@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: dict = Depends(verify_token)
):
    try:
        comment_obj_id = ObjectId(comment_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid comment_id format.")

    user_id_str = current_user.get("user_id")
    user_role = current_user.get("role")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User ID not found in token.")
    try:
        current_user_obj_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format in token.")

    try:
        comment_doc = comments_collection.find_one({"_id": comment_obj_id})
        if not comment_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

        # Authorization check
        if comment_doc.get("authorId") != current_user_obj_id and user_role != RoleEnum.admin.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment.")

        thread_id = comment_doc.get("threadId")

        # Delete the comment
        delete_result = comments_collection.delete_one({"_id": comment_obj_id})

        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found during deletion attempt.")

        # Remove comment_id from the thread's list
        if thread_id:
            comment_threads_collection.update_one(
                {"_id": thread_id},
                {"$pull": {"commentId_list": comment_obj_id}, "$set": {"updated_at": datetime.utcnow()}}
            )
        
        # To implement cascading delete:
        # replies_to_delete = list(comments_collection.find({"parent_comment_id": comment_obj_id}))
        # for reply in replies_to_delete:
        #     # recursively call delete logic or batch delete
        #     # and remove from threadId_list

        return

    except PyMongoError as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except HTTPException: 
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")
