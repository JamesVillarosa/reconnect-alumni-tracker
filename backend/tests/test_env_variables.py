import os
import pytest
from dotenv import dotenv_values

REQUIRED_ENV_VARS = [
    "API_ENVIRONMENT",
    "FACEBOOK_CLIENT_ID",
    "FACEBOOK_CLIENT_SECRET",
    "REDIRECT_URI",
    # "FRONTEND_URL",
    "SECRET_KEY",
    "ALGORITHM",
    "ACCESS_TOKEN_EXPIRE_MINUTES",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI"
    "MAIL_USERNAME",
    "MAIL_PASSWORD",
    "MAIL_FROM",
    "CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_URL",
    "DB_URI"
]


def test_env_file_exists():
    """Check if the .env file exists."""
    assert os.path.exists(".env"), ".env file is missing."


def test_required_env_variables_present():
    """Check if all required environment variables are in the .env file."""
    env_vars = dotenv_values(".env")

    missing_vars = [
        var for var in REQUIRED_ENV_VARS if var not in env_vars or env_vars[var] == ""]
    assert not missing_vars, f"Missing or empty required environment variables: {missing_vars}"
