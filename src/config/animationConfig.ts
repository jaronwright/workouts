import type { Transition, Variants } from 'motion/react'

// ─── New Motion System ─────────────────────────────────────────────────────────

// Spring presets (expanded set for the new design system)
export const springPresets = {
  snappy: { type: 'spring', stiffness: 500, damping: 30 } as const,
  smooth: { type: 'spring', stiffness: 300, damping: 30 } as const,
  bouncy: { type: 'spring', stiffness: 400, damping: 15 } as const,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as const,
  molasses: { type: 'spring', stiffness: 120, damping: 20 } as const,
} as const

export type SpringPreset = typeof springPresets[keyof typeof springPresets]

// Duration tokens (seconds)
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  glacial: 0.8,
} as const

// Stagger timing tokens (seconds)
export const stagger = {
  tight: 0.03,
  normal: 0.06,
  relaxed: 0.1,
  dramatic: 0.15,
} as const

// ─── Backward-Compatible Exports ───────────────────────────────────────────────
// These preserve the exact values that existing components and tests depend on.

// Spring configurations (original 4 presets — used by review components, tests)
export const springs = {
  default: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  snappy: { type: 'spring', stiffness: 400, damping: 28 } as Transition,
  slow: { type: 'spring', stiffness: 150, damping: 20 } as Transition,
}

// Alias for discoverability
export const springConfigs = springs

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
}

// Stagger container variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

// Stagger child variants
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Additional backward-compatible variant aliases
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.smooth,
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springPresets.smooth,
  },
}

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springPresets.smooth,
  },
}
