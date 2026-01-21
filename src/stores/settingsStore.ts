import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppSettings, Theme } from '@/types';

interface SettingsState extends AppSettings {
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setDefaultZoom: (zoom: number) => void;
  setEnableAIFeatures: (enabled: boolean) => void;
  setTTSVoice: (voice: string) => void;
  setTTSSpeed: (speed: number) => void;
  setKeyboardShortcut: (action: string, shortcut: string) => void;
}

const initialSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  defaultZoom: 1.5,
  enableAIFeatures: true,
  ttsVoice: 'default',
  ttsSpeed: 1.0,
  keyboardShortcuts: {
    nextPage: 'ArrowRight',
    prevPage: 'ArrowLeft',
    zoomIn: 'Control+=',
    zoomOut: 'Control+-',
    toggleTTS: 'Control+Shift+S',
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      ...initialSettings,

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),

      setLanguage: (language) =>
        set((state) => {
          state.language = language;
        }),

      setDefaultZoom: (zoom) =>
        set((state) => {
          state.defaultZoom = zoom;
        }),

      setEnableAIFeatures: (enabled) =>
        set((state) => {
          state.enableAIFeatures = enabled;
        }),

      setTTSVoice: (voice) =>
        set((state) => {
          state.ttsVoice = voice;
        }),

      setTTSSpeed: (speed) =>
        set((state) => {
          state.ttsSpeed = speed;
        }),

      setKeyboardShortcut: (action, shortcut) =>
        set((state) => {
          state.keyboardShortcuts[action] = shortcut;
        }),
    })),
    {
      name: 'app-settings',
    }
  )
);
