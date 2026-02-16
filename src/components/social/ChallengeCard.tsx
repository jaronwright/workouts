import { motion } from 'motion/react'
import { Target, Users, Trophy, Clock } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui'
import { PressableButton } from '@/components/motion'
import { BADGE_MAP } from '@/config/badgeConfig'
import type { ChallengeWithProgress } from '@/types/community'

interface ChallengeCardProps {
  challenge: ChallengeWithProgress
  onJoin: (challengeId: string) => void
  isJoining?: boolean
}

function formatTimeLeft(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return 'Ended'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

function getMetricLabel(metric: string): string {
  switch (metric) {
    case 'workouts': return 'workouts'
    case 'streak': return 'day streak'
    case 'volume': return 'lbs lifted'
    case 'duration': return 'minutes'
    case 'distance': return 'miles'
    default: return metric
  }
}

export function ChallengeCard({ challenge, onJoin, isJoining }: ChallengeCardProps) {
  const { participant, participant_count } = challenge
  const isJoined = !!participant
  const isComplete = !!participant?.completed_at
  const progress = participant?.progress || 0
  const progressPct = Math.min(100, Math.round((progress / challenge.target_value) * 100))
  const badge = challenge.badge_key ? BADGE_MAP[challenge.badge_key] : null

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center">
              {isComplete ? (
                <Trophy className="w-5 h-5 text-[var(--color-accent)]" />
              ) : (
                <Target className="w-5 h-5 text-[var(--color-accent)]" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">{challenge.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  {challenge.challenge_type}
                </span>
                {badge && (
                  <span className="text-xs" title={`Earn: ${badge.name}`}>
                    {badge.emoji}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Clock className="w-3 h-3" />
            {formatTimeLeft(challenge.ends_at)}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {challenge.description}
        </p>

        {/* Progress bar (if joined) */}
        {isJoined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">
                {progress.toLocaleString()} / {challenge.target_value.toLocaleString()} {getMetricLabel(challenge.metric)}
              </span>
              <span className="font-bold text-[var(--color-text)]">{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="h-full rounded-full"
                style={{
                  background: isComplete
                    ? 'var(--color-success)'
                    : 'var(--color-accent)',
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Users className="w-3.5 h-3.5" />
            {participant_count} joined
          </div>

          {!isJoined ? (
            <PressableButton
              onClick={() => onJoin(challenge.id)}
              disabled={isJoining}
              className="px-4 py-1.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold"
            >
              Join
            </PressableButton>
          ) : isComplete ? (
            <span className="text-xs font-semibold text-[var(--color-success)] flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Completed
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
