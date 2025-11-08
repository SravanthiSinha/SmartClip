import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Sparkles, ArrowLeft, Clock, Video as VideoIcon, Play } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import { apiService } from '../services/api';
import type { Video, Moment } from '../types';
import { APP_CONFIG } from '../utils/config';
import { MomentCard } from '../components/moments/MomentCard';

export const VideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const playerRef = useRef<any>(null);
  
  const [video, setVideo] = useState<Video | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Poll for video status
  useEffect(() => {
    if (!videoId) return;

    const pollVideoStatus = async () => {
      try {
        const { video: videoData } = await apiService.getVideo(videoId);
        setVideo(videoData);

        if (videoData.status === 'ready') {
          const { moments: momentsData } = await apiService.getMoments(videoId);
          setMoments(momentsData);
          setLoading(false);
        } else if (videoData.status === 'failed') {
          setError('Video processing failed. Please try uploading again.');
          setLoading(false);
        } else if (pollCount < APP_CONFIG.maxPollAttempts) {
          setTimeout(() => setPollCount(pollCount + 1), APP_CONFIG.pollInterval);
        } else {
          setError('Processing is taking longer than expected. Please refresh the page.');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load video. Please try again.');
        setLoading(false);
      }
    };

    pollVideoStatus();
  }, [videoId, pollCount]);

  const handlePreview = (moment: Moment) => {
    if (playerRef.current) {
      playerRef.current.currentTime = moment.startTime;
      playerRef.current.play();
    }
  };

  const getStatusMessage = () => {
    if (!video) return 'Loading...';
    
    switch (video.status) {
      case 'uploading':
        return 'Uploading video...';
      case 'processing':
        return 'Processing video...';
      case 'transcribing':
        return 'Generating transcript...';
      case 'analyzing':
        return 'Analyzing with AI...';
      case 'ready':
        return 'Analysis complete!';
      default:
        return 'Processing...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-8 shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {getStatusMessage()}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            This usually takes 2-5 minutes. We'll redirect you automatically when ready!
          </p>
          
          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="space-y-5">
              <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                video && ['processing', 'transcribing', 'analyzing', 'ready'].includes(video.status)
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  video && ['processing', 'transcribing', 'analyzing', 'ready'].includes(video.status)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Video Uploaded</p>
                  <p className="text-sm text-gray-600">Successfully uploaded to cloud</p>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                video && ['transcribing', 'analyzing', 'ready'].includes(video.status)
                  ? 'bg-green-50 border border-green-200'
                  : video?.status === 'processing'
                  ? 'bg-indigo-50 border border-indigo-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  video && ['transcribing', 'analyzing', 'ready'].includes(video.status)
                    ? 'bg-green-500'
                    : video?.status === 'processing'
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
                }`}>
                  {video?.status === 'processing' ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Processing Video</p>
                  <p className="text-sm text-gray-600">Encoding for optimal playback</p>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                video && ['analyzing', 'ready'].includes(video.status)
                  ? 'bg-green-50 border border-green-200'
                  : video?.status === 'transcribing'
                  ? 'bg-indigo-50 border border-indigo-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  video && ['analyzing', 'ready'].includes(video.status)
                    ? 'bg-green-500'
                    : video?.status === 'transcribing'
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
                }`}>
                  {video?.status === 'transcribing' ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">Generate Transcript</p>
                  <p className="text-sm text-gray-600">Converting speech to text</p>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                video?.status === 'ready'
                  ? 'bg-green-50 border border-green-200'
                  : video?.status === 'analyzing'
                  ? 'bg-indigo-50 border border-indigo-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  video?.status === 'ready'
                    ? 'bg-green-500'
                    : video?.status === 'analyzing'
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
                }`}>
                  {video?.status === 'analyzing' ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">AI Analysis</p>
                  <p className="text-sm text-gray-600">Identifying viral moments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all"
            >
              Try Again
            </button>
            <Link to="/videos" className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg border border-gray-300 transform hover:-translate-y-0.5 transition-all">
              Back to Videos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/videos"
          className="inline-flex items-center text-gray-700 hover:text-indigo-600 mb-6 font-semibold group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Videos
        </Link>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-green-900 mb-1">Analysis Complete!</h3>
              <p className="text-green-800">
                We discovered <span className="font-bold">{moments.length} highlight moments</span> perfect for viral content
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {video.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-700">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{moments.length} moments</span>
                  </div>
                </div>
              </div>
              
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                <MuxPlayer
                  ref={playerRef}
                  playbackId={video.muxPlaybackId}
                  metadata={{
                    video_title: video.title,
                  }}
                  streamType="on-demand"
                />
              </div>
            </div>
          </div>

          {/* Moments Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Highlight Moments
                  </h2>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-26rem)] overflow-y-auto pr-2 custom-scrollbar">
                {moments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <VideoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-semibold mb-2">No moments found</p>
                    <p className="text-sm text-gray-500">Try uploading a different video</p>
                  </div>
                ) : (
                  moments.map((moment, index) => (
                    <div key={moment.id} className="relative">                 
                      <MomentCard
                        moment={moment}
                        onPreview={handlePreview}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
};