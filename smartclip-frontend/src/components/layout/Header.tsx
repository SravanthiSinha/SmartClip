import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Upload } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="transform group-hover:scale-110 transition-transform duration-200">
              <Logo className="w-10 h-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 leading-tight">
                SmartClip
              </span>
              <span className="text-xs text-indigo-600 font-medium leading-tight">
                AI Video Tools
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/videos"
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              My Videos
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};