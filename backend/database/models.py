from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON,
    Float,
    Enum,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import enum

Base = declarative_base()


class InfluencerMode(enum.Enum):
    LIFESTYLE = "lifestyle"
    COMPANY = "company"


class VideoStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    POSTED = "posted"
    FAILED = "failed"


class SponsorMatchStatus(enum.Enum):
    PENDING = "pending"
    MATCHED = "matched"
    DECLINED = "declined"


class Influencer(Base):
    __tablename__ = "influencers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    face_image_url = Column(String(500), nullable=True)
    persona = Column(JSON, nullable=False)
    life_story = Column(Text, nullable=True)
    mode = Column(Enum(InfluencerMode), nullable=False)
    audience_targeting = Column(JSON, nullable=True)
    growth_phase_enabled = Column(Boolean, default=True)
    growth_intensity = Column(Float, default=0.5)
    posting_frequency = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    instagram_accounts = relationship("InstagramAccount", back_populates="influencer")
    videos = relationship("Video", back_populates="influencer")
    sponsor_matches = relationship("SponsorMatch", back_populates="influencer")


class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"

    id = Column(Integer, primary_key=True, index=True)
    influencer_id = Column(Integer, ForeignKey("influencers.id"), nullable=False)
    username = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    instagram_user_id = Column(String(50), nullable=True)
    full_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    media_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    session_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    influencer = relationship("Influencer", back_populates="instagram_accounts")


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    influencer_id = Column(Integer, ForeignKey("influencers.id"), nullable=False)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=True)
    scheduled_time = Column(DateTime, nullable=False)
    content_type = Column(String(20), default="post")  # post, story, reel
    generation_prompt = Column(JSON, nullable=True)
    video_url = Column(String(500), nullable=True)
    caption = Column(Text, nullable=True)
    hashtags = Column(JSON, nullable=True)
    platform = Column(String(50), default="instagram")
    status = Column(Enum(VideoStatus), default=VideoStatus.PENDING)
    performance_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    influencer = relationship("Influencer", back_populates="videos")
    sponsor = relationship("Sponsor", back_populates="videos")
    schedules = relationship("Schedule", back_populates="video")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    run_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    job_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    video = relationship("Video", back_populates="schedules")


class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    brand_logo_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    targeting_tags = Column(JSON, nullable=True)
    product_info = Column(JSON, nullable=True)
    campaign_details = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    videos = relationship("Video", back_populates="sponsor")
    sponsor_matches = relationship("SponsorMatch", back_populates="sponsor")


class SponsorMatch(Base):
    __tablename__ = "sponsor_matches"

    id = Column(Integer, primary_key=True, index=True)
    influencer_id = Column(Integer, ForeignKey("influencers.id"), nullable=False)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False)
    status = Column(Enum(SponsorMatchStatus), default=SponsorMatchStatus.PENDING)
    match_score = Column(Float, nullable=True)
    proposal_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    influencer = relationship("Influencer", back_populates="sponsor_matches")
    sponsor = relationship("Sponsor", back_populates="sponsor_matches")


DATABASE_URL = "sqlite:///./storage/accounts.db"

os.makedirs("storage", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session():
    """Simple database session for direct use"""
    Base.metadata.create_all(bind=engine)
    return SessionLocal()
