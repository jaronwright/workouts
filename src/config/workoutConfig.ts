import {
  Dumbbell,
  ArrowDown,
  Footprints,
  Bike,
  Zap,
  TrendingUp,
  Waves,
  Target,
  Workflow,
  Activity,
  Wind,
  type LucideIcon
} from 'lucide-react'

export interface WorkoutStyle {
  color: string
  bgColor: string
  gradient: string
  icon: LucideIcon
}

// WEIGHTS - Red/Orange Theme
export const WEIGHTS_CONFIG: Record<string, WorkoutStyle> = {
  push: {
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    gradient: 'from-red-500 to-rose-500',
    icon: Dumbbell
  },
  pull: {
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    gradient: 'from-orange-500 to-amber-500',
    icon: ArrowDown
  },
  legs: {
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.15)',
    gradient: 'from-red-600 to-red-500',
    icon: Footprints
  }
}

// CARDIO - Pink/Magenta Theme
export const CARDIO_CONFIG: Record<string, WorkoutStyle> = {
  cycle: {
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    gradient: 'from-pink-500 to-pink-400',
    icon: Bike
  },
  run: {
    color: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    gradient: 'from-rose-500 to-rose-400',
    icon: Zap
  },
  stair_stepper: {
    color: '#D946EF',
    bgColor: 'rgba(217, 70, 239, 0.15)',
    gradient: 'from-fuchsia-500 to-fuchsia-400',
    icon: TrendingUp
  },
  swim: {
    color: '#F472B6',
    bgColor: 'rgba(244, 114, 182, 0.15)',
    gradient: 'from-pink-400 to-pink-300',
    icon: Waves
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
    icon: Workflow
  },
  spine: {
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    gradient: 'from-green-500 to-green-400',
    icon: Activity
  },
  shoulder_elbow_wrist: {
    color: '#84CC16',
    bgColor: 'rgba(132, 204, 22, 0.15)',
    gradient: 'from-lime-500 to-lime-400',
    icon: Wind
  }
}

// Category defaults
export const CATEGORY_DEFAULTS: Record<string, WorkoutStyle> = {
  weights: {
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    gradient: 'from-red-500 to-rose-500',
    icon: Dumbbell
  },
  cardio: {
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    gradient: 'from-pink-500 to-rose-500',
    icon: Zap
  },
  mobility: {
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    gradient: 'from-emerald-500 to-green-500',
    icon: Activity
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

// Helper to get category display label
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category.toLowerCase()] || category
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
