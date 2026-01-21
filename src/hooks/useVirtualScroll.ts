import { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualScrollConfig {
  totalPages: number;
  pageHeight: number;
  overscan?: number;
}

interface VisibleRange {
  start: number;
  end: number;
}

interface VirtualScrollResult {
  visibleRange: VisibleRange;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollToPage: (pageNumber: number) => void;
  currentPage: number;
  isScrolling: boolean;
}

export function useVirtualScroll(config: VirtualScrollConfig): VirtualScrollResult {
  const overscan = config.overscan ?? 2;
  
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: 0,
    end: Math.min(overscan * 2, config.totalPages),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);

  const scrollToPage = useCallback((pageNumber: number) => {
    const container = containerRef.current;
    if (!container) return;

    const targetPage = Math.max(1, Math.min(pageNumber, config.totalPages));
    const scrollTop = (targetPage - 1) * config.pageHeight;
    
    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }, [config.pageHeight, config.totalPages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      const start = Math.max(
        0,
        Math.floor(scrollTop / config.pageHeight) - overscan
      );
      const end = Math.min(
        config.totalPages,
        Math.ceil((scrollTop + viewportHeight) / config.pageHeight) + overscan
      );

      const visibleCenter = scrollTop + viewportHeight / 2;
      const currentPageNumber = Math.max(
        1,
        Math.min(
          Math.ceil(visibleCenter / config.pageHeight),
          config.totalPages
        )
      );

      setVisibleRange({ start, end });
      setCurrentPage(currentPageNumber);
    };

    const debouncedScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    container.addEventListener('scroll', debouncedScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [config.pageHeight, overscan, config.totalPages]);

  return { 
    visibleRange, 
    containerRef, 
    scrollToPage, 
    currentPage,
    isScrolling 
  };
}
