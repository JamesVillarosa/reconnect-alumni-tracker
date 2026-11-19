# Projected JSON format:
# {
#   "_id": ObjectId("65f4e1b97d98f3a8a4e8b2d1"),
#   "created_at": "2024-03-15T10:00:00Z",
#   "updated_at": "2024-03-15T10:00:00Z",
#   "text": "This is a comment on the article.",
#   "authorId": ObjectId("65f4e1a07d98f3a8a4e8b2c3"),
#   "threadId": ObjectId("65f4e1a97d98f3a8a4e8b2e7")
# }

from typing import List, Optional
from .base_model import MongoBaseModel, PyObjectId
from pydantic import BaseModel, Field

class CommentSchema(MongoBaseModel):
    parent_comment_id: Optional[PyObjectId] = None  # Reply-to (null if top-level comment)
    text: str  # Comment content
    authorId: PyObjectId  # Author of the comment
    threadId: PyObjectId  # Reference to parent thread



class UserInfo(BaseModel): 
    id: PyObjectId = Field(alias="_id")
    first_name: str
    last_name: str
    profile_picture: Optional[str] = None

class CommentResponse(CommentSchema): 
    author: Optional[UserInfo] = None 
    replies: List['CommentResponse'] = Field(default_factory=list) 

# If parent_comment_id = None, it's a top-level comment
# If parent_comment_id = ObjectId(...), it's a reply to that comment