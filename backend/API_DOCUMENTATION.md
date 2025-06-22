# AI Influencer Manager API v2.0.0

This document provides an overview of the AI Influencer Manager API, its endpoints, and how to use them.

## Base URL

`http://localhost:8000`

---

## Authentication

Most endpoints do not require authentication for this version. The Instagram integration requires credentials which are managed by the `InstagramManager`. The Gemini API requires an API key set via the `GEMINI_API_KEY` environment variable.

---

## Core Concepts

- **Influencer**: The central entity, representing an AI-generated personality. Each influencer has a defined persona, audience, and content strategy.
- **Video**: Represents a piece of content (post, story, or reel) to be generated and published.
- **Schedule**: A specific time slot for a video to be posted.
- **Sponsor**: A brand or company that can be matched with an influencer for sponsored content.

---

## Endpoints

### Influencer Management

#### `POST /sorcerer/init`

Initializes a new AI influencer using an onboarding wizard. This is the primary way to create a new, fully configured influencer. Upon creation, if a posting frequency is provided, it will automatically start scheduling content.

**Request Body:**

```json
{
  "mode": "autonomous",
  "name": "Aria the Explorer",
  "face_image_url": "http://example.com/aria.jpg",
  "background_info": "A travel vlogger who explores digital worlds.",
  "goals": ["grow audience", "promote creativity"],
  "tone": "adventurous and witty",
  "audience_age_range": [18, 35],
  "audience_gender": "all",
  "audience_interests": ["gaming", "virtual reality", "digital art"],
  "audience_region": "global",
  "growth_phase_enabled": true,
  "growth_intensity": 0.7,
  "posting_frequency": {
    "story_interval_hours": 8,
    "reel_interval_hours": 48
  },
  "instagram_username": "aria_explores",
  "instagram_password": "secure_password_here"
}
```

- `mode` (string, enum: `autonomous`, `manual`): The operational mode of the influencer.
- `posting_frequency` (object, optional): Defines the intervals for automated story and reel creation.
  - `story_interval_hours` (integer, optional, default: 8): How often to post a new story.
  - `reel_interval_hours` (integer, optional, default: 72): How often to post a new reel.
- `instagram_username` (string, **required**): The Instagram username for the influencer.
- `instagram_password` (string, **required**): The Instagram password.

**Response:** `200 OK` - Returns a detailed `Influencer` object.

---

#### `GET /influencers`

Lists all influencers.

**Query Parameters:**

- `skip` (int, optional, default: 0): Number of influencers to skip.
- `limit` (int, optional, default: 100): Maximum number of influencers to return.

**Response:** `200 OK` - An array of `Influencer` objects.

---

### Content & Scheduling

#### `POST /schedule/interval`

Schedules stories and reels to be posted at regular intervals over a specified number of days. This is useful for maintaining a consistent posting cadence.

**Request Body:**

```json
{
  "influencer_id": 1,
  "days_to_schedule": 30,
  "reel_interval_hours": 48,
  "story_interval_hours": 12
}
```

**Response:** `200 OK` - A confirmation message.

---

#### `POST /schedule/bulk`

Schedules a batch of specifically dated posts. This is ideal for planning out a content calendar with precise timing.

**Request Body:**

```json
{
  "influencer_id": 1,
  "posts": [
    {
      "post_datetime": "2024-09-01T10:00:00Z",
      "content_type": "reel",
      "prompt": "Create a reel about the first day of my new virtual adventure."
    },
    {
      "post_datetime": "2024-09-03T18:30:00Z",
      "content_type": "story"
    }
  ]
}
```

**Response:** `200 OK` - A confirmation message.

---

#### `POST /generate-image`

Generates an image based on a text prompt using the Gemini API. The generated image file is saved in the `storage/images` directory and the path is returned.

**Request Body:**

```json
{
  "prompt": "a futuristic city skyline at dusk, neon lights, hyper-realistic"
}
```

**Response:** `200 OK`

```json
{
  "path": "/storage/images/generated_a1b2c3d4.png"
}
```

---

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