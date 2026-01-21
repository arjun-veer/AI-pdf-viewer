import { useEffect, useCallback } from 'react';
import { pdfService } from '@/services/pdfService';
import { usePDFStore } from '@/stores/pdfStore';

export function usePDFPreload() {
  const { currentPage } = usePDFStore();

  const preloadAdjacentPages = useCallback((centerPage: number, range: number = 3) => {
    const startPage = Math.max(1, centerPage - range);
    const endPage = centerPage + range;
    
    pdfService.preloadPages(startPage, endPage);
  }, []);

  useEffect(() => {
    preloadAdjacentPages(currentPage);
  }, [currentPage, preloadAdjacentPages]);

  return {
    preloadAdjacentPages,
  };
}

export function usePDFCleanup() {
  useEffect(() => {
    return () => {
      pdfService.cleanup();
    };
  }, []);
}
