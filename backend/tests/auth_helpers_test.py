import pytest
from fastapi import HTTPException
from global_test_client import client
import importlib

# Mocked version of the verify_token function
@pytest.fixture(scope="session")
def valid_access_token():
    basic_sign_in_router = importlib.import_module('middleware.require_auth')  # Import the file for sign_in_router.py
    secret_key_from_require_auth = basic_sign_in_router.SECRET_KEY
    basic_sign_in_router = importlib.import_module('routers.auth.basic_user_api.sign_in_router')  # Import the file for sign_in_router.py
    secret_key_from_basic_sign_in = basic_sign_in_router.SECRET_KEY
    print(secret_key_from_require_auth)
    print(secret_key_from_basic_sign_in)
    response = client.post(
        "/basic/sign-in",
        json={"email": "sample@admin.com", "password": "ABCabc123!", "rememberMe": False}  # Use test credentials that work
    )
    assert response.status_code == 200
    return response.cookies.get("access_token")  # Extract JWT from cookie

def test_validate_user_valid(valid_access_token):
    """Test the validate_user route with a valid token."""
    print(f"\n[DEBUG] Valid Access Token: {valid_access_token}")
    response = client.get("/auth/validate_user", cookies={"access_token": valid_access_token})
    print(response.json())
    
    assert response.status_code == 200
    assert response.json()["message"] == "Token is valid"

def test_validate_user_invalid_token():
    """Test the validate_user route with an invalid token."""
    response = client.get("/auth/validate_user", cookies={"access_token": "invalid_token"})
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"

def test_logout():
    """Test the logout route."""
    response = client.post("/auth/logout", cookies={"access_token": "valid_token"})

    assert response.status_code == 200
    assert response.json() == {"message": "Logged out successfully"}

    # Ensure the access token cookie is cleared
    cookies = response.cookies
    assert "access_token" not in cookies

# You can add more tests if needed to cover additional scenarios.
