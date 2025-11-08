"""
Configuration settings for SmartClip Backend
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
    'DATABASE_URL',
    'sqlite:///smartclip_dev.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # Mux API
    MUX_TOKEN_ID = os.getenv('MUX_TOKEN_ID')
    MUX_TOKEN_SECRET = os.getenv('MUX_TOKEN_SECRET')
    MUX_WEBHOOK_SECRET = os.getenv('MUX_WEBHOOK_SECRET')
    
    # OpenAI API
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4-turbo-preview')
    
    # Application settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 * 1024  # 16GB max file size
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm'}
    
    # Clip settings
    MIN_CLIP_DURATION = 10  # seconds
    MAX_CLIP_DURATION = 180  # seconds (3 minutes)
    DEFAULT_MOMENTS_COUNT = 5
    
    # CORS
    CORS_HEADERS = 'Content-Type'
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        required = [
            'MUX_TOKEN_ID',
            'MUX_TOKEN_SECRET',
            'OPENAI_API_KEY'
        ]
        
        missing = []
        for key in required:
            if not os.getenv(key):
                missing.append(key)
        
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///smartclip_dev.db'
    )


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
    # Ensure all required vars are set
    def __init__(self):
        super().__init__()
        Config.validate()


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
