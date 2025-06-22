"""Background task utilities for async processing"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from database.models import get_db_session, Influencer, Video, Schedule
from managers.ai_generator import ai_generator
from managers.scheduler import video_scheduler
from api.schemas import DatedPost

logger = logging.getLogger(__name__)

def process_interval_schedule(
    influencer_id: int, 
    days_to_schedule: int, 
    reel_interval_hours: Optional[int], 
    story_interval_hours: Optional[int]
):
    """
    Generates a schedule of reels and stories at fixed intervals.
    """
    db = get_db_session()
    try:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            logger.error(f"Influencer {influencer_id} not found for interval scheduling.")
            return

        now = datetime.now()
        end_date = now + timedelta(days=days_to_schedule)
        created_count = 0

        schedule_items = []
        if reel_interval_hours:
            current_time = now + timedelta(hours=reel_interval_hours)
            while current_time < end_date:
                schedule_items.append({"time": current_time, "type": "reel"})
                current_time += timedelta(hours=reel_interval_hours)
        
        if story_interval_hours:
            current_time = now + timedelta(hours=story_interval_hours)
            while current_time < end_date:
                schedule_items.append({"time": current_time, "type": "story"})
                current_time += timedelta(hours=story_interval_hours)

        for item in sorted(schedule_items, key=lambda x: x["time"]):
            scheduled_time = item["time"]
            content_type = item["type"]
            
            # Generate a scene prompt using the influencer's persona
            prompt_data = ai_generator.generate_scene_prompt(
                influencer.persona,
                context=f"A short {content_type} about the influencer's daily life or a recent thought."
            )
            
            # The generation_prompt is now the direct output of the AI
            generation_prompt = prompt_data
            
            # Generate a caption from the new prompt data
            caption = ai_generator.generate_caption(prompt_data)
            
            db_video = Video(
                influencer_id=influencer.id,
                scheduled_time=scheduled_time,
                content_type=content_type,
                generation_prompt=generation_prompt,
                caption=caption,
                hashtags=["lifestyle", "aiinfluencer", f"dayinthelife"],
                platform="instagram"
            )
            db.add(db_video)
            db.commit()
            db.refresh(db_video)
            
            db_schedule = Schedule(
                video_id=db_video.id,
                run_at=db_video.scheduled_time,
                is_active=True
            )
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)

            job_id = video_scheduler.schedule_video(
                db_schedule.id,
                db_schedule.run_at
            )
            
            db_schedule.job_id = job_id
            db.commit()
            created_count += 1
        
        logger.info(f"Created {created_count} interval-based scheduled posts for influencer {influencer_id}")
        
    except Exception as e:
        logger.error(f"Error in interval schedule generation: {e}", exc_info=True)
    finally:
        db.close()


def process_dated_schedule(influencer_id: int, posts: List[Dict[str, Any]]):
    """
    Processes a list of specifically dated posts for scheduling.
    """
    db = get_db_session()
    try:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            logger.error(f"Influencer {influencer_id} not found for dated scheduling.")
            return
        
        created_count = 0
        for post_data in posts:
            post = DatedPost.model_validate(post_data)
            
            if post.post_datetime < datetime.now():
                continue
            
            generation_prompt = None
            caption = None
            hashtags = ["aiinfluencer"]
            
            if post.prompt:
                # Generate a scene prompt using the influencer's persona and the specific post prompt
                prompt_data = ai_generator.generate_scene_prompt(
                    influencer.persona,
                    context=post.prompt
                )
                
                # The generation_prompt is now the direct output of the AI
                generation_prompt = prompt_data
                
                # Generate a caption from the new prompt data
                caption = ai_generator.generate_caption(prompt_data)
                hashtags.append(post.content_type)

            db_video = Video(
                influencer_id=influencer_id,
                scheduled_time=post.post_datetime,
                content_type=post.content_type,
                generation_prompt=generation_prompt,
                caption=caption,
                hashtags=hashtags,
                platform="instagram"
            )
            db.add(db_video)
            db.commit()
            db.refresh(db_video)
            
            db_schedule = Schedule(
                video_id=db_video.id,
                run_at=post.post_datetime,
                is_active=True
            )
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)
            
            job_id = video_scheduler.schedule_video(
                db_schedule.id,
                post.post_datetime
            )
            
            db_schedule.job_id = job_id
            db.commit()
            
            created_count += 1
        
        logger.info(f"Created {created_count} dated posts for influencer {influencer_id}")
        
    except Exception as e:
        logger.error(f"Error in dated schedule creation: {e}", exc_info=True)
    finally:
        db.close()