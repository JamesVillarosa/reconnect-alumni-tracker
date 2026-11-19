# Projected JSON format:
# {
#   "_id": ObjectId("65f4e1d07d98f3a8a4e8b2f1"),
#   "created_at": "2024-03-15T10:00:00Z",
#   "updated_at": "2024-03-15T10:00:00Z",
#   "commentId_list": [
#     ObjectId("65f4e1b97d98f3a8a4e8b2d1"),
#     ObjectId("65f4e1c47d98f3a8a4e8b2e2")
#   ],
#   "originId": ObjectId("65f4e1a97d98f3a8a4e8b2e7")
# }

from .base_model import MongoBaseModel, PyObjectId
from typing import List

class CommentThreadSchema(MongoBaseModel):
    # Comment thread model for grouping related comments
    commentId_list: List[PyObjectId] = []  # List of comments in thread
    originId: PyObjectId  # Reference to origin (post, event, etc.)
