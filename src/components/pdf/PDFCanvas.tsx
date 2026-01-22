import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PDFCanvasProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  className?: string;
}

export const PDFCanvas = forwardRef<HTMLCanvasElement, PDFCanvasProps>(
  ({ pageNumber, scale, rotation, className }, ref) => {
    return (
      <div className={cn(
        'flex justify-center items-center bg-gray-900',
        className
      )}>
        <div 
          style={{
            transform: 'rotate(' + String(rotation) + 'deg)',
            transformOrigin: 'center',
          }}
          className="flex justify-center items-center"
        >
          <canvas
            ref={ref}
            key={String(pageNumber) + '-' + String(scale) + '-' + String(rotation)}
            className="shadow-lg"
            data-page={pageNumber}
          />
        </div>
      </div>
    );
  }
);

PDFCanvas.displayName = 'PDFCanvas';
