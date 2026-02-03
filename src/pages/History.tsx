import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Card, CardContent, Modal, Button } from '@/components/ui'
import { useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { formatDate, formatTime, formatRelativeTime } from '@/utils/formatters'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import { Calendar, Clock, CheckCircle, Circle, ChevronRight, Trash2 } from 'lucide-react'
import type { SessionWithDay } from '@/services/workoutService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

// Unified session type for display
interface UnifiedSession {
  id: string
  type: 'weights' | 'cardio'
  name: string
  started_at: string
  completed_at: string | null
  notes: string | null
  duration_minutes?: number | null
  distance_value?: number | null
  distance_unit?: string | null
  originalSession: SessionWithDay | TemplateWorkoutSession
}

interface SwipeableCardProps {
  session: UnifiedSession
  onDelete: () => void
  onClick: () => void
}

function SwipeableCard({ session, onDelete, onClick }: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current
    // Only allow swiping left
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100))
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (translateX < -50) {
      setTranslateX(-80)
    } else {
      setTranslateX(0)
    }
  }

  const handleClick = () => {
    if (Math.abs(translateX) < 10) {
      onClick()
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button behind */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-[var(--color-danger)] flex items-center justify-center">
        <button
          onClick={onDelete}
          className="w-full h-full flex items-center justify-center"
        >
          <Trash2 className="w-6 h-6 text-[var(--color-text-inverse)]" />
        </button>
      </div>

      {/* Card */}
      <div
        style={{ transform: `translateX(${translateX}px)` }}
        className={`transition-transform ${isDragging ? '' : 'duration-200'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <Card className="cursor-pointer hover:shadow-md">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  session.completed_at
                    ? 'bg-[var(--color-success)]/20'
                    : 'bg-[var(--color-warning)]/20'
                }`}
              >
                {session.completed_at ? (
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                ) : (
                  <Circle className="w-5 h-5 text-[var(--color-warning)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-text)]">
                  {session.name}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.started_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(session.started_at)}
                  </span>
                </div>
                {session.type === 'cardio' && session.distance_value && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {session.distance_value} {session.distance_unit || 'miles'}
                    {session.duration_minutes && ` • ${session.duration_minutes} min`}
                  </p>
                )}
                <p className="text-xs text-[var(--color-text-muted)] opacity-70 mt-1">
                  {formatRelativeTime(session.started_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {session.completed_at ? (
                  <span className="text-xs bg-[var(--color-success)]/20 text-[var(--color-success)] px-2 py-1 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="text-xs bg-[var(--color-warning)]/20 text-[var(--color-warning)] px-2 py-1 rounded-full">
                    In Progress
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
              </div>
            </div>
            {session.notes && (
              <p className="mt-3 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] p-2 rounded-lg">
                {session.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { data: weightsSessions, isLoading: isLoadingWeights } = useUserSessions()
  const { data: templateSessions, isLoading: isLoadingTemplates } = useUserTemplateWorkouts()
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession()
  const [sessionToDelete, setSessionToDelete] = useState<UnifiedSession | null>(null)

  const isLoading = isLoadingWeights || isLoadingTemplates

  // Merge and sort all sessions
  const allSessions = useMemo(() => {
    const unified: UnifiedSession[] = []

    // Add weights sessions
    if (weightsSessions) {
      for (const session of weightsSessions) {
        unified.push({
          id: session.id,
          type: 'weights',
          name: getWorkoutDisplayName(session.workout_day?.name),
          started_at: session.started_at,
          completed_at: session.completed_at,
          notes: session.notes,
          originalSession: session
        })
      }
    }

    // Add template/cardio sessions
    if (templateSessions) {
      for (const session of templateSessions) {
        unified.push({
          id: session.id,
          type: 'cardio',
          name: session.template?.name || 'Workout',
          started_at: session.started_at,
          completed_at: session.completed_at,
          notes: session.notes,
          duration_minutes: session.duration_minutes,
          distance_value: session.distance_value,
          distance_unit: session.distance_unit,
          originalSession: session
        })
      }
    }

    // Sort by date (newest first)
    return unified.sort((a, b) =>
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    )
  }, [weightsSessions, templateSessions])

  const handleDeleteConfirm = () => {
    if (sessionToDelete && sessionToDelete.type === 'weights') {
      deleteSession(sessionToDelete.id, {
        onSuccess: () => {
          setSessionToDelete(null)
        }
      })
    } else {
      // TODO: Add delete for template sessions
      setSessionToDelete(null)
    }
  }

  const handleSessionClick = (session: UnifiedSession) => {
    if (session.type === 'weights') {
      navigate(`/history/${session.id}`)
    } else {
      navigate(`/history/cardio/${session.id}`)
    }
  }

  return (
    <AppShell title="History">
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : allSessions.length > 0 ? (
          <>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">Swipe left to delete</p>
            <div className="space-y-3">
              {allSessions.map((session) => (
                <SwipeableCard
                  key={`${session.type}-${session.id}`}
                  session={session}
                  onDelete={() => setSessionToDelete(session)}
                  onClick={() => handleSessionClick(session)}
                />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-[var(--color-text-muted)] opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No workout history</h3>
              <p className="text-[var(--color-text-muted)]">Start your first workout to see it here!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        title="Delete Workout"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-muted)]">
            Are you sure you want to delete this workout session?
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {sessionToDelete?.name} - {sessionToDelete && formatDate(sessionToDelete.started_at)}
          </p>
          <p className="text-sm text-[var(--color-danger)]">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setSessionToDelete(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
