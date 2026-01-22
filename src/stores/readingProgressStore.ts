import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ReadingProgressRecord {
  documentId: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
  readingTimeSeconds: number;
}

const computeRecentDocuments = (history: Map<string, ReadingProgressRecord>): ReadingProgressRecord[] => {
  const allRecords = Array.from(history.values());
  return allRecords
    .sort((a, b) => 
      new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    )
    .slice(0, 10);
};

interface ReadingProgressState {
  history: Map<string, ReadingProgressRecord>;
  recentDocuments: ReadingProgressRecord[];
  
  saveProgress: (documentId: string, currentPage: number, totalPages: number) => void;
  getProgress: (documentId: string) => ReadingProgressRecord | undefined;
  updateReadingTime: (documentId: string, additionalSeconds: number) => void;
  clearHistory: () => void;
  removeDocument: (documentId: string) => void;
  getRecentDocuments: (limit?: number) => ReadingProgressRecord[];
}

export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    immer((set, get) => ({
      history: new Map(),
      recentDocuments: [],

      saveProgress: (documentId, currentPage, totalPages) => {
        set((state) => {
          const existing = state.history.get(documentId);
          const record: ReadingProgressRecord = {
            documentId,
            currentPage,
            totalPages,
            lastReadAt: new Date().toISOString(),
            readingTimeSeconds: existing?.readingTimeSeconds ?? 0,
          };
          state.history.set(documentId, record);
          state.recentDocuments = computeRecentDocuments(state.history);
        });
      },

      getProgress: (documentId) => {
        return get().history.get(documentId);
      },

      updateReadingTime: (documentId, additionalSeconds) => {
        set((state) => {
          const existing = state.history.get(documentId);
          if (existing) {
            existing.readingTimeSeconds += additionalSeconds;
            state.history.set(documentId, existing);
          }
        });
      },

      clearHistory: () => {
        set((state) => {
          state.history.clear();
          state.recentDocuments = [];
        });
      },

      removeDocument: (documentId) => {
        set((state) => {
          state.history.delete(documentId);
          state.recentDocuments = computeRecentDocuments(state.history);
        });
      },

      getRecentDocuments: (limit = 10) => {
        return get().recentDocuments.slice(0, limit);
      },
    })),
    {
      name: 'reading-progress',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const parsed = JSON.parse(str) as { 
            state?: { 
              history?: Record<string, ReadingProgressRecord> 
            } 
          };
          
          if (parsed.state?.history) {
            const historyMap = new Map(Object.entries(parsed.state.history));
            return {
              state: {
                history: historyMap,
                recentDocuments: computeRecentDocuments(historyMap),
              },
            } as unknown as { state: { history: Map<string, ReadingProgressRecord>; recentDocuments: ReadingProgressRecord[] } };
          }
          
          return parsed as unknown as { state: { history: Map<string, ReadingProgressRecord>; recentDocuments: ReadingProgressRecord[] } };
        },
        setItem: (name, value) => {
          const state = {
            ...value,
            state: {
              ...value.state,
              history: Object.fromEntries(value.state.history),
            },
          };
          localStorage.setItem(name, JSON.stringify(state));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        history: state.history,
        recentDocuments: state.recentDocuments,
      }),
    }
  )
);
