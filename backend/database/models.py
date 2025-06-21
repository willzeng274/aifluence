from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
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