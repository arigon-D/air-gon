'use client';

import { useState } from 'react';
import Scene from '../components/Scene';
import AudioPlayer from '../components/AudioPlayer';
import Header from '../components/Header';
import { beatConfig } from '../config/beats';
import { Beat } from '../types/beat';

export default function Home() {
  const [activeBeat, setActiveBeat] = useState<Beat | undefined>(undefined);

  const handleBeatSelect = (beat: Beat) => {
    setActiveBeat(beat);
  };

  return (
    <main className="relative w-full h-screen bg-black">
      <Header />
      
      {/* Main content */}
      <div className="w-full h-full">
        <Scene
          beats={beatConfig.beats}
          onBeatSelect={handleBeatSelect}
          activeBeat={activeBeat}
        />
      </div>

      {/* Audio Player */}
      <AudioPlayer
        beat={activeBeat}
        onBeatChange={handleBeatSelect}
      />
    </main>
  );
}