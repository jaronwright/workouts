import { useNavigate } from 'react-router-dom'
import { Play, Heart, Activity, ChevronRight, Dumbbell, X } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { WorkoutDayCard, ScheduleWidget } from '@/components/workout'
import { useSelectedPlanDays } from '@/hooks/useWorkoutPlan'
import { useActiveSession, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useWorkoutTemplatesByType } from '@/hooks/useSchedule'
import type { WorkoutTemplate } from '@/services/scheduleService'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import {
  getCardioStyle,
  getMobilityStyle,
  CATEGORY_DEFAULTS,
  getCategoryLabel
} from '@/config/workoutConfig'

interface TemplateCardProps {
  template: WorkoutTemplate
  onClick: () => void
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  const style = template.type === 'cardio'
    ? getCardioStyle(template.category)
    : getMobilityStyle(template.category)
  const Icon = style.icon
  const typeLabel = getCategoryLabel(template.type)

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: style.color }}
          >
            {typeLabel}
          </span>
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight mt-0.5">
            {template.name}
          </h3>
          {template.duration_minutes && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              ~{template.duration_minutes} min
            </p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export function WorkoutSelectPage() {
  const navigate = useNavigate()
  const { data: days, isLoading: daysLoading } = useSelectedPlanDays()
  const { data: cardioTemplates, isLoading: cardioLoading } = useWorkoutTemplatesByType('cardio')
  const { data: mobilityTemplates, isLoading: mobilityLoading } = useWorkoutTemplatesByType('mobility')
  const { data: activeSession } = useActiveSession()
  const deleteSession = useDeleteSession()

  const isLoading = daysLoading

  const handleStartWorkout = (dayId: string) => {
    navigate(`/workout/${dayId}`)
  }

  const handleStartCardio = (templateId: string) => {
    navigate(`/cardio/${templateId}`)
  }

  const handleStartMobility = (templateId: string) => {
    navigate(`/mobility/${templateId}`)
  }

  const handleContinueWorkout = () => {
    if (activeSession) {
      navigate(`/workout/${activeSession.workout_day_id}/active`)
    }
  }

  const handleDismissSession = () => {
    if (activeSession) {
      deleteSession.mutate(activeSession.id)
    }
  }

  return (
    <AppShell title="Workouts" showLogout>
      <div className="p-4 space-y-5">
        {/* Active Session Banner */}
        {activeSession && (
          <Card highlight>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--color-success), #10b981)' }}
                >
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-success)' }}>
                    In Progress
                  </p>
                  <p className="text-base font-bold text-[var(--color-text)]">
                    {getWorkoutDisplayName(activeSession.workout_day?.name)}
                  </p>
                </div>
                <Button size="sm" onClick={handleContinueWorkout}>
                  Continue
                </Button>
                <button
                  onClick={handleDismissSession}
                  className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
                  title="Dismiss session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Widget */}
        <section>
          <ScheduleWidget />
        </section>

        {/* Weights Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-5 h-5" style={{ color: CATEGORY_DEFAULTS.weights.color }} />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Weights
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : days?.length ? (
            <div className="space-y-3">
              {days.map((day) => (
                <WorkoutDayCard
                  key={day.id}
                  day={day}
                  onClick={() => handleStartWorkout(day.id)}
                />
              ))}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">
                  No weight workouts found.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Cardio Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5" style={{ color: CATEGORY_DEFAULTS.cardio.color }} />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Cardio
            </h2>
          </div>
          {cardioLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : cardioTemplates?.length ? (
            <div className="space-y-3">
              {cardioTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleStartCardio(template.id)}
                />
              ))}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">
                  No cardio workouts available.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Mobility Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5" style={{ color: CATEGORY_DEFAULTS.mobility.color }} />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Mobility
            </h2>
          </div>
          {mobilityLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : mobilityTemplates?.length ? (
            <div className="space-y-3">
              {mobilityTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleStartMobility(template.id)}
                />
              ))}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">
                  No mobility workouts available.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

      </div>
    </AppShell>
  )
}
