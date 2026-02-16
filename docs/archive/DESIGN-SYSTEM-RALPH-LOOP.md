# Design System, Reusable Components, Phosphor Icons & Cleanup — Ralph Loop

Copy everything below the line and paste it into Claude Code:

---

```
/ralph-wiggum:ralph-loop "ultrathink
You are a design-system and component-architecture team for a Workout Tracker PWA. The app works and is stable. Your job is to:
1. Migrate from Lucide React icons to Phosphor Icons (premium, weight-based icon system)
2. Formalize the Electric Mint Pro design system into proper reusable primitives
3. Consolidate duplicate component patterns into a single shared library
4. Break apart bloated page files into clean, composable components
5. Clean up dead code, orphaned files, and inconsistent patterns
6. Leave the codebase in a state where any new feature can be built by composing existing primitives

This is NOT a bug-fix mission. The app works. This is an ARCHITECTURE mission. You are upgrading the codebase from 'working prototype' to 'professional component library.'

THE PHILOSOPHY: COMPOSABLE OVER CUSTOM.
- The easy thing is leaving Lucide icons everywhere because they work. The RIGHT thing is migrating to Phosphor for weight-based visual hierarchy (bold for CTAs, regular for nav, duotone for decorative).
- The easy thing is leaving 3 different CollapsibleSection components. The RIGHT thing is unifying them into one flexible primitive.
- The easy thing is leaving Profile.tsx at 1038 lines. The RIGHT thing is splitting it into focused, testable sub-components.
- The easy thing is scattering inline styles. The RIGHT thing is extracting repeated patterns into CSS utility classes or shared components.
- The easy thing is declaring done when it compiles. The RIGHT thing is verifying every screen still looks and works correctly.

APP CONTEXT:
- React 19 + TypeScript + Vite 7 + TailwindCSS 4 + TanStack Query 5 + Zustand 5 + Framer Motion
- Supabase backend (project ID: cvxzuxbgufpzvbmlxayr)
- Design tokens in: src/index.css (CSS custom properties) and src/config/designTokens.ts (TypeScript mirror)
- Build command: npx vite build (NOT tsc -b)
- Currently uses lucide-react across 72 files with 88 unique icons

CURRENT COMPONENT STRUCTURE:
src/components/
├── ui/         (13 exports) — Button, Card, Input, Modal, BottomSheet, Avatar, Badge, CollapsibleSection, AnimatedCard, AnimatedCounter, StreakBar, ThemePicker
├── layout/     (6 files) — AppShell, Header, BottomNav, OfflineBanner, SyncManager, ErrorBoundary
├── motion/     (12 exports) — PressableButton, PressableCard, PageTransition, FadeIn, FadeInOnScroll, ScaleIn, SlideUp, StaggerList/StaggerItem, AnimatedNumber, AnimatedProgress, ProgressRing, ShimmerSkeleton
├── workout/    (9 exports) — ExerciseCard, SetLogger, RestTimer, ExerciseList, CollapsibleSection (DUPLICATE), FormGuideSheet, etc.
├── review/     (10 exports) — 4-step wizard components, ReflectionForm (has PRIVATE CollapsibleSection inside)
├── social/     (11 files, only 1 exported) — SocialFeed, UserCard, ReactionBar, CommentSection, etc.
├── calendar/   (3 exports)
├── schedule/   (2 files)
├── weather/    (3 files)
├── stats/      (2 files)
├── profile/    (2 files)
├── auth/       (2 exports)
└── onboarding/ (2 exports)

KNOWN ISSUES TO FIX:

ISSUE 1 — LUCIDE ICONS (72 files, 88 icons):
The app uses lucide-react everywhere. We are migrating to @phosphor-icons/react for:
- 6 weight variants (thin, light, regular, bold, fill, duotone) for visual hierarchy
- Duotone weight for the Electric Mint Pro 'cinematic' feel in dark mode
- Bold weight for primary actions, Regular for navigation, Duotone for decorative elements
- More expressive, premium icon aesthetic that matches the design system

ISSUE 2 — THREE CollapsibleSection IMPLEMENTATIONS:
- src/components/ui/CollapsibleSection.tsx (77 lines) — used by Profile.tsx (4 instances)
- src/components/workout/CollapsibleSection.tsx (62 lines) — used by Workout.tsx
- src/components/review/ReflectionForm.tsx — contains PRIVATE CollapsibleSection
These must be unified into ONE flexible component in ui/.

ISSUE 3 — Profile.tsx IS 1038 LINES:
Contains: user profile header, lifetime stats, settings, account deletion, feedback, exercise data stats, avatar upload — all in one file. Must be split.

ISSUE 4 — REPEATED VISUAL PATTERNS NOT EXTRACTED:
- Gradient overlay pattern (8+ uses in StatsGrid)
- Badge/chip pattern (6+ uses across files)
- Glass morphism (only in BottomNav, should be reusable CSS class)
- Green/reward shadow patterns
- Status indicator dot pattern

ISSUE 5 — social/ DIRECTORY MISSING EXPORTS:
11 component files but only 1 exported from index.ts.

ISSUE 6 — ORPHANED DOCUMENTATION FILES IN src/:
- src/EXERCISEDB_API.md, src/API_NINJAS_EXERCISES.md, src/WGER_API.md, src/APPLE_HEALTHKIT.md, src/STRAVA_API.md, src/WHOOP_API.md
These clutter src/. Move to /docs/ or delete.

ISSUE 7 — INCONSISTENT SPACING:
Some components use var(--space-*), others use Tailwind p-4/p-5/p-6 directly.

========================================================================
PHOSPHOR ICONS — COMPLETE MIGRATION REFERENCE
========================================================================

INSTALL: npm install @phosphor-icons/react

IMPORT PATTERN:
  OLD: import { Dumbbell, Trophy, Play } from 'lucide-react'
  NEW: import { Barbell, Trophy, Play } from '@phosphor-icons/react'

TYPE CHANGE:
  OLD: import type { LucideIcon } from 'lucide-react'
  NEW: import type { Icon } from '@phosphor-icons/react'

  Then change all type annotations: LucideIcon → Icon

  Files with LucideIcon type (8 files):
  - src/config/workoutConfig.ts
  - src/config/communityConfig.ts
  - src/config/reviewConfig.ts
  - src/utils/scheduleUtils.ts
  - src/components/ui/StreakBar.tsx
  - src/components/ui/CollapsibleSection.tsx
  - src/components/social/LeaderboardPanel.tsx
  - src/components/workout/ScheduleWidget.tsx

strokeWidth → weight CONVERSION:
  Lucide uses strokeWidth (number). Phosphor uses weight (string).
  OLD: <Dumbbell strokeWidth={3} />
  NEW: <Barbell weight="bold" />

  Mapping:
  - strokeWidth={1} or strokeWidth={1.5} → weight='thin' or weight='light'
  - strokeWidth={1.8} or strokeWidth={2} → weight='regular' (default, can omit)
  - strokeWidth={2.5} → weight='bold'
  - strokeWidth={3} or strokeWidth={4} → weight='bold'
  - Dynamic: strokeWidth={isActive ? 2.5 : 1.8} → weight={isActive ? 'bold' : 'regular'}

  Files using strokeWidth (12 files):
  - src/components/ui/StreakBar.tsx (3 instances)
  - src/components/ui/Avatar.tsx (1)
  - src/components/ui/Button.tsx (1)
  - src/components/layout/BottomNav.tsx (1 — dynamic based on active state)
  - src/components/workout/ScheduleWidget.tsx (3)
  - src/components/workout/ExerciseCard.tsx (2)
  - src/components/workout/WorkoutDayCard.tsx (1)
  - src/components/workout/CardioLogCard.tsx (1)
  - src/pages/Schedule.tsx (4)
  - src/pages/WorkoutSelect.tsx (2)
  - src/pages/CardioWorkout.tsx (1)
  - src/pages/History.tsx (1)

ICON NAME MAPPING (only icons that CHANGE name — ~30 of 88):
  Lucide → Phosphor
  AlertCircle → WarningCircle
  AlertTriangle → Warning
  ArrowLeftRight → ArrowsLeftRight
  Award → Medal
  BatteryFull → BatteryHigh
  BellOff → BellSlash
  Bike → Bicycle
  CheckCircle2 → CheckCircle
  ChevronDown → CaretDown
  ChevronLeft → CaretLeft
  ChevronRight → CaretRight
  ChevronUp → CaretUp
  CloudOff → CloudSlash
  Dumbbell → Barbell
  ExternalLink → ArrowSquareOut
  EyeOff → EyeSlash
  Flame → Fire
  HandMetal → HandFist
  HelpCircle → Question
  History → ClockCounterClockwise
  Home → House
  Loader2 → SpinnerGap
  LogOut → SignOut
  Mail → Envelope
  MessageCircle → ChatCircle
  MessageSquare → ChatSquare
  MessageSquarePlus → ChatSquarePlus (or ChatTeardrop)
  Pencil → PencilSimple
  RefreshCw → ArrowClockwise
  RotateCcw → ArrowCounterClockwise
  Search → MagnifyingGlass
  Send → PaperPlaneTilt
  Share2 → ShareNetwork
  Sparkles → Sparkle
  Trash2 → Trash
  Wifi → WifiHigh
  WifiOff → WifiSlash
  Workflow → FlowArrow
  Zap → Lightning

ICONS THAT KEEP THE SAME NAME (~58 of 88):
  Activity, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, ArrowUpDown,
  Battery, Bell, BookOpen, Bug, Calendar, Camera, Check, CheckCircle,
  Circle, Clock, Cloud, CloudRain, Database, Droplets, Eye, Feather,
  Footprints, Hash, Heart, Info, Lightbulb, MapPin, Minus, Monitor,
  Moon, Pause, Play, Plus, Rocket, Shield, Star, StickyNote, Sun,
  Swords, Target, ThumbsUp, Timer, TrendingDown, TrendingUp, Trophy,
  User, UserPlus, Users, Waves, Weight, Wind, X

PHOSPHOR WEIGHT STRATEGY FOR Electric Mint Pro:
- weight='bold' — Primary CTAs, active nav items, important actions (Start Workout, Complete)
- weight='regular' — Default for most UI icons (navigation, labels, secondary actions)
- weight='duotone' — Decorative icons (profile stats, weather, achievement displays, workout type icons in cards). The duotone secondary layer picks up currentColor at 20% opacity, creating a subtle depth effect.
- weight='fill' — Selected/active states (filled heart, completed checkmarks, active tab icons)
- weight='light' — Subtle de-emphasized icons (timestamps, metadata labels, helper text)

ICON WEIGHT ASSIGNMENTS BY CONTEXT:
Bottom nav: weight={isActive ? 'fill' : 'regular'}
Primary buttons: weight='bold'
Card headers/titles: weight='duotone'
Status indicators (Check, X, AlertCircle): weight='bold'
Profile stats icons: weight='duotone'
Weather icons: weight='duotone'
Workout type icons in badges: weight='duotone'
Chevrons/carets: weight='regular' (default)
Close buttons (X): weight='regular'
Form labels: weight='regular'
Rest timer controls (Play, Pause): weight='fill'

TEAM STRUCTURE:

1. 'architect' — Plans the component library structure and icon migration. Reads every component, maps dependencies, designs unified APIs. Creates the blueprint before anyone writes code.

2. 'builder' — Implements the architect's blueprint. Creates new shared components, refactors existing ones, extracts patterns. Writes clean, typed, well-documented code.

3. 'migrator' — Handles the Phosphor icon migration across all 72 files. Updates imports, swaps names, converts strokeWidth to weight, updates type annotations. Also migrates consumers to new shared components.

4. 'janitor' — Removes dead code, orphaned files, unused exports, console.logs. Fixes barrel exports. Uninstalls lucide-react after migration. Runs the linter.

5. 'verifier' — Tests every screen in Chrome after each phase. Verifies visual consistency, checks console for errors, screenshots before/after. The app must look IDENTICAL (or better) after changes — no regressions.

========================================================================
PHASE 0 — BLUEPRINT (iterations 1-3)
========================================================================

architect reads the full codebase and creates /docs/design-system-blueprint.md:

STEP 1: Read every file in src/components/ui/ to understand current primitive APIs.

STEP 2: Read the three CollapsibleSection implementations. Design a UNIFIED API:
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
  variant?: 'default' | 'lined' | 'compact';
  headerRight?: React.ReactNode;
  className?: string;
}

STEP 3: Read Profile.tsx completely. Plan the split into:
- ProfileHeader (avatar, name, plan badge)
- ProfileStats (lifetime stats cards)
- ProfileSettings (theme, notifications)
- ProfileAccount (password, deletion, sign out)
- ProfileFeedback (bug report form)
- ExerciseDataSection (API usage stats)

STEP 4: Plan CSS utility classes to add.

STEP 5: Audit social/ barrel exports.

STEP 6: Plan the Phosphor migration order (config files first, then ui/, then pages).

Write the complete blueprint with TypeScript interfaces, file changes, and risk assessment.

========================================================================
PHASE 1 — INSTALL PHOSPHOR & MIGRATE ICONS (iterations 4-10)
========================================================================

This is the LARGEST phase. Take it methodically.

STEP 1: Install Phosphor Icons:
  npm install @phosphor-icons/react

Do NOT uninstall lucide-react yet. Both will coexist during migration.

STEP 2: migrator starts with CONFIG FILES (3 files) — these define icon types used across the app:

  src/config/workoutConfig.ts:
  - Change: import type { LucideIcon } from 'lucide-react' → import type { Icon } from '@phosphor-icons/react'
  - Change all icon imports to Phosphor equivalents (Dumbbell→Barbell, Bike→Bicycle, Heart→Heart, etc.)
  - Change type annotations: LucideIcon → Icon
  - Verify build passes

  src/config/reviewConfig.ts:
  - Same pattern: update LucideIcon type and icon imports

  src/config/communityConfig.ts:
  - Same pattern: update LucideIcon type and icon imports (Flame→Fire, Dumbbell→Barbell, HandMetal→HandFist, Star→Star)

STEP 3: migrator updates UTILS (1 file):
  src/utils/scheduleUtils.ts:
  - Change Moon import and LucideIcon type

STEP 4: migrator updates UI COMPONENTS (9 files):
  For each file:
  - Change 'lucide-react' imports to '@phosphor-icons/react'
  - Rename icons per mapping
  - Convert strokeWidth to weight
  - Update LucideIcon type refs to Icon

  Priority order: Button.tsx, Avatar.tsx, BottomSheet.tsx, Modal.tsx, CollapsibleSection.tsx, StreakBar.tsx, ThemePicker.tsx, Toast.tsx

STEP 5: migrator updates LAYOUT COMPONENTS (3 files):
  BottomNav.tsx — CRITICAL: This uses dynamic strokeWidth={isActive ? 2.5 : 1.8}
  Change to: weight={isActive ? 'fill' : 'regular'}
  This gives active tabs a filled icon (premium feel) vs regular outline for inactive.

  Header.tsx, ErrorBoundary.tsx, OfflineBanner.tsx

STEP 6: migrator updates WORKOUT COMPONENTS (8 files):
  ExerciseCard.tsx, RestTimer.tsx, FormGuideSheet.tsx, ScheduleWidget.tsx, WorkoutDayCard.tsx, CardioLogCard.tsx, PRCelebration.tsx, ProgressionBadge.tsx

STEP 7: migrator updates REVIEW COMPONENTS (6+ files):
  PostWorkoutReview.tsx, StarRating.tsx, ReviewSummaryCard.tsx, ReviewBadge.tsx, ReflectionForm.tsx, EnergyLevel.tsx

STEP 8: migrator updates SOCIAL, CALENDAR, SCHEDULE, WEATHER, PROFILE, AUTH, ONBOARDING components

STEP 9: migrator updates ALL PAGE FILES (16 files):
  Home.tsx, Auth.tsx, Profile.tsx, PublicProfile.tsx, Schedule.tsx, Workout.tsx, CardioWorkout.tsx, MobilityWorkout.tsx, RestDay.tsx, WorkoutSelect.tsx, SessionDetail.tsx, CardioSessionDetail.tsx, PublicSessionDetail.tsx, History.tsx, MobilityDurationPicker.tsx, AuthCallback.tsx, Community.tsx

STEP 10: Run 'npx vite build' — must compile with ZERO lucide-react imports remaining.

STEP 11: Search entire codebase for any remaining 'lucide-react' strings. If found, fix them.

STEP 12: janitor uninstalls lucide-react:
  npm uninstall lucide-react

STEP 13: Run 'npx vite build' again — must still compile cleanly without lucide-react installed.

verifier checks: every screen in Chrome. All icons render. No broken imports. No missing icons. Icons look premium and consistent.

ICON QUALITY CHECK — verifier specifically looks for:
- [ ] BottomNav: active tab icon is filled, inactive are regular weight
- [ ] Primary buttons: icons are bold weight
- [ ] Profile stats: icons are duotone
- [ ] Weather widget: icons are duotone
- [ ] Workout cards: type icons (Barbell, Heart, Activity) are duotone
- [ ] Rest timer: Play/Pause are fill weight
- [ ] All icons are the correct size (no giant or tiny icons)
- [ ] No yellow warning triangles or broken image placeholders

========================================================================
PHASE 2 — CSS UTILITY LAYER (iterations 11-12)
========================================================================

builder adds utility classes to src/index.css:

/* ── Utility Classes ── */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
}

.shadow-card { box-shadow: var(--shadow-card); }
.shadow-primary { box-shadow: var(--shadow-primary); }
.shadow-reward { box-shadow: var(--shadow-reward); }
.shadow-elevated { box-shadow: var(--shadow-elevated); }

.gradient-primary { background: var(--gradient-primary); }
.gradient-reward { background: var(--gradient-reward); }
.gradient-surface { background: var(--gradient-surface); }

.surface-sunken { background-color: var(--color-surface-sunken); }

.dark .neon-glow-primary { text-shadow: 0 0 12px var(--color-primary-glow); }
.dark .neon-glow-reward { text-shadow: 0 0 14px var(--color-reward-glow); }

verifier checks: app still renders correctly. No CSS conflicts.

========================================================================
PHASE 3 — UNIFY CollapsibleSection (iterations 13-15)
========================================================================

builder rewrites src/components/ui/CollapsibleSection.tsx with the unified API from the blueprint. Must:
- Use Framer Motion AnimatePresence + motion.div
- Respect useReducedMotion
- Support variant='default' | 'lined' | 'compact'
- Use Phosphor icons (CaretDown for chevron)

migrator updates consumers:
- Profile.tsx → use ui/CollapsibleSection (props map cleanly)
- Workout.tsx → use ui/CollapsibleSection with variant='lined'
- ReflectionForm.tsx → use ui/CollapsibleSection as wrapper

DELETE src/components/workout/CollapsibleSection.tsx

verifier checks: all collapsible sections animate correctly across Profile, Workout, and Review screens.

========================================================================
PHASE 4 — SPLIT Profile.tsx (iterations 16-20)
========================================================================

builder extracts into focused components:
- src/components/profile/ProfileHeader.tsx
- src/components/profile/ProfileStats.tsx
- src/components/profile/ProfileSettings.tsx
- src/components/profile/ProfileAccount.tsx
- src/components/profile/ProfileFeedback.tsx
- src/components/profile/ExerciseDataSection.tsx
- src/components/profile/index.ts (barrel)

Rewrite src/pages/Profile.tsx as thin composition (target: under 100 lines).

verifier checks: Profile page looks identical. All functionality preserved.

========================================================================
PHASE 5 — EXTRACT REPEATED PATTERNS (iterations 21-23)
========================================================================

builder creates:

StatusChip (src/components/ui/StatusChip.tsx):
  Props: label, color, bgOpacity?, size?, icon?
  Replaces: 6+ inline badge/chip patterns

GradientOverlay (src/components/ui/GradientOverlay.tsx):
  Props: gradient, opacity?, className?
  Replaces: 8+ absolute inset-0 gradient divs

StatCard (src/components/ui/StatCard.tsx):
  Props: value, label, color?, glow?, size?
  Replaces: repeated stat display boxes

Update src/components/ui/index.ts with new exports.

migrator updates consumers.

========================================================================
PHASE 6 — CLEANUP & HYGIENE (iterations 24-26)
========================================================================

janitor does:
1. Fix social/ barrel exports — update index.ts for all used components
2. Move orphaned docs out of src/ → /docs/reference/ or delete
3. Remove dead imports, unused exports, console.logs, commented-out code
4. Standardize spacing (prefer Tailwind classes over var(--space-*) in components)
5. Run 'npm run lint' — fix all warnings/errors
6. Run 'npx vite build' — must compile cleanly
7. Verify lucide-react is NOT in package.json dependencies

========================================================================
PHASE 7 — FULL REGRESSION & REPORT (iterations 27-30)
========================================================================

verifier does a COMPLETE check in Chrome at 375px in both light and dark mode:

HOME:
- [ ] Greeting and today's workout card
- [ ] Weekly activity strip with Phosphor icons
- [ ] Weather widget with duotone icons
- [ ] Stats summary
- [ ] Navigation to workout

COMMUNITY:
- [ ] Social feed loads with Phosphor icons
- [ ] Following/Discover tabs
- [ ] Reactions display
- [ ] User profiles accessible

SCHEDULE:
- [ ] 7-day cycle view with correct icons
- [ ] Workout assignments with duotone workout type icons

HISTORY:
- [ ] Calendar view
- [ ] Session detail
- [ ] Sets/exercises display correctly

PROFILE:
- [ ] All sub-components render correctly
- [ ] Theme toggle works (light ↔ dark)
- [ ] All CollapsibleSections animate
- [ ] Password change, feedback, settings all functional
- [ ] Duotone stat icons

WORKOUT FLOW:
- [ ] Workout select with duotone type icons
- [ ] Workout detail with exercise sections
- [ ] Start workout → log set → rest timer (fill Play/Pause) → complete
- [ ] CollapsibleSections in workout view

BOTTOM NAV:
- [ ] Active tab = fill weight icon
- [ ] Inactive tabs = regular weight icons
- [ ] Glass morphism intact

DEVTOOLS:
- [ ] Console: zero errors
- [ ] Network: zero failures
- [ ] No 'lucide' in any network request or console message
- [ ] Build: npx vite build passes

Screenshot every screen → /screenshots/design-system/

Write FINAL REPORT to /docs/design-system-report.md:

## Phosphor Icons Migration
- Icons migrated: 88 unique icons across 72 files
- Name changes: X icons renamed
- strokeWidth→weight conversions: X instances
- LucideIcon→Icon type changes: 8 files
- Weight strategy: bold (CTAs), regular (nav), duotone (decorative), fill (active states)
- lucide-react uninstalled: YES/NO
- Bundle size change: before vs after

## Component Architecture
### New Components Created
### Components Modified
### Components Deleted
### Files Moved/Deleted
### CSS Utilities Added

## Profile.tsx Decomposition
- Before: 1038 lines, 1 file
- After: X lines across Y files

## CollapsibleSection Unification
- Before: 3 implementations → After: 1 unified

## Repeated Patterns Extracted
- StatusChip, GradientOverlay, StatCard

## Dead Code Removed

## Build & Lint Status

## Visual Regression
- Screens tested: X
- Regressions found: X

## Verdict: CLEAN / NEEDS-WORK

HARD RULES:
- The app must look IDENTICAL or BETTER after changes. Zero regressions.
- Every Phosphor icon must use the correct weight for its context (see weight strategy above).
- NEVER mix lucide-react and @phosphor-icons/react in the same file. Migrate completely.
- lucide-react must be UNINSTALLED from package.json by the end.
- Every new component must have TypeScript interfaces.
- Every new component must use design tokens (CSS variables), never hardcoded hex.
- Every new component must respect useReducedMotion.
- Barrel exports (index.ts) must be updated for all component changes.
- Do NOT change component behavior — only structure, organization, and icons.
- Do NOT rename CSS custom properties — only add utility classes.
- Do NOT refactor hooks or services — only components and pages.
- Do NOT touch test files — they have pre-existing TS errors and that is expected.
- Run 'npx vite build' after every phase. If it fails, fix before moving on.
- Screenshot before AND after to prove no visual regression.

COMPLETION GATE:
- Phosphor Icons: all 72 files migrated, lucide-react uninstalled, zero lucide imports remaining
- Icon weights: CTAs use bold, nav uses fill/regular, decorative uses duotone
- CollapsibleSection: ONE implementation, all consumers updated, old files deleted
- Profile.tsx: under 150 lines, all sub-components in profile/ directory
- Repeated patterns: extracted into shared ui/ components
- social/ barrel exports: fixed
- Orphaned docs: moved out of src/
- Lint: passes
- Build: passes (npx vite build)
- Every screen verified in Chrome with screenshot evidence
- Design system report written with CLEAN verdict

When all gates pass and the report shows CLEAN, output <promise>SYSTEMATIC</promise>" --max-iterations 30 --completion-promise "SYSTEMATIC"
```
