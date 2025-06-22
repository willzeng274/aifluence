import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
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

    def generate_script(self, 
                       influencer_persona: Dict[str, Any],
                       context: Optional[str] = None,
                       sponsor_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate a video script based on influencer persona and context."""
        
        if not self.client:
            logger.error("Claude API not configured")
            return self._fallback_script(influencer_persona, context, sponsor_info)
        
        tone = influencer_persona.get("tone", "casual")
        goals = influencer_persona.get("goals", [])
        background = influencer_persona.get("background", "")

        prompt = f"""You are writing a short video script for an AI influencer with the following profile:

Background: {background}
Goals: {', '.join(goals) if goals else 'general content creation'}
Tone: {tone}

{"Context for this video: " + context if context else "Generate a lifestyle/daily activity video."}

{f"This video is sponsored by {sponsor_info.get('company_name')}. Product: {sponsor_info.get('product_info', {}).get('name', 'their product')}. Include a natural, authentic sponsor mention." if sponsor_info else ""}

Create a natural, engaging video script that:
1. Has a conversational opening that matches the influencer's tone
2. Delivers valuable content that aligns with their goals
3. Includes personal touches that reflect their background
4. {"Naturally integrates the sponsor message" if sponsor_info else "Maintains authenticity"}
5. Has a call-to-action closing

Format the response as JSON with these exact keys:
{{
  "opening": "The opening line",
  "main_content": "The main body of the script (2-3 sentences)",
  "closing": "The closing line with CTA",
  "tone_notes": "Brief notes about delivery style"
}}

Keep it concise - the entire script should be 30-60 seconds when spoken."""

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                temperature=0.8,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            try:
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                script_data = json.loads(json_str)
                
                script = {
                    "opening": script_data.get("opening", "Hey everyone!"),
                    "main_content": script_data.get("main_content", ""),
                    "closing": script_data.get("closing", "See you in the next one!"),
                    "full_script": f"{script_data.get('opening', '')} {script_data.get('main_content', '')} {script_data.get('closing', '')}",
                    "duration_estimate": len(script_data.get('main_content', '').split()) // 2,
                    "tone": tone,
                    "tone_notes": script_data.get("tone_notes", "")
                }
                
                logger.info(f"Generated script with Claude API - tone: {tone}")
                return script
                
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse Claude response: {e}")
                return self._fallback_script(influencer_persona, context, sponsor_info)
                
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return self._fallback_script(influencer_persona, context, sponsor_info)

    def generate_storyboard(self, script: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate a detailed storyboard from the script using AI."""
        
        if not self.client:
            return self._simple_storyboard(script)
        
        prompt = f"""Create a shot-by-shot storyboard for this influencer video script:

Opening: {script.get('opening', '')}
Main Content: {script.get('main_content', '')}
Closing: {script.get('closing', '')}
Tone: {script.get('tone', 'casual')}

Generate a storyboard with 4-7 scenes. For each scene, provide:
1. Scene description (visual elements, setting, actions)
2. Camera angle (front_facing, side_angle, overhead, close_up, wide_shot)
3. Duration in seconds
4. Any text overlays or graphics

Format as JSON array:
[
  {{
    "scene_number": 1,
    "duration": 3,
    "description": "Scene description",
    "camera_angle": "angle type",
    "text_overlay": "Any text to display"
  }}
]

Make it visually interesting and appropriate for social media."""

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=800,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            start = content.find('[')
            end = content.rfind(']') + 1
            json_str = content[start:end]
            scenes = json.loads(json_str)
            
            logger.info(f"Generated storyboard with {len(scenes)} scenes")
            return scenes
            
        except Exception as e:
            logger.error(f"Storyboard generation error: {e}")
            return self._simple_storyboard(script)

    def generate_lifestyle_timeline(self,
                                  influencer_persona: Dict[str, Any],
                                  days: int = 30,
                                  intensity: float = 0.5) -> List[Dict[str, Any]]:
        """Generate a realistic timeline of lifestyle posts using AI."""
        
        if not self.client:
            return self._simple_timeline(days, intensity)
        
        posts_per_week = int(3 + (intensity * 4))
        
        prompt = f"""Create a {days}-day content calendar for an AI influencer with this profile:

Background: {influencer_persona.get('background', 'lifestyle influencer')}
Goals: {', '.join(influencer_persona.get('goals', [])) if influencer_persona.get('goals') else 'engage audience'}
Tone: {influencer_persona.get('tone', 'casual')}

Requirements:
- Generate approximately {posts_per_week} posts per week
- Mix different types of content (morning routines, activities, tips, behind-the-scenes, etc.)
- Include variety in posting times (morning, afternoon, evening)
- Make it feel authentic and natural, not robotic
- Occasionally include sponsored content opportunities (mark with "sponsor_opportunity": true)
- Consider weekday vs weekend content differences

Format as JSON array with entries like:
[
  {{
    "day_offset": 0,
    "time": "09:30",
    "activity": "morning coffee ritual",
    "content_type": "lifestyle",
    "description": "Sharing my favorite morning coffee setup",
    "sponsor_opportunity": false
  }}
]

Generate creative, varied content that tells a story over time."""

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                temperature=0.9,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            start = content.find('[')
            end = content.rfind(']') + 1
            json_str = content[start:end]
            ai_timeline = json.loads(json_str)
            
            timeline = []
            current_date = datetime.now()
            
            for entry in ai_timeline:
                post_date = current_date + timedelta(days=entry.get('day_offset', 0))
                time_parts = entry.get('time', '12:00').split(':')
                post_time = post_date.replace(
                    hour=int(time_parts[0]), 
                    minute=int(time_parts[1]) if len(time_parts) > 1 else 0
                )
                
                timeline_entry = {
                    "scheduled_time": post_time.isoformat(),
                    "activity": entry.get('activity', 'daily update'),
                    "context": entry.get('description', f"sharing my {entry.get('activity', 'day')}"),
                    "sponsor_info": None,
                    "estimated_engagement": int(500 + (intensity * 1000))
                }
                
                if entry.get('sponsor_opportunity', False):
                    timeline_entry["sponsor_info"] = {
                        "company_name": "Partner Brand",
                        "product_info": {"name": "featured product"}
                    }
                
                timeline.append(timeline_entry)
            
            logger.info(f"Generated AI timeline with {len(timeline)} posts over {days} days")
            return timeline
            
        except Exception as e:
            logger.error(f"Timeline generation error: {e}")
            return self._simple_timeline(days, intensity)

    def generate_caption(self, script: Dict[str, Any], hashtags: Optional[List[str]] = None) -> str:
        """Generate engaging Instagram caption from script using AI."""
        
        if not self.client:
            return self._simple_caption(script, hashtags)
        
        prompt = f"""Create an Instagram caption for this video script:

Script: {script.get('full_script', '')}
Tone: {script.get('tone', 'casual')}

Requirements:
- Make it engaging and conversational
- Include 1-2 relevant emojis
- Keep it concise but impactful
- End with relevant hashtags (5-8 hashtags)
- Match the influencer's tone

Just return the caption text, nothing else."""

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=200,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            
            caption = response.content[0].text.strip()
            
            if hashtags and not any('#' in caption for _ in caption):
                hashtag_string = " ".join([f"#{tag}" for tag in hashtags[:5]])
                caption += f"\n\n{hashtag_string}"
            
            return caption
            
        except Exception as e:
            logger.error(f"Caption generation error: {e}")
            return self._simple_caption(script, hashtags)

    def _fallback_script(self, persona, context, sponsor_info):
        """Simple fallback script generation."""
        tone_openings = {
            "casual": "Hey everyone! Hope you're having an amazing day!",
            "professional": "Welcome back to my channel.",
            "energetic": "What's up, beautiful people!"
        }
        
        opening = tone_openings.get(persona.get("tone", "casual"), "Hey everyone!")
        main_content = context if context else "Today I'm sharing something special with you all."
        
        if sponsor_info:
            main_content += f" Big thanks to {sponsor_info.get('company_name', 'our sponsor')} for making this possible!"
        
        return {
            "opening": opening,
            "main_content": main_content,
            "closing": "Don't forget to like and follow for more content!",
            "full_script": f"{opening} {main_content} Don't forget to like and follow for more content!",
            "duration_estimate": 30,
            "tone": persona.get("tone", "casual")
        }
    
    def _simple_storyboard(self, script):
        """Simple storyboard generation."""
        return [
            {
                "scene_number": 1,
                "duration": 3,
                "description": "Opening shot - influencer greeting audience",
                "camera_angle": "front_facing",
                "text_overlay": script.get("opening", "")
            },
            {
                "scene_number": 2,
                "duration": 20,
                "description": "Main content - activity or demonstration",
                "camera_angle": "wide_shot",
                "text_overlay": ""
            },
            {
                "scene_number": 3,
                "duration": 5,
                "description": "Closing shot - call to action",
                "camera_angle": "front_facing",
                "text_overlay": "Follow for more!"
            }
        ]
    
    def _simple_timeline(self, days, intensity):
        """Simple timeline generation."""
        timeline = []
        current_date = datetime.now()
        posts_per_week = int(3 + (intensity * 4))
        days_between = 7 / posts_per_week
        
        activities = [
            "morning routine", "workout session", "healthy cooking",
            "product review", "daily vlog", "tip tuesday", "weekend adventure"
        ]
        
        for i in range(0, days, int(days_between)):
            post_time = current_date + timedelta(days=i, hours=14)
            timeline.append({
                "scheduled_time": post_time.isoformat(),
                "activity": activities[i % len(activities)],
                "context": f"sharing my {activities[i % len(activities)]}",
                "sponsor_info": None,
                "estimated_engagement": 1000
            })
        
        return timeline
    
    def _simple_caption(self, script, hashtags):
        """Simple caption generation."""
        main_text = script.get("main_content", "Check out today's video!").split('.')[0]
        
        if not hashtags:
            hashtags = ["lifestyle", "influencer", "contentcreator", "dailylife"]
        
        hashtag_string = " ".join([f"#{tag}" for tag in hashtags[:8]])
        
        return f"{main_text} ✨\n\n{hashtag_string}"

ai_generator = AIContentGenerator()