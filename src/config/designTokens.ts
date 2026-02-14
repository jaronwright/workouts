/**
 * Design System V2 — Premium Fitness Brand
 *
 * TypeScript constants mirroring the CSS custom properties in index.css.
 * Use these when you need token values in JS/React code (e.g., Framer Motion,
 * inline styles, chart colors). For standard styling, prefer CSS variables.
 */

// ─── COLOR PALETTE ───────────────────────────────

export const colors = {
  // Primary — Electric Lime
  primary: {
    DEFAULT: '#CCFF00',
    hover: '#B8E600',
    muted: 'rgba(204, 255, 0, 0.15)',
    text: '#0D0D0F', // dark text on lime
  },

  // Secondary — Warm Ember
  accent: {
    DEFAULT: '#FF6B35',
    hover: '#E85D2C',
    secondary: '#FF8F65',
    muted: 'rgba(255, 107, 53, 0.12)',
  },

  // Tertiary — Cool Teal
  tertiary: {
    DEFAULT: '#4ECDC4',
    hover: '#3DBDB4',
    muted: 'rgba(78, 205, 196, 0.12)',
  },

  // Workout Types
  workout: {
    weights: '#3B82F6',
    weightsMuted: 'rgba(59, 130, 246, 0.12)',
    cardio: '#FF3366',
    cardioMuted: 'rgba(255, 51, 102, 0.12)',
    mobility: '#34D399',
    mobilityMuted: 'rgba(52, 211, 153, 0.12)',
  },

  // Backgrounds & Surfaces — Light
  light: {
    background: '#F7F7F8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceHover: '#F0F0F2',
    surfaceSunken: '#EDEDF0',
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.14)',
    text: '#0D0D0F',
    textSecondary: '#3A3A40',
    textMuted: '#71717A',
  },

  // Backgrounds & Surfaces — Dark (warm blacks)
  dark: {
    background: '#0D0D0F',
    surface: '#1A1A1F',
    surfaceElevated: '#252529',
    surfaceHover: '#2A2A30',
    surfaceSunken: '#111113',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.14)',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
  },

  // Status
  status: {
    success: '#22C55E',
    successMuted: 'rgba(34, 197, 94, 0.12)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.12)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239, 68, 68, 0.12)',
    info: '#3B82F6',
    infoMuted: 'rgba(59, 130, 246, 0.12)',
  },
} as const

// ─── TYPOGRAPHY ──────────────────────────────────

export const typography = {
  fonts: {
    heading: "'Syne', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  scale: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.65,
  },

  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.04em',
    widest: '0.08em',
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
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const

// ─── SHADOWS ─────────────────────────────────────

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.06)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.14), 0 8px 16px rgba(0, 0, 0, 0.08)',
  primary: '0 4px 24px rgba(204, 255, 0, 0.20)',
  accent: '0 4px 24px rgba(255, 107, 53, 0.20)',
} as const

export const shadowsDark = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.20)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.30), 0 1px 2px rgba(0, 0, 0, 0.25)',
  md: '0 4px 16px rgba(0, 0, 0, 0.40), 0 2px 4px rgba(0, 0, 0, 0.30)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.50), 0 4px 8px rgba(0, 0, 0, 0.35)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.60), 0 8px 16px rgba(0, 0, 0, 0.40)',
  primary: '0 4px 24px rgba(204, 255, 0, 0.15)',
  accent: '0 4px 24px rgba(255, 107, 53, 0.15)',
} as const

// ─── GRADIENTS ───────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 100%)',
  accent: 'linear-gradient(135deg, #FF6B35 0%, #FF3366 100%)',
  hero: 'linear-gradient(135deg, #0D0D0F 0%, #1A1A1F 50%, #252529 100%)',
  heroDark: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 50%, #A3CC00 100%)',
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
    background: 'rgba(255, 255, 255, 0.88)',
    border: 'rgba(0, 0, 0, 0.06)',
    blur: '16px',
  },
  dark: {
    background: 'rgba(26, 26, 31, 0.88)',
    border: 'rgba(255, 255, 255, 0.06)',
    blur: '16px',
  },
} as const
