import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { useMobilityVariants } from '@/hooks/useMobilityTemplates'
import { getMobilityStyle } from '@/config/workoutConfig'
import { Clock } from 'lucide-react'

const DURATION_LABELS: Record<number, string> = {
  15: 'Quick',
  30: 'Standard',
  45: 'Extended',
  60: 'Full Session'
}

export function MobilityDurationPickerPage() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const { data: variants, isLoading } = useMobilityVariants(category ?? '')

  const style = getMobilityStyle(category ?? null)
  const Icon = style.icon

  // Get the name from the first variant
  const typeName = variants?.[0]?.name ?? 'Mobility'

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-4 space-y-4">
          <div className="h-32 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          ))}
        </div>
      </AppShell>
    )
  }

  if (!variants || variants.length === 0) {
    return (
      <AppShell title="Not Found" showBack>
        <div className="p-4 text-center text-[var(--color-text-muted)]">
          No variants found for this mobility type.
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title={typeName} showBack>
      <div className="p-4 space-y-4">
        {/* Header */}
        <Card>
          <CardContent className="py-6 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: style.bgColor }}
            >
              <Icon className="w-7 h-7" style={{ color: style.color }} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {typeName}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Choose your session length
            </p>
          </CardContent>
        </Card>

        {/* Duration Cards */}
        <div className="space-y-3">
          {variants.map(variant => {
            const duration = variant.duration_minutes ?? 15
            const label = DURATION_LABELS[duration] ?? `${duration} min`

            return (
              <Card key={variant.id}>
                <button
                  className="w-full text-left"
                  onClick={() => navigate(`/mobility/${variant.id}`)}
                >
                  <CardContent className="py-4 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: style.bgColor }}
                    >
                      <Clock className="w-6 h-6" style={{ color: style.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text)] text-base">
                        {duration} min
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {label}
                      </p>
                    </div>
                    <div
                      className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{ color: style.color, backgroundColor: style.bgColor }}
                    >
                      {duration} min
                    </div>
                  </CardContent>
                </button>
              </Card>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
