"""
OpenAI Service
Handles AI analysis of video transcripts using ChatGPT API
"""

import openai
import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for analyzing video content with OpenAI"""
    
    def __init__(self, api_key, model='gpt-4-turbo-preview'):
        """Initialize with OpenAI API key"""
        self.api_key = api_key
        self.model = model
        openai.api_key = api_key
    
    def analyze_transcript(self, transcript: str, video_duration: float = None) -> List[Dict]:
        """
        Analyze transcript to identify highlight moments
        
        Args:
            transcript: Full video transcript with timestamps
            video_duration: Total video duration in seconds
        
        Returns:
            List of detected moments with timing and descriptions
        """
        
        system_prompt = """You are an expert video editor and content strategist. 
Your task is to analyze video transcripts and identify the most engaging moments that would make great social media clips.

Look for:
1. Emotional peaks (excitement, surprise, humor, inspiration)
2. Key insights or "aha moments"
3. Compelling stories or anecdotes
4. Action-packed or visually interesting segments
5. Quotable statements
6. Topic changes or transitions
7. Moments with high engagement potential

For each moment, provide:
- start_time: When the moment begins (in seconds from transcript timestamps)
- end_time: When the moment ends (ideal clip length: 15-60 seconds)
- title: Catchy title for the moment (5-8 words)
- description: Brief description (1-2 sentences)
- reason: Why this would make a good clip (engagement potential)
- score: Confidence score 0-1 (how strong this moment is)

Return 3-5 of the BEST moments only. Quality over quantity.
Format your response as valid JSON array."""

        user_prompt = f"""Analyze this video transcript and identify the top 3-5 highlight moments:

TRANSCRIPT:
{transcript}

{f'VIDEO DURATION: {video_duration} seconds' if video_duration else ''}

Return a JSON array of moments. Example format:
[
  {{
    "start_time": 45.5,
    "end_time": 78.2,
    "title": "The Surprising Truth About AI",
    "description": "Speaker reveals unexpected insight about artificial intelligence that challenges common beliefs.",
    "reason": "Contains a surprising revelation with emotional impact. Great hook for social media.",
    "score": 0.92
  }}
]

Respond with ONLY the JSON array, no additional text."""

        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            
            content = content.strip()
            
            # Parse JSON response
            moments = json.loads(content)
            
            # Validate and clean up moments
            validated_moments = []
            for moment in moments:
                if self._validate_moment(moment, video_duration):
                    validated_moments.append(moment)
            
            logger.info(f"Detected {len(validated_moments)} valid moments")
            return validated_moments
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {str(e)}")
            logger.error(f"Response content: {content}")
            raise ValueError("AI returned invalid JSON response")
        except Exception as e:
            logger.error(f"Error analyzing transcript: {str(e)}")
            raise
    
    def _validate_moment(self, moment: Dict, video_duration: float = None) -> bool:
        """Validate a moment has all required fields and valid values"""
        required_fields = ['start_time', 'end_time', 'title', 'description', 'reason']
        
        # Check required fields
        for field in required_fields:
            if field not in moment:
                logger.warning(f"Moment missing required field: {field}")
                return False
        
        # Validate timing
        start = moment['start_time']
        end = moment['end_time']
        
        if not isinstance(start, (int, float)) or not isinstance(end, (int, float)):
            logger.warning("Invalid timing values")
            return False
        
        if start >= end:
            logger.warning(f"Invalid timing: start ({start}) >= end ({end})")
            return False
        
        duration = end - start
        if duration < 5 or duration > 180:
            logger.warning(f"Clip duration out of range: {duration}s")
            return False
        
        # Validate against video duration if provided
        if video_duration:
            if end > video_duration:
                logger.warning(f"End time ({end}) exceeds video duration ({video_duration})")
                return False
        
        # Set default score if missing
        if 'score' not in moment:
            moment['score'] = 0.8
        
        return True
    
    def generate_social_caption(self, title: str, description: str) -> Dict:
        """
        Generate social media caption and hashtags for a clip
        
        Args:
            title: Clip title
            description: Clip description
        
        Returns:
            Dictionary with caption and hashtags
        """
        
        prompt = f"""Create an engaging social media caption for a video clip:

TITLE: {title}
DESCRIPTION: {description}

Generate:
1. A compelling caption (2-3 sentences) that hooks viewers and encourages engagement
2. 5-8 relevant hashtags

Make it exciting and shareable! Focus on the value or entertainment for viewers.

Return as JSON:
{{
  "caption": "Your engaging caption here...",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}}

Respond with ONLY the JSON, no additional text."""

        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a social media expert who creates viral content."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            
            content = content.strip()
            
            result = json.loads(content)
            
            # Validate response
            if 'caption' not in result or 'hashtags' not in result:
                raise ValueError("Invalid response format")
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating social caption: {str(e)}")
            # Return default caption if generation fails
            return {
                'caption': f"{title}. {description}",
                'hashtags': ['video', 'content', 'highlights']
            }
    
    def refine_moment(self, moment: Dict, feedback: str) -> Dict:
        """
        Refine a moment based on user feedback
        
        Args:
            moment: Original moment data
            feedback: User feedback on how to adjust the moment
        
        Returns:
            Updated moment data
        """
        
        prompt = f"""A user wants to adjust a video clip moment. Here's the current data:

CURRENT MOMENT:
{json.dumps(moment, indent=2)}

USER FEEDBACK:
{feedback}

Adjust the moment based on the feedback. You can modify:
- start_time and end_time (timing adjustments)
- title (make it more compelling)
- description (add more detail or adjust focus)

Return the updated moment as JSON with the same structure.
Respond with ONLY the JSON, no additional text."""

        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a video editing assistant helping refine video clips."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            
            content = content.strip()
            
            refined_moment = json.loads(content)
            
            # Validate the refined moment
            if self._validate_moment(refined_moment):
                return refined_moment
            else:
                logger.warning("Refined moment failed validation, returning original")
                return moment
            
        except Exception as e:
            logger.error(f"Error refining moment: {str(e)}")
            return moment
