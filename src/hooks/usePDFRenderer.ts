import { useEffect, useRef } from 'react';
import { pdfService } from '@/services/pdfService';


export function usePDFRenderer(
  pageNumber: number,
  scale: number,
  rotation: number = 0
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;

    const renderPage = async () => {
      // Ensure a document is loaded
      if (!pdfService.getDocument()) {
        return;
      }

      try {
        const page = await pdfService.getPage(pageNumber);

        // Get the page dimensions at scale 1 to compute responsive scaling
        const baseViewport = page.getViewport({ scale: 1, rotation });

        // Compute available width from the canvas parent (fallback to window)
        const parentWidth =
          (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth;

        // Compute a target scale so the page fits the container width while applying user scale
        const targetScale = (parentWidth / baseViewport.width) * Math.max(0.1, scale);

        const viewport = page.getViewport({ scale: targetScale, rotation });

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas context not available');
        }

        // Set canvas display size (CSS) and drawing buffer size (attributes)
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        canvas.style.width = Math.min(viewport.width, parentWidth) + 'px';
        canvas.style.height = 'auto';

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (error) {
        if (!isCancelled) {
          console.error('Error rendering page:', pageNumber, error);
        }
      }
    };

    void renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pageNumber, scale, rotation]);

  return canvasRef;
}
