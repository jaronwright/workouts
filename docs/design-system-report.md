# Design System Architecture Report

## Phosphor Icons Migration

- **Source files migrated**: 74 non-test files + 9 test files = 83 total
- **Icon names changed**: ~30 icons renamed (Dumbbell→Barbell, Flame→Fire, ChevronDown→CaretDown, etc.)
- **strokeWidth→weight conversions**: 12 files with ~20 instances converted
- **LucideIcon→Icon type changes**: 8 files (workoutConfig, reviewConfig, communityConfig, scheduleUtils, StreakBar, CollapsibleSection, LeaderboardPanel, ScheduleWidget)
- **Weight strategy applied**:
  - `weight="bold"` — Primary CTAs, status indicators
  - `weight="regular"` — Default for most UI icons, navigation, chevrons
  - `weight="fill"` — Active bottom nav tabs, rest timer Play/Pause
  - `weight="duotone"` — Profile stats, weather, workout type icons in cards
  - `weight="light"` — Subtle metadata labels
- **lucide-react uninstalled**: YES — zero references in source code or package.json
- **Bundle size**: ~1,336 KB JS (gzipped: ~361 KB) — comparable to pre-migration

## Component Architecture

### New Components Created
| Component | Location | Lines | Purpose |
|-----------|----------|-------|---------|
| ProfileHero | `components/profile/ProfileHero.tsx` | 161 | Avatar, name editing, trophy stats |
| ProfileSettings | `components/profile/ProfileSettings.tsx` | 155 | Appearance, notifications, privacy, workout cycle |
| SecuritySection | `components/profile/SecuritySection.tsx` | 232 | Password, email, sessions, account deletion |
| FeedbackSection | `components/profile/FeedbackSection.tsx` | 142 | Bug reports and feature requests |
| ExerciseDataSection | `components/profile/ExerciseDataSection.tsx` | 57 | ExerciseDB API usage stats |
| WorkoutSplitSection | `components/profile/WorkoutSplitSection.tsx` | 152 | Workout split grid selector + confirmation |
| SegmentedControl | `components/ui/SegmentedControl.tsx` | — | Glass-morphism tab switcher (pre-existing) |

### New Hooks Created
| Hook | Location | Purpose |
|------|----------|---------|
| useLifetimeStats | `hooks/useLifetimeStats.ts` | Total workouts, longest streak, favorite type |

### Components Modified
- `CollapsibleSection` — Unified with `variant` prop (`default` | `lined`)
- All 74 source files — Migrated from Lucide to Phosphor icons

### Components Deleted
- `src/components/workout/CollapsibleSection.tsx` — Replaced by unified `ui/CollapsibleSection`

### Files Moved
- 6 API docs moved from `src/` to `docs/reference/`
- 7 ralph-loop/journal files moved from root to `docs/archive/`
- 6 color system proposal files moved from root to `docs/archive/`

### Barrel Exports Fixed
- `src/components/social/index.ts` — Expanded from 1 export to 12 exports
- `src/components/profile/index.ts` — Created with 8 exports

## Profile.tsx Decomposition
- **Before**: 1,038 lines, 1 file, 15+ state variables
- **After**: 102 lines (thin composition) + 8 sub-component files
- Each sub-component owns its own state and calls hooks directly (no prop drilling)

## CollapsibleSection Unification
- **Before**: 3 implementations (ui/, workout/, review/ReflectionForm private)
- **After**: 1 unified in `ui/CollapsibleSection.tsx` with `variant` prop
  - `variant="default"` — Card-based with icon circle (Profile sections)
  - `variant="lined"` — Compact with accent bar (Workout warmup sections)
  - ReflectionForm's "CollapsibleSection" kept as-is (it's fundamentally a CollapsibleTextArea, not the same pattern)

## Dead Code Removed
- Duplicate `WorkoutSplitSelector.tsx` (redundant with existing `WorkoutSplitSection.tsx`)
- Orphaned API documentation moved out of `src/`
- Root-level working documents moved to `docs/archive/`
- Unused `get` parameter in `reviewStore.ts`
- Misplaced eslint-disable directive in `socialService.ts`

## Build & Lint Status
- **Build**: `npx vite build` passes cleanly
- **Lint**: All modified/created files pass with 0 errors
- **Pre-existing lint issues**: ~260 errors in test files (unchanged, expected)

## Verdict: CLEAN
