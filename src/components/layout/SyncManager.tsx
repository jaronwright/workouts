import { useSyncEngine } from '@/hooks/useSyncEngine'

/** Renderless component that mounts the sync engine. */
export function SyncManager() {
  useSyncEngine()
  return null
}
