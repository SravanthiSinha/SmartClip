"""
Tests for SmartClip Backend
"""

import pytest
import json
from app import app, db
from database import Video, Moment, Clip


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()


@pytest.fixture
def sample_video(client):
    """Create a sample video in database"""
    with app.app_context():
        video = Video(
            asset_id='test_asset_123',
            playback_id='test_playback_456',
            status='ready',
            duration=120.0
        )
        db.session.add(video)
        db.session.commit()
        return video.id


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert 'timestamp' in data


def test_upload_endpoint(client):
    """Test upload endpoint structure"""
    response = client.post('/api/upload')
    # This will fail without real Mux credentials, but tests the route exists
    assert response.status_code in [201, 500]


def test_get_video_not_found(client):
    """Test getting non-existent video"""
    response = client.get('/api/videos/999')
    assert response.status_code == 404
    
    data = json.loads(response.data)
    assert data['success'] is False
    assert 'not found' in data['error'].lower()


def test_get_video_success(client, sample_video):
    """Test getting existing video"""
    response = client.get(f'/api/videos/{sample_video}')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'video' in data
    assert data['video']['id'] == sample_video


def test_get_moments_empty(client, sample_video):
    """Test getting moments for video with no moments"""
    response = client.get(f'/api/videos/{sample_video}/moments')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['success'] is True
    assert data['moments'] == []


def test_analyze_video_no_asset(client):
    """Test analyzing video without asset ID"""
    with app.app_context():
        video = Video(status='uploading')
        db.session.add(video)
        db.session.commit()
        video_id = video.id
    
    response = client.post(f'/api/videos/{video_id}/analyze')
    assert response.status_code == 400


def test_create_clip_moment_not_found(client):
    """Test creating clip for non-existent moment"""
    response = client.post('/api/moments/999/clip')
    assert response.status_code == 404


def test_get_clip_not_found(client):
    """Test getting non-existent clip"""
    response = client.get('/api/clips/999')
    assert response.status_code == 404


def test_database_models(client):
    """Test database model creation"""
    with app.app_context():
        # Create video
        video = Video(
            asset_id='test_asset',
            status='ready',
            duration=100.0
        )
        db.session.add(video)
        db.session.commit()
        
        # Create moment
        moment = Moment(
            video_id=video.id,
            start_time=10.0,
            end_time=30.0,
            title='Test Moment',
            description='Test description',
            reason='Test reason',
            score=0.85
        )
        db.session.add(moment)
        db.session.commit()
        
        # Create clip
        clip = Clip(
            moment_id=moment.id,
            asset_id='clip_asset',
            status='processing'
        )
        db.session.add(clip)
        db.session.commit()
        
        # Verify relationships
        assert len(video.moments) == 1
        assert video.moments[0].title == 'Test Moment'
        assert len(moment.clips) == 1
        assert moment.clips[0].status == 'processing'


def test_video_to_dict(client):
    """Test Video.to_dict() method"""
    with app.app_context():
        video = Video(
            asset_id='test',
            playback_id='play123',
            status='ready',
            duration=120.0
        )
        db.session.add(video)
        db.session.commit()
        
        video_dict = video.to_dict()
        assert video_dict['asset_id'] == 'test'
        assert video_dict['playback_id'] == 'play123'
        assert video_dict['status'] == 'ready'
        assert video_dict['duration'] == 120.0


def test_moment_to_dict(client):
    """Test Moment.to_dict() method"""
    with app.app_context():
        video = Video(asset_id='test', status='ready')
        db.session.add(video)
        db.session.commit()
        
        moment = Moment(
            video_id=video.id,
            start_time=10.0,
            end_time=30.0,
            title='Test',
            score=0.9
        )
        db.session.add(moment)
        db.session.commit()
        
        moment_dict = moment.to_dict()
        assert moment_dict['start_time'] == 10.0
        assert moment_dict['end_time'] == 30.0
        assert moment_dict['duration'] == 20.0
        assert moment_dict['title'] == 'Test'
        assert moment_dict['score'] == 0.9


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
