import { useEffect, useState } from 'react';
import { useFileOpen } from '@/hooks/useFileOpen';

interface FileDropZoneProps {
  children: React.ReactNode;
}

export function FileDropZone({ children }: FileDropZoneProps) {
  const { openFileQuick } = useFileOpen();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter += 1;
      if (dragCounter === 1) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter -= 1;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        console.error('Please drop a PDF file');
        return;
      }

      const path = file.name;
      openFileQuick(path).catch((err: unknown) => {
        console.error('Failed to open file:', err);
      });
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [openFileQuick]);

  return (
    <div
      className={`relative ${
        isDragging ? 'bg-accent/20 ring-2 ring-accent' : ''
      }`}
    >
      {children}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
          <p className="text-white font-medium">Drop PDF to open</p>
        </div>
      )}
    </div>
  );
}
