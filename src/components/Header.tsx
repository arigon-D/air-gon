import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hitmarkerEnabled, setHitmarkerEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hitmarkerEnabled');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleHitmarker = () => {
    const newValue = !hitmarkerEnabled;
    setHitmarkerEnabled(newValue);
    localStorage.setItem('hitmarkerEnabled', JSON.stringify(newValue));
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold text-white tracking-wider hover:text-gray-300 transition-colors cursor-pointer">
              AIR-GON
            </h1>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Menu */}
          {isMenuOpen && (
            <div ref={menuRef} className="absolute top-12 right-4 w-56 bg-black/95 backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-white/10 overflow-hidden">
              <div className="py-2">
                <a
                  href="https://soundcloud.com/your-profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.56 8.87V17h1.87V9.32c-.36-.28-.94-.45-1.87-.45z"/>
                    <path d="M8.63 12.5V17h1.87V12.5c-.36-.28-.94-.45-1.87-.45z"/>
                    <path d="M15.5 17h-1.88V9.32c.93 0 1.5.17 1.87.45V17z"/>
                    <path d="M18.44 17h-1.88V12.5c.93 0 1.5.17 1.87.45V17z"/>
                    <path d="M21.38 17h-1.88V12.5c.93 0 1.5.17 1.87.45V17z"/>
                    <path d="M5.7 17H3.82V12.5c.93 0 1.5.17 1.87.45V17z"/>
                  </svg>
                  SoundCloud
                </a>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </button>
                <button
                  onClick={toggleHitmarker}
                  className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  {hitmarkerEnabled ? 'Disable Hitmarker' : 'Enable Hitmarker'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"></div>
    </header>
  );
} 