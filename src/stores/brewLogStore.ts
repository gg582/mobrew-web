import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/infrastructure/api/apiClient';
import { createOfflineOperation } from '@/services/offlineQueue';
import { useOfflineQueueStore } from './offlineQueueStore';
import type { BrewLogEntry } from '@/domain/appTypes';

interface BrewLogFilters {
  teaType?: number | null;
  from?: number | null;
  to?: number | null;
  minRating?: number | null;
}

interface BrewLogState {
  logs: BrewLogEntry[];
  filters: BrewLogFilters;
  loading: boolean;
}

interface BrewLogActions {
  loadLogs: (filters?: BrewLogFilters) => Promise<void>;
  addLog: (entry: Omit<BrewLogEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLog: (id: string, partial: Partial<BrewLogEntry>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  setFilters: (filters: BrewLogFilters) => void;
}

type BrewLogStore = BrewLogState & BrewLogActions;

function getIsLoggedIn() {
  return !!localStorage.getItem('mobrew_access_token');
}

export const useBrewLogStore = create<BrewLogStore>()(
  persist(
    (set, get) => ({
      logs: [],
      filters: {},
      loading: false,

      loadLogs: async (filters) => {
        set({ loading: true });
        if (filters) set({ filters });
        try {
          if (getIsLoggedIn()) {
            const params = new URLSearchParams();
            if (filters?.teaType != null) params.set('teaType', String(filters.teaType));
            if (filters?.from != null) params.set('from', String(filters.from));
            if (filters?.to != null) params.set('to', String(filters.to));
            if (filters?.minRating != null) params.set('minRating', String(filters.minRating));
            const res = await apiClient.get(`/brew-logs?${params.toString()}`);
            set({ logs: res.data?.logs ?? res.data ?? [] });
          }
        } finally {
          set({ loading: false });
        }
      },

      addLog: async (entry) => {
        const tempId = `log_${Date.now()}`;
        const newLog: BrewLogEntry = {
          ...entry,
          id: tempId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const prevLogs = get().logs;
        set({ logs: [newLog, ...prevLogs] });

        if (getIsLoggedIn()) {
          try {
            const res = await apiClient.post('/brew-logs', entry);
            set({
              logs: get().logs.map((l) =>
                l.id === tempId ? { ...res.data, id: res.data.id ?? tempId } : l
              ),
            });
          } catch {
            set({ logs: prevLogs });
            useOfflineQueueStore.getState().enqueue(
              createOfflineOperation('CREATE_BREW_LOG', entry)
            );
          }
        }
      },

      updateLog: async (id, partial) => {
        const prevLogs = get().logs;
        set({
          logs: prevLogs.map((l) =>
            l.id === id ? { ...l, ...partial, updatedAt: new Date().toISOString() } : l
          ),
        });

        if (getIsLoggedIn()) {
          try {
            await apiClient.patch(`/brew-logs/${id}`, partial);
          } catch {
            set({ logs: prevLogs });
            useOfflineQueueStore.getState().enqueue(
              createOfflineOperation('CREATE_BREW_LOG', { action: 'update', id, payload: partial })
            );
          }
        }
      },

      deleteLog: async (id) => {
        const prevLogs = get().logs;
        set({ logs: prevLogs.filter((l) => l.id !== id) });

        if (getIsLoggedIn()) {
          try {
            await apiClient.delete(`/brew-logs/${id}`);
          } catch {
            set({ logs: prevLogs });
            useOfflineQueueStore.getState().enqueue(
              createOfflineOperation('CREATE_BREW_LOG', { action: 'delete', id })
            );
          }
        }
      },

      setFilters: (filters) => set({ filters }),
    }),
    {
      name: 'mobrew_brew_logs',
      partialize: (state) => ({
        logs: state.logs,
        filters: state.filters,
      }),
      merge: (persistedState, currentState) => {
        const ps = persistedState as Partial<BrewLogStore>;
        return {
          ...currentState,
          logs: Array.isArray(ps.logs) ? ps.logs : currentState.logs,
          filters:
            ps.filters && typeof ps.filters === 'object'
              ? (ps.filters as BrewLogFilters)
              : currentState.filters,
        };
      },
    }
  )
);
