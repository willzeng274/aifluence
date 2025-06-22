from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from database.models import InfluencerMode, VideoStatus, SponsorMatchStatus

class LifestylePlanning(BaseModel):
    """Configuration for AI-driven lifestyle content planning."""
    days_to_plan: int = Field(default=7, ge=7, le=90, description="Number of days for which to generate a content plan.")

class PostingFrequency(BaseModel):
    """Defines the intervals for automated content posting."""

    story_interval_hours: Optional[int] = Field(
        default=24, ge=24, description="Interval in hours for posting new stories."
    )
    reel_interval_hours: Optional[int] = Field(
        default=72, ge=24, description="Interval in hours for posting new reels."
    )


class InfluencerBase(BaseModel):
    name: str
    face_image_url: Optional[str] = None
    persona: Dict[str, Any] = Field(description="Background, goals, tone, etc.")
    life_story: Optional[str] = Field(default=None, description="A long-form narrative of the influencer's life story, backstory, and future.")
    mode: InfluencerMode
    audience_targeting: Optional[Dict[str, Any]] = None
    growth_phase_enabled: bool = True
    growth_intensity: float = Field(default=0.5, ge=0, le=1)
    posting_frequency: Optional[PostingFrequency] = None
    lifestyle_planning: Optional[LifestylePlanning] = None


class InfluencerCreate(InfluencerBase):
    instagram_username: str
    instagram_password: str


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
    posting_frequency: Optional[PostingFrequency] = None
    lifestyle_planning: Optional[LifestylePlanning] = None
    instagram_username: str
    instagram_password: str


class DatedPost(BaseModel):
    """A specific post scheduled for a given date and time."""

    post_datetime: datetime = Field(
        ..., description="The exact date and time for the post."
    )
    content_type: Literal["post", "story", "reel"] = Field(
        default="post", description="The type of content to be created."
    )
    prompt: Optional[str] = Field(
        default=None,
        description="A prompt to guide AI content generation for this post.",
    )


class BulkScheduleRequest(BaseModel):
    """Request to schedule a batch of specific, dated posts."""

    influencer_id: int
    posts: List[DatedPost]


class IntervalScheduleRequest(BaseModel):
    """Request to schedule posts at regular intervals."""

    influencer_id: int
    days_to_schedule: int = Field(
        default=30,
        ge=1,
        description="Number of days into the future to schedule posts.",
    )
    reel_interval_hours: Optional[int] = Field(
        default=48, ge=1, description="Interval in hours for posting new reels."
    )
    story_interval_hours: Optional[int] = Field(
        default=12, ge=1, description="Interval in hours for posting new stories."
    )


class PostType(BaseModel):
    type: Literal["post", "story", "reel"]
    time: str  # "HH:MM AM/PM" format


class VideoGenerationPrompt(BaseModel):
    """The prompt for generating a video, separated into objective description and subjective intention."""

    description: str = Field(
        description="A third-person narrative describing the scene: environment, actions, and dialogue."
    )
    intention: str = Field(
        description="A first-person, internal monologue describing the character's thoughts, feelings, or motivation."
    )


class VideoBase(BaseModel):
    scheduled_time: datetime
    content_type: Literal["post", "story", "reel"] = "post"
    generation_prompt: Optional[VideoGenerationPrompt] = None
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
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: VideoStatus
    performance_metrics: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoGenerationRequest(BaseModel):
    influencer_id: int
    prompt: VideoGenerationPrompt


class ScheduleBase(BaseModel):
    run_at: datetime
    is_active: bool = True


class ScheduleCreate(ScheduleBase):
    video_params: VideoCreate


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


class ImageGenerateRequest(BaseModel):
    prompt: str
