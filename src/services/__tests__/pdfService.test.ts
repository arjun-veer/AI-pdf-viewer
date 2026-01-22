import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PDFService } from '../pdfService';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 10,
      fingerprints: ['test-fingerprint'],
      getMetadata: () => Promise.resolve({
        info: {
          Title: 'Test PDF',
          Author: 'Test Author',
        },
      }),
      getPage: (_pageNum: number) => Promise.resolve({
        getViewport: () => ({
          width: 600,
          height: 800,
          rotation: 0,
        }),
        render: () => ({ promise: Promise.resolve() }),
        getTextContent: () => Promise.resolve({
          items: [{ str: 'test content' }],
        }),
      }),
      destroy: () => Promise.resolve(),
    }),
  })),
}));

describe('PDFService', () => {
  let pdfService: PDFService;

  beforeEach(() => {
    pdfService = new PDFService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    pdfService.cleanup();
  });

  describe('loadDocument', () => {
    it('should load a PDF document successfully', async () => {
      const mockPdfData = new Uint8Array([37, 80, 68, 70]);
      
      const metadata = await pdfService.loadDocument(mockPdfData);
      
      expect(metadata).toBeDefined();
      expect(metadata.id).toBeDefined();
      expect(metadata.numPages).toBe(10);
      expect(metadata.fingerprint).toBe('test-fingerprint');
      expect(metadata.title).toBe('Test PDF');
      expect(metadata.author).toBe('Test Author');
    });
  });

  describe('getPage', () => {
    it('should throw error when document is not loaded', async () => {
      await expect(pdfService.getPage(1)).rejects.toThrow('Document not loaded');
    });

    it('should cache pages for performance', async () => {
      const mockPdfData = new Uint8Array([37, 80, 68, 70]);
      await pdfService.loadDocument(mockPdfData);
      
      const page1 = await pdfService.getPage(1);
      const page1Again = await pdfService.getPage(1);
      
      expect(page1).toBe(page1Again);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = pdfService.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.maxSize).toBeGreaterThan(0);
      expect(typeof stats.hitRate).toBe('number');
    });
  });

  describe('setMaxCacheSize', () => {
    it('should update max cache size within limits', () => {
      pdfService.setMaxCacheSize(15);
      const stats = pdfService.getCacheStats();
      
      expect(stats.maxSize).toBe(15);
    });

    it('should enforce minimum cache size of 5', () => {
      pdfService.setMaxCacheSize(2);
      const stats = pdfService.getCacheStats();
      
      expect(stats.maxSize).toBe(5);
    });

    it('should enforce maximum cache size of 50', () => {
      pdfService.setMaxCacheSize(100);
      const stats = pdfService.getCacheStats();
      
      expect(stats.maxSize).toBe(50);
    });
  });

  describe('searchText', () => {
    it('should throw error when document not loaded', async () => {
      await expect(pdfService.searchText('test')).rejects.toThrow('Document not loaded');
    });

    it('should return matching page numbers', async () => {
      const mockPdfData = new Uint8Array([37, 80, 68, 70]);
      await pdfService.loadDocument(mockPdfData);
      
      const results = await pdfService.searchText('test');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching query', async () => {
      const mockPdfData = new Uint8Array([37, 80, 68, 70]);
      await pdfService.loadDocument(mockPdfData);
      
      const results = await pdfService.searchText('nonexistenttext12345');
      
      expect(results).toEqual([]);
    });
  });
});
