from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from bson import ObjectId
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError
from models.jobs_model import JobPostingSchema, JobStatusEnum, UpdateJobSchema, SavedJobSchema
from models.report_model import ReportJobRequest
from pydantic import BaseModel, EmailStr, Field, StrictStr
from typing import List
from config.database import jobs_collection, job_reports_collection, saved_jobs_collection, users_collection, applied_jobs_collection
from middleware.require_auth import verify_token
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/jobs", tags=["Admin Job Router"])


@router.get("/months")
async def get_jobs_posted_per_month(user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403, detail="Only admins can get number of posts per month.")

    pipeline = [
        {
            "$match": {
                "date_posted": {"$ne": None}
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date_posted"},
                    "month": {"$month": "$date_posted"}
                },
                "total_posts": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id.year": 1, "_id.month": 1}
        },
        {
            "$project": {
                "_id": 0,
                "year": "$_id.year",
                "month": "$_id.month",
                "total_posts": 1
            }
        }
    ]

    result = list(jobs_collection.aggregate(pipeline))
    return result


# Endpoint Description: Get Job Details
# Contributed by: James Carl Villarosa
@router.get("/{job_id}")
async def get_job_details(job_id: str, user: dict = Depends(verify_token)):
    """
    Get job details for a specific job listing by job_id.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint.")

    try:
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    # Find the job listing
    job = jobs_collection.find_one({"_id": job_object_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Convert ObjectId fields to strings
    job["_id"] = str(job["_id"])
    if "authorId" in job:
        job["authorId"] = str(job["authorId"])

    return {"job_details": job}


# Archive Job Endpoint
@router.patch("/{job_id}/archive")
async def archive_job_post(job_id: str, user: dict = Depends(verify_token)):
    # Add/Update attribute 'is_archived' to 'true'

    try:
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    job = jobs_collection.find_one({"_id": job_object_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.get("is_archived"):
        raise HTTPException(status_code=400, detail="Job is already archived")

    result = jobs_collection.update_one(
        {"_id": job_object_id},
        {"$set": {"is_archived": True}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=500, detail="Failed to archive job")

    return {"message": "Job archived successfully", "job_id": job_id}

# Update Job Listing
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

# Delete job listing endpoint
# Note that this is a permanent delete.
@router.delete("/{job_id}")
async def permanently_delete_job(job_id: str, user: dict = Depends(verify_token)):

    try:
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job_id format")

    job = jobs_collection.find_one({"_id": job_object_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = jobs_collection.delete_one({"_id": job_object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete job")

    return {"message": "Job permanently deleted", "jobId": job_id}


#Description: Get all job listings with optional filters and pagination
#Contributed by: Sigmund Baybay
@router.get("/")
async def get_all_jobs(
    skip: int = Query(0, description="The number of jobs to skip for pagination."),
    limit: int = Query(9, description="The number of jobs to return (default is 9)."),
    keyword: Optional[str] = Query(None, description="Search keyword in job title, company, description, etc."),
    job_type: Optional[str] = Query(None, description="Type of employment, e.g. Full-Time or Part-Time."),
    min_salary: Optional[int] = Query(None, description="Minimum salary threshold."),
    max_salary: Optional[int] = Query(None, description="Maximum salary threshold."),
    location: Optional[str] = Query(None, description="Job location, e.g. 'Manila, Philippines'."),
    status: Optional[str] = Query(None, description="Job status, e.g. Still Hiring or Closed."),
    user: dict = Depends(verify_token)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can retrieve job postings.")

    filters = {}

    if job_type:
        filters["job_type"] = job_type
    if location:
        filters["location"] = location
    if status:
        filters["status"] = status
    if min_salary is not None:
        filters["min_salary"] = {"$gte": min_salary}
    if max_salary is not None:
        filters["max_salary"] = {"$lte": max_salary}

    if keyword:
        pipeline = [{
            "$search": {
                "index": "default",
                "text": {
                    "query": keyword,
                    "path": ["title", "job_field", "job_type", "job_level", "company_name", "location", "description"],
                    "fuzzy": {"maxEdits": 1}
                }
            }
        }]

        if filters:
            pipeline.append({"$match": filters})

        count_pipeline = pipeline + [{"$count": "total"}]
        total_res = list(jobs_collection.aggregate(count_pipeline))
        total_count = total_res[0]["total"] if total_res else 0

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
    
# Endpoint Description: Get All Reports of a Job Listing 
# Contributed by: Sigmund Baybay
@router.get("/reports/{job_id}")
async def get_job_reports(job_id: str, user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view job reports.")

    try:
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    reports = list(job_reports_collection.find({"job_id": job_object_id}))

    if not reports:
        raise HTTPException(status_code=404, detail="No reports found for this job")

    # Convert ObjectId fields to strings
    for report in reports:
        report["_id"] = str(report["_id"])
        report["job_id"] = str(report["job_id"])
        report["user_id"] = str(report["user_id"])

    return {"reports": reports}

@router.get("/{job_id}/applicants")
async def get_applicants_for_job(
    job_id: str,
    skip: int = Query(0, description="Number of applicants to skip for pagination"),
    limit: int = Query(10, description="Number of applicants to return per page"),
    user: dict = Depends(verify_token)
):
    """
    Get all applicants for a specific job listing and show their names 10 (default) at a time using the applied_jobs collection..
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint.")

    try:
        job_object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    # Find the job listing
    job = jobs_collection.find_one({"_id": job_object_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Query the applied_jobs collection
    application_filter = {"job_id": job_object_id}

    # Get total count for pagination
    total_applicants = applied_jobs_collection.count_documents(application_filter)

    if total_applicants == 0:
         return {
             "job_id": job_id,
             "applicants": [],
             "has_more": False,
             "total_applicants": 0,
             "skip": skip,
             "limit": limit,
             "message": "No applicants found for this job"
         }

    # Fetch paginated application documents, getting user_id and applied_at
    applications_cursor = applied_jobs_collection.find(
        application_filter,
        {
            "user_id": 1, 
            "applied_at": 1, 
            "_id": 0
        }
    ).sort("applied_at", 1).skip(skip).limit(limit) # Add sorting by application time

    applications = list(applications_cursor)
    
    if not applications:
         return {
             "job_id": job_id,
             "applicants": [],
             "has_more": False,
             "total_applicants": total_applicants,
             "skip": skip,
             "limit": limit
         }
    
    # Extract user IDs
    applicant_user_ids = [app["user_id"] for app in applications]
    
    # Fetch applicant details from users collection
    user_details = {}
    if applicant_user_ids:
        users_cursor = users_collection.find(
            {"_id": {"$in": applicant_user_ids}},
            {"_id": 1, "first_name": 1, "last_name": 1}
        )
        # Create a dictionary for easy lookup
        user_details = {str(user["_id"]): user for user in users_cursor}

    # Combine application data with user details
    response_applicants = []
    for app in applications:
        user_id_str = str(app["user_id"])
        user_info = user_details.get(user_id_str, {})
        response_applicants.append({
            "user_id": user_id_str,
            "first_name": user_info.get("first_name"),
            "last_name": user_info.get("last_name"),
            "applied_at": app["applied_at"]
        })
         
    return {
        "job_id": job_id,
        "applicants": response_applicants,
        "has_more": skip + len(response_applicants) < total_applicants, # Correct hasMore
        "total_applicants": total_applicants,
        "skip": skip,
        "limit": limit
    }


    # # Check if the job has applicants
    # if "applicants" not in job or not job["applicants"]:
    #     return {"message": "No applicants found for this job"}

    # # Paginate the applicants
    # applicants_data = job["applicants"][skip:skip + limit]

    # # Extract user IDs from the applicants array
    # applicant_ids = [ObjectId(applicant["user_id"]) for applicant in applicants_data]

    # # Fetch applicant details from the users collection
    # applicants = list(users_collection.find(
    #     {"_id": {"$in": applicant_ids}},
    #     {"first_name": 1, "last_name": 1, "_id": 0}
    # ))
@router.get("/applicants/months")
async def get_monthly_applicant_counts(user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admin role required.")

    try:
        pipeline = [
            {
                "$unwind": "$applicants"
            },
            {
                "$match": {
                    "applicants.applied_at": {"$exists": True}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$applicants.applied_at"},
                        "month": {"$month": "$applicants.applied_at"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "_id": 0,  
                    "year": "$_id.year",
                    "month": "$_id.month",
                    "total_applicants": "$count" 
                }
            },
            {
                "$sort": {
                    "year": ASCENDING,
                    "month": ASCENDING
                }
            }
        ]

        # Execute the aggregation pipeline on the jobs_collection
        monthly_counts = list(jobs_collection.aggregate(pipeline))

        return monthly_counts

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
    
# Get jobs created by an alumni
@router.get("/alumni/{alumni_id}")
async def get_alumni_jobs(
    alumni_id: str,
    user: dict = Depends(verify_token)
):
    try:
        try:
            alumni_obj_id = ObjectId(alumni_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid alumni ID format")
        
        created_jobs_cursor = jobs_collection.find({"authorId": alumni_obj_id})
        created_jobs = list(created_jobs_cursor) if created_jobs_cursor else []

        total_count = 0
        open_count = 0

        if len(created_jobs) != 0:
            for job in created_jobs:
                job["_id"] = str(job["_id"])
                job["authorId"] = str(job["authorId"])

                if job["status"] == JobStatusEnum.still_hiring:
                    open_count += 1

                total_count += 1
        
        return {
            "created_jobs": created_jobs,
            "total_jobs_created": total_count,
            "total_open_jobs": open_count
        }    

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching alumni jobs: {str(e)}"
        )
