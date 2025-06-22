import os
from typing import Dict, List, Any, Optional
import logging
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class AIContentGenerator:
    """AI content generator using Claude API for dynamic, context-aware content."""
    
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not found. AI features will be limited.")
            self.client = None
        else:
            self.client = Anthropic(api_key=api_key)
            logger.info("Claude API initialized successfully")

    def generate_life_story(self, name: str, persona: Dict[str, Any]) -> str:
        """Generates a comprehensive life story for a lifestyle influencer."""
        if not self.client:
            logger.warning("AI client not configured. Cannot generate life story.")
            return "A life yet to be written."

        prompt = f"""You are a character designer and storyteller for social media. Your task is to create a deep and compelling character bio for a new virtual influencer named **{name}**. This bio should read less like a formal novel and more like the rich, messy, and authentic backstory of a real person who shares their life online.

**Core Persona:**
- **Name:** {name}
- **Character Concept:** {persona.get("background", "")}
- **Primary Goals:** {', '.join(persona.get("goals", []))}
- **Personality & Tone:** {persona.get("tone", "casual")}

**Instructions:**
1.  **Craft a Believable Backstory:** Detail their upbringing, formative experiences, and key relationships. Focus on the kinds of specific, relatable memories and anecdotes that a person might share with an online audience over time (e.g., a funny family tradition, a struggle with a hobby, a pivotal part-time job).
2.  **Define Their "Why":** What pivotal event or realization set them on their current path and inspired them to start sharing their journey on social media? Make this feel personal and motivated.
3.  **Establish Their Current Life:** Describe their current-day situation, routines, and what they're actively working on. What are the small, everyday things that bring them joy or challenge them?
4.  **Outline Content-Ready Themes:** Weave in specific passions, ongoing projects, or long-term goals that can naturally become recurring themes in their content.

**Output:** Return only the raw text of the story, with no titles or headers. It should be written as a compelling, multi-paragraph narrative that feels like the authentic, detailed "About Me" section of a personal blog.
"""
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=3000,
                temperature=0.9,
                messages=[{"role": "user", "content": prompt}]
            )
            life_story = response.content[0].text.strip()
            logger.info("Successfully generated life story.")
            return life_story
        except Exception as e:
            logger.error(f"Failed to generate life story: {e}")
            return f"Error in generation: {e}"

    def generate_reel_content_plan(self, influencer, days_to_plan: int) -> List[Dict[str, Any]]:
        """Generates a reel content plan based on the influencer's life story."""
        if not self.client: return []
        persona = influencer.persona or {}
        num_reels = max(2, int(days_to_plan / 4))

        prompt = f"""You are a content strategist for an influencer. Based on their character bio, generate a plan for {num_reels} 'tent-pole' reels over the next {days_to_plan} days. These reels should feel like authentic, shareable moments, not chapters in a book.

**Character Bio:**
---
{influencer.life_story or "No life story provided."}
---

**Persona:**
- **Background:** {persona.get("background", "")}
- **Goals:** {', '.join(persona.get("goals", []))}

**Instructions:**
- Identify key themes or recent events from the bio that would make for a compelling and relatable video.
- For each reel, specify the day it should occur (from 1 to {days_to_plan}) and provide a `post_context`.
- The `post_context` should describe a specific, genuine moment someone would realistically share with their audience.
- The posts should NOT be on consecutive days. Create a natural, sparse posting cadence.
- Do NOT specify a time, only the day.
- Return a clean JSON array.

**JSON Output Format:**
[
  {{
    "day": 2,
    "content_type": "reel",
    "post_context": "A reel showing the influencer unboxing an old family heirloom that connects to a memory from their childhood mentioned in the life story."
  }},
  {{
    "day": 6,
    "content_type": "reel",
    "post_context": "The influencer reveals the first completed piece of their new project, explaining how it fulfills one of their long-term goals."
  }}
]
"""
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022", max_tokens=1500, temperature=0.8,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response.content[0].text
            start = content.find('[')
            end = content.rfind(']') + 1
            if start == -1 or end == 0: return []
            return json.loads(content[start:end])
        except Exception as e:
            logger.error(f"Failed to generate reel content plan: {e}")
            return []

    def generate_story_content_plan(self, influencer, reel_plan_summary: str, days_to_plan: int) -> List[Dict[str, Any]]:
        """Generates a story content plan that is aware of the reel plan."""
        if not self.client: return []
        persona = influencer.persona or {}
        # Dynamically calculate a reasonable number of stories
        num_stories = max(4, int(days_to_plan / 2))
        
        prompt = f"""You are a content strategist for an influencer. Based on their character bio and upcoming reels, generate a plan for {num_stories} casual stories over the next {days_to_plan} days. These stories should feel like spontaneous, in-the-moment updates.

**Character Bio:**
---
{influencer.life_story or "No life story provided."}
---

**Upcoming Reels (for context):**
---
{reel_plan_summary}
---

**Instructions:**
- Create stories that feel like genuine, everyday moments. They can be build-up for reels, reactions, or just small, unrelated observations.
- For each story, specify the day (from 1 to {days_to_plan}) and a `post_context`.
- The posting schedule should be sparse and feel natural, not daily.
- Do NOT specify a time, only the day.
- Return a clean JSON array.

**JSON Output Format:**
[
  {{
    "day": 1,
    "content_type": "story",
    "post_context": "A short story of the influencer looking through an old photo album, hinting at the heirloom they will unbox in tomorrow's reel."
  }},
  {{
    "day": 5,
    "content_type": "story",
    "post_context": "A 'work-in-progress' story showing a messy desk and a glimpse of the project being finalized for the reel on day 6."
  }}
]
"""
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022", max_tokens=2000, temperature=0.85,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response.content[0].text
            start = content.find('[')
            end = content.rfind(']') + 1
            if start == -1 or end == 0: return []
            return json.loads(content[start:end])
        except Exception as e:
            logger.error(f"Failed to generate story content plan: {e}")
            return []

    def generate_scene_prompt(self, 
                       influencer,
                       context: Optional[str] = None,
                       sponsor_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generates a video prompt with a third-person description and a first-person intention."""
        
        if not self.client:
            logger.error("Claude API not configured")
            return self._fallback_prompt(context)
        
        persona = influencer.persona or {}
        audience = influencer.audience_targeting or {}
        
        background = persona.get("background", "")
        tone = persona.get("tone", "casual")
        goals = persona.get("goals", [])
        audience_interests = audience.get("interests", [])
        life_story = influencer.life_story or ""

        life_story_prompt = ""
        if life_story:
            life_story_prompt = f"""
**Influencer's Life Story:**
This is the overarching narrative and backstory for the influencer. Use this as the primary source of truth for their character, motivations, and the world they inhabit.
---
{life_story}
---
"""

        prompt = f"""You are a creative director for a virtual influencer. Your task is to generate a scene prompt for a short video. The prompt must be deeply consistent with the influencer's established profile and life story.

{life_story_prompt}

**Influencer Profile:**
- **Background:** {background}
- **Tone:** {tone}
- **Core Goals:** {', '.join(goals)}
- **Target Audience Interests:** {', '.join(audience_interests)}

**Video Concept:**
{context if context else 'A typical day-in-the-life moment that aligns with the life story.'}
{f"This video is sponsored by {sponsor_info.get('company_name')}. The sponsorship should be subtly reflected in the intention or description." if sponsor_info else ""}

**Instructions:**
1.  **`description` (Third-Person):** Write a detailed, third-person narrative of the scene. Describe the environment, the character's appearance, their specific actions, and any dialogue they speak out loud. This is the objective view of the scene.
2.  **`intention` (First-Person):** Write a short, first-person internal monologue. This should reveal the character's inner thoughts, feelings, motivations, or what they are about to do. This is their subjective, internal state.

**JSON Output Format:**
Provide the output as a clean JSON object with no extra text or explanations.
{{
  "description": "A third-person narrative of the scene (environment, actions, dialogue).",
  "intention": "A first-person internal monologue (thoughts, feelings, motivation)."
}}
"""

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                temperature=0.95,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            try:
                # Robust JSON extraction
                start = content.find('{')
                end = content.rfind('}') + 1
                if start == -1 or end == 0:
                    logger.error(f"Failed to find JSON object in Claude response. Raw response: {content}")
                    return self._fallback_prompt(context)
                
                json_str = content[start:end]
                prompt_data = json.loads(json_str)
                
                logger.info("Generated scene prompt with Claude API")
                return {
                    "description": prompt_data.get("description", "No description generated."),
                    "intention": prompt_data.get("intention", "No intention generated.")
                }
                
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse Claude response for scene prompt: {e}. Raw response: {content}")
                return self._fallback_prompt(context)
                
        except Exception as e:
            logger.error(f"Claude API error during scene prompt generation: {e}")
            return self._fallback_prompt(context)

    def generate_caption(self, prompt_data: Dict[str, Any], hashtags: Optional[List[str]] = None) -> str:
        """Generate a caption from the scene description."""
        if not self.client:
            return self._simple_caption(prompt_data, hashtags)

        description = prompt_data.get("description", "Check this out!")
        
        prompt = f"""Generate a short, engaging caption for a social media post.

The post is about: "{description}"

The caption should be 1-3 sentences and include 3-5 relevant hashtags. Format as JSON with "caption" and "hashtags" keys.
Example:
{{
  "caption": "Your awesome caption here!",
  "hashtags": ["#example", "#ai", "#content"]
}}
"""
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=200,
                temperature=0.75,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response.content[0].text
            start = content.find('{')
            end = content.rfind('}') + 1
            json_str = content[start:end]
            caption_data = json.loads(json_str)
            
            caption = caption_data.get("caption", description)
            generated_hashtags = caption_data.get("hashtags", [])

            all_hashtags = []
            if hashtags:
                all_hashtags.extend(hashtags)
            all_hashtags.extend(generated_hashtags)
            
            final_hashtags = " ".join(all_hashtags)
            
            full_caption = f"{caption} {final_hashtags}".strip()
            logger.info("Generated caption with Claude API")
            return full_caption
            
        except Exception as e:
            logger.error(f"Caption generation error: {e}")
            return self._simple_caption(prompt_data, hashtags)

    def _fallback_prompt(self, context: Optional[str]) -> Dict[str, str]:
        logger.warning("Using fallback prompt generator")
        return {
            "description": context or "A default video scene.",
            "intention": "I need to make this interesting."
        }

    def _simple_caption(self, prompt_data: Dict[str, Any], hashtags: Optional[List[str]]) -> str:
        logger.warning("Using simple caption generator")
        caption_text = prompt_data.get("description", "Cool new video!")
        if hashtags:
            hashtag_str = " ".join(hashtags)
            return f"{caption_text} {hashtag_str}"
        return caption_text

ai_generator = AIContentGenerator()