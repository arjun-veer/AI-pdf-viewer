import { usePageNavigation, useZoomControls, useFileOpen } from '@/hooks';
import { useState } from 'react';
import { usePDFStore } from '@/stores/pdfStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnnotationToolbar } from './AnnotationToolbar';
import { 
  File, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  MoreHorizontal
} from 'lucide-react';

interface PDFToolbarProps {
  className?: string;
}

export function PDFToolbar({ className }: PDFToolbarProps) {
  const { currentPage, totalPages } = usePDFStore();
  const [showAnnotationBar, setShowAnnotationBar] = useState(false);
  const { nextPage, prevPage, goToPage } = usePageNavigation();
  const { zoomIn, zoomOut, resetZoom, zoomPercentage } = useZoomControls();
  const { openFile, isLoading } = useFileOpen();

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  };

  const handleOpenFile = () => {
    void openFile();
  };

  return (
    <>
      <div className={cn('flex items-center justify-between gap-2 px-2 py-2 frosted shadow-sm rounded-b-md', className)}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleOpenFile} disabled={isLoading} className="h-9 w-9 p-0" title="Open file">
          <File className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage <= 1} className="h-9 w-9 p-0" title="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageInputChange}
              className="w-14 h-8 rounded-md border bg-background px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Page number"
            />
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>

          <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages} className="h-9 w-9 p-0" title="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={zoomOut} className="h-9 w-9 p-0" title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="px-2 py-1 rounded-md bg-background/60 text-center min-w-[56px]">
          <div className="text-sm font-medium">{zoomPercentage}%</div>
        </div>

        <Button variant="ghost" size="sm" onClick={zoomIn} className="h-9 w-9 p-0" title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button variant="ghost" size="sm" onClick={resetZoom} className="h-9 w-9 p-0" title="Reset rotation/zoom">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-9 w-9 p-0" title="More options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnnotationBar((s) => !s)}
          className="h-9 w-9 p-0"
          title="Toggle annotation toolbar"
        >
          <span className="text-sm">✏️</span>
        </Button>
      </div>
      </div>

      {showAnnotationBar && <AnnotationToolbar />}
    </>
  );
}
