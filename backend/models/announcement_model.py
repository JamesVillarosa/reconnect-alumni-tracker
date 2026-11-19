# Projected JSON format:
# {
#   "_id": ObjectId("65f4e1b97d98f3a8a4e8b2d4"),
#   "created_at": "2024-03-15T10:00:00Z",
#   "updated_at": "2024-03-15T10:00:00Z",
#   "authorId": ObjectId("65f4e1a07d98f3a8a4e8b2c3"),
#   "title": "Upcoming Alumni Homecoming",
#   "description": "Join us for the annual ICS alumni gathering!",
#   "imageURL": "https://example.com/image.jpg",
#   "commentId": ObjectId("65f4e1c27d98f3a8a4e8b2d5")
# }

from .base_model import MongoBaseModel, PyObjectId
from typing import Optional

class ArticleSchema(MongoBaseModel):
    # Article model schema for system-wide articles
    authorId: PyObjectId  # Reference to article creator
    title: str  # Article title
    description: str  # Article content
    imageURL: Optional[str]  # Optional image URL
    commentId: PyObjectId  # Reference to comment thread
