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

    def generate_scene_prompt(self, 
                       influencer_persona: Dict[str, Any],
                       context: Optional[str] = None,
                       sponsor_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generates a video prompt with a third-person description and a first-person intention."""
        
        if not self.client:
            logger.error("Claude API not configured")
            return self._fallback_prompt(context)
        
        background = influencer_persona.get("background", "")
        tone = influencer_persona.get("tone", "casual")

        prompt = f"""You are a creative director for a virtual influencer. Your task is to generate a scene prompt for a short video. The prompt must have two distinct parts: a third-person `description` and a first-person `intention`.

**Influencer Profile:**
- **Background:** {background}
- **Tone:** {tone}

**Video Concept:**
{context if context else 'A typical day-in-the-life moment.'}
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
                temperature=0.85,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            try:
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                prompt_data = json.loads(json_str)
                
                logger.info("Generated scene prompt with Claude API")
                return {
                    "description": prompt_data.get("description", "No description generated."),
                    "intention": prompt_data.get("intention", "No intention generated.")
                }
                
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse Claude response for scene prompt: {e}")
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
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response.content[0].text
            start = content.find('{')
            end = content.rfind('}') + 1
            json_str = content[start:end]
            caption_data = json.loads(json_str)
            
            caption = caption_data.get("caption", description)
            generated_hashtags = caption_data.get("hashtags", [])

            if hashtags:
                final_hashtags = " ".join(f"#{tag}" for tag in hashtags + generated_hashtags)
            else:
                final_hashtags = " ".join(f"#{tag}" for tag in generated_hashtags)
            
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
            hashtag_str = " ".join([f"#{h}" for h in hashtags])
            return f"{caption_text} {hashtag_str}"
        return caption_text

ai_generator = AIContentGenerator()