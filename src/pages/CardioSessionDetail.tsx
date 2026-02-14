import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/layout'
import { Modal, Button } from '@/components/ui'
import { FadeIn, PressableButton } from '@/components/motion'
import { ReviewSummaryCard } from '@/components/review/ReviewSummaryCard'
import { supabase } from '@/services/supabase'
import { formatDate, formatTime, formatDuration } from '@/utils/formatters'
import { Clock, MapPin, Timer, CheckCircle, Circle, Trash2, Share2, Zap, Activity, StickyNote, Camera } from 'lucide-react'
import { WorkoutPhotos } from '@/components/social/WorkoutPhotos'
import { useShare } from '@/hooks/useShare'
import { useTemplateSessionReview } from '@/hooks/useReview'
import { formatCardioShareText } from '@/utils/shareFormatters'
import { getCardioStyle, getMobilityStyle } from '@/config/workoutConfig'
import { useState } from 'react'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

async function getTemplateSession(sessionId: string): Promise<TemplateWorkoutSession | null> {
  const { data, error } = await supabase
    .from('template_workout_sessions')
    .select(`
      *,
      template:workout_templates(*)
    `)
    .eq('id', sessionId)
    .maybeSingle()

  if (error) {
    console.warn('Error fetching template session:', error.message)
    return null
  }
  return data as TemplateWorkoutSession | null
}

async function deleteTemplateSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('template_workout_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw error
}

export function CardioSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: session, isLoading } = useQuery({
    queryKey: ['cardio-session', sessionId],
    queryFn: () => getTemplateSession(sessionId!),
    enabled: !!sessionId
  })

  const { share } = useShare()

  // Fetch review for this template session
  const { data: review } = useTemplateSessionReview(sessionId)

  const { mutate: deleteSession, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteTemplateSession(sessionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
      navigate('/history')
    }
  })

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
          <div className="h-32 skeleton rounded-[var(--radius-xl)]" />
          <div className="h-20 skeleton rounded-[var(--radius-xl)]" />
        </div>
      </AppShell>
    )
  }

  if (!session) {
    return (
      <AppShell title="Workout" showBack>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[var(--color-text-muted)]">Session not found.</p>
        </div>
      </AppShell>
    )
  }

  const durationMinutes = session.duration_minutes ||
    (session.completed_at && session.started_at
      ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
      : null)

  // Get workout style for theming
  const templateType = session.template?.type || 'cardio'
  const category = session.template?.category
  const workoutStyle = templateType === 'mobility'
    ? (category ? getMobilityStyle(category) : null)
    : (category ? getCardioStyle(category) : null)
  const accentColor = workoutStyle?.color || 'var(--color-cardio)'
  const WorkoutIcon = workoutStyle?.icon || (templateType === 'mobility' ? Activity : Zap)

  return (
    <AppShell title={session.template?.name || 'Workout'} showBack>
      <div className="pb-[var(--space-8)]">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${accentColor}15 0%, transparent 100%)`
            }}
          />
          <FadeIn direction="up" className="relative px-[var(--space-6)] pt-[var(--space-4)] pb-[var(--space-6)] flex flex-col items-center text-center">
            {/* Workout icon */}
            <div
              className="w-16 h-16 rounded-[var(--radius-xl)] flex items-center justify-center mb-[var(--space-3)]"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <WorkoutIcon className="w-8 h-8" style={{ color: accentColor }} />
            </div>

            {/* Workout type subtitle */}
            {session.template && (
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                {session.template.type} workout
              </p>
            )}

            {/* Date & time */}
            <p className="text-sm text-[var(--color-text-muted)]">
              {formatDate(session.started_at)} · {formatTime(session.started_at)}
            </p>

            {/* Status */}
            <div className={`flex items-center gap-1.5 mt-[var(--space-2)] text-sm font-medium ${
              session.completed_at ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
            }`}>
              {session.completed_at ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  In Progress
                </>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Metrics Row */}
        <div className="flex justify-around px-[var(--space-4)] -mt-1 mb-[var(--space-4)]">
          {durationMinutes && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-1.5" style={{ background: 'var(--color-info-muted)' }}>
                <Timer className="w-5 h-5 text-[var(--color-info)]" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">
                {formatDuration(durationMinutes * 60)}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Duration</span>
            </div>
          )}
          {session.distance_value && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-1.5" style={{ background: 'var(--color-success-muted)' }}>
                <MapPin className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">
                {session.distance_value} {session.distance_unit || 'mi'}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Distance</span>
            </div>
          )}
          {durationMinutes && session.distance_value && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-1.5" style={{ background: 'var(--color-tertiary-muted)' }}>
                <Clock className="w-5 h-5 text-[var(--color-tertiary)]" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">
                {(durationMinutes / session.distance_value).toFixed(1)}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Min/Mile</span>
            </div>
          )}
        </div>

        {/* Description */}
        {session.template?.description && (
          <div className="px-[var(--space-4)] mb-[var(--space-4)]">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-[var(--space-4)]">
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {session.template.description}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="px-[var(--space-4)] mb-[var(--space-4)]">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-[var(--space-4)]">
              <div className="flex items-start gap-[var(--space-3)]">
                <StickyNote className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{session.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Workout Review */}
        {review && (
          <div className="px-[var(--space-4)] mb-[var(--space-4)]">
            <ReviewSummaryCard review={review} />
          </div>
        )}

        {/* Photos */}
        {session.completed_at && (
          <div className="px-[var(--space-4)] mb-[var(--space-4)]">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-[var(--space-2)] px-1 flex items-center gap-1.5">
              <Camera className="w-3 h-3" />
              Photos
            </h3>
            <WorkoutPhotos templateSessionId={sessionId} />
          </div>
        )}

        {/* Action buttons */}
        <div className="px-[var(--space-4)] space-y-[var(--space-2)] mt-[var(--space-6)]">
          <PressableButton
            onClick={() =>
              share({
                title: session.template?.name || 'Workout',
                text: formatCardioShareText({
                  workoutName: session.template?.name || 'Workout',
                  date: session.started_at,
                  durationMinutes: durationMinutes,
                  distanceValue: session.distance_value,
                  distanceUnit: session.distance_unit
                })
              })
            }
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--color-primary)] rounded-[var(--radius-xl)]"
            style={{ background: 'var(--color-primary-muted)' } as React.CSSProperties}
          >
            <Share2 className="w-4 h-4" />
            Share Workout
          </PressableButton>

          <PressableButton
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--color-danger)] rounded-[var(--radius-xl)]"
            style={{ background: 'var(--color-danger-muted)' } as React.CSSProperties}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Workout'}
          </PressableButton>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Workout"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-muted)]">
            Are you sure you want to delete this workout?
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {session.template?.name} - {formatDate(session.started_at)}
          </p>
          <p className="text-sm text-[var(--color-danger)]">
            This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteSession()}
              loading={isDeleting}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
