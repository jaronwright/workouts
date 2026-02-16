# Electric Mint Pro — Ralph Loop Command

Copy everything below the line and paste it into Claude Code:

---

```
/ralph-wiggum:ralph-loop "ultrathink
You are an elite design-system implementation team. The app currently uses an outdated 'Electric Volt' color system (#E8FF00 yellow primary, #D4A84B warm gold accent, warm beige backgrounds). Your job is to implement the new 'Electric Mint Pro' color system — a premium fitness brand identity with TWO personalities: Light mode = 'Editorial' (layered grays, colored shadows) and Dark mode = 'Cinematic' (neon glow, gradient surfaces).

This is NOT a simple find-and-replace job. This is a FULL design system migration. Every color token, every hardcoded hex, every CSS variable, every TypeScript constant, every shadow, every gradient must change. If you miss one, the app will have visual inconsistencies. If you do it carelessly, you will break WCAG contrast ratios, glass morphism effects, or the three-tier surface hierarchy.

THE PHILOSOPHY: PRECISION OVER SPEED.
- The easy thing is to bulk find-replace hex values. The RIGHT thing is to understand what each color does in context and map it to the correct new token.
- The easy thing is to skip contrast checking. The RIGHT thing is to verify WCAG AA on every text/background pair.
- The easy thing is to only update the token files. The RIGHT thing is to also hunt down every hardcoded hex in every component.
- The easy thing is to test in one theme. The RIGHT thing is to test both light AND dark mode at 375px and 428px widths.
- The easy thing is to declare done when the token files compile. The RIGHT thing is to visually verify every screen in Chrome.

COMPLETE COLOR SPECIFICATION — LIGHT MODE (:root):

/* Primary */
--color-primary: #00C261;
--color-primary-bright: #00D26A;
--color-primary-hover: #00AB56;
--color-primary-text: #FFFFFF;
--color-primary-muted: rgba(0, 194, 97, 0.10);
--color-primary-glow: rgba(0, 194, 97, 0.14);

/* Accent (Teal) */
--color-accent: #00A89A;
--color-accent-hover: #009488;
--color-accent-secondary: #00BDB0;
--color-accent-muted: rgba(0, 168, 154, 0.08);

/* Reward Gold (ACHIEVEMENTS ONLY — never in regular UI) */
--color-reward: #D99700;
--color-reward-bright: #FFB800;
--color-reward-muted: rgba(217, 151, 0, 0.10);
--color-reward-glow: rgba(217, 151, 0, 0.12);

/* Tertiary */
--color-tertiary: #00C261;
--color-tertiary-hover: #00AB56;
--color-tertiary-muted: rgba(0, 194, 97, 0.10);

/* Workout Types */
--color-weights: #5B5DF0;
--color-weights-muted: rgba(91, 93, 240, 0.09);
--color-cardio: #E63B57;
--color-cardio-muted: rgba(230, 59, 87, 0.08);
--color-mobility: #00C261;
--color-mobility-muted: rgba(0, 194, 97, 0.08);

/* Surfaces (THREE-TIER) */
--color-background: #ECEEF2;
--color-surface: #F7F8FA;
--color-surface-elevated: #FFFFFF;
--color-surface-hover: #EAEBEF;
--color-surface-sunken: #E3E5EA;

/* Text */
--color-text: #111318;
--color-text-secondary: #484D5C;
--color-text-muted: #6E7487;
--color-text-inverse: #ECF0F5;

/* Borders */
--color-border: rgba(17, 19, 24, 0.08);
--color-border-strong: rgba(17, 19, 24, 0.14);

/* Status */
--color-success: #00C261;
--color-success-muted: rgba(0, 194, 97, 0.10);
--color-warning: #D99700;
--color-warning-muted: rgba(217, 151, 0, 0.10);
--color-danger: #E63B57;
--color-danger-muted: rgba(230, 59, 87, 0.10);
--color-info: #5B5DF0;
--color-info-muted: rgba(91, 93, 240, 0.10);

/* Heatmap intensity */
--heatmap-1: rgba(0, 194, 97, 0.25);
--heatmap-2: rgba(0, 194, 97, 0.50);
--heatmap-3: rgba(0, 194, 97, 0.80);

/* Shadows (COLORED — light mode signature) */
--shadow-xs: 0 1px 2px rgba(17, 19, 24, 0.04);
--shadow-sm: 0 1px 2px rgba(17, 19, 24, 0.06);
--shadow-md: 0 4px 12px rgba(17, 19, 24, 0.08);
--shadow-lg: 0 8px 24px rgba(17, 19, 24, 0.10);
--shadow-xl: 0 16px 48px rgba(17, 19, 24, 0.14);
--shadow-card: 0 1px 3px rgba(17,19,24,0.04), 0 4px 16px rgba(17,19,24,0.05);
--shadow-primary: 0 2px 8px rgba(0,194,97,0.18), 0 4px 20px rgba(0,194,97,0.12);
--shadow-reward: 0 2px 8px rgba(217,151,0,0.15), 0 4px 16px rgba(217,151,0,0.10);
--shadow-accent: 0 4px 24px rgba(0, 168, 154, 0.12);
--shadow-elevated: 0 4px 12px rgba(17,19,24,0.06), 0 12px 40px rgba(17,19,24,0.08);

/* Gradients */
--gradient-primary: linear-gradient(135deg, #00C261 0%, #00A89A 100%);
--gradient-accent: linear-gradient(135deg, #00C261 0%, #00A89A 100%);
--gradient-reward: linear-gradient(135deg, #FFB800 0%, #FF9500 100%);
--gradient-surface: linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%);
--gradient-hero: linear-gradient(135deg, #0B0D10 0%, #13161B 50%, #1B1F26 100%);
--gradient-warm-glow: radial-gradient(ellipse at 50% 0%, rgba(0, 194, 97, 0.06) 0%, transparent 70%);

/* Glass */
--glass-bg: rgba(247, 248, 250, 0.82);
--glass-border: rgba(17, 19, 24, 0.06);
--glass-blur: 24px;

COMPLETE COLOR SPECIFICATION — DARK MODE (.dark):

/* Primary */
--color-primary: #00E676;
--color-primary-bright: #00FF88;
--color-primary-hover: #00F283;
--color-primary-text: #0A0F0D;
--color-primary-muted: rgba(0, 230, 118, 0.08);
--color-primary-glow: rgba(0, 230, 118, 0.15);

/* Accent (Teal) */
--color-accent: #00D4C8;
--color-accent-hover: #00E0D4;
--color-accent-secondary: #00E8DC;
--color-accent-muted: rgba(0, 212, 200, 0.07);

/* Reward Gold */
--color-reward: #FFC233;
--color-reward-bright: #FFD060;
--color-reward-muted: rgba(255, 194, 51, 0.10);
--color-reward-glow: rgba(255, 194, 51, 0.12);

/* Tertiary */
--color-tertiary: #00E676;
--color-tertiary-hover: #00F283;
--color-tertiary-muted: rgba(0, 230, 118, 0.08);

/* Workout Types */
--color-weights: #818CF8;
--color-weights-muted: rgba(129, 140, 248, 0.10);
--color-cardio: #FB7185;
--color-cardio-muted: rgba(251, 113, 133, 0.08);
--color-mobility: #00E676;
--color-mobility-muted: rgba(0, 230, 118, 0.07);

/* Surfaces (cool steel — blue undertone) */
--color-background: #0B0D10;
--color-surface: #13161B;
--color-surface-elevated: #1B1F26;
--color-surface-hover: #242930;
--color-surface-sunken: #070809;

/* Text */
--color-text: #ECF0F5;
--color-text-secondary: #8B93A6;
--color-text-muted: #5A6278;
--color-text-inverse: #111318;

/* Borders */
--color-border: rgba(236, 240, 245, 0.05);
--color-border-strong: rgba(236, 240, 245, 0.08);

/* Status */
--color-success: #00E676;
--color-success-muted: rgba(0, 230, 118, 0.10);
--color-warning: #FBBF24;
--color-warning-muted: rgba(255, 187, 36, 0.10);
--color-danger: #FB7185;
--color-danger-muted: rgba(251, 113, 133, 0.10);
--color-info: #818CF8;
--color-info-muted: rgba(129, 140, 248, 0.10);

/* Heatmap intensity */
--heatmap-1: rgba(0, 230, 118, 0.25);
--heatmap-2: rgba(0, 230, 118, 0.50);
--heatmap-3: rgba(0, 230, 118, 0.80);

/* Shadows */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.30);
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.30);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.40);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.50);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.60);
--shadow-card: 0 2px 4px rgba(0,0,0,0.20), 0 8px 32px rgba(0,0,0,0.25);
--shadow-primary: 0 4px 24px rgba(0,230,118,0.15), 0 1px 3px rgba(0,0,0,0.3);
--shadow-reward: 0 4px 24px rgba(255,194,51,0.12), 0 1px 3px rgba(0,0,0,0.3);
--shadow-accent: 0 4px 24px rgba(0, 212, 200, 0.10);
--shadow-elevated: 0 8px 32px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);

/* Gradients */
--gradient-primary: linear-gradient(135deg, #00E676 0%, #00D4C8 100%);
--gradient-accent: linear-gradient(135deg, #00E676 0%, #00D4C8 100%);
--gradient-reward: linear-gradient(135deg, #FFC233 0%, #FFB800 100%);
--gradient-surface: linear-gradient(170deg, #1B1F26 0%, #13161B 100%);
--gradient-hero: linear-gradient(135deg, #0B0D10 0%, #13161B 50%, #1B1F26 100%);
--gradient-warm-glow: radial-gradient(ellipse at 50% 0%, rgba(0, 230, 118, 0.06) 0%, transparent 70%);

/* Glass */
--glass-bg: rgba(19, 22, 27, 0.78);
--glass-border: rgba(236, 240, 245, 0.05);
--glass-blur: 24px;

SUPABASE PROJECT:
Project ID: cvxzuxbgufpzvbmlxayr

TEAM STRUCTURE:
1. 'token-architect' — Updates the two core token files (index.css and designTokens.ts). This role is surgical: they replace every CSS custom property and TypeScript constant with the exact new values. They verify that every token in the specification above exists in both files and that light/dark values match.

2. 'component-hunter' — Searches the ENTIRE codebase for hardcoded colors that bypass the design token system. Every hex value, every rgb(), every rgba(), every Tailwind color class that uses old palette colors. Creates a comprehensive map of every file and line that needs updating.

3. 'surgeon' — Takes the component-hunter's map and makes targeted fixes. Replaces hardcoded #6B7280 with var(--color-text-muted). Replaces #e5e7eb with var(--color-surface-sunken). Replaces #EF4444 with var(--color-danger). Updates workout type colors from blue/red to indigo/rose. Updates PRCelebration confetti to use reward gold + primary palette.

4. 'effect-specialist' — Implements the design system's signature effects: gradient primary on CTA buttons, colored shadows on cards, neon text-shadow in dark mode for stat numbers and active nav, glass morphism on bottom nav with backdrop-filter blur, reward gold glow on achievement cards. These effects are what make the design feel premium.

5. 'verifier' — Tests every screen in Chrome at 375px AND 428px in BOTH light and dark mode. Checks WCAG contrast ratios. Screenshots every screen. Reports any visual bugs, missing tokens, old colors bleeding through, or broken effects.

========================================================================
PHASE 0 — CORE TOKEN FILES (iterations 1-5)
========================================================================
token-architect does the following:

STEP 1: Read the current src/index.css completely. Understand every CSS custom property in :root and .dark blocks.

STEP 2: Replace ALL color values in :root with the LIGHT MODE values from the specification above. Be exhaustive — every --color-*, --shadow-*, --gradient-*, --glass-* property must be updated or added. The specification above is the COMPLETE list.

New tokens to ADD (these do not exist in the current file):
- --color-primary-bright
- --color-primary-glow
- --color-reward (entire group: reward, reward-bright, reward-muted, reward-glow)
- --shadow-card, --shadow-primary, --shadow-reward, --shadow-elevated
- --gradient-reward, --gradient-surface
- --heatmap-1, --heatmap-2, --heatmap-3

STEP 3: Replace ALL color values in .dark with the DARK MODE values from the specification above.

STEP 4: Read src/config/designTokens.ts completely. Update ALL TypeScript constants to mirror the CSS changes exactly. The colors object, shadows object, gradients object, glass object — everything must match.

Add these new entries to designTokens.ts:
- colors.reward = { DEFAULT, bright, muted, glow }
- colors.primaryBright and colors.primaryGlow
- shadows.card, shadows.primary, shadows.reward, shadows.elevated
- shadowsDark.card, shadowsDark.primary, shadowsDark.reward, shadowsDark.elevated
- gradients.reward, gradients.surface
- Replace gradients.accent to use green-teal instead of yellow-gold
- Update glass.bg, glass.border values

STEP 5: Run 'npx vite build' (NOT tsc -b) to verify the build passes. Fix any TypeScript errors. DO NOT skip this step.

CRITICAL RULES FOR TOKEN FILES:
- --color-primary-text changes from #0A0A0A (black) to #FFFFFF (white) in light mode. This is because green is dark enough for white text, unlike yellow which needed black text.
- --color-primary-text in dark mode is #0A0F0D (near-black with green tint)
- The old --color-accent was warm gold (#D4A84B). The new --color-accent is teal (#00A89A). Gold moves to --color-reward.
- Surface backgrounds shift from warm beige (#F2F2ED) to cool gray (#ECEEF2)
- Dark surfaces shift from pure gray (#0A0A0A, #141414) to cool steel (#0B0D10, #13161B) with subtle blue undertone
- Borders shift from warm-based rgba to cool-based rgba
- Status colors change: success=#00C261, warning=#D99700, danger=#E63B57, info=#5B5DF0
- Workout type colors change: weights from #60A5FA (blue) to #5B5DF0 (indigo), cardio from #EF4444 (red) to #E63B57 (rose)

========================================================================
PHASE 1 — HARDCODED COLOR AUDIT (iterations 6-8)
========================================================================
component-hunter searches the entire src/ directory:

STEP 1: Search for ALL hardcoded hex values in .tsx, .ts, and .css files (excluding node_modules and .test files). For each one found, document:
- File path
- Line number
- The exact color value
- What it's used for (text color, background, border, etc.)
- What new token or value it should map to

STEP 2: Search specifically for these OLD system colors that MUST be replaced:
- #E8FF00, #D4EB00 (old primary volt yellow) → var(--color-primary)
- #D4A84B, #C49A3D, #E0BD6F (old warm gold accent) → var(--color-accent) or var(--color-reward)
- #4ADE80 (old tertiary sage) → var(--color-tertiary) or var(--color-success)
- #60A5FA (old weights blue) → var(--color-weights)
- #F2F2ED, #FAFAF7 (old warm backgrounds) → already handled by tokens
- #0A0A0A, #141414 (old warm darks) → already handled by tokens

STEP 3: Search for Tailwind color classes that use old-palette colors (yellow-*, amber-* for primary uses). Document each one.

STEP 4: Search for inline style colors in component files. Pay special attention to:
- src/components/workout/PRCelebration.tsx — confetti colors
- src/components/weather/UvIndexChart.tsx — chart gradient colors
- src/components/motion/AnimatedProgress.tsx — progress bar fallback
- src/components/calendar/CalendarDayCell.tsx — day text color
- src/components/onboarding/OnboardingDayRow.tsx — row text color
- src/pages/WorkoutSelect.tsx — inline gradient
- src/config/workoutConfig.ts — 20+ workout split colors
- src/config/reviewConfig.ts — mood, tag, rating, energy, difficulty colors
- src/config/badgeConfig.ts — badge rarity colors
- src/config/communityConfig.ts — reaction colors
- src/services/weatherService.ts — UV index colors
- src/utils/validation.ts — password strength colors
- src/utils/scheduleUtils.ts — rest day default color

Write the complete audit to /docs/hardcoded-color-audit.md

========================================================================
PHASE 2 — COMPONENT FIXES (iterations 9-15)
========================================================================
surgeon fixes hardcoded colors based on the audit:

PRIORITY 1 — Critical component files:
- CalendarDayCell.tsx: Replace #6B7280 with var(--color-text-muted)
- OnboardingDayRow.tsx: Replace #6B7280 with var(--color-text-muted)
- AnimatedProgress.tsx: Replace #e5e7eb with var(--color-surface-sunken)
- PRCelebration.tsx: Replace confetti colors with: ['var(--color-reward-bright, #FFB800)', 'var(--color-primary, #00C261)', 'var(--color-accent, #00A89A)', 'var(--color-weights, #5B5DF0)', 'var(--color-cardio, #E63B57)'] or use the JS token values from designTokens.ts
- WorkoutSelect.tsx: Replace #10b981 inline gradient with var(--color-success)
- UvIndexChart.tsx: UV index colors can stay as-is (they represent universal UV index severity, not brand colors)

PRIORITY 2 — Config files:
- workoutConfig.ts: Review workout split colors. These are intentionally varied (indigo, violet, pink, red, orange, etc.) for workout differentiation. They do NOT need to match the primary palette. BUT check that the weights-related ones use the new indigo family instead of old blue.
- reviewConfig.ts: Review mood/tag/rating colors. These use a broad Tailwind palette for variety. They can mostly stay, BUT verify they look good against the new surface colors.
- badgeConfig.ts: The legendary badge was #F59E0B (amber). Consider changing to #D99700 or #FFB800 to align with the new reward gold.
- communityConfig.ts: Review reaction colors for harmony with new palette.

PRIORITY 3 — Any remaining hardcoded colors found in the audit.

RULE: When replacing hardcoded hex with CSS variables in inline styles, use the format:
  backgroundColor: 'var(--color-text-muted)'
When in TypeScript logic, import from designTokens.ts.

========================================================================
PHASE 3 — SIGNATURE EFFECTS (iterations 16-20)
========================================================================
effect-specialist implements the premium effects:

EFFECT 1 — GRADIENT PRIMARY ON CTA BUTTONS:
Find all primary action buttons (typically using background: var(--color-primary) or the Button component). Change to:
  background: var(--gradient-primary);
  box-shadow: var(--shadow-primary);
Only for FILLED primary buttons. Outline buttons stay flat. Ghost buttons stay flat.

EFFECT 2 — COLORED SHADOWS ON CARDS:
Find the Card component and similar card-like containers. Apply:
  box-shadow: var(--shadow-card);
Find modals, bottom sheets, and elevated overlays. Apply:
  box-shadow: var(--shadow-elevated);

EFFECT 3 — NEON TEXT-SHADOW IN DARK MODE:
For primary stat numbers (workout counts, volume, adherence percentages) and active nav icons, add a dark-mode-only text-shadow. The .dark class is on the HTML root element, so use:
  .dark .stat-number { text-shadow: 0 0 12px var(--color-primary-glow); }
Or in component code, check the theme and apply conditionally.

EFFECT 4 — GLASS MORPHISM ON BOTTOM NAV:
Find the BottomNav component. Apply:
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border-top: 1px solid var(--glass-border);

EFFECT 5 — REWARD GOLD ON ACHIEVEMENTS:
Find PRCelebration, streak displays, milestone badges. Apply:
  color: var(--color-reward);
  For fills: background: var(--gradient-reward); box-shadow: var(--shadow-reward);
  In dark mode, add: text-shadow: 0 0 14px var(--color-reward-glow);

EFFECT 6 — SURFACE-SUNKEN FOR INPUTS:
Find all text inputs, number inputs, textareas, and select elements. Apply:
  background-color: var(--color-surface-sunken);

========================================================================
PHASE 4 — VISUAL VERIFICATION (iterations 21-26)
========================================================================
verifier does a COMPLETE visual check in Chrome:

FOR EACH SCREEN (Home, Schedule, Workout Detail, Active Workout, History, Community, Profile, Auth, Rest Day):

1. Check at 375px width (iPhone SE) in LIGHT mode — screenshot
2. Check at 375px width in DARK mode — screenshot
3. Check at 428px width (iPhone 14 Pro Max) in LIGHT mode — screenshot
4. Check at 428px width in DARK mode — screenshot

FOR EACH SCREENSHOT, verify:
- [ ] No old yellow (#E8FF00) or warm gold (#D4A84B) visible anywhere
- [ ] No warm beige backgrounds (#F2F2ED)
- [ ] Primary green is correct shade (deeper in light, brighter in dark)
- [ ] Text is readable on all backgrounds (check contrast)
- [ ] Cards have visible elevation above background
- [ ] Inputs look recessed (sunken surface)
- [ ] Primary buttons show gradient (green-to-teal)
- [ ] Primary buttons have colored shadow in light mode
- [ ] Active nav item glows in dark mode
- [ ] Glass nav bar has frosted effect
- [ ] Workout type badges show correct colors (indigo/rose/mint, NOT blue/red)
- [ ] No elements overlapping or misaligned
- [ ] No text cut off at either width

CONTRAST CHECKS (light mode):
- Primary (#00C261) on surface (#F7F8FA) — must be >= 3:1 for large text
- Text (#111318) on surface (#F7F8FA) — must be >= 4.5:1
- Text (#111318) on background (#ECEEF2) — must be >= 4.5:1
- Secondary (#484D5C) on surface — must be >= 4.5:1
- Muted (#6E7487) on surface — must be >= 3:1
- Reward (#D99700) on surface — must be >= 3:1 for large text
- Primary-text (#FFFFFF) on primary (#00C261) — must be >= 3:1

CONTRAST CHECKS (dark mode):
- Primary (#00E676) on surface (#13161B) — must be >= 3:1
- Text (#ECF0F5) on surface (#13161B) — must be >= 4.5:1
- Secondary (#8B93A6) on surface — must be >= 4.5:1
- Muted (#5A6278) on surface — must be >= 3:1

Save all screenshots to /screenshots/electric-mint-pro/

========================================================================
PHASE 5 — BUG FIXES & POLISH (iterations 27-28)
========================================================================
surgeon fixes any issues found by verifier:
- Color mismatches
- Contrast failures
- Missing effects
- Old colors still bleeding through
- Visual alignment issues caused by shadow/gradient changes

After each fix, verifier re-checks the affected screen.

========================================================================
PHASE 6 — BUILD VERIFICATION & CLEANUP (iterations 29-30)
========================================================================

STEP 1: Run 'npx vite build' — must pass with zero errors.

STEP 2: Search entire codebase for any remaining old color values:
- grep for #E8FF00, #D4EB00 (old primary)
- grep for #D4A84B, #C49A3D (old accent gold)
- grep for #F2F2ED, #FAFAF7 (old warm backgrounds — check these are updated)
- grep for #0A0A0A, #141414, #1E1E1E (old warm darks — check updated to cool steel)

If any are found: fix them. Do NOT skip.

STEP 3: Update the CLAUDE.md Design System V2 section if any token names changed.

STEP 4: Write final report to /docs/electric-mint-pro-migration-report.md:
- Total files modified
- Token changes summary (new tokens added, old tokens renamed)
- Hardcoded colors fixed (count and list)
- Effects implemented (gradient, glow, glass, shadows)
- Contrast check results (all pass/any failures)
- Build status
- Screenshot evidence
- Any remaining items deferred (with justification)
- Overall verdict: COMPLETE / MOSTLY-COMPLETE / NEEDS-WORK

HARD RULES:
- DO NOT use #EF4444 for cardio. Use #E63B57 (light) / #FB7185 (dark).
- DO NOT use #60A5FA for weights. Use #5B5DF0 (light) / #818CF8 (dark).
- DO NOT use yellow (#E8FF00) anywhere. The primary is now green.
- DO NOT use warm gold (#D4A84B) as accent. Accent is now teal (#00A89A).
- DO NOT put reward gold in regular UI. It is ONLY for achievements/PRs/streaks.
- DO NOT skip dark mode testing. Both modes must look premium.
- DO NOT leave hardcoded hex values that should be CSS variables.
- DO NOT modify border-radius values or font choices — those are unchanged.
- DO NOT break the glass morphism by removing backdrop-filter.
- --color-primary-text is #FFFFFF in light mode (white on green). This is different from the old system where it was #0A0A0A (black on yellow). If any button text appears black on green, this is WRONG.
- Run 'npx vite build' not 'tsc -b' for verification.
- Check Chrome after EVERY major file change. Do not batch.

COMPLETION GATE:
- Zero old Electric Volt colors (#E8FF00, #D4A84B, #F2F2ED warm backgrounds) visible in the app
- Both light and dark mode look premium and intentional
- All WCAG contrast checks pass
- Gradient primary on CTA buttons
- Colored shadows in light mode, neon glow in dark mode
- Glass morphism on bottom nav
- Reward gold only appears on achievement elements
- Three-tier surface hierarchy visible in light mode
- Cool steel surfaces in dark mode
- Build passes with 'npx vite build'
- Every screen screenshotted and verified
- Migration report written with COMPLETE verdict

When all completion gates pass and the migration report shows COMPLETE, output <promise>MINTED</promise>" --max-iterations 30 --completion-promise "MINTED"
```
