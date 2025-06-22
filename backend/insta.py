import os
from pathlib import Path
from instagrapi import Client
from dotenv import load_dotenv

load_dotenv()

def post_image_to_instagram():
    """Post an image to Instagram using instagrapi"""
    
    cl = Client()
    
    username = ""
    password = ""
    
    if not username or not password:
        print("Instagram credentials not found in environment variables")
        return False
    
    try:
        cl.login(username, password)
        print(f"Successfully logged in as {username}")
        
        image_path = Path("storage/images/generated_e942cabad94a40ff9176d3b8bf43d011.png")
        
        if not image_path.exists():
            print(f"Image not found at {image_path}")
            return False
        
        media = cl.photo_upload(
            path=str(image_path),
            caption="Check out this AI-generated content! 🤖✨ #AI #Generated #Content"
        )
        
        print(f"Successfully posted image! Media ID: {media.pk}")
        return True
        
    except Exception as e:
        print(f"Error posting to Instagram: {e}")
        return False
    
    finally:
        try:
            cl.logout()
        except:
            pass

if __name__ == "__main__":
    post_image_to_instagram()
