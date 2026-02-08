import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { getCardioStyle } from '@/config/workoutConfig'
import { getCardioTemplateStats } from '@/utils/cardioUtils'
import type { WorkoutTemplate, ScheduleDay } from '@/services/scheduleService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

interface CardioLogCardProps {
  template: WorkoutTemplate
  sessions: TemplateWorkoutSession[]
  schedule: ScheduleDay[]
  currentCycleDay: number
}

export function CardioLogCard({ template, sessions, schedule, currentCycleDay }: CardioLogCardProps) {
  const navigate = useNavigate()
  const style = getCardioStyle(template.category)
  const Icon = style.icon

  const stats = getCardioTemplateStats(template.id, sessions, schedule, currentCycleDay)

  return (
    <Card
      interactive
      onClick={() => navigate(`/cardio/${template.id}`)}
    >
      <CardContent className="flex items-center gap-4 py-4">
        {/* Gradient icon */}
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight">
            {template.name}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
            {stats.lastSessionSummary}
          </p>
          {stats.weeklyCount > 0 && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1"
              style={{
                backgroundColor: `${style.color}15`,
                color: style.color
              }}
            >
              {stats.weeklyCount}x this week
            </span>
          )}
        </div>

        {/* Chevron */}
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}
