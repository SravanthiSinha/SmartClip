// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Video endpoints
  uploadVideo: '/api/videos/upload',
  getVideo: (id: string) => `/api/videos/${id}`,
  getVideoStatus: (id: string) => `/api/videos/${id}/status`,
  analyzeVideo: (id: string) => `/api/videos/${id}/analyze`,
  getMoments: (id: string) => `/api/videos/${id}/moments`,

  // Clip endpoints
  createClip: (momentId: string) => `/api/moments/${momentId}/create-clip`,
  getClip: (id: string) => `/api/clips/${id}`,
};

// App Configuration
export const APP_CONFIG = {
  maxUploadSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
  ],
  pollInterval: 3000, // 3 seconds
  maxPollAttempts: 100, // 5 minutes max
};

// UI Configuration
export const UI_CONFIG = {
  defaultVideoTitle: 'Untitled Video',
  momentsPerPage: 10,
};
