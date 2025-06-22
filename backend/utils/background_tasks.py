"""Background task utilities for async processing"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import random
from database.models import get_db_session, Influencer, Video, Schedule
from managers.ai_generator import ai_generator
from managers.scheduler import video_scheduler
from api.schemas import DatedPost
import json

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
            time_offset = timedelta(minutes=random.randint(-30, 30))
            scheduled_time = item["time"] + time_offset
            content_type = item["type"]
            
            # Generate a scene prompt using the influencer's persona
            prompt_data = ai_generator.generate_scene_prompt(
                influencer,
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
                run_at=scheduled_time,
                is_active=True
            )
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)

            job_id = video_scheduler.schedule_video(
                db_schedule.id,
                scheduled_time
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

            time_offset = timedelta(minutes=random.randint(-30, 30))
            scheduled_time = post.post_datetime + time_offset

            generation_prompt = None
            caption = None
            hashtags = ["aiinfluencer"]
            
            if post.prompt:
                # Generate a scene prompt using the influencer's full profile and the specific post prompt
                prompt_data = ai_generator.generate_scene_prompt(
                    influencer,
                    context=post.prompt
                )
                
                # The generation_prompt is now the direct output of the AI
                generation_prompt = prompt_data
                
                # Generate a caption from the new prompt data
                caption = ai_generator.generate_caption(prompt_data)
                hashtags.append(post.content_type)

            db_video = Video(
                influencer_id=influencer_id,
                scheduled_time=scheduled_time,
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
                run_at=scheduled_time,
                is_active=True
            )
            db.add(db_schedule)
            db.commit()
            db.refresh(db_schedule)
            
            job_id = video_scheduler.schedule_video(
                db_schedule.id,
                scheduled_time
            )
            
            db_schedule.job_id = job_id
            db.commit()
            
            created_count += 1
        
        logger.info(f"Created {created_count} dated posts for influencer {influencer_id}")
        
    except Exception as e:
        logger.error(f"Error in dated schedule creation: {e}", exc_info=True)
    finally:
        db.close()

def plan_and_schedule_from_life_story(influencer_id: int, days_to_plan: int):
    """
    Generates a full content schedule based on an influencer's life story using
    a two-stage, narrative-aware planning process.
    """
    db = get_db_session()
    try:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer or not influencer.life_story:
            logger.warning(f"Cannot schedule from life story for influencer {influencer_id}: No influencer or life story found.")
            return

        reel_plan = ai_generator.generate_reel_content_plan(influencer, days_to_plan)
        
        reel_summary = "\n".join([f"- Day {r['day']}: {r['post_context']}" for r in reel_plan])
        story_plan = ai_generator.generate_story_content_plan(influencer, reel_summary, days_to_plan)
        
        combined_plan = sorted(reel_plan + story_plan, key=lambda x: x['day'])
        
        print("--- Generated Content Plan ---")
        print(json.dumps(combined_plan, indent=2))
        print("--------------------------")

        if not combined_plan:
            logger.error(f"AI failed to generate any content plan for influencer {influencer_id}.")
            return
        
        today = datetime.now()
        created_count = 0

        for item in combined_plan:
            try:
                day_offset = item.get("day", 1) - 1
                post_date = today + timedelta(days=day_offset)
                random_hour = random.randint(9, 21) # Post between 9 AM and 9 PM
                random_minute = random.randint(0, 59)
                scheduled_time = post_date.replace(hour=random_hour, minute=random_minute, second=0, microsecond=0)

                if scheduled_time < datetime.now():
                    continue

                prompt_data = ai_generator.generate_scene_prompt(
                    influencer,
                    context=item.get("post_context", "A moment from their life.")
                )

                caption = ai_generator.generate_caption(prompt_data)

                db_video = Video(
                    influencer_id=influencer.id,
                    scheduled_time=scheduled_time,
                    content_type=item.get("content_type", "reel"),
                    generation_prompt=prompt_data,
                    caption=caption,
                    hashtags=["aiinfluencer", "lifestory"],
                    platform="instagram"
                )
                db.add(db_video)
                db.commit()
                db.refresh(db_video)

                db_schedule = Schedule(video_id=db_video.id, run_at=scheduled_time, is_active=True)
                db.add(db_schedule)
                db.commit()

                created_count += 1
            except (ValueError, KeyError) as e:
                logger.error(f"Skipping malformed content plan item for influencer {influencer_id}: {item}. Error: {e}")
                continue

        logger.info(f"Generated {created_count} scheduled posts from the life story for influencer {influencer_id}.")

    except Exception as e:
        logger.error(f"Error in life story scheduling for influencer {influencer_id}: {e}", exc_info=True)
    finally:
        db.close()