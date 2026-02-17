import {
  Star,
  Lightning,
  Trophy,
  BatteryMedium,
  Fire,
  Clock,
  Crosshair,
  CloudSlash,
  Sparkle,
  Barbell,
  Feather,
  Rocket,
  type Icon,
} from '@phosphor-icons/react'
import type { MoodValue, PerformanceTag } from '@/services/reviewService'

// ─── Mood Configuration ──────────────────────────────

export interface MoodOption {
  value: MoodValue
  emoji: string
  label: string
  color: string
  bgColor: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: 'stressed', emoji: '😤', label: 'Stressed', color: '#E63B57', bgColor: 'rgba(230, 59, 87, 0.15)' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#EAB308', bgColor: 'rgba(234, 179, 8, 0.15)' },
  { value: 'good', emoji: '😊', label: 'Good', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.15)' },
  { value: 'great', emoji: '🔥', label: 'Great', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
]

export const MOOD_MAP: Record<MoodValue, MoodOption> = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.value, m])
) as Record<MoodValue, MoodOption>

// ─── Performance Tags ─────────────────────────────────

export interface TagOption {
  value: PerformanceTag
  label: string
  icon: Icon
  color: string
}

export const PERFORMANCE_TAG_OPTIONS: TagOption[] = [
  { value: 'felt_strong', label: 'Felt Strong', icon: Lightning, color: '#10B981' },
  { value: 'new_pr', label: 'New PR', icon: Trophy, color: '#D99700' },
  { value: 'pumped', label: 'Pumped', icon: Fire, color: '#E63B57' },
  { value: 'focused', label: 'Focused', icon: Crosshair, color: '#6366F1' },
  { value: 'good_form', label: 'Good Form', icon: Star, color: '#14B8A6' },
  { value: 'breakthrough', label: 'Breakthrough', icon: Rocket, color: '#EC4899' },
  { value: 'heavy', label: 'Heavy', icon: Barbell, color: '#8B5CF6' },
  { value: 'light_day', label: 'Light Day', icon: Feather, color: '#06B6D4' },
  { value: 'tired', label: 'Tired', icon: BatteryMedium, color: '#F97316' },
  { value: 'sore', label: 'Sore', icon: Sparkle, color: '#D946EF' },
  { value: 'rushed', label: 'Rushed', icon: Clock, color: '#F43F5E' },
  { value: 'distracted', label: 'Distracted', icon: CloudSlash, color: '#64748B' },
]

export const TAG_MAP: Record<PerformanceTag, TagOption> = Object.fromEntries(
  PERFORMANCE_TAG_OPTIONS.map((t) => [t.value, t])
) as Record<PerformanceTag, TagOption>

// ─── Rating Labels ────────────────────────────────────

export const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Amazing',
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Moderate',
  3: 'Challenging',
  4: 'Hard',
  5: 'Brutal',
}

export const ENERGY_LABELS: Record<number, string> = {
  1: 'Drained',
  2: 'Low',
  3: 'Normal',
  4: 'High',
  5: 'Energized',
}

// ─── Rating Colors (green → yellow → red gradient) ───

export const RATING_COLORS: Record<number, string> = {
  1: '#E63B57', // rose
  2: '#F97316', // orange
  3: '#EAB308', // yellow
  4: '#10B981', // emerald
  5: '#6366F1', // indigo
}

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#10B981', // green (easy)
  2: '#6366F1', // indigo
  3: '#EAB308', // yellow
  4: '#F97316', // orange
  5: '#E63B57', // rose (brutal)
}

export const ENERGY_COLORS: Record<number, string> = {
  1: '#E63B57', // rose (drained)
  2: '#F97316', // orange
  3: '#EAB308', // yellow
  4: '#84CC16', // lime
  5: '#22C55E', // green (energized)
}

