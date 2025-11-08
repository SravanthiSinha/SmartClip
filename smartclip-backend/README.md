# SmartClip Backend

AI-powered video moment detection and clipping backend built with Flask, Mux Video API, and OpenAI GPT.

## 🎯 Overview

SmartClip automatically analyzes video content, identifies highlight moments using AI, and creates shareable clips with social media captions. Perfect for content creators, marketers, and anyone who needs to extract the best moments from long-form videos.

## ✨ Features

- **Video Upload**: Direct upload via Mux 
- **AI Transcription**: Automatic transcript generation using Mux Whisper API
- **Smart Analysis**: GPT-4 powered moment detection based on:
  - Emotional peaks and engagement
  - Key insights and "aha moments"
  - Compelling stories
  - Quotable statements
  - Topic changes
- **Automated Clipping**: One-click clip generation with Mux Clipping API
- **Social Media Ready**: AI-generated captions and hashtags
- **RESTful API**: Clean, well-documented endpoints
- **Database Tracking**: PostgreSQL/SQLite for metadata storage

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          Flask Backend (app.py)          │
├─────────────────────────────────────────┤
│  Routes:                                 │
│  - POST /api/videos/upload               │           
│  - GET  /api/videos/:id                  │
│  - GET  /api/videos/:id/status           │
│  - POST /api/videos/:id/analyze          │
│  - GET  /api/videos/:id/moments          │
│  - POST /api/moments/:id/create-clip     │
│  - GET  /api/clips/:id                   │
└──────┬──────────────────┬───────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ MuxService   │   │OpenAIService │
│              │   │              │
│ - Uploads    │   │ - Analysis   │
│ - Transcripts│   │ - Captions   │
│ - Clipping   │   │ - GPT-4      │
└──────────────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │
│  Database    │
└──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL (or SQLite for development)
- Mux account ([Sign up](https://dashboard.mux.com))
- OpenAI API key ([Get key](https://platform.openai.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smartclip-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   MUX_TOKEN_ID=your_mux_token_id
   MUX_TOKEN_SECRET=your_mux_token_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Initialize database:**
   ```bash
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

6. **Run the server:**
   ```bash
   python app.py
   ```

Server will start at `http://localhost:5000`

## 📚 API Documentation

### Upload Video

**Create Direct Upload URL**
```http
POST /api/videos/upload
Content-Type: application/json

Response:
{
  "success": true,
  "video_id": 1,
  "upload_url": "https://storage.googleapis.com/...",
  "upload_id": "abc123"
}
```

### Get Video

**Get Video Details**
```http
GET /api/videos/{video_id}

Response:
{
  "success": true,
  "video": {
    "id": 1,
    "status": "ready",
    "duration": 120.5,
    ...
  }
}
```

**Get Video Status**
```http
GET /api/videos/{video_id}/status

Response:
{
  "success": true,
  "status": "ready",
  "video_id": 1,
  "asset_id": "abc123",
  "duration": 120.5
}
```

### Analyze Video

**Detect Moments**
```http
POST /api/videos/{video_id}/analyze

Response:
{
  "success": true,
  "moments": [
    {
      "id": 1,
      "start_time": 45.5,
      "end_time": 78.2,
      "title": "The Surprising Truth About AI",
      "description": "Speaker reveals unexpected insight...",
      "reason": "Contains surprising revelation...",
      "score": 0.92
    }
  ],
  "status": "ready"
}
```

### Get Moments

```http
GET /api/videos/{video_id}/moments

Response:
{
  "success": true,
  "moments": [...]
}
```

### Create Clip

```http
POST /api/moments/{moment_id}/create-clip

Response:
{
  "success": true,
  "clip": {
    "id": 1,
    "asset_id": "clip123",
    "playback_id": "play456",
    "caption": "Check out this amazing insight!",
    "hashtags": ["AI", "TechTalk", "Innovation"],
    "status": "processing"
  }
}
```

### Get Clip

```http
GET /api/clips/{clip_id}

Response:
{
  "success": true,
  "clip": {
    "id": 1,
    "status": "ready",
    "download_url": "https://stream.mux.com/.../high.mp4",
    "playback_id": "play456",
    ...
  }
}
```

## 🗄️ Database Schema

### Videos Table
- `id` - Primary key
- `upload_id` - Mux upload ID
- `asset_id` - Mux asset ID
- `playback_id` - Mux playback ID
- `source_url` - Original video URL
- `duration` - Video duration (seconds)
- `status` - Processing status
- `transcript` - Full transcript text
- `created_at`, `updated_at`

### Moments Table
- `id` - Primary key
- `video_id` - Foreign key to videos
- `start_time`, `end_time` - Timing (seconds)
- `title` - Moment title
- `description` - Description
- `reason` - Why detected
- `score` - Confidence (0-1)
- `created_at`

### Clips Table
- `id` - Primary key
- `moment_id` - Foreign key to moments
- `asset_id` - Mux clip asset ID
- `playback_id` - Mux playback ID
- `download_url` - MP4 download URL
- `status` - Processing status
- `caption` - Social media caption
- `hashtags` - Comma-separated hashtags
- `created_at`, `updated_at`



## Environment Variables for Production

```env
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/smartclip
SECRET_KEY=your-production-secret-key
```

## 🔐 Mux Webhook Setup

1. Go to [Mux Dashboard → Settings → Webhooks](https://dashboard.mux.com/settings/webhooks)
2. Add webhook URL: `https://your-domain.com/api/webhooks/mux`
3. Subscribe to events:
   - `video.asset.ready`
   - `video.asset.track.ready`
4. Copy webhook secret to `.env`

## 👤 Author

**Sravanthi Sinha**
- GitHub: [@sravanthisinha](https://github.com/sravanthisinha)

## 🙏 Acknowledgments

- [Mux](https://mux.com) for video infrastructure
- [OpenAI](https://openai.com) for GPT-4 API
- Flask community for excellent documentation

## 🎯 Video Processing Workflow

### Step-by-Step Process

1. **Upload Initialization** (`POST /api/videos/upload`)
   - Creates Mux direct upload URL
   - Creates video record with `waiting_for_upload` status
   - Returns upload URL to frontend

2. **Video Upload** (Frontend → Mux)
   - Frontend uploads file directly to Mux using provided URL
   - Mux processes upload and creates asset

3. **Encoding Phase** (`status: processing`)
   - Mux encodes video into HLS format with multiple bitrates
   - Generates playback IDs for streaming
   - Automatically starts transcript generation (Whisper API)
   - Webhook updates video status when asset is ready

4. **Transcription Phase** (`status: transcribing`)
   - Mux generates timestamped transcript using Whisper
   - VTT file is created and made available
   - Status updates when transcript track is ready

5. **Analysis Phase** (`POST /api/videos/:id/analyze`)
   - Fetches transcript from Mux
   - Sends to OpenAI GPT-4 for moment detection
   - Stores detected moments in database
   - Updates status to `ready`

6. **Clip Generation** (`POST /api/moments/:id/create-clip`)
   - Uses Mux Clipping API to create clips
   - Generates social media captions with GPT-4
   - Stores clip metadata in database

### Status Flow Diagram

```
waiting_for_upload → uploading → processing → transcribing → analyzing → ready
                                       ↓
                                    error (if any step fails)
```

## 🧩 Service Architecture

### MuxService (`services/mux_service.py`)

Handles all Mux Video API interactions:

- `create_direct_upload()` - Initialize direct upload
- `get_upload(upload_id)` - Check upload status
- `get_asset(asset_id)` - Fetch asset details
- `generate_transcript(asset_id)` - Request transcript generation
- `get_transcript(asset_id)` - Fetch VTT transcript and parse
- `create_clip(asset_id, start, end)` - Generate clip from asset
- `get_download_url(asset_id)` - Get playback/download URL
- `delete_asset(asset_id)` - Clean up assets

**Key Features:**
- Automatic subtitle generation on upload
- VTT parsing for formatted transcripts
- Error handling and logging
- HTTP Basic Auth with Mux credentials

### OpenAIService (`services/openai_service.py`)

Handles all AI/LLM interactions:

- `analyze_transcript(transcript, duration)` - Detect highlight moments
  - Uses GPT-4 to identify emotional peaks, insights, stories
  - Returns 3-5 moments with timestamps, titles, descriptions
  - Assigns confidence scores to each moment

- `generate_social_caption(title, description)` - Create social media content
  - Generates engaging captions
  - Suggests relevant hashtags
  - Optimized for platform character limits

**Prompt Engineering:**
- Structured prompts for consistent JSON responses
- Context-aware analysis based on video duration
- Emphasis on shareability and engagement potential

### VideoProcessor (`services/video_processor.py`)

Orchestrates complex workflows:

- `analyze_video_content()` - Full analysis pipeline
- `create_clip_from_moment()` - End-to-end clip creation
- `get_video_status()` - Status aggregation
- `batch_create_clips()` - Bulk clip generation
- `cleanup_assets()` - Asset management


## 🐛 Known Issues & Roadmap

### Known Issues
- Transcript generation can take 1-2 minutes for long videos
- Large videos (>2GB) may time out on direct upload
- No retry mechanism for failed Mux API calls
- Limited error context for transcript failures


## Test Upload Flow
```bash
# 1. Create upload
curl -X POST http://localhost:5000/api/videos/upload

# 2. Upload video (use returned URL)
curl -X PUT "<upload_url>" \
  -H "Content-Type: video/mp4" \
  --data-binary "@test_video.mp4"

# 3. Check status
curl http://localhost:5000/api/videos/1/status

# 4. Analyze when ready
curl -X POST http://localhost:5000/api/videos/1/analyze

# 5. Get moments
curl http://localhost:5000/api/videos/1/moments

# 6. Create clip
curl -X POST http://localhost:5000/api/moments/1/create-clip
```

## Clear all data

python clear_database.py

## Common Debugging Scenarios

**Transcript not generating:**
- Check if video has audio: `asset['tracks']`
- Verify language is supported by Whisper
- Check Mux dashboard for transcript status

**Analysis timing out:**
- Reduce transcript length for testing
- Check OpenAI API quota/limits
- Verify GPT-4 model availability

**Clips not generating:**
- Ensure parent asset is `ready` status
- Verify start/end times are within video duration
- Check Mux API quota


## 📚 Additional Resources

- [Mux Video API Docs](https://docs.mux.com/guides/video)
- [Mux Direct Upload Guide](https://docs.mux.com/guides/video/upload-files-directly)
- [Mux Clipping API](https://docs.mux.com/guides/video/create-clips)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)

---

Built with ❤️ for the Mux application
