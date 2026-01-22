import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyncState {
  isOnline: boolean;
  lastSync: Date | null;
  pending: number;
  syncing: boolean;
  error: string | null;
  autoSync: boolean;
  syncInterval: number;
  
  // Actions
  setOnline: (online: boolean) => void;
  setSyncStatus: (status: { lastSync?: Date; pending?: number; syncing?: boolean; error?: string | null }) => void;
  setAutoSync: (enabled: boolean) => void;
  setSyncInterval: (interval: number) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  resetPending: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      lastSync: null,
      pending: 0,
      syncing: false,
      error: null,
      autoSync: true,
      syncInterval: 60000, // 1 minute

      setOnline: (online) => set({ isOnline: online }),
      
      setSyncStatus: (status) => set((state) => ({
        lastSync: status.lastSync ?? state.lastSync,
        pending: status.pending ?? state.pending,
        syncing: status.syncing ?? state.syncing,
        error: status.error ?? state.error,
      })),
      
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      
      setSyncInterval: (interval) => set({ syncInterval: interval }),
      
      incrementPending: () => set((state) => ({ pending: state.pending + 1 })),
      
      decrementPending: () => set((state) => ({ pending: Math.max(0, state.pending - 1) })),
      
      resetPending: () => set({ pending: 0 }),
    }),
    {
      name: 'sync-storage',
    }
  )
);

// Monitor online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useSyncStore.getState().setOnline(true));
  window.addEventListener('offline', () => useSyncStore.getState().setOnline(false));
}
