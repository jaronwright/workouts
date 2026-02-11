import { useOfflineStore, type QueuedMutation } from '@/stores/offlineStore'
import { getIsOnline } from '@/hooks/useOnlineStatus'
import { isNetworkError } from '@/utils/offlineUtils'
import {
  startWorkoutSession,
  completeWorkoutSession,
  logExerciseSet,
  deleteExerciseSet,
  updateExerciseSet,
  getSessionSets,
} from '@/services/workoutService'
import {
  startTemplateWorkout,
  completeTemplateWorkout,
  quickLogTemplateWorkout,
} from '@/services/templateWorkoutService'

export interface SyncResult {
  synced: number
  failed: number
  interrupted: boolean
}

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 15000]

/**
 * Process the offline mutation queue in FIFO order.
 * Stops on network error. Retries individual mutations up to 3 times.
 */
export async function processQueue(): Promise<SyncResult> {
  const store = useOfflineStore.getState()

  if (store.isSyncing) {
    return { synced: 0, failed: 0, interrupted: false }
  }

  store.setIsSyncing(true)

  let synced = 0
  let failed = 0
  let interrupted = false

  // Get pending mutations sorted by creation time (FIFO)
  const pending = [...store.queue]
    .filter((m) => m.status === 'pending' || m.status === 'failed')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // Track session IDs that failed (dependent mutations should skip)
  const failedSessionIds = new Set<string>()

  for (const mutation of pending) {
    if (!getIsOnline()) {
      interrupted = true
      break
    }

    // Skip mutations that depend on a failed session
    const depSessionId = getDependentSessionId(mutation)
    if (depSessionId && failedSessionIds.has(depSessionId)) {
      continue
    }

    store.updateStatus(mutation.id, 'syncing')

    try {
      await executeMutation(mutation)
      // Remove from queue on success
      useOfflineStore.getState().dequeue(mutation.id)
      synced++
    } catch (err) {
      if (isNetworkError(err)) {
        // Network error mid-sync — stop processing
        store.updateStatus(mutation.id, 'pending')
        interrupted = true
        break
      }

      // Business error — retry with backoff
      const currentStore = useOfflineStore.getState()
      const current = currentStore.queue.find((m) => m.id === mutation.id)
      const retryCount = (current?.retryCount ?? 0) + 1

      if (retryCount >= MAX_RETRIES) {
        currentStore.updateStatus(
          mutation.id,
          'failed',
          err instanceof Error ? err.message : 'Unknown error'
        )
        failed++
        // Track if this was a session-creating mutation
        if (mutation.type === 'start-session' || mutation.type === 'start-template') {
          failedSessionIds.add(mutation.clientId)
        }
      } else {
        currentStore.incrementRetry(mutation.id)
        currentStore.updateStatus(mutation.id, 'pending')
        // Wait before continuing to next mutation
        await sleep(RETRY_DELAYS[retryCount - 1] ?? 1000)
      }
    }
  }

  useOfflineStore.getState().setIsSyncing(false)
  return { synced, failed, interrupted }
}

/**
 * Execute a single queued mutation against the server.
 * Handles ID resolution (client ID → server ID) before each call.
 */
async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const store = useOfflineStore.getState()
  const { type, payload, clientId } = mutation

  switch (type) {
    case 'start-session': {
      const result = await startWorkoutSession(
        payload.userId as string,
        payload.workoutDayId as string,
      )
      // Map the client-generated session ID to the real server ID
      store.addIdMapping(clientId, result.id)
      break
    }

    case 'complete-session': {
      const resolvedSessionId = store.resolveId(payload.sessionId as string)
      await completeWorkoutSession(resolvedSessionId, payload.notes as string | undefined)
      break
    }

    case 'log-set': {
      const resolvedSessionId = store.resolveId(payload.sessionId as string)

      // Dedup check: don't insert if a matching set already exists
      const existingSets = await getSessionSets(resolvedSessionId)
      const alreadyExists = existingSets.some(
        (s) =>
          s.plan_exercise_id === (payload.planExerciseId as string) &&
          s.set_number === (payload.setNumber as number)
      )
      if (alreadyExists) break

      const result = await logExerciseSet(
        resolvedSessionId,
        payload.planExerciseId as string,
        payload.setNumber as number,
        payload.repsCompleted as number | null,
        payload.weightUsed as number | null,
      )
      store.addIdMapping(clientId, result.id)
      break
    }

    case 'delete-set': {
      const resolvedSetId = store.resolveId(payload.setId as string)
      await deleteExerciseSet(resolvedSetId)
      break
    }

    case 'update-set': {
      const resolvedSetId = store.resolveId(payload.setId as string)
      await updateExerciseSet(resolvedSetId, payload.updates as {
        reps_completed?: number | null
        weight_used?: number | null
        completed?: boolean
      })
      break
    }

    case 'start-template': {
      const result = await startTemplateWorkout(
        payload.userId as string,
        payload.templateId as string,
      )
      store.addIdMapping(clientId, result.id)
      break
    }

    case 'complete-template': {
      const resolvedSessionId = store.resolveId(payload.sessionId as string)
      await completeTemplateWorkout(resolvedSessionId, {
        durationMinutes: payload.durationMinutes as number | undefined,
        distanceValue: payload.distanceValue as number | undefined,
        distanceUnit: payload.distanceUnit as string | undefined,
        notes: payload.notes as string | undefined,
      })
      break
    }

    case 'quick-log-template': {
      const result = await quickLogTemplateWorkout(
        payload.userId as string,
        payload.templateId as string,
        {
          durationMinutes: payload.durationMinutes as number | undefined,
          distanceValue: payload.distanceValue as number | undefined,
          distanceUnit: payload.distanceUnit as string | undefined,
        },
      )
      store.addIdMapping(clientId, result.id)
      break
    }
  }
}

/**
 * Get the session client ID this mutation depends on (if any).
 * Used to skip dependent mutations when a session creation fails.
 */
function getDependentSessionId(mutation: QueuedMutation): string | null {
  if (mutation.type === 'log-set' || mutation.type === 'complete-session') {
    return mutation.payload.sessionId as string
  }
  if (mutation.type === 'complete-template') {
    return mutation.payload.sessionId as string
  }
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
