import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle,
  FileVideo,
  Sparkles,
  ArrowRight,
  Cloud,
  Lock,
} from "lucide-react";
import { apiService } from "../services/api";
import { isVideoFile, formatFileSize } from "../utils/helpers";
import { APP_CONFIG } from "../utils/config";
import type { VideoStatus } from "../types";

export const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!videoId || !isUploading) return;

    const pollVideoStatus = async () => {
      try {
        const response = await apiService.getVideo(videoId);

        if (!response || !response.video) {
          console.error("Invalid response from getVideo:", response);
          setTimeout(
            () => setPollCount(pollCount + 1),
            APP_CONFIG.pollInterval
          );
          return;
        }

        const video = response.video;
        setVideoStatus(video.status);

        if (video.status === "ready") {
          navigate(`/video/${videoId}`);
          return;
        }

        if (video.status === "error" || video.status === "failed") {
          setError(
            video.errorMessage || "Video processing failed. Please try again."
          );
          setIsUploading(false);
          return;
        }

        if (
          (video.status === "processing" || video.status === "transcribing") &&
          pollCount % 5 === 0
        ) {
          try {
            console.log(`Retrying analysis for ${video.status} video...`);
            await apiService.analyzeVideo(videoId);
          } catch (err) {
            console.error("Error retrying analysis:", err);
          }
        }

        if (pollCount < APP_CONFIG.maxPollAttempts) {
          setTimeout(
            () => setPollCount(pollCount + 1),
            APP_CONFIG.pollInterval
          );
        } else {
          setError(
            "Processing is taking longer than expected. Please check back later."
          );
          setIsUploading(false);
        }
      } catch (err) {
        console.error("Error polling video status:", err);
        if (pollCount < APP_CONFIG.maxPollAttempts) {
          setTimeout(
            () => setPollCount(pollCount + 1),
            APP_CONFIG.pollInterval
          );
        }
      }
    };

    pollVideoStatus();
  }, [videoId, pollCount, isUploading, navigate]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!isVideoFile(file)) {
      setError("Please select a valid video file");
      return;
    }

    if (file.size > APP_CONFIG.maxUploadSize) {
      setError(
        `File size exceeds ${formatFileSize(APP_CONFIG.maxUploadSize)} limit`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];

    if (!file) return;

    setError(null);

    if (!isVideoFile(file)) {
      setError("Please drop a valid video file");
      return;
    }

    if (file.size > APP_CONFIG.maxUploadSize) {
      setError(
        `File size exceeds ${formatFileSize(APP_CONFIG.maxUploadSize)} limit`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { uploadUrl, videoId: newVideoId } =
        await apiService.createUpload();

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            await apiService.analyzeVideo(newVideoId);
          } catch (err) {
            console.error("Failed to trigger analysis:", err);
          }

          setVideoId(newVideoId);
          setVideoStatus("processing");
          setPollCount(0);
        } else {
          setError("Upload failed. Please try again.");
          setIsUploading(false);
        }
      });

      xhr.addEventListener("error", () => {
        setError("Upload failed. Please check your connection and try again.");
        setIsUploading(false);
      });

      xhr.open("PUT", uploadUrl);
      xhr.send(selectedFile);
    } catch (err) {
      setError("Failed to start upload. Please try again.");
      setIsUploading(false);
    }
  };

  const getStatusMessage = () => {
    if (!videoStatus) return "Uploading...";

    switch (videoStatus) {
      case "waiting_for_upload":
        return "Preparing upload...";
      case "uploading":
        return "Uploading to Mux...";
      case "processing":
        return "Processing video...";
      case "transcribing":
        return "Generating transcript...";
      case "analyzing":
        return "AI is analyzing...";
      case "ready":
        return "Ready! Redirecting...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload Your Video
          </h1>
          <p className="text-xl text-gray-600">
            Let AI discover the perfect moments in your content
          </p>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Area */}
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                : selectedFile
                ? "border-indigo-300 bg-indigo-50/50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            } ${isUploading ? "pointer-events-none" : ""}`}
          >
            <div className="relative">
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl shadow-lg">
                    <FileVideo className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-lg text-gray-600 mb-4">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    {!isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
                      >
                        Choose a different file
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {isDragging
                        ? "Drop your video here!"
                        : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-base text-gray-600 mb-2">
                      <span className="font-semibold">Supported:</span> MP4,
                      MOV, AVI, MKV, WebM
                    </p>
                    <p className="text-sm text-gray-500">
                      Max size: {formatFileSize(APP_CONFIG.maxUploadSize)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">
                  Upload Error
                </h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress < 100 && !videoId && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  Uploading to cloud...
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Processing Progress */}
          {isUploading && videoId && (
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4 shadow-lg">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {getStatusMessage()}
                </h3>
                <p className="text-gray-600">
                  {videoStatus === "processing" &&
                    "Encoding your video for optimal playback..."}
                  {videoStatus === "transcribing" &&
                    "Converting speech to text..."}
                  {videoStatus === "analyzing" &&
                    "Finding the most engaging moments..."}
                  {!videoStatus ||
                    (!["processing", "transcribing", "analyzing"].includes(
                      videoStatus
                    ) &&
                      "This usually takes 2-5 minutes.")}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="bg-gray-50 p-6 rounded-xl space-y-4 border border-gray-200">
                {/* Step 1: Upload */}
                <div
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                    videoStatus &&
                    [
                      "processing",
                      "transcribing",
                      "analyzing",
                      "ready",
                    ].includes(videoStatus)
                      ? "bg-green-50 border-2 border-green-200"
                      : videoStatus === "uploading" ||
                        videoStatus === "waiting_for_upload"
                      ? "bg-indigo-50 border-2 border-indigo-200"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      videoStatus &&
                      [
                        "processing",
                        "transcribing",
                        "analyzing",
                        "ready",
                      ].includes(videoStatus)
                        ? "bg-green-600"
                        : videoStatus === "uploading" ||
                          videoStatus === "waiting_for_upload"
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {videoStatus === "uploading" ||
                    videoStatus === "waiting_for_upload" ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Upload to Cloud
                    </p>
                    <p className="text-sm text-gray-600">
                      Transferring your video securely
                    </p>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                    videoStatus &&
                    ["transcribing", "analyzing", "ready"].includes(videoStatus)
                      ? "bg-green-50 border-2 border-green-200"
                      : videoStatus === "processing"
                      ? "bg-indigo-50 border-2 border-indigo-200"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      videoStatus &&
                      ["transcribing", "analyzing", "ready"].includes(
                        videoStatus
                      )
                        ? "bg-green-600"
                        : videoStatus === "processing"
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {videoStatus === "processing" ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Process Video</p>
                    <p className="text-sm text-gray-600">
                      Encoding for optimal quality
                    </p>
                  </div>
                </div>

                {/* Step 3: Transcription */}
                <div
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                    videoStatus && ["analyzing", "ready"].includes(videoStatus)
                      ? "bg-green-50 border-2 border-green-200"
                      : videoStatus === "transcribing"
                      ? "bg-indigo-50 border-2 border-indigo-200"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      videoStatus &&
                      ["analyzing", "ready"].includes(videoStatus)
                        ? "bg-green-600"
                        : videoStatus === "transcribing"
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {videoStatus === "transcribing" ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Generate Transcript
                    </p>
                    <p className="text-sm text-gray-600">
                      Converting audio to text
                    </p>
                  </div>
                </div>

                {/* Step 4: AI Analysis */}
                <div
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                    videoStatus === "ready"
                      ? "bg-green-50 border-2 border-green-200"
                      : videoStatus === "analyzing"
                      ? "bg-indigo-50 border-2 border-indigo-200"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      videoStatus === "ready"
                        ? "bg-green-600"
                        : videoStatus === "analyzing"
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {videoStatus === "analyzing" ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">AI Analysis</p>
                    <p className="text-sm text-gray-600">
                      Identifying highlight moments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!isUploading && (
            <button
              onClick={handleUploadFile}
              disabled={!selectedFile}
              className="w-full mt-8 inline-flex items-center justify-center bg-indigo-600 text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Video with AI
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md">
            <div className="flex flex-col items-center  space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center m-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  What Happens Next
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• AI analyzes your video</li>
                  <li>• Finds 3-5 best moments</li>
                  <li>• Ready in 2-5 minutes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-md">
            <div className="flex flex-col items-center  space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center m-4">
                <Cloud className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Supported Formats
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• MP4, MOV, AVI, MKV</li>
                  <li>• Up to {formatFileSize(APP_CONFIG.maxUploadSize)}</li>
                  <li>• All resolutions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-6 shadow-md">
            <div className="flex flex-col items-center  space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center m-4">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Secure & Private
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• End-to-end encryption</li>
                  <li>• Your data stays private</li>
                  <li>• Powered by Mux</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
