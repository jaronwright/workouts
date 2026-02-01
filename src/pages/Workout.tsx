import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { ExerciseCard, RestTimer } from '@/components/workout'
import { useWorkoutDay } from '@/hooks/useWorkoutPlan'
import { useStartWorkout, useCompleteWorkout, useLogSet, useSessionSets } from '@/hooks/useWorkoutSession'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'

export function WorkoutPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: workoutDay, isLoading } = useWorkoutDay(dayId)
  const { mutate: startWorkout, isPending: isStarting } = useStartWorkout()
  const { mutate: completeWorkout, isPending: isCompleting } = useCompleteWorkout()
  const { mutate: logSet } = useLogSet()

  const {
    activeSession,
    setActiveSession,
    setActiveWorkoutDay,
    completedSets
  } = useWorkoutStore()

  const { data: sessionSets } = useSessionSets(activeSession?.id)

  useEffect(() => {
    if (workoutDay) {
      setActiveWorkoutDay(workoutDay)
    }
  }, [workoutDay, setActiveWorkoutDay])

  useEffect(() => {
    if (sessionSets) {
      sessionSets.forEach((set) => {
        const current = completedSets.get(set.plan_exercise_id) || []
        if (!current.find((s) => s.id === set.id)) {
          useWorkoutStore.getState().addCompletedSet(set.plan_exercise_id, set)
        }
      })
    }
  }, [sessionSets])

  const handleStart = () => {
    if (!dayId || !user) return
    startWorkout(dayId, {
      onSuccess: (session) => {
        setActiveSession(session)
      }
    })
  }

  const handleComplete = () => {
    if (!activeSession) return
    completeWorkout(
      { sessionId: activeSession.id },
      {
        onSuccess: () => {
          navigate('/')
        }
      }
    )
  }

  const handleExerciseComplete = (exerciseId: string, reps: number | null, weight: number | null) => {
    if (!activeSession) return
    // Log a single set to mark the exercise as complete
    logSet({
      sessionId: activeSession.id,
      planExerciseId: exerciseId,
      setNumber: 1,
      repsCompleted: reps,
      weightUsed: weight
    })
  }

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </AppShell>
    )
  }

  if (!workoutDay) {
    return (
      <AppShell title="Not Found" showBack>
        <div className="p-4 text-center text-gray-500">
          Workout day not found
        </div>
      </AppShell>
    )
  }

  if (!activeSession) {
    return (
      <AppShell title={workoutDay.name} showBack>
        <div className="p-4 space-y-6">
          <Card>
            <CardContent className="py-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {workoutDay.name}
              </h2>
              <p className="text-gray-500 mb-6">
                {workoutDay.sections.reduce(
                  (acc, s) => acc + s.exercises.length,
                  0
                )}{' '}
                exercises
              </p>
              <Button onClick={handleStart} loading={isStarting} size="lg">
                Start Workout
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {workoutDay.sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                  {section.name}
                  {section.duration_minutes && ` (${section.duration_minutes} min)`}
                </h3>
                <div className="space-y-2">
                  {section.exercises.map((exercise) => (
                    <Card key={exercise.id}>
                      <CardContent className="py-3">
                        <p className="font-medium text-gray-900">{exercise.name}</p>
                        <p className="text-sm text-gray-500">
                          {exercise.sets && `${exercise.sets} sets`}
                          {exercise.reps_min && ` × ${exercise.reps_min}${exercise.reps_max && exercise.reps_max !== exercise.reps_min ? `-${exercise.reps_max}` : ''} ${exercise.reps_unit || 'reps'}`}
                          {exercise.is_per_side && '/side'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title={workoutDay.name} showBack hideNav>
      <div className="p-4 space-y-4">
        <RestTimer />

        {workoutDay.sections.map((section) => (
          <div key={section.id}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              {section.name}
            </h3>
            <div className="space-y-3">
              {section.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  completedSets={completedSets.get(exercise.id) || []}
                  onExerciseComplete={(reps, weight) =>
                    handleExerciseComplete(exercise.id, reps, weight)
                  }
                />
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 pb-8">
          <Button
            onClick={handleComplete}
            loading={isCompleting}
            className="w-full"
            size="lg"
          >
            Complete Workout
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
