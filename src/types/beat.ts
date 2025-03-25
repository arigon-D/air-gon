export interface Beat {
  id: string;
  title: string;
  audioUrl: string;
  modelUrl?: string; // Optional 3D model URL
  tags: string[];
  bpm: number;
  key: string;
  price: number; // 0 for free
  downloadUrl?: string; // URL for free download
  createdAt: string;
  updatedAt: string;
  artwork?: string; // Optional path to artwork image
}

export interface BeatConfig {
  beats: Beat[];
} 