import { Fire, Barbell, HandFist, Star, type Icon } from '@phosphor-icons/react'
import type { ReactionType } from '@/types/community'

// ─── Reaction Configuration ──────────────────────────

export interface ReactionConfig {
  type: ReactionType
  emoji: string
  label: string
  icon: Icon
  color: string
}

export const REACTION_OPTIONS: ReactionConfig[] = [
  { type: 'fire', emoji: '🔥', label: 'Fire', icon: Fire, color: '#F97316' },
  { type: 'strong', emoji: '💪', label: 'Strong', icon: Barbell, color: '#6366F1' },
  { type: 'props', emoji: '👏', label: 'Props', icon: HandFist, color: '#10B981' },
  { type: 'impressive', emoji: '⭐', label: 'Impressive', icon: Star, color: '#D99700' },
]

export const REACTION_MAP: Record<ReactionType, ReactionConfig> = {
  fire: REACTION_OPTIONS[0],
  strong: REACTION_OPTIONS[1],
  props: REACTION_OPTIONS[2],
  impressive: REACTION_OPTIONS[3],
}

// ─── Feed Configuration ──────────────────────────────

export const FEED_PAGE_SIZE = 20
export const FEED_STALE_TIME = 2 * 60 * 1000 // 2 minutes
export const MAX_INLINE_EXERCISES = 5
export const MAX_REFLECTION_LENGTH = 120
export const STREAK_BADGE_THRESHOLD = 3

// ─── Empty State Messages ────────────────────────────

export const EMPTY_FEED_TITLE = 'No workouts yet'
export const EMPTY_FEED_MESSAGE = "When you and your friends start working out, you'll see each other's sessions here. Get after it!"

export const PRIVACY_EXPLAINER_TITLE = 'Welcome to Community'
export const PRIVACY_EXPLAINER_MESSAGE = "Your completed workouts are shared with friends here so you can cheer each other on. You can hide any workout by toggling it to private, and control whether your weight details are visible in your profile settings."
