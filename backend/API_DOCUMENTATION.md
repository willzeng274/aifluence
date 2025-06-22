# AI Influencer Manager API Documentation

## Overview

The AI Influencer Manager is a backend API for creating and managing AI-powered social media influencers. It supports automated content generation, scheduling, and sponsor management.

## Getting Started

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

### Database Setup

The database is automatically initialized on first run. SQLite database is stored at `storage/accounts.db`.

## Core Concepts

### Influencer Modes

1. **Lifestyle Mode**: AI generates a realistic life timeline with contextual activities
2. **Company Mode**: Set-and-forget mode with predetermined posting frequency

### Growth Phases

Influencers can have automated growth phases enabled to warm up accounts with organic-looking activity.

## API Endpoints

### 1. Influencer Management

#### Create Influencer (Onboarding Wizard)
```http
POST /sorcerer/init
Content-Type: application/json

{
  "mode": "lifestyle",  // or "company"
  "name": "Alex Johnson",
  "face_image_url": "https://example.com/face.jpg",
  "background_info": "25-year-old fitness enthusiast living in LA",
  "goals": ["inspire healthy living", "build fitness community"],
  "tone": "energetic",  // or "casual", "professional"
  "audience_age_range": [18, 35],
  "audience_gender": "all",
  "audience_interests": ["fitness", "nutrition", "wellness"],
  "audience_region": "North America",
  "growth_phase_enabled": true,
  "growth_intensity": 0.7,  // 0-1 scale
  "posting_frequency": {  // optional, for company mode
    "posts_per_week": 5
  },
  "instagram_username": "alex_fitness",  // optional
  "instagram_password": "password123"   // optional
}
```

#### List Influencers
```http
GET /influencers?skip=0&limit=100
```

#### Get Influencer Details
```http
GET /influencer/{influencer_id}
```

#### Get Influencer's Scheduled Videos
```http
GET /influencer/{influencer_id}/videos?include_past=false
```

Returns:
```json
{
  "influencer_id": 1,
  "influencer_name": "Emma Chen",
  "total_scheduled": 5,
  "videos": [
    {
      "video_id": 1,
      "schedule_id": 1,
      "scheduled_time": "2024-01-15T09:00:00",
      "content_type": "post",
      "status": "pending",
      "caption": "Morning motivation...",
      "hashtags": ["lifestyle", "motivation"],
      "is_active": true,
      "has_sponsor": false
    }
  ]
}
```

### 2. Content Scheduling

#### Schedule Single Video
```http
POST /schedule
Content-Type: application/json

{
  "run_at": "2024-01-15T14:00:00",
  "is_active": true,
  "video_params": {
    "influencer_id": 1,
    "sponsor_id": null,  // optional
    "scheduled_time": "2024-01-15T14:00:00",
    "content_type": "post",  // "post", "story", or "reel"
    "script": "Hey everyone! Today I'm sharing...",  // optional, AI will generate if not provided
    "caption": "Morning workout routine 💪",  // optional
    "hashtags": ["fitness", "workout", "motivation"],
    "platform": "instagram"
  }
}
```

#### Generate Lifestyle Schedule (AI-Powered, Async)
```http
POST /generate/lifestyle
Content-Type: application/json

{
  "influencer_id": 1,
  "days": 30,  // 1-90 days
  "activities": ["workout", "cooking", "shopping"],  // optional
  "intensity": 0.7  // 0-1 scale for posting frequency
}
```

Returns immediately:
```json
{
  "message": "Lifestyle timeline generation started",
  "influencer_id": 1,
  "days": 30,
  "status": "processing"
}
```

#### Create Bulk Schedule from Pattern
```http
POST /schedule/bulk
Content-Type: application/json

{
  "influencer_id": 1,
  "schedule_pattern": {
    "monday": {
      "posts": [
        {"type": "post", "time": "9:15 AM"},
        {"type": "story", "time": "2:00 PM"}
      ]
    },
    "wednesday": {
      "posts": [
        {"type": "reel", "time": "6:30 PM"}
      ]
    },
    "friday": {
      "posts": [
        {"type": "post", "time": "12:00 PM"},
        {"type": "story", "time": "5:00 PM"}
      ]
    }
  },
  "start_date": "2024-01-15T00:00:00",
  "end_date": "2024-02-15T00:00:00"
}
```

#### Trigger Video Generation
```http
POST /create?video_id=1
```

This will:
1. Generate script (if not provided)
2. Create storyboard
3. Trigger video generation pipeline
4. Return video URLs

### 3. Sponsor Management

#### Create Sponsor (B2B only)
```http
POST /sponsors
Content-Type: application/json

{
  "company_name": "FitGear Pro",
  "brand_logo_url": "https://example.com/logo.png",
  "contact_email": "partners@fitgear.com",
  "contact_phone": "+1-555-0123",
  "targeting_tags": ["fitness", "athletic", "sports"],
  "product_info": {
    "name": "Pro Resistance Bands",
    "description": "Premium workout bands",
    "price": 29.99
  },
  "campaign_details": {
    "budget": 5000,
    "duration": "3 months",
    "goals": ["brand awareness", "sales"]
  }
}
```

#### Match Sponsor to Influencer
```http
POST /sponsor/match
Content-Type: application/json

{
  "influencer_id": 1,
  "sponsor_id": 1,
  "proposal_details": {
    "posts_per_month": 4,
    "compensation": 1000
  }
}
```

Returns match score (0-1) based on audience alignment.

#### Add Sponsor to Existing Video
```http
POST /video/{video_id}/add-sponsor?sponsor_id=1
```

### 4. Instagram Integration

#### Add Instagram Account
```http
POST /accounts?username=alex_fitness&password=pass123&influencer_id=1
```

#### Legacy Upload Endpoints
- `POST /upload/photo` - Upload photo with form data
- `POST /upload/video` - Upload video with form data  
- `POST /upload/story` - Upload story with form data

## Response Examples

### Successful Influencer Creation
```json
{
  "id": 1,
  "name": "Alex Johnson",
  "face_image_url": "https://example.com/face.jpg",
  "persona": {
    "background": "25-year-old fitness enthusiast living in LA",
    "goals": ["inspire healthy living", "build fitness community"],
    "tone": "energetic"
  },
  "mode": "lifestyle",
  "audience_targeting": {
    "age_range": [18, 35],
    "gender": "all",
    "interests": ["fitness", "nutrition", "wellness"],
    "region": "North America"
  },
  "growth_phase_enabled": true,
  "growth_intensity": 0.7,
  "is_active": true,
  "created_at": "2024-01-10T10:00:00",
  "updated_at": "2024-01-10T10:00:00"
}
```

### Bulk Schedule Creation Response
```json
{
  "message": "Bulk schedule creation started",
  "influencer_id": 1,
  "start_date": "2024-01-15T00:00:00",
  "end_date": "2024-02-15T00:00:00",
  "status": "processing"
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Claude API (required for AI features)
ANTHROPIC_API_KEY=your-claude-api-key-here

# Optional
SECRET_KEY=your-secret-key-for-production
DATABASE_URL=sqlite:///./storage/accounts.db
```

## Error Codes

- `400` - Bad Request (validation error)
- `404` - Resource not found
- `429` - Rate limited (Instagram API)
- `500` - Internal server error

## Notes

- All timestamps should be in ISO 8601 format
- The scheduler runs in the background and processes videos at their scheduled times
- Instagram integration requires valid account credentials
- Video generation is simulated in MVP (returns placeholder URLs)