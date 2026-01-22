import { useEffect, useState } from 'react';
import { ttsService, type TTSVoice } from '@/services/ttsService';
import { useAIStore } from '@/stores/aiStore';

export function useVoiceSelection() {
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [isLoading, setIsLoading] = useState(() => ttsService.isSupported());
  const selectedVoice = useAIStore((state) => state.selectedVoice);
  const setSelectedVoice = useAIStore((state) => state.setSelectedVoice);

  useEffect(() => {
    if (!ttsService.isSupported()) {
      return;
    }

    const loadVoices = () => {
      const availableVoices = ttsService.getVoices();
      setVoices(availableVoices);
      setIsLoading(false);

      if (!selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find((v) => v.lang.startsWith('en')) ?? availableVoices[0];
        if (defaultVoice) {
          setSelectedVoice(defaultVoice);
        }
      }
    };

    loadVoices();
    
    const timer = setTimeout(() => {
      loadVoices();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to avoid infinite loop 

  const getVoicesByLanguage = (languageCode: string): TTSVoice[] => {
    return ttsService.getVoicesByLanguage(languageCode);
  };

  const selectVoice = (voice: TTSVoice): void => {
    setSelectedVoice(voice);
  };

  return {
    voices,
    isLoading,
    selectedVoice,
    selectVoice,
    getVoicesByLanguage,
    isSupported: ttsService.isSupported(),
  };
}
