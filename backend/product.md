### **Onboarding Wizard (B2B & B2C)**

- Step 1: Choose mode
    - Lifestyle, Manual/Company (maybe random prebuilt influencer)
        - More details when Arihan gets back
        - Stories as images (more real)
- Step 2: Configure your first persona
    - Generate/Upload face
    - Background info + goals
    - Audience targeting (age, gender, interests, region)
    - Growth Phase toggle
        - Unrelated to advertising, just warming up account
    - Plan it for the next 30 days
    
    ^ All of these can have AI-generated autofill
    
- (ONLY IG FOR DEMO) Step 3: Choose posting channels (IG, TikTok, YouTube Shorts)

- Upload manual lifestyle/manual script or allow AI to generate them

Manual vs Lifestyle mode

- Lifestyle mode
    - Real person has their entire life planned out (no intervention in its creation)
    - You can intervene whenever you want
        - change life trajectory maybe → this will modify the rest of their posts based on what you changed
    - Supervised control
- Company mode (set and forget)
    - At creation, you have the option to pick the frequency of posts
    - No intervention whatsoever
    - More autonomous than lifestyle

### **Influencer Dashboard**

- View profile growth over time
- Video feed preview (pending, published)
- Calendar view (what’s being posted and when) → these are linked to scheduled CRON jobs
    - Can have add sponsor or smth
- Toggle auto-growth phase or manual override
    - intercept the growth phase, extend it, etc
- Sponsorship status
    - Searching, linked brand, post performance (could be your own)
- Logs (actions taken, scripts generated, etc)

### **Scheduling Flow**

- Add video
    - One time
        - You write the context and the script, and what the person is doing in the video
    - Recurring
        - Could be like a series??? Idk
    - Scheduled at an interval
        - Lifestyle?
- Specify:
    - Date/time
    - Script direction or reference (a lot of context)
    - Optional: Sponsor name, tags, product CTA
- AI processes into:
    - Prompt → script → storyboard → scheduler → cron job → /create call
- Sponsor matching (B2C) or sponsor campaign (B2B) can be added post-schedule

### **Lifestyle Automation Flow**

- AI generates timeline with:
    - Contextual activities (gym, cooking, product reviews)
    - Persona-consistent tone
    - Realistic pacing and growth story
    - Temporal consistency
- Can be manually edited post-gen

---

## **2. FRONTEND (Next.js, React)**

### **Routes / Pages**

- /onboarding → Influencer Wizard
- /dashboard → Overview + quick actions
- /calendar → Full video schedule + CRUD
- /influencer/:id → Persona config + activity logs
- /create → Manual video/post scheduler
- /sponsors → Add new sponsor or apply to brands (B2C flow)

### **Components**

- CalendarWidget → shows post frequency, history, and future
- PersonaCard → avatar, name, stats
- ScriptEditor → preprompt text + output preview
- ScheduleForm → reusable for both AI and manual
- SponsorManager → tags, uploads, logos
- GrowthSlider → controls intensity of AI-generated activity

---

## **3. BACKEND (FastAPI)**

### **Models (SQLite)**

- User: id, auth, role (consumer, business)
- Influencer: id, name, persona JSON, mode, growth settings
- Video: id, influencer_id, scheduled_time, script, sponsor_id (nullable), status (pending, processing, posted)
- Schedule: id, video_id, recurrence_rule (RRULE), next_trigger, active
- Sponsor: id, company, contact, targeting_tags, product_info
- SponsorMatch: id, influencer_id, sponsor_id, status (matched, pending, declined)

### **API Endpoints**

- POST /sorcerer/init → create influencer from wizard
- GET /influencer/{id} → load persona + config
- POST /schedule → schedule a video manually
- POST /generate/lifestyle → AI fills calendar with lifestyle events
- POST /create → endpoint to trigger video generation pipeline
- POST /sponsor/match → attempt to link influencer to a sponsor
- POST /video/:id/add-sponsor → inject sponsor into existing post
- POST /cron/trigger → called by CRON workers to dispatch videos

---

## **4. SCHEDULE & WORKERS**

### **Cron Job Scheduler**

Schedule table

`id | video_id | run_at (datetime) | active | recurrence_rule`

```python
# 1. User hits the schedule endpoint
def schedule_video(influencer_id, run_at, params):
    video_id = db.create_video(influencer_id, params)
    db.create_schedule(video_id, run_at)

    scheduler.add_job(
        func=run_job,
        run_date=run_at,
        args=[video_id],
        id=f"video_{video_id}"
    )

# 2. Worker called at exact time
def run_job(video_id):
    video = db.get_video(video_id)

    if video.status != "pending":
        return

    # 3. Generate script + video
    script = ai.generate_script(video.influencer_id, video.params)
    video_path = video_engine.render(script)

    # 4. Post to platform
    success = social_api.post(video.platform, video_path, script.caption)

    if success:
        db.update_video_status(video_id, "posted")
    else:
        db.update_video_status(video_id, "failed")

    # 5. Handle recurrence (optional)
    if video.recurrence:
        next_time = get_next_run(video.recurrence)
        schedule_video(video.influencer_id, next_time, video.params)
```

### **Video Generation Pipeline**

- Input: Script, face, tone
- Process:
    - Use AI prompt templates based on influencer persona + input direction
    - Generate video script → scene layout → feed to Arihan’s video pipeline
    - Return MP4, thumbnail, caption
- Output stored in file store, linked to Video row

- Have a person’s image as source of truth
    - Then use cheap gemini image editing to generate the first frame of the video
    - Then pass that into the video gen