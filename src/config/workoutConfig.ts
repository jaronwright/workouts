import {
  Barbell,
  ArrowDown,
  Footprints,
  Bicycle,
  Lightning,
  TrendUp,
  Waves,
  Target,
  FlowArrow,
  Heartbeat,
  Wind,
  ArrowUp,
  ArrowsDownUp,
  Sword,
  Heart,
  Shield,
  type Icon,
} from '@phosphor-icons/react'

export interface WorkoutStyle {
  color: string
  bgColor: string
  gradient: string
  icon: Icon
}

// WEIGHTS - Indigo/Violet/Pink Theme
export const WEIGHTS_CONFIG: Record<string, WorkoutStyle> = {
  push: {
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    gradient: 'from-indigo-500 to-indigo-400',
    icon: Barbell
  },
  pull: {
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    gradient: 'from-violet-500 to-violet-400',
    icon: ArrowDown
  },
  legs: {
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    gradient: 'from-pink-500 to-pink-400',
    icon: Footprints
  },
  upper: {
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    gradient: 'from-indigo-500 to-indigo-400',
    icon: ArrowUp
  },
  lower: {
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    gradient: 'from-violet-500 to-violet-400',
    icon: ArrowsDownUp
  },
  // Full Body days
  'full body a': { color: '#10B981', bgColor: '#10B98120', gradient: 'from-emerald-500 to-emerald-400', icon: Barbell },
  'full body b': { color: '#14B8A6', bgColor: '#14B8A620', gradient: 'from-teal-500 to-teal-400', icon: Barbell },
  'full body c': { color: '#06B6D4', bgColor: '#06B6D420', gradient: 'from-cyan-500 to-cyan-400', icon: Barbell },
  'full body d': { color: '#0EA5E9', bgColor: '#0EA5E920', gradient: 'from-sky-500 to-sky-400', icon: Barbell },
  'full body e': { color: '#3B82F6', bgColor: '#3B82F620', gradient: 'from-blue-500 to-blue-400', icon: Barbell },
  // Bro Split days
  'chest': { color: '#E63B57', bgColor: '#E63B5720', gradient: 'from-rose-500 to-rose-400', icon: Barbell },
  'back': { color: '#F97316', bgColor: '#F9731620', gradient: 'from-orange-500 to-orange-400', icon: ArrowDown },
  'shoulders': { color: '#EAB308', bgColor: '#EAB30820', gradient: 'from-yellow-500 to-yellow-400', icon: ArrowUp },
  'arms': { color: '#A855F7', bgColor: '#A855F720', gradient: 'from-purple-500 to-purple-400', icon: Barbell },
  // Arnold Split days
  'chest & back': { color: '#F43F5E', bgColor: '#F43F5E20', gradient: 'from-rose-500 to-rose-400', icon: Barbell },
  'shoulders & arms': { color: '#D946EF', bgColor: '#D946EF20', gradient: 'from-fuchsia-500 to-fuchsia-400', icon: ArrowUp },
  // Glute Hypertrophy days
  'lower a': { color: '#F43F5E', bgColor: '#F43F5E20', gradient: 'from-rose-500 to-rose-400', icon: Footprints },
  'upper a': { color: '#FB923C', bgColor: '#FB923C20', gradient: 'from-orange-400 to-orange-300', icon: ArrowUp },
  'lower b': { color: '#EC4899', bgColor: '#EC489920', gradient: 'from-pink-500 to-pink-400', icon: Footprints },
  'upper b': { color: '#F59E0B', bgColor: '#F59E0B20', gradient: 'from-amber-500 to-amber-400', icon: ArrowUp },
  'lower c': { color: '#E879F9', bgColor: '#E879F920', gradient: 'from-fuchsia-400 to-fuchsia-300', icon: Footprints }
}

// CARDIO - Teal/Orange/Blue Theme
export const CARDIO_CONFIG: Record<string, WorkoutStyle> = {
  cycle: {
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    gradient: 'from-teal-500 to-teal-400',
    icon: Bicycle
  },
  run: {
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    gradient: 'from-orange-500 to-orange-400',
    icon: Lightning
  },
  stair_stepper: {
    color: '#D946EF',
    bgColor: 'rgba(217, 70, 239, 0.15)',
    gradient: 'from-fuchsia-500 to-fuchsia-400',
    icon: TrendUp
  },
  swim: {
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    gradient: 'from-cyan-500 to-cyan-400',
    icon: Waves
  },
  rower: {
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    gradient: 'from-blue-500 to-blue-400',
    icon: Waves
  },
  boxing: {
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.15)',
    gradient: 'from-red-600 to-red-500',
    icon: Sword
  }
}

// MOBILITY - Green/Teal Theme
export const MOBILITY_CONFIG: Record<string, WorkoutStyle> = {
  core: {
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    gradient: 'from-emerald-500 to-emerald-400',
    icon: Target
  },
  hip_knee_ankle: {
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    gradient: 'from-teal-500 to-teal-400',
    icon: FlowArrow
  },
  spine: {
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    gradient: 'from-green-500 to-green-400',
    icon: Heartbeat
  },
  shoulder_elbow_wrist: {
    color: '#84CC16',
    bgColor: 'rgba(132, 204, 22, 0.15)',
    gradient: 'from-lime-500 to-lime-400',
    icon: Wind
  },
  recovery: {
    color: '#F472B6',
    bgColor: 'rgba(244, 114, 182, 0.15)',
    gradient: 'from-pink-400 to-pink-300',
    icon: Heart
  },
  shoulder_prehab: {
    color: '#818CF8',
    bgColor: 'rgba(129, 140, 248, 0.15)',
    gradient: 'from-indigo-400 to-indigo-300',
    icon: Shield
  }
}

// Category defaults — matched to design system workout type colors
export const CATEGORY_DEFAULTS: Record<string, WorkoutStyle> = {
  weights: {
    color: '#5B5DF0',
    bgColor: 'rgba(91, 93, 240, 0.12)',
    gradient: 'from-indigo-500 to-indigo-400',
    icon: Barbell
  },
  cardio: {
    color: '#E63B57',
    bgColor: 'rgba(230, 59, 87, 0.12)',
    gradient: 'from-rose-500 to-rose-400',
    icon: Lightning
  },
  mobility: {
    color: '#00C261',
    bgColor: 'rgba(0, 194, 97, 0.12)',
    gradient: 'from-emerald-500 to-green-500',
    icon: Heartbeat
  }
}

// Category display labels - Title Case for consistent UI
// These are the canonical display names for workout categories
export const CATEGORY_LABELS: Record<string, string> = {
  weights: 'Weights',
  cardio: 'Cardio',
  mobility: 'Mobility',
  rest: 'Rest Day'
}

// Centralized workout display names
// Maps database workout names (or patterns) to simplified display names
// This is the single source of truth for how workouts appear in the UI
export const WORKOUT_DISPLAY_NAMES: Record<string, string> = {
  // Weights workouts - map full DB names to simple names
  'push': 'Push',
  'pull': 'Pull',
  'legs': 'Legs',
  'upper': 'Upper',
  'lower': 'Lower',
  'full body a': 'Full Body A',
  'full body b': 'Full Body B',
  'full body c': 'Full Body C',
  'full body d': 'Full Body D',
  'full body e': 'Full Body E',
  'chest': 'Chest',
  'back': 'Back',
  'shoulders': 'Shoulders',
  'arms': 'Arms',
  'chest & back': 'Chest & Back',
  'shoulders & arms': 'Shoulders & Arms',
  'lower a': 'Lower A',
  'upper a': 'Upper A',
  'lower b': 'Lower B',
  'upper b': 'Upper B',
  'lower c': 'Lower C',

  // Cardio workouts
  'cycling': 'Cycling',
  'running': 'Running',
  'stair stepper': 'Stair Stepper',
  'swimming': 'Swimming',
  'rower': 'Rower',
  'boxing': 'Boxing',

  // Mobility workouts
  'core stability': 'Core Stability',
  'hip, knee & ankle flow': 'Hip, Knee & Ankle Flow',
  'spine mobility': 'Spine Mobility',
  'upper body flow': 'Upper Body Flow',
  'full body recovery': 'Full Body Recovery',
  'shoulder prehab': 'Shoulder Prehab'
}

/**
 * Gets the display name for a workout from the database name.
 * This is the central function for converting database workout names to UI display names.
 *
 * Examples:
 * - "PUSH (Chest, Shoulders, Triceps)" → "Push"
 * - "Pull (Back, Biceps, Rear Delts)" → "Pull"
 * - "LEGS (Quads, Hamstrings, Calves)" → "Legs"
 * - "Cycling" → "Cycling"
 */
export function getWorkoutDisplayName(dbName: string | null | undefined): string {
  if (!dbName) return 'Workout'

  // Check full name (lowercase) first for multi-word matches like "Chest & Back"
  const lowerName = dbName.toLowerCase().trim()
  if (WORKOUT_DISPLAY_NAMES[lowerName]) {
    return WORKOUT_DISPLAY_NAMES[lowerName]
  }

  // Extract text before parenthesis for names like "Lower A (Glutes & Hamstrings)"
  const beforeParen = lowerName.split('(')[0].trim()
  if (beforeParen !== lowerName && WORKOUT_DISPLAY_NAMES[beforeParen]) {
    return WORKOUT_DISPLAY_NAMES[beforeParen]
  }

  // Extract the first word before any parenthesis or description
  const firstWord = dbName.split(/[\s(]/)[0].toLowerCase()

  // Check if we have a mapped display name for the first word
  if (WORKOUT_DISPLAY_NAMES[firstWord]) {
    return WORKOUT_DISPLAY_NAMES[firstWord]
  }

  // Fallback: return the first word in Title Case
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1)
}

const WORKOUT_SHORT_NAMES: Record<string, string> = {
  'Full Body A': 'FB A',
  'Full Body B': 'FB B',
  'Full Body C': 'FB C',
  'Full Body D': 'FB D',
  'Full Body E': 'FB E',
  'Full Body Recovery': 'FB Rec',
  'Core Stability': 'Core',
  'Chest & Back': 'Ch & Bk',
  'Shoulders & Arms': 'Sh & Ar',
  'Hip, Knee & Ankle Flow': 'Hip Flow',
  'Spine Mobility': 'Spine',
  'Upper Body Flow': 'UB Flow',
  'Shoulder Prehab': 'Sh Prehab',
  'Stair Stepper': 'Stairs',
  'Lower A': 'Low A',
  'Upper A': 'Up A',
  'Lower B': 'Low B',
  'Upper B': 'Up B',
  'Lower C': 'Low C',
}

/** Short label for compact UI (e.g., streak bar). Falls back to display name. */
export function getWorkoutShortName(displayName: string): string {
  return WORKOUT_SHORT_NAMES[displayName] || displayName
}

// Helper to get category display label
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category.toLowerCase()] || category
}

// Helper function to get workout style by name (works for any split)
export function getWeightsStyleByName(dayName: string): WorkoutStyle {
  const lower = dayName.toLowerCase().trim()
  // Direct lookup first (handles "Full Body A", "Chest & Back", etc.)
  if (WEIGHTS_CONFIG[lower]) return WEIGHTS_CONFIG[lower]
  // Extract text before parenthesis for names like "Lower A (Glutes & Hamstrings)"
  const beforeParen = lower.split('(')[0].trim()
  if (beforeParen !== lower && WEIGHTS_CONFIG[beforeParen]) return WEIGHTS_CONFIG[beforeParen]
  // Keyword-based fallback for DB names like "PUSH (Chest, Shoulders, Triceps)"
  if (lower.includes('push')) return WEIGHTS_CONFIG.push
  if (lower.includes('pull')) return WEIGHTS_CONFIG.pull
  if (lower.includes('leg')) return WEIGHTS_CONFIG.legs
  if (lower.includes('upper')) return WEIGHTS_CONFIG.upper
  if (lower.includes('lower')) return WEIGHTS_CONFIG.lower
  return CATEGORY_DEFAULTS.weights
}

// Helper function to get workout style by day number (for weights)
export function getWeightsStyleByDayNumber(dayNumber: number): WorkoutStyle {
  switch (dayNumber) {
    case 1:
      return WEIGHTS_CONFIG.push
    case 2:
      return WEIGHTS_CONFIG.pull
    case 3:
      return WEIGHTS_CONFIG.legs
    default:
      return CATEGORY_DEFAULTS.weights
  }
}

// Helper function to get cardio style by category
export function getCardioStyle(category: string | null): WorkoutStyle {
  if (category && CARDIO_CONFIG[category]) {
    return CARDIO_CONFIG[category]
  }
  return CATEGORY_DEFAULTS.cardio
}

// Helper function to get mobility style by category
export function getMobilityStyle(category: string | null): WorkoutStyle {
  if (category && MOBILITY_CONFIG[category]) {
    return MOBILITY_CONFIG[category]
  }
  return CATEGORY_DEFAULTS.mobility
}

// Helper to get the label for weights by day number
export function getWeightsLabel(dayNumber: number): string {
  switch (dayNumber) {
    case 1:
      return 'Push'
    case 2:
      return 'Pull'
    case 3:
      return 'Legs'
    default:
      return `Day ${dayNumber}`
  }
}
