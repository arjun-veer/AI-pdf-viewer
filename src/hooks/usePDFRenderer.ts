import { useEffect, useRef } from 'react';
import { pdfService } from '@/services/pdfService';
import type { PDFRenderOptions } from '@/types/pdf';

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
      const options: PDFRenderOptions = {
        scale,
        rotation,
      };

      try {
        await pdfService.renderPage(pageNumber, canvas, options);
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
