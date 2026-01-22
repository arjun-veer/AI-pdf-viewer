import { usePageNavigation, useZoomControls } from '@/hooks';
import { usePDFStore } from '@/stores/pdfStore';
import { cn } from '@/lib/utils';

interface PDFToolbarProps {
  className?: string;
}

export function PDFToolbar({ className }: PDFToolbarProps) {
  const { currentPage, totalPages } = usePDFStore();
  const { nextPage, prevPage, goToPage } = usePageNavigation();
  const { zoomIn, zoomOut, resetZoom, zoomPercentage } = useZoomControls();

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 border-b bg-background px-4 py-2',
      className
    )}>
      <div className="flex items-center gap-2">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="rounded bg-accent px-3 py-1 text-sm disabled:opacity-50"
          title="Previous page (←)"
        >
          ← Prev
        </button>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={handlePageInputChange}
            className="w-12 rounded border bg-background px-2 py-1 text-center text-sm"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="rounded bg-accent px-3 py-1 text-sm disabled:opacity-50"
          title="Next page (→)"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={zoomOut}
          className="rounded bg-accent px-3 py-1 text-sm"
          title="Zoom out (Ctrl+-)"
        >
          −
        </button>
        
        <span className="w-16 rounded border bg-background px-2 py-1 text-center text-sm">
          {zoomPercentage}%
        </span>
        
        <button
          onClick={zoomIn}
          className="rounded bg-accent px-3 py-1 text-sm"
          title="Zoom in (Ctrl++)"
        >
          +
        </button>
        
        <button
          onClick={resetZoom}
          className="rounded bg-accent px-3 py-1 text-sm"
          title="Reset zoom (Ctrl+0)"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
