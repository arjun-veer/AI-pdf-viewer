import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { TTSVoice } from '@/services/ttsService';

interface AIState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  totalWords: number;
  
  selectedVoice: TTSVoice | null;
  ttsRate: number;
  ttsPitch: number;
  ttsVolume: number;
  
  currentReadingText: string;
  highlightedWords: number[];
  
  setIsSpeaking: (isSpeaking: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setCurrentWordIndex: (index: number) => void;
  setTotalWords: (total: number) => void;
  
  setSelectedVoice: (voice: TTSVoice | null) => void;
  setTTSRate: (rate: number) => void;
  setTTSPitch: (pitch: number) => void;
  setTTSVolume: (volume: number) => void;
  
  setCurrentReadingText: (text: string) => void;
  addHighlightedWord: (wordIndex: number) => void;
  clearHighlightedWords: () => void;
  
  reset: () => void;
}

const initialState = {
  isSpeaking: false,
  isPaused: false,
  currentWordIndex: 0,
  totalWords: 0,
  
  selectedVoice: null,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsVolume: 1.0,
  
  currentReadingText: '',
  highlightedWords: [],
};

export const useAIStore = create<AIState>()(
  persist(
    immer((set) => ({
      ...initialState,
      
      setIsSpeaking: (isSpeaking) =>
        set((state) => {
          state.isSpeaking = isSpeaking;
        }),
      
      setIsPaused: (isPaused) =>
        set((state) => {
          state.isPaused = isPaused;
        }),
      
      setCurrentWordIndex: (index) =>
        set((state) => {
          state.currentWordIndex = index;
        }),
      
      setTotalWords: (total) =>
        set((state) => {
          state.totalWords = total;
        }),
      
      setSelectedVoice: (voice) =>
        set((state) => {
          state.selectedVoice = voice;
        }),
      
      setTTSRate: (rate) =>
        set((state) => {
          state.ttsRate = Math.max(0.1, Math.min(10, rate));
        }),
      
      setTTSPitch: (pitch) =>
        set((state) => {
          state.ttsPitch = Math.max(0, Math.min(2, pitch));
        }),
      
      setTTSVolume: (volume) =>
        set((state) => {
          state.ttsVolume = Math.max(0, Math.min(1, volume));
        }),
      
      setCurrentReadingText: (text) =>
        set((state) => {
          state.currentReadingText = text;
        }),
      
      addHighlightedWord: (wordIndex) =>
        set((state) => {
          if (!state.highlightedWords.includes(wordIndex)) {
            state.highlightedWords.push(wordIndex);
          }
        }),
      
      clearHighlightedWords: () =>
        set((state) => {
          state.highlightedWords = [];
        }),
      
      reset: () =>
        set((state) => {
          state.isSpeaking = false;
          state.isPaused = false;
          state.currentWordIndex = 0;
          state.totalWords = 0;
          state.currentReadingText = '';
          state.highlightedWords = [];
        }),
    })),
    {
      name: 'ai-store',
      partialize: (state) => ({
        selectedVoice: state.selectedVoice,
        ttsRate: state.ttsRate,
        ttsPitch: state.ttsPitch,
        ttsVolume: state.ttsVolume,
      }),
    }
  )
);
