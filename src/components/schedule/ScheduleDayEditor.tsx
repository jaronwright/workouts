/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'
import { useWorkoutTemplates, useUpsertScheduleDay } from '@/hooks/useSchedule'
import { useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { getDayName, type ScheduleDay, type UpdateScheduleDayData } from '@/services/scheduleService'
import { Dumbbell, Heart, Activity, Moon } from 'lucide-react'

interface ScheduleDayEditorProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
  currentSchedule?: ScheduleDay | null
}

type WorkoutType = 'rest' | 'weights' | 'cardio' | 'mobility'

export function ScheduleDayEditor({
  isOpen,
  onClose,
  dayNumber,
  currentSchedule
}: ScheduleDayEditorProps) {
  const { data: templates } = useWorkoutTemplates()
  const { data: workoutDays } = useWorkoutDays()
  const { mutate: upsertDay, isPending } = useUpsertScheduleDay()

  const [workoutType, setWorkoutType] = useState<WorkoutType>('rest')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedWorkoutDayId, setSelectedWorkoutDayId] = useState<string>('')

  // Initialize form when opening
  useEffect(() => {
    if (isOpen && currentSchedule) {
      if (currentSchedule.is_rest_day) {
        setWorkoutType('rest')
      } else if (currentSchedule.workout_day_id) {
        setWorkoutType('weights')
        setSelectedWorkoutDayId(currentSchedule.workout_day_id)
      } else if (currentSchedule.template_id && currentSchedule.template) {
        setWorkoutType(currentSchedule.template.type)
        setSelectedTemplateId(currentSchedule.template_id)
      }
    } else if (isOpen) {
      setWorkoutType('rest')
      setSelectedTemplateId('')
      setSelectedWorkoutDayId('')
    }
  }, [isOpen, currentSchedule])

  const cardioTemplates = templates?.filter(t => t.type === 'cardio') || []
  const mobilityTemplates = templates?.filter(t => t.type === 'mobility') || []

  // Validate that a workout is selected for non-rest days
  const isValidSelection = () => {
    if (workoutType === 'rest') return true
    if (workoutType === 'weights') return !!selectedWorkoutDayId
    return !!selectedTemplateId // cardio or mobility
  }

  const handleSave = () => {
    if (!isValidSelection()) return

    let data: UpdateScheduleDayData

    if (workoutType === 'rest') {
      data = { is_rest_day: true }
    } else if (workoutType === 'weights') {
      data = { workout_day_id: selectedWorkoutDayId, is_rest_day: false }
    } else {
      data = { template_id: selectedTemplateId, is_rest_day: false }
    }

    upsertDay(
      { dayNumber, data },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  const workoutTypeOptions = [
    { type: 'rest' as WorkoutType, label: 'Rest Day', icon: Moon, color: 'var(--color-text-muted)' },
    { type: 'weights' as WorkoutType, label: 'Weights', icon: Dumbbell, color: 'var(--color-weights)' },
    { type: 'cardio' as WorkoutType, label: 'Cardio', icon: Heart, color: 'var(--color-cardio)' },
    { type: 'mobility' as WorkoutType, label: 'Mobility', icon: Activity, color: 'var(--color-mobility)' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${getDayName(dayNumber)}`}
    >
      <div className="space-y-6">
        {/* Workout Type Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
            Workout Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {workoutTypeOptions.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => setWorkoutType(type)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  workoutType === type
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <Icon className="w-5 h-5" style={{ color }} />
                <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weights Selection */}
        {workoutType === 'weights' && workoutDays && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Select Workout
            </label>
            <select
              value={selectedWorkoutDayId}
              onChange={(e) => setSelectedWorkoutDayId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Select a workout...</option>
              {workoutDays.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cardio Selection */}
        {workoutType === 'cardio' && cardioTemplates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Select Cardio
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Select cardio type...</option>
              {cardioTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mobility Selection */}
        {workoutType === 'mobility' && mobilityTemplates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Select Mobility
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Select mobility routine...</option>
              {mobilityTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Validation message */}
        {!isValidSelection() && workoutType !== 'rest' && (
          <p className="text-sm text-[var(--color-error)]">
            Please select a workout to continue
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={isPending}
            disabled={!isValidSelection()}
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
