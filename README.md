# SmartClip: AI-Powered Video Moment Detection & Clipping

SmartClip is a full-stack web application that uses AI and Mux Video APIs to help content creators and marketers automatically detect and create highlight clips from long-form videos—perfect for sharing on social media or producing compelling short-form content.

---

## Problem

Content creators and marketers frequently struggle to identify engaging moments in lengthy videos for highlights, social clips, or promotional materials. Manually scanning hours of footage and editing video is time-consuming, tedious, and often misses golden moments that could drive engagement.

---

## Solution

SmartClip leverages Mux Video APIs and OpenAI GPT-4 to automate highlight discovery and creation:

- **Automatic Transcription**
  Utilizes Mux's Whisper-powered auto-generated transcripts with timestamps.

- **AI-Powered Highlight Detection**
  GPT-4 analyzes transcripts to identify:
    - Emotional peaks and engaging conversations
    - Key insights and "aha moments"
    - Compelling stories and quotable statements
    - Topic changes and natural segment boundaries

- **Automated Clip Generation**
  Instantly creates video clips at detected highlight moments using the Mux Clipping API.

- **Social Media Ready**
  AI generates catchy captions and relevant hashtags for each clip.

- **Streamlined Workflow**
  Clean, responsive UI for reviewing highlights, previewing clips, and exporting with one click.

---

## Demo

[![Demo](https://image.mux.com/WI3fYOgyvnfRhovf2z02Y6ODT7eDaRbIg2MNCES4CixY/thumbnail.png?width=214&height=121&time=36)](https://player.mux.com/WI3fYOgyvnfRhovf2z02Y6ODT7eDaRbIg2MNCES4CixY)

*Click to watch the demo (Ctrl/Cmd + Click to open in a new tab)*

---

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React 18 + TypeScript + Vite  |
| Styling     | Tailwind CSS                   |
| Backend     | Flask (Python)                 |
| AI/LLM      | OpenAI GPT-4                   |
| Video       | Mux Video API + Mux Player     |
| Database    | SQLAlchemy (SQLite/PostgreSQL) |

---

## Features

- ✅ **Direct Video Upload** - Mux Direct Upload with progress tracking
- ✅ **Automatic Transcription** - Mux Whisper API integration
- ✅ **AI Analysis** - GPT-4 powered moment detection (3-5 highlights per video)
- ✅ **Interactive Timeline** - Visual representation of suggested highlights with timestamps
- ✅ **Clip Preview** - Watch each suggested clip before generating
- ✅ **One-Click Clip Generation** - Mux Clipping API integration
- ✅ **Download & Share** - Export clips for social media
- ✅ **Real-Time Status Updates** - Live processing status with detailed progress indicators
- ✅ **Video Library** - Browse and manage all processed videos

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- [Mux Account](https://dashboard.mux.com) (with API credentials)
- [OpenAI API Key](https://platform.openai.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sravanthisinha/smart-clip.git
   cd smart-clip
   ```

2. **Set up the backend:**
   ```bash
   cd smartclip-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your MUX_TOKEN_ID, MUX_TOKEN_SECRET, and OPENAI_API_KEY
   python app.py
   ```
   Backend runs at `http://localhost:5000`

3. **Set up the frontend:**
   ```bash
   cd ../smartclip-frontend
   npm install
   cp .env.example .env
   # Edit .env and set VITE_API_BASE_URL=http://localhost:5000
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`

4. **Open your browser:**
   Navigate to `http://localhost:5173` and start clipping!

For detailed setup instructions, see:
- [Frontend README](smartclip-frontend/README.md)
- [Backend README](smartclip-backend/README.md)

---

## How It Works

1. **Upload** - User uploads a video file or provides a URL
2. **Processing** - Mux encodes the video for optimal streaming and playback
3. **Transcription** - Mux Whisper automatically generates timestamped transcripts
4. **Analysis** - GPT-4 analyzes the transcript to identify compelling moments
5. **Review** - User previews suggested highlights in the video player
6. **Generate** - User selects moments and creates clips with one click
7. **Export** - Download clips or share directly to social media

---

## Video Processing Pipeline

```
┌─────────────┐
│ User Upload │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Mux Encoding      │  ← "Encoding your video for optimal playback..."
│ (HLS, Multi-bitrate)│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Mux Whisper         │  ← "Converting speech to text..."
│ (Auto Transcription)│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   GPT-4 Analysis    │  ← "Finding the most engaging moments..."
│ (Moment Detection)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Ready for Review  │
└─────────────────────┘
```

---

## API Documentation

### Key Endpoints

- `POST /api/videos/upload` - Create direct upload URL
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/status` - Get processing status
- `POST /api/videos/:id/analyze` - Trigger AI analysis
- `GET /api/videos/:id/moments` - Get detected moments
- `POST /api/moments/:id/create-clip` - Generate clip
- `GET /api/clips/:id` - Get clip details

See [Backend README](smartclip-backend/README.md) for complete API documentation.

---

## Project Structure

```
smart-clip/
├── smartclip-frontend/     # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript definitions
│   └── package.json
│
├── smartclip-backend/      # Flask backend
│   ├── services/           # Mux, OpenAI, VideoProcessor
│   ├── app.py             # Main Flask application
│   ├── database.py        # SQLAlchemy models
│   └── requirements.txt
│
└── README.md              # This file
```


---

## Future Enhancements

- [ ] Multi-language support for transcription
- [ ] Batch processing for multiple videos
- [ ] User authentication and workspace management
- [ ] Advanced filtering (keywords, duration, engagement score)
- [ ] Direct social media platform integration
- [ ] Real-time progress updates via WebSockets
- [ ] Support for live stream clipping
- [ ] Custom AI prompts for specific use cases

---

## Author

**Sravanthi Sinha**
- GitHub: [@sravanthisinha](https://github.com/sravanthisinha)

---

## Acknowledgments

- [Mux](https://mux.com) for exceptional video infrastructure
- [OpenAI](https://openai.com) for GPT-4 API
- The open-source community for incredible tools and libraries

---

## License

This project was built as a demonstration application for Mux.

Built with ❤️ for creators everywhere