import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { formatDate, formatTime, formatDuration, normalizeWorkoutName } from '@/utils/formatters'
import { Calendar, Clock, CheckCircle, Dumbbell } from 'lucide-react'
import { supabase } from '@/services/supabase'

interface SetWithExercise {
  id: string
  set_number: number
  reps_completed: number | null
  weight_used: number | null
  completed: boolean
  plan_exercise: {
    id: string
    name: string
    sets: number | null
    reps_min: number | null
    reps_max: number | null
    reps_unit: string | null
    section: {
      name: string
      sort_order: number
    }
  }
}

interface SessionDetail {
  id: string
  started_at: string
  completed_at: string | null
  notes: string | null
  workout_day: {
    id: string
    name: string
  } | null
}

async function getSessionDetail(sessionId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_day:workout_days(id, name)
    `)
    .eq('id', sessionId)
    .single()

  if (sessionError) throw sessionError

  const { data: sets, error: setsError } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      plan_exercise:plan_exercises(
        id,
        name,
        sets,
        reps_min,
        reps_max,
        reps_unit,
        section:exercise_sections(name, sort_order)
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at')

  if (setsError) throw setsError

  return {
    session: session as SessionDetail,
    sets: sets as SetWithExercise[]
  }
}

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => getSessionDetail(sessionId!),
    enabled: !!sessionId
  })

  // Group sets by exercise
  const exerciseGroups = data?.sets.reduce((acc, set) => {
    const exerciseId = set.plan_exercise.id
    if (!acc[exerciseId]) {
      acc[exerciseId] = {
        exercise: set.plan_exercise,
        sets: []
      }
    }
    acc[exerciseId].sets.push(set)
    return acc
  }, {} as Record<string, { exercise: SetWithExercise['plan_exercise']; sets: SetWithExercise[] }>)

  // Sort by section order
  const sortedExercises = exerciseGroups
    ? Object.values(exerciseGroups).sort(
        (a, b) => a.exercise.section.sort_order - b.exercise.section.sort_order
      )
    : []

  // Group by section
  const sections = sortedExercises.reduce((acc, item) => {
    const sectionName = item.exercise.section.name
    if (!acc[sectionName]) {
      acc[sectionName] = []
    }
    acc[sectionName].push(item)
    return acc
  }, {} as Record<string, typeof sortedExercises>)

  // Calculate workout duration
  const getDuration = () => {
    if (!data?.session.started_at || !data?.session.completed_at) return null
    const start = new Date(data.session.started_at).getTime()
    const end = new Date(data.session.completed_at).getTime()
    const seconds = Math.floor((end - start) / 1000)
    return formatDuration(seconds)
  }

  return (
    <AppShell
      title={normalizeWorkoutName(data?.session.workout_day?.name || 'Workout Details')}
      showBack
    >
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Session Info */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(data.session.started_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatTime(data.session.started_at)}
                  </span>
                </div>
                {getDuration() && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    Duration: {getDuration()}
                  </p>
                )}
                {data.session.completed_at && (
                  <div className="flex items-center gap-1.5 mt-2 text-[var(--color-success)] text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}
                {data.session.notes && (
                  <p className="mt-3 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] p-2 rounded-lg">
                    {data.session.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Exercises by Section */}
            {Object.entries(sections).map(([sectionName, exercises]) => (
              <div key={sectionName} className="space-y-3">
                <h3 className="font-semibold text-[var(--color-text-muted)] text-sm uppercase tracking-wide">
                  {sectionName}
                </h3>
                {exercises.map(({ exercise, sets }) => (
                  <Card key={exercise.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[var(--color-text)]">{exercise.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {sets.map((set) => (
                              <div
                                key={set.id}
                                className="text-xs bg-[var(--color-surface-hover)] px-2 py-1 rounded-lg"
                              >
                                <span className="font-medium text-[var(--color-text)]">Set {set.set_number}</span>
                                {set.reps_completed && (
                                  <span className="text-[var(--color-text-muted)]">
                                    : {set.reps_completed} {exercise.reps_unit || 'reps'}
                                  </span>
                                )}
                                {set.weight_used && (
                                  <span className="text-[var(--color-text-muted)]">
                                    {' '}@ {set.weight_used} lbs
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}

            {sortedExercises.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-[var(--color-text-muted)]">No exercises logged for this session.</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[var(--color-text-muted)]">Session not found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
