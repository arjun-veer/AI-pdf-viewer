import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PDFAnnotation } from '@/types/pdf';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
export type AnnotationType = 'highlight' | 'note' | 'drawing' | 'bookmark';

interface AnnotationState {
  annotations: Map<number, PDFAnnotation[]>;
  selectedAnnotationId: string | null;
  activeType: AnnotationType | null;
  activeColor: HighlightColor;

  addAnnotation: (pageNumber: number, annotation: PDFAnnotation) => void;
  updateAnnotation: (annotationId: string, updates: Partial<PDFAnnotation>) => void;
  deleteAnnotation: (annotationId: string) => void;
  setSelectedAnnotation: (annotationId: string | null) => void;
  getPageAnnotations: (pageNumber: number) => PDFAnnotation[];
  getAnnotations: () => PDFAnnotation[];
  setActiveType: (type: AnnotationType | null) => void;
  setActiveColor: (color: HighlightColor) => void;
  clearAll: () => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  immer((set, get) => ({
    annotations: new Map(),
    selectedAnnotationId: null,
    activeType: null,
    activeColor: 'yellow',

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

    getAnnotations: () => {
      const allAnnotations: PDFAnnotation[] = [];
      for (const annotations of get().annotations.values()) {
        allAnnotations.push(...annotations);
      }
      return allAnnotations;
    },

    setActiveType: (type) => {
      set((state) => {
        state.activeType = type;
      });
    },

    setActiveColor: (color) => {
      set((state) => {
        state.activeColor = color;
      });
    },

    clearAll: () => {
      set((state) => {
        state.annotations.clear();
        state.selectedAnnotationId = null;
      });
    },
  }))
);
