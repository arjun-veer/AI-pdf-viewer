import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pdfService } from '../pdfService';

describe('PDFService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadDocument', () => {
    it('should load a PDF document successfully', async () => {
      const mockPdfData = new Uint8Array([37, 80, 68, 70]);
      
      const metadata = await pdfService.loadDocument(mockPdfData);
      
      expect(metadata).toBeDefined();
      expect(metadata.id).toBeDefined();
      expect(typeof metadata.numPages).toBe('number');
      expect(metadata.fingerprint).toBeDefined();
    });

    it('should throw error for invalid PDF data', async () => {
      const invalidData = new Uint8Array([1, 2, 3, 4]);
      
      await expect(pdfService.loadDocument(invalidData)).rejects.toThrow();
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
    it('should return empty array when document not loaded', async () => {
      const results = await pdfService.searchText('test');
      
      expect(results).toEqual([]);
    });

    it('should return empty array for empty search query', async () => {
      const results = await pdfService.searchText('');
      
      expect(results).toEqual([]);
    });
  });
});
