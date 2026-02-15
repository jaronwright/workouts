import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Heart, Activity, ChevronRight, Dumbbell, X, ArrowLeft, Clock } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { WorkoutDayCard } from '@/components/workout'
import { useSelectedPlanDays } from '@/hooks/useWorkoutPlan'
import { useActiveSession, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useWorkoutTemplatesByType } from '@/hooks/useSchedule'
import { useMobilityCategories } from '@/hooks/useMobilityTemplates'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import type { WorkoutTemplate } from '@/services/scheduleService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import {
  getCardioStyle,
  getMobilityStyle,
  CATEGORY_DEFAULTS,
} from '@/config/workoutConfig'
import { formatRelativeTime } from '@/utils/formatters'

// ─── Cardio Card — shows last session info ─────────────────
interface CardioCardProps {
  template: WorkoutTemplate
  lastSession: TemplateWorkoutSession | null
  onClick: () => void
}

function CardioCard({ template, lastSession, onClick }: CardioCardProps) {
  const style = getCardioStyle(template.category)
  const Icon = style.icon

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight">
            {template.name}
          </h3>
          {lastSession ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--color-text-muted)]">
                Last: {lastSession.duration_minutes ? `${lastSession.duration_minutes} min` : '—'}
                {lastSession.distance_value ? ` · ${lastSession.distance_value} ${lastSession.distance_unit || 'mi'}` : ''}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] opacity-70">
                {formatRelativeTime(lastSession.completed_at!)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              No sessions yet
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

// ─── Mobility Card — shows category, navigates to duration picker ──
interface MobilityCategoryCardProps {
  category: string
  template: WorkoutTemplate
  lastSession: TemplateWorkoutSession | null
  onClick: () => void
}

function MobilityCategoryCard({ category, template, lastSession, onClick }: MobilityCategoryCardProps) {
  const style = getMobilityStyle(category)
  const Icon = style.icon

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight">
            {template.name}
          </h3>
          {lastSession ? (
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">
                Last: {lastSession.duration_minutes ?? '—'} min
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] opacity-70">
                {formatRelativeTime(lastSession.completed_at!)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Choose duration
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
  const { data: mobilityCategories, isLoading: mobilityLoading } = useMobilityCategories()
  const { data: templateSessions } = useUserTemplateWorkouts()
  const { data: activeSession } = useActiveSession()
  const deleteSession = useDeleteSession()

  const isLoading = daysLoading

  // Build a map of template_id → most recent completed session
  const lastSessionByTemplate = useMemo(() => {
    const map = new Map<string, TemplateWorkoutSession>()
    if (!templateSessions) return map

    for (const s of templateSessions) {
      if (!s.completed_at) continue
      const existing = map.get(s.template_id)
      if (!existing || new Date(s.completed_at) > new Date(existing.completed_at!)) {
        map.set(s.template_id, s)
      }
    }
    return map
  }, [templateSessions])

  // For mobility categories, find last session across any duration variant in that category
  const lastSessionByMobilityCategory = useMemo(() => {
    const map = new Map<string, TemplateWorkoutSession>()
    if (!templateSessions) return map

    for (const s of templateSessions) {
      if (!s.completed_at || !s.template || s.template.type !== 'mobility') continue
      const cat = s.template.category
      if (!cat) continue
      const existing = map.get(cat)
      if (!existing || new Date(s.completed_at) > new Date(existing.completed_at!)) {
        map.set(cat, s)
      }
    }
    return map
  }, [templateSessions])

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
    <AppShell title="Choose a Workout">
      <div className="p-4 space-y-5">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-[var(--text-sm)] font-medium text-[var(--color-text-muted)] active:text-[var(--color-text)] transition-colors -mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

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
                  onClick={() => navigate(`/workout/${day.id}`)}
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
                <CardioCard
                  key={template.id}
                  template={template}
                  lastSession={lastSessionByTemplate.get(template.id) ?? null}
                  onClick={() => navigate(`/cardio/${template.id}`)}
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

        {/* Mobility Section — shows categories, navigates to duration picker */}
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
          ) : mobilityCategories?.length ? (
            <div className="space-y-3">
              {mobilityCategories.map(({ category, template }) => (
                <MobilityCategoryCard
                  key={category}
                  category={category}
                  template={template}
                  lastSession={lastSessionByMobilityCategory.get(category) ?? null}
                  onClick={() => navigate(`/mobility/${category}/select`)}
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
