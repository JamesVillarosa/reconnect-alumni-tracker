# used for representation of data in the database for FastAPI

def user_serializer(user) -> dict:
    return {
        "id": str(user["_id"]),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
        "email": user["email"],
        "password": user.get("password"),  # Optional field
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "role": user["role"],
        "graduation_year": user["graduation_year"],
        "career_history": user.get("career_history", []),  # Optional with default
        "skills": user.get("skills", []),  # Optional with default
        "auth_provider": user.get("auth_provider", "local"),
        "account_status": user.get("account_status", "Active"),
        "verification_status": user.get("verification_status", "Unverified")

    }

def event_serializer(event) -> dict:
    return {
        "id": str(event["_id"]),
        "created_at": event["created_at"],
        "updated_at": event["updated_at"],
        "created_by": str(event["created_by"]),
        "title": event["title"],
        "description": event["description"],
        "event_date": event["event_date"],
        "location": event["location"],
        "approval_status": event.get("approval_status", "Pending"),
        "eventImageURL": event["eventImageURL"],
        "rsvp_list": [str(user_id) for user_id in event.get("rsvp_list", [])],
        "rsvp_count": event.get("rsvp_count", 0)
    }

def job_serializer(job) -> dict:
    return {
        "id": str(job["_id"]),
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
        "authorId": str(job["authorId"]),
        "title": job["title"],
        "company_name": job["company_name"],
        "location": job["location"],
        "job_type": job["job_type"],
        "job_setup": job["job_setup"],
        "salary_range": job.get("salary_range"),  # Optional field
        "description": job["description"],
        "application_link": job["application_link"],
        "flagged": job.get("flagged", False)
    }

def article_serializer(article) -> dict:
    return {
        "id": str(article["_id"]),
        "created_at": article["created_at"],
        "updated_at": article["updated_at"],
        "authorId": str(article["authorId"]),
        "title": article["title"],
        "description": article["description"],
        "imageURL": article.get("imageURL"),  # Optional field
        "commentId": str(article["commentId"])
    }

def comment_serializer(comment) -> dict:
    return {
        "id": str(comment["_id"]),
        "created_at": comment["created_at"],
        "updated_at": comment["updated_at"],
        "text": comment["text"],
        "authorId": str(comment["authorId"]),
        "threadId": str(comment["threadId"])
    }

def comment_thread_serializer(thread) -> dict:
    return {
        "id": str(thread["_id"]),
        "created_at": thread["created_at"],
        "updated_at": thread["updated_at"],
        "commentId_list": [str(comment_id) for comment_id in thread.get("commentId_list", [])],
        "originId": str(thread["originId"])
    }

def donation_serializer(donation) -> dict:
    return {
        "id": str(donation["_id"]),
        "created_at": donation["created_at"],
        "updated_at": donation["updated_at"],
        "title": donation["title"],
        "description": donation["description"],
        "donorId_list": [str(donor_id) for donor_id in donation.get("donorId_list", [])],
        "raised_funds": donation.get("raised_funds", 0),
        "target_funds": donation["target_funds"],
        "status": donation.get("status", "Active")

        
    }

def donor_serializer(donor) -> dict:
    return {
        "id": str(donor["_id"]),
        "created_at": donor["created_at"],
        "updated_at": donor["updated_at"],
        "userId": str(donor["userId"]),
        "driveId": str(donor["driveId"]),
        "amount": donor["amount"],
        "status": donor.get("status", "Pending"),
        "receiptImageURL": donor["receiptImageURL"]
    }
    
def report_serializer(report) -> dict:
    return {
        "id": str(report["_id"]),
        "job_id": str(report["job_id"]),
        "user_id": str(report["user_id"]),
        "donation_id": str(report.get("donation_id")),
        "category": report.get("category", []),
        "description": report.get("description", ""),
        "status": report.get("status", "Pending"),
        "created_at": report["created_at"],
        "updated_at": report["updated_at"]
    }
    
# List serializers for multiple documents
def users_serializer(users) -> list:
    return [user_serializer(user) for user in users]

def events_serializer(events) -> list:
    return [event_serializer(event) for event in events]

def jobs_serializer(jobs) -> list:
    return [job_serializer(job) for job in jobs]

def articles_serializer(articles) -> list:
    return [article_serializer(article) for article in articles]

def comments_serializer(comments) -> list:
    return [comment_serializer(comment) for comment in comments]

def comment_threads_serializer(threads) -> list:
    return [comment_thread_serializer(thread) for thread in threads]

def donations_serializer(donations) -> list:
    return [donation_serializer(donation) for donation in donations]

def donors_serializer(donors) -> list:
    return [donor_serializer(donor) for donor in donors]

def reports_serializer(reports) -> list:
    return [report_serializer(report) for report in reports]