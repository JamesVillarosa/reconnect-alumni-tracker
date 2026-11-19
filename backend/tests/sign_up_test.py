import pytest
from global_test_client import client
from config.database import users_collection

# Sample test user matching the UserSchema structure
test_user = {
    "email": "user_test@example.com",
    "password": "ABCabc123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "alumni",
    "student_number": "2022-00000",
    "bookmarked_jobs": [],
    "bookmarked_events": [],
    "biography": "Just a test user.",
    "location": "Test City",
    "profile_picture": "https://example.com/profile.jpg",
    "header_picture": "https://example.com/header.jpg",
    "education_history": [],
    "career_history": [],
    "current_career": {
        "company": "Test Corp",
        "classification": "Full-Time",
        "industry": "Tech",
        "tenured_status": False,
        "salary_range": "30k-40k",
        "is_current": True
    },
    "auth_provider": "local",
    "account_status": "Active",
    "verification_status": "Unverified",
    "rsvpd_events": [],
    "surveys_taken": []
}


@pytest.fixture(autouse=True)
def cleanup_test_user():
    users_collection.delete_many({"email": test_user["email"]})
    yield
    users_collection.delete_many({"email": test_user["email"]})


def test_sign_up_success():
    response = client.post("/basic/sign-up", json=test_user)

    assert response.status_code == 200
    data = response.json()

    assert data["message"] == "User registered successfully"
    assert "user_id" in data
    assert "access_token" in response.cookies