/**
 * Design System V4 — Electric Volt
 *
 * Aesthetic: Highlighter on dark paper. Nike Volt energy.
 * "Electric yellow pops BECAUSE it's rare — used only for primary CTAs,
 * active states, and key data highlights."
 *
 * TypeScript constants mirroring the CSS custom properties in index.css.
 * Use these when you need token values in JS/React code (e.g., Framer Motion,
 * inline styles, chart colors). For standard styling, prefer CSS variables.
 */

// ─── COLOR PALETTE ───────────────────────────────

export const colors = {
  // Primary — Electric Yellow (volt) — the ONE sacred accent
  primary: {
    DEFAULT: '#E8FF00',
    hover: '#D4EB00',
    muted: 'rgba(232, 255, 0, 0.10)',
    text: '#0A0A0A', // black text on yellow for contrast
  },

  // Accent — Warm Gold (secondary, sparingly)
  accent: {
    DEFAULT: '#D4A84B',
    hover: '#C49A3D',
    secondary: '#E0BD6F',
    muted: 'rgba(212, 168, 75, 0.12)',
  },

  // Tertiary — Success Green
  tertiary: {
    DEFAULT: '#4ADE80',
    hover: '#3CC970',
    muted: 'rgba(74, 222, 128, 0.10)',
  },

  // Workout Types
  workout: {
    weights: '#60A5FA',
    weightsMuted: 'rgba(96, 165, 250, 0.12)',
    cardio: '#EF4444',
    cardioMuted: 'rgba(239, 68, 68, 0.12)',
    mobility: '#4ADE80',
    mobilityMuted: 'rgba(74, 222, 128, 0.10)',
  },

  // Backgrounds & Surfaces — Light
  light: {
    background: '#F2F2ED',
    surface: '#FAFAF7',
    surfaceElevated: '#FFFFFF',
    surfaceHover: '#EBEBE6',
    surfaceSunken: '#E5E5E0',
    border: 'rgba(10, 10, 10, 0.08)',
    borderStrong: 'rgba(10, 10, 10, 0.15)',
    text: '#0A0A0A',
    textSecondary: '#5A5A5A',
    textMuted: '#8A8A8A',
  },

  // Backgrounds & Surfaces — Dark (near-blacks, slightly warm)
  dark: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1E1E1E',
    surfaceHover: '#282828',
    surfaceSunken: '#050505',
    border: 'rgba(240, 240, 240, 0.07)',
    borderStrong: 'rgba(240, 240, 240, 0.12)',
    text: '#F0F0F0',
    textSecondary: '#8A8A8A',
    textMuted: '#5A5A5A',
  },

  // Status
  status: {
    success: '#4ADE80',
    successMuted: 'rgba(74, 222, 128, 0.10)',
    warning: '#FACC15',
    warningMuted: 'rgba(250, 204, 21, 0.12)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239, 68, 68, 0.12)',
    info: '#60A5FA',
    infoMuted: 'rgba(96, 165, 250, 0.10)',
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
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
  md: '0 4px 12px rgba(0, 0, 0, 0.10)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.16)',
  primary: '0 0 20px rgba(232, 255, 0, 0.10)',
  accent: '0 4px 24px rgba(212, 168, 75, 0.15)',
} as const

export const shadowsDark = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.30)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.30)',
  md: '0 4px 12px rgba(0, 0, 0, 0.40)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.50)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.60)',
  primary: '0 0 20px rgba(232, 255, 0, 0.15)',
  accent: '0 4px 24px rgba(212, 168, 75, 0.15)',
} as const

// ─── GRADIENTS ───────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #E8FF00 0%, #D4EB00 100%)',
  accent: 'linear-gradient(135deg, #E8FF00 0%, #D4A84B 100%)',
  hero: 'linear-gradient(135deg, #141414 0%, #1E1E1E 50%, #141414 100%)',
  warmGlow: 'radial-gradient(ellipse at 50% 0%, rgba(232, 255, 0, 0.05) 0%, transparent 70%)',
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
    background: 'rgba(250, 250, 247, 0.88)',
    border: 'rgba(10, 10, 10, 0.06)',
    blur: '16px',
  },
  dark: {
    background: 'rgba(20, 20, 20, 0.90)',
    border: 'rgba(240, 240, 240, 0.05)',
    blur: '16px',
  },
} as const
