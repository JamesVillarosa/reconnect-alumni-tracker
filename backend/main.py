import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from routers.auth.basic_user_api.sign_in_router import router as user_router
from routers.auth.basic_user_api.sign_up_router import router
from routers.auth import fb_router
from routers.auth.google_router import router as google_auth_router
from routers.jobs import router as jobs_router
from routers.admin.jobs import router as admin_jobs_router
from routers.admin.alumni import router as admin_alumni_router
from routers.events import router as events_router
from routers.auth.auth_helpers import router as auth_helper_router
from routers.donations import router as donation_router
from routers.profile import router as profile_router
from routers.survey import router as survey_router
from routers.admin.others import router as admin_miscellaneous_router
from routers.admin.donations import router as admin_donation_router
from routers.admin.donors import router as admin_donor_router
from routers.images import router as images_router
from routers.admin.events import router as admin_events_router
from routers.admin.rsvp import router as admin_rsvp_router
from routers.articles import router as articles_router
from routers.comments import router as comments_router
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

DB_URI = os.getenv("DB_URI")
app = FastAPI()

# Add Gzip Middleware for text compression
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses larger than 1KB

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:5173", "http://localhost:5173", "https://project128.vercel.app", "https://reconnect-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

####################################
##### AUTHENTICATION ENDPOINTS #####
####################################

# Function Description: Auth Helpers (Validate User and Logout)
# Contributed by: Aaron Zamora
app.include_router(auth_helper_router)

# Function Description: Basic User Log In Router
# Contributed by: Aaron Zamora
app.include_router(user_router)

# Function Description: Basic User Sign Up Router
# Contributed by: James Carl Villarosa
app.include_router(router)

# Function Description: Initial FB sign in router
# Contributed by: Cabrera, Jan Carlo
app.include_router(fb_router.fb_signin_router)

# Function Description: Google Sign-in Router
# Contributed by: Kelvin James Beliber
app.include_router(google_auth_router)


####################################
#####     ALUMNI ENDPOINTS     #####
####################################

# Function Description: Profile Routers
# Contributed by: Lawrence Combalicer
app.include_router(profile_router)

# Function Description: Survey Routers
# Contributed by: Ken Valenciano
app.include_router(survey_router)

# Function Description: Donation Routers
# Contributed by: Aaron Zamora, James Villarosa, Kelvin James Beliber
app.include_router(donation_router)

# Function Description: Events Routers
# Contributed by: James Villarosa, Kelvin James Beliber, Lawrence Combalicer
app.include_router(events_router)

# Function Description: Job Routers
# Contributed by: Aaron Zamora, Jan Carlo Cabrera
app.include_router(jobs_router)


####################################
#####      ADMIN ENDPOINTS     #####
####################################

# Function Description: Admin Jobs Endpoints
# Contributed by: Aaron Zamora, Lawrence Combalicer
app.include_router(admin_jobs_router)

# Function Description: Admin Alumni Endpoints
# Contributed by: Aaron Zamora, Lawrence Combalicer
app.include_router(admin_alumni_router)

# Function Description: Admin Donation Router
# Contributed by: Gabriel Virtucio, Kelvin James Beliber
app.include_router(admin_donation_router)

# Function Description: Admin Donor Router
# Contributed by: Kelvin James Beliber
app.include_router(admin_donor_router)

# Function Description: Admin Event Routers
# Contributed by: Simgund Baybay
app.include_router(admin_events_router)

# Function Description: Admin RSVP Routers
# Contributed by: Aaron Zamora
app.include_router(admin_rsvp_router)

# Function Description: Admin Minor/Misellaneous Routers
# Contributed by: Lawrence Combalicer
app.include_router(admin_miscellaneous_router)

####################################
#####      OTHER ENDPOINTS     #####
####################################

# Function Description: Image Router
# Contributed by: Gabriel Virtucio
app.include_router(images_router)

# Function Description: Articles Router
# Contributed by: Aaron Zamora
app.include_router(articles_router)

# Function Description: Comments Router
# Contributed by: Lawrence Combalicer, Jan Carlo Cabrera
app.include_router(comments_router)




@app.get("/")
def root():
    return {"message": "Backend is running."}

# Create a new client and connect to the server
client = MongoClient(DB_URI, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)