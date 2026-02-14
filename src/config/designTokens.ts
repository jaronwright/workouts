/**
 * Design System V3 — Warm Brutalist Luxury
 *
 * Aesthetic: Obsidian & Firelight
 * "A premium private gym at midnight meets a high-end Japanese whisky bar."
 *
 * TypeScript constants mirroring the CSS custom properties in index.css.
 * Use these when you need token values in JS/React code (e.g., Framer Motion,
 * inline styles, chart colors). For standard styling, prefer CSS variables.
 */

// ─── COLOR PALETTE ───────────────────────────────

export const colors = {
  // Primary — Burnt Ember (ONE sacred accent color)
  primary: {
    DEFAULT: '#E85D2C',
    hover: '#D4511F',
    muted: 'rgba(232, 93, 44, 0.12)',
    text: '#FFFFFF', // white text on ember
  },

  // Accent — Molten Gold (secondary, use sparingly)
  accent: {
    DEFAULT: '#D4A84B',
    hover: '#C49A3D',
    secondary: '#E0BD6F',
    muted: 'rgba(212, 168, 75, 0.12)',
  },

  // Tertiary — Warm Sage
  tertiary: {
    DEFAULT: '#7C9F6B',
    hover: '#6B8E5A',
    muted: 'rgba(124, 159, 107, 0.10)',
  },

  // Workout Types (warm-toned)
  workout: {
    weights: '#5B8DEF',
    weightsMuted: 'rgba(91, 141, 239, 0.12)',
    cardio: '#E8536A',
    cardioMuted: 'rgba(232, 83, 106, 0.12)',
    mobility: '#6BAE7C',
    mobilityMuted: 'rgba(107, 174, 124, 0.10)',
  },

  // Backgrounds & Surfaces — Light (warm cream)
  light: {
    background: '#F5F0EB',
    surface: '#FDFBF8',
    surfaceElevated: '#FFFFFF',
    surfaceHover: '#EDE8E2',
    surfaceSunken: '#E8E2DB',
    border: 'rgba(13, 10, 7, 0.08)',
    borderStrong: 'rgba(13, 10, 7, 0.15)',
    text: '#1A1512',
    textSecondary: '#4A4035',
    textMuted: '#8A7E73',
  },

  // Backgrounds & Surfaces — Dark (warm near-blacks with brown/amber undertone)
  dark: {
    background: '#0D0A07',
    surface: '#1A1512',
    surfaceElevated: '#231F1A',
    surfaceHover: '#2C2620',
    surfaceSunken: '#0A0806',
    border: 'rgba(245, 240, 235, 0.07)',
    borderStrong: 'rgba(245, 240, 235, 0.12)',
    text: '#F5F0EB',
    textSecondary: '#A09890',
    textMuted: '#706860',
  },

  // Status (warm-toned)
  status: {
    success: '#7CC08C',        // Warm sage green
    successMuted: 'rgba(124, 192, 140, 0.10)',
    warning: '#D4A84B',        // Molten gold
    warningMuted: 'rgba(212, 168, 75, 0.12)',
    danger: '#C45543',         // Warm terracotta
    dangerMuted: 'rgba(196, 85, 67, 0.12)',
    info: '#5B8DEF',           // Warm blue
    infoMuted: 'rgba(91, 141, 239, 0.10)',
  },
} as const

// ─── TYPOGRAPHY ──────────────────────────────────

export const typography = {
  fonts: {
    heading: "'Syne', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Modular scale (1.25 ratio) — headings are DRAMATICALLY larger
  scale: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.25rem',     // 20px
    xl: '1.5rem',      // 24px
    '2xl': '1.75rem',  // 28px
    '3xl': '2.25rem',  // 36px
    '4xl': '3rem',     // 48px — hero size
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
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const

// ─── SHADOWS (warm-toned) ────────────────────────

export const shadows = {
  xs: '0 1px 2px rgba(13, 10, 7, 0.05)',
  sm: '0 2px 8px rgba(13, 10, 7, 0.07), 0 1px 2px rgba(13, 10, 7, 0.04)',
  md: '0 4px 16px rgba(13, 10, 7, 0.09), 0 2px 4px rgba(13, 10, 7, 0.05)',
  lg: '0 8px 32px rgba(13, 10, 7, 0.12), 0 4px 8px rgba(13, 10, 7, 0.06)',
  xl: '0 16px 48px rgba(13, 10, 7, 0.16), 0 8px 16px rgba(13, 10, 7, 0.08)',
  primary: '0 4px 24px rgba(232, 93, 44, 0.20)',
  accent: '0 4px 24px rgba(212, 168, 75, 0.20)',
} as const

export const shadowsDark = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.30)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.40), 0 1px 2px rgba(0, 0, 0, 0.30)',
  md: '0 4px 16px rgba(0, 0, 0, 0.50), 0 2px 4px rgba(0, 0, 0, 0.35)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.60), 0 4px 8px rgba(0, 0, 0, 0.40)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.70), 0 8px 16px rgba(0, 0, 0, 0.50)',
  primary: '0 4px 24px rgba(232, 93, 44, 0.20), 0 0 60px rgba(232, 93, 44, 0.06)',
  accent: '0 4px 24px rgba(212, 168, 75, 0.15)',
} as const

// ─── GRADIENTS ───────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #E85D2C 0%, #D4511F 100%)',
  accent: 'linear-gradient(135deg, #E85D2C 0%, #D4A84B 100%)',
  hero: 'linear-gradient(135deg, #1A1512 0%, #231F1A 50%, #1A1512 100%)',
  warmGlow: 'radial-gradient(ellipse at 50% 0%, rgba(232, 93, 44, 0.06) 0%, transparent 70%)',
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
    background: 'rgba(253, 251, 248, 0.88)',
    border: 'rgba(13, 10, 7, 0.06)',
    blur: '16px',
  },
  dark: {
    background: 'rgba(26, 21, 18, 0.90)',
    border: 'rgba(245, 240, 235, 0.05)',
    blur: '16px',
  },
} as const
