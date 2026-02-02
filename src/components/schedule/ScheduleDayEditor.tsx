/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { Modal, Button } from '@/components/ui'
import { useWorkoutTemplates, useSaveScheduleDayWorkouts } from '@/hooks/useSchedule'
import { useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { type ScheduleDay, type ScheduleWorkoutItem } from '@/services/scheduleService'
import { Moon, Plus, X, Trash2 } from 'lucide-react'
import {
  WEIGHTS_CONFIG,
  getCardioStyle,
  getMobilityStyle,
  CATEGORY_DEFAULTS
} from '@/config/workoutConfig'

interface ScheduleDayEditorProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
  currentSchedules?: ScheduleDay[]
}

interface SelectedWorkout {
  type: 'rest' | 'weights' | 'cardio' | 'mobility'
  id?: string // workout_day_id or template_id
  label?: string
  category?: string | null // For getting correct style
  dayNumber?: number // For weights workouts
}

// Helper to get the weights style key from day name
function getWeightsKey(name: string): keyof typeof WEIGHTS_CONFIG {
  const lower = name.toLowerCase()
  if (lower.includes('push')) return 'push'
  if (lower.includes('pull')) return 'pull'
  if (lower.includes('leg')) return 'legs'
  return 'push' // default
}

export function ScheduleDayEditor({
  isOpen,
  onClose,
  dayNumber,
  currentSchedules = []
}: ScheduleDayEditorProps) {
  const { data: templates } = useWorkoutTemplates()
  const { data: workoutDays } = useWorkoutDays()
  const { mutate: saveWorkouts, isPending } = useSaveScheduleDayWorkouts()

  const [selectedWorkouts, setSelectedWorkouts] = useState<SelectedWorkout[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize from current schedules
  useEffect(() => {
    if (isOpen) {
      if (currentSchedules.length > 0) {
        const workouts: SelectedWorkout[] = currentSchedules.map(s => {
          if (s.is_rest_day) {
            return { type: 'rest' as const }
          }
          if (s.workout_day_id && s.workout_day) {
            return {
              type: 'weights' as const,
              id: s.workout_day_id,
              label: s.workout_day.name,
              dayNumber: s.workout_day.day_number
            }
          }
          if (s.template_id && s.template) {
            return {
              type: s.template.type as 'cardio' | 'mobility',
              id: s.template_id,
              label: s.template.name,
              category: s.template.category
            }
          }
          return { type: 'rest' as const }
        })
        setSelectedWorkouts(workouts)
      } else {
        setSelectedWorkouts([])
      }
      setShowAddMenu(false)
      setError(null)
    }
  }, [isOpen, currentSchedules])

  const cardioTemplates = templates?.filter(t => t.type === 'cardio') || []
  const mobilityTemplates = templates?.filter(t => t.type === 'mobility') || []

  const addWorkout = (workout: SelectedWorkout) => {
    if (workout.type === 'rest') {
      setSelectedWorkouts([{ type: 'rest' }])
    } else {
      setSelectedWorkouts(prev => {
        const filtered = prev.filter(w => w.type !== 'rest')
        return [...filtered, workout]
      })
    }
    setShowAddMenu(false)
  }

  const removeWorkout = (index: number) => {
    setSelectedWorkouts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = useCallback(() => {
    setError(null)
    const workouts: ScheduleWorkoutItem[] = selectedWorkouts.map(w => ({
      type: w.type,
      id: w.id
    }))

    saveWorkouts(
      { dayNumber, workouts },
      {
        onSuccess: () => {
          onClose()
        },
        onError: (err) => {
          console.error('Schedule save failed:', err)
          setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
        }
      }
    )
  }, [dayNumber, selectedWorkouts, saveWorkouts, onClose])

  const isRestDay = selectedWorkouts.length === 1 && selectedWorkouts[0]?.type === 'rest'

  // Get style for a workout
  const getWorkoutStyle = (workout: SelectedWorkout) => {
    if (workout.type === 'weights') {
      const key = getWeightsKey(workout.label || '')
      return WEIGHTS_CONFIG[key]
    }
    if (workout.type === 'cardio') {
      return getCardioStyle(workout.category || null)
    }
    if (workout.type === 'mobility') {
      return getMobilityStyle(workout.category || null)
    }
    return CATEGORY_DEFAULTS.weights
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Day ${dayNumber}`}
    >
      <div className="space-y-4">
        {/* Selected Workouts */}
        <div className="space-y-2">
          {selectedWorkouts.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              <p className="text-sm">No workouts scheduled</p>
            </div>
          ) : isRestDay ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-gray-500" />
                </div>
                <span className="font-medium text-[var(--color-text)]">Rest Day</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedWorkouts([]) }}
                className="p-2 rounded-full hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            selectedWorkouts.map((workout, index) => {
              const style = getWorkoutStyle(workout)
              const Icon = style.icon

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: style.bgColor }}
                    >
                      <Icon className="w-5 h-5" style={{ color: style.color }} />
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text)]">{workout.label}</span>
                      <p className="text-xs capitalize" style={{ color: style.color }}>{workout.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeWorkout(index) }}
                    className="p-2 rounded-full hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Add Workout Button / Menu */}
        {!isRestDay && (
          <div className="relative">
            {showAddMenu ? (
              <div className="space-y-2 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--color-text)]">Choose Workout</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowAddMenu(false) }}
                    className="p-1 rounded-full hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rest Day Option */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); addWorkout({ type: 'rest' }) }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] text-left"
                >
                  <Moon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Rest Day</span>
                </button>

                {/* Weights */}
                {workoutDays && workoutDays.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1 px-2">Weights</p>
                    {workoutDays.map(day => {
                      const key = getWeightsKey(day.name)
                      const style = WEIGHTS_CONFIG[key]
                      const Icon = style.icon
                      return (
                        <button
                          type="button"
                          key={day.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            addWorkout({
                              type: 'weights',
                              id: day.id,
                              label: day.name,
                              dayNumber: day.day_number
                            })
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] text-left"
                        >
                          <Icon className="w-5 h-5" style={{ color: style.color }} />
                          <span className="text-sm">{day.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Cardio */}
                {cardioTemplates.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1 px-2">Cardio</p>
                    {cardioTemplates.map(t => {
                      const style = getCardioStyle(t.category)
                      const Icon = style.icon
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            addWorkout({
                              type: 'cardio',
                              id: t.id,
                              label: t.name,
                              category: t.category
                            })
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] text-left"
                        >
                          <Icon className="w-5 h-5" style={{ color: style.color }} />
                          <span className="text-sm">{t.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Mobility */}
                {mobilityTemplates.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1 px-2">Mobility</p>
                    {mobilityTemplates.map(t => {
                      const style = getMobilityStyle(t.category)
                      const Icon = style.icon
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            addWorkout({
                              type: 'mobility',
                              id: t.id,
                              label: t.name,
                              category: t.category
                            })
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] text-left"
                        >
                          <Icon className="w-5 h-5" style={{ color: style.color }} />
                          <span className="text-sm">{t.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowAddMenu(true) }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Choose Workout</span>
              </button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isPending} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
