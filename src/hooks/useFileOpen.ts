import { useState, useCallback } from 'react';
import { pdfService } from '@/services/pdfService';
import { usePDFStore } from '@/stores/pdfStore';
import { useReadingProgressStore } from '@/stores/readingProgressStore';

interface FileOpenOptions {
  onSuccess?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export function useFileOpen() {
  const { setDocument, setCurrentPage, setPdfBlobUrl } = usePDFStore();
  const getProgress = useReadingProgressStore((state) => state.getProgress);
  const [isLoading, setIsLoading] = useState(false);

  const openFile = useCallback(
    async (options?: FileOpenOptions) => {
      try {
        setIsLoading(true);

        // Use browser file input instead of Tauri dialog
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,application/pdf';
        
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          
          if (!file) {
            setIsLoading(false);
            return;
          }

          try {
            // Create blob URL for native browser PDF viewer
            const blobUrl = URL.createObjectURL(file);
            setPdfBlobUrl(blobUrl);

            // Still load metadata using PDF.js (minimal usage)
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const metadata = await pdfService.loadDocument(uint8Array);
            setDocument(metadata);

            const progress = getProgress(metadata.id);
            if (progress) {
              setCurrentPage(progress.currentPage);
            } else {
              setCurrentPage(1);
            }

            if (options?.onSuccess) {
              options.onSuccess(file.name);
            }

            setIsLoading(false);
          } catch (error) {
            setIsLoading(false);
            const err = error instanceof Error ? error : new Error('Unknown error');
            console.error('Failed to open file:', err);

            if (options?.onError) {
              options.onError(err);
            }
          }
        };

        input.click();
      } catch (error) {
        setIsLoading(false);
        const err = error instanceof Error ? error : new Error('Unknown error');
        console.error('Failed to open file:', err);

        if (options?.onError) {
          options.onError(err);
        }
      }
    },
    [setDocument, setCurrentPage, getProgress]
  );

  const openFileQuick = useCallback(
    async (_filePath: string) => {
      // Quick open (native) is not available in this environment.
      // This function is intentionally a no-op in browser builds.
      return;
    },
    [setDocument, setCurrentPage, getProgress]
  );

  return {
    openFile,
    openFileQuick,
    isLoading,
  };
}
