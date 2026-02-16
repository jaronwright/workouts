import { TrendUp } from '@phosphor-icons/react'
import type { ProgressionSuggestion } from '@/services/progressionService'

interface ProgressionBadgeProps {
  suggestion: ProgressionSuggestion
  onClick?: () => void
}

export function ProgressionBadge({ suggestion, onClick }: ProgressionBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] px-2.5 py-2 rounded-full hover:bg-[var(--color-success)]/20 transition-colors min-h-[44px]"
      title={suggestion.reason}
    >
      <TrendUp className="w-3 h-3" />
      <span>Try {suggestion.suggestedWeight} lbs</span>
      <span className="text-[var(--color-success)]/70">(+{suggestion.increase})</span>
    </button>
  )
}
