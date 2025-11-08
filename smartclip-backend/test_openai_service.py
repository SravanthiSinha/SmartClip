"""
Test script for OpenAI Service
Tests the analyze_transcript method with sample text or real video
"""

import os
import sys
from dotenv import load_dotenv
from services.openai_service import OpenAIService
from services.mux_service import MuxService
from database import db, Video, Moment
from flask import Flask
from config import Config

# Load environment variables
load_dotenv()

# Setup minimal Flask app for database access
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# Sample transcript for testing
SAMPLE_TRANSCRIPT = """
0.0: Welcome everyone to today's session about artificial intelligence and its impact on society.
5.2: I'm really excited to share some surprising findings from our latest research.
12.5: You know, most people think AI is just about automation and replacing jobs.
18.3: But here's the thing - we discovered something completely unexpected.
23.7: Our study shows that AI actually creates more jobs than it eliminates.
29.1: Let me give you a real example. In manufacturing, when companies introduced AI systems,
35.8: they saw a 40% increase in new job roles focused on AI maintenance, training, and optimization.
43.2: That's incredible, right? But wait, there's more.
47.5: The most impactful finding was about creativity. AI doesn't replace human creativity -
53.9: it amplifies it. Artists using AI tools are producing 3x more work without sacrificing quality.
62.1: Now, let's talk about the ethical concerns. This is crucial.
67.4: We need to address bias in AI systems. Our team found that diverse training data
74.8: reduces algorithmic bias by up to 60%. This is a game-changer.
81.3: So what does this mean for the future? I believe we're entering a golden age
88.7: of human-AI collaboration. It's not about replacement, it's about augmentation.
95.2: The key is education. We need to prepare people for this new reality.
101.5: Companies that invest in AI literacy training see 2x better adoption rates.
108.9: Let me share a quick story. Last month, I met a teacher who was terrified of AI.
115.3: She thought it would make her job obsolete. But after attending our workshop,
121.7: she's now using AI to personalize learning for her students. Her engagement scores doubled!
129.4: This transformation is possible for everyone. The technology is here.
135.8: The question is: are we ready to embrace it? I think we are.
141.2: In conclusion, AI is not our competitor - it's our partner in progress.
147.6: Thank you all for listening. I'm happy to take questions now.
"""

def test_analyze_transcript():
    """Test the OpenAI service with sample transcript"""

    # Get API key from environment
    api_key = os.getenv('OPENAI_API_KEY')

    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
        print("Please make sure .env file exists with OPENAI_API_KEY set")
        return

    print("🚀 Testing OpenAI Service")
    print("=" * 60)
    print(f"API Key: {api_key[:10]}...{api_key[-4:]}")
    print(f"Model: gpt-4-turbo-preview")
    print("=" * 60)
    print()

    # Initialize service
    print("📝 Initializing OpenAI Service...")
    service = OpenAIService(api_key=api_key)

    # Test transcript analysis
    print("🔍 Analyzing sample transcript...")
    print(f"Transcript length: {len(SAMPLE_TRANSCRIPT)} characters")
    print()

    try:
        # Analyze the transcript (video duration: 150 seconds)
        moments = service.analyze_transcript(
            transcript=SAMPLE_TRANSCRIPT,
            video_duration=150.0
        )

        print("✅ Analysis completed successfully!")
        print(f"Found {len(moments)} highlight moments")
        print("=" * 60)
        print()

        # Display results
        for i, moment in enumerate(moments, 1):
            print(f"🎬 Moment {i}:")
            print(f"   Title: {moment['title']}")
            print(f"   Time: {moment['start_time']}s - {moment['end_time']}s")
            print(f"   Duration: {moment['end_time'] - moment['start_time']:.1f}s")
            print(f"   Score: {moment.get('score', 'N/A')}")
            print(f"   Description: {moment['description']}")
            print(f"   Reason: {moment['reason']}")
            print()

        print("=" * 60)
        print("✨ Test completed successfully!")

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print()
        print("Common issues:")
        print("- Check if OPENAI_API_KEY is valid")
        print("- Verify you have available quota on your OpenAI account")
        print("- Ensure you have internet connectivity")


def test_video_moments(video_id):
    """Test analyzing a real video from the database"""

    with app.app_context():
        # Get video from database
        video = db.session.get(Video, video_id)

        if not video:
            print(f"❌ Video {video_id} not found in database")
            return

        print("=" * 60)
        print(f"📹 Testing Video Analysis")
        print("=" * 60)
        print(f"Video ID: {video_id}")
        print(f"Asset ID: {video.asset_id}")
        print(f"Status: {video.status}")
        print(f"Duration: {video.duration}s")
        print("=" * 60)
        print()

        # Check if transcript exists
        if not video.transcript:
            print("❌ No transcript found for this video")
            print("Run: python check_transcript.py", video_id)
            return

        print(f"✅ Transcript found ({len(video.transcript)} characters)")
        print()
        print("Transcript preview:")
        print("-" * 60)
        print(video.transcript[:500] + "..." if len(video.transcript) > 500 else video.transcript)
        print("-" * 60)
        print()

        # Check existing moments
        existing_moments = Moment.query.filter_by(video_id=video_id).all()
        if existing_moments:
            print(f"ℹ️  Found {len(existing_moments)} existing moments in database:")
            for i, moment in enumerate(existing_moments, 1):
                print(f"   {i}. {moment.title} ({moment.start_time}s - {moment.end_time}s)")
            print()

            choice = input("Delete existing moments and re-analyze? (y/n): ")
            if choice.lower() == 'y':
                for moment in existing_moments:
                    db.session.delete(moment)
                db.session.commit()
                print("✅ Existing moments deleted")
                print()
            else:
                print("Keeping existing moments. Exiting.")
                return

        # Get API key
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
            return

        print("🔍 Analyzing transcript with OpenAI...")
        print(f"API Key: {api_key[:10]}...{api_key[-4:]}")
        print()

        # Initialize service and analyze
        try:
            service = OpenAIService(api_key=api_key)
            moments_data = service.analyze_transcript(
                transcript=video.transcript,
                video_duration=video.duration
            )

            print("✅ Analysis completed successfully!")
            print(f"Found {len(moments_data)} highlight moments")
            print("=" * 60)
            print()

            # Display and save moments
            for i, moment_data in enumerate(moments_data, 1):
                print(f"🎬 Moment {i}:")
                print(f"   Title: {moment_data['title']}")
                print(f"   Time: {moment_data['start_time']}s - {moment_data['end_time']}s")
                print(f"   Duration: {moment_data['end_time'] - moment_data['start_time']:.1f}s")
                print(f"   Score: {moment_data.get('score', 'N/A')}")
                print(f"   Description: {moment_data['description']}")
                print(f"   Reason: {moment_data['reason']}")
                print()

                # Create moment in database
                moment = Moment(
                    video_id=video.id,
                    start_time=moment_data['start_time'],
                    end_time=moment_data['end_time'],
                    title=moment_data['title'],
                    description=moment_data['description'],
                    reason=moment_data['reason'],
                    score=moment_data.get('score', 0.8)
                )
                db.session.add(moment)

            # Update video status
            video.status = 'ready'
            db.session.commit()

            print("=" * 60)
            print("✅ Moments saved to database!")
            print(f"✅ Video status updated to 'ready'")
            print("✨ Test completed successfully!")

        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            print()
            print("Common issues:")
            print("- Check if OPENAI_API_KEY is valid")
            print("- Verify you have available quota on your OpenAI account")
            print("- Ensure you have internet connectivity")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Test with video ID from command line
        try:
            video_id = int(sys.argv[1])
            test_video_moments(video_id)
        except ValueError:
            print("❌ Invalid video ID. Please provide a numeric video ID.")
            print("Usage: python test_openai_service.py <video_id>")
    else:
        # Test with sample transcript
        print("Running with sample transcript (no video ID provided)")
        print("To test with a real video, use: python test_openai_service.py <video_id>")
        print()
        test_analyze_transcript()
