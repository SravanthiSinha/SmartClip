import { useState } from 'react';
import { Play, Loader2, Download, Sparkles } from 'lucide-react';
import type { Moment } from '../../types';
import { formatTime, getClipDuration, getEngagementColor } from '../../utils/helpers';
import { apiService } from '../../services/api';

interface MomentCardProps {
  moment: Moment;
  onPreview: (moment: Moment) => void;
}

export const MomentCard = ({ moment, onPreview }: MomentCardProps) => {
  const [isCreatingClip, setIsCreatingClip] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const duration = getClipDuration(moment.startTime, moment.endTime);

  const handleCreateClip = async () => {
    setIsCreatingClip(true);
    setError(null);

    try {
      const { clip } = await apiService.createClip(moment.id);
      
      // Poll for clip status
      let attempts = 0;
      const pollClip = async () => {
        if (attempts >= 30) {
          setError('Clip creation is taking longer than expected');
          setIsCreatingClip(false);
          return;
        }

        const { clip: updatedClip } = await apiService.getClip(clip.id);
        
        if (updatedClip.status === 'ready') {
          setClipUrl(updatedClip.downloadUrl);
          setIsCreatingClip(false);
        } else if (updatedClip.status === 'failed') {
          setError('Failed to create clip');
          setIsCreatingClip(false);
        } else {
          attempts++;
          setTimeout(pollClip, 2000);
        }
      };

      pollClip();
    } catch (err) {
      setError('Failed to create clip. Please try again.');
      setIsCreatingClip(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex-1 text-base">
          {moment.title}
        </h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getEngagementColor(moment.engagementPotential)}`}>
          {moment.engagementPotential}
        </span>
      </div>

      {/* Time and Duration */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {formatTime(moment.startTime)} - {formatTime(moment.endTime)}
          </span>
        </div>
        <div className="bg-indigo-50 px-3 py-1.5 rounded-lg">
          <span className="text-sm font-bold text-indigo-600">{Math.round(duration)}s</span>
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
        {moment.reasoning}
      </p>

      {/* Keywords */}
      {moment.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {moment.keywords.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium border border-gray-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* AI Confidence Score */}
      <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-gray-700">AI Confidence</span>
          </div>
          <span className="text-xs font-bold text-indigo-600">{Math.round(moment.confidenceScore * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${moment.confidenceScore * 100}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onPreview(moment)}
          className="flex-1 inline-flex items-center justify-center bg-white text-gray-700 border-2 border-gray-300 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
        >
          <Play className="w-4 h-4 mr-1.5" />
          Preview
        </button>
        
        {clipUrl ? (
          <a
            href={clipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 text-sm shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Watch Clip
          </a>
        ) : (
          <button
            onClick={handleCreateClip}
            disabled={isCreatingClip}
            className="flex-1 inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm shadow-md hover:shadow-lg"
          >
            {isCreatingClip ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Create Clip
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};