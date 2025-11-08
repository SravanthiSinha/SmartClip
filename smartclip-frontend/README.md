# SmartClip Frontend

Modern, responsive React application for AI-powered video moment detection and clip generation. Built with TypeScript, Tailwind CSS, and Mux Video APIs.

## 🎯 Overview

The SmartClip frontend provides an intuitive interface for content creators to upload videos, view AI-detected highlight moments, and generate shareable clips with a single click. Real-time processing updates keep users informed throughout the video analysis pipeline.

## ✨ Features

- **Direct Video Upload** - Drag & drop or click to upload with real-time progress tracking
- **Video Library** - Browse and manage all processed videos with status indicators
- **AI-Powered Highlights** - View automatically detected moments with titles, descriptions, and confidence scores
- **Interactive Video Player** - Mux Player integration with timeline scrubbing and quality selection
- **Clip Preview** - Watch suggested clips before generating
- **One-Click Generation** - Instant clip creation with download links
- **Social Media Ready** - AI-generated captions and hashtags for each clip
- **Real-Time Status** - Live updates during encoding, transcription, and analysis phases
- **Responsive Design** - Beautiful UI that works seamlessly on desktop, tablet, and mobile
- **Error Handling** - Graceful error messages and retry mechanisms

## 🛠️ Tech Stack

| Category          | Technology           | Purpose                          |
|-------------------|----------------------|----------------------------------|
| Framework         | React 18             | UI library                       |
| Language          | TypeScript           | Type safety and developer experience |
| Build Tool        | Vite                 | Fast dev server and optimized builds |
| Styling           | Tailwind CSS         | Utility-first CSS framework      |
| Routing           | React Router v6      | Client-side navigation           |
| Video Player      | Mux Player React     | High-quality video playback      |
| HTTP Client       | Axios                | API communication                |
| Icons             | Lucide React         | Beautiful, consistent icons      |
| Date Handling     | date-fns             | Date formatting and manipulation |

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see [Backend README](../smartclip-backend/README.md))

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
smartclip-frontend/
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── layout/           # Header, Footer, Layout, Logo
│   │   │   ├── Header.tsx    # Navigation header
│   │   │   ├── Footer.tsx    # Footer with links
│   │   │   ├── Layout.tsx    # Page layout wrapper
│   │   │   └── Logo.tsx      # SmartClip logo component
│   │   ├── moments/          # Moment-related components
│   │   │   └── MomentCard.tsx # Individual moment display
│   │   └── upload/           # Upload-related components
│   │       └── UploadZone.tsx # Drag & drop upload area
│   ├── pages/                # Page components (routes)
│   │   ├── HomePage.tsx      # Landing page with hero & features
│   │   ├── UploadPage.tsx    # Video upload & processing
│   │   ├── VideoPage.tsx     # Analysis results & clip generation
│   │   └── VideosListPage.tsx # Video library/dashboard
│   ├── services/             # API service layer
│   │   └── api.ts            # Axios client & API methods
│   ├── types/                # TypeScript definitions
│   │   └── index.ts          # Shared types (Video, Moment, Clip, etc.)
│   ├── utils/                # Utility functions
│   │   ├── config.ts         # App configuration constants
│   │   └── helpers.ts        # Helper functions
│   ├── App.tsx               # Main app with React Router
│   ├── main.tsx              # React DOM entry point
│   └── index.css             # Global styles & Tailwind imports
├── .env.example              # Environment variables template
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

## 🎨 Key Components

### Pages

- **HomePage** - Landing page with feature showcase and CTA
- **UploadPage** - Handles video upload, processing status, and triggers analysis
- **VideoPage** - Displays detected moments, clip previews, and generation
- **VideosListPage** - Lists all processed videos with filtering and status

### Components

- **Header** - Main navigation with logo and links
- **Footer** - Footer with social links and branding
- **MomentCard** - Displays individual highlight moments with metadata
- **UploadZone** - Drag & drop file upload with progress tracking

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Building
npm run build            # Build for production (outputs to /dist)
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## 🌐 API Integration

The frontend communicates with the Flask backend via REST API. All API calls are abstracted in `src/services/api.ts`:

### Key API Methods

- `uploadVideo()` - Create direct upload URL
- `getVideo(id)` - Fetch video details
- `getVideoStatus(id)` - Poll processing status
- `analyzeVideo(id)` - Trigger AI analysis
- `getMoments(id)` - Get detected moments
- `createClip(momentId)` - Generate clip from moment
- `getClip(clipId)` - Fetch clip details
- `listVideos()` - Get all videos

## 🎨 Styling

SmartClip uses Tailwind CSS for styling with a custom color palette:

## 📊 Video Processing States

The UI displays different states during video processing:

1. **waiting_for_upload** - Initial state after creating upload URL
2. **uploading** - File upload in progress (progress bar shown)
3. **processing** - Mux encoding video ("Encoding your video...")
4. **transcribing** - Generating transcript ("Converting speech to text...")
5. **analyzing** - AI analyzing moments ("Finding engaging moments...")
6. **ready** - Analysis complete, moments available
7. **error** - Processing failed (error message displayed)


## 🐛 Troubleshooting

### Common Issues

**Video upload fails:**
- Check backend is running on correct port
- Verify CORS is enabled in backend
- Check browser console for errors

**Status not updating:**
- Ensure polling is working (check Network tab)
- Verify backend webhooks are configured
- Check video status endpoint response




## 👤 Author

**Sravanthi Sinha**
- GitHub: [@sravanthisinha](https://github.com/sravanthisinha)

## 🔗 Links

- [Backend README](../smartclip-backend/README.md)
- [Main README](../README.md)
- [Mux Documentation](https://docs.mux.com)

---

Built with ❤️ for the Mux application
