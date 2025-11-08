import { Github, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>using Mux + AI</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/SravanthiSinha/SmartClip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <span className="text-sm text-gray-500">
              © 2025 SmartClip
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
