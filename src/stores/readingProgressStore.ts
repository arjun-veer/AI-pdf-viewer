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

interface ReadingProgressState {
  history: Map<string, ReadingProgressRecord>;
  
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
        });
      },

      removeDocument: (documentId) => {
        set((state) => {
          state.history.delete(documentId);
        });
      },

      getRecentDocuments: (limit = 10) => {
        const allRecords = Array.from(get().history.values());
        return allRecords
          .sort((a, b) => 
            new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
          )
          .slice(0, limit);
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
              },
            } as unknown as { state: { history: Map<string, ReadingProgressRecord> } };
          }
          
          return parsed as unknown as { state: { history: Map<string, ReadingProgressRecord> } };
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
    }
  )
);
