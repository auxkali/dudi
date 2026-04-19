import os
import sys
from fastapi.testclient import TestClient

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

if __name__ == "__main__":
    # Run simple tests
    try:
        test_health_check()
        print("Health check test passed!")
        test_root()
        print("Root endpoint test passed!")
    except Exception as e:
        print(f"Tests failed: {e}")
        sys.exit(1)
