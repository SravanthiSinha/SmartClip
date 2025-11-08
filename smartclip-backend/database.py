"""
Database models for SmartClip
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Video(db.Model):
    """Video model - represents uploaded videos"""
    __tablename__ = 'videos'
    
    id = db.Column(db.Integer, primary_key=True)
    upload_id = db.Column(db.String(255), unique=True, nullable=True)
    asset_id = db.Column(db.String(255), unique=True, nullable=True)
    playback_id = db.Column(db.String(255), nullable=True)
    
    # Video metadata
    source_url = db.Column(db.String(1000), nullable=True)
    duration = db.Column(db.Float, nullable=True)  # in seconds
    status = db.Column(db.String(50), default='uploading')
    # Status values: uploading, processing, transcribing, analyzing, ready, error
    error_message = db.Column(db.String(500), nullable=True)

    # Transcript
    transcript = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    moments = db.relationship('Moment', backref='video', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'muxAssetId': self.asset_id,
            'muxPlaybackId': self.playback_id,
            'title': self.source_url or f'Video {self.id}',  # Use source_url as title fallback
            'duration': self.duration or 0,
            'status': self.status,
            'errorMessage': self.error_message,
            'transcript': self.transcript,
            'uploadUrl': self.source_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        status_display = {
            'waiting_for_upload': 'Waiting for Upload',
            'uploading': 'Uploading to Mux',
            'processing': 'Processing Video',
            'transcribing': 'Generating Transcript',
            'analyzing': 'Analyzing with AI',
            'ready': 'Ready',
            'error': 'Error',
            'failed': 'Failed'
        }
        status_text = status_display.get(self.status, self.status)
        return f'<Video {self.id} - {status_text}>'


class Moment(db.Model):
    """Moment model - represents detected highlight moments"""
    __tablename__ = 'moments'
    
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.Integer, db.ForeignKey('videos.id'), nullable=False)
    
    # Timing
    start_time = db.Column(db.Float, nullable=False)  # in seconds
    end_time = db.Column(db.Float, nullable=False)  # in seconds
    
    # Content
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    reason = db.Column(db.Text, nullable=True)  # Why this was detected as a moment
    
    # Metadata
    score = db.Column(db.Float, default=0.8)  # Confidence score (0-1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    clips = db.relationship('Clip', backref='moment', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'videoId': str(self.video_id),
            'startTime': self.start_time,
            'endTime': self.end_time,
            'title': self.title,
            'reasoning': self.reason or self.description or '',
            'confidenceScore': self.score,
            'keywords': [],  # TODO: Extract from description/reason
            'engagementPotential': self._calculate_engagement_potential(),
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

    def _calculate_engagement_potential(self):
        """Calculate engagement potential based on score"""
        if self.score >= 0.8:
            return 'high'
        elif self.score >= 0.6:
            return 'medium'
        else:
            return 'low'
    
    def __repr__(self):
        return f'<Moment {self.id} - {self.title}>'


class Clip(db.Model):
    """Clip model - represents generated video clips"""
    __tablename__ = 'clips'
    
    id = db.Column(db.Integer, primary_key=True)
    moment_id = db.Column(db.Integer, db.ForeignKey('moments.id'), nullable=False)
    
    # Mux data
    asset_id = db.Column(db.String(255), unique=True, nullable=False)
    playback_id = db.Column(db.String(255), nullable=True)
    download_url = db.Column(db.String(1000), nullable=True)
    
    # Status
    status = db.Column(db.String(50), default='processing')
    # Status values: processing, ready, error
    
    # Social media content
    caption = db.Column(db.Text, nullable=True)
    hashtags = db.Column(db.String(500), nullable=True)  # Comma-separated
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'momentId': str(self.moment_id),
            'muxAssetId': self.asset_id,
            'muxPlaybackId': self.playback_id,
            'downloadUrl': self.download_url,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Clip {self.id} - {self.status}>'
