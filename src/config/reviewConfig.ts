import {
  Star,
  Zap,
  Trophy,
  Battery,
  Flame,
  Clock,
  Focus,
  CloudOff,
  Sparkles,
  Weight,
  Feather,
  Rocket,
  type LucideIcon,
} from 'lucide-react'
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
  { value: 'stressed', emoji: '😤', label: 'Stressed', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
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
  icon: LucideIcon
  color: string
}

export const PERFORMANCE_TAG_OPTIONS: TagOption[] = [
  { value: 'felt_strong', label: 'Felt Strong', icon: Zap, color: '#10B981' },
  { value: 'new_pr', label: 'New PR', icon: Trophy, color: '#F59E0B' },
  { value: 'pumped', label: 'Pumped', icon: Flame, color: '#EF4444' },
  { value: 'focused', label: 'Focused', icon: Focus, color: '#6366F1' },
  { value: 'good_form', label: 'Good Form', icon: Star, color: '#14B8A6' },
  { value: 'breakthrough', label: 'Breakthrough', icon: Rocket, color: '#EC4899' },
  { value: 'heavy', label: 'Heavy', icon: Weight, color: '#8B5CF6' },
  { value: 'light_day', label: 'Light Day', icon: Feather, color: '#06B6D4' },
  { value: 'tired', label: 'Tired', icon: Battery, color: '#F97316' },
  { value: 'sore', label: 'Sore', icon: Sparkles, color: '#D946EF' },
  { value: 'rushed', label: 'Rushed', icon: Clock, color: '#F43F5E' },
  { value: 'distracted', label: 'Distracted', icon: CloudOff, color: '#64748B' },
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
  1: '#EF4444', // red
  2: '#F97316', // orange
  3: '#F59E0B', // amber
  4: '#10B981', // emerald
  5: '#6366F1', // indigo
}

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#10B981', // green (easy)
  2: '#6366F1', // indigo
  3: '#F59E0B', // amber
  4: '#F97316', // orange
  5: '#EF4444', // red (brutal)
}

export const ENERGY_COLORS: Record<number, string> = {
  1: '#EF4444', // red (drained)
  2: '#F97316', // orange
  3: '#EAB308', // yellow
  4: '#84CC16', // lime
  5: '#22C55E', // green (energized)
}

// ─── Review Steps ─────────────────────────────────────

export interface ReviewStepConfig {
  title: string
  subtitle: string
  optional: boolean
}

export const REVIEW_STEPS: ReviewStepConfig[] = [
  {
    title: 'How was your workout?',
    subtitle: 'Rate your overall experience',
    optional: false,
  },
  {
    title: 'How did you feel?',
    subtitle: 'Track your mood and energy',
    optional: true,
  },
  {
    title: 'Tag your session',
    subtitle: 'Select what applies',
    optional: true,
  },
  {
    title: 'Reflect',
    subtitle: 'Capture your thoughts',
    optional: true,
  },
]
