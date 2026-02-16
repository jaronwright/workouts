# Electric Mint Pro — Implementation Prompt for Claude Code

Copy everything below this line and paste it into Claude Code:

---

## Task

Implement the "Electric Mint Pro" color system across the entire app. Update `src/index.css` (CSS custom properties), `src/config/designTokens.ts` (TypeScript constants), and all components that use hardcoded colors. The design system has TWO distinct personalities: **light mode = "Editorial"** (layered grays, colored shadows) and **dark mode = "Cinematic"** (neon glow, gradient surfaces).

## Design Philosophy

- **Primary: Electric Mint** — green = go, movement, progress, vitality
- **Reward Gold** — ONLY appears for achievements (PRs, streaks, milestones). Never in normal UI. This creates a Pavlovian color reward system.
- **Dark mode: Neon glow** — primary elements emit soft green light via box-shadow/text-shadow
- **Light mode: Colored shadows** — primary elements cast green-tinted drop shadows, reward elements cast amber shadows. This is the light-mode equivalent of glow.
- **Gradient primary** — CTAs use green→teal gradient, not flat color
- **Glass morphism** — bottom nav uses backdrop-filter blur
- **Three-tier light surfaces** — gray bg → off-white surface → true white elevated
- **Cool steel darks** — subtle blue undertone in dark surfaces

## Exact Color Values

### LIGHT MODE

```
/* ── Primary ── */
--color-primary: #00C261;
--color-primary-bright: #00D26A;
--color-primary-hover: #00AB56;
--color-primary-text: #FFFFFF;       /* white text ON green */
--color-primary-muted: rgba(0, 194, 97, 0.10);
--color-primary-glow: rgba(0, 194, 97, 0.14);  /* colored shadow in light mode */

/* ── Accent (Teal companion) ── */
--color-accent: #00A89A;
--color-accent-muted: rgba(0, 168, 154, 0.08);

/* ── Reward Gold (achievements ONLY) ── */
--color-reward: #D99700;             /* deeper for text on white */
--color-reward-bright: #FFB800;      /* for fills/gradients only */
--color-reward-muted: rgba(217, 151, 0, 0.10);
--color-reward-glow: rgba(217, 151, 0, 0.12);

/* ── Workout Types ── */
--color-weights: #5B5DF0;            /* deep indigo */
--color-weights-muted: rgba(91, 93, 240, 0.09);
--color-cardio: #E63B57;             /* deep rose */
--color-cardio-muted: rgba(230, 59, 87, 0.08);
--color-mobility: #00C261;           /* matches primary */
--color-mobility-muted: rgba(0, 194, 97, 0.08);

/* ── Surfaces (THREE-TIER SYSTEM) ── */
--color-background: #ECEEF2;         /* cool gray canvas */
--color-surface: #F7F8FA;            /* off-white cards */
--color-surface-elevated: #FFFFFF;   /* true white — modals, popovers */
--color-surface-hover: #EAEBEF;
--color-surface-sunken: #E3E5EA;     /* inputs, recessed areas */

/* ── Text ── */
--color-text: #111318;
--color-text-secondary: #484D5C;
--color-text-muted: #6E7487;
--color-text-inverse: #ECF0F5;

/* ── Borders ── */
--color-border: rgba(17, 19, 24, 0.08);
--color-border-strong: rgba(17, 19, 24, 0.14);

/* ── Shadows (COLORED — light mode signature) ── */
--shadow-card: 0 1px 3px rgba(17,19,24,0.04), 0 4px 16px rgba(17,19,24,0.05);
--shadow-primary: 0 2px 8px rgba(0,194,97,0.18), 0 4px 20px rgba(0,194,97,0.12);
--shadow-reward: 0 2px 8px rgba(217,151,0,0.15), 0 4px 16px rgba(217,151,0,0.10);
--shadow-elevated: 0 4px 12px rgba(17,19,24,0.06), 0 12px 40px rgba(17,19,24,0.08);

/* ── Gradients ── */
--gradient-primary: linear-gradient(135deg, #00C261 0%, #00A89A 100%);
--gradient-reward: linear-gradient(135deg, #FFB800 0%, #FF9500 100%);
--gradient-surface: linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%);

/* ── Glass ── */
--glass-bg: rgba(247, 248, 250, 0.82);
--glass-border: rgba(17, 19, 24, 0.06);
--glass-blur: 24px;

/* ── Status ── */
--color-success: #00C261;
--color-success-muted: rgba(0, 194, 97, 0.10);
--color-warning: #D99700;
--color-warning-muted: rgba(217, 151, 0, 0.10);
--color-danger: #E63B57;
--color-danger-muted: rgba(230, 59, 87, 0.10);
--color-info: #5B5DF0;
--color-info-muted: rgba(91, 93, 240, 0.10);
```

### DARK MODE (`.dark`)

```
/* ── Primary ── */
--color-primary: #00E676;
--color-primary-bright: #00FF88;
--color-primary-hover: #00F283;
--color-primary-text: #0A0F0D;       /* near-black text ON green */
--color-primary-muted: rgba(0, 230, 118, 0.08);
--color-primary-glow: rgba(0, 230, 118, 0.15);  /* NEON GLOW */

/* ── Accent ── */
--color-accent: #00D4C8;
--color-accent-muted: rgba(0, 212, 200, 0.07);

/* ── Reward Gold ── */
--color-reward: #FFC233;
--color-reward-bright: #FFD060;
--color-reward-muted: rgba(255, 194, 51, 0.10);
--color-reward-glow: rgba(255, 194, 51, 0.12);

/* ── Workout Types ── */
--color-weights: #818CF8;            /* soft indigo */
--color-weights-muted: rgba(129, 140, 248, 0.10);
--color-cardio: #FB7185;             /* soft rose */
--color-cardio-muted: rgba(251, 113, 133, 0.08);
--color-mobility: #00E676;
--color-mobility-muted: rgba(0, 230, 118, 0.07);

/* ── Surfaces (cool steel — subtle blue undertone) ── */
--color-background: #0B0D10;
--color-surface: #13161B;
--color-surface-elevated: #1B1F26;
--color-surface-hover: #242930;
--color-surface-sunken: #070809;

/* ── Text ── */
--color-text: #ECF0F5;
--color-text-secondary: #8B93A6;
--color-text-muted: #5A6278;
--color-text-inverse: #111318;

/* ── Borders ── */
--color-border: rgba(236, 240, 245, 0.05);
--color-border-strong: rgba(236, 240, 245, 0.08);

/* ── Shadows (NEON — dark mode signature) ── */
--shadow-card: 0 2px 4px rgba(0,0,0,0.20), 0 8px 32px rgba(0,0,0,0.25);
--shadow-primary: 0 4px 24px rgba(0,230,118,0.15), 0 1px 3px rgba(0,0,0,0.3);
--shadow-reward: 0 4px 24px rgba(255,194,51,0.12), 0 1px 3px rgba(0,0,0,0.3);
--shadow-elevated: 0 8px 32px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);

/* ── Gradients ── */
--gradient-primary: linear-gradient(135deg, #00E676 0%, #00D4C8 100%);
--gradient-reward: linear-gradient(135deg, #FFC233 0%, #FFB800 100%);
--gradient-surface: linear-gradient(170deg, #1B1F26 0%, #13161B 100%);

/* ── Glass ── */
--glass-bg: rgba(19, 22, 27, 0.78);
--glass-border: rgba(236, 240, 245, 0.05);
--glass-blur: 24px;

/* ── Status ── */
--color-success: #00E676;
--color-success-muted: rgba(0, 230, 118, 0.10);
--color-warning: #FBBF24;
--color-warning-muted: rgba(255, 187, 36, 0.10);
--color-danger: #FB7185;
--color-danger-muted: rgba(251, 113, 133, 0.10);
--color-info: #818CF8;
--color-info-muted: rgba(129, 140, 248, 0.10);
```

## Implementation Steps

1. **Update `src/index.css`**: Replace ALL existing CSS custom properties in both `:root` (light) and `.dark` blocks with the values above. Add the NEW tokens that don't exist yet: `--color-reward`, `--color-reward-bright`, `--color-reward-muted`, `--color-reward-glow`, `--color-primary-bright`, `--color-primary-glow`, `--color-surface-sunken`, `--shadow-card`, `--shadow-primary`, `--shadow-reward`, `--shadow-elevated`, `--gradient-primary`, `--gradient-reward`, `--gradient-surface`, `--glass-bg`, `--glass-border`, `--glass-blur`.

2. **Update `src/config/designTokens.ts`**: Mirror ALL CSS changes as TypeScript constants. Add new `reward` color group, new `shadows` and `shadowsDark` entries for card/primary/reward/elevated, new `gradients` entries, update `glass` object.

3. **Replace hardcoded colors**: Search the entire codebase for any hardcoded hex values (#6B7280, #e5e7eb, #EF4444, etc.) and replace with the appropriate CSS variable. Key files: `CalendarDayCell.tsx`, `OnboardingDayRow.tsx`, `AnimatedProgress.tsx`, `UvIndexChart.tsx`, `PRCelebration.tsx`.

4. **Apply gradient primary to CTA buttons**: All primary action buttons should use `background: var(--gradient-primary)` instead of `background: var(--color-primary)`. Apply `box-shadow: var(--shadow-primary)` to primary buttons.

5. **Apply neon glow in dark mode**: Primary stat numbers, active nav icons, and high-intensity heatmap cells should get `text-shadow: 0 0 12px var(--color-primary-glow)` in dark mode. The `.dark` class is on the root element.

6. **Apply glass morphism to bottom nav**: The bottom navigation should use `background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)) saturate(180%); border-top: 1px solid var(--glass-border)`.

7. **Apply colored shadows to cards**: Card components should use `box-shadow: var(--shadow-card)`. Elevated elements (modals, sheets) use `--shadow-elevated`.

8. **Implement reward gold for achievements**: PR celebration components, streak milestone displays, and the achievement/PR badge should use `--color-reward` and `--gradient-reward` with `--shadow-reward`. This is the ONLY place gold appears.

9. **Update surface usage in light mode**: Input fields should use `--color-surface-sunken` for background. Cards use `--color-surface`. Modals/popovers use `--color-surface-elevated`.

10. **Run `npx vite build` to verify** — do NOT use `tsc -b` (known test file TS errors).

## Key Rules

- **Reward gold is SACRED** — never use it outside achievements/PRs/streaks
- **Gradient primary for filled CTAs only** — outline/ghost buttons stay flat
- **Glow is dark-mode only** — light mode uses colored shadows instead
- **Three-tier surfaces in light mode** — bg (#ECEEF2) → surface (#F7F8FA) → elevated (#FFFFFF)
- **Green for mobility** — mobility shares the primary color
- **Rose for cardio, not red** — #E63B57 light / #FB7185 dark (not #EF4444)
- **Indigo for weights** — #5B5DF0 light / #818CF8 dark (not #60A5FA)
- Keep the Syne heading font and Outfit body font unchanged
- Keep the existing border-radius scale unchanged
- Check Chrome after EVERY file save at both 375px and 428px width
