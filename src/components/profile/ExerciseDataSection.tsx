import { CollapsibleSection } from '@/components/ui'
import { useExerciseUsageStats } from '@/hooks/useExerciseGuide'
import { Database } from '@phosphor-icons/react'

export function ExerciseDataSection() {
  const { data: stats } = useExerciseUsageStats()

  return (
    <div className="px-[var(--space-4)]">
      <CollapsibleSection
        title="Exercise Data"
        subtitle="ExerciseDB API usage"
        icon={Database}
        iconColor="var(--color-primary)"
      >
        <div className="space-y-3">
          {stats ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">Exercises Cached</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{stats.cached_exercises}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">API Calls Today</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{stats.daily_calls} / {stats.daily_limit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">This Month</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{stats.monthly_calls} / {stats.monthly_limit}</span>
              </div>
              {/* Usage bar */}
              <div className="pt-1">
                <div className="h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (stats.monthly_calls / stats.monthly_limit) * 100)}%`,
                      backgroundColor: stats.monthly_calls > 1800 ? 'var(--color-danger)' : 'var(--color-primary)',
                    }}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  {stats.monthly_remaining} calls remaining this month
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Loading usage data...</p>
          )}
          <p className="text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
            Exercise data by ExerciseDB
          </p>
        </div>
      </CollapsibleSection>
    </div>
  )
}
