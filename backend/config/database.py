import os
from pymongo import MongoClient

# connection string comes from the environment (DB_URI locally and on the host)
client = MongoClient(os.getenv("DB_URI"))

db = client.reconnect_db # Database name

# Collections in the database
users_collection = db["users_collection"]
events_collection = db["events_collection"]
jobs_collection = db["jobs_collection"]
saved_jobs_collection = db["saved_jobs_collection"]
career_collection = db["career_collection"]
education_collection = db["education_collection"]
articles_collection = db["articles_collection"]
comments_collection = db["comments_collection"]
comment_threads_collection = db["comment_threads_collection"]
donations_collection = db["donations_collection"]
donors_collection = db["donors_collection"]
info_requests_collection = db["info_requests_collection"]
notifications_collection = db["notifications_collection"]
form_questions_collection = db["form_questions_collection"]
form_answers_collection = db["form_answers_collection"]
rsvp_collection = db["rsvp_collection"]
applied_jobs_collection = db["applied_jobs_collection"] #added for applied jobs
job_reports_collection = db["job_reports_collection"] #added for job report
donation_reports_collection = db["donation_reports_collection"] #added for donation report
event_reports_collection = db["event_reports_collection"] #added for event report