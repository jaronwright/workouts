import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { restDayActivities } from '@/config/restDayActivities'
import {
  Footprints,
  CircleDot,
  Move,
  HeartPulse,
  Waves,
  Droplets,
  Moon,
  Sparkles,
  Check
} from 'lucide-react'
import { useState } from 'react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  'circle-dot': CircleDot,
  move: Move,
  'heart-pulse': HeartPulse,
  waves: Waves,
  droplets: Droplets,
  moon: Moon,
  sparkles: Sparkles
}

export function RestDayPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const toggleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <AppShell title="Rest Day" showBack>
      <div className="p-4 space-y-4">
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Recovery Day</h2>
          <p className="text-[var(--color-text-muted)] mt-1">
            Rest is when your muscles grow. Try some of these activities:
          </p>
        </div>

        <div className="space-y-3">
          {restDayActivities.map((activity) => {
            const Icon = iconMap[activity.icon] || Sparkles
            const isComplete = completed.has(activity.id)

            return (
              <Card
                key={activity.id}
                className={`cursor-pointer transition-all ${
                  isComplete ? 'ring-2 ring-[var(--color-success)] bg-[var(--color-success)]/5' : ''
                }`}
                onClick={() => toggleComplete(activity.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isComplete
                          ? 'bg-[var(--color-success)] text-[var(--color-text-inverse)]'
                          : 'bg-[var(--color-primary)]/20'
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${
                          isComplete ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'
                        }`}>
                          {activity.name}
                        </h3>
                        {activity.duration && (
                          <span className="text-xs bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full">
                            {activity.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activity.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {completed.size > 0 && (
          <div className="text-center py-4">
            <p className="text-[var(--color-success)] font-medium">
              Great job! You&apos;ve completed {completed.size} recovery activities today.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
