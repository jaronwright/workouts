# Combined Prompt: Glute Hypertrophy Split + Pre-Production Testing

## Usage

```bash
cd /Users/jaronwright/src/workouts && claude --dangerously-skip-permissions "$(cat CLAUDE_FINAL_PROMPT.md)"
```

---

## Prompt

You are an autonomous senior full-stack engineer. You have TWO jobs, executed in order:

**PART 1:** Add the Glute Hypertrophy workout split to the app.
**PART 2:** Run a comprehensive pre-production audit — find bugs, fix them, and write tests.

Do NOT ask for any user input at any point. Read every referenced file before editing. Run `npm run build` between major steps to catch errors early.

---

# ═══════════════════════════════════════════════════════════
# PART 1: ADD GLUTE HYPERTROPHY SPLIT
# ═══════════════════════════════════════════════════════════

Add a new workout split called **"Glute Hypertrophy"** to the app. This is a 5-day, lower-body-biased split (3 lower days, 2 upper days) designed for glute-focused hypertrophy, inspired by the "Strong Curves" methodology.

---

## THE SPLIT

**Plan Name:** Glute Hypertrophy
**Plan ID:** `00000000-0000-0000-0000-000000000007`
**Days:** 5 workout days + 2 rest days
**Default Schedule:** Day 1, Day 2, Rest, Day 3, Day 4, Rest, Day 5 (then rest on Day 7)

### Day 1: Lower A — Posterior Chain (Glutes & Hamstrings)
Focus: Heavy compound movements to build glute mass.

**Warm-up (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Incline Treadmill Walk | — | 5 min | 3% incline, moderate pace |
| Banded Glute Bridges | 2 | 15 | Squeeze at top, pause 2 sec |
| Banded Lateral Walks | 2 | 10/side | Fire up glute medius |
| Leg Swings | 2 | 10/side | Forward/back + side to side |

**Main Lifting (50 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Barbell Hip Thrust | 4 | 8-10 | 2-3 min rest, heavy, pause at top |
| Romanian Deadlift | 4 | 8-10 | 2 min rest, hinge deep, feel hamstrings |
| Glute-focused Hyperextension | 3 | 12-15 | Round upper back, squeeze glutes |
| Seated Leg Curl | 3 | 10-12 | 90 sec rest, slow eccentric |
| Single-leg Hip Thrust | 3 | 10-12/side | Body weight or light load, per side |
| Cable Pull-through | 3 | 12-15 | Hinge, squeeze glutes at top |

**Abs/Core (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Dead Bug | 3 | 10/side | Brace core, low back flat on floor |
| Plank | 3 | 45 sec | Squeeze glutes, don't sag |
| Pallof Press | 3 | 10/side | Anti-rotation, controlled |

---

### Day 2: Upper A — Push & Pull (Structure & Posture)
Focus: Maintaining upper body strength and balanced posture.

**Warm-up (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Incline Treadmill Walk | — | 3 min | Light pace, loosen up |
| Band Pull-Aparts | 2 | 15 | Shoulders back, squeeze rear delts |
| Arm Circles | 2 | 10/side | Forward and backward |
| Cat-Cow Stretch | 2 | 8 | Open up thoracic spine |

**Main Lifting (45 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Incline Dumbbell Press | 4 | 8-10 | 2 min rest, 30° incline, full ROM |
| Lat Pulldown | 4 | 10-12 | 90 sec rest, pull to chest, squeeze lats |
| Overhead Press (Dumbbell) | 3 | 8-10 | 90 sec rest, brace core, full lockout |
| Single-arm Dumbbell Row | 3 | 10-12/side | 90 sec rest, pull to hip, squeeze back |
| Lateral Raises | 3 | 12-15 | 60 sec rest, slight lean forward |
| Tricep Pushdown | 3 | 12-15 | 60 sec rest, elbows pinned |
| Face Pulls | 3 | 15 | 60 sec rest, pull to forehead, external rotate |

**Abs/Core (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Hanging Knee Raises | 3 | 12-15 | Control the swing |
| Cable Woodchop | 3 | 10/side | Rotate through core, not arms |

---

### Day 3: Lower B — Anterior Chain (Quads & Glutes)
Focus: Squat patterns and unilateral movements.

**Warm-up (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Bike or Stair Stepper | — | 5 min | Easy pace, warm up legs |
| Bodyweight Squats | 2 | 15 | Full depth, activate quads |
| Walking Quad Stretch | 2 | 8/side | Dynamic, open hip flexors |
| Banded Monster Walks | 2 | 10/side | Forward and lateral |

**Main Lifting (50 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Barbell Squat | 4 | 6-8 | 2-3 min rest, below parallel, brace core |
| Bulgarian Split Squat | 3 | 10-12/side | 90 sec rest, lean forward slightly for glutes |
| Walking Lunges | 3 | 12/side | 90 sec rest, long stride, push through heel |
| Leg Press | 3 | 10-12 | High foot placement for glutes, full depth |
| Leg Extension | 3 | 12-15 | 60 sec rest, squeeze at top |
| Leg Curl (Lying) | 3 | 10-12 | 60 sec rest, slow eccentric |

**Abs/Core (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Reverse Crunch | 3 | 15 | Curl pelvis toward ribs |
| Side Plank | 3 | 30 sec/side | Stack hips, don't sag |
| Bird Dog | 3 | 10/side | Controlled, extend opposite arm and leg |

---

### Day 4: Upper B — Sculpting (Shoulders & Back Focus)
Focus: Lighter weight, higher reps, aesthetic sculpting.

**Warm-up (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Jump Rope or Jumping Jacks | — | 2 min | Get heart rate up |
| Band Dislocates | 2 | 10 | Open up shoulders |
| Scapula Push-ups | 2 | 10 | Protract and retract shoulder blades |

**Main Lifting (40 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Face Pulls | 3 | 15-20 | 60 sec rest, posture focus |
| Lateral Raises | 4 | 12-15 | 60 sec rest, controlled tempo |
| Push-ups | 3 | 12-15 | Full range, chest to floor |
| Cable Row (Seated) | 3 | 12-15 | 60 sec rest, squeeze shoulder blades |
| Bicep Curl (Dumbbell) | 3 | 12-15 | 60 sec rest, no swinging |
| Overhead Tricep Extension | 3 | 12-15 | 60 sec rest, stretch at bottom |
| Rear Delt Fly | 3 | 15-20 | Light weight, slow squeeze |

**Abs/Core (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Ab Wheel Rollout | 3 | 10 | On knees if needed, brace hard |
| Russian Twist | 3 | 15/side | Controlled rotation |

---

### Day 5: Lower C — Glute Isolation (Pump Day)
Focus: High reps, metabolic stress, shaping. No heavy compounds.

**Warm-up (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Bike | — | 5 min | Easy spin, warm up |
| Banded Clamshells | 2 | 15/side | Activate glute medius |
| Banded Fire Hydrants | 2 | 12/side | Squeeze at top |
| Glute Bridge Hold | 2 | 20 sec | Squeeze and hold at top |

**Main Lifting (45 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Cable Glute Kickback | 4 | 15/side | 60 sec rest, squeeze at top, no swinging |
| Abductor Machine | 4 | 15-20 | 60 sec rest, slow and controlled |
| Cable Pull-through | 3 | 15-20 | Hinge, full glute contraction at top |
| Frog Pumps | 3 | 20-25 | Feet together, knees out, high reps |
| Banded Lateral Walk | 3 | 15/side | Stay low in quarter squat |
| Step-ups (Dumbbell) | 3 | 12/side | Drive through heel, glute focus |
| Smith Machine Hip Thrust | 3 | 12-15 | Moderate weight, full squeeze |

**Abs/Core (10 min):**
| Exercise | Sets | Reps | Notes |
|----------|------|------|-------|
| Flutter Kicks | 3 | 20 | Low back stays on floor |
| Glute Bridge March | 3 | 10/side | Hold bridge, alternate legs |
| Mountain Climbers | 3 | 20 | Controlled, engage core |

---

## PART 1 — IMPLEMENTATION STEPS

### Step 1: Create the Database Migration

**File:** `supabase/migrations/20240217000000_add_glute_hypertrophy_split.sql`

Follow the exact same UUID convention as `20240210000000_add_workout_splits.sql`:
- Plan ID: `00000000-0000-0000-0000-000000000007`
- Day IDs: `00000000-0000-0000-0000-000000000071` through `...075` (5 days)
- Section IDs: `00000000-0000-0000-0000-000000000711` (Day 1 Warm-up), `...712` (Day 1 Main), `...713` (Day 1 Abs), `...721` (Day 2 Warm-up), etc.

Insert the plan:
```sql
INSERT INTO workout_plans (id, name) VALUES
  ('00000000-0000-0000-0000-000000000007', 'Glute Hypertrophy');
```

Insert all 5 workout_days:
```sql
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000007', 1, 'Lower A (Glutes & Hamstrings)'),
  ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000007', 2, 'Upper A (Push & Pull)'),
  ('00000000-0000-0000-0000-000000000073', '00000000-0000-0000-0000-000000000007', 3, 'Lower B (Quads & Glutes)'),
  ('00000000-0000-0000-0000-000000000074', '00000000-0000-0000-0000-000000000007', 4, 'Upper B (Shoulders & Back)'),
  ('00000000-0000-0000-0000-000000000075', '00000000-0000-0000-0000-000000000007', 5, 'Lower C (Glute Isolation)');
```

Then insert exercise_sections (3 per day: Warm-up, Main Lifting, Abs/Core) and plan_exercises for every exercise listed above. Follow the EXACT format of the existing migration — use `NULL` for cardio-style exercises with no sets count, use `is_per_side` for unilateral exercises, include `notes`, and use proper `reps_unit` (`'reps'`, `'seconds'`, `'minutes'`).

### Step 2: Update `src/config/planConstants.ts`

Add the new plan ID and split name:
```typescript
export const GLUTE_HYPERTROPHY_PLAN_ID = '00000000-0000-0000-0000-000000000007'

// Add to SPLIT_NAMES:
[GLUTE_HYPERTROPHY_PLAN_ID]: 'Glute Hypertrophy',
```

### Step 3: Update `src/config/workoutConfig.ts`

Add WEIGHTS_CONFIG entries for the 5 new day names. Use warm pink/rose tones to differentiate from other splits:

```typescript
// Glute Hypertrophy days
'lower a': { color: '#F43F5E', bgColor: '#F43F5E20', gradient: 'from-rose-500 to-rose-400', icon: Footprints },
'upper a': { color: '#FB923C', bgColor: '#FB923C20', gradient: 'from-orange-400 to-orange-300', icon: ArrowUp },
'lower b': { color: '#EC4899', bgColor: '#EC489920', gradient: 'from-pink-500 to-pink-400', icon: Footprints },
'upper b': { color: '#F59E0B', bgColor: '#F59E0B20', gradient: 'from-amber-500 to-amber-400', icon: ArrowUp },
'lower c': { color: '#E879F9', bgColor: '#E879F920', gradient: 'from-fuchsia-400 to-fuchsia-300', icon: Footprints },
```

Add WORKOUT_DISPLAY_NAMES entries:
```typescript
'lower a': 'Lower A',
'upper a': 'Upper A',
'lower b': 'Lower B',
'upper b': 'Upper B',
'lower c': 'Lower C',
```

**Important:** The `getWeightsStyleByName()` function uses keyword matching. The names "Lower A" and "Upper A" will match the existing `lower`/`upper` keywords. To prevent this, add DIRECT lookups BEFORE the keyword fallback. Read the function and ensure the direct lookup on line ~266 (`if (WEIGHTS_CONFIG[lower]) return WEIGHTS_CONFIG[lower]`) catches these. The DB names are `'Lower A (Glutes & Hamstrings)'` etc. — the function strips to first word, so we need to handle multi-word matches.

Update `getWeightsStyleByName()` to check for "lower a", "lower b", "lower c", "upper a", "upper b" patterns BEFORE the generic "lower"/"upper" fallback:
```typescript
// Add these before the generic keyword checks:
if (lower.includes('lower a')) return WEIGHTS_CONFIG['lower a']
if (lower.includes('lower b')) return WEIGHTS_CONFIG['lower b']
if (lower.includes('lower c')) return WEIGHTS_CONFIG['lower c']
if (lower.includes('upper a')) return WEIGHTS_CONFIG['upper a']
if (lower.includes('upper b')) return WEIGHTS_CONFIG['upper b']
```

### Step 4: Update `src/components/onboarding/OnboardingWizard.tsx`

Add the import:
```typescript
import { GLUTE_HYPERTROPHY_PLAN_ID } from '@/config/planConstants'
```

Add a new split card in the onboarding wizard. Find where the existing 5 split cards are rendered and add a 6th. Use a description like:

**Title:** Glute Hypertrophy
**Subtitle:** 3 Lower / 2 Upper · 5 days
**Description:** Lower body focused with 3 glute days and 2 upper body days. Based on the Strong Curves approach.

### Step 5: Update `src/pages/Profile.tsx`

Find the split selection section and add the new split button. Match the existing pattern for the other 5 splits.

### Step 6: Update `src/services/scheduleService.ts`

In `initializeDefaultSchedule()`, add a case for the Glute Hypertrophy plan. Import the new plan ID:

```typescript
import { GLUTE_HYPERTROPHY_PLAN_ID } from '@/config/planConstants'
```

Add the default schedule logic:
```typescript
} else if (planId === GLUTE_HYPERTROPHY_PLAN_ID) {
  // Glute Hypertrophy: Lower A, Upper A, Rest, Lower B, Upper B, Lower C, Rest
  defaultSchedule = [
    { day_number: 1, workout_day_id: workoutDays?.[0]?.id || null, is_rest_day: false },
    { day_number: 2, workout_day_id: workoutDays?.[1]?.id || null, is_rest_day: false },
    { day_number: 3, is_rest_day: true, workout_day_id: null },
    { day_number: 4, workout_day_id: workoutDays?.[2]?.id || null, is_rest_day: false },
    { day_number: 5, workout_day_id: workoutDays?.[3]?.id || null, is_rest_day: false },
    { day_number: 6, workout_day_id: workoutDays?.[4]?.id || null, is_rest_day: false },
    { day_number: 7, is_rest_day: true, workout_day_id: null }
  ]
}
```

Place this BEFORE the `workoutDays.length === 2` (Upper/Lower) check to ensure it's matched by ID.

### Step 7: Update the `getWeightsKey()` function in `ScheduleDayEditor.tsx`

Read `src/components/schedule/ScheduleDayEditor.tsx`. The `getWeightsKey()` helper maps workout names to WEIGHTS_CONFIG keys. It currently handles push/pull/legs/upper/lower. Add handling for the Glute Hypertrophy names:

```typescript
if (lower.includes('lower a')) return 'lower a'
if (lower.includes('lower b')) return 'lower b'
if (lower.includes('lower c')) return 'lower c'
if (lower.includes('upper a')) return 'upper a'
if (lower.includes('upper b')) return 'upper b'
```

Add these BEFORE the generic `if (lower.includes('upper'))` and `if (lower.includes('lower'))` checks so they match first.

### Step 8: Build & Test (Part 1 Checkpoint)

1. Run `npm run build` — zero errors
2. Run `npm run lint` — fix any issues
3. Run `npx vitest run` — all tests pass, fix any that break

### Step 9: Write Glute Hypertrophy Tests

**Extend:** `src/config/__tests__/workoutConfig.test.ts`
- Test `getWeightsStyleByName()` with 'Lower A (Glutes & Hamstrings)' returns the lower a style (not generic lower)
- Test `getWeightsStyleByName()` with 'Upper A (Push & Pull)' returns the upper a style (not generic upper)
- Test `getWorkoutDisplayName()` with all 5 new day names returns correct display names

**Extend:** `src/config/__tests__/planConstants.test.ts`
- Test GLUTE_HYPERTROPHY_PLAN_ID exists and equals the correct UUID
- Test SPLIT_NAMES includes 'Glute Hypertrophy'

**Extend:** `src/services/__tests__/scheduleService.test.ts` or `src/services/__tests__/scheduleService.newSplits.test.ts`
- Test `initializeDefaultSchedule()` with GLUTE_HYPERTROPHY_PLAN_ID creates the correct 5-workout + 2-rest default

### Step 10: Final Part 1 Verification

1. Run `npm run build` — zero errors
2. Run `npm run lint` — zero errors
3. Run `npx vitest run --reporter=verbose` — all tests pass
4. Verify no hardcoded plan ID references exist (should always use `GLUTE_HYPERTROPHY_PLAN_ID`)

**STOP.** Confirm Part 1 is fully green (build + lint + tests) before proceeding to Part 2.

---

# ═══════════════════════════════════════════════════════════
# PART 2: PRE-PRODUCTION TESTING, BUG FIXING & TEST COVERAGE
# ═══════════════════════════════════════════════════════════

Now perform a comprehensive pre-production audit. Your job is to find every remaining bug, fix it, and write tests that lock in correctness — so this app is production-ready when you're done.

**IMPORTANT:** The Glute Hypertrophy split you just added in Part 1 is now part of the app. Include it in all checks below (there are now **6 workout splits**, not 5).

---

## APP OVERVIEW

This is a workout tracker PWA with:
- **6 workout splits**: Push/Pull/Legs, Upper/Lower, Full Body (5 days), Bro Split (5 days), Arnold Split (3-day cycle×2), **Glute Hypertrophy (3 lower / 2 upper)**
- **6 cardio types**: Running, Cycling, Stair Stepper, Swimming, Rower, Boxing
- **6 mobility categories**: Core, Hip/Knee/Ankle, Spine, Shoulder/Elbow/Wrist, Full Body Recovery, Shoulder Prehab — each with 4 duration variants (15/30/45/60 min)
- **Multi-workout per day**: Users can schedule 2+ workouts per day with count badges and an overtraining warning at 3+
- **7-day cycle scheduling**: Not calendar-based — rotates through a 7-day cycle
- **PWA with offline support**: Service worker caches API responses (excluding auth endpoints)

### Tech Stack
- React 19, TypeScript 5.9, Vite 7, TailwindCSS 4
- Supabase (PostgreSQL + Auth + Storage), TanStack Query 5, Zustand 5
- Motion (Framer Motion), React Router 7, Lucide icons
- Vitest 4, React Testing Library, MSW

### Architecture
```
Pages → Components → Custom Hooks → TanStack Query → Services → Supabase → PostgreSQL (RLS)
                                                    ↘ Zustand (ephemeral UI state)
```

---

## PHASE 1: ENVIRONMENT SETUP & BASELINE

1. Run `npm install` to ensure all dependencies are present.
2. Run `npm run build` to verify the app compiles cleanly. If it fails, fix every build error before continuing.
3. Run `npm run lint` to check for lint errors. Fix any that are actual problems (not stylistic preferences).
4. Run `npm run test:run` to get the current test baseline. Record the number of tests, pass count, fail count, and overall coverage.
5. If any existing tests fail, fix them first. The baseline must be green before you proceed.

**Deliverable:** Record baseline stats in `TEST_REPORT.md` (create or append):
```
## Pre-Production Audit — [date]
### Baseline
- Tests: X passing, Y failing
- Build: PASS/FAIL
- Lint: X errors, Y warnings
```

---

## PHASE 2: STATIC ANALYSIS & BUG HUNTING

Go through every source file and hunt for bugs. For each file, read it carefully and look for the categories below. When you find a bug, fix it immediately and write a test for it.

### 2A: Auth & Session Management
**Files:** `src/stores/authStore.ts`, `src/hooks/useAuth.ts`, `src/pages/Auth.tsx`, `src/pages/AuthCallback.tsx`, `src/App.tsx`

Check for:
- Memory leaks: Is `onAuthStateChange` subscription cleaned up? If not, add cleanup.
- Race conditions: Does `getSession()` run before `onAuthStateChange` is registered? If so, reorder.
- Double initialization: Are auth listeners registered more than once (App.tsx + useAuth.ts)?
- Session refresh: Does the app handle expired tokens and 401 responses gracefully?
- OAuth callback: Does AuthCallback.tsx handle error states, timeouts, and edge cases?
- ProtectedRoute: Can users briefly see protected content before redirect? Is there a loading gate?
- Console statements: Remove any `console.log` or `console.error` debug statements that shouldn't be in production.

### 2B: Workout Session Lifecycle
**Files:** `src/pages/Workout.tsx`, `src/hooks/useWorkoutSession.ts`, `src/services/workoutService.ts`, `src/stores/workoutStore.ts`

Check for:
- Stale closures: Do event handlers capture stale state (especially in ExerciseCard's handleToggleUnit)?
- Session persistence: Can a user navigate away and resume their session?
- Concurrent sessions: What happens if a user has two active sessions?
- Set logging: Are exercise sets validated (no negative weights, no zero reps)?
- Session completion: Does completing a session clear all ephemeral state in workoutStore?
- Query cache: Are TanStack Query cache keys consistent? Do mutations properly invalidate related queries?
- PR detection: Does `prService` correctly detect new personal records?
- Missing onError: Do ALL TanStack Query mutations have `onError` callbacks that show toast messages?

### 2C: Cardio & Timer Logic
**Files:** `src/pages/CardioWorkout.tsx`, `src/services/templateWorkoutService.ts`

Check for:
- Timer stale closure: Does the timer interval callback read stale values of `isPaused` or `elapsedTime`? Timer state should use refs, not stale closure variables.
- Timer cleanup: Are intervals cleared on unmount, pause, and completion?
- Unsafe ref access: Is `startTimeRef.current` accessed with `!` (non-null assertion) when it could be null?
- Quick log: Does quick-logging a cardio session work without starting a full timer?
- Template service fallback: Does `templateWorkoutService` silently fall back to in-memory storage, causing data loss on refresh? If so, it should throw errors instead.
- Error handling: Are `onError` callbacks present on all mutations? Do they show user-visible error messages via toast?
- Console statements: Remove any `console.log` or `console.warn` debug statements from `templateWorkoutService.ts`.

### 2D: Mobility Workouts
**Files:** `src/pages/MobilityWorkout.tsx`, `src/pages/MobilityDurationPicker.tsx`, `src/hooks/useMobilityTemplates.ts`, `src/services/scheduleService.ts` (functions: `getMobilityTemplatesByCategory`, `getMobilityCategories`)

Check for:
- Hardcoded duration: Is anything still hardcoded to 15 minutes instead of reading `template.duration_minutes`?
- Duration picker: Does it correctly filter templates by category and navigate to `/mobility/:templateId`?
- Route params: Are route params validated? What if someone navigates to `/mobility/invalid-category/select`?
- Empty state: What happens if a category has no templates?
- Home page navigation: Does tapping a mobility category on Home navigate to `/mobility/:category/select` (duration picker) NOT directly to a template?
- Template loading: Is there proper loading/error state while fetching templates?

### 2E: Schedule & Multi-Workout Per Day
**Files:** `src/services/scheduleService.ts`, `src/hooks/useSchedule.ts`, `src/components/schedule/ScheduleDayEditor.tsx`, `src/components/workout/ScheduleWidget.tsx`, `src/pages/Schedule.tsx`, `src/hooks/useCalendarData.ts`

Check for:
- ScheduleWidget: Does it store ALL workouts per day as arrays (`Map<number, ScheduleDay[]>`)? Does it show "+ N more" for multi-workout days?
- Schedule page strip: Does the 7-day pill strip show count numbers for multi-workout days?
- CalendarDayCell: Does it show count badges (not just "+N" text) when multiple sessions OR projections exist?
- useCalendarData: Does the schedule map store arrays? Does `projectedCount` field exist on CalendarDay?
- Overtraining warning: Does ScheduleDayEditor show an amber warning when 3+ workouts are selected?
- Console cleanup: Are there any remaining `console.log` statements in `saveScheduleDayWorkouts()`? Only `console.warn` (overtraining) and `console.error` (failures) should remain.
- Delete-then-insert: Does `saveScheduleDayWorkouts()` have proper error recovery if the insert fails after the delete succeeds?

### 2F: Calendar & History
**Files:** `src/pages/History.tsx`, `src/pages/SessionDetail.tsx`, `src/pages/CardioSessionDetail.tsx`, `src/hooks/useCalendarData.ts`, `src/components/calendar/CalendarDayCell.tsx`, `src/components/calendar/CalendarGrid.tsx`, `src/components/calendar/SelectedDayPanel.tsx`

Check for:
- Multi-workout display: Does SelectedDayPanel show ALL workouts for a day (not just the first)?
- Count badge: Does CalendarDayCell show count badges for both completed sessions AND projected multi-workout days?
- Timezone boundaries: Are workouts at 11:55 PM displayed on the correct date?
- Empty states: What shows when history is completely empty? When a day has no workouts?
- Session deletion: Can users delete sessions from the detail view? Does it update the calendar?
- Month navigation: Does navigating months preserve selected state?

### 2G: Profile & Account Management
**Files:** `src/pages/Profile.tsx`, `src/services/profileService.ts`, `src/hooks/useProfile.ts`, `src/components/profile/AvatarUpload.tsx`, `src/services/avatarService.ts`

Check for:
- Error swallowing: Does `profileService` catch and silently discard errors (including network failures)? It should propagate errors.
- Account deletion: Does `deleteUserAccount()` clean up all user data?
- Avatar upload: Is image compression applied? Is there a file size limit? What happens with invalid formats?
- Split switching: When a user changes their workout split, is the old schedule cleared?
- Console cleanup: Remove debug `console.error` statements in Profile.tsx (around split/schedule updates).

### 2H: Onboarding
**Files:** `src/components/onboarding/OnboardingWizard.tsx`, `src/components/onboarding/OnboardingDayRow.tsx`

Check for:
- All 6 splits present: Does the wizard show cards for PPL, Upper/Lower, Full Body, Bro Split, Arnold Split, **AND Glute Hypertrophy**?
- Plan IDs: Are plan IDs imported from `src/config/planConstants.ts` (not hardcoded)?
- Default schedule: Does selecting a split correctly initialize a default 7-day schedule?
- Console cleanup: Remove debug `console.error` statements.

### 2I: PWA & Service Worker
**File:** `vite.config.ts`

Check for:
- Auth endpoint caching: The Workbox urlPattern should use a negative lookahead to EXCLUDE Supabase auth endpoints (`/auth/v1/`). Currently uses `(?!auth)` — verify this is correct.
- Error response caching: `cacheableResponse.statuses` should be `[200]` only — not caching status 0 or 5xx.
- Cache sizes: Verify limits are reasonable (50 API, 100 assets).

### 2J: Cross-Cutting Concerns
Check ALL source files for:
- Missing `onError` callbacks on TanStack Query mutations — should show toast on failure.
- Missing loading states — buttons should be disabled during mutations (`isPending`/`loading` prop).
- Missing TypeScript null checks — especially on `.data` from Supabase queries.
- `useEffect` cleanup functions missing for timers, subscriptions, and intervals.
- Remaining `console.log` statements — remove ALL from production code. Keep `console.error` for actual errors only.
- Hardcoded values that should be constants or config.
- `any` types that should be properly typed.
- Unused imports.

**Deliverable:** For every bug found, record in `TEST_REPORT.md` under `### Bugs Found & Fixed` with severity, file, description, and fix.

---

## PHASE 3: RUNTIME VALIDATION

After fixing all static analysis bugs:

1. Run `npm run build` — must pass cleanly.
2. Run `npm run lint` — fix any new issues.
3. Run `npm run test:run` — all existing tests must pass.

If anything fails, fix it before proceeding.

---

## PHASE 4: COMPREHENSIVE UNIT TEST CREATION

Write tests for every gap below. Use Vitest + React Testing Library. Follow existing test patterns in the codebase. Mock Supabase via the existing patterns (vi.mock or MSW).

### Existing test files — DO NOT duplicate. Extend where noted.

### 4A: Auth Tests (HIGH PRIORITY)
**Extend:** `src/stores/__tests__/authStore.test.ts`
- Test `signIn()` with valid and invalid credentials
- Test `signUp()` with valid input and duplicate email
- Test `signOut()` clears session and user state
- Test `resetPassword()` sends reset email
- Test `refreshSession()` updates token
- Test `initialize()` restores session from storage
- Test `onAuthStateChange` listener cleanup

**Create:** `src/pages/__tests__/AuthCallback.test.tsx`
- Test successful OAuth callback redirects to home
- Test error in callback shows error state

### 4B: Workout Session Tests (HIGH PRIORITY)
**Extend:** `src/services/__tests__/workoutService.test.ts`
- Test `startWorkoutSession()` creates session
- Test `logExerciseSet()` with valid data
- Test `logExerciseSet()` rejects invalid data (negative weight, zero reps)
- Test `completeWorkoutSession()` marks complete
- Test `deleteWorkoutSession()` removes session and sets
- Test `getActiveSession()` returns current or null
- Test `getExerciseHistory()` returns progression data

**Create:** `src/components/workout/__tests__/ExerciseCard.test.tsx`
- Test renders exercise name, sets, reps
- Test weight unit toggle (lbs ↔ kg)
- Test mark set complete/incomplete
- Test progression badge display

### 4C: Schedule & Multi-Workout Tests (HIGH PRIORITY)
**Extend:** `src/services/__tests__/scheduleService.test.ts`
- Test `saveScheduleDayWorkouts()` with 1, 2, and 3 workouts
- Test `saveScheduleDayWorkouts()` with rest day
- Test `saveScheduleDayWorkouts()` overtraining console.warn at 4+ workouts
- Test `initializeDefaultSchedule()` for each split type (PPL, Upper/Lower, Full Body, Bro, Arnold, **Glute Hypertrophy**)
- Test `clearUserSchedule()` removes all entries
- Test `getMobilityTemplatesByCategory()` filters correctly
- Test `getMobilityCategories()` returns unique categories

**Create:** `src/components/schedule/__tests__/ScheduleDayEditor.test.tsx`
- Test renders current day's workouts
- Test add workout to day
- Test remove workout from day
- Test overtraining warning appears at 3+ workouts
- Test overtraining warning hidden when < 3 workouts
- Test overtraining warning not shown for rest days
- Test save calls mutation with correct data

**Create:** `src/components/workout/__tests__/ScheduleWidget.test.tsx`
- Test renders single workout with name and icon
- Test renders "+ N more" when multiple workouts exist for today
- Test handles rest days
- Test handles empty schedule

### 4D: Mobility Tests (HIGH PRIORITY)
**Create:** `src/pages/__tests__/MobilityDurationPicker.test.tsx`
- Test renders all 4 duration options (15, 30, 45, 60)
- Test clicking a duration navigates to `/mobility/:templateId`
- Test shows correct labels (Quick, Standard, Extended, Full Session)
- Test handles invalid/missing category param (shows "Not Found")
- Test loading state

**Create:** `src/hooks/__tests__/useMobilityTemplates.test.ts`
- Test `useMobilityCategories()` fetches categories
- Test `useMobilityVariants(category)` fetches templates filtered by category
- Test `useMobilityVariants('')` is disabled (enabled: !!category)

### 4E: Calendar & History Tests (MEDIUM PRIORITY)
**Create:** `src/hooks/__tests__/useCalendarData.test.ts`
- Test generates correct month grid
- Test marks days with workouts (completed sessions)
- Test handles multi-workout days (projectedCount > 1)
- Test handles empty months
- Test timezone boundary handling

**Extend:** `src/components/calendar/__tests__/CalendarDayCell.test.tsx`
- Test single session shows workout icon
- Test 2+ sessions show count badge with total number
- Test multi-projected days (day.projectedCount > 1) show count badge
- Test green completion dot shows when completed
- Test missed workout red dot for past unfinished days

**Create:** `src/pages/__tests__/SessionDetail.test.tsx`
- Test renders session with exercises and sets
- Test delete session flow
- Test loading and error states

**Create:** `src/pages/__tests__/CardioSessionDetail.test.tsx`
- Test renders cardio session with time/distance
- Test delete session flow

### 4F: Profile Tests (MEDIUM PRIORITY)
**Extend:** `src/services/__tests__/profileService.test.ts`
- Test `getProfile()` returns profile data
- Test `getProfile()` propagates network errors (not swallowed)
- Test `updateProfile()` persists changes
- Test `deleteUserAccount()` cascades cleanup
- Test `upsertProfile()` creates when missing, updates when existing

### 4G: Onboarding Tests (MEDIUM PRIORITY)
**Extend:** `src/components/onboarding/__tests__/OnboardingWizard.test.tsx`
- Test all 6 workout split cards are displayed (PPL, Upper/Lower, Full Body, Bro, Arnold, **Glute Hypertrophy**)
- Test selecting a split advances to schedule step
- Test completing onboarding initializes default schedule
- Test completing onboarding navigates to home

### 4H: Timer & Cardio Tests (MEDIUM PRIORITY)
**Extend:** `src/pages/__tests__/CardioWorkout.test.tsx`
- Test timer starts counting
- Test timer pause freezes count
- Test timer resume continues from paused value
- Test quick log mode (no timer)
- Test session completion saves correct duration
- Test `onError` handler shows toast on failure

### 4I: Rest Timer Tests (MEDIUM PRIORITY)
**Extend:** `src/components/workout/__tests__/RestTimer.test.tsx`
- Test timer counts down from set value
- Test timer pause/resume
- Test timer auto-stops at zero
- Test timer reset

### 4J: PR & Progression Tests (LOW PRIORITY)
**Extend:** `src/services/__tests__/prService.test.ts`
- Test `checkAndUpdatePR()` detects new PR
- Test `checkAndUpdatePR()` ignores non-PR sets
- Test `getRecentPRs()` returns chronological PRs

**Extend:** `src/services/__tests__/progressionService.test.ts`
- Test `getProgressionSuggestion()` recommends weight increase after consistent performance
- Test handles first-time exercises (no history)

### 4K: Template Workout Service Tests (LOW PRIORITY)
**Extend:** `src/services/__tests__/templateWorkoutService.test.ts`
- Test `startTemplateWorkout()` creates session
- Test `completeTemplateWorkout()` marks complete with duration
- Test `quickLogTemplateWorkout()` creates and completes in one call
- Test error propagation (errors thrown, not caught silently)

### 4L: Home Page Tests (LOW PRIORITY)
**Extend:** `src/pages/__tests__/Home.test.tsx`
- Test shows active session resume card when session exists
- Test shows today's scheduled workouts
- Test mobility section shows 6 category cards navigating to duration picker
- Test setTimeout cleanup on unmount
- Test handles null workout_day gracefully

### 4M: Schedule Page Tests (LOW PRIORITY)
**Extend:** `src/pages/__tests__/Schedule.test.tsx`
- Test 7-day icon strip shows count number for multi-workout days
- Test single workout day shows icon in strip
- Test daily card list shows all workout chips per day
- Test tapping a day opens ScheduleDayEditor

---

## PHASE 5: INTEGRATION & WORKFLOW TESTS

Write tests that simulate complete user workflows end-to-end:

### 5A: Complete Weighted Workout Flow
**File:** `src/pages/__tests__/weightedWorkoutWorkflow.test.tsx`
1. User taps "Push Day" on home → navigates to Workout page
2. Session starts → exercises load in sections
3. User logs 3 sets of bench press (135×10, 155×8, 175×6)
4. Rest timer starts between sets (60s countdown)
5. User completes all exercises → marks workout complete
6. Session appears in History with correct data

### 5B: Mobility Workout Flow
**File:** `src/pages/__tests__/mobilityWorkoutWorkflow.test.tsx`
1. User taps mobility category on Home (e.g., "Hip Mobility")
2. Duration picker shows 4 options (15, 30, 45, 60 min)
3. User selects 30 minutes → navigates to MobilityWorkout with correct template
4. Exercises displayed match 30-minute variant
5. User completes → session logged with 30-minute duration

### 5C: Multi-Workout Day Flow
**File:** `src/pages/__tests__/multiWorkoutWorkflow.test.tsx`
1. User opens Schedule → selects Monday
2. Adds "Push Day" as first workout
3. Adds "Running" as second workout
4. Count badge shows on both schedule page strip and calendar
5. User tries to add 4th workout → overtraining warning appears
6. ScheduleWidget on Home shows "+ 1 more workout"

### 5D: Schedule Change Flow
**File:** `src/pages/__tests__/scheduleChangeWorkflow.test.tsx`
1. User goes to Profile → changes split from PPL to Full Body
2. Confirmation dialog appears → user confirms
3. Old schedule cleared → new default schedule initialized
4. Schedule page shows Full Body workouts
5. Home page shows updated today's workout

### 5E: Profile & Account Flow
**File:** `src/pages/__tests__/profileWorkflow.test.tsx`
1. User updates display name → saved successfully
2. User uploads avatar → compressed and uploaded
3. User changes weight unit to kg → all weights display in kg
4. User changes theme → UI updates immediately

---

## PHASE 6: ERROR RESILIENCE TESTS

**File:** `src/__tests__/errorResilience.test.tsx`

Test that the app handles failures gracefully:

1. **Network failure during workout save** — Toast shows error, data not lost
2. **Auth token expired mid-session** — App refreshes token or redirects to login
3. **Supabase 500 error on schedule save** — Error shown to user, schedule not corrupted
4. **Invalid route param** — `/workout/nonexistent-id` shows error state, not crash
5. **Empty database** — New user with no sessions sees proper empty states everywhere
6. **Rapid button clicks** — Double-clicking "Complete Workout" doesn't create duplicate sessions
7. **Navigation during save** — Leaving page during async operation doesn't cause errors

---

## PHASE 7: BUILD VERIFICATION & FINAL REPORT

1. Run `npm run build` — must pass cleanly with zero errors.
2. Run `npm run lint` — must pass with zero errors (warnings acceptable).
3. Run `npm run test:run` — all tests must pass.
4. Run `npm run test:coverage` — record final coverage numbers.

**Deliverable:** Update `TEST_REPORT.md` with the final report:

```
### Final Results
- Tests: X passing, 0 failing (up from Y at baseline)
- Coverage: XX.XX%
- Build: PASS
- Lint: PASS
- Bugs found and fixed: N

### Bugs Fixed Summary
| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 1 | CRITICAL | file.ts | description | what was fixed |

### New Tests Added
| Category | Tests Added | Files |
|----------|-------------|-------|
| Auth | N | files |
| Workout Session | N | files |
| Schedule & Multi-Workout | N | files |
| Mobility & Duration Picker | N | files |
| Calendar & History | N | files |
| Profile | N | files |
| Onboarding | N | files |
| Timer/Cardio | N | files |
| Workflow/E2E | N | files |
| Error Resilience | N | files |
| TOTAL | N | |

### Coverage by Category
| Category | Lines | Branches | Functions |
|----------|-------|----------|-----------|
| Pages | XX% | XX% | XX% |
| Components | XX% | XX% | XX% |
| Hooks | XX% | XX% | XX% |
| Services | XX% | XX% | XX% |
| Stores | XX% | XX% | XX% |
| Utils | XX% | XX% | XX% |
| Config | XX% | XX% | XX% |
| OVERALL | XX% | XX% | XX% |
```

---

## RULES

1. **Complete ALL of Part 1 before starting Part 2.** Part 1 must have green build + lint + tests.
2. **Fix bugs immediately when found.** Don't just report them — fix them and write a regression test.
3. **Don't break existing tests.** If your fix changes behavior that existing tests rely on, update those tests.
4. **Follow existing code patterns.** Match style, naming conventions, and test patterns already in the codebase.
5. **Every mutation needs an `onError` handler.** If you find one missing, add it with a `toast.error()` call.
6. **No `console.log` in production code.** Remove any you find. Use `console.error` only for actual errors.
7. **No `any` types.** If you find them, add proper types.
8. **Test edge cases, not just happy paths.** Every test file should have at least one error/edge case test.
9. **Run the full test suite after every phase.** Don't let failures accumulate.
10. **Target 80%+ overall coverage.** Prioritize critical paths (auth, workout sessions, schedule, mobility) for 90%+.
11. **Do NOT ask for user input.** Work through everything autonomously.
