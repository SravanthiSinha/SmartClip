import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import type {
  UploadResponse,
  VideoResponse,
  MomentsResponse,
  ClipResponse,
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }

  // Video endpoints
  async listVideos(): Promise<{ success: boolean; videos: any[] }> {
    const response = await this.client.get('/api/videos');
    return response.data;
  }

  async createUpload(): Promise<UploadResponse> {
    const response = await this.client.post<UploadResponse>(
      API_ENDPOINTS.uploadVideo
    );
    return response.data;
  }

  async getVideo(videoId: string): Promise<VideoResponse> {
    const response = await this.client.get<VideoResponse>(
      API_ENDPOINTS.getVideo(videoId)
    );
    return response.data;
  }

  async getVideoStatus(videoId: string): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>(
      API_ENDPOINTS.getVideoStatus(videoId)
    );
    return response.data;
  }

  async analyzeVideo(videoId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      API_ENDPOINTS.analyzeVideo(videoId)
    );
    return response.data;
  }

  async getMoments(videoId: string): Promise<MomentsResponse> {
    const response = await this.client.get<MomentsResponse>(
      API_ENDPOINTS.getMoments(videoId)
    );
    return response.data;
  }

  // Clip endpoints
  async createClip(momentId: string): Promise<ClipResponse> {
    const response = await this.client.post<ClipResponse>(
      API_ENDPOINTS.createClip(momentId)
    );
    return response.data;
  }

  async getClip(clipId: string): Promise<ClipResponse> {
    const response = await this.client.get<ClipResponse>(
      API_ENDPOINTS.getClip(clipId)
    );
    return response.data;
  }
}

export const apiService = new ApiService();
