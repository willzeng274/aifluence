from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime
import logging
from database.models import Schedule, Video, VideoStatus, get_db_session

logger = logging.getLogger(__name__)

class VideoScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        logger.info("Video scheduler initialized and started")

    def schedule_video(self, schedule_id: int, run_at: datetime) -> str:
        """Schedule a video for processing at a specific time."""
        job_id = f"video_schedule_{schedule_id}"
        
        trigger = DateTrigger(run_date=run_at)
        
        job = self.scheduler.add_job(
            func=self.process_scheduled_video,
            trigger=trigger,
            args=[schedule_id],
            id=job_id,
            replace_existing=True
        )
        
        logger.info(f"Scheduled video job {job_id} at {run_at}")
        return job_id

    def process_scheduled_video(self, schedule_id: int):
        """Process a scheduled video when its time comes."""
        db = get_db_session()
        try:
            schedule = db.query(Schedule).filter(Schedule.id == schedule_id).first()
            if not schedule or not schedule.is_active:
                logger.warning(f"Schedule {schedule_id} not found or inactive")
                return
            
            video = db.query(Video).filter(Video.id == schedule.video_id).first()
            if not video:
                logger.error(f"Video {schedule.video_id} not found for schedule {schedule_id}")
                return
            
            if video.status != VideoStatus.PENDING:
                logger.warning(f"Video {video.id} is not in pending status, skipping")
                return
            
            video.status = VideoStatus.PROCESSING
            db.commit()
            
            logger.info(f"Processing video {video.id} for schedule {schedule_id}")
            
            # Simulate processing (in real implementation, this would be async)
            # video_url = generate_video(video)
            # social_api.post(video)
            
            video.status = VideoStatus.POSTED
            db.commit()
            
            logger.info(f"Successfully processed video {video.id}")
                    
        except Exception as e:
            logger.error(f"Error processing scheduled video: {e}")
            if video:
                video.status = VideoStatus.FAILED
                db.commit()
        finally:
            db.close()

    def cancel_schedule(self, job_id: str):
        """Cancel a scheduled job."""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Cancelled job {job_id}")
        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {e}")

    def shutdown(self):
        """Shutdown the scheduler."""
        self.scheduler.shutdown()
        logger.info("Video scheduler shutdown")

video_scheduler = VideoScheduler()