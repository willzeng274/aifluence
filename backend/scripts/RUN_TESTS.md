EXAMPLE RESPONSE:

============================================================
AI Influencer Manager - End-to-End Test Suite
============================================================
✓ [21:48:57] ✓ Claude API configured
ℹ [21:48:58] 
=== TEST 1: API Health Check ===
▶ [21:48:58] GET /
✓ [21:48:58] Response: 200 OK
{
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
    "influencer": [
      "/sorcerer/init",
      "/influencers",
      "/influencer/{id}"
    ],
    "scheduling": [
      "/schedule",
      "/generate/lifestyle",
      "/create"
    ],
    "sponsors": [
      "/sponsors",
      "/sponsor/match",
      "/video/{id}/add-sponsor"
    ],
    "legacy": [
      "/accounts",
      "/upload/*",
      "/analytics/*"
    ]
  }
}
✓ [21:48:58] API Version: 2.0.0
ℹ [21:48:58] Features: AI influencer persona management, Automated content scheduling, AI-powered script and lifestyle generation, Sponsor management and matching, Instagram integration
ℹ [21:48:58] 
=== TEST 2: Create AI Influencer (Onboarding Wizard) ===
▶ [21:48:58] POST /sorcerer/init
✓ [21:48:59] Response: 200 OK
{
  "name": "Emma Chen",
  "face_image_url": "https://example.com/emma-face.jpg",
  "persona": {
    "background": "28-year-old tech entrepreneur and wellness advocate living in San Francisco. Passionate about mindful living, sustainable technology, and helping others find balance in the digital age.",
    "goals": [
      "inspire work-life balance in tech",
      "promote mental wellness practices",
      "share sustainable living tips"
    ],
    "tone": "casual"
  },
  "mode": "lifestyle",
  "audience_targeting": {
    "age_range": [
      22,
      40
    ],
    "gender": "all",
    "interests": [
      "technology",
      "wellness",
      "sustainability",
      "productivity"
    ],
    "region": "United States"
  },
  "growth_phase_enabled": true,
  "growth_intensity": 0.7,
  "posting_frequency": null,
  "id": 4,
  "is_active": true,
  "created_at": "2025-06-22T01:48:58.832749",
  "updated_at": "2025-06-22T01:48:58.832752"
}
✓ [21:48:59] Created influencer: Emma Chen (ID: 4)
ℹ [21:49:00] 
=== TEST 3: Generate AI Lifestyle Timeline ===
▶ [21:49:00] POST /generate/lifestyle
✓ [21:51:30] Response: 200 OK
{
  "influencer_id": 4,
  "schedules_created": 10,
  "timeline": [
    {
      "schedule_id": 13,
      "video_id": 13,
      "scheduled_time": "2025-06-21T09:30:13.156896",
      "activity": "Morning meditation and tech setup"
    },
    {
      "schedule_id": 14,
      "video_id": 14,
      "scheduled_time": "2025-06-22T12:15:13.156896",
      "activity": "Sustainable lunch break"
    },
    {
      "schedule_id": 15,
      "video_id": 15,
      "scheduled_time": "2025-06-22T16:45:13.156896",
      "activity": "Digital wellness tip"
    },
    {
      "schedule_id": 16,
      "video_id": 16,
      "scheduled_time": "2025-06-23T08:00:13.156896",
      "activity": "Morning yoga flow"
    },
    {
      "schedule_id": 17,
      "video_id": 17,
      "scheduled_time": "2025-06-24T14:30:13.156896",
      "activity": "Startup life reality check"
    },
    {
      "schedule_id": 18,
      "video_id": 18,
      "scheduled_time": "2025-06-25T11:00:13.156896",
      "activity": "Tech-free Friday morning"
    },
    {
      "schedule_id": 19,
      "video_id": 19,
      "scheduled_time": "2025-06-26T10:30:13.156896",
      "activity": "Farmers market adventure"
    },
    {
      "schedule_id": 20,
      "video_id": 20,
      "scheduled_time": "2025-06-26T15:45:13.156896",
      "activity": "Weekend coding project"
    },
    {
      "schedule_id": 22,
      "video_id": 22,
      "scheduled_time": "2025-06-27T09:00:13.156896",
      "activity": "Digital detox Sunday"
    },
    {
      "schedule_id": 23,
      "video_id": 23,
      "scheduled_time": "2025-06-27T17:30:13.156896",
      "activity": "Week reflection"
    }
  ]
}
✓ [21:51:30] Generated 10 scheduled posts
ℹ [21:51:30] 
Upcoming posts:
  [21:51:30]   1. Sat Jun 21 @ 09:30 AM - Morning meditation and tech setup
  [21:51:30]   2. Sun Jun 22 @ 12:15 PM - Sustainable lunch break
  [21:51:30]   3. Sun Jun 22 @ 04:45 PM - Digital wellness tip
  [21:51:30]   4. Mon Jun 23 @ 08:00 AM - Morning yoga flow
  [21:51:30]   5. Tue Jun 24 @ 02:30 PM - Startup life reality check
  [21:51:30]   ... and 5 more posts
ℹ [21:51:31] 
=== TEST 4: Schedule Manual Video ===
▶ [21:51:31] POST /schedule
✓ [21:51:31] Response: 200 OK
{
  "run_at": "2025-06-21T22:51:31.144783",
  "recurrence_rule": "daily",
  "is_active": true,
  "id": 24,
  "video_id": 24,
  "next_trigger": null,
  "job_id": "video_schedule_24",
  "created_at": "2025-06-22T01:51:31.151715",
  "updated_at": "2025-06-22T01:51:31.154405"
}
✓ [21:51:31] Scheduled video (ID: 24) for 10:51 PM
ℹ [21:51:31] Recurrence: daily
ℹ [21:51:31] 
=== TEST 5: Create Sponsor ===
▶ [21:51:31] POST /sponsors
✓ [21:51:31] Response: 200 OK
{
  "company_name": "EcoTech Solutions",
  "brand_logo_url": "https://example.com/ecotech-logo.png",
  "contact_email": "partnerships@ecotech.com",
  "contact_phone": "+1-555-0100",
  "targeting_tags": [
    "sustainability",
    "technology",
    "eco-friendly",
    "green-tech"
  ],
  "product_info": {
    "name": "Smart Energy Monitor",
    "description": "AI-powered home energy optimization device",
    "price": 149.99,
    "features": [
      "Real-time monitoring",
      "AI predictions",
      "Mobile app"
    ]
  },
  "campaign_details": {
    "budget": 10000,
    "duration": "3 months",
    "goals": [
      "brand awareness",
      "product launch",
      "sustainability message"
    ],
    "target_impressions": 500000
  },
  "id": 4,
  "is_active": true,
  "created_at": "2025-06-22T01:51:31.667514",
  "updated_at": "2025-06-22T01:51:31.667518"
}
✓ [21:51:31] Created sponsor: EcoTech Solutions (ID: 4)
ℹ [21:51:32] 
=== TEST 6: Sponsor-Influencer Matching ===
▶ [21:51:32] POST /sponsor/match
✓ [21:51:32] Response: 200 OK
{
  "match_id": 2,
  "match_score": 0.7,
  "status": "pending"
}
✓ [21:51:32] Match Score: 70.00%
ℹ [21:51:32] Match Status: pending
ℹ [21:51:32] 
=== TEST 7: Trigger Video Generation Pipeline ===
▶ [21:51:32] POST /create?video_id=24
✓ [21:51:52] Response: 200 OK
{
  "video_id": 24,
  "status": "posted",
  "video_url": "/files/generated_video_24.mp4",
  "thumbnail_url": "/files/thumbnail_24.jpg"
}
✓ [21:51:52] Video Status: posted
ℹ [21:51:52] Video URL: /files/generated_video_24.mp4
ℹ [21:51:52] Thumbnail URL: /files/thumbnail_24.jpg
ℹ [21:51:53] 
=== TEST 8: Add Sponsor to Video ===
▶ [21:51:53] POST /video/24/add-sponsor?sponsor_id=4
✓ [21:51:53] Response: 200 OK
{
  "video_id": 24,
  "sponsor_id": 4,
  "updated": true
}
✓ [21:51:53] Successfully added sponsor to video
ℹ [21:51:53] Script will be regenerated with sponsor integration
ℹ [21:51:53] 
=== TEST 9: List All Influencers ===
▶ [21:51:53] GET /influencers
✓ [21:51:53] Response: 200 OK
[
  {
    "name": "Emma Chen",
    "face_image_url": "https://example.com/emma-face.jpg",
    "persona": {
      "background": "28-year-old tech entrepreneur and wellness advocate living in San Francisco. Passionate about mindful living, sustainable technology, and helping others find balance in the digital age.",
      "goals": [
        "inspire work-life balance in tech",
        "promote mental wellness practices",
        "share sustainable living tips"
      ],
      "tone": "casual"
    },
    "mode": "lifestyle",
    "audience_targeting": {
      "age_range": [
        22,
        40
      ],
      "gender": "all",
      "interests": [
        "technology",
        "wellness",
        "sustainability",
        "productivity"
      ],
      "region": "United States"
    },
    "growth_phase_enabled": true,
    "growth_intensity": 0.7,
    "posting_frequency": null,
    "id": 1,
    "is_active": true,
    "created_at": "2025-06-22T01:41:27.293115",
    "updated_at": "2025-06-22T01:41:27.293121"
  },
  {
    "name": "Emma Chen",
    "face_image_url": "https://example.com/emma-face.jpg",
    "persona": {
      "background": "28-year-old tech entrepreneur and wellness advocate living in San Francisco. Passionate about mindful living, sustainable technology, and helping others find balance in the digital age.",
      "goals": [
        "inspire work-life balance in tech",
        "promote mental wellness practices",
        "share sustainable living tips"
      ],
      "tone": "casual"
    },
    "mode": "lifestyle",
    "audience_targeting": {
      "age_range": [
        22,
        40
      ],
      "gender": "all",
      "interests": [
        "technology",
        "wellness",
        "sustainability",
        "productivity"
      ],
      "region": "United States"
    },
    "growth_phase_enabled": true,
    "growth_intensity": 0.7,
    "posting_frequency": null,
    "id": 2,
    "is_active": true,
    "created_at": "2025-06-22T01:44:28.673681",
    "updated_at": "2025-06-22T01:44:28.673687"
  },
  {
    "name": "Test Influencer",
    "face_image_url": null,
    "persona": {
      "background": "A test influencer",
      "goals": [
        "test goal"
      ],
      "tone": "casual"
    },
    "mode": "lifestyle",
    "audience_targeting": {
      "age_range": null,
      "gender": null,
      "interests": null,
      "region": null
    },
    "growth_phase_enabled": true,
    "growth_intensity": 0.5,
    "posting_frequency": null,
    "id": 3,
    "is_active": true,
    "created_at": "2025-06-22T01:47:42.169875",
    "updated_at": "2025-06-22T01:47:42.169878"
  },
  {
    "name": "Emma Chen",
    "face_image_url": "https://example.com/emma-face.jpg",
    "persona": {
      "background": "28-year-old tech entrepreneur and wellness advocate living in San Francisco. Passionate about mindful living, sustainable technology, and helping others find balance in the digital age.",
      "goals": [
        "inspire work-life balance in tech",
        "promote mental wellness practices",
        "share sustainable living tips"
      ],
      "tone": "casual"
    },
    "mode": "lifestyle",
    "audience_targeting": {
      "age_range": [
        22,
        40
      ],
      "gender": "all",
      "interests": [
        "technology",
        "wellness",
        "sustainability",
        "productivity"
      ],
      "region": "United States"
    },
    "growth_phase_enabled": true,
    "growth_intensity": 0.7,
    "posting_frequency": null,
    "id": 4,
    "is_active": true,
    "created_at": "2025-06-22T01:48:58.832749",
    "updated_at": "2025-06-22T01:48:58.832752"
  },
  {
    "name": "Test Influencer",
    "face_image_url": null,
    "persona": {
      "background": "A test influencer",
      "goals": [
        "test goal"
      ],
      "tone": "casual"
    },
    "mode": "lifestyle",
    "audience_targeting": {
      "age_range": null,
      "gender": null,
      "interests": null,
      "region": null
    },
    "growth_phase_enabled": true,
    "growth_intensity": 0.5,
    "posting_frequency": null,
    "id": 5,
    "is_active": true,
    "created_at": "2025-06-22T01:51:10.766360",
    "updated_at": "2025-06-22T01:51:10.766365"
  }
]
ℹ [21:51:53] Total influencers: 5
  [21:51:53]   • Emma Chen - lifestyle mode
  [21:51:53]   • Emma Chen - lifestyle mode
  [21:51:53]   • Test Influencer - lifestyle mode
  [21:51:53]   ... and 2 more

============================================================
Test Summary
============================================================
Passed: 9/9
Failed: 0/9

🎉 All tests passed!

Created Resources:
  • influencers: [4]
  • sponsors: [4]
  • videos: [24]
  • schedules: [24]