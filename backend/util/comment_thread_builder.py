from typing import Any, Dict, List
from bson import ObjectId
from models.base_model import PyObjectId
from models.comments_model import CommentResponse, UserInfo


def build_comment_tree(comments_list: List[Dict[str, Any]], authors_map: Dict[PyObjectId, UserInfo]) -> List[CommentResponse]:
    """Helper function to build a hierarchical comment tree."""
    comment_map: Dict[ObjectId, CommentResponse] = {}
    root_comments: List[CommentResponse] = []

    # First pass: create CommentResponse objects and map them
    for comment_doc in comments_list:
        author_info = authors_map.get(comment_doc["authorId"])
        # Ensure all fields are present or defaulted for CommentResponse
        # PyObjectId fields will be handled by Pydantic during model_validate
        comment_response_obj = CommentResponse.model_validate({**comment_doc, "author": author_info, "replies": []})
        comment_map[comment_doc["_id"]] = comment_response_obj
        
    # Second pass: build the tree structure
    for comment_doc in comments_list:
        comment_obj = comment_map[comment_doc["_id"]]
        parent_id = comment_doc.get("parent_comment_id")
        if parent_id and parent_id in comment_map:
            comment_map[parent_id].replies.append(comment_obj)
        elif not parent_id: # It's a root comment
            root_comments.append(comment_obj)
            
    # Optional: Sort replies within each comment if needed (e.g., by created_at)
    # for comment_obj in comment_map.values():
    #     comment_obj.replies.sort(key=lambda r: r.created_at)
    
    # Sort root comments
    root_comments.sort(key=lambda c: c.created_at)
    return root_comments