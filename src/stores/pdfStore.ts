import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PDFDocumentMetadata } from '@/types/pdf';

interface PDFState {
  document: PDFDocumentMetadata | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
  isLoading: boolean;
  pdfBlobUrl: string | null;

  setDocument: (document: PDFDocumentMetadata) => void;
  setPdfBlobUrl: (url: string | null) => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  setRotation: (rotation: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const initialState = {
  document: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1.5,
  rotation: 0,
  isLoading: false,
  pdfBlobUrl: null,
};

export const usePDFStore = create<PDFState>()(
  immer((set) => ({
    ...initialState,

    setDocument: (document) => {
      set((state) => {
        state.document = document;
        state.totalPages = document.numPages;
        state.currentPage = 1;
      });
    },

    setPdfBlobUrl: (url) => {
      set((state) => {
        // Revoke old URL to prevent memory leaks
        if (state.pdfBlobUrl) {
          URL.revokeObjectURL(state.pdfBlobUrl);
        }
        state.pdfBlobUrl = url;
      });
    },

    setCurrentPage: (page) => {
      set((state) => {
        state.currentPage = page;
      });
    },

    setScale: (scale) => {
      set((state) => {
        state.scale = scale;
      });
    },

    setRotation: (rotation) => {
      set((state) => {
        state.rotation = rotation;
      });
    },

    setIsLoading: (isLoading) => {
      set((state) => {
        state.isLoading = isLoading;
      });
    },

    reset: () => {
      set(initialState);
    },
  }))
);
