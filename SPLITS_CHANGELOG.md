# New Workout Splits Changelog

## Summary

Added three new workout splits: **Full Body**, **Bro Split**, and **Arnold Split**, alongside the existing Push/Pull/Legs and Upper/Lower splits. Total supported splits: 5.

## Changes

### 1. Database Migration
- **File:** `supabase/migrations/20240214000000_add_new_splits.sql`
- Added 3 new workout plans with IDs `...004` (Full Body), `...005` (Bro Split), `...006` (Arnold Split)
- Full Body: 5 workout days (A through E), each targeting the entire body with different exercise emphasis
- Bro Split: 5 workout days (Chest, Back, Legs, Shoulders, Arms)
- Arnold Split: 3 workout days (Chest & Back, Shoulders & Arms, Legs)
- Each day has 3 sections: Warm-up, Main Lifting, Abs/Core
- Exercises include proper `reps_unit` (seconds/minutes for timed exercises), `is_per_side` flags, and coaching notes

### 2. Shared Plan Constants
- **New file:** `src/config/planConstants.ts`
- Centralized all 6 plan IDs (PPL, Upper/Lower, Mobility, Full Body, Bro Split, Arnold Split)
- Exported `SPLIT_NAMES` map for plan ID to display name lookup
- Eliminated duplication across OnboardingWizard, Profile, and scheduleService

### 3. Workout Config Updates
- **File:** `src/config/workoutConfig.ts`
- Added 11 new entries to `WEIGHTS_CONFIG` with unique colors/gradients:
  - Full Body A-E: emerald, teal, cyan, sky, blue
  - Bro Split: red (Chest), orange (Back), yellow (Shoulders), purple (Arms)
  - Arnold Split: rose (Chest & Back), fuchsia (Shoulders & Arms)
- Added corresponding entries to `WORKOUT_DISPLAY_NAMES`
- Updated `getWeightsStyleByName()` to do direct config lookup before keyword matching
- Fixed `getWorkoutDisplayName()` to check full name before first-word extraction (fixes multi-word names like "Chest & Back")

### 4. Onboarding Wizard
- **File:** `src/components/onboarding/OnboardingWizard.tsx`
- Added 3 new split selection cards in Step 2 (Split Selection)
- Each card shows: plan name, description, "See more" expandable text, colored day badges
- Cards use the shared `WEIGHTS_CONFIG` styles for badge colors
- Imports plan constants from shared `planConstants.ts`

### 5. Profile Page
- **File:** `src/pages/Profile.tsx`
- Updated split selector from 2-column grid with 2 buttons to a 2-column grid with 5 buttons
- Uses `SPLIT_NAMES` map for dynamic `currentSplitName` display
- Split change flow (confirm modal + onboarding wizard) works for all 5 splits
- Imports plan constants from shared `planConstants.ts`

### 6. Schedule Service
- **File:** `src/services/scheduleService.ts`
- Updated `initializeDefaultSchedule()` with plan-specific schedule patterns:
  - Full Body: A, Rest, B, Rest, C, Rest, Rest (3 workouts/week from 5 options)
  - Bro Split: Chest, Back, Legs, Shoulders, Arms, Rest, Rest (5 on, 2 off)
  - Arnold Split: CB, SA, Legs, CB, SA, Legs, Rest (3-day cycle x2 + 1 rest)
- Uses plan ID matching (not just day count) to distinguish Full Body from Bro Split (both have 5 days)
- Imports plan constants from shared `planConstants.ts`

### 7. Workout Service
- **File:** `src/services/workoutService.ts` (no changes needed)
- `getAllWorkoutDays()` already uses `.neq('plan_id', MOBILITY_PLAN_ID)` which naturally includes the new plans

### 8. New Tests
- `src/config/__tests__/planConstants.test.ts` - Tests plan ID exports, uniqueness, SPLIT_NAMES coverage
- `src/config/__tests__/newSplitsConfig.test.ts` - Tests WEIGHTS_CONFIG entries, display names, `getWeightsStyleByName()`, `getWorkoutDisplayName()` for all new days
- `src/services/__tests__/scheduleService.newSplits.test.ts` - Tests schedule patterns for Full Body (3 on/4 off), Bro Split (5 on/2 off), Arnold Split (6 on/1 off)

## Verification
- `npx vite build` passes with zero errors
- All 112 related tests pass
- Pre-existing lint/test failures in unrelated files remain unchanged
