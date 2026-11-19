from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from pymongo import MongoClient
from models.base_model import MongoBaseModel, PyObjectId
from models.jobs_model import JobFieldEnum, JobLevelEnum, JobPostingSchema, JobStatusEnum, JobTypeEnum, UpdateJobSchema, SavedJobSchema, CreateJobSchema
from models.report_model import ReportJobRequest
from models.applied_jobs_model import AppliedJobSchema
from pydantic import BaseModel, EmailStr, Field, StrictStr
from typing import List
from config.database import jobs_collection, job_reports_collection, saved_jobs_collection, users_collection, applied_jobs_collection
from middleware.require_auth import verify_token
from datetime import datetime, timedelta

router = APIRouter(prefix="/jobs", tags=["Job Router"])


@router.post("/")
async def create_job_posting(job: CreateJobSchema, user: dict = Depends(verify_token)):
    """
    Endpoint to create a new job posting.
    """
   
    # Convert authorId from string to ObjectId
    try:
        author_oid = ObjectId(user.get("_id"))
        
        first_name = user.get("first_name", "")
        last_name = user.get("last_name", "")
        author_name = f"{first_name} {last_name}".strip()
        
        if not author_name:
            author_name = "System User" # Default to System User. Change to any if ever
        
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid user token data")
    
     # Convert Pydantic model to dictionary
    job_data = job.model_dump()
    
    # Add server-managed fields
    now = datetime.utcnow()
    job_data["authorId"] = author_oid
    job_data["author_name"] = author_name
    job_data["flagged"] = False  
    job_data["date_posted"] = now
    job_data["created_at"] = now
    job_data["updated_at"] = now
    

    # Insert into MongoDB
    try:
        result = jobs_collection.insert_one(job_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create job posting (no inserted ID returned)")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create job posting")

    # Convert ObjectId fields to strings for the response
    job_data["_id"] = str(job_data["_id"])
    job_data["authorId"] = str(job_data["authorId"])

    return {"message": "Job posted successfully", "job": job_data}


@router.get("/")
async def get_all_jobs(
    skip: int = Query(
        0, description="The number of jobs to skip for pagination."),
    limit: int = Query(
        10, description="The number of jobs to return (default is 10)."),
    job_field: Optional[List[str]] = Query(
        None,
        description="Filter by one or more job categories, e.g., 'Web Developer', 'Project Manager'.",
        example=["Web Developer", "Project Manager"]
    ),
    job_type: Optional[str] = Query(
        None, description="The type of the job, e.g., 'Full-Time', 'Part-Time'.", example="Full-Time"),
    min_salary: Optional[int] = Query(
        None, description="The minimum salary for the job filter.", example=50000),
    max_salary: Optional[int] = Query(
        None, description="The maximum salary for the job filter.", example=120000),
    listing_time: Optional[str] = Query(
        None, description="Filter jobs by listing time. Options: 'Listed any time', 'Last 24 hours', 'Last 7 days', 'Last 14 days', 'This month', 'Last 3 months', 'Last 6 months', 'This year'.", example="Last 7 days"),
    keyword: Optional[str] = Query(
        None, description="Keyword to search in job_field, job_type, or title."),
    status: Optional[str] = Query(
        None, description="Status of the job posting (only accessible by admins).", example="Still Hiring"),
    user: dict = Depends(verify_token)
):
    """
    Retrieve paginated job postings from the database.
    Optionally filter by job_field.
    """
    # Build query
    filters = {}
    if job_field:
        filters["job_field"] = {"$in": job_field}
    if job_type:
        filters["job_type"] = job_type
    if min_salary:
        # Greater than or equal to min_salary
        filters["min_salary"] = {"$gte": min_salary}
    if max_salary:
        # Less than or equal to max_salary
        filters["max_salary"] = {"$lte": max_salary}
    # if min_salary and max_salary:
    #     query["$and"] = [
    #         {"min_salary": {"$gte": min_salary}},
    #         {"max_salary": {"$lte": max_salary}}
    #     ]  # Range between min_salary and max_salary
    
    # Allow status filtering only if user is admin
    if status:
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admins can filter by status.")
        filters["status"] = status

    # Filter by listing time
    if listing_time:
        now = datetime.now()
        if listing_time == "Last 24 hours":
            time_limit = now - timedelta(days=1)
        elif listing_time == "Last 7 days":
            time_limit = now - timedelta(days=7)
        elif listing_time == "Last 14 days":
            time_limit = now - timedelta(days=14)
        elif listing_time == "This month":
            time_limit = datetime(now.year, now.month, 1)
        elif listing_time == "Last 3 months":
            time_limit = now - timedelta(days=90)
        elif listing_time == "Last 6 months":
            time_limit = now - timedelta(days=180)
        elif listing_time == "This year":
            time_limit = datetime(now.year, 1, 1)
        else:
            time_limit = None

        if time_limit:
            # Filter based on the calculated date
            filters["date_posted"] = {"$gte": time_limit}

    # If keyword is provided, use Atlas Search
    if keyword:
        pipeline = []

        pipeline.append({
            "$search": {
                "index": "default",  # Replace with your actual index name if different
                "text": {
                    "query": keyword,
                    "path": ["title", "job_field", "job_type", "job_level", "company_name", "location", "description"],
                    "fuzzy": {"maxEdits": 1}
                }
            }
        })

        if filters:
            pipeline.append({"$match": filters})

        # Get total count
        count_pipeline = pipeline + [{"$count": "total"}]
        total_res = list(jobs_collection.aggregate(count_pipeline))
        total_count = total_res[0]["total"] if total_res else 0

        # Pagination
        pipeline.extend([
            {"$skip": skip},
            {"$limit": limit}
        ])

        jobs = list(jobs_collection.aggregate(pipeline))
    else:
        jobs = list(jobs_collection.find(filters).skip(skip).limit(limit))

        total_count = jobs_collection.count_documents(filters)

    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")

    # Convert ObjectId fields to strings
    for job in jobs:
        job["_id"] = str(job["_id"])
        job["authorId"] = str(job["authorId"])

    return {
        "jobs": jobs,
        "hasMore": skip + (limit if limit != 0 else total_count) < total_count,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }


@router.post("/saved-jobs")
async def save_job(saved_job: SavedJobSchema, user=Depends(verify_token)):
    user_id = str(user.get("_id"))

    # Check if the job is already saved
    existing = saved_jobs_collection.find_one({
        "userId": user_id,
        "jobId": saved_job.jobId
    })

    if existing:
        raise HTTPException(status_code=409, detail="Job already saved")

    # Prepare the document to insert
    saved_data = saved_job.model_dump()
    # Convert authorId from string to ObjectId
    try:
        saved_data["jobId"] = ObjectId(saved_data["jobId"])
        saved_data["userId"] = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    saved_data["date_saved"] = datetime.utcnow()

    result = saved_jobs_collection.insert_one(saved_data)

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to save job")

    # return the saved job with inserted ID
    saved_data["_id"] = str(result.inserted_id)
    saved_data["jobId"] = str(saved_data["jobId"])
    saved_data["userId"] = str(user_id)

    return {
        "message": "Job saved successfully",
        "savedJob": saved_data
    }


@router.get("/saved-jobs")
async def get_saved_jobs(
    skip: int = Query(
        0, description="The number of saved jobs to skip for pagination."),
    limit: int = Query(
        10, description="The number of saved jobs to return (default is 10)."),
    user=Depends(verify_token)
):
    user_id = user.get("_id")

    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    query = {"userId": user_object_id}

    saved_jobs_cursor = list(saved_jobs_collection.find(query).skip(skip).limit(limit))

    # Get the jobIds from the saved jobs
    job_ids = [str(saved_job["jobId"]) for saved_job in saved_jobs_cursor]

    if not job_ids:
        return {
            "savedJobs": [],
            "hasMore": False,
            "total": 0,
            "skip": skip,
            "limit": limit
        }

    # Query the jobs collection to get the full job documents by jobIds
    jobs = list(jobs_collection.find(
        {"_id": {"$in": [ObjectId(job_id) for job_id in job_ids]}}))

    # Convert the _id of each job to string and set it in the response
    for job in jobs:
        job["_id"] = str(job["_id"])
        job["authorId"] = str(job["authorId"])

    total_count = saved_jobs_collection.count_documents(query)

    return {
        "savedJobs": jobs,
        "hasMore": skip + (limit if limit != 0 else total_count) < total_count,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }


@router.delete("/saved-jobs")
async def delete_saved_job(
    job_id: str = Query(..., description="The ID of the job to unsave"),
    user=Depends(verify_token)
):
    user_id = user.get("_id")

    try:
        user_object_id = ObjectId(user_id)
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    result = saved_jobs_collection.delete_one({
        "userId": user_object_id,
        "jobId": job_object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved job not found")

    return {
        "message": "Saved job deleted successfully",
        "jobId": job_id
    }

# INPUT: job_id : String, params


@router.get("/{job_id}")
async def get_job_by_id(job_id: str, user: dict = Depends(verify_token)):

    try:
        job_object_id = ObjectId(job_id)
        print("JOB OBJECT ID: ", job_object_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job_id format")

    job = jobs_collection.find_one({"_id": job_object_id})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Convert ObjectId fields to strings for JSON serialization
    job["_id"] = str(job["_id"])
    job["authorId"] = str(job["authorId"])

    return job

# INPUT: job_id: String, params

# Endpoint Description: Update Job Post Details
# Contributed by: Lawrence Combalicer
@router.patch("/{job_id}")
async def update_job_post(job_id: str, update_data: UpdateJobSchema, user: dict = Depends(verify_token)):
    try:
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job_id format")

    update_fields = update_data.model_dump(exclude_none=True)
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = jobs_collection.update_one(
        {"_id": job_object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"message": "Job updated successfully"}


@router.patch("/{job_id}/delete")
async def delete_job_post(job_id: str, user: dict = Depends(verify_token)):
    # Convert to id to Object ID
    try:
        object_job_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Job ID Invalid!")

    # Check if Object ID exists in Jobs collection
    job = jobs_collection.find_one({"_id": object_job_id})

    print(job)

    if not job:
        raise HTTPException(
            status_code=500, detail="Specific Job Object Not Found!")

    # Check if Object ID is already deleted, else soft delete the object
    if job.get("is_deleted"):
        raise HTTPException(
            status_code=400, detail="Job Object is already deleted")

    result = jobs_collection.update_one({"_id": object_job_id}, {
                                        "$set": {"is_deleted": True}})  # set is_deleted to True

    if result.matched_count == 0:
        raise HTTPException(
            status_code=500, detail="Failed to soft delete job posting")

    return {"message": "Job soft deleted successfully", "id": job_id}


# APPLY TO JOB ENDPOINT
class ApplyJobRequest(BaseModel):
    user_id: str


@router.post("/{job_id}/apply")
async def apply_to_job(job_id: str, data: ApplyJobRequest, user: dict = Depends(verify_token)):
    try:
        job_object_id = ObjectId(job_id)
        user_object_id = ObjectId(data.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    job = jobs_collection.find_one({"_id": job_object_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing_application = applied_jobs_collection.find_one({
        "job_id": job_object_id,
        "user_id": user_object_id
    })

    if existing_application:
         return {
             "message": "You have already applied to this job.",
             "job_id": job_id,
             "applicant_id": str(user_object_id),
             "applied_at": existing_application.get("applied_at") # Return existing application time
         }

    # Add the user to the applicants list with a timestamp
    application_data = {
        "user_id": user_object_id,
        "job_id": job_object_id,
        "applied_at": datetime.utcnow()  # Store the current UTC date and time
    }

    try:
        result = applied_jobs_collection.insert_one(application_data)
        if not result.inserted_id:
             raise HTTPException(status_code=500, detail="Failed to record application.")
        
        return {
            "message": "Successfully applied to job!",
            "job_id": job_id,
            "applicant_id": data.user_id,
            "applied_at": application_data["applied_at"]
        }
        
    except Exception as e:
        print(f"Error inserting application: {e}") # Log error
        raise HTTPException(status_code=500, detail="Database error during application.")
    
# REPORT JOB ENDPOINT


@router.post("/report")
async def report_job_post(data: ReportJobRequest, user: dict = Depends(verify_token)):
    try:
        job_object_id = ObjectId(data.job_id)
        user_object_id = ObjectId(data.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    existing_report = job_reports_collection.find_one({
        "job_id": job_object_id,
        "user_id": user_object_id,
        "status": "Pending"
    })

    if existing_report:
        raise HTTPException(
            status_code=409,
            detail="You already submitted a report for this job. Please wait for it to be reviewed."
        )

    jobs_collection.update_one(
        {"_id": job_object_id},
        {"$set": {"flagged": True}}
    )

    job_reports_collection.insert_one({
        "job_id": job_object_id,
        "user_id": user_object_id,
        "category": data.category,
        "description": data.description or "",
        "status": data.status or "Pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    return {
        "message": "Job reported successfully. Your report is under review."
    }


# Check if already reported

@router.get("/{job_id}/report/status")
async def check_report_status(job_id: str, user_id: str, user: dict = Depends(verify_token)):
    try:
        job_object_id = ObjectId(job_id)
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    existing_report = job_reports_collection.find_one({
        "job_id": job_object_id,
        "user_id": user_object_id,
        "status": "Pending"
    })

    return {
        "has_pending_report": bool(existing_report)
    }

@router.post("/bookmark/{job_id}", status_code=200)
async def save_job_post(job_id: str, user: dict = Depends(verify_token)):
    user_id = user.get("_id")

    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    # Check if job exists
    job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    user_record = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    already_saved = job_id in [str(jid) for jid in user_record.get("bookmarks", [])]

    if already_saved:
        # Unsave
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"bookmarks": ObjectId(job_id)}}
        )
        return {"message": "Job post removed from bookmarks"}
    else:
        # Save
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"bookmarks": ObjectId(job_id)}}
        )
        return {"message": "Job post bookmarked successfully"}