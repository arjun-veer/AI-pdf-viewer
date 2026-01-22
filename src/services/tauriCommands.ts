import { invoke } from '@tauri-apps/api/core';

export interface PdfMetadata {
  path: string;
  file_name: string;
  file_size: number;
  num_pages: number | null;
}

// Translation types
export interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

export interface PageTranslationResult {
  pageNumber: number;
  original: string;
  translated: string;
  chunks: Array<{
    index: number;
    original: string;
    translated: string;
    startOffset: number;
    endOffset: number;
  }>;
}

export interface DocumentTranslationResult {
  pages: PageTranslationResult[];
  totalPages: number;
  sourceLanguage: string;
  targetLanguage: string;
  completedAt: string;
}

// OCR types
export interface OCROptions {
  language?: string;
  confidence?: number;
  detectOrientation?: boolean;
  preserveLayout?: boolean;
}

export interface OCRResult {
  text: string;
  blocks: Array<{
    text: string;
    confidence: number;
    lines: Array<{
      text: string;
      confidence: number;
      words: Array<{
        text: string;
        confidence: number;
        bbox: [number, number, number, number];
      }>;
      bbox: [number, number, number, number];
    }>;
    bbox: [number, number, number, number];
  }>;
  confidence: number;
  language: string;
  pageNumber: number;
}

export interface DocumentOCRResult {
  pages: Array<{
    pageNumber: number;
    isScanned: boolean;
    result: OCRResult | null;
  }>;
  totalPages: number;
  totalScannedPages: number;
}

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  return await invoke<T>(command, args);
}

export const tauriCommands = {
  loadPdf: async (path: string) => {
    return await invokeCommand<PdfMetadata>('load_pdf', { path });
  },

  getPdfInfo: async (path: string) => {
    return await invokeCommand<PdfMetadata>('get_pdf_info', { path });
  },

  saveReadingProgress: async (documentId: string, page: number) => {
    await invokeCommand<undefined>('save_reading_progress', {
      documentId,
      page,
    });
  },

  openFile: async () => {
    return await invokeCommand<string | null>('open_file_dialog');
  },

  // Translation commands
  translateText: async (text: string, options: TranslationOptions) => {
    return await invokeCommand<TranslationResult>('translate_text', { text, options });
  },

  translatePage: async (pageText: string, pageNumber: number, options: TranslationOptions) => {
    return await invokeCommand<PageTranslationResult>('translate_page', {
      pageText,
      pageNumber,
      options,
    });
  },

  translateDocument: async (pages: Array<[number, string]>, options: TranslationOptions) => {
    return await invokeCommand<DocumentTranslationResult>('translate_document', {
      pages,
      options,
    });
  },

  detectLanguage: async (text: string) => {
    return await invokeCommand<string>('detect_language', { text });
  },

  // OCR commands
  isPageScanned: async (pageData: Uint8Array) => {
    return await invokeCommand<boolean>('is_page_scanned', {
      pageData: Array.from(pageData),
    });
  },

  ocrPage: async (imageData: Uint8Array, pageNumber: number, options: OCROptions) => {
    return await invokeCommand<OCRResult>('ocr_page', {
      imageData: Array.from(imageData),
      pageNumber,
      options,
    });
  },

  ocrDocument: async (pages: Array<[number, Uint8Array]>, options: OCROptions) => {
    return await invokeCommand<DocumentOCRResult>('ocr_document', {
      pages: pages.map(([num, data]) => [num, Array.from(data)]),
      options,
    });
  },

  extractTextFromImage: async (imageData: Uint8Array, options: OCROptions) => {
    return await invokeCommand<string>('extract_text_from_image', {
      imageData: Array.from(imageData),
      options,
    });
  },

  // Keychain commands
  storeApiKey: async (service: string, key: string) => {
    await invokeCommand<void>('store_api_key', { service, key });
  },

  getApiKey: async (service: string) => {
    return await invokeCommand<string>('get_api_key', { service });
  },

  deleteApiKey: async (service: string) => {
    await invokeCommand<void>('delete_api_key', { service });
  },

  hasApiKey: async (service: string) => {
    return await invokeCommand<boolean>('has_api_key', { service });
  },

  listApiServices: async () => {
    return await invokeCommand<string[]>('list_api_services');
  },
};
