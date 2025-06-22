import json
import logging
from typing import Dict, Optional, List
from instagrapi import Client
from instagrapi.exceptions import LoginRequired, ChallengeRequired, PleaseWaitFewMinutes, RateLimitError
from database.models import InstagramAccount, get_db_session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InstagramManager:
    def __init__(self):
        self.clients: Dict[str, Client] = {}
    
    def add_account(self, username: str, password: str, influencer_id: int) -> tuple[bool, str]:
        """Add a new Instagram account and link it to an influencer."""
        db = get_db_session()
        
        try:
            existing = db.query(InstagramAccount).filter(InstagramAccount.username == username).first()
            if existing:
                return False, "Account already exists"
            
            client = Client()
            
            try:
                client.login(username, password)
                logger.info(f"Successfully logged in user: {username}")
            except ChallengeRequired as e:
                logger.error(f"Challenge required for {username}: {e}")
                return False, "Instagram challenge required - please complete verification"
            except LoginRequired as e:
                logger.error(f"Login failed for {username}: {e}")
                return False, "Invalid credentials or login blocked"
            except PleaseWaitFewMinutes as e:
                logger.error(f"Rate limited for {username}: {e}")
                return False, "Rate limited - please wait a few minutes"
            except RateLimitError as e:
                logger.error(f"Rate limit error for {username}: {e}")
                return False, "Too many requests - please try again later"
            except Exception as e:
                logger.error(f"Login error for {username}: {e}")
                return False, f"Login failed: {str(e)}"
            
            try:
                user_info = client.user_info(client.user_id)
                full_name = getattr(user_info, 'full_name', username)
                bio = getattr(user_info, 'biography', '')
                follower_count = getattr(user_info, 'follower_count', 0)
                following_count = getattr(user_info, 'following_count', 0)
                media_count = getattr(user_info, 'media_count', 0)
            except Exception as e:
                logger.warning(f"Could not fetch user info for {username}: {e}")
                full_name = username
                bio = ''
                follower_count = 0
                following_count = 0
                media_count = 0
            
            account = InstagramAccount(
                influencer_id=influencer_id,
                username=username,
                password=password,
                instagram_user_id=str(client.user_id),
                full_name=full_name,
                bio=bio,
                follower_count=follower_count,
                following_count=following_count,
                media_count=media_count,
                session_data=json.dumps(client.get_settings())
            )
            
            db.add(account)
            db.commit()
            
            self.clients[username] = client
            logger.info(f"Account {username} added successfully")
            return True, "Account added successfully"
            
        except Exception as e:
            logger.error(f"Database error adding account {username}: {e}")
            db.rollback()
            return False, f"Database error: {str(e)}"
        finally:
            db.close()
    
    def load_account(self, username: str) -> tuple[bool, str]:
        """Load existing account session"""
        db = get_db_session()
        
        try:
            account = db.query(InstagramAccount).filter(InstagramAccount.username == username).first()
            if not account:
                return False, "Account not found"
            
            if not account.session_data:
                return False, "No saved session found"
            
            try:
                client = Client()
                settings = json.loads(account.session_data)
                client.set_settings(settings)
                
                try:
                    client.account_info()
                    self.clients[username] = client
                    logger.info(f"Successfully loaded session for {username}")
                    return True, "Session loaded successfully"
                except LoginRequired:
                    logger.warning(f"Session expired for {username}")
                    return False, "Session expired - please re-login"
                    
            except json.JSONDecodeError as e:
                logger.error(f"Invalid session data for {username}: {e}")
                return False, "Invalid session data"
            except Exception as e:
                logger.error(f"Failed to restore session for {username}: {e}")
                return False, f"Session restore failed: {str(e)}"
                
        except Exception as e:
            logger.error(f"Database error loading account {username}: {e}")
            return False, f"Database error: {str(e)}"
        finally:
            db.close()
    
    def upload_photo(self, username: str, photo_path: str, caption: str = "") -> tuple[Optional[str], str]:
        """Upload photo for specific account"""
        if username not in self.clients:
            success, message = self.load_account(username)
            if not success:
                return None, message
        
        try:
            client = self.clients[username]
            media = client.photo_upload(photo_path, caption)
            logger.info(f"Photo uploaded successfully for {username}: {media.id}")
            return str(media.id), "Photo uploaded successfully"
        except LoginRequired as e:
            logger.error(f"Login required for photo upload {username}: {e}")
            return None, "Session expired - please re-login"
        except RateLimitError as e:
            logger.error(f"Rate limited photo upload {username}: {e}")
            return None, "Rate limited - please try again later"
        except Exception as e:
            logger.error(f"Failed to upload photo for {username}: {e}")
            return None, f"Upload failed: {str(e)}"
    
    def upload_video(self, username: str, video_path: str, caption: str = "") -> tuple[Optional[str], str]:
        """Upload video/reel for specific account"""
        if username not in self.clients:
            success, message = self.load_account(username)
            if not success:
                return None, message
        
        try:
            client = self.clients[username]
            media = client.clip_upload(video_path, caption)
            logger.info(f"Video uploaded successfully for {username}: {media.id}")
            return str(media.id), "Video uploaded successfully"
        except LoginRequired as e:
            logger.error(f"Login required for video upload {username}: {e}")
            return None, "Session expired - please re-login"
        except RateLimitError as e:
            logger.error(f"Rate limited video upload {username}: {e}")
            return None, "Rate limited - please try again later"
        except Exception as e:
            logger.error(f"Failed to upload video for {username}: {e}")
            return None, f"Upload failed: {str(e)}"
    
    def upload_story(self, username: str, media_path: str) -> tuple[Optional[str], str]:
        """Upload story for specific account"""
        if username not in self.clients:
            success, message = self.load_account(username)
            if not success:
                return None, message
        
        try:
            client = self.clients[username]
            
            if media_path.lower().endswith(('.jpg', '.jpeg', '.png')):
                media = client.photo_upload_to_story(media_path)
            else:
                media = client.video_upload_to_story(media_path)
            
            logger.info(f"Story uploaded successfully for {username}: {media.id}")
            return str(media.id), "Story uploaded successfully"
        except LoginRequired as e:
            logger.error(f"Login required for story upload {username}: {e}")
            return None, "Session expired - please re-login"
        except RateLimitError as e:
            logger.error(f"Rate limited story upload {username}: {e}")
            return None, "Rate limited - please try again later"
        except Exception as e:
            logger.error(f"Failed to upload story for {username}: {e}")
            return None, f"Upload failed: {str(e)}"
    
    def update_account_stats(self, username: str) -> bool:
        """Update account statistics"""
        if username not in self.clients:
            if not self.load_account(username):
                return False
        
        db = get_db_session()
        
        try:
            client = self.clients[username]
            user_info = client.user_info(client.user_id)
            
            account = db.query(InstagramAccount).filter(InstagramAccount.username == username).first()
            if account:
                account.follower_count = user_info.follower_count
                account.following_count = user_info.following_count
                account.media_count = user_info.media_count
                account.session_data = json.dumps(client.get_settings())
                db.commit()
                return True
        except Exception as e:
            print(f"Failed to update stats for {username}: {e}")
        finally:
            db.close()
        
        return False
    
    def get_account_info(self, username: str) -> Optional[dict]:
        """Get account information from database"""
        db = get_db_session()
        
        try:
            account = db.query(InstagramAccount).filter(InstagramAccount.username == username).first()
            if account:
                return {
                    'username': account.username,
                    'full_name': account.full_name,
                    'bio': account.bio,
                    'follower_count': account.follower_count,
                    'following_count': account.following_count,
                    'media_count': account.media_count,
                    'is_active': account.is_active,
                    'created_at': account.created_at
                }
        except Exception as e:
            print(f"Failed to get info for {username}: {e}")
        finally:
            db.close()
        
        return None
    
    def list_accounts(self) -> List[str]:
        """List all stored account usernames"""
        db = get_db_session()
        
        try:
            accounts = db.query(InstagramAccount).filter(InstagramAccount.is_active == True).all()
            return [account.username for account in accounts]
        except Exception as e:
            print(f"Failed to list accounts: {e}")
            return []
        finally:
            db.close()
    
    def remove_account(self, username: str) -> bool:
        """Remove account (mark as inactive)"""
        db = get_db_session()
        
        try:
            account = db.query(InstagramAccount).filter(InstagramAccount.username == username).first()
            if account:
                account.is_active = False
                db.commit()
                
                if username in self.clients:
                    del self.clients[username]
                
                return True
        except Exception as e:
            print(f"Failed to remove account {username}: {e}")
        finally:
            db.close()
        
        return False