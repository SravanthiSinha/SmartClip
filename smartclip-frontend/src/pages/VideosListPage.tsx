import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video as VideoIcon, Loader2, AlertCircle, Play, Clock, Sparkles, Upload, Film } from 'lucide-react';
import { apiService } from '../services/api';
import { formatTime } from '../utils/helpers';

interface Video {
  id: number;
  status: string;
  playbackId: string | null;
  duration: number | null;
  createdAt: string;
}

export const VideosListPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiService.listVideos();
        setVideos(response.videos);
        setLoading(false);
      } catch (err) {
        setError('Failed to load videos. Please try again.');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ready: {
        style: 'bg-green-50 text-green-700 border-green-200',
        label: 'Ready',
        icon: <Sparkles className="w-3.5 h-3.5" />
      },
      processing: {
        style: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Processing',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />
      },
      transcribing: {
        style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: 'Transcribing',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />
      },
      analyzing: {
        style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        label: 'Analyzing',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />
      },
      error: {
        style: 'bg-red-50 text-red-700 border-red-200',
        label: 'Error',
        icon: <AlertCircle className="w-3.5 h-3.5" />
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${config.style}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Loading your videos</p>
          <p className="text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
                <Film className="w-4 h-4" />
                Video Library
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">My Videos</h1>
              <p className="text-xl text-gray-600">
                View and manage all your AI-analyzed content
              </p>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload New Video
            </Link>
          </div>
        </div>


        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <VideoIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No videos yet
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Upload your first video to get started with AI-powered highlight detection
            </p>
            <Link to="/upload" className="inline-flex items-center bg-indigo-600 text-white font-semibold text-lg py-4 px-8 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
              <Upload className="w-5 h-5 mr-2" />
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Link
                key={video.id}
                to={`/video/${video.id}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden border border-gray-200">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {video.playbackId ? (
                      <>
                        <img
                          src={`https://image.mux.com/${video.playbackId}/thumbnail.jpg?width=640&height=360&time=1`}
                          alt={`Video ${video.id}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Play Overlay */}
                    {video.status === 'ready' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-xl">
                          <Play className="w-8 h-8 text-indigo-600 ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(video.status)}
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {formatTime(video.duration)}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        Video #{video.id}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {video.status !== 'ready' && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 flex items-center font-medium">
                          {video.status === 'processing' && (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
                              Video is being processed...
                            </>
                          )}
                          {video.status === 'transcribing' && (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin text-yellow-600" />
                              Generating transcript...
                            </>
                          )}
                          {video.status === 'analyzing' && (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-600" />
                              AI is finding moments...
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    {video.status === 'ready' && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm font-semibold text-green-600 flex items-center">
                          <Sparkles className="w-4 h-4 mr-1.5" />
                          Ready to view highlights
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};