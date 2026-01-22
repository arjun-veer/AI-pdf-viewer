import { useState, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { pdfService } from '@/services/pdfService';
import { usePDFStore } from '@/stores/pdfStore';
import { useReadingProgressStore } from '@/stores/readingProgressStore';

interface FileOpenOptions {
  onSuccess?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export function useFileOpen() {
  const { setDocument, setCurrentPage } = usePDFStore();
  const getProgress = useReadingProgressStore((state) => state.getProgress);
  const [isLoading, setIsLoading] = useState(false);

  const openFile = useCallback(
    async (options?: FileOpenOptions) => {
      try {
        setIsLoading(true);

        const filePath = await open({
          filters: [
            {
              name: 'PDF Documents',
              extensions: ['pdf'],
            },
          ],
        });

        if (!filePath) {
          setIsLoading(false);
          return;
        }

        const fileBytes = await readFile(filePath);
        const uint8Array = new Uint8Array(fileBytes);

        const metadata = await pdfService.loadDocument(uint8Array);
        setDocument(metadata);

        const progress = getProgress(metadata.id);
        if (progress) {
          setCurrentPage(progress.currentPage);
        } else {
          setCurrentPage(1);
        }

        if (options?.onSuccess) {
          options.onSuccess(filePath);
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
    },
    [setDocument, setCurrentPage, getProgress]
  );

  const openFileQuick = useCallback(
    async (filePath: string) => {
      try {
        setIsLoading(true);

        const fileBytes = await readFile(filePath);
        const uint8Array = new Uint8Array(fileBytes as ArrayBufferLike);

        const metadata = await pdfService.loadDocument(uint8Array);
        setDocument(metadata);

        const progress = getProgress(metadata.id);
        if (progress) {
          setCurrentPage(progress.currentPage);
        } else {
          setCurrentPage(1);
        }

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to open file:', error);
      }
    },
    [setDocument, setCurrentPage, getProgress]
  );

  return {
    openFile,
    openFileQuick,
    isLoading,
  };
}
