"""
Video Processor Service
Orchestrates video processing workflows
"""

import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


class VideoProcessor:
    """Orchestrates video processing workflows"""
    
    def __init__(self, mux_service, openai_service):
        """
        Initialize with required services
        
        Args:
            mux_service: MuxService instance
            openai_service: OpenAIService instance
        """
        self.mux_service = mux_service
        self.openai_service = openai_service
    
    def analyze_video_content(self, asset_id: str, video_duration: float = None) -> Dict:
        """
        Analyze video content to detect moments
        
        Args:
            asset_id: Mux asset ID
            video_duration: Video duration in seconds
        
        Returns:
            Dict with analysis results
        """
        logger.info(f"Analyzing video content for asset {asset_id}")
        
        try:
            # Get transcript from Mux
            transcript = self.mux_service.get_transcript(asset_id)
            
            if not transcript:
                # Request transcript generation if not available
                logger.info("Transcript not available, requesting generation")
                self.mux_service.generate_transcript(asset_id)
                
                return {
                    'success': False,
                    'error': 'Transcript not ready yet. Please try again in a few moments.',
                    'status': 'transcribing'
                }
            
            # Analyze with OpenAI
            moments = self.openai_service.analyze_transcript(transcript, video_duration)
            
            logger.info(f"Analysis complete. Found {len(moments)} moments")
            
            return {
                'success': True,
                'moments': moments,
                'transcript': transcript
            }
            
        except Exception as e:
            logger.error(f"Error analyzing video content: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_clip_from_moment(self, asset_id: str, moment: Dict) -> Dict:
        """
        Create a clip from a detected moment
        
        Args:
            asset_id: Source video asset ID
            moment: Moment data with start_time and end_time
        
        Returns:
            Dict with clip details
        """
        logger.info(f"Creating clip from moment: {moment.get('title', 'Untitled')}")
        
        try:
            # Create clip using Mux
            clip_asset = self.mux_service.create_clip(
                asset_id,
                moment['start_time'],
                moment['end_time']
            )
            
            # Generate social media content
            social_content = self.openai_service.generate_social_caption(
                moment['title'],
                moment['description']
            )
            
            logger.info(f"Clip created with asset ID {clip_asset['id']}")
            
            return {
                'success': True,
                'clip_asset_id': clip_asset['id'],
                'playback_id': clip_asset.get('playback_ids', [{}])[0].get('id'),
                'caption': social_content['caption'],
                'hashtags': social_content['hashtags']
            }
            
        except Exception as e:
            logger.error(f"Error creating clip: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_video_status(self, asset_id: str) -> Dict:
        """
        Get current status of video processing
        
        Args:
            asset_id: Mux asset ID
        
        Returns:
            Dict with status information
        """
        try:
            asset = self.mux_service.get_asset(asset_id)
            
            status_info = {
                'success': True,
                'status': asset.get('status'),
                'duration': asset.get('duration'),
                'playback_ids': asset.get('playback_ids', []),
                'tracks': asset.get('tracks', [])
            }
            
            # Check if transcript is ready
            has_transcript = False
            for track in asset.get('tracks', []):
                if track.get('type') == 'text':
                    has_transcript = True
                    break
            
            status_info['has_transcript'] = has_transcript
            
            return status_info
            
        except Exception as e:
            logger.error(f"Error getting video status: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def batch_create_clips(self, asset_id: str, moments: List[Dict]) -> List[Dict]:
        """
        Create multiple clips at once
        
        Args:
            asset_id: Source video asset ID
            moments: List of moment data
        
        Returns:
            List of clip results
        """
        logger.info(f"Batch creating {len(moments)} clips")
        
        results = []
        for i, moment in enumerate(moments):
            try:
                result = self.create_clip_from_moment(asset_id, moment)
                results.append({
                    'moment_index': i,
                    'moment_title': moment.get('title'),
                    **result
                })
            except Exception as e:
                logger.error(f"Error creating clip {i}: {str(e)}")
                results.append({
                    'moment_index': i,
                    'moment_title': moment.get('title'),
                    'success': False,
                    'error': str(e)
                })
        
        success_count = sum(1 for r in results if r.get('success'))
        logger.info(f"Batch complete: {success_count}/{len(moments)} clips created successfully")
        
        return results
    
    def cleanup_assets(self, asset_ids: List[str]) -> Dict:
        """
        Clean up multiple assets
        
        Args:
            asset_ids: List of asset IDs to delete
        
        Returns:
            Dict with cleanup results
        """
        logger.info(f"Cleaning up {len(asset_ids)} assets")
        
        deleted = []
        failed = []
        
        for asset_id in asset_ids:
            try:
                if self.mux_service.delete_asset(asset_id):
                    deleted.append(asset_id)
                else:
                    failed.append(asset_id)
            except Exception as e:
                logger.error(f"Error deleting asset {asset_id}: {str(e)}")
                failed.append(asset_id)
        
        return {
            'success': len(failed) == 0,
            'deleted_count': len(deleted),
            'failed_count': len(failed),
            'deleted_assets': deleted,
            'failed_assets': failed
        }
