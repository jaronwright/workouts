# Add New Workout Splits Prompt for Claude Code

## Usage

```bash
cd /Users/jaronwright/src/workouts
claude --dangerously-skip-permissions "$(cat CLAUDE_ADD_SPLITS_PROMPT.md)"
```

---

## Prompt

You are an autonomous senior full-stack engineer. Your job is to add three new workout splits to this workout-tracker app: **Full Body**, **Bro Split**, and **Arnold Split**. These go alongside the existing Push/Pull/Legs and Upper/Lower splits. Do NOT ask for any user input. Make all decisions yourself.

Read every file referenced below BEFORE making any changes. Understand the full existing patterns first.

---

## THE THREE NEW SPLITS

### Plan IDs to Use

- Full Body: `'00000000-0000-0000-0000-000000000004'`
- Bro Split: `'00000000-0000-0000-0000-000000000005'`
- Arnold Split: `'00000000-0000-0000-0000-000000000006'`

### Full Body (5 workout days, user schedules 3/week)

**Day 1: "Full Body A"** — Squat & Press Focus
- Warm-up (10 min): Incline Treadmill Walk (5 min), Air Squats (2x15), Band Pull-Aparts (2x15), Arm Circles (2x10/side)
- Main Lifting (45 min): Goblet Squat (4x8-10), Barbell Bench Press (4x6-8, "2-3 min rest, control descent, ribs down"), Bent Over Barbell Row (3x8-10, "90 sec rest, squeeze shoulder blades"), Overhead Press (3x8-10, "90 sec rest, brace core, full lockout"), Leg Curl (3x12-15, "60 sec rest, control the negative"), Lateral Raises (3x12-15, "60 sec rest, slight lean forward"), EZ Bar Curl (2x10-12, "60 sec rest, control the negative")
- Abs/Core (10 min): Hanging Leg Raises (3x12, "Control the swing, curl pelvis up"), Plank (3x45 sec, "Squeeze glutes, brace core, protect low back")

**Day 2: "Full Body B"** — Hinge & Pull Focus
- Warm-up (10 min): Rowing Machine (5 min), Dead Hangs (2x30 sec), Zombie Walks (2x10/side), Band Rows (2x15)
- Main Lifting (45 min): RDL (4x8-10, "2 min rest, hinge at hips, feel hamstrings"), Pull-Ups (4x8-12, "2-3 min rest, full hang to chin over"), Incline DB Press (3x10-12, "90 sec rest, stretch at bottom"), Leg Press (3x12-15, "90 sec rest, controlled, don't lock knees"), Face Pulls (3x15, "60 sec rest, pull to forehead, external rotate"), Hip Abductor Machine (3x15, "60 sec rest, squeeze at top"), Hammer Curls (2x12, "60 sec rest, no swinging")
- Abs/Core (10 min): Ab Wheel Rollouts (3x10-12, "From knees, brace core, protect low back"), Reverse Crunches (3x15, "Curl hips off floor, no momentum")

**Day 3: "Full Body C"** — Unilateral & Stability Focus
- Warm-up (10 min): Bike or Stair Stepper (5 min), Banded Lateral Walks (2x10 steps/side), Push-Ups (2x12), Hip Circles (2x10/side)
- Main Lifting (45 min): Bulgarian Split Squats (4x10/side, "90 sec rest, upright torso, depth focus"), Single-Arm DB Row (4x10/side, "90 sec rest, brace on bench, squeeze lat"), DB Bench Press (3x10-12, "90 sec rest, equal push from both arms"), Single Leg RDL (3x10/side, "60 sec rest, hinge slow, balance challenge"), Cable Fly (3x12-15, "60 sec rest, squeeze at peak"), Leg Extension (3x12-15, "60 sec rest, squeeze at top"), Tricep Pushdown (2x12-15, "60 sec rest, elbows pinned to sides")
- Abs/Core (10 min): Pallof Press Hold (3x20 sec/side, "Anti-rotation, resist rotation"), Dead Bug (3x10/side, "Anti-extension, low back pressed to floor")

**Day 4: "Full Body D"** — Strength Emphasis
- Warm-up (10 min): Incline Treadmill Walk (5 min), Band Shoulder Dislocates (2x10), Bodyweight Squats (2x15), Scapular Pull-Ups (2x10)
- Main Lifting (50 min): Barbell Back Squat (4x5-6, "3 min rest, brace core, hit depth"), Overhead Press (4x5-6, "3 min rest, strict, no leg drive"), Barbell Row (4x6-8, "2 min rest, pull to lower chest"), Hip Thrust (3x10-12, "90 sec rest, pause and squeeze at top"), Close Grip Lat Pulldown (3x10-12, "90 sec rest, pull to chest, squeeze lats"), Seated Calf Raises (3x15-20, "45 sec rest, pause at stretch")
- Abs/Core (10 min): Hanging Leg Raises (3x15, "Controlled, curl pelvis up at top"), Rope Pulldown Crunches (3x15-20, "Curl ribs to hips, exhale hard")

**Day 5: "Full Body E"** — Pump & Volume Focus
- Warm-up (10 min): Rowing Machine (5 min), Push-Ups (2x15-20), Band Pull-Aparts (2x15), Deep Squat Hold (2 min, reps_unit='minutes')
- Main Lifting (45 min): Leg Press (4x12-15, "90 sec rest, controlled, don't lock knees"), Incline DB Press (3x12-15, "60 sec rest, stretch at bottom"), Cable Row (3x12-15, "60 sec rest, squeeze shoulder blades"), Walking Lunges (3x10/side, "Light DBs or bodyweight, short steps"), Lateral Raises (3x15-20, "45 sec rest, light weight, chase the burn"), Lying Leg Curl (3x12-15, "60 sec rest, control the negative"), Cable Curl (2x15, "45 sec rest, constant tension"), Overhead Rope Extension (2x15, "45 sec rest, full stretch at bottom")
- Abs/Core (10 min): Rope Pulldown Crunches (3x20, "Curl ribs to hips, exhale hard"), Side Plank (2x30 sec/side, "Lateral stability, straight line"), Plank (2x45 sec, "Squeeze glutes, brace core")

### Bro Split (5 workout days)

**Day 1: "Chest"**
- Warm-up (10 min): Incline Treadmill Walk (5 min), Push-Ups (2x15-20, "Full range, controlled, feel the stretch"), Band Pull-Aparts (2x15, "Shoulders back, protect the joints"), Band Shoulder Dislocates (2x10, "Slow and controlled, wide grip")
- Main Lifting (45 min): Barbell Bench Press (4x6-8, "2-3 min rest, control descent, ribs down"), Incline DB Press (4x8-10, "90 sec rest, stretch at bottom"), Weighted Dips (3x8-10, "90 sec rest, lean forward for chest"), Cable Fly (3x12-15, "60 sec rest, squeeze at peak"), Pec Deck Machine (3x12-15, "60 sec rest, deep stretch, controlled squeeze"), Decline DB Press (3x10-12, "60 sec rest, focus on lower chest contraction")
- Abs/Core (10 min): Hanging Leg Raises (3x15, "Control the swing, curl pelvis up"), Rope Pulldown Crunches (3x15-20, "Curl ribs to hips, exhale hard")

**Day 2: "Back"**
- Warm-up (10 min): Rowing Machine (5 min), Dead Hangs (2x30 sec), Scapular Pull-Ups (2x10), Band Rows (2x15)
- Main Lifting (45 min): Pull-Ups (4x8-12, "2-3 min rest, full hang to chin over"), T-Bar Row (4x8-10, "2 min rest, chest supported if needed"), Close Grip Lat Pulldown (3x10-12, "90 sec rest, pull to chest, squeeze lats"), Single-Arm Cable Row (3x12/side, "60 sec rest, pull straight back"), Straight Arm Pulldown (3x12-15, "60 sec rest, feel lats stretch and contract"), Face Pulls (3x15, "60 sec rest, pull to forehead"), DB Shrugs (3x12-15, "60 sec rest, hold at top for 2 sec")
- Abs/Core (10 min): Ab Wheel Rollouts (3x10-12, "From knees, brace core, protect low back"), Plank (3x45 sec, "Squeeze glutes, brace core")

**Day 3: "Legs"**
- Warm-up (10 min): Bike or Stair Stepper (5 min), Air Squats (2x20), Zombie Walks (2x10/side), Banded Lateral Walks (2x10 steps/side), Deep Squat Hold (2 min, reps_unit='minutes')
- Main Lifting (45 min): Barbell Back Squat (4x6-8, "3 min rest, brace core, hit depth"), Hip Thrust (4x10-12, "2 min rest, pause and squeeze at top"), Leg Press (3x12-15, "90 sec rest, controlled, don't lock knees"), RDL (3x10-12, "90 sec rest, hinge at hips, feel hamstrings"), Leg Extension (3x12-15, "60 sec rest, squeeze at top"), Lying Leg Curl (3x12-15, "60 sec rest, control the negative"), Hip Abductor Machine (3x15, "60 sec rest, squeeze at top"), Seated Calf Raises (4x15-20, "45 sec rest, pause at stretch")
- Abs/Core (10 min): Hanging Leg Raises (3x15, "Controlled, no swinging, curl pelvis"), Reverse Crunches (3x15, "Curl hips off floor, no momentum")

**Day 4: "Shoulders"**
- Warm-up (10 min): Incline Treadmill Walk (5 min), Band Shoulder Dislocates (2x10), Band Pull-Aparts (2x15), Arm Circles (2x10/side)
- Main Lifting (45 min): Overhead Press (4x6-8, "2-3 min rest, brace core, full lockout"), Seated DB Shoulder Press (3x10-12, "90 sec rest, don't flare elbows too wide"), Lateral Raises (4x12-15, "60 sec rest, slight lean forward"), Cable Lateral Raises (3x12-15/side, "60 sec rest, behind-the-body cable path"), Rear Delt Fly Machine (3x15, "60 sec rest, squeeze shoulder blades"), Face Pulls (3x15, "60 sec rest, pull to forehead, external rotate"), DB Front Raises (2x12, "60 sec rest, alternating, controlled")
- Abs/Core (10 min): Rope Pulldown Crunches (3x15-20, "Curl ribs to hips, exhale hard"), Plank (3x45 sec, "Squeeze glutes, brace core, protect low back")

**Day 5: "Arms"**
- Warm-up (10 min): Incline Treadmill Walk (5 min), Push-Ups (2x12, "Narrow hand position, feel triceps"), Band Curls (2x15, "Light, pump blood into biceps"), Band Pull-Aparts (2x15, "Shoulders back, warm up elbows")
- Main Lifting (45 min): EZ Bar Curl (4x8-10, "90 sec rest, control the negative"), Close Grip Bench Press (4x8-10, "90 sec rest, elbows tucked, tricep focus"), Incline DB Curl (3x10-12, "60 sec rest, let arms hang, full stretch"), Overhead Rope Extension (3x12-15, "60 sec rest, full stretch at bottom"), Hammer Curls (3x12, "60 sec rest, no swinging"), Tricep Pushdown (3x12-15, "60 sec rest, elbows pinned to sides"), Cable Curl (2x15, "45 sec rest, constant tension, squeeze"), Weighted Dips (2x10-12, "90 sec rest, upright torso for tricep focus")
- Abs/Core (10 min): Hanging Leg Raises (3x15, "Control the swing, curl pelvis up"), Side Plank (2x30 sec/side, "Lateral stability, straight line")

### Arnold Split (3 workout days, cycle repeats)

**Day 1: "Chest & Back"**
- Warm-up (10 min): Rowing Machine (5 min), Push-Ups (2x15), Band Pull-Aparts (2x15), Scapular Pull-Ups (2x10)
- Main Lifting (50 min): Barbell Bench Press (4x6-8, "2-3 min rest, control descent, ribs down"), Pull-Ups (4x8-12, "2-3 min rest, full hang to chin over, superset with bench"), Incline DB Press (3x10-12, "90 sec rest, stretch at bottom"), T-Bar Row (3x8-10, "90 sec rest, superset with incline press"), Cable Fly (3x12-15, "60 sec rest, squeeze at peak"), Close Grip Lat Pulldown (3x10-12, "60 sec rest, pull to chest, superset with cable fly"), Weighted Dips (3x8-10, "90 sec rest, lean forward for chest"), Single-Arm Cable Row (3x12/side, "60 sec rest, pull straight back")
- Abs/Core (10 min): Hanging Leg Raises (3x15, "Control the swing, curl pelvis up"), Rope Pulldown Crunches (3x15-20, "Curl ribs to hips, exhale hard")

**Day 2: "Shoulders & Arms"**
- Warm-up (10 min): Incline Treadmill Walk (5 min), Band Shoulder Dislocates (2x10), Arm Circles (2x10/side), Band Curls (2x15, "Light, pump blood into biceps")
- Main Lifting (50 min): Overhead Press (4x6-8, "2-3 min rest, brace core, full lockout"), Lateral Raises (4x12-15, "60 sec rest, slight lean forward"), EZ Bar Curl (3x10-12, "90 sec rest, control the negative"), Overhead Rope Extension (3x12-15, "60 sec rest, full stretch, superset with curls"), Rear Delt Fly Machine (3x15, "60 sec rest, squeeze shoulder blades"), Hammer Curls (3x12, "60 sec rest, no swinging"), Tricep Pushdown (3x12-15, "60 sec rest, superset with hammer curls"), Face Pulls (3x15, "60 sec rest, pull to forehead, external rotate"), Incline DB Curl (2x10-12, "60 sec rest, let arms hang, full stretch")
- Abs/Core (10 min): Plank (3x45 sec, "Squeeze glutes, brace core, protect low back"), Pallof Press Hold (3x20 sec/side, "Anti-rotation, resist rotation")

**Day 3: "Legs"**
- Warm-up (10 min): Bike or Stair Stepper (5 min), Air Squats (2x20), Zombie Walks (2x10/side), Banded Lateral Walks (2x10 steps/side), Deep Squat Hold (2 min, reps_unit='minutes')
- Main Lifting (50 min): Barbell Back Squat (4x6-8, "3 min rest, brace core, hit depth"), Hip Thrust (4x10-12, "2 min rest, pause and squeeze at top"), Leg Press (3x12-15, "90 sec rest, controlled, don't lock knees"), RDL (3x10-12, "90 sec rest, hinge at hips, feel hamstrings"), Bulgarian Split Squats (3x10/side, "90 sec rest, upright torso, depth focus"), Leg Extension (3x12-15, "60 sec rest, squeeze at top"), Lying Leg Curl (3x12-15, "60 sec rest, control the negative"), Seated Calf Raises (4x15-20, "45 sec rest, pause at stretch")
- Abs/Core (10 min): Hanging Leg Raises (3x15, "Controlled, no swinging, curl pelvis"), Reverse Crunches (3x15, "Curl hips off floor, no momentum"), Ab Wheel Rollouts (3x10-12, "From knees, brace core, protect low back")

---

## IMPLEMENTATION STEPS

Work through these steps in order. After each step, verify your work compiles/passes before moving on.

### STEP 1: Create the database migration

Create a new file: `supabase/migrations/20240214000000_add_new_splits.sql`

Follow the EXACT format used in `supabase/migrations/20240201000001_seed_data.sql`. Read that file first to match the UUID naming patterns, INSERT format, and structure.

**UUID naming convention to follow:**
- Plan IDs: `00000000-0000-0000-0000-000000000004`, `...005`, `...006`
- Day IDs: Use pattern `00000000-0000-0000-0000-0000000000XX` where XX increments per day. Start at `41` for Full Body days (41-45), `51` for Bro days (51-55), `61` for Arnold days (61-63).
- Section IDs: Use pattern `00000000-0000-0000-000X-00000000YYZZ` where X indicates the day group, YY the day, ZZ the section (01=warmup, 02=main, 03=abs).
- Exercise IDs: Do NOT specify exercise IDs — let the database auto-generate them.

For each plan, insert in this order:
1. `INSERT INTO workout_plans (id, name, description)`
2. `INSERT INTO workout_days (id, plan_id, day_number, name)` — one row per workout day
3. `INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes)` — three sections per day (Warm-up sort_order=1, Main Lifting sort_order=2, Abs/Core sort_order=3)
4. `INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order)` — all exercises per section

Important notes for the SQL:
- `reps_unit` defaults to `'reps'`. Only set it explicitly for timed exercises: `'minutes'` for Deep Squat Hold, `'seconds'` for Plank/Pallof Press/Side Plank/Dead Hangs.
- `is_per_side` is `false` by default. Set to `true` for: Arm Circles, Zombie Walks, Banded Lateral Walks, Bulgarian Split Squats, Single-Arm DB Row, Single Leg RDL, Walking Lunges, Cable Lateral Raises, Side Plank, Pallof Press Hold, Dead Bug, Hip Circles, Single-Arm Cable Row.
- `sets` is NULL for cardio warmups (treadmill walk, rowing, bike) and Deep Squat Hold. For these, put the duration in `reps_min` and `reps_max` with appropriate `reps_unit`.
- Use single quotes for SQL strings. Escape any apostrophes in notes with double single quotes (`''`).

Plan descriptions:
- Full Body: `'Train your entire body each session with 5 unique workouts. Pick 3 per week for balanced full-body stimulus.'`
- Bro Split: `'Dedicated days for each muscle group with high volume. 5 days per week for maximum focus on individual body parts.'`
- Arnold Split: `'High-volume 3-day cycle pairing chest with back, shoulders with arms, and a dedicated leg day. Repeat twice per week.'`

### STEP 2: Update workoutConfig.ts

**File:** `src/config/workoutConfig.ts`

Read the file first. Then:

1. Add entries to `WEIGHTS_CONFIG` for each new workout day name. Use these colors/icons:

```typescript
// Full Body days
'full body a': { color: '#10B981', bgColor: '#10B98120', gradient: 'from-emerald-500 to-emerald-400', icon: Dumbbell },
'full body b': { color: '#14B8A6', bgColor: '#14B8A620', gradient: 'from-teal-500 to-teal-400', icon: Dumbbell },
'full body c': { color: '#06B6D4', bgColor: '#06B6D420', gradient: 'from-cyan-500 to-cyan-400', icon: Dumbbell },
'full body d': { color: '#0EA5E9', bgColor: '#0EA5E920', gradient: 'from-sky-500 to-sky-400', icon: Dumbbell },
'full body e': { color: '#3B82F6', bgColor: '#3B82F620', gradient: 'from-blue-500 to-blue-400', icon: Dumbbell },

// Bro Split days
'chest': { color: '#EF4444', bgColor: '#EF444420', gradient: 'from-red-500 to-red-400', icon: Dumbbell },
'back': { color: '#F97316', bgColor: '#F9731620', gradient: 'from-orange-500 to-orange-400', icon: ArrowDown },
'shoulders': { color: '#EAB308', bgColor: '#EAB30820', gradient: 'from-yellow-500 to-yellow-400', icon: ArrowUp },
'arms': { color: '#A855F7', bgColor: '#A855F720', gradient: 'from-purple-500 to-purple-400', icon: Dumbbell },

// Arnold Split days
'chest & back': { color: '#F43F5E', bgColor: '#F43F5E20', gradient: 'from-rose-500 to-rose-400', icon: Dumbbell },
'shoulders & arms': { color: '#D946EF', bgColor: '#D946EF20', gradient: 'from-fuchsia-500 to-fuchsia-400', icon: ArrowUp },
```
Note: "legs" already exists in WEIGHTS_CONFIG from PPL. The Bro and Arnold "Legs" days will reuse that existing entry.

2. Add entries to `WORKOUT_DISPLAY_NAMES`:
```typescript
'full body a': 'Full Body A',
'full body b': 'Full Body B',
'full body c': 'Full Body C',
'full body d': 'Full Body D',
'full body e': 'Full Body E',
'chest': 'Chest',
'back': 'Back',
'shoulders': 'Shoulders',
'arms': 'Arms',
'chest & back': 'Chest & Back',
'shoulders & arms': 'Shoulders & Arms',
```

3. Update `getWeightsStyleByName()` — this function does a case-insensitive name lookup into `WEIGHTS_CONFIG`. Since the config keys are lowercase and the lookup normalizes to lowercase, the existing logic should work automatically. Verify this is the case. If not, add the mappings.

4. Update `getWeightsStyleByDayNumber()` and `getWeightsLabel()` — these map day_number to styles. Currently they're hardcoded for PPL (1=push, 2=pull, 3=legs) and Upper/Lower (1=upper, 2=lower). These functions need to be updated to accept the plan context OR be refactored to use the day name instead of day number. The day name approach is more scalable. Read how these functions are called and decide the best approach.

### STEP 3: Update OnboardingWizard.tsx

**File:** `src/components/onboarding/OnboardingWizard.tsx`

Read the file first. Then:

1. Add the three new plan ID constants:
```typescript
const FULL_BODY_PLAN_ID = '00000000-0000-0000-0000-000000000004'
const BRO_SPLIT_PLAN_ID = '00000000-0000-0000-0000-000000000005'
const ARNOLD_SPLIT_PLAN_ID = '00000000-0000-0000-0000-000000000006'
```

2. Add plan lookups alongside the existing `pplPlan` and `ulPlan`:
```typescript
const fbPlan = plans?.find(p => p.id === FULL_BODY_PLAN_ID)
const broPlan = plans?.find(p => p.id === BRO_SPLIT_PLAN_ID)
const arnoldPlan = plans?.find(p => p.id === ARNOLD_SPLIT_PLAN_ID)
```

3. Add three new split selection cards in the step 1 JSX, following the exact same card pattern as the existing PPL and Upper/Lower cards. Each card should show:
   - Plan name
   - Short description
   - Colored badges for the workout day names
   - Click handler: `onClick={() => handleSelectPlan(PLAN_ID)}`
   - Selected state visual feedback

   Descriptions for the cards:
   - Full Body: "5 unique full-body workouts — pick any 3 per week"
   - Bro Split: "Chest · Back · Legs · Shoulders · Arms — 5 days per week"
   - Arnold Split: "Chest & Back · Shoulders & Arms · Legs — 6-day cycle"

4. The layout may need adjusting to fit 5 cards instead of 2. Consider using a scrollable container or a grid layout that works on mobile. Make it look clean.

### STEP 4: Update Profile.tsx

**File:** `src/pages/Profile.tsx`

Read the file first. Then:

1. Add the same three plan ID constants as OnboardingWizard.

2. Update the `currentSplitName` logic to handle all 5 splits:
```typescript
const SPLIT_NAMES: Record<string, string> = {
  [PPL_PLAN_ID]: 'Push / Pull / Legs',
  [UPPER_LOWER_PLAN_ID]: 'Upper / Lower',
  [FULL_BODY_PLAN_ID]: 'Full Body',
  [BRO_SPLIT_PLAN_ID]: 'Bro Split',
  [ARNOLD_SPLIT_PLAN_ID]: 'Arnold Split',
}
const currentSplitName = SPLIT_NAMES[currentSplitId] || 'Push / Pull / Legs'
```

3. Add three new split selection buttons following the exact same pattern as the existing PPL and Upper/Lower buttons. Each button shows the split name and has the selected/active visual state.

4. Adjust the layout for 5 buttons. A 2-column grid or vertical list may work better than inline buttons.

### STEP 5: Update scheduleService.ts

**File:** `src/services/scheduleService.ts`

Read the `initializeDefaultSchedule()` function. It currently has logic:
- If 2 workout days → Upper/Lower schedule pattern
- Otherwise → PPL schedule pattern (3 days cycling)

Add logic for the new splits based on number of workout days:

- **5 days (Full Body)**: Schedule any 3 of 5 as the default. Example: Day 1=Full Body A, Day 2=Rest, Day 3=Full Body B, Day 4=Rest, Day 5=Full Body C, Day 6=Rest, Day 7=Rest
- **5 days (Bro Split)**: Day 1=Chest, Day 2=Back, Day 3=Legs, Day 4=Shoulders, Day 5=Arms, Day 6=Rest, Day 7=Rest
- **3 days (Arnold Split)**: Day 1=Chest & Back, Day 2=Shoulders & Arms, Day 3=Legs, Day 4=Chest & Back, Day 5=Shoulders & Arms, Day 6=Legs, Day 7=Rest

The challenge is distinguishing Full Body (5 days) from Bro Split (5 days) since both have 5 workout days. You'll need to check the plan ID or plan name to differentiate them. The cleanest approach: use the plan ID directly in the schedule logic rather than relying solely on day count.

Update the function to accept or look up the plan ID, then branch on it:
```typescript
if (planId === FULL_BODY_PLAN_ID) {
  // Full Body: 3 on, 4 off
} else if (planId === BRO_SPLIT_PLAN_ID) {
  // Bro: 5 on, 2 off
} else if (planId === ARNOLD_SPLIT_PLAN_ID) {
  // Arnold: 6 on (3-day cycle x2), 1 off
} else if (workoutDays.length === 2) {
  // Upper/Lower
} else {
  // PPL (default)
}
```

Import the plan ID constants. Don't duplicate them — create a shared constants file if needed, or import from a central location.

### STEP 6: Update workoutService.ts

**File:** `src/services/workoutService.ts`

Check the `getAllWorkoutDays()` function. It currently excludes plan 3 (Mobility). Make sure it also works correctly with plans 4, 5, and 6. The function should either:
- Return all non-mobility plans, OR
- Return only the user's selected plan's days

Verify the logic is correct for the new splits.

### STEP 7: Update any remaining hardcoded references

Search the entire `src/` directory for:
- `000000000001` and `000000000002` (plan ID references)
- `'Push/Pull/Legs'` and `'Upper/Lower'` (string references)
- `PPL_PLAN_ID` and `UPPER_LOWER_PLAN_ID` (constant references)
- Any switch/case or if/else chains that only handle 2 splits

Make sure every instance handles all 5 splits.

### STEP 8: Shared constants

If plan IDs are duplicated across files (OnboardingWizard, Profile, scheduleService), create a shared constants file:

`src/config/planConstants.ts`
```typescript
export const PPL_PLAN_ID = '00000000-0000-0000-0000-000000000001'
export const UPPER_LOWER_PLAN_ID = '00000000-0000-0000-0000-000000000002'
export const MOBILITY_PLAN_ID = '00000000-0000-0000-0000-000000000003'
export const FULL_BODY_PLAN_ID = '00000000-0000-0000-0000-000000000004'
export const BRO_SPLIT_PLAN_ID = '00000000-0000-0000-0000-000000000005'
export const ARNOLD_SPLIT_PLAN_ID = '00000000-0000-0000-0000-000000000006'
```

Then update all files to import from this one location instead of defining their own constants.

### STEP 9: Build & test

1. Run `npm run build` — must pass with zero errors.
2. Run `npm run lint` — must pass.
3. Run `npx vitest run` — all existing tests must still pass. If any tests reference the old 2-split hardcoded logic, update them to handle 5 splits.
4. Start the dev server (`npm run dev` in background), verify it starts successfully, then kill it.

### STEP 10: Write new tests

Write tests that verify:
1. The new plan IDs exist and return workout days
2. Each new split has the correct number of workout days (Full Body=5, Bro=5, Arnold=3)
3. Each workout day has 3 sections (Warm-up, Main Lifting, Abs/Core)
4. The schedule service generates correct default schedules for each new split
5. The workout config returns styles for all new day names
6. The OnboardingWizard renders all 5 split options

### STEP 11: Final verification

1. Run `npm run build` — zero errors.
2. Run `npm run lint` — zero warnings.
3. Run `npx vitest run --reporter=verbose` — all tests pass.
4. Write a summary of everything you did to a file called `SPLITS_CHANGELOG.md` in the project root.

Do NOT skip any step. Do NOT ask for input. Work through everything systematically.
