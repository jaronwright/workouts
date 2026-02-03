import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { supabase } from '@/services/supabase'
import { formatDate, formatTime, formatDuration } from '@/utils/formatters'
import { Calendar, Clock, MapPin, Timer, CheckCircle, Circle, Trash2 } from 'lucide-react'
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

  const { data: session, isLoading } = useQuery({
    queryKey: ['cardio-session', sessionId],
    queryFn: () => getTemplateSession(sessionId!),
    enabled: !!sessionId
  })

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
        <div className="p-4 space-y-4">
          <div className="h-32 bg-[var(--color-surface-hover)] animate-pulse rounded-xl" />
        </div>
      </AppShell>
    )
  }

  if (!session) {
    return (
      <AppShell title="Workout" showBack>
        <div className="p-4">
          <p className="text-[var(--color-text-muted)]">Session not found.</p>
        </div>
      </AppShell>
    )
  }

  const durationMinutes = session.duration_minutes ||
    (session.completed_at && session.started_at
      ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
      : null)

  return (
    <AppShell title={session.template?.name || 'Workout'} showBack>
      <div className="p-4 space-y-4">
        {/* Session Info Card */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(session.started_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(session.started_at)}
                </span>
              </div>

              {durationMinutes && (
                <p className="text-[var(--color-text-muted)]">
                  <Timer className="w-4 h-4 inline mr-1" />
                  Duration: {formatDuration(durationMinutes * 60)}
                </p>
              )}

              {session.distance_value && (
                <p className="text-[var(--color-text-muted)]">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Distance: {session.distance_value} {session.distance_unit || 'miles'}
                </p>
              )}

              <div className={`flex items-center gap-2 ${session.completed_at ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
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

              {session.notes && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <p className="text-sm font-medium text-[var(--color-text)] mb-1">Notes</p>
                  <p className="text-[var(--color-text-muted)]">{session.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Type Info */}
        {session.template && (
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold text-[var(--color-text)] mb-2">
                {session.template.name}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] capitalize">
                {session.template.type} workout
              </p>
              {session.template.description && (
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  {session.template.description}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this workout?')) {
              deleteSession()
            }
          }}
          disabled={isDeleting}
          className="w-full flex items-center justify-center gap-2 py-3 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-xl transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          {isDeleting ? 'Deleting...' : 'Delete Workout'}
        </button>
      </div>
    </AppShell>
  )
}
