import { ChevronRight, Flame, Zap, Target } from 'lucide-react'
import type { WorkoutDay } from '@/types/workout'
import { Card, CardContent } from '@/components/ui'

interface WorkoutDayCardProps {
  day: WorkoutDay
  onClick: () => void
}

const dayConfig: Record<number, { gradient: string; icon: React.ElementType; label: string }> = {
  1: {
    gradient: 'from-rose-500 to-orange-500',
    icon: Flame,
    label: 'Push'
  },
  2: {
    gradient: 'from-blue-500 to-cyan-500',
    icon: Zap,
    label: 'Pull'
  },
  3: {
    gradient: 'from-emerald-500 to-teal-500',
    icon: Target,
    label: 'Legs'
  }
}

export function WorkoutDayCard({ day, onClick }: WorkoutDayCardProps) {
  const config = dayConfig[day.day_number] || {
    gradient: 'from-gray-500 to-gray-600',
    icon: Target,
    label: `Day ${day.day_number}`
  }
  const Icon = config.icon

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        {/* Gradient Icon */}
        <div
          className={`
            w-12 h-12 rounded-[var(--radius-lg)]
            bg-gradient-to-br ${config.gradient}
            flex items-center justify-center
            shadow-sm
          `}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={`
            text-xs font-bold uppercase tracking-wider
            bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent
          `}>
            {config.label}
          </span>
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight mt-0.5">
            {day.name}
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
