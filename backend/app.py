from datetime import datetime, timedelta
from pathlib import Path
from typing import List
import os
import uuid
from dotenv import load_dotenv
import asyncio

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from google import genai

from database.models import get_db, Influencer, Video, Schedule, Sponsor, SponsorMatch, VideoStatus, InfluencerMode
from api import schemas
from managers.instagram_manager import InstagramManager
from managers.scheduler import video_scheduler
from managers.ai_generator import ai_generator
from utils.background_tasks import process_interval_schedule, process_dated_schedule, plan_and_schedule_from_life_story

load_dotenv()

app = FastAPI(title="AI Influencer Manager API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/storage", StaticFiles(directory="storage"), name="storage")

ig_manager = InstagramManager()

STORAGE_DIR = Path("storage/files")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/sorcerer/init", response_model=schemas.Influencer)
def create_influencer_wizard(
    wizard_data: schemas.OnboardingWizardRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    print(wizard_data)

    """Create influencer through onboarding wizard"""
    persona = {
        "background": wizard_data.background_info,
        "goals": wizard_data.goals,
        "tone": wizard_data.tone,
    }
    
    life_story = None
    if wizard_data.mode == InfluencerMode.LIFESTYLE:
        life_story = ai_generator.generate_life_story(wizard_data.name, persona)

    audience_targeting = {
        "age_range": wizard_data.audience_age_range,
        "gender": wizard_data.audience_gender,
        "interests": wizard_data.audience_interests,
        "region": wizard_data.audience_region,
    }

    db_influencer = Influencer(
        name=wizard_data.name,
        face_image_url=wizard_data.face_image_url,
        persona=persona,
        life_story=life_story,
        mode=wizard_data.mode,
        audience_targeting=audience_targeting,
        growth_phase_enabled=wizard_data.growth_phase_enabled,
        growth_intensity=wizard_data.growth_intensity,
        posting_frequency=(
            wizard_data.posting_frequency.model_dump()
            if wizard_data.posting_frequency
            else None
        ),
    )
    db.add(db_influencer)
    db.commit()
    db.refresh(db_influencer)

    success, _message = ig_manager.add_account(
        wizard_data.instagram_username,
        wizard_data.instagram_password,
        db_influencer.id
    )
    if not success:
        print(f"Warning: Could not link Instagram account for {wizard_data.name}. Error: {_message}")
    
    if wizard_data.posting_frequency and wizard_data.mode == InfluencerMode.COMPANY:
        background_tasks.add_task(
            process_interval_schedule,
            db_influencer.id,
            7,  # 7 days
            wizard_data.posting_frequency.reel_interval_hours,
            wizard_data.posting_frequency.story_interval_hours,
        )
    elif wizard_data.mode == InfluencerMode.LIFESTYLE:
        days_to_plan = wizard_data.lifestyle_planning.days_to_plan if wizard_data.lifestyle_planning else 30 # for now
        background_tasks.add_task(
            plan_and_schedule_from_life_story,
            db_influencer.id,
            days_to_plan=days_to_plan
        )
    
    return db_influencer


@app.get("/influencers", response_model=List[schemas.Influencer])
def list_influencers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List user's influencers"""
    influencers = db.query(Influencer).offset(skip).limit(limit).all()
    return influencers


@app.get("/influencer/{influencer_id}", response_model=schemas.Influencer)
def get_influencer(influencer_id: int, db: Session = Depends(get_db)):
    """Get specific influencer details"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return influencer


@app.get("/influencer/{influencer_id}/videos")
def get_influencer_videos(
    influencer_id: int, include_past: bool = False, db: Session = Depends(get_db)
):
    """Get all scheduled videos for an influencer"""
    influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")

    query = (
        db.query(Video, Schedule)
        .join(Schedule, Video.id == Schedule.video_id)
        .filter(Video.influencer_id == influencer_id)
        .order_by(Schedule.run_at)
    )

    if not include_past:
        query = query.filter(Schedule.run_at >= datetime.now())

    results = query.all()

    videos_data = []
    for video, schedule in results:
        videos_data.append(
            {
                "video_id": video.id,
                "schedule_id": schedule.id,
                "scheduled_time": schedule.run_at.isoformat(),
                "content_type": video.content_type,
                "status": video.status.value,
                "caption": video.caption,
                "hashtags": video.hashtags,
                "is_active": schedule.is_active,
                "has_sponsor": video.sponsor_id is not None,
            }
        )

    return {
        "influencer_id": influencer_id,
        "influencer_name": influencer.name,
        "total_scheduled": len(videos_data),
        "videos": videos_data,
    }


@app.post("/schedule", response_model=schemas.Schedule)
def schedule_video(
    schedule_data: schemas.ScheduleCreate, db: Session = Depends(get_db)
):
    """Schedule a video for an influencer"""
    influencer = (
        db.query(Influencer)
        .filter(Influencer.id == schedule_data.video_params.influencer_id)
        .first()
    )
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")

    db_video = Video(
        influencer_id=schedule_data.video_params.influencer_id,
        sponsor_id=schedule_data.video_params.sponsor_id,
        scheduled_time=schedule_data.video_params.scheduled_time,
        generation_prompt=(
            schedule_data.video_params.generation_prompt.model_dump()
            if schedule_data.video_params.generation_prompt
            else None
        ),
        content_type=schedule_data.video_params.content_type,
        caption=schedule_data.video_params.caption,
        hashtags=schedule_data.video_params.hashtags,
        platform=schedule_data.video_params.platform,
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)

    db_schedule = Schedule(
        video_id=db_video.id,
        run_at=schedule_data.run_at,
        is_active=schedule_data.is_active,
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)

    job_id = video_scheduler.schedule_video(db_schedule.id, db_schedule.run_at)

    db_schedule.job_id = job_id
    db.commit()

    return db_schedule


# For company mode
@app.post("/schedule/interval")
def schedule_at_intervals(
    request: schemas.IntervalScheduleRequest, background_tasks: BackgroundTasks
):
    """
    Schedules posts (reels, stories) at regular intervals for a set number of days.
    """
    background_tasks.add_task(
        process_interval_schedule,
        request.influencer_id,
        request.days_to_schedule,
        request.reel_interval_hours,
        request.story_interval_hours,
    )

    return {
        "message": "Interval-based scheduling has started.",
        "influencer_id": request.influencer_id,
        "days_to_schedule": request.days_to_schedule,
        "status": "processing",
    }


@app.post("/schedule/bulk")
def create_bulk_dated_schedule(
    request: schemas.BulkScheduleRequest, background_tasks: BackgroundTasks
):
    """Schedules a batch of posts on specific dates and times."""
    background_tasks.add_task(
        process_dated_schedule,
        request.influencer_id,
        [post.model_dump() for post in request.posts],
    )

    return {
        "message": "Bulk dated schedule creation started.",
        "influencer_id": request.influencer_id,
        "posts_count": len(request.posts),
        "status": "processing",
    }


@app.post("/video/generate", response_model=schemas.Video)
def generate_video_from_prompt(
    request: schemas.VideoGenerationRequest, db: Session = Depends(get_db)
):
    """
    Creates a video entry from a detailed prompt. This is the first step in the video generation pipeline.
    The actual video file generation is TBD and will be handled by a separate process.
    """
    influencer = (
        db.query(Influencer).filter(Influencer.id == request.influencer_id).first()
    )
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")

    db_video = Video(
        influencer_id=request.influencer_id,
        scheduled_time=datetime.now() + timedelta(hours=1),
        generation_prompt=request.prompt.model_dump(),
        status=VideoStatus.PENDING,
        content_type="reel",
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)

    # Here you would trigger the actual video generation pipeline
    # For now, we just return the created video object

    return db_video


@app.post("/create")
def trigger_video_generation(video_id: int, db: Session = Depends(get_db)):
    """Trigger video generation pipeline"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # The script and storyboard generation is now part of the video generation pipeline,
    # triggered by the /video/generate endpoint. This endpoint is now simplified.
    # It could be used to re-process a video or for other purposes.

    video.status = VideoStatus.PROCESSING
    db.commit()

    video.video_url = f"/files/generated_video_{video.id}.mp4"
    video.status = VideoStatus.POSTED
    db.commit()

    return {
        "video_id": video.id,
        "status": video.status.value,
        "video_url": video.video_url,
    }


@app.post("/sponsors", response_model=schemas.Sponsor)
def create_sponsor(sponsor: schemas.SponsorCreate, db: Session = Depends(get_db)):
    """Create a new sponsor"""
    db_sponsor = Sponsor(**sponsor.model_dump())
    db.add(db_sponsor)
    db.commit()
    db.refresh(db_sponsor)
    return db_sponsor


@app.post("/sponsor/match")
def match_sponsor_influencer(
    match_data: schemas.SponsorMatchCreate, db: Session = Depends(get_db)
):
    """Create sponsor-influencer match"""
    influencer = (
        db.query(Influencer).filter(Influencer.id == match_data.influencer_id).first()
    )
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")

    sponsor = db.query(Sponsor).filter(Sponsor.id == match_data.sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    match_score = 0.5
    if sponsor.targeting_tags and influencer.audience_targeting:
        if influencer.audience_targeting.get("interests"):
            common_interests = set(sponsor.targeting_tags) & set(
                influencer.audience_targeting["interests"]
            )
            match_score += len(common_interests) * 0.1

    db_match = SponsorMatch(
        influencer_id=match_data.influencer_id,
        sponsor_id=match_data.sponsor_id,
        match_score=min(match_score, 1.0),
        proposal_details=match_data.proposal_details,
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    return {
        "match_id": db_match.id,
        "match_score": db_match.match_score,
        "status": db_match.status.value,
    }


@app.post("/video/{video_id}/add-sponsor")
def add_sponsor_to_video(video_id: int, sponsor_id: int, db: Session = Depends(get_db)):
    """Add sponsor to existing video"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    video.sponsor_id = sponsor_id

    db.commit()

    return {"video_id": video.id, "sponsor_id": sponsor.id, "updated": True}


@app.post("/generate-image")
async def generate_image(
    request: schemas.ImageGenerateRequest,
):
    """Generate image using Gemini Image Generation"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    client = genai.Client(api_key=api_key)

    max_retries = 3
    for attempt in range(max_retries):
        try:
            storage_path = Path("storage/images")
            storage_path.mkdir(parents=True, exist_ok=True)

            response = await client.aio.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=request.prompt,
                config=genai.types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"]
                ),
            )

            if (
                response.candidates
                and response.candidates[0].content
                and response.candidates[0].content.parts
            ):
                for part in response.candidates[0].content.parts:
                    if part.inline_data:
                        image_data = part.inline_data.data
                        mime_type = part.inline_data.mime_type

                        ext = mime_type.split("/")[-1]
                        if ext == "jpeg":
                            ext = "jpg"

                        filename = f"generated_{uuid.uuid4().hex}.{ext}"
                        filepath = storage_path / filename

                        with open(filepath, "wb") as f:
                            f.write(image_data)

                        return {"path": f"/storage/images/{filename}"}
            error_message = "Model did not return an image."
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                error_message = f"Image generation blocked. Reason: {response.prompt_feedback.block_reason.name}"
            elif hasattr(response, "text") and response.text:
                error_message += f" Response text: {response.text}"

            break
        except Exception as e:
            error_details = str(e)
            print(f"Attempt {attempt + 1} failed: {error_details}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
                continue
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Image generation failed after {max_retries} attempts: {error_details}",
                )

    raise HTTPException(status_code=500, detail=error_message)


# @app.post("/accounts")
# def create_account(
#     username: str,
#     password: str,
#     influencer_id: Optional[int] = None,
#     db: Session = Depends(get_db)
# ):
#     """Add Instagram account to influencer"""
#     success, message = ig_manager.add_account(username, password)
#     if not success:
#         raise HTTPException(status_code=400, detail=message)

#     if influencer_id:
#         from database.models import InstagramAccount
#         influencer = db.query(Influencer).filter(
#             Influencer.id == influencer_id
#         ).first()
#         if influencer:
#             ig_account = db.query(InstagramAccount).filter(
#                 InstagramAccount.username == username
#             ).first()
#             if ig_account:
#                 ig_account.influencer_id = influencer_id
#                 db.commit()

#     return {"success": True, "username": username, "message": message}


@app.get("/")
def root():
    return {
        "name": "AIfluence API",
        "version": "1.0.0",
        "endpoints": {
            "influencer": ["/sorcerer/init", "/influencers", "/influencer/{id}"],
            "scheduling": ["/schedule", "/schedule/interval", "/schedule/bulk"],
            "video_generation": ["/video/generate"],
            "sponsors": ["/sponsors", "/sponsor/match", "/video/{id}/add-sponsor"],
            "image generation": ["/generate-image"],
            # "legacy": ["/accounts", "/upload/*", "/analytics/*"],
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
