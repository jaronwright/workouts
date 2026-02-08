# Mobility Expansion Changelog

## Summary

Expanded the mobility section from 4 types with single 15-minute variants to 6 types with 4 duration variants each (15, 30, 45, 60 minutes), totaling 24 mobility templates.

## Changes

### Database Migration (`supabase/migrations/20240215000000_expand_mobility.sql`)
- Removes the original 4 mobility templates and their linked workout data
- Creates 24 workout_days under the Mobility plan (6 types x 4 durations)
- Creates 24 exercise_sections (one "Main" section per workout day)
- Inserts all exercises for every variant (progressively more exercises as duration increases)
- Creates 24 workout_templates linked to their respective workout_days

### New Mobility Types
1. **Core Stability** (`core`) - 4/7/10/13 exercises
2. **Hip, Knee & Ankle Flow** (`hip_knee_ankle`) - 4/7/10/13 exercises
3. **Spine Mobility** (`spine`) - 4/7/10/13 exercises
4. **Upper Body Flow** (`shoulder_elbow_wrist`) - 4/7/10/13 exercises
5. **Full Body Recovery** (`recovery`) - NEW - 4/8/11/14 exercises
6. **Shoulder Prehab** (`shoulder_prehab`) - NEW - 4/7/10/13 exercises

### UI Changes

#### New Duration Picker Page (`src/pages/MobilityDurationPicker.tsx`)
- Route: `/mobility/:category/select`
- Shows header with mobility type icon and name
- Displays 4 duration cards: Quick (15 min), Standard (30 min), Extended (45 min), Full Session (60 min)
- Each card navigates to the specific template variant at `/mobility/:templateId`

#### Updated Home Page (`src/pages/Home.tsx`)
- Mobility section now shows 6 category cards (one per type) instead of individual templates
- Clicking a mobility card navigates to the duration picker (`/mobility/:category/select`)
- Uses new `useMobilityCategories` hook to fetch unique categories

#### Updated Mobility Workout Page (`src/pages/MobilityWorkout.tsx`)
- Duration display now uses `template.duration_minutes` instead of hardcoded `~15 min`
- Quick log uses the actual template duration instead of hardcoded 15

#### Updated Schedule Day Editor (`src/components/schedule/ScheduleDayEditor.tsx`)
- Groups mobility templates by category, showing only the shortest (15-min) variant per type
- Prevents showing all 24 templates in the schedule picker

### Config Changes (`src/config/workoutConfig.ts`)
- Added `Heart` and `Shield` icon imports from lucide-react
- Added `recovery` config: pink theme (#F472B6)
- Added `shoulder_prehab` config: blue theme (#60A5FA)
- Added display names for "Full Body Recovery" and "Shoulder Prehab"

### New Service Functions (`src/services/scheduleService.ts`)
- `getMobilityTemplatesByCategory(category)` - Fetches all duration variants for a category
- `getMobilityCategories()` - Returns unique mobility categories with a representative template

### New Hooks (`src/hooks/useMobilityTemplates.ts`)
- `useMobilityCategories()` - React Query hook for fetching mobility categories
- `useMobilityVariants(category)` - React Query hook for fetching duration variants

### Routing (`src/App.tsx`)
- Added `/mobility/:category/select` route for the duration picker
- Existing `/mobility/:templateId` route unchanged

### Test Updates
- Updated `Home.test.tsx` to mock `useMobilityCategories` and verify navigation to `/mobility/:category/select`
- Updated `HomeWorkflows.test.tsx` with same category-based mock pattern
- Rewrote `MobilityWorkout.test.tsx` to match actual page behavior (exercise checklist + complete button)
- All 55 tests in the 3 affected files pass

### Build Verification
- `npm run build` passes with zero errors
- `npm run lint` shows only pre-existing warnings in test/coverage files
- Dev server starts successfully
