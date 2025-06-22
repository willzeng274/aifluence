from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, time
from database.models import InfluencerMode, VideoStatus, SponsorMatchStatus

class InfluencerBase(BaseModel):
    name: str
    face_image_url: Optional[str] = None
    persona: Dict[str, Any] = Field(description="Background, goals, tone, etc.")
    mode: InfluencerMode
    audience_targeting: Optional[Dict[str, Any]] = None
    growth_phase_enabled: bool = True
    growth_intensity: float = Field(default=0.5, ge=0, le=1)
    posting_frequency: Optional[Dict[str, Any]] = None

class InfluencerCreate(InfluencerBase):
    instagram_username: Optional[str] = None
    instagram_password: Optional[str] = None

class Influencer(InfluencerBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OnboardingWizardRequest(BaseModel):
    mode: InfluencerMode
    name: str
    face_image_url: Optional[str] = None
    background_info: str
    goals: List[str]
    tone: str
    audience_age_range: Optional[List[int]] = None
    audience_gender: Optional[str] = None
    audience_interests: Optional[List[str]] = None
    audience_region: Optional[str] = None
    growth_phase_enabled: bool = True
    growth_intensity: float = Field(default=0.5, ge=0, le=1)
    posting_frequency: Optional[Dict[str, Any]] = None
    instagram_username: Optional[str] = None
    instagram_password: Optional[str] = None

class PostType(BaseModel):
    type: Literal["post", "story", "reel"]
    time: str  # "HH:MM AM/PM" format
    
class DailySchedule(BaseModel):
    """Schedule for posts on specific days"""
    posts: List[PostType]

class VideoBase(BaseModel):
    scheduled_time: datetime
    content_type: Literal["post", "story", "reel"] = "post"
    script: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[List[str]] = None
    platform: str = "instagram"

class VideoCreate(VideoBase):
    influencer_id: int
    sponsor_id: Optional[int] = None

class Video(VideoBase):
    id: int
    influencer_id: int
    sponsor_id: Optional[int] = None
    storyboard: Optional[Dict[str, Any]] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: VideoStatus
    performance_metrics: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SchedulePattern(BaseModel):
    """Weekly schedule pattern"""
    monday: Optional[DailySchedule] = None
    tuesday: Optional[DailySchedule] = None
    wednesday: Optional[DailySchedule] = None
    thursday: Optional[DailySchedule] = None
    friday: Optional[DailySchedule] = None
    saturday: Optional[DailySchedule] = None
    sunday: Optional[DailySchedule] = None

class ScheduleBase(BaseModel):
    run_at: datetime
    is_active: bool = True

class ScheduleCreate(ScheduleBase):
    video_params: VideoCreate
    
class BulkScheduleCreate(BaseModel):
    """Create schedule from pattern"""
    influencer_id: int
    schedule_pattern: SchedulePattern
    start_date: datetime
    end_date: datetime

class Schedule(ScheduleBase):
    id: int
    video_id: int
    job_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SponsorBase(BaseModel):
    company_name: str
    brand_logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    targeting_tags: Optional[List[str]] = None
    product_info: Optional[Dict[str, Any]] = None
    campaign_details: Optional[Dict[str, Any]] = None

class SponsorCreate(SponsorBase):
    pass

class Sponsor(SponsorBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SponsorMatchBase(BaseModel):
    influencer_id: int
    sponsor_id: int
    proposal_details: Optional[Dict[str, Any]] = None

class SponsorMatchCreate(SponsorMatchBase):
    pass

class SponsorMatch(SponsorMatchBase):
    id: int
    status: SponsorMatchStatus
    match_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LifestyleGenerateRequest(BaseModel):
    influencer_id: int
    days: int = Field(default=30, ge=1, le=90)
    activities: Optional[List[str]] = None
    intensity: float = Field(default=0.5, ge=0, le=1)