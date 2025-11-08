import { Link } from 'react-router-dom';
import { Sparkles, Zap, Upload, ArrowRight, Video, Clock, Target, Shield, CheckCircle } from 'lucide-react';

export const HomePage = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99, 102, 241, 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Subtle floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-200 text-indigo-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Video Intelligence
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Long Videos Into
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Viral Clips
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              AI-powered video analysis that automatically identifies the best moments
              for social media clips, highlights, and promotional content.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/upload" className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Upload Video
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-300 hover:border-gray-400 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Learn More
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">Secure Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Video className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">Powered by Mux</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-indigo-100">
              <Zap className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your long-form content into engaging clips in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

            {/* Feature 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  1
                </div>
                
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-2xl mb-6 mt-2">
                  <Upload className="w-10 h-10 text-indigo-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Upload Your Video
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  Simply upload any video format. We support all major video types and sizes.
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0" />
                    All major formats supported
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0" />
                    Secure cloud storage
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0" />
                    Fast upload speeds
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  2
                </div>
                
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-6 mt-2">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AI Analysis
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  Advanced AI identifies highlight moments based on content analysis and engagement potential.
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Speech-to-text transcription
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Emotion detection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Engagement scoring
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  3
                </div>
                
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-2xl mb-6 mt-2">
                  <Zap className="w-10 h-10 text-green-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Create Clips
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  Generate professional clips with one click.
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    One-click generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Social media optimized
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    Instant downloads
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Benefits */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
                <Target className="w-4 h-4" />
                Key Benefits
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Save Hours of
                <br />
                <span className="text-indigo-600">Manual Work</span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Let AI do the heavy lifting while you focus on creating great content that resonates with your audience.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Smart Moment Detection
                    </h3>
                    <p className="text-base text-gray-600">
                      AI analyzes speech patterns, energy levels, and content to find the most engaging moments automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Social Media Optimized
                    </h3>
                    <p className="text-base text-gray-600">
                      Clips are automatically sized and formatted for maximum engagement across all platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Lightning Fast Processing
                    </h3>
                    <p className="text-base text-gray-600">
                      Built on Mux's enterprise infrastructure for reliable, high-quality processing in 2-5 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <div className="aspect-video bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">AI at Work</p>
                      <p className="text-sm text-gray-600 mt-2">Processing your videos intelligently</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Create Amazing Clips?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Start turning your long-form videos into engaging clips in minutes with AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center bg-white text-indigo-600 font-semibold text-lg py-4 px-10 rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <Upload className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <Link
              to="/videos"
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold text-lg py-4 px-10 rounded-lg hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-200"
            >
              View My Videos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};