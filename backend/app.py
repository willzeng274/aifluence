from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional
import threading

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.models import get_db, Influencer, Video, Schedule, Sponsor, SponsorMatch, VideoStatus
from api import schemas
from managers.instagram_manager import InstagramManager
from managers.scheduler import video_scheduler
from managers.ai_generator import ai_generator
from utils.background_tasks import process_lifestyle_generation, process_bulk_schedule

app = FastAPI(title="AI Influencer Manager API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ig_manager = InstagramManager()

STORAGE_DIR = Path("storage/files")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/sorcerer/init", response_model=schemas.Influencer)
def create_influencer_wizard(
    wizard_data: schemas.OnboardingWizardRequest,
    db: Session = Depends(get_db)
):
    print(wizard_data)
    
    """Create influencer through onboarding wizard"""
    persona = {
        "background": wizard_data.background_info,
        "goals": wizard_data.goals,
        "tone": wizard_data.tone
    }
    
    audience_targeting = {
        "age_range": wizard_data.audience_age_range,
        "gender": wizard_data.audience_gender,
        "interests": wizard_data.audience_interests,
        "region": wizard_data.audience_region
    }
    
    db_influencer = Influencer(
        name=wizard_data.name,
        face_image_url=wizard_data.face_image_url,
        persona=persona,
        mode=wizard_data.mode,
        audience_targeting=audience_targeting,
        growth_phase_enabled=wizard_data.growth_phase_enabled,
        growth_intensity=wizard_data.growth_intensity,
        posting_frequency=wizard_data.posting_frequency
    )
    db.add(db_influencer)
    db.commit()
    db.refresh(db_influencer)
    
    if wizard_data.instagram_username and wizard_data.instagram_password:
        success, message = ig_manager.add_account(
            wizard_data.instagram_username, 
            wizard_data.instagram_password
        )
        if success:
            from database.models import InstagramAccount
            ig_account = db.query(InstagramAccount).filter(
                InstagramAccount.username == wizard_data.instagram_username
            ).first()
            if ig_account:
                ig_account.influencer_id = db_influencer.id
                db.commit()
    
    return db_influencer

@app.get("/influencers", response_model=List[schemas.Influencer])
def list_influencers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List user's influencers"""
    influencers = db.query(Influencer).offset(skip).limit(limit).all()
    return influencers

@app.get("/influencer/{influencer_id}", response_model=schemas.Influencer)
def get_influencer(
    influencer_id: int,
    db: Session = Depends(get_db)
):
    """Get specific influencer details"""
    influencer = db.query(Influencer).filter(
        Influencer.id == influencer_id
    ).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return influencer

@app.get("/influencer/{influencer_id}/videos")
def get_influencer_videos(
    influencer_id: int,
    include_past: bool = False,
    db: Session = Depends(get_db)
):
    """Get all scheduled videos for an influencer"""
    influencer = db.query(Influencer).filter(
        Influencer.id == influencer_id
    ).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    # Query videos with their schedules
    query = db.query(Video, Schedule).join(
        Schedule, Video.id == Schedule.video_id
    ).filter(
        Video.influencer_id == influencer_id
    ).order_by(Schedule.run_at)
    
    if not include_past:
        query = query.filter(Schedule.run_at >= datetime.now())
    
    results = query.all()
    
    videos_data = []
    for video, schedule in results:
        videos_data.append({
            "video_id": video.id,
            "schedule_id": schedule.id,
            "scheduled_time": schedule.run_at.isoformat(),
            "content_type": video.content_type,
            "status": video.status.value,
            "caption": video.caption,
            "hashtags": video.hashtags,
            "is_active": schedule.is_active,
            "has_sponsor": video.sponsor_id is not None
        })
    
    return {
        "influencer_id": influencer_id,
        "influencer_name": influencer.name,
        "total_scheduled": len(videos_data),
        "videos": videos_data
    }

@app.post("/schedule", response_model=schemas.Schedule)
def schedule_video(
    schedule_data: schemas.ScheduleCreate,
    db: Session = Depends(get_db)
):
    """Schedule a video for an influencer"""
    influencer = db.query(Influencer).filter(
        Influencer.id == schedule_data.video_params.influencer_id
    ).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    db_video = Video(
        influencer_id=schedule_data.video_params.influencer_id,
        sponsor_id=schedule_data.video_params.sponsor_id,
        scheduled_time=schedule_data.video_params.scheduled_time,
        script=schedule_data.video_params.script,
        caption=schedule_data.video_params.caption,
        hashtags=schedule_data.video_params.hashtags,
        platform=schedule_data.video_params.platform
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    
    db_schedule = Schedule(
        video_id=db_video.id,
        run_at=schedule_data.run_at,
        recurrence_rule=schedule_data.recurrence_rule,
        is_active=schedule_data.is_active
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)

    job_id = video_scheduler.schedule_video(
        db_schedule.id,
        db_schedule.run_at,
        db_schedule.recurrence_rule
    )
    
    db_schedule.job_id = job_id
    db.commit()
    
    return db_schedule

@app.post("/generate/lifestyle")
def generate_lifestyle_schedule(
    request: schemas.LifestyleGenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate AI lifestyle schedule for influencer (async)"""
    influencer = db.query(Influencer).filter(
        Influencer.id == request.influencer_id
    ).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    background_tasks.add_task(
        process_lifestyle_generation,
        request.influencer_id,
        request.days,
        request.intensity
    )
    
    return {
        "message": "Lifestyle timeline generation started",
        "influencer_id": influencer.id,
        "days": request.days,
        "status": "processing"
    }

@app.post("/create")
def trigger_video_generation(
    video_id: int,
    db: Session = Depends(get_db)
):
    """Trigger video generation pipeline"""
    video = db.query(Video).filter(
        Video.id == video_id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not video.script:
        influencer = db.query(Influencer).filter(Influencer.id == video.influencer_id).first()
        script_data = ai_generator.generate_script(influencer.persona)
        video.script = script_data["full_script"]
        video.caption = ai_generator.generate_caption(script_data)
    
    storyboard = ai_generator.generate_storyboard(
        {"full_script": video.script}
    )
    video.storyboard = storyboard
    
    video.status = VideoStatus.PROCESSING
    db.commit()

    video.video_url = f"/files/generated_video_{video.id}.mp4"
    video.thumbnail_url = f"/files/thumbnail_{video.id}.jpg"
    video.status = VideoStatus.POSTED
    db.commit()
    
    return {
        "video_id": video.id,
        "status": video.status.value,
        "video_url": video.video_url,
        "thumbnail_url": video.thumbnail_url
    }

@app.post("/sponsors", response_model=schemas.Sponsor)
def create_sponsor(
    sponsor: schemas.SponsorCreate,
    db: Session = Depends(get_db)
):
    """Create a new sponsor"""
    db_sponsor = Sponsor(
        **sponsor.model_dump()
    )
    db.add(db_sponsor)
    db.commit()
    db.refresh(db_sponsor)
    return db_sponsor

@app.post("/sponsor/match")
def match_sponsor_influencer(
    match_data: schemas.SponsorMatchCreate,
    db: Session = Depends(get_db)
):
    """Create sponsor-influencer match"""
    influencer = db.query(Influencer).filter(
        Influencer.id == match_data.influencer_id
    ).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    sponsor = db.query(Sponsor).filter(Sponsor.id == match_data.sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    match_score = 0.5
    if sponsor.targeting_tags and influencer.audience_targeting:
        if influencer.audience_targeting.get("interests"):
            common_interests = set(sponsor.targeting_tags) & set(influencer.audience_targeting["interests"])
            match_score += len(common_interests) * 0.1
    
    db_match = SponsorMatch(
        influencer_id=match_data.influencer_id,
        sponsor_id=match_data.sponsor_id,
        match_score=min(match_score, 1.0),
        proposal_details=match_data.proposal_details
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    return {
        "match_id": db_match.id,
        "match_score": db_match.match_score,
        "status": db_match.status.value
    }

@app.post("/video/{video_id}/add-sponsor")
def add_sponsor_to_video(
    video_id: int,
    sponsor_id: int,
    db: Session = Depends(get_db)
):
    """Add sponsor to existing video"""
    video = db.query(Video).filter(
        Video.id == video_id
    ).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    video.sponsor_id = sponsor_id
    
    if video.status == VideoStatus.PENDING:
        influencer = db.query(Influencer).filter(Influencer.id == video.influencer_id).first()
        script_data = ai_generator.generate_script(
            influencer.persona,
            sponsor_info={
                "company_name": sponsor.company_name,
                "product_info": sponsor.product_info
            }
        )
        video.script = script_data["full_script"]
        video.caption = ai_generator.generate_caption(script_data)
    
    db.commit()
    
    return {
        "video_id": video.id,
        "sponsor_id": sponsor.id,
        "updated": True
    }

@app.post("/schedule/bulk")
def create_bulk_schedule(
    request: schemas.BulkScheduleCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create bulk schedule from weekly pattern"""
    influencer = db.query(Influencer).filter(
        Influencer.id == request.influencer_id
    ).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    background_tasks.add_task(
        process_bulk_schedule,
        request.influencer_id,
        request.schedule_pattern.model_dump(),
        request.start_date,
        request.end_date
    )
    
    return {
        "message": "Bulk schedule creation started",
        "influencer_id": influencer.id,
        "start_date": request.start_date.isoformat(),
        "end_date": request.end_date.isoformat(),
        "status": "processing"
    }

@app.post("/accounts")
def create_account(
    username: str,
    password: str,
    influencer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Add Instagram account to influencer"""
    success, message = ig_manager.add_account(username, password)
    if not success:
        raise HTTPException(status_code=400, detail=message)

    if influencer_id:
        from database.models import InstagramAccount
        influencer = db.query(Influencer).filter(
            Influencer.id == influencer_id
        ).first()
        if influencer:
            ig_account = db.query(InstagramAccount).filter(
                InstagramAccount.username == username
            ).first()
            if ig_account:
                ig_account.influencer_id = influencer_id
                db.commit()
    
    return {"success": True, "username": username, "message": message}

@app.get("/")
def root():
    return {
        "name": "AI Influencer Manager API",
        "version": "2.0.0",
        "features": [
            "AI influencer persona management",
            "Automated content scheduling",
            "AI-powered script and lifestyle generation",
            "Sponsor management and matching",
            "Instagram integration"
        ],
        "endpoints": {
            "influencer": ["/sorcerer/init", "/influencers", "/influencer/{id}"],
            "scheduling": ["/schedule", "/generate/lifestyle", "/create"],
            "sponsors": ["/sponsors", "/sponsor/match", "/video/{id}/add-sponsor"],
            "legacy": ["/accounts", "/upload/*", "/analytics/*"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)