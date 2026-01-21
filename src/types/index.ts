export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  language: string;
  defaultZoom: number;
  enableAIFeatures: boolean;
  ttsVoice: string;
  ttsSpeed: number;
  keyboardShortcuts: Record<string, string>;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingOperations: number;
}
