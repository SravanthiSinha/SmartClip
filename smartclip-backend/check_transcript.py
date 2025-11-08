"""
Script to check transcript for a specific video ID
"""

import os
from dotenv import load_dotenv
from services.mux_service import MuxService
from database import db, Video
from flask import Flask
from config import Config

# Load environment variables
load_dotenv()

# Setup minimal Flask app for database access
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def check_video_transcript(video_id):
    """Check and display transcript for a video"""

    with app.app_context():
        # Get video from database
        video = Video.query.get(video_id)

        if not video:
            print(f"❌ Video {video_id} not found in database")
            return

        print("=" * 60)
        print(f"📹 Video ID: {video_id}")
        print(f"Asset ID: {video.asset_id}")
        print(f"Status: {video.status}")
        print(f"Duration: {video.duration}s")
        print("=" * 60)
        print()

        # Check if transcript exists in database
        if video.transcript:
            print("✅ Transcript found in database:")
            print("-" * 60)
            print(video.transcript)
            print("-" * 60)
            print(f"\nTranscript length: {len(video.transcript)} characters")
        else:
            print("⚠️  No transcript in database. Attempting to fetch from Mux...")
            print()

            # Initialize Mux service
            mux_service = MuxService(
                token_id=os.getenv('MUX_TOKEN_ID'),
                token_secret=os.getenv('MUX_TOKEN_SECRET')
            )

            # Get asset details
            asset = mux_service.get_asset(video.asset_id)

            print("Asset tracks:")
            if 'tracks' in asset:
                for track in asset['tracks']:
                    print(f"  - Type: {track.get('type')}, Status: {track.get('status')}")
                    if track.get('type') == 'text':
                        print(f"    Text type: {track.get('text_type')}")
                        print(f"    Track ID: {track.get('id')}")
            else:
                print("  No tracks found")

            print()

            # Try to get transcript
            transcript = mux_service.get_transcript(video.asset_id)

            if transcript:
                print("✅ Transcript fetched from Mux:")
                print("-" * 60)
                print(transcript)
                print("-" * 60)
                print(f"\nTranscript length: {len(transcript)} characters")

                # Save to database
                print("\n💾 Saving transcript to database...")
                video.transcript = transcript
                db.session.commit()
                print("✅ Transcript saved to database")
            else:
                print("❌ Could not fetch transcript from Mux")
                print("\nPossible reasons:")
                print("- Video has no audio")
                print("- Transcript generation not enabled")
                print("- Transcript still being generated")
                print("- Transcript generation failed")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        video_id = int(sys.argv[1])
    else:
        video_id = 23  # Default to video 23

    check_video_transcript(video_id)
