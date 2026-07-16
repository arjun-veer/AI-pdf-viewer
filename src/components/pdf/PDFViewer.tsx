import { useCallback, useEffect, useState } from 'react';
import { pdfService } from '@/services/pdfService';
import { usePDFStore } from '@/stores/pdfStore';
import { useVirtualScroll, usePDFRenderer, usePDFPreload, usePDFCleanup } from '@/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

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
 
  const { isLoading } = usePDFStore();

  return (
    <div ref={containerRef} className={cn('h-full w-full overflow-y-auto overflow-x-hidden bg-muted/10 auto-hide-scrollbar', className)}>
      <div className="flex flex-col gap-4 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: Math.min(3, Math.max(1, totalPages || 3)) }).map((_, i) => (
              <div key={i} className="w-full flex justify-center">
                <div className="max-w-[900px] w-full rounded-2xl p-6 bg-background/30">
                  <div className="h-[28rem] w-full rounded bg-muted/30 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : totalPages === 0 ? (
          <div className="flex h-full min-h-[420px] flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-border bg-background/50 p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                <File className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">No document loaded</h2>
                <p className="text-muted-foreground max-w-lg">
                  Open a PDF using the toolbar button or drag and drop a file onto the window to get started.
                </p>
              </div>
              <Button onClick={() => document.dispatchEvent(new Event('open-pdf'))} className="mt-4">
                <File className="w-4 h-4 mr-2" />
                Open PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isVisible = pageNumber >= visibleRange.start && pageNumber < visibleRange.end;

              return (
                <div key={pageNumber} className="w-full flex justify-center">
                  <div className="max-w-[900px] w-full bg-background rounded-2xl shadow-lg p-6 transition-transform duration-200 hover:-translate-y-1">
                    <PDFPage pageNumber={pageNumber} isVisible={isVisible} scale={scale} rotation={rotation} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        className="w-full bg-background shadow-sm rounded-lg"
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
      className="flex flex-col items-center gap-2 rounded bg-background p-4 shadow-sm"
    >
      <div className="text-sm text-muted-foreground">Page {pageNumber}</div>
      <div className="w-full flex justify-center overflow-hidden rounded">
        <canvas
          ref={containerRef}
          className="border border-border"
          style={{
            transform: 'rotate(' + String(rotation) + 'deg)',
            transformOrigin: 'center',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
