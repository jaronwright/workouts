import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Card, CardContent, Modal, Button } from '@/components/ui'
import { useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { formatDate, formatTime, formatRelativeTime } from '@/utils/formatters'
import { Calendar, Clock, CheckCircle, Circle, ChevronRight, Trash2 } from 'lucide-react'
import type { SessionWithDay } from '@/services/workoutService'

interface SwipeableCardProps {
  session: SessionWithDay
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
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
        <button
          onClick={onDelete}
          className="w-full h-full flex items-center justify-center"
        >
          <Trash2 className="w-6 h-6 text-white" />
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
                    ? 'bg-green-100'
                    : 'bg-yellow-100'
                }`}
              >
                {session.completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {session.workout_day?.name || 'Workout'}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.started_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(session.started_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(session.started_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {session.completed_at ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    In Progress
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {session.notes && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
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
  const { data: sessions, isLoading } = useUserSessions()
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession()
  const [sessionToDelete, setSessionToDelete] = useState<SessionWithDay | null>(null)

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id, {
        onSuccess: () => {
          setSessionToDelete(null)
        }
      })
    }
  }

  return (
    <AppShell title="History">
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : sessions?.length ? (
          <>
            <p className="text-sm text-gray-500 mb-3">Swipe left to delete</p>
            <div className="space-y-3">
              {(sessions as SessionWithDay[]).map((session) => (
                <SwipeableCard
                  key={session.id}
                  session={session}
                  onDelete={() => setSessionToDelete(session)}
                  onClick={() => navigate(`/history/${session.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No workout history</h3>
              <p className="text-gray-500">Start your first workout to see it here!</p>
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
          <p className="text-gray-600">
            Are you sure you want to delete this workout session?
          </p>
          <p className="text-sm font-medium text-gray-900">
            {sessionToDelete?.workout_day?.name || 'Workout'} - {sessionToDelete && formatDate(sessionToDelete.started_at)}
          </p>
          <p className="text-sm text-red-600">
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
