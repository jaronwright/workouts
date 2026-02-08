import { ChevronRight } from 'lucide-react'
import type { WorkoutDay } from '@/types/workout'
import { Card, CardContent } from '@/components/ui'
import { getWeightsStyleByName, getWorkoutDisplayName, CATEGORY_LABELS } from '@/config/workoutConfig'

interface WorkoutDayCardProps {
  day: WorkoutDay
  onClick: () => void
}

export function WorkoutDayCard({ day, onClick }: WorkoutDayCardProps) {
  const style = getWeightsStyleByName(day.name)
  const label = getWorkoutDisplayName(day.name)
  const Icon = style.icon

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        {/* Gradient Icon */}
        <div
          className={`
            w-12 h-12 rounded-[var(--radius-lg)]
            bg-gradient-to-br ${style.gradient}
            flex items-center justify-center
            shadow-sm
          `}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: style.color }}
          >
            {CATEGORY_LABELS.weights}
          </span>
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight mt-0.5">
            {label}
          </h3>
        </div>

        {/* Arrow */}
        <div className="
          w-8 h-8 rounded-full
          bg-[var(--color-surface-hover)]
          flex items-center justify-center
          text-[var(--color-text-muted)]
        ">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}
