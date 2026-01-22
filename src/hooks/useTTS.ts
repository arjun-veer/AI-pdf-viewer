import { useCallback, useEffect } from 'react';
import { ttsService } from '@/services/ttsService';
import { useAIStore } from '@/stores/aiStore';

export function useTTS() {
  const {
    isSpeaking,
    isPaused,
    selectedVoice,
    ttsRate,
    ttsPitch,
    ttsVolume,
    setIsSpeaking,
    setIsPaused,
    setCurrentWordIndex,
    setTotalWords,
    setCurrentReadingText,
    clearHighlightedWords,
    reset,
  } = useAIStore();

  useEffect(() => {
    ttsService.onStateChanged((state) => {
      setIsSpeaking(state.isSpeaking);
      setIsPaused(state.isPaused);
      setCurrentWordIndex(state.currentWordIndex);
      setTotalWords(state.totalWords);
    });

    ttsService.onWordBoundaryChanged((wordIndex, _word) => {
      setCurrentWordIndex(wordIndex);
    });
  }, [setIsSpeaking, setIsPaused, setCurrentWordIndex, setTotalWords]);

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      setCurrentReadingText(text);
      clearHighlightedWords();

      ttsService.speak(text, {
        rate: ttsRate,
        pitch: ttsPitch,
        volume: ttsVolume,
        voice: selectedVoice?.voice,
      });
    },
    [ttsRate, ttsPitch, ttsVolume, selectedVoice, setCurrentReadingText, clearHighlightedWords]
  );

  const pause = useCallback(() => {
    ttsService.pause();
  }, []);

  const resume = useCallback(() => {
    ttsService.resume();
  }, []);

  const stop = useCallback(() => {
    ttsService.stop();
    reset();
  }, [reset]);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    }
  }, [isSpeaking, isPaused, pause, resume]);

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    isSpeaking,
    isPaused,
    isSupported: ttsService.isSupported(),
  };
}
