import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Beat } from '../types/beat';

interface AudioPlayerProps {
  beat?: Beat;  // Make beat optional
  onBeatChange: (beat: Beat) => void;
}

const SKIP_DURATION = 5; // seconds to skip/rewind

export default function AudioPlayer({ beat, onBeatChange }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (!beat) {
      setDuration(0);
      setCurrentTime(0);
      return;
    }

    if (soundRef.current) {
      soundRef.current.unload();
    }

    soundRef.current = new Howl({
      src: [beat.audioUrl],
      volume: volume,
      loop: true,
      onload: () => {
        console.log('Beat loaded:', beat.title);
        const duration = soundRef.current?.duration() || 0;
        setDuration(duration);
        setCurrentTime(0);
      },
      onloaderror: (id, error) => {
        console.error('Error loading beat:', error);
        setDuration(0);
        setCurrentTime(0);
      },
      onseek: () => {
        requestAnimationFrame(updateTime);
      },
      onpause: () => {
        setIsPlaying(false);
      },
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [beat?.audioUrl]);

  // Update current time
  const updateTime = () => {
    if (soundRef.current && isPlaying) {
      const currentTime = soundRef.current.seek() as number;
      setCurrentTime(currentTime);
      requestAnimationFrame(updateTime);
    }
  };

  // Add interval to update duration
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying && soundRef.current) {
      intervalId = setInterval(() => {
        const currentTime = soundRef.current?.seek() as number;
      setCurrentTime(currentTime);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying]);

  // Handle spacebar control
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        handleSkip(-SKIP_DURATION);
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        handleSkip(SKIP_DURATION);
      }
      if (event.code === 'ArrowUp') {
        event.preventDefault();
        const newVolume = Math.min(1, volume + 0.1);
        setVolume(newVolume);
        if (soundRef.current) {
          soundRef.current.volume(newVolume);
        }
      }
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        const newVolume = Math.max(0, volume - 0.1);
        setVolume(newVolume);
        if (soundRef.current) {
          soundRef.current.volume(newVolume);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

  const togglePlay = () => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds: number) => {
    if (soundRef.current) {
      const newTime = Math.max(0, Math.min(duration, soundRef.current.seek() + seconds));
      soundRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[70%] bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
      
      {/* Main Content */}
      <div className="w-full px-8 py-3">
        <div className="flex items-center justify-between space-x-8">
          {/* Play/Pause and Beat Info */}
          <div className="flex items-center space-x-6">
            <button
              onClick={togglePlay}
              disabled={!beat}
              className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center group transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!beat ? "No beat selected" : (isPlaying ? "Pause" : "Play")}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1">{beat?.title || "No Beat Selected"}</h3>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                {beat ? (
                  <>
                    <span>{beat.bpm} BPM</span>
                    <span>•</span>
                    <span>{beat.key}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-2">
                      {beat.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-white/20 text-xs text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <span>Select a beat to start playing</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-[140px]">
            {beat ? (
              <>
                {beat.price === 0 && beat.downloadUrl && (
                  <a
                    href={beat.downloadUrl}
                    download
                    className="px-6 py-2 rounded-full bg-red-700 hover:bg-[#ff0000]/80 text-black font-medium transition-all duration-200 hover:scale-105 block text-center"
                  >
                    Download
                  </a>
                )}
                {beat.price > 0 && (
                  <button className="w-full px-3 py-2 rounded-full bg-red-700 hover:bg-[#ff0000]/80 text-black font-medium transition-all duration-200 hover:scale-105">
                    Buy for €{beat.price}
                  </button>
                )}
              </>
            ) : (
              <button 
                className="w-full px-6 py-2 rounded-full bg-white/20 text-white/50 font-medium cursor-not-allowed"
                disabled
              >
                Select a beat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar and Volume Section */}
      <div className="w-full px-8 pb-2 ">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-gray-300 w-12 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors">
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-300 w-12">{formatTime(duration)}</span>
          <div className="flex items-center space-x-2 ml-4">
            <button 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              onClick={() => {
                const newVolume = volume === 0 ? 0.5 : 0;
                setVolume(newVolume);
                if (soundRef.current) {
                  soundRef.current.volume(newVolume);
                }
              }}
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                {volume === 0 ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                ) : volume < 0.5 ? (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                )}
              </svg>
            </button>
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-lg" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-track]:bg-transparent"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-lg pointer-events-none"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 