export interface ListenTogetherSession {
  id: string;
  hostId: string;
  hostName: string;
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
    duration: number;
    lyrics?: string;
  } | null;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
  createdAt: number;
  updatedAt: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: number;
  isHost: boolean;
}

export interface SessionAction {
  type: 'play' | 'pause' | 'seek' | 'change_track' | 'sync';
  payload?: {
    track?: ListenTogetherSession['currentTrack'];
    time?: number;
  };
  timestamp: number;
}
