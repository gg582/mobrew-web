import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/infrastructure/api/apiClient';
import type { OfflineOperation, OfflineOperationType } from '@/domain/appTypes';

interface OfflineQueueState {
  queue: OfflineOperation[];
  isOnline: boolean;
  syncing: boolean;
}

interface OfflineQueueActions {
  enqueue: (op: OfflineOperation) => void;
  dequeue: (id: string) => void;
  processQueue: () => Promise<void>;
  setOnline: (value: boolean) => void;
  updateRetry: (id: string) => void;
}

type OfflineQueueStore = OfflineQueueState & OfflineQueueActions;

const MAX_RETRIES = 5;
const BACKOFF_MS = 1000;

type ServerTable = 'brewLog' | 'inventory' | 'preset' | 'curve' | 'setting';
type ServerOp = 'create' | 'update' | 'delete';

function mapOfflineOp(type: OfflineOperationType): { table: ServerTable; op: ServerOp } | null {
  switch (type) {
    case 'CREATE_BREW_LOG':
      return { table: 'brewLog', op: 'create' };
    case 'UPDATE_INVENTORY':
      return { table: 'inventory', op: 'update' };
    case 'CREATE_PRESET':
      return { table: 'preset', op: 'create' };
    case 'UPDATE_PRESET':
      return { table: 'preset', op: 'update' };
    case 'DELETE_PRESET':
      return { table: 'preset', op: 'delete' };
    case 'CREATE_CURVE':
      return { table: 'curve', op: 'create' };
    case 'UPDATE_CURVE':
      return { table: 'curve', op: 'update' };
    case 'DELETE_CURVE':
      return { table: 'curve', op: 'delete' };
    case 'UPDATE_SETTINGS':
      return { table: 'setting', op: 'update' };
    default:
      return null;
  }
}

export const useOfflineQueueStore = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine ?? true : true,
      syncing: false,

      enqueue: (op) =>
        set((state) => ({
          queue: [...state.queue, op],
        })),

      dequeue: (id) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      updateRetry: (id) =>
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
          ),
        })),

      processQueue: async () => {
        const { queue, isOnline } = get();
        if (!isOnline || queue.length === 0) return;

        const accessToken = localStorage.getItem('mobrew_access_token');
        if (!accessToken) return;

        const ready = queue.filter((op) => op.retryCount < MAX_RETRIES);
        if (ready.length === 0) return;

        const operations = ready
          .map((op) => {
            const mapped = mapOfflineOp(op.type);
            if (!mapped) return null;
            const payload = op.payload as Record<string, unknown>;
            return {
              id: op.id,
              table: mapped.table,
              op: mapped.op,
              data: payload.action === 'update' || payload.action === 'delete'
                ? (payload.payload as Record<string, unknown>) ?? {}
                : payload,
            };
          })
          .filter(Boolean) as Array<{ id: string; table: ServerTable; op: ServerOp; data: Record<string, unknown> }>;

        if (operations.length === 0) return;

        set({ syncing: true });
        try {
          const res = await apiClient.post('/sync/batch', { operations });
          const results: Array<{ ok: boolean; id?: string }> = res.data?.results ?? [];
          const succeeded = new Set<string>();
          const failed = new Set<string>();
          results.forEach((r, idx) => {
            const opId = operations[idx]?.id;
            if (!opId) return;
            if (r.ok) succeeded.add(opId);
            else failed.add(opId);
          });

          set((state) => ({
            queue: state.queue
              .filter((op) => !succeeded.has(op.id))
              .map((op) =>
                failed.has(op.id) ? { ...op, retryCount: op.retryCount + 1 } : op
              ),
          }));
        } catch {
          set((state) => ({
            queue: state.queue.map((op) =>
              op.retryCount < MAX_RETRIES
                ? { ...op, retryCount: op.retryCount + 1 }
                : op
            ),
          }));
        } finally {
          set({ syncing: false });
        }
      },

      setOnline: (value) => {
        set({ isOnline: value });
        if (value) {
          setTimeout(() => get().processQueue(), BACKOFF_MS);
        }
      },
    }),
    {
      name: 'mobrew_offline_queue',
      partialize: (state) => ({
        queue: state.queue,
        isOnline: state.isOnline,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineQueueStore.getState().setOnline(true);
  });

  window.addEventListener('offline', () => {
    useOfflineQueueStore.getState().setOnline(false);
  });
}
