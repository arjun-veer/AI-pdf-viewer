export interface AIModelConfig {
  name: string;
  size: number;
  downloaded: boolean;
  path?: string;
}

export interface TTSOptions {
  voice: string;
  language: string;
  speed: number;
  pitch: number;
}

export interface PronunciationResult {
  transcribed: string;
  expected: string;
  similarity: number;
  feedback: string;
  corrections: string[];
}

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface Citation {
  pageNumber: number;
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}
