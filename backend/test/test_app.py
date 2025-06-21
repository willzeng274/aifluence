import shutil

import pytest
from fastapi.testclient import TestClient

from app import app, STORAGE_DIR

@pytest.fixture
def mock_ig_manager(mocker):
    """Fixture to mock the InstagramManager."""
    mock = mocker.patch("app.ig_manager", autospec=True)
    return mock

@pytest.fixture(scope="module")
def client():
    """Test client for the FastAPI application."""
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def run_around_tests():
    """Clean up storage directory before and after each test."""
    if STORAGE_DIR.exists():
        shutil.rmtree(STORAGE_DIR)
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    yield
    if STORAGE_DIR.exists():
        shutil.rmtree(STORAGE_DIR)

def test_root(client):
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "AI Influencer Manager API"

def test_create_account_success(client, mock_ig_manager):
    """Test successful account creation."""
    mock_ig_manager.add_account.return_value = (True, "Account added successfully")
    response = client.post("/accounts", json={"username": "testuser", "password": "password"})
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["success"] is True
    assert json_response["username"] == "testuser"
    mock_ig_manager.add_account.assert_called_once_with("testuser", "password")

@pytest.mark.parametrize("message, status_code", [
    ("Account already exists", 409),
    ("Challenge required", 403),
    ("rate limit", 429),
    ("invalid credentials", 401),
    ("some other error", 400),
])
def test_create_account_failures(client, mock_ig_manager, message, status_code):
    """Test various failure scenarios for account creation."""
    mock_ig_manager.add_account.return_value = (False, message)
    response = client.post("/accounts", json={"username": "testuser", "password": "password"})
    assert response.status_code == status_code
    assert message in response.json()["detail"]

def test_list_accounts(client, mock_ig_manager):
    """Test listing all accounts."""
    accounts = ["user1", "user2"]
    mock_ig_manager.list_accounts.return_value = accounts
    response = client.get("/accounts")
    assert response.status_code == 200
    assert response.json() == {"accounts": accounts}
    mock_ig_manager.list_accounts.assert_called_once()

def test_get_account_info_success(client, mock_ig_manager):
    """Test getting account info for an existing account."""
    info = {"username": "testuser", "follower_count": 100}
    mock_ig_manager.get_account_info.return_value = info
    response = client.get("/accounts/testuser")
    assert response.status_code == 200
    assert response.json() == info
    mock_ig_manager.get_account_info.assert_called_once_with("testuser")

def test_get_account_info_not_found(client, mock_ig_manager):
    """Test getting account info for a non-existent account."""
    mock_ig_manager.get_account_info.return_value = None
    response = client.get("/accounts/testuser")
    assert response.status_code == 404
    assert response.json()["detail"] == "Account not found"

def test_upload_photo_success(client, mock_ig_manager, tmp_path):
    """Test successful photo upload."""
    mock_ig_manager.upload_photo.return_value = ("mock_media_id", "Photo uploaded")
    
    image_file = tmp_path / "test.jpg"
    image_file.write_text("fake image data")

    with open(image_file, "rb") as f:
        response = client.post(
            "/upload/photo",
            data={"username": "testuser", "caption": "A test photo"},
            files={"file": ("test.jpg", f, "image/jpeg")}
        )

    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["success"] is True
    assert json_resp["media_id"] == "mock_media_id"
    assert "test.jpg" in json_resp["file_path"]
    mock_ig_manager.upload_photo.assert_called_once()
    assert "test.jpg" in mock_ig_manager.upload_photo.call_args[0][1]

def test_upload_photo_failure_removes_file(client, mock_ig_manager, tmp_path):
    """Test that a failed photo upload removes the temp file."""
    mock_ig_manager.upload_photo.return_value = (None, "session expired")
    
    image_file = tmp_path / "test.jpg"
    image_file.write_text("fake image data")

    with open(image_file, "rb") as f:
        response = client.post(
            "/upload/photo",
            data={"username": "testuser", "caption": "A test photo"},
            files={"file": ("test.jpg", f, "image/jpeg")}
        )
    
    assert response.status_code == 401
    assert "session expired" in response.json()["detail"].lower()

    assert not any(STORAGE_DIR.iterdir()) 