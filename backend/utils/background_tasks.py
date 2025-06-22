"""Background task utilities for async processing"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging
from database.models import get_db_session, Influencer, Video, Schedule
from managers.ai_generator import ai_generator
from managers.scheduler import video_scheduler

logger = logging.getLogger(__name__)

def process_lifestyle_generation(influencer_id: int, days: int, intensity: float):
    """Generate lifestyle timeline in background"""
    db = get_db_session()
    try:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            logger.error(f"Influencer {influencer_id} not found")
            return
        
        # Generate timeline
        timeline = ai_generator.generate_lifestyle_timeline(
            influencer.persona,
            days,
            intensity
        )
        
        # Create videos and schedules
        created_count = 0
        for entry in timeline:
            # Generate script
            script_data = ai_generator.generate_script(
                influencer.persona,
                entry["context"],
                entry.get("sponsor_info")
            )
            
            # Determine content type based on activity
            content_type = "story" if "morning" in entry["activity"].lower() else "post"
            
            # Create video
            db_video = Video(
                influencer_id=influencer.id,
                scheduled_time=datetime.fromisoformat(entry["scheduled_time"]),
                content_type=content_type,
                script=script_data["full_script"],
                caption=ai_generator.generate_caption(script_data),
                hashtags=["lifestyle", "aiinfluencer", entry["activity"].replace(" ", "")],
                platform="instagram"
            )
            db.add(db_video)
            db.commit()
            db.refresh(db_video)
            
            # Create schedule
            db_schedule = Schedule(
                video_id=db_video.id,
                run_at=db_video.scheduled_time,
                is_active=True
            )
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)
            
            # Add to scheduler
            job_id = video_scheduler.schedule_video(
                db_schedule.id,
                db_schedule.run_at
            )
            
            db_schedule.job_id = job_id
            db.commit()
            
            created_count += 1
        
        logger.info(f"Created {created_count} scheduled posts for influencer {influencer_id}")
        
    except Exception as e:
        logger.error(f"Error in lifestyle generation: {e}")
    finally:
        db.close()

def process_bulk_schedule(influencer_id: int, schedule_pattern: Dict[str, Any], start_date: datetime, end_date: datetime):
    """Process bulk schedule creation from pattern"""
    db = get_db_session()
    try:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            logger.error(f"Influencer {influencer_id} not found")
            return
        
        created_count = 0
        current_date = start_date.date()
        
        while current_date <= end_date.date():
            # Get day name
            day_name = current_date.strftime("%A").lower()
            day_schedule = schedule_pattern.get(day_name)
            
            if day_schedule and day_schedule.get("posts"):
                for post in day_schedule["posts"]:
                    # Parse time (format: "9:15 AM")
                    time_parts = post["time"].replace(" ", "").upper()
                    if "PM" in time_parts and not time_parts.startswith("12"):
                        hour = int(time_parts.split(":")[0]) + 12
                    else:
                        hour = int(time_parts.split(":")[0])
                    minute = int(time_parts.split(":")[1][:2])
                    
                    scheduled_time = datetime.combine(current_date, datetime.min.time()).replace(hour=hour, minute=minute)
                    
                    # Skip if in the past
                    if scheduled_time < datetime.now():
                        continue
                    
                    # Create video
                    db_video = Video(
                        influencer_id=influencer_id,
                        scheduled_time=scheduled_time,
                        content_type=post["type"],
                        platform="instagram"
                    )
                    db.add(db_video)
                    db.commit()
                    db.refresh(db_video)
                    
                    # Create schedule
                    db_schedule = Schedule(
                        video_id=db_video.id,
                        run_at=scheduled_time,
                        is_active=True
                    )
                    db.add(db_schedule)
                    db.commit()
                    db.refresh(db_schedule)
                    
                    # Add to scheduler
                    job_id = video_scheduler.schedule_video(
                        db_schedule.id,
                        scheduled_time
                    )
                    
                    db_schedule.job_id = job_id
                    db.commit()
                    
                    created_count += 1
            
            # Move to next day
            current_date += timedelta(days=1)
        
        logger.info(f"Created {created_count} scheduled posts from pattern for influencer {influencer_id}")
        
    except Exception as e:
        logger.error(f"Error in bulk schedule creation: {e}")
    finally:
        db.close()