export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle with gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#gradient)" />

      {/* Play icon (triangle) */}
      <path
        d="M 40 32 L 40 68 L 70 50 Z"
        fill="white"
        opacity="0.95"
      />

      {/* AI Sparkle accent */}
      <circle cx="68" cy="32" r="5" fill="white" opacity="0.9">
        <animate
          attributeName="opacity"
          values="0.9;0.5;0.9"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="68" cy="32" r="2.5" fill="white" />

      {/* Gradient definition - Refined blue/indigo */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
};