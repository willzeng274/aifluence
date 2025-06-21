import os
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from managers.instagram_manager import InstagramManager

app = FastAPI(title="AI Influencer Manager", version="1.0.0")

ig_manager = InstagramManager()

STORAGE_DIR = Path("storage/files")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

class AccountCreate(BaseModel):
    username: str
    password: str

class UploadContent(BaseModel):
    username: str
    caption: str = ""

class AccountStats(BaseModel):
    username: str
    follower_count: int
    following_count: int
    media_count: int
    engagement_rate: float = 0.0
    last_updated: str

@app.post("/accounts")
def create_account(account: AccountCreate):
    """Add new AI influencer account"""
    success, message = ig_manager.add_account(account.username, account.password)
    if not success:
        if "already exists" in message.lower():
            status_code = 409
        elif "challenge" in message.lower() or "verification" in message.lower():
            status_code = 403
        elif "rate limit" in message.lower() or "wait" in message.lower():
            status_code = 429
        elif "invalid credentials" in message.lower():
            status_code = 401
        else:
            status_code = 400
        
        raise HTTPException(status_code=status_code, detail=message)
    
    return {"success": True, "username": account.username, "message": message}

@app.get("/accounts")
def list_accounts():
    """List all AI influencer accounts"""
    accounts = ig_manager.list_accounts()
    return {"accounts": accounts}

@app.get("/accounts/{username}")
def get_account_info(username: str):
    """Get account information and stats"""
    info = ig_manager.get_account_info(username)
    if not info:
        raise HTTPException(status_code=404, detail="Account not found")
    return info

@app.post("/accounts/{username}/resume")
def resume_account_session(username: str):
    """Resume account session (load from saved session)"""
    success, message = ig_manager.load_account(username)
    if not success:
        if "not found" in message.lower():
            status_code = 404
        elif "expired" in message.lower():
            status_code = 401
        else:
            status_code = 400
        raise HTTPException(status_code=status_code, detail=message)
    return {"success": True, "message": message}

@app.post("/upload/photo")
async def upload_photo(
    username: str = Form(...),
    caption: str = Form(""),
    file: UploadFile = File(...)
):
    """Upload photo for AI influencer"""
    file_path = STORAGE_DIR / f"{username}_{datetime.now().timestamp()}_{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        media_id, message = ig_manager.upload_photo(username, str(file_path), caption)
        
        if not media_id:
            os.remove(file_path)
            if "session expired" in message.lower() or "login" in message.lower():
                status_code = 401
            elif "rate limit" in message.lower():
                status_code = 429
            else:
                status_code = 400
            raise HTTPException(status_code=status_code, detail=message)
        
        return {
            "success": True,
            "media_id": media_id,
            "file_path": str(file_path),
            "message": message
        }
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

@app.post("/upload/video")
async def upload_video(
    username: str = Form(...),
    caption: str = Form(""),
    file: UploadFile = File(...)
):
    """Upload video/reel for AI influencer"""
    file_path = STORAGE_DIR / f"{username}_{datetime.now().timestamp()}_{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        media_id, message = ig_manager.upload_video(username, str(file_path), caption)
        
        if not media_id:
            os.remove(file_path)
            if "session expired" in message.lower() or "login" in message.lower():
                status_code = 401
            elif "rate limit" in message.lower():
                status_code = 429
            else:
                status_code = 400
            raise HTTPException(status_code=status_code, detail=message)
        
        return {
            "success": True,
            "media_id": media_id,
            "file_path": str(file_path),
            "message": message
        }
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

@app.post("/upload/story")
async def upload_story(
    username: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload story for AI influencer"""
    file_path = STORAGE_DIR / f"{username}_story_{datetime.now().timestamp()}_{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        media_id, message = ig_manager.upload_story(username, str(file_path))
        
        if not media_id:
            os.remove(file_path)
            if "session expired" in message.lower() or "login" in message.lower():
                status_code = 401
            elif "rate limit" in message.lower():
                status_code = 429
            else:
                status_code = 400
            raise HTTPException(status_code=status_code, detail=message)
        
        return {
            "success": True,
            "media_id": media_id,
            "file_path": str(file_path),
            "message": message
        }
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

@app.get("/files/{filename}")
def get_file(filename: str):
    """Get stored file"""
    file_path = STORAGE_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@app.get("/analytics/{username}")
def get_performance_analytics(username: str):
    """Get AI influencer performance analytics"""
    ig_manager.update_account_stats(username)
    
    info = ig_manager.get_account_info(username)
    if not info:
        raise HTTPException(status_code=404, detail="Account not found")
    
    engagement_rate = 0.0
    if info['follower_count'] > 0:
        engagement_rate = (info['media_count'] * 50) / info['follower_count'] * 100
    
    return {
        "username": username,
        "followers": info['follower_count'],
        "following": info['following_count'],
        "posts": info['media_count'],
        "engagement_rate": round(engagement_rate, 2),
        "growth_metrics": {
            "followers_growth": "N/A",
            "posts_this_month": "N/A"
        },
        "last_updated": info['created_at']
    }

@app.delete("/accounts/{username}")
def remove_account(username: str):
    """Remove AI influencer account"""
    success = ig_manager.remove_account(username)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"success": True, "message": "Account removed"}

@app.get("/")
def root():
    return {
        "name": "AI Influencer Manager API",
        "version": "1.0.0",
        "accounts": len(ig_manager.list_accounts()),
        "endpoints": {
            "POST /accounts": "Add new AI influencer account",
            "GET /accounts": "List all accounts", 
            "GET /accounts/{username}": "Get account info",
            "POST /accounts/{username}/resume": "Resume saved session",
            "POST /upload/photo": "Upload photo (form: username, caption, file)",
            "POST /upload/video": "Upload video (form: username, caption, file)", 
            "POST /upload/story": "Upload story (form: username, file)",
            "GET /analytics/{username}": "Get performance analytics",
            "GET /files/{filename}": "Access stored files",
            "DELETE /accounts/{username}": "Remove account",
            "GET /docs": "Full API documentation"
        }
    }

@app.get("/docs")
def get_docs():
    return {
        "title": "AI Influencer Manager API Documentation",
        "endpoints": [
            {
                "method": "POST",
                "path": "/accounts",
                "description": "Add new AI influencer account",
                "body": {"username": "string", "password": "string"},
                "responses": {
                    "200": {"success": True, "username": "string", "message": "string"},
                    "401": "Invalid credentials",
                    "403": "Challenge required", 
                    "409": "Account already exists",
                    "429": "Rate limited"
                }
            },
            {
                "method": "GET", 
                "path": "/accounts",
                "description": "List all AI influencer accounts",
                "responses": {
                    "200": {"accounts": ["username1", "username2"]}
                }
            },
            {
                "method": "GET",
                "path": "/accounts/{username}",
                "description": "Get account information and stats",
                "responses": {
                    "200": {
                        "username": "string",
                        "full_name": "string", 
                        "follower_count": "int",
                        "following_count": "int",
                        "media_count": "int",
                        "is_active": "bool"
                    },
                    "404": "Account not found"
                }
            },
            {
                "method": "POST",
                "path": "/accounts/{username}/resume", 
                "description": "Resume saved session",
                "responses": {
                    "200": {"success": True, "message": "Session loaded successfully"},
                    "401": "Session expired",
                    "404": "Account not found"
                }
            },
            {
                "method": "POST",
                "path": "/upload/photo",
                "description": "Upload photo for AI influencer",
                "form_data": {
                    "username": "string",
                    "caption": "string (optional)",
                    "file": "image file"
                },
                "responses": {
                    "200": {"success": True, "media_id": "string", "file_path": "string"},
                    "401": "Session expired",
                    "429": "Rate limited"
                }
            },
            {
                "method": "POST", 
                "path": "/upload/video",
                "description": "Upload video/reel for AI influencer",
                "form_data": {
                    "username": "string",
                    "caption": "string (optional)", 
                    "file": "video file"
                },
                "responses": {
                    "200": {"success": True, "media_id": "string", "file_path": "string"},
                    "401": "Session expired",
                    "429": "Rate limited"
                }
            },
            {
                "method": "POST",
                "path": "/upload/story",
                "description": "Upload story for AI influencer", 
                "form_data": {
                    "username": "string",
                    "file": "image or video file"
                },
                "responses": {
                    "200": {"success": True, "media_id": "string", "file_path": "string"},
                    "401": "Session expired",
                    "429": "Rate limited"
                }
            },
            {
                "method": "GET",
                "path": "/analytics/{username}",
                "description": "Get AI influencer performance analytics",
                "responses": {
                    "200": {
                        "username": "string",
                        "followers": "int",
                        "following": "int", 
                        "posts": "int",
                        "engagement_rate": "float",
                        "growth_metrics": {}
                    },
                    "404": "Account not found"
                }
            },
            {
                "method": "GET",
                "path": "/files/{filename}",
                "description": "Access stored files",
                "responses": {
                    "200": "File content",
                    "404": "File not found"
                }
            },
            {
                "method": "DELETE",
                "path": "/accounts/{username}",
                "description": "Remove AI influencer account", 
                "responses": {
                    "200": {"success": True, "message": "Account removed"},
                    "404": "Account not found"
                }
            }
        ],
        "examples": {
            "add_account": "curl -X POST 'http://localhost:8000/accounts' -H 'Content-Type: application/json' -d '{\"username\": \"your_username\", \"password\": \"your_password\"}'",
            "upload_photo": "curl -X POST 'http://localhost:8000/upload/photo' -F 'username=your_username' -F 'caption=Hello World!' -F 'file=@photo.jpg'",
            "get_analytics": "curl -X GET 'http://localhost:8000/analytics/your_username'"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)