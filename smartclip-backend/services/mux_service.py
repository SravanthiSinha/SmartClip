"""
Mux Video API Service
Handles all interactions with Mux Video API
"""

import requests
from requests.auth import HTTPBasicAuth
import logging

logger = logging.getLogger(__name__)


class MuxService:
    """Service for interacting with Mux Video API"""
    
    BASE_URL = 'https://api.mux.com'
    
    def __init__(self, token_id, token_secret):
        """Initialize with Mux credentials"""
        self.token_id = token_id
        self.token_secret = token_secret
        self.auth = HTTPBasicAuth(token_id, token_secret)
    
    def _make_request(self, method, endpoint, **kwargs):
        """Make authenticated request to Mux API"""
        url = f"{self.BASE_URL}{endpoint}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                auth=self.auth,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"Mux API error: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Request failed: {str(e)}")
            raise
    
    def create_direct_upload(self, cors_origin='*'):
        """
        Create a direct upload URL
        Returns upload URL and ID
        """
        payload = {
            'cors_origin': cors_origin,
            'new_asset_settings': {
                'playback_policy': ['public'],
                'input': [
                    {
                        'generated_subtitles': [
                            {
                                'name': 'English CC',
                                'language_code': 'en'
                            }
                        ]
                    }
                ]
            }
        }

        response = self._make_request(
            'POST',
            '/video/v1/uploads',
            json=payload
        )

        return response['data']
    
    def get_upload(self, upload_id):
        """Get upload details and status"""
        response = self._make_request(
            'GET',
            f'/video/v1/uploads/{upload_id}'
        )
        return response['data']

    def get_asset(self, asset_id):
        """Get asset details"""
        response = self._make_request(
            'GET',
            f'/video/v1/assets/{asset_id}'
        )
        return response['data']
    
    def generate_transcript(self, asset_id):
        """
        Request transcript generation for an asset
        Mux will automatically generate captions using Whisper
        """
        try:
            # First, get the asset to find the audio track
            asset = self.get_asset(asset_id)

            # Find the audio track
            audio_track = None
            if 'tracks' in asset:
                for track in asset['tracks']:
                    if track.get('type') == 'audio':
                        audio_track = track
                        break

            if not audio_track:
                logger.error(f"No audio track found for asset {asset_id}")
                return None

            audio_track_id = audio_track.get('id')
            if not audio_track_id:
                logger.error(f"Audio track has no ID for asset {asset_id}")
                return None

            # Generate subtitles using the audio track
            payload = {
                'generated_subtitles': [
                    {
                        'name': 'English CC',
                        'language_code': 'en'
                    }
                ]
            }

            response = self._make_request(
                'POST',
                f'/video/v1/assets/{asset_id}/tracks/{audio_track_id}/generate-subtitles',
                json=payload
            )

            logger.info(f"Transcript generation started for asset {asset_id}")
            return response.get('data')

        except Exception as e:
            logger.error(f"Error generating transcript: {str(e)}")
            raise
    
    def get_transcript(self, asset_id):
        """
        Get transcript for an asset
        Returns formatted transcript text
        """
        try:
            # Get asset to find text tracks and playback ID
            asset = self.get_asset(asset_id)

            # Find text track
            text_track = None
            if 'tracks' in asset:
                for track in asset['tracks']:
                    if track.get('type') == 'text' and track.get('text_type') == 'subtitles':
                        text_track = track
                        break

            if not text_track:
                logger.warning(f"No text track found for asset {asset_id}")
                return None

            # Check if track is ready
            if text_track.get('status') != 'ready':
                logger.warning(f"Text track not ready yet for asset {asset_id}, status: {text_track.get('status')}")
                return None

            # Get track ID and playback ID
            track_id = text_track.get('id')
            playback_ids = asset.get('playback_ids', [])

            if not track_id or not playback_ids:
                logger.error(f"Missing track_id or playback_id for asset {asset_id}")
                return None

            playback_id = playback_ids[0].get('id')

            # For generated subtitles, the VTT file is accessible via the playback URL
            # Pattern: https://stream.mux.com/{playback_id}/text/{track_id}.vtt
            vtt_url = f"https://stream.mux.com/{playback_id}/text/{track_id}.vtt"

            logger.info(f"Fetching VTT from: {vtt_url}")

            # Download VTT content
            vtt_response = requests.get(vtt_url)
            vtt_response.raise_for_status()

            # Parse VTT to extract text
            transcript = self._parse_vtt(vtt_response.text)

            return transcript

        except Exception as e:
            logger.error(f"Error getting transcript for asset {asset_id}: {str(e)}")
            return None
    
    def _parse_vtt(self, vtt_content):
        """
        Parse VTT file and extract transcript text with timestamps
        """
        lines = vtt_content.split('\n')
        transcript_parts = []
        current_time = None
        current_text = []
        
        for line in lines:
            line = line.strip()
            
            # Skip header and empty lines
            if line.startswith('WEBVTT') or line.startswith('NOTE') or not line:
                continue
            
            # Timestamp line (e.g., "00:00:01.000 --> 00:00:05.000")
            if '-->' in line:
                # Save previous segment if exists
                if current_time and current_text:
                    transcript_parts.append({
                        'timestamp': current_time,
                        'text': ' '.join(current_text)
                    })
                    current_text = []
                
                # Parse new timestamp
                parts = line.split('-->')
                current_time = parts[0].strip()
            
            # Text line
            elif line and not line.isdigit():
                # Remove VTT tags
                clean_text = line.replace('<v ', '').replace('>', '').replace('</v>', '')
                current_text.append(clean_text)
        
        # Add last segment
        if current_time and current_text:
            transcript_parts.append({
                'timestamp': current_time,
                'text': ' '.join(current_text)
            })
        
        # Format as readable transcript
        formatted_transcript = '\n\n'.join([
            f"[{part['timestamp']}] {part['text']}"
            for part in transcript_parts
        ])
        
        return formatted_transcript
    
    def create_clip(self, asset_id, start_time, end_time):
        """
        Create a clip from an existing asset

        Args:
            asset_id: Source asset ID
            start_time: Start time in seconds
            end_time: End time in seconds

        Returns:
            New asset representing the clip
        """
        payload = {
            'input': [
                {
                    'url': f"mux://assets/{asset_id}",
                    'start_time': start_time,
                    'end_time': end_time
                }
            ],
            'playback_policy': ['public']
            # Note: For downloadable clips, we'll use the playback URL
            # Mux automatically generates HLS streams that can be downloaded
        }

        response = self._make_request(
            'POST',
            '/video/v1/assets',
            json=payload
        )

        return response['data']
    
    def get_download_url(self, asset_id):
        """
        Get download URL for an asset
        Returns the playback URL which can be used for streaming/downloading
        Note: For actual MP4 downloads, the frontend should handle video download
        using libraries or browser download functionality with the stream URL
        """
        try:
            asset = self.get_asset(asset_id)
            playback_ids = asset.get('playback_ids', [])

            if not playback_ids:
                logger.warning(f"No playback IDs found for asset {asset_id}")
                return None

            playback_id = playback_ids[0]['id']

            # Return the playback URL for the clip
            # The frontend can use this for both playback and download
            return f"https://stream.mux.com/{playback_id}.m3u8"

        except Exception as e:
            logger.error(f"Error getting download URL: {str(e)}")
            return None
    
    def delete_asset(self, asset_id):
        """Delete an asset"""
        try:
            self._make_request(
                'DELETE',
                f'/video/v1/assets/{asset_id}'
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting asset {asset_id}: {str(e)}")
            return False
    
    def get_playback_url(self, playback_id):
        """Get HLS playback URL"""
        return f"https://stream.mux.com/{playback_id}.m3u8"
