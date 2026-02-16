import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { FadeIn, StaggerList, StaggerItem } from '@/components/motion'
import { restDayActivities } from '@/config/restDayActivities'
import {
  Footprints,
  Crosshair,
  ArrowsOutCardinal,
  Heartbeat,
  Waves,
  Drop,
  Moon,
  Sparkle,
  Check
} from '@phosphor-icons/react'
import { useState } from 'react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  'circle-dot': Crosshair,
  move: ArrowsOutCardinal,
  'heart-pulse': Heartbeat,
  waves: Waves,
  droplets: Drop,
  moon: Moon,
  sparkles: Sparkle
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
      <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
        <FadeIn direction="up">
          <div className="text-center py-[var(--space-4)]">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-[var(--space-3)]"
              style={{ background: 'var(--color-tertiary-muted)' }}
            >
              <Moon className="w-7 h-7" style={{ color: 'var(--color-tertiary)' }} />
            </div>
            <h2
              className="text-[var(--text-xl)] text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-bold)' }}
            >
              Recovery Day
            </h2>
            <p className="text-[var(--color-text-muted)] mt-[var(--space-1)]">
              Rest is when your muscles grow. Try some of these activities:
            </p>
          </div>
        </FadeIn>

        <StaggerList className="space-y-[var(--space-3)]">
          {restDayActivities.map((activity) => {
            const Icon = iconMap[activity.icon] || Sparkle
            const isComplete = completed.has(activity.id)

            return (
              <StaggerItem key={activity.id}>
                <Card
                  className={`cursor-pointer transition-all ${
                    isComplete ? 'ring-2 ring-[var(--color-success)] bg-[var(--color-success-muted)]' : ''
                  }`}
                  onClick={() => toggleComplete(activity.id)}
                >
                  <CardContent className="py-[var(--space-4)]">
                    <div className="flex items-start gap-[var(--space-3)]">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isComplete
                            ? 'bg-[var(--color-success)] text-[var(--color-text-inverse)]'
                            : ''
                        }`}
                        style={!isComplete ? { background: 'var(--color-primary-muted)' } : undefined}
                      >
                        {isComplete ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-[var(--space-2)]">
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
                        <p className="text-sm text-[var(--color-text-muted)] mt-[var(--space-1)]">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-[var(--space-2)]">
                          {activity.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="text-xs text-[var(--color-primary)] px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--color-primary-muted)' }}
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )
          })}
        </StaggerList>

        {completed.size > 0 && (
          <FadeIn direction="up">
            <div className="text-center py-[var(--space-4)]">
              <p className="font-medium" style={{ color: 'var(--color-success)' }}>
                Great job! You&apos;ve completed {completed.size} recovery {completed.size === 1 ? 'activity' : 'activities'} today.
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </AppShell>
  )
}
