import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MutationType =
  | 'log-set'
  | 'delete-set'
  | 'update-set'
  | 'start-session'
  | 'complete-session'
  | 'start-template'
  | 'complete-template'
  | 'quick-log-template'

export interface QueuedMutation {
  id: string
  type: MutationType
  payload: Record<string, unknown>
  clientId: string
  createdAt: string
  status: 'pending' | 'syncing' | 'failed'
  retryCount: number
  error?: string
}

interface OfflineState {
  queue: QueuedMutation[]
  idMap: Record<string, string>
  isSyncing: boolean

  enqueue: (mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'status' | 'retryCount'>) => void
  dequeue: (id: string) => void
  dequeueByClientId: (clientId: string) => void
  updateStatus: (id: string, status: QueuedMutation['status'], error?: string) => void
  incrementRetry: (id: string) => void
  addIdMapping: (clientId: string, serverId: string) => void
  resolveId: (id: string) => string
  setIsSyncing: (syncing: boolean) => void
  clearCompleted: () => void
  getPendingCount: () => number
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      queue: [],
      idMap: {},
      isSyncing: false,

      enqueue: (mutation) => {
        const entry: QueuedMutation = {
          ...mutation,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'pending',
          retryCount: 0,
        }
        set((state) => ({ queue: [...state.queue, entry] }))
      },

      dequeue: (id) => {
        set((state) => ({ queue: state.queue.filter((m) => m.id !== id) }))
      },

      dequeueByClientId: (clientId) => {
        set((state) => ({ queue: state.queue.filter((m) => m.clientId !== clientId) }))
      },

      updateStatus: (id, status, error) => {
        set((state) => ({
          queue: state.queue.map((m) =>
            m.id === id ? { ...m, status, error } : m
          ),
        }))
      },

      incrementRetry: (id) => {
        set((state) => ({
          queue: state.queue.map((m) =>
            m.id === id ? { ...m, retryCount: m.retryCount + 1 } : m
          ),
        }))
      },

      addIdMapping: (clientId, serverId) => {
        set((state) => ({ idMap: { ...state.idMap, [clientId]: serverId } }))
      },

      resolveId: (id) => {
        return get().idMap[id] ?? id
      },

      setIsSyncing: (syncing) => set({ isSyncing: syncing }),

      clearCompleted: () => {
        set((state) => ({
          queue: state.queue.filter((m) => m.status !== 'pending' || m.retryCount > 0),
        }))
      },

      getPendingCount: () => {
        return get().queue.filter((m) => m.status === 'pending' || m.status === 'syncing').length
      },
    }),
    {
      name: 'workout-offline-queue',
      partialize: (state) => ({
        queue: state.queue,
        idMap: state.idMap,
        // Exclude isSyncing — it's transient
      }),
    }
  )
)
