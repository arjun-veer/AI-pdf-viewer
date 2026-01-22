export interface TTSVoice {
  voice: SpeechSynthesisVoice;
  lang: string;
  name: string;
  localService: boolean;
}

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | undefined;
}

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  totalWords: number;
}

class TTSService {
  private synthesis: SpeechSynthesis;
  // @ts-expect-error - currentUtterance is used for internal state tracking
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: TTSVoice[] = [];
  private onStateChange?: (state: TTSState) => void;
  private onWordBoundary?: (wordIndex: number, word: string) => void;
  private state: TTSState = {
    isSpeaking: false,
    isPaused: false,
    currentWordIndex: 0,
    totalWords: 0,
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    this.synthesis.onvoiceschanged = () => {
      this.loadVoices();
    };
  }

  private loadVoices(): void {
    const voices = this.synthesis.getVoices();
    this.availableVoices = voices.map((voice) => ({
      voice,
      lang: voice.lang,
      name: voice.name,
      localService: voice.localService,
    }));
  }

  getVoices(): TTSVoice[] {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    return this.availableVoices;
  }

  getVoicesByLanguage(languageCode: string): TTSVoice[] {
    return this.availableVoices.filter((v) =>
      v.lang.toLowerCase().startsWith(languageCode.toLowerCase())
    );
  }

  speak(text: string, options: TTSOptions = {}): void {
    if (this.synthesis.speaking) {
      this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    
    if (options.voice) {
      utterance.voice = options.voice;
    }

    const words = text.split(/\s+/);
    this.state.totalWords = words.length;
    this.state.currentWordIndex = 0;

    utterance.onstart = () => {
      this.state.isSpeaking = true;
      this.state.isPaused = false;
      this.currentUtterance = utterance;
      this.notifyStateChange();
    };

    utterance.onend = () => {
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.state.currentWordIndex = 0;
      this.currentUtterance = null;
      this.notifyStateChange();
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.currentUtterance = null;
      this.notifyStateChange();
    };

    utterance.onpause = () => {
      this.state.isPaused = true;
      this.notifyStateChange();
    };

    utterance.onresume = () => {
      this.state.isPaused = false;
      this.notifyStateChange();
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.state.currentWordIndex++;
        const word = words[this.state.currentWordIndex - 1] ?? '';
        if (this.onWordBoundary) {
          this.onWordBoundary(this.state.currentWordIndex - 1, word);
        }
        this.notifyStateChange();
      }
    };

    this.synthesis.speak(utterance);
  }

  pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  stop(): void {
    this.synthesis.cancel();
    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentWordIndex = 0;
    this.currentUtterance = null;
    this.notifyStateChange();
  }

  getState(): TTSState {
    return { ...this.state };
  }

  onStateChanged(callback: (state: TTSState) => void): void {
    this.onStateChange = callback;
  }

  onWordBoundaryChanged(callback: (wordIndex: number, word: string) => void): void {
    this.onWordBoundary = callback;
  }

  onWord(callback: (wordIndex: number, word: string) => void): void {
    this.onWordBoundary = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }
}

export const ttsService = new TTSService();
