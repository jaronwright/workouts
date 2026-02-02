import { useNavigate } from 'react-router-dom'
import { Play, Heart, Activity, ChevronRight, Dumbbell, Moon, Calendar } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { WorkoutDayCard } from '@/components/workout'
import { useWorkoutPlans, useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { useActiveSession } from '@/hooks/useWorkoutSession'
import { useWorkoutTemplatesByType, useTodaysWorkout } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import type { WorkoutTemplate } from '@/services/scheduleService'
import {
  getCardioStyle,
  getMobilityStyle,
  getWeightsStyleByDayNumber,
  getWeightsLabel,
  CATEGORY_DEFAULTS,
  CATEGORY_LABELS,
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
  const { data: plans, isLoading: plansLoading } = useWorkoutPlans()
  const { data: days, isLoading: daysLoading } = useWorkoutDays(plans?.[0]?.id)
  const { data: cardioTemplates, isLoading: cardioLoading } = useWorkoutTemplatesByType('cardio')
  const { data: mobilityTemplates, isLoading: mobilityLoading } = useWorkoutTemplatesByType('mobility')
  const { data: activeSession } = useActiveSession()
  const { data: profile } = useProfile()
  const currentCycleDay = profile?.current_cycle_day || 1
  const { data: todaysSchedule, isLoading: scheduleLoading } = useTodaysWorkout(currentCycleDay)

  const isLoading = plansLoading || daysLoading

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

  const handleStartUpNext = () => {
    if (!todaysSchedule) return

    if (todaysSchedule.is_rest_day) {
      navigate('/rest-day')
      return
    }

    if (todaysSchedule.workout_day_id) {
      navigate(`/workout/${todaysSchedule.workout_day_id}`)
    } else if (todaysSchedule.template_id && todaysSchedule.template) {
      if (todaysSchedule.template.type === 'cardio') {
        navigate(`/cardio/${todaysSchedule.template_id}`)
      } else if (todaysSchedule.template.type === 'mobility') {
        navigate(`/mobility/${todaysSchedule.template_id}`)
      }
    }
  }

  // Get display info for the "Up Next" workout
  const getUpNextInfo = () => {
    if (!todaysSchedule) return null

    if (todaysSchedule.is_rest_day) {
      return {
        icon: Moon,
        label: CATEGORY_LABELS.rest,
        name: 'Recovery & Rest',
        gradient: 'from-gray-500 to-gray-600',
        color: '#6B7280'
      }
    }

    if (todaysSchedule.workout_day) {
      const dayNum = todaysSchedule.workout_day.day_number
      const style = getWeightsStyleByDayNumber(dayNum)
      const workoutLabel = getWeightsLabel(dayNum)
      return {
        icon: style.icon,
        label: CATEGORY_LABELS.weights,
        name: workoutLabel,
        gradient: style.gradient,
        color: style.color
      }
    }

    if (todaysSchedule.template) {
      const template = todaysSchedule.template
      if (template.type === 'cardio') {
        const style = getCardioStyle(template.category)
        return {
          icon: style.icon,
          label: CATEGORY_LABELS.cardio,
          name: template.name,
          gradient: style.gradient,
          color: style.color
        }
      }
      if (template.type === 'mobility') {
        const style = getMobilityStyle(template.category)
        return {
          icon: style.icon,
          label: CATEGORY_LABELS.mobility,
          name: template.name,
          gradient: style.gradient,
          color: style.color
        }
      }
    }

    return null
  }

  const upNextInfo = getUpNextInfo()

  return (
    <AppShell title="Workouts" showLogout>
      <div className="p-4 space-y-5">
        {/* Active Session Banner */}
        {activeSession && (
          <Card highlight>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">
                    In Progress
                  </p>
                  <p className="text-base font-bold text-[var(--color-text)]">
                    {activeSession.workout_day?.name || 'Workout'}
                  </p>
                </div>
                <Button size="sm" onClick={handleContinueWorkout}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Up Next Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Up Next
            </h2>
            <span className="text-sm text-[var(--color-text-muted)]">
              Day {currentCycleDay}
            </span>
          </div>
          {scheduleLoading ? (
            <div className="h-24 rounded-[var(--radius-xl)] skeleton" />
          ) : upNextInfo ? (
            <Card
              interactive={!activeSession}
              className={activeSession
                ? "opacity-75"
                : "border-2 border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5"
              }
              onClick={activeSession ? undefined : handleStartUpNext}
            >
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br ${upNextInfo.gradient} flex items-center justify-center shadow-sm`}>
                    <upNextInfo.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: upNextInfo.color }}
                    >
                      {upNextInfo.label}
                    </p>
                    <h3 className="text-lg font-bold text-[var(--color-text)] leading-tight mt-0.5">
                      {upNextInfo.name}
                    </h3>
                  </div>
                  {!activeSession && (
                    <Button size="sm" variant="gradient">
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">
                  No workout scheduled for today. Set up your schedule to get started.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => navigate('/schedule')}
                >
                  Set Up Schedule
                </Button>
              </CardContent>
            </Card>
          )}
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
