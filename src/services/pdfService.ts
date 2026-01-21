import * as pdfjsLib from 'pdfjs-dist';
import type {
  PDFDocumentMetadata,
  PDFPageInfo,
  PDFRenderOptions,
  PDFTextContent,
} from '@/types/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export class PDFService {
  private document: pdfjsLib.PDFDocumentProxy | null = null;
  private pageCache: Map<number, pdfjsLib.PDFPageProxy> = new Map();
  private maxCacheSize = 20;

  async loadDocument(data: Uint8Array): Promise<PDFDocumentMetadata> {
    const loadingTask = pdfjsLib.getDocument({ data });
    this.document = await loadingTask.promise;

    const metadata = await this.document.getMetadata();
    const info = metadata.info as Record<string, string>;

    return {
      id: crypto.randomUUID(),
      numPages: this.document.numPages,
      fingerprint: this.document.fingerprints[0] ?? '',
      ...(info['Title'] !== undefined && { title: info['Title'] }),
      ...(info['Author'] !== undefined && { author: info['Author'] }),
      ...(info['Subject'] !== undefined && { subject: info['Subject'] }),
      ...(info['Keywords'] !== undefined && { keywords: info['Keywords'] }),
      ...(info['Creator'] !== undefined && { creator: info['Creator'] }),
      ...(info['Producer'] !== undefined && { producer: info['Producer'] }),
      ...(info['CreationDate'] !== undefined && { creationDate: info['CreationDate'] }),
      ...(info['ModDate'] !== undefined && { modificationDate: info['ModDate'] }),
    };
  }

  async getPage(pageNumber: number): Promise<pdfjsLib.PDFPageProxy> {
    if (!this.document) {
      throw new Error('Document not loaded');
    }

    const cachedPage = this.pageCache.get(pageNumber);
    if (cachedPage) {
      return cachedPage;
    }

    const page = await this.document.getPage(pageNumber);
    
    if (this.pageCache.size >= this.maxCacheSize) {
      const firstKey = this.pageCache.keys().next().value;
      if (typeof firstKey === 'number') {
        this.pageCache.delete(firstKey);
      }
    }

    this.pageCache.set(pageNumber, page);
    return page;
  }

  async renderPage(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    options: PDFRenderOptions
  ): Promise<void> {
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ 
      scale: options.scale,
      rotation: options.rotation ?? 0,
    });

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  }

  async getPageInfo(pageNumber: number): Promise<PDFPageInfo> {
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });

    return {
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      rotation: viewport.rotation,
    };
  }

  async getTextContent(pageNumber: number): Promise<PDFTextContent> {
    const page = await this.getPage(pageNumber);
    const textContent = await page.getTextContent();
    
    return textContent as unknown as PDFTextContent;
  }

  async searchText(query: string): Promise<number[]> {
    if (!this.document) {
      throw new Error('Document not loaded');
    }

    const matchingPages: number[] = [];
    const lowerQuery = query.toLowerCase();

    for (let i = 1; i <= this.document.numPages; i++) {
      const textContent = await this.getTextContent(i);
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
        .toLowerCase();

      if (pageText.includes(lowerQuery)) {
        matchingPages.push(i);
      }
    }

    return matchingPages;
  }

  cleanup(): void {
    this.pageCache.clear();
    if (this.document) {
      void this.document.destroy();
      this.document = null;
    }
  }

  getDocument(): pdfjsLib.PDFDocumentProxy | null {
    return this.document;
  }
}

export const pdfService = new PDFService();
