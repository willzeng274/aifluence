<div align="center">

# AIFluence

AIFluence is a platform that lets users create autonomous AI influencer personas capable of growing their own social media presence, entirely on autopilot.
Won 11k @ SpurHacks.

</div>

<img width="1461" height="738" alt="Screenshot 2025-09-21 at 9 27 22 PM" src="https://github.com/user-attachments/assets/0b20c643-8fdd-4323-a316-be0a051db355" />


## What It Does
Users initialize a virtual influencer by giving it a name, backstory, tone, goals, and preferred audience. From there, the system handles the entire content lifecycle:

- It generates reels and stories using multimodal models like **Veo 3** and **Gemini 2.5 Pro**.
- It schedules posts at your desired time.
- It directly publishes to **Instagram** via the official **Publishing API**.
- It builds a real-time digital identity and adapts based on user-defined objectives and "changes" to the persona's life

AIFluence supports two key use cases:
- **B2B**: Businesses can build persistent, custom brand ambassadors tailored to their market segment.
- **B2C**: Individual users or niche entrepreneurs can create lifestyle personas to explore passive-income opportunities—similar to dropshipping, but with content instead of products.


## How We Built It

**Frontend:**  
We used **Next.js** with **React** and **Tailwind CSS** to build an interactive onboarding and dashboard experience. The frontend lets users walk through persona creation, view posting history, and trigger or modify post schedules.

**Backend Server:**  
Our API server was built using **FastAPI**. It handles influencer initialization, scheduling, and communication with third-party services. It uses a local **SQLite** database to persist influencer data, metadata, and scheduling information.

**Video & Media Generation:**  
The most critical layer of AIFluence is our media generation pipeline, which connects multiple AI models to simulate influencer behavior:
- **Veo 3 (Runway)**: Used for high-quality, scene-based reel generation.
- **Gemini 2.5 Pro**: Used for generating photorealistic persona imagery and thumbnails based on persona attributes.
- **MoviePy** + **PIL**: For assembling final videos with overlayed captions, transitions, and branding.
- **Transformers (HuggingFace)** and **GPT-4o**: Used to write captions, develop storytelling scripts, and maintain a coherent voice across time.

**Instagram Integration:**  
We used the official **Instagram Graph API** (Publishing) to automate reel and story uploads on behalf of the AI personas. The FastAPI backend handles login sessions, scheduling, and post automation.

## Architecture Overview

1. **User onboarding**: User creates an influencer by filling out a brief profile (name, image, tone, goals, etc.)
2. **Persona is initialized**: Back-end assigns growth logic, generation cadence, and target audience.
3. **Content pipeline triggers**: Stories and reels are generated using LLMs + Veo 3 based on persona goals and timelines.
4. **Auto-scheduling**: Content is slotted into a weekly schedule via FastAPI logic.
5. **Publishing**: Media is uploaded directly to Instagram with appropriate metadata (captions, hashtags, etc.)
6. **Analytics (MVP)**: The system tracks posting intervals, response rates, and growth curves.


## Inspiration

Influencer marketing is booming, but it’s inefficient and expensive. Human influencers come with inconsistent availability, high costs, and limited scalability. We imagined a world where you could "design" an influencer that doesn't sleep, doesn't charge thousands per post, and aligns perfectly with your product or personal vision.
