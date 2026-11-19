import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from config.database import articles_collection
from middleware.require_auth import verify_token
from bson import ObjectId



router = APIRouter(prefix="/articles", tags=["Articles Router"])

@router.get("/")
async def get_all_articles(
    skip: int = Query(
        0, description="The number of saved jobs to skip for pagination."),
    limit: int = Query(
        5, description="The number of saved jobs to return (default is 5)."),
    user=Depends(verify_token)
):
  articles_cursor = articles_collection.find({}).skip(skip).limit(limit)
  articles = list(articles_cursor)

  if not articles:
      raise HTTPException(status_code=404, detail="No events found")

  # Convert ObjectId fields to strings for JSON serialization
  for article in articles:
      article["_id"] = str(article["_id"])
      article["authorId"] = str(article["authorId"])
      article["commentId"] = str(article["commentId"])

  total_count = articles_collection.count_documents({})

  return {
        "articles": articles,
        "hasMore": skip + (limit if limit != 0 else total_count) < total_count,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }

def format_oid(oid):
    return {"$oid": str(oid)} if oid else None

def format_date(dt: datetime):
    return {"$date": dt.isoformat()} if dt else None

@router.get("/{article_id}")
async def get_article_detail(article_id: str, user=Depends(verify_token)):
    try:
        obj_id = ObjectId(article_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid article ID")

    article = articles_collection.find_one({"_id": obj_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return {
        "_id": str(article["_id"]),
        "created_at": article.get("created_at").isoformat() if article.get("created_at") else None,
        "updated_at": article.get("updated_at").isoformat() if article.get("updated_at") else None,
        "authorId": str(article.get("authorId")) if article.get("authorId") else None,
        "title": article.get("title"),
        "description": article.get("description"),
        "imageURL": article.get("imageURL"),
        "commentId": str(article.get("commentId")) if article.get("commentId") else None,
    }