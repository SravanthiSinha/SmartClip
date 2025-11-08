// Video status types
export type VideoStatus = 'waiting_for_upload' | 'uploading' | 'processing' | 'transcribing' | 'analyzing' | 'ready' | 'error' | 'failed';

export type ClipStatus = 'creating' | 'ready' | 'failed';

export type EngagementPotential = 'high' | 'medium' | 'low';

// Video interface
export interface Video {
  id: string;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  title: string;
  duration: number;
  status: VideoStatus;
  errorMessage?: string | null;
  transcript?: string | null;
  uploadUrl?: string | null;
  createdAt: string;
}

// Moment interface
export interface Moment {
  id: string;
  videoId: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  title: string;
  reasoning: string;
  confidenceScore: number; // 0-1
  keywords: string[];
  engagementPotential: EngagementPotential;
  createdAt: string;
}

// Clip interface
export interface Clip {
  id: string;
  momentId: string;
  muxAssetId: string;
  muxPlaybackId: string;
  downloadUrl: string;
  status: ClipStatus;
  createdAt: string;
}

// API Response types
export interface UploadResponse {
  uploadUrl: string;
  assetId: string;
  videoId: string;
}

export interface VideoFromUrlRequest {
  url: string;
}

export interface VideoResponse {
  video: Video;
}

export interface MomentsResponse {
  moments: Moment[];
}

export interface ClipResponse {
  clip: Clip;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
