import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/infrastructure/api/apiClient';
import type { UserSettings } from '@/domain/appTypes';

interface SettingsState {
  settings: UserSettings;
  loading: boolean;
}

interface SettingsActions {
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
}

type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  timerChime: 'chime1',
  notifications: true,
  lowStockThreshold: 10,
};

function getIsLoggedIn() {
  return !!localStorage.getItem('mobrew_access_token');
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_SETTINGS },
      loading: false,

      loadSettings: async () => {
        set({ loading: true });
        try {
          if (getIsLoggedIn()) {
            const res = await apiClient.get('/settings');
            set({ settings: { ...DEFAULT_SETTINGS, ...res.data } });
          }
        } catch {
          // keep persisted settings on error
        } finally {
          set({ loading: false });
        }
      },

      updateSettings: async (partial) => {
        const next = { ...get().settings, ...partial };
        set({ settings: next });

        if (getIsLoggedIn()) {
          try {
            await apiClient.patch('/settings', partial);
          } catch {
            // local state already updated; could enqueue offline op if needed
          }
        }
      },
    }),
    {
      name: 'mobrew_settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
