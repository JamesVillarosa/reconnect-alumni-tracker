from global_test_client import client
from config.database import users_collection
from passlib.context import CryptContext
import pytest
import importlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.fixture(scope="module", autouse=True)
def setup_test_user():
    # Create a test user in the DB
    test_user = {
        "email": "testuser@example.com",
        "password": pwd_context.hash("Test123!")
    }
    users_collection.insert_one(test_user)
    yield
    # Cleanup after tests
    users_collection.delete_many({"email": "testuser@example.com"})

def test_successful_login():
    response = client.post("/basic/sign-in", json={
        "email": "testuser@example.com",
        "password": "Test123!"
    })

    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"
    assert "access_token" in response.cookies

def test_failed_login_invalid_password():
    response = client.post("/basic/sign-in", json={
        "email": "testuser@example.com",
        "password": "WrongPassword"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_failed_login_user_not_found():
    response = client.post("/basic/sign-in", json={
        "email": "nonexistent@example.com",
        "password": "whatever"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
