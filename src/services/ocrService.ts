/**
 * OCR Service
 * 
 * Provides Optical Character Recognition using PaddleOCR or cloud OCR APIs.
 * Automatically detects scanned PDFs and extracts text from images.
 * 
 * PaddleOCR: Supports 80+ languages with high accuracy.
 * For production: Consider Tesseract.js (in-browser) or cloud APIs (Google Vision, AWS Textract).
 */

export interface OCROptions {
  language?: string; // Default: 'en'
  confidence?: number; // Minimum confidence threshold (0-1)
  detectOrientation?: boolean; // Auto-rotate text
  preserveLayout?: boolean; // Maintain text layout
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface OCRLine {
  text: string;
  confidence: number;
  words: OCRWord[];
  bbox: [number, number, number, number];
}

export interface OCRBlock {
  text: string;
  confidence: number;
  lines: OCRLine[];
  bbox: [number, number, number, number];
}

export interface OCRResult {
  text: string;
  blocks: OCRBlock[];
  confidence: number;
  language: string;
  pageNumber: number;
}

export interface PageOCRResult {
  pageNumber: number;
  isScanned: boolean;
  result: OCRResult | null;
}

export interface DocumentOCRResult {
  pages: PageOCRResult[];
  totalPages: number;
  scannedPages: number;
  completedAt: Date;
}

/**
 * Supported OCR languages
 */
export const SUPPORTED_OCR_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  vi: 'Vietnamese',
} as const;

export type OCRLanguageCode = keyof typeof SUPPORTED_OCR_LANGUAGES;

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class OCRService {
  private static ocrReady = false;
  private static ocrCache = new Map<string, OCRResult>();

  /**
   * Initialize OCR service
   * In production: Load PaddleOCR model or configure API keys
   */
  static initialize(): void {
    if (this.ocrReady) return;

    // TODO: Load PaddleOCR model or initialize OCR API
    // For now, using placeholder implementation

    this.ocrReady = true;
  }

  /**
   * Detect if a page is scanned (image-based)
   * Checks if page contains mostly images and little text
   */
  static detectScannedPage(
    _pageNumber: number,
    textContent: string,
    hasImages: boolean
  ): boolean {
    // Simple heuristic:
    // - If page has very little text (<100 chars) and has images, likely scanned
    // - If text/image ratio is very low, likely scanned

    if (!hasImages) return false;

    const textLength = textContent.trim().length;
    if (textLength < 100) return true;

    // Could also check image coverage ratio, text quality, etc.
    return false;
  }

  /**
   * Perform OCR on a single page
   * Accepts image data (from canvas or file)
   */
  static async performOCR(
    imageData: ImageData | string,
    pageNumber: number,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    await this.initialize();

    const language = options.language || 'en';
    const cacheKey = `${String(pageNumber)}:${language}`;

    const cached = this.ocrCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO: Implement actual OCR using PaddleOCR or cloud API
    // For now, return placeholder result
    const result = await this.simulateOCR(imageData, pageNumber, language);

    this.ocrCache.set(cacheKey, result);
    return result;
  }

  /**
   * Process scanned PDF page
   * Extracts image from page and performs OCR
   */
  static async processScannedPage(
    canvas: HTMLCanvasElement,
    pageNumber: number,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return this.performOCR(imageData, pageNumber, options);
  }

  /**
   * Process entire document
   * Detects scanned pages and performs OCR only on those pages
   */
  static async processDocument(
    pages: {
      pageNumber: number;
      canvas?: HTMLCanvasElement;
      textContent: string;
      hasImages: boolean;
    }[],
    options: OCROptions = {},
    onProgress?: (completed: number, total: number) => void
  ): Promise<DocumentOCRResult> {
    await this.initialize();

    const results: PageOCRResult[] = [];
    let scannedPages = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page) continue;

      // Detect if page is scanned
      const isScanned = await this.detectScannedPage(
        page.pageNumber,
        page.textContent,
        page.hasImages
      );

      if (isScanned && page.canvas) {
        // Perform OCR on scanned page
        const result = await this.processScannedPage(page.canvas, page.pageNumber, options);
        results.push({ pageNumber: page.pageNumber, isScanned: true, result });
        scannedPages++;
      } else {
        // Use existing text content
        results.push({ pageNumber: page.pageNumber, isScanned: false, result: null });
      }

      onProgress?.(i + 1, pages.length);
    }

    return {
      pages: results,
      totalPages: pages.length,
      scannedPages,
      completedAt: new Date(),
    };
  }

  /**
   * Export OCR result to different formats
   */
  static exportResult(result: OCRResult, format: 'text' | 'json' | 'markdown'): string {
    switch (format) {
      case 'text':
        return result.text;

      case 'json':
        return JSON.stringify(result, null, 2);

      case 'markdown':
        return this.convertToMarkdown(result);

      default:
        return result.text;
    }
  }

  /**
   * Convert OCR result to markdown
   */
  private static convertToMarkdown(result: OCRResult): string {
    let markdown = `# Page ${result.pageNumber}\n\n`;

    for (const block of result.blocks) {
      markdown += `${block.text}\n\n`;
    }

    markdown += `\n---\n*Confidence: ${(result.confidence * 100).toFixed(1)}%*\n`;
    return markdown;
  }

  /**
   * Simulate OCR (placeholder implementation)
   */
  private static async simulateOCR(
    _imageData: ImageData | string,
    pageNumber: number,
    language: string
  ): Promise<OCRResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate placeholder OCR result
    const mockText = `This is simulated OCR text for page ${String(pageNumber)} in ${language}.\nThis would be replaced with actual OCR output from PaddleOCR or cloud API.\n\nThe OCR would extract text from images and scanned documents.`;

    const mockBlock: OCRBlock = {
      text: mockText,
      confidence: 0.92,
      lines: [
        {
          text: `This is simulated OCR text for page ${String(pageNumber)} in ${language}.`,
          confidence: 0.95,
          words: [],
          bbox: [10, 10, 500, 30],
        },
        {
          text: 'This would be replaced with actual OCR output from PaddleOCR or cloud API.',
          confidence: 0.91,
          words: [],
          bbox: [10, 40, 500, 60],
        },
      ],
      bbox: [10, 10, 500, 100],
    };

    return {
      text: mockText,
      blocks: [mockBlock],
      confidence: 0.92,
      language,
      pageNumber,
    };
  }

  /**
   * Clear OCR cache
   */
  static clearCache(): void {
    this.ocrCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.ocrCache.size,
      keys: Array.from(this.ocrCache.keys()),
    };
  }

  /**
   * Check if OCR is ready
   */
  static isReady(): boolean {
    return this.ocrReady;
  }

  /**
   * Estimate OCR processing time
   */
  static estimateProcessingTime(pageCount: number): number {
    // Rough estimate: 2 seconds per page
    return pageCount * 2000;
  }
}
