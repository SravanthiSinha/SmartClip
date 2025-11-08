"""
SmartClip Backend - Flask API
AI-powered video moment detection and clipping with Mux integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load environment variables FIRST - before importing Config
load_dotenv()

# Import services
from services.mux_service import MuxService
from services.openai_service import OpenAIService
from services.video_processor import VideoProcessor
from database import db, Video, Moment, Clip
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize database
db.init_app(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
mux_service = MuxService(
    token_id=app.config['MUX_TOKEN_ID'],
    token_secret=app.config['MUX_TOKEN_SECRET']
)
openai_service = OpenAIService(api_key=app.config['OPENAI_API_KEY'])
video_processor = VideoProcessor(mux_service, openai_service)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })


@app.route('/api/videos', methods=['GET'])
def list_videos():
    """
    Get all videos ordered by creation date (newest first)
    Only returns videos that are ready or processing
    """
    try:
        # Query videos, excluding failed uploads
        videos = Video.query.filter(
            Video.status.in_(['processing', 'transcribing', 'analyzing', 'ready'])
        ).order_by(Video.created_at.desc()).all()

        return jsonify({
            'success': True,
            'videos': [video.to_dict() for video in videos]
        }), 200

    except Exception as e:
        logger.error(f"Error listing videos: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/videos/upload', methods=['POST'])
def upload_video():
    """
    Create a Mux direct upload URL for video upload
    Returns upload URL and asset ID
    """
    try:
        data = request.get_json(silent=True) or {}
        # Create direct upload
        upload_data = mux_service.create_direct_upload()
        print(upload_data)

        # Create video record in database
        with app.app_context():
            video = Video(
                upload_id=upload_data['id'],
                status='waiting_for_upload'
            )
            db.session.add(video)
            db.session.commit()

            video_id = video.id

        logger.info(f"Created upload for video {video_id}")

        # Return in camelCase format to match frontend expectations
        return jsonify({
            'success': True,
            'videoId': video_id,
            'uploadUrl': upload_data['url'],
            'assetId': upload_data['id']
        }), 201

    except Exception as e:
        logger.error(f"Error creating upload: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/videos/<int:video_id>', methods=['GET'])
def get_video(video_id):
    """
    Get video details including processing status
    """
    try:
        video = Video.query.get(video_id)
        print(video)
        if not video:
            return jsonify({
                'success': False,
                'error': 'Video not found'
            }), 404

        # If video only has upload_id (no asset yet), check upload status
        if video.upload_id and not video.asset_id:
            try:
                upload = mux_service.get_upload(video.upload_id)

                # Check if asset was created from upload
                if upload.get('asset_id'):
                    video.asset_id = upload['asset_id']
                    video.status = 'processing'
                    db.session.commit()
                    logger.info(f"Video {video.id} asset found: {upload['asset_id']}")
            except Exception as e:
                logger.error(f"Error checking upload status: {str(e)}")

        # If video has asset_id, get latest status from Mux
        if video.asset_id:
            asset = mux_service.get_asset(video.asset_id)

            # Only update status from Mux if we're not in analysis/transcription phase
            # Once we start analyzing, we manage the status ourselves
            # Don't overwrite 'processing' (waiting for analysis), analysis statuses, or error
            if video.status not in ['processing', 'analyzing', 'transcribing', 'error', 'ready']:
                video.status = asset.get('status', video.status)

            if asset.get('duration'):
                video.duration = asset['duration']

            # Get playback ID if not set
            if not video.playback_id and asset.get('playback_ids'):
                video.playback_id = asset['playback_ids'][0]['id']

            db.session.commit()

        return jsonify({
            'success': True,
            'video': video.to_dict()
        })

    except Exception as e:
        logger.error(f"Error getting video {video_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/videos/<int:video_id>/status', methods=['GET'])
def get_video_status(video_id):
    """
    Get video processing status
    """
    try:
        video = Video.query.get(video_id)

        if not video:
            return jsonify({
                'success': False,
                'error': 'Video not found'
            }), 404

        # If video only has upload_id (no asset yet), check upload status
        if video.upload_id and not video.asset_id:
            try:
                upload = mux_service.get_upload(video.upload_id)

                # Check if asset was created from upload
                if upload.get('asset_id'):
                    video.asset_id = upload['asset_id']
                    video.status = 'processing'
                    db.session.commit()
                    logger.info(f"Video {video.id} asset found: {upload['asset_id']}")
                # Otherwise check upload status
                elif upload.get('status') == 'waiting':
                    video.status = 'waiting_for_upload'
                elif upload.get('status') == 'asset_created':
                    video.status = 'processing'
                elif upload.get('status') in ['errored', 'timed_out', 'cancelled']:
                    video.status = 'error'
                    upload_status = upload.get('status')
                    video.error_message = f"Upload {upload_status}: The video upload did not complete successfully"
                    logger.error(f"Upload {video.upload_id} failed with status: {upload_status}")

                db.session.commit()
            except Exception as e:
                logger.error(f"Error checking upload status: {str(e)}")

        # If video has asset_id, get latest status from Mux
        if video.asset_id:
            asset = mux_service.get_asset(video.asset_id)

            # Only update status from Mux if we're not in analysis/transcription phase
            # Once we start analyzing, we manage the status ourselves
            # Don't overwrite 'processing' (waiting for analysis), analysis statuses, or error
            if video.status not in ['processing', 'analyzing', 'transcribing', 'error', 'ready']:
                video.status = asset.get('status', video.status)

            if asset.get('duration'):
                video.duration = asset['duration']

            # Get playback ID if not set
            if not video.playback_id and asset.get('playback_ids'):
                video.playback_id = asset['playback_ids'][0]['id']

            db.session.commit()

        return jsonify({
            'success': True,
            'status': video.status,
            'videoId': str(video.id),
            'assetId': video.asset_id,
            'duration': video.duration
        })

    except Exception as e:
        logger.error(f"Error getting video status {video_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/videos/<int:video_id>/analyze', methods=['POST'])
def analyze_video(video_id):
    """
    Analyze video to detect highlight moments
    Steps:
    1. Get transcript from Mux
    2. Analyze transcript with OpenAI
    3. Store detected moments in database
    """
    try:
        video = Video.query.get(video_id)
        
        if not video:
            return jsonify({
                'success': False,
                'error': 'Video not found'
            }), 404
        
        if not video.asset_id:
            return jsonify({
                'success': False,
                'error': 'Video asset not ready'
            }), 400
        
        # Update status
        video.status = 'analyzing'
        db.session.commit()
        
        # Check if transcript generation failed
        asset = mux_service.get_asset(video.asset_id)

        text_track_errored = False
        if 'tracks' in asset:
            for track in asset['tracks']:
                if track.get('type') == 'text' and track.get('status') == 'errored':
                    text_track_errored = True
                    break

        if text_track_errored:
            video.status = 'error'
            video.error_message = 'Transcript generation failed. The video may not have audio or the audio quality may be insufficient.'
            db.session.commit()

            return jsonify({
                'success': False,
                'error': 'Transcript generation failed. The video may not have audio or the audio quality may be insufficient.',
                'status': 'error'
            }), 400

        # Get transcript from Mux
        logger.info(f"Getting transcript for video {video_id}")
        transcript = mux_service.get_transcript(video.asset_id)

        if not transcript:
            # Transcript not ready yet - it may still be generating
            # (subtitles were requested at upload time via generate_subtitles in new_asset_settings)
            logger.info(f"Transcript not available yet for video {video_id}, waiting for generation to complete")

            video.status = 'transcribing'
            db.session.commit()

            return jsonify({
                'success': True,
                'message': 'Transcript generation in progress. Please check back in a few moments.',
                'status': 'transcribing'
            })
        
        # Store transcript
        video.transcript = transcript
        db.session.commit()
        
        # Analyze with OpenAI
        logger.info(f"Analyzing transcript for video {video_id}")
        moments_data = openai_service.analyze_transcript(transcript, video.duration)
        
        # Store moments in database
        for moment_data in moments_data:
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
        
        video.status = 'ready'
        db.session.commit()
        
        logger.info(f"Analysis complete for video {video_id}. Found {len(moments_data)} moments.")
        
        return jsonify({
            'success': True,
            'moments': [m.to_dict() for m in video.moments],
            'status': 'ready'
        })
        
    except Exception as e:
        logger.error(f"Error analyzing video {video_id}: {str(e)}")
        
        # Update video status on error
        video = Video.query.get(video_id)
        if video:
            video.status = 'error'
            db.session.commit()
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/videos/<int:video_id>/moments', methods=['GET'])
def get_moments(video_id):
    """
    Get all detected moments for a video
    """
    try:
        video = Video.query.get(video_id)
        
        if not video:
            return jsonify({
                'success': False,
                'error': 'Video not found'
            }), 404
        
        moments = Moment.query.filter_by(video_id=video_id).all()
        
        return jsonify({
            'success': True,
            'moments': [moment.to_dict() for moment in moments]
        })
        
    except Exception as e:
        logger.error(f"Error getting moments for video {video_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/moments/<int:moment_id>/create-clip', methods=['POST'])
def create_clip(moment_id):
    """
    Generate a clip from a moment using Mux clipping API
    """
    try:
        moment = Moment.query.get(moment_id)
        
        if not moment:
            return jsonify({
                'success': False,
                'error': 'Moment not found'
            }), 404
        
        video = moment.video
        
        if not video.asset_id:
            return jsonify({
                'success': False,
                'error': 'Video asset not available'
            }), 400
        
        # Generate social media caption
        caption = openai_service.generate_social_caption(
            moment.title,
            moment.description
        )
        
        # Create clip using Mux
        logger.info(f"Creating clip for moment {moment_id}")
        clip_asset = mux_service.create_clip(
            video.asset_id,
            moment.start_time,
            moment.end_time
        )
        
        # Store clip in database
        clip = Clip(
            moment_id=moment.id,
            asset_id=clip_asset['id'],
            playback_id=clip_asset.get('playback_ids', [{}])[0].get('id'),
            status='processing',
            caption=caption['caption'],
            hashtags=','.join(caption['hashtags'])
        )
        db.session.add(clip)
        db.session.commit()
        
        logger.info(f"Clip created with ID {clip.id}")
        
        return jsonify({
            'success': True,
            'clip': clip.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating clip for moment {moment_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clips/<int:clip_id>', methods=['GET'])
def get_clip(clip_id):
    """
    Get clip details and download URL
    """
    try:
        clip = Clip.query.get(clip_id)
        
        if not clip:
            return jsonify({
                'success': False,
                'error': 'Clip not found'
            }), 404
        
        # Get latest status from Mux
        if clip.asset_id:
            asset = mux_service.get_asset(clip.asset_id)
            clip.status = asset.get('status', clip.status)
            
            # Get download URL if ready
            if clip.status == 'ready':
                clip.download_url = mux_service.get_download_url(clip.asset_id)
            
            db.session.commit()
        
        return jsonify({
            'success': True,
            'clip': clip.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error getting clip {clip_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/webhooks/mux', methods=['POST'])
def mux_webhook():
    """
    Handle Mux webhooks for asset status updates
    """
    try:
        data = request.get_json(silent=True) or {}
        event_type = data.get('type')
        
        logger.info(f"Received Mux webhook: {event_type}")

        if event_type == 'video.upload.asset_created':
            # Upload completed and asset was created
            upload_id = data['data']['id']
            asset_id = data['data']['asset_id']

            # Find video by upload_id and update with asset_id
            video = Video.query.filter_by(upload_id=upload_id).first()
            if video:
                video.asset_id = asset_id
                video.status = 'processing'
                db.session.commit()
                logger.info(f"Video {video.id} asset created: {asset_id}")

        elif event_type == 'video.asset.ready':
            asset_id = data['data']['id']

            # Update video metadata but keep status as 'processing'
            # Don't set to 'ready' yet - we still need to wait for transcript and analyze
            video = Video.query.filter_by(asset_id=asset_id).first()
            if video:
                # Only update status if not already analyzing/transcribing
                if video.status not in ['analyzing', 'transcribing', 'ready']:
                    video.status = 'processing'

                # Get playback ID
                asset = mux_service.get_asset(asset_id)
                if asset.get('playback_ids'):
                    video.playback_id = asset['playback_ids'][0]['id']

                video.duration = asset.get('duration')
                db.session.commit()

                logger.info(f"Video {video.id} asset is ready for processing")
        
        elif event_type == 'video.asset.track.ready':
            # Transcript track is ready - just log it
            # Don't change status here - let the /analyze endpoint handle it
            asset_id = data['data']['id']
            track_type = data['data'].get('track_type')

            if track_type == 'text':
                video = Video.query.filter_by(asset_id=asset_id).first()
                if video:
                    logger.info(f"Transcript track ready for video {video.id} - ready for analysis")
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# Create tables
with app.app_context():
    db.create_all()
    logger.info("Database tables created")


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=app.config['DEBUG']
    )
