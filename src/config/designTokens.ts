/**
 * Design System V5 — Electric Mint Pro
 *
 * Two personalities:
 *   Light mode = "Editorial" — layered grays, colored shadows
 *   Dark mode  = "Cinematic" — neon glow, gradient surfaces
 *
 * Primary: Electric Mint — green = go, movement, progress, vitality
 * Reward Gold: ONLY for achievements (PRs, streaks, milestones)
 *
 * TypeScript constants mirroring the CSS custom properties in index.css.
 * Use these when you need token values in JS/React code (e.g., Framer Motion,
 * inline styles, chart colors). For standard styling, prefer CSS variables.
 */

// ─── COLOR PALETTE ───────────────────────────────

export const colors = {
  // Primary — Electric Mint
  primary: {
    DEFAULT: '#00C261',
    bright: '#00D26A',
    hover: '#00AB56',
    muted: 'rgba(0, 194, 97, 0.10)',
    glow: 'rgba(0, 194, 97, 0.14)',
    text: '#FFFFFF',
  },

  // Primary — Dark mode (Neon Mint)
  primaryDark: {
    DEFAULT: '#00E676',
    bright: '#00FF88',
    hover: '#00F283',
    muted: 'rgba(0, 230, 118, 0.08)',
    glow: 'rgba(0, 230, 118, 0.15)',
    text: '#0A0F0D',
  },

  // Accent — Teal companion
  accent: {
    DEFAULT: '#00A89A',
    hover: '#009488',
    secondary: '#00BDB0',
    muted: 'rgba(0, 168, 154, 0.08)',
  },

  // Reward Gold — achievements ONLY
  reward: {
    DEFAULT: '#D99700',
    bright: '#FFB800',
    muted: 'rgba(217, 151, 0, 0.10)',
    glow: 'rgba(217, 151, 0, 0.12)',
  },

  rewardDark: {
    DEFAULT: '#FFC233',
    bright: '#FFD060',
    muted: 'rgba(255, 194, 51, 0.10)',
    glow: 'rgba(255, 194, 51, 0.12)',
  },

  // Tertiary — matches primary
  tertiary: {
    DEFAULT: '#00C261',
    hover: '#00AB56',
    muted: 'rgba(0, 194, 97, 0.10)',
  },

  // Workout Types
  workout: {
    weights: '#5B5DF0',
    weightsMuted: 'rgba(91, 93, 240, 0.09)',
    cardio: '#E63B57',
    cardioMuted: 'rgba(230, 59, 87, 0.08)',
    mobility: '#00C261',
    mobilityMuted: 'rgba(0, 194, 97, 0.08)',
  },

  workoutDark: {
    weights: '#818CF8',
    weightsMuted: 'rgba(129, 140, 248, 0.10)',
    cardio: '#FB7185',
    cardioMuted: 'rgba(251, 113, 133, 0.08)',
    mobility: '#00E676',
    mobilityMuted: 'rgba(0, 230, 118, 0.07)',
  },

  // Backgrounds & Surfaces — Light (three-tier system)
  light: {
    background: '#ECEEF2',
    surface: '#F7F8FA',
    surfaceElevated: '#FFFFFF',
    surfaceHover: '#EAEBEF',
    surfaceSunken: '#E3E5EA',
    border: 'rgba(17, 19, 24, 0.08)',
    borderStrong: 'rgba(17, 19, 24, 0.14)',
    text: '#111318',
    textSecondary: '#484D5C',
    textMuted: '#6E7487',
  },

  // Backgrounds & Surfaces — Dark (cool steel)
  dark: {
    background: '#0B0D10',
    surface: '#13161B',
    surfaceElevated: '#1B1F26',
    surfaceHover: '#242930',
    surfaceSunken: '#070809',
    border: 'rgba(236, 240, 245, 0.05)',
    borderStrong: 'rgba(236, 240, 245, 0.08)',
    text: '#ECF0F5',
    textSecondary: '#8B93A6',
    textMuted: '#5A6278',
  },

  // Status
  status: {
    success: '#00C261',
    successMuted: 'rgba(0, 194, 97, 0.10)',
    warning: '#D99700',
    warningMuted: 'rgba(217, 151, 0, 0.10)',
    danger: '#E63B57',
    dangerMuted: 'rgba(230, 59, 87, 0.10)',
    info: '#5B5DF0',
    infoMuted: 'rgba(91, 93, 240, 0.10)',
  },

  // Heatmap intensity levels
  heatmap: {
    low: 'rgba(0, 194, 97, 0.25)',
    mid: 'rgba(0, 194, 97, 0.50)',
    high: 'rgba(0, 194, 97, 0.80)',
  },

  heatmapDark: {
    low: 'rgba(0, 230, 118, 0.25)',
    mid: 'rgba(0, 230, 118, 0.50)',
    high: 'rgba(0, 230, 118, 0.80)',
  },

  statusDark: {
    success: '#00E676',
    successMuted: 'rgba(0, 230, 118, 0.10)',
    warning: '#FBBF24',
    warningMuted: 'rgba(255, 187, 36, 0.10)',
    danger: '#FB7185',
    dangerMuted: 'rgba(251, 113, 133, 0.10)',
    info: '#818CF8',
    infoMuted: 'rgba(129, 140, 248, 0.10)',
  },
} as const

// ─── TYPOGRAPHY ──────────────────────────────────

export const typography = {
  fonts: {
    heading: "'Syne', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  scale: {
    xs: '0.75rem',     // 12px — caption
    sm: '0.875rem',    // 14px — small
    base: '1rem',      // 16px — default body
    lg: '1.375rem',    // 22px — subheading
    xl: '1.375rem',    // 22px
    '2xl': '1.75rem',  // 28px — section heading
    '3xl': '2.25rem',  // 36px — page heading
    '4xl': '3rem',     // 48px — hero/display
    '5xl': '3.75rem',  // 60px — editorial
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.65,
  },

  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.04em',
    wider: '0.08em',
    widest: '0.12em',
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const

// ─── SPACING (4px base grid) ─────────────────────

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

// ─── BORDER RADIUS ───────────────────────────────

export const radius = {
  none: '0px',
  sm: '8px',       // buttons, badges
  md: '12px',      // cards, inputs
  lg: '20px',      // modals, sheets
  xl: '20px',
  '2xl': '20px',
  full: '9999px',  // avatars, pills
} as const

// ─── SHADOWS ─────────────────────────────────────

export const shadows = {
  xs: '0 1px 2px rgba(17, 19, 24, 0.04)',
  sm: '0 1px 2px rgba(17, 19, 24, 0.06)',
  md: '0 4px 12px rgba(17, 19, 24, 0.08)',
  lg: '0 8px 24px rgba(17, 19, 24, 0.10)',
  xl: '0 16px 48px rgba(17, 19, 24, 0.14)',
  card: '0 1px 3px rgba(17,19,24,0.04), 0 4px 16px rgba(17,19,24,0.05)',
  primary: '0 2px 8px rgba(0,194,97,0.18), 0 4px 20px rgba(0,194,97,0.12)',
  reward: '0 2px 8px rgba(217,151,0,0.15), 0 4px 16px rgba(217,151,0,0.10)',
  elevated: '0 4px 12px rgba(17,19,24,0.06), 0 12px 40px rgba(17,19,24,0.08)',
  accent: '0 4px 24px rgba(0, 168, 154, 0.12)',
} as const

export const shadowsDark = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.25)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.30)',
  md: '0 4px 12px rgba(0, 0, 0, 0.40)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.50)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.60)',
  card: '0 2px 4px rgba(0,0,0,0.20), 0 8px 32px rgba(0,0,0,0.25)',
  primary: '0 4px 24px rgba(0,230,118,0.15), 0 1px 3px rgba(0,0,0,0.3)',
  reward: '0 4px 24px rgba(255,194,51,0.12), 0 1px 3px rgba(0,0,0,0.3)',
  elevated: '0 8px 32px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
  accent: '0 4px 24px rgba(0, 212, 200, 0.10)',
} as const

// ─── GRADIENTS ───────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #00C261 0%, #00A89A 100%)',
  primaryDark: 'linear-gradient(135deg, #00E676 0%, #00D4C8 100%)',
  reward: 'linear-gradient(135deg, #FFB800 0%, #FF9500 100%)',
  rewardDark: 'linear-gradient(135deg, #FFC233 0%, #FFB800 100%)',
  accent: 'linear-gradient(135deg, #00C261 0%, #00A89A 100%)',
  hero: 'linear-gradient(135deg, #0B0D10 0%, #13161B 50%, #1B1F26 100%)',
  heroDark: 'linear-gradient(135deg, #0B0D10 0%, #13161B 50%, #1B1F26 100%)',
  surface: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)',
  surfaceDark: 'linear-gradient(170deg, #1B1F26 0%, #13161B 100%)',
  warmGlow: 'radial-gradient(ellipse at 50% 0%, rgba(0, 194, 97, 0.06) 0%, transparent 70%)',
  warmGlowDark: 'radial-gradient(ellipse at 50% 0%, rgba(0, 230, 118, 0.06) 0%, transparent 70%)',
} as const

// ─── TRANSITIONS ─────────────────────────────────

export const transitions = {
  duration: {
    fast: '100ms',
    normal: '200ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

// ─── GLASS EFFECTS ───────────────────────────────

export const glass = {
  light: {
    background: 'rgba(247, 248, 250, 0.82)',
    border: 'rgba(17, 19, 24, 0.06)',
    blur: '24px',
  },
  dark: {
    background: 'rgba(19, 22, 27, 0.78)',
    border: 'rgba(236, 240, 245, 0.05)',
    blur: '24px',
  },
} as const
