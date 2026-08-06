import os
from datetime import timedelta
from dotenv import load_dotenv

# Load env variables from .env file relative to this file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smartflow-secret-key-fallback')
    
    # Supabase / Managed Postgres URI normalization
    db_uri = os.environ.get('DATABASE_URL', 'postgresql://localhost:5432/smartflow')
    if db_uri.startswith("postgres://"):
        db_uri = db_uri.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = db_uri
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # SQLAlchemy connection pool settings optimized for Supabase transaction poolers
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20
    }
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smartflow-jwt-secret-key-fallback')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # CORS Origins configuration
    raw_origins = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in raw_origins.split(',') if origin.strip()]

    # Upload folder
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
