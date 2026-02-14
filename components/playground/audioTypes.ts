/** Shared audio control types for playground left panel */

export interface GroupIsolationState {
  isIsolated: boolean;
  mutedUserIds: Set<string>;
  myGroupIndex: number;
}

export interface AudioControlState {
  /** Set volume for a specific user (0-1). Isolation mute takes precedence. */
  setUserVolume: (userId: string, volume: number) => void;
  /** Get the current volume setting for a user */
  getUserVolume: (userId: string) => number;
  /** Check if a user is currently muted by group isolation */
  isUserIsolated: (userId: string) => boolean;
  /** Underlying audio elements (for output device selection) */
  audioElements: Map<string, HTMLAudioElement>;
}
