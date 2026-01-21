import { useState, useEffect, useRef } from 'react';

interface VirtualScrollConfig {
  totalPages: number;
  pageHeight: number;
  overscan: number;
}

interface VisibleRange {
  start: number;
  end: number;
}

export function useVirtualScroll(config: VirtualScrollConfig) {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: 0,
    end: Math.min(5, config.totalPages),
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const start = Math.max(
        0,
        Math.floor(scrollTop / config.pageHeight) - config.overscan
      );
      const end = Math.min(
        config.totalPages,
        Math.ceil((scrollTop + viewportHeight) / config.pageHeight) + config.overscan
      );

      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [config.pageHeight, config.overscan, config.totalPages]);

  return { visibleRange, containerRef };
}
