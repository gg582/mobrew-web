import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/infrastructure/api/apiClient';
import type { CustomCurve } from '@/domain/appTypes';

interface CurveState {
  curves: CustomCurve[];
  loading: boolean;
}

interface CurveActions {
  loadCurves: () => Promise<void>;
  saveCurve: (curve: Omit<CustomCurve, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CustomCurve>;
  updateCurve: (id: string, partial: Partial<CustomCurve>) => Promise<void>;
  deleteCurve: (id: string) => Promise<void>;
}

type CurveStore = CurveState & CurveActions;

export const MAX_CUSTOM_CURVES = 10;

function getIsLoggedIn(): boolean {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem('mobrew_access_token');
}

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export const useCurveStore = create<CurveStore>()(
  persist(
    (set, get) => ({
      curves: [],
      loading: false,

      loadCurves: async () => {
        set({ loading: true });
        try {
          if (getIsLoggedIn()) {
            const res = await apiClient.get('/curves');
            if (Array.isArray(res.data)) {
              set({ curves: res.data as CustomCurve[] });
              return;
            }
          }
        } catch {
          // fall through to persisted state
        } finally {
          set({ loading: false });
        }
      },

      saveCurve: async (curve) => {
        if (get().curves.length >= MAX_CUSTOM_CURVES) {
          throw new Error('Curve limit reached');
        }
        const now = new Date().toISOString();
        const newCurve: CustomCurve = {
          ...curve,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };

        try {
          if (getIsLoggedIn()) {
            const res = await apiClient.post('/curves', newCurve);
            const saved = res.data as CustomCurve;
            set((state) => ({ curves: [saved, ...state.curves] }));
            return saved;
          }
        } catch {
          // keep local copy below
        }

        set((state) => ({ curves: [newCurve, ...state.curves] }));
        return newCurve;
      },

      updateCurve: async (id, partial) => {
        const now = new Date().toISOString();
        try {
          if (getIsLoggedIn()) {
            await apiClient.patch(`/curves/${id}`, partial);
          }
        } catch {
          // local state is still updated below
        }
        set((state) => ({
          curves: state.curves.map((c) =>
            c.id === id ? { ...c, ...partial, updatedAt: now } : c
          ),
        }));
      },

      deleteCurve: async (id) => {
        try {
          if (getIsLoggedIn()) {
            await apiClient.delete(`/curves/${id}`);
          }
        } catch {
          // local state is still updated below
        }
        set((state) => ({
          curves: state.curves.filter((c) => c.id !== id),
        }));
      },
    }),
    {
      name: 'mobrew_curves',
      partialize: (state) => ({ curves: state.curves }),
    }
  )
);
