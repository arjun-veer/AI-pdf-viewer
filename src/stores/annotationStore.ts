import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PDFAnnotation } from '@/types/pdf';

interface AnnotationState {
  annotations: Map<number, PDFAnnotation[]>;
  selectedAnnotationId: string | null;

  addAnnotation: (pageNumber: number, annotation: PDFAnnotation) => void;
  updateAnnotation: (annotationId: string, updates: Partial<PDFAnnotation>) => void;
  deleteAnnotation: (annotationId: string) => void;
  setSelectedAnnotation: (annotationId: string | null) => void;
  getPageAnnotations: (pageNumber: number) => PDFAnnotation[];
  clearAll: () => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  immer((set, get) => ({
    annotations: new Map(),
    selectedAnnotationId: null,

    addAnnotation: (pageNumber, annotation) => {
      set((state) => {
        const pageAnnotations = state.annotations.get(pageNumber) ?? [];
        pageAnnotations.push(annotation);
        state.annotations.set(pageNumber, pageAnnotations);
      });
    },

    updateAnnotation: (annotationId, updates) => {
      set((state) => {
        for (const [pageNumber, annotations] of state.annotations.entries()) {
          const index = annotations.findIndex((a) => a.id === annotationId);
          if (index !== -1) {
            const annotation = annotations[index];
            if (annotation) {
              annotations[index] = { ...annotation, ...updates };
            }
            state.annotations.set(pageNumber, annotations);
            break;
          }
        }
      });
    },

    deleteAnnotation: (annotationId) => {
      set((state) => {
        for (const [pageNumber, annotations] of state.annotations.entries()) {
          const filtered = annotations.filter((a) => a.id !== annotationId);
          if (filtered.length !== annotations.length) {
            state.annotations.set(pageNumber, filtered);
            break;
          }
        }
      });
    },

    setSelectedAnnotation: (annotationId) => {
      set((state) => {
        state.selectedAnnotationId = annotationId;
      });
    },

    getPageAnnotations: (pageNumber) => {
      return get().annotations.get(pageNumber) ?? [];
    },

    clearAll: () => {
      set((state) => {
        state.annotations.clear();
        state.selectedAnnotationId = null;
      });
    },
  }))
);
