import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/infrastructure/api/apiClient';
import { createOfflineOperation } from '@/services/offlineQueue';
import { useOfflineQueueStore } from './offlineQueueStore';
import type { TeaInventoryItem } from '@/domain/appTypes';

interface InventoryState {
  items: TeaInventoryItem[];
  threshold: number;
  loading: boolean;
}

interface InventoryActions {
  loadInventory: () => Promise<void>;
  addItem: (item: Omit<TeaInventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, partial: Partial<TeaInventoryItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  deductLeaf: (teaId: string, grams: number) => Promise<void>;
}

type InventoryStore = InventoryState & InventoryActions;

function getIsLoggedIn() {
  return !!localStorage.getItem('mobrew_access_token');
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],
      threshold: 10,
      loading: false,

      loadInventory: async () => {
        set({ loading: true });
        try {
          if (getIsLoggedIn()) {
            const res = await apiClient.get('/inventory');
            set({ items: res.data?.items ?? res.data ?? [] });
          }
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        const tempId = `inv_${Date.now()}`;
        const newItem: TeaInventoryItem = {
          ...item,
          id: tempId,
          lowStockThreshold: item.lowStockThreshold ?? get().threshold,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const prevItems = get().items;
        set({ items: [...prevItems, newItem] });

        if (getIsLoggedIn()) {
          try {
            const res = await apiClient.post('/inventory', item);
            set({
              items: get().items.map((i) =>
                i.id === tempId ? { ...res.data, id: res.data.id ?? tempId } : i
              ),
            });
          } catch {
            set({ items: prevItems });
            useOfflineQueueStore.getState().enqueue(
              createOfflineOperation('UPDATE_INVENTORY', { action: 'create', payload: item })
            );
          }
        }
      },

      updateItem: async (id, partial) => {
        const prevItems = get().items;
        set({
          items: prevItems.map((i) =>
            i.id === id ? { ...i, ...partial, updatedAt: new Date().toISOString() } : i
          ),
        });

        if (getIsLoggedIn()) {
          try {
            await apiClient.patch(`/inventory/${id}`, partial);
          } catch {
            set({ items: prevItems });
            useOfflineQueueStore.getState().enqueue(
              createOfflineOperation('UPDATE_INVENTORY', {
                action: 'update',
                id,
                payload: partial,
              })
            );
          }
        }
      },

      removeItem: async (id) => {
        const prevItems = get().items;
        set({ items: prevItems.filter((i) => i.id !== id) });

        if (getIsLoggedIn()) {
          try {
            await apiClient.delete(`/inventory/${id}`);
          } catch {
            set({ items: prevItems });
            useOfflineQueueStore.getState().enqueue(
              createOfflineOperation('UPDATE_INVENTORY', {
                action: 'delete',
                id,
              })
            );
          }
        }
      },

      deductLeaf: async (teaId, grams) => {
        const item = get().items.find((i) => i.id === teaId);
        if (!item) return;

        const nextGrams = Math.max(0, item.quantityGrams - grams);
        await get().updateItem(teaId, { quantityGrams: nextGrams });
      },
    }),
    {
      name: 'mobrew_inventory',
      partialize: (state) => ({
        items: state.items,
        threshold: state.threshold,
      }),
    }
  )
);
