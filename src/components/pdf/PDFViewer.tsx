import { useCallback, useEffect, useState } from 'react';
import { pdfService } from '@/services/pdfService';
import { usePDFStore } from '@/stores/pdfStore';
import { useVirtualScroll, usePDFRenderer, usePDFPreload, usePDFCleanup } from '@/hooks';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  className?: string;
}

const PAGE_HEIGHT = 800;
const DEFAULT_OVERSCAN = 2;

export function PDFViewer({ className }: PDFViewerProps) {
  const { scale, rotation, totalPages, setIsLoading } = usePDFStore();
  const { visibleRange, containerRef, currentPage } = useVirtualScroll({
    totalPages,
    pageHeight: PAGE_HEIGHT,
    overscan: DEFAULT_OVERSCAN,
  });
  const { preloadAdjacentPages } = usePDFPreload();
  const [renderedPages, setRenderedPages] = useState<Map<number, HTMLCanvasElement>>(new Map());

  usePDFCleanup();

  useEffect(() => {
    preloadAdjacentPages(currentPage);
  }, [currentPage, preloadAdjacentPages]);

  const renderPage = useCallback(
    (pageNumber: number) => {
      const canvas = document.createElement('canvas');
      
      void (async () => {
        setIsLoading(true);
        try {
          await pdfService.renderPage(pageNumber, canvas, { scale, rotation });
          setRenderedPages((prev) => new Map(prev).set(pageNumber, canvas));
        } catch (error) {
          console.error('Failed to render page ' + String(pageNumber) + ':', error);
        } finally {
          setIsLoading(false);
        }
      })();

      return canvas;
    },
    [scale, rotation, setIsLoading]
  );

  useEffect(() => {
    for (let page = visibleRange.start; page < visibleRange.end; page++) {
      if (!renderedPages.has(page)) {
        renderPage(page);
      }
    }
  }, [visibleRange, renderedPages, renderPage]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full w-full overflow-y-auto overflow-x-hidden bg-muted',
        className
      )}
    >
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          const isVisible = pageNumber >= visibleRange.start && pageNumber < visibleRange.end;

          return (
            <PDFPage
              key={pageNumber}
              pageNumber={pageNumber}
              isVisible={isVisible}
              scale={scale}
              rotation={rotation}
            />
          );
        })}
      </div>
    </div>
  );
}

interface PDFPageProps {
  pageNumber: number;
  isVisible: boolean;
  scale: number;
  rotation: number;
}

function PDFPage({ pageNumber, isVisible, scale, rotation }: PDFPageProps) {
  const containerRef = usePDFRenderer(pageNumber, scale, rotation);

  if (!isVisible) {
    return (
      <div
        key={pageNumber}
        className="w-full bg-background shadow-sm"
        style={{ height: 800 }}
      >
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Page {pageNumber}
        </div>
      </div>
    );
  }

  return (
    <div
      key={pageNumber}
      className="flex flex-col items-center gap-2 rounded bg-background p-2 shadow-sm"
    >
      <div className="text-sm text-muted-foreground">Page {pageNumber}</div>
      <div className="w-full flex justify-center overflow-hidden rounded">
        <canvas
          ref={containerRef}
          className="border border-border"
          style={{
            transform: 'rotate(' + String(rotation) + 'deg)',
            transformOrigin: 'center',
          }}
        />
      </div>
    </div>
  );
}
