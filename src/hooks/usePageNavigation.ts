import { useEffect } from 'react';
import { usePDFStore } from '@/stores/pdfStore';

export function usePageNavigation() {
  const { currentPage, totalPages, setCurrentPage } = usePDFStore();

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

export function useKeyboardNavigation() {
  const { nextPage, prevPage } = usePageNavigation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          prevPage();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPage, prevPage]);
}
