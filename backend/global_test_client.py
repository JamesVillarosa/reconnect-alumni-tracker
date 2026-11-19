from fastapi.testclient import TestClient
from main import app  # Import your FastAPI app

"""
Fixture to initialize the TestClient once per test session.
This reduces the overhead of initializing it repeatedly across multiple tests.
"""
client = TestClient(app)