# Data Flow Trace: Workout Set Logging

## Bug Summary

**Confirmed Bug**: Across 6 workout sessions and 48 logged sets in the database, EVERY exercise only has `set_number=1`. Even exercises prescribed for 4 sets (e.g., Barbell Bench Press 4x6-8) only get `set_number=1` for all their rows.

**Root Cause**: The bug is NOT in the set_number assignment logic itself. The `logMultipleExerciseSets` service function correctly generates `set_number: i + 1` (1, 2, 3, 4). The bug is that **the UI never calls this function with more than 1 set**. The ExerciseCard component determines completion as a boolean (completed or not), and the `exercise.sets` value that gets passed as `plannedSets` is sometimes `null` for exercises, which then gets coerced to `1` by `Math.max(1, plannedSets || 1)`. However, even when `exercise.sets` is a valid number like 4, the real problem is that **the current UX is exercise-level completion (single click toggles done/not-done), NOT set-by-set logging**. When you tap the circle to "complete" an exercise, it calls `logMultipleExerciseSets` with the correct `totalSets` count -- but upon uncomplete+recomplete, or under certain race conditions, the function may be called multiple times with stale state.

**WAIT -- After deeper analysis, the actual root cause is more subtle. See Step 3 below.**

---

## Step 1: Starting a Workout Session

### File: `/Users/jaronwright/src/workouts/src/pages/Workout.tsx`
**Function**: `handleStart` (line 131)

**Flow**:
1. User clicks "Start Workout" button
2. `handleStart` calls `startWorkout(dayId, ...)` (from `useStartWorkout` hook)
3. After success, `setActiveSession(session)` stores the session in Zustand

### File: `/Users/jaronwright/src/workouts/src/hooks/useWorkoutSession.ts`
**Function**: `useStartWorkout` (line 87)

**Flow**:
1. Calls `startWorkoutSession(userId, workoutDayId)` from workoutService
2. On network error, queues to offline store and returns optimistic session
3. On success, stores session in workoutStore and invalidates queries

### File: `/Users/jaronwright/src/workouts/src/services/workoutService.ts`
**Function**: `startWorkoutSession` (line 91)

**Data In**: `userId: string`, `workoutDayId: string`
**Data Out**: `WorkoutSession` object with `id`, `user_id`, `workout_day_id`, `started_at`

**What it does**:
1. Deletes any orphaned incomplete sessions for this user
2. Inserts a new row into `workout_sessions` table
3. Returns the new session

---

## Step 2: Displaying Exercises

### File: `/Users/jaronwright/src/workouts/src/pages/Workout.tsx`

**Flow**:
1. `useWorkoutDay(dayId)` fetches the workout day with all sections and exercises
2. This calls `getWorkoutDayWithSections(dayId)` in workoutService
3. Returns `WorkoutDayWithSections` containing:
   - `sections[]` (from `exercise_sections` table, ordered by `sort_order`)
   - Each section has `exercises[]` (from `plan_exercises` table, ordered by `sort_order`)
4. Each exercise has: `id`, `name`, `sets`, `reps_min`, `reps_max`, `reps_unit`, `is_per_side`, etc.

### File: `/Users/jaronwright/src/workouts/src/services/workoutService.ts`
**Function**: `getWorkoutDayWithSections` (line 50)

Fetches:
1. `workout_days` row by ID
2. `exercise_sections` for that day, ordered by `sort_order`
3. For each section, `plan_exercises` ordered by `sort_order`

**Key data**: `plan_exercises.sets` column contains the prescribed number of sets (e.g., 4 for "Barbell Bench Press 4x6-8", NULL for timed warm-ups like "5 min treadmill walk").

---

## Step 3: Logging Individual Sets -- THE BUG IS HERE

### UI Layer: ExerciseCard

**File**: `/Users/jaronwright/src/workouts/src/components/workout/ExerciseCard.tsx`

The ExerciseCard is a **single-click toggle** for exercise completion. There is NO per-set UI. The user sees:
- An empty circle (not completed)
- Tapping it marks the ENTIRE exercise as complete in one action
- Tapping again uncompletes it (deletes all sets)

**Function**: `handleComplete` (line 97)

```typescript
const handleComplete = () => {
  if (isCompleted) {
    // Uncomplete: revert to empty circle
    onExerciseUncomplete?.()
    return
  }
  const reps = exercise.reps_min
  const parsed = weight ? parseFloat(weight) : NaN
  const weightValue = noWeight ? null : (Number.isFinite(parsed) ? parsed : null)
  setJustCompleted(true)
  onExerciseComplete(reps, weightValue)   // <-- calls parent handler
  setTimeout(() => setJustCompleted(false), 300)
}
```

**Key observation**: `onExerciseComplete` is called with just `(reps, weight)`. There is NO set_number parameter. The ExerciseCard has zero awareness of individual sets.

### Parent Mapping in Workout.tsx

**File**: `/Users/jaronwright/src/workouts/src/pages/Workout.tsx`

The ExerciseCard's `onExerciseComplete` prop is wired at line 440/475:
```typescript
onExerciseComplete={(reps, weight) =>
  handleExerciseComplete(exercise.id, reps, weight, exercise.sets || 1)
}
```

**Function**: `handleExerciseComplete` (line 178)

```typescript
const handleExerciseComplete = (exerciseId: string, reps: number | null, weight: number | null, plannedSets: number) => {
  if (!activeSession) return
  const totalSets = Math.max(1, plannedSets || 1)
  logSets({
    sessionId: activeSession.id,
    planExerciseId: exerciseId,
    totalSets,
    repsCompleted: reps,
    weightUsed: weight
  })
}
```

**`exercise.sets || 1`**: This correctly passes the planned set count from the database (e.g., 4 for Bench Press). The `|| 1` fallback handles NULL sets (warm-up exercises).

**`Math.max(1, plannedSets || 1)`**: Ensures at least 1 set.

**THIS LOOKS CORRECT.** If `exercise.sets` is 4, then `totalSets` should be 4.

### Hook Layer: useLogMultipleSets

**File**: `/Users/jaronwright/src/workouts/src/hooks/useWorkoutSession.ts`
**Function**: `useLogMultipleSets` (line 206)

```typescript
mutationFn: async ({ sessionId, planExerciseId, totalSets, repsCompleted, weightUsed }) => {
  const resolvedSessionId = useOfflineStore.getState().resolveId(sessionId)
  try {
    return await logMultipleExerciseSets(resolvedSessionId, planExerciseId, totalSets, repsCompleted, weightUsed)
  } catch (err) {
    // ... offline handling with correct set_number: i for each set
  }
}
```

On success, each returned set is added to the Zustand store:
```typescript
onSuccess: (sets, variables) => {
  sets.forEach(set => addCompletedSet(variables.planExerciseId, set))
  // ...invalidate queries
}
```

### Service Layer: logMultipleExerciseSets

**File**: `/Users/jaronwright/src/workouts/src/services/workoutService.ts`
**Function**: `logMultipleExerciseSets` (line 165)

```typescript
export async function logMultipleExerciseSets(
  sessionId: string,
  planExerciseId: string,
  totalSets: number,
  repsCompleted: number | null,
  weightUsed: number | null
): Promise<ExerciseSet[]> {
  const rows = Array.from({ length: totalSets }, (_, i) => ({
    session_id: sessionId,
    plan_exercise_id: planExerciseId,
    set_number: i + 1,          // <-- CORRECTLY generates 1, 2, 3, 4
    reps_completed: repsCompleted,
    weight_used: weightUsed,
    completed: true,
  }))

  const { data, error } = await supabase
    .from('exercise_sets')
    .insert(rows)
    .select()

  if (error) throw error
  return data as ExerciseSet[]
}
```

**This function correctly generates set_number 1, 2, 3, ... totalSets.** If called with `totalSets=4`, it would insert 4 rows with `set_number` = 1, 2, 3, 4.

---

## THE ACTUAL BUG: exercise.sets is NULL for many exercises

### Analysis

Looking at the seed data more carefully:

```sql
-- Warm-up exercises have NULL sets:
('...', '...', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', ...)

-- Main exercises have populated sets:
('...', '...', 'Barbell Bench Press', 4, 6, 8, 'reps', ...)
```

For main lifting exercises, `sets` IS populated (4, 3, etc.). So the flow should work for those.

**But the database shows ALL sets have set_number=1.** This means either:

1. **`exercise.sets` is not reaching the handler correctly** -- perhaps the data is not fetched or the field is null when it shouldn't be, OR
2. **The exercises are being completed/uncompleted multiple times** -- each complete action inserts sets but doesn't clean up old ones first, OR
3. **There's a Supabase insert issue** -- the bulk insert isn't working as expected.

### MOST LIKELY ROOT CAUSE: The `logMultipleExerciseSets` Supabase bulk insert returns only 1 row

Looking at the Supabase insert:
```typescript
const { data, error } = await supabase
  .from('exercise_sets')
  .insert(rows)
  .select()
```

**If `rows` has 4 entries, Supabase should insert all 4 and return all 4.** This part should be correct.

### REVISED ANALYSIS: The ACTUAL bug

After tracing every code path exhaustively, here is what's actually happening:

**The `exercise.sets` value IS being passed correctly (e.g., 4 for Bench Press).** The `logMultipleExerciseSets` function IS generating correct set_numbers (1, 2, 3, 4). The bulk insert SHOULD insert all 4 rows.

**However**, the `completedSets` state in the Zustand store and the `isCompleted` check in ExerciseCard creates a race condition / duplication issue:

1. User clicks to complete exercise (e.g., Bench Press with 4 sets)
2. `handleExerciseComplete` calls `logSets` with `totalSets=4`
3. `logMultipleExerciseSets` inserts 4 rows (set_number 1, 2, 3, 4)
4. `onSuccess` adds all 4 sets to `completedSets[exerciseId]`
5. The `useSessionSets` hook also re-fetches sets from the DB
6. The effect at line 109-118 in Workout.tsx re-syncs DB sets into the store:
   ```typescript
   useEffect(() => {
     if (sessionSets) {
       sessionSets.forEach((set) => {
         const current = useWorkoutStore.getState().completedSets[set.plan_exercise_id] || []
         if (!current.find((s) => s.id === set.id)) {
           useWorkoutStore.getState().addCompletedSet(set.plan_exercise_id, set)
         }
       })
     }
   }, [sessionSets])
   ```

This should work correctly for a single completion action. **If 4 sets are inserted, 4 sets should appear in the store.**

### THE REAL SMOKING GUN

**I now need to reconsider: is `exercise.sets` actually NULL in the fetched data?**

The `plan_exercises` table has `sets: number | null`. Looking at the seed data:
- Warm-up exercises: `sets = NULL`
- Main exercises: `sets = 4`, `3`, etc.

In `Workout.tsx` line 441/476:
```typescript
exercise.sets || 1
```

If `exercise.sets` is `4`, then `4 || 1 = 4`. Correct.
If `exercise.sets` is `null`, then `null || 1 = 1`. Also correct (warm-ups).
If `exercise.sets` is `0`, then `0 || 1 = 1`. Edge case, but 0 sets shouldn't happen.

**WAIT: What if `exercise.sets` is `undefined`?**

This could happen if the Supabase query doesn't return the `sets` column, or if there's a TypeScript type mismatch. Let me check...

The query in `getWorkoutDayWithSections` uses `.select('*')` for `plan_exercises`, which should return all columns including `sets`.

### FINAL CONCLUSION: The bug is likely in the `exercise.sets` value being unexpectedly null/undefined at runtime

Given that the code logic IS correct when `exercise.sets` has a numeric value, and the database schema clearly defines sets for main exercises, the most likely scenarios for the bug are:

1. **Runtime data mismatch**: The `exercise.sets` field is `null` at runtime for all exercises (perhaps from a migration that didn't populate it, or from user-created plans that don't set it).

2. **Unique constraint or silent dedup**: If there's a unique constraint on `(session_id, plan_exercise_id, set_number)`, the bulk insert of 4 rows would fail for rows 2-4 if there were already existing rows. However, looking at the migration, there is NO unique constraint on exercise_sets beyond the primary key.

3. **The user is testing with exercises where `sets` IS null**: If the user is only completing warm-up exercises or exercises from newer splits that may not have `sets` populated, every exercise would log with `totalSets=1`.

**Most probable**: For the PPL plan's main exercises (Bench Press, Pull-Ups, etc.), `sets` is correctly 4. If the DB truly shows only `set_number=1` for those exercises too, then there might be a Supabase bulk insert issue, or the `exercise` object being passed to the callback doesn't have the `sets` field populated at that point in the React render cycle.

---

## Step 4: Exercise Completion Check

### File: `/Users/jaronwright/src/workouts/src/components/workout/ExerciseCard.tsx`

```typescript
const isCompleted = completedSets.length > 0
```

An exercise is "completed" if it has ANY sets in the `completedSets` array. This is a binary check -- 1 set or 4 sets, it's "complete" either way. The UI shows a green checkmark.

---

## Step 5: Workout Completion

### File: `/Users/jaronwright/src/workouts/src/pages/Workout.tsx`
**Function**: `handleComplete` (line 153)

1. Calls `completeWorkout({ sessionId: activeSession.id })`
2. On success, calculates duration and opens the post-workout review modal
3. The `useCompleteWorkout` hook calls `clearWorkout()` which resets the Zustand store

### File: `/Users/jaronwright/src/workouts/src/hooks/useWorkoutSession.ts`
**Function**: `useCompleteWorkout` (line 121)

1. Calls `completeWorkoutSession(resolvedId, notes)` which sets `completed_at` timestamp
2. On success, calls `clearWorkout()` and invalidates all relevant queries

### File: `/Users/jaronwright/src/workouts/src/services/workoutService.ts`
**Function**: `completeWorkoutSession` (line 112)

```typescript
.update({ completed_at: completedAt, notes })
.eq('id', sessionId)
```

Simply sets the `completed_at` timestamp. Does NOT touch exercise_sets.

---

## Summary of All Code Paths That Write to exercise_sets

| # | Function | File | set_number Logic | When Called |
|---|----------|------|------------------|------------|
| 1 | `logExerciseSet` | workoutService.ts:141 | Passed as parameter | `useLogSet` hook (NOT used in main workout UI) |
| 2 | `logMultipleExerciseSets` | workoutService.ts:165 | `i + 1` (1-indexed loop) | `useLogMultipleSets` hook -> Workout.tsx `handleExerciseComplete` |
| 3 | Offline sync: `log-set` case | syncService.ts:133 | Uses `payload.setNumber` | When offline queue processes |

**Only path #2 is used during normal workout flow.** Path #1 (`useLogSet`) is defined but NEVER called from the Workout page -- it exists as an unused hook. Path #3 is only used for offline recovery.

---

## Recommended Investigation Steps

1. **Add console.log in `handleExerciseComplete`** to verify what `exercise.sets` value is at runtime:
   ```typescript
   console.log('exercise.sets:', exercise.sets, 'totalSets:', totalSets)
   ```

2. **Add console.log in `logMultipleExerciseSets`** to verify the rows being inserted:
   ```typescript
   console.log('Inserting rows:', JSON.stringify(rows))
   ```

3. **Query the database directly** to check what `plan_exercises.sets` contains for the exercises being tested:
   ```sql
   SELECT pe.name, pe.sets, pe.reps_min, pe.reps_max
   FROM plan_exercises pe
   JOIN exercise_sections es ON pe.section_id = es.id
   JOIN workout_days wd ON es.workout_day_id = wd.id
   WHERE wd.plan_id = '00000000-0000-0000-0000-000000000001'
   ORDER BY wd.day_number, es.sort_order, pe.sort_order;
   ```

4. **Check if the bulk insert is actually inserting all rows** by examining the Supabase response.

5. **Check for unique constraints** that might silently prevent duplicate inserts:
   ```sql
   SELECT conname, contype, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid = 'exercise_sets'::regclass;
   ```

---

## Architecture Diagram

```
User taps checkmark on ExerciseCard
    |
    v
ExerciseCard.handleComplete()
    |  sends: (reps, weight)
    v
Workout.tsx handleExerciseComplete(exerciseId, reps, weight, exercise.sets || 1)
    |  computes: totalSets = Math.max(1, plannedSets || 1)
    |  calls: logSets({ sessionId, planExerciseId, totalSets, repsCompleted, weightUsed })
    v
useLogMultipleSets hook (useWorkoutSession.ts)
    |  resolves offline session ID
    |  calls: logMultipleExerciseSets(sessionId, planExerciseId, totalSets, reps, weight)
    v
workoutService.logMultipleExerciseSets()
    |  generates: Array.from({ length: totalSets }, (_, i) => ({ set_number: i + 1, ... }))
    |  executes: supabase.from('exercise_sets').insert(rows).select()
    v
Supabase inserts N rows into exercise_sets table
    |
    v
onSuccess: each set added to workoutStore.completedSets[exerciseId]
    |
    v
ExerciseCard re-renders with completedSets.length > 0 -> shows green checkmark
```

## Key Files Reference

| File | Path | Role |
|------|------|------|
| Workout Page | `/Users/jaronwright/src/workouts/src/pages/Workout.tsx` | Orchestrates workout UI, wires exercise completion |
| ExerciseCard | `/Users/jaronwright/src/workouts/src/components/workout/ExerciseCard.tsx` | Single-click exercise completion toggle |
| Workout Store | `/Users/jaronwright/src/workouts/src/stores/workoutStore.ts` | Zustand store for active session, completed sets |
| Workout Hooks | `/Users/jaronwright/src/workouts/src/hooks/useWorkoutSession.ts` | TanStack Query mutations for set logging |
| Workout Service | `/Users/jaronwright/src/workouts/src/services/workoutService.ts` | Supabase insert operations |
| Offline Utils | `/Users/jaronwright/src/workouts/src/utils/offlineUtils.ts` | Optimistic set/session builders |
| Sync Service | `/Users/jaronwright/src/workouts/src/services/syncService.ts` | Offline queue processor |
| Offline Store | `/Users/jaronwright/src/workouts/src/stores/offlineStore.ts` | Offline mutation queue |
| DB Types | `/Users/jaronwright/src/workouts/src/types/database.ts` | exercise_sets schema (lines 143-173) |
| Workout Types | `/Users/jaronwright/src/workouts/src/types/workout.ts` | ExerciseSet, PlanExercise type aliases |
| Seed Data | `/Users/jaronwright/src/workouts/supabase/migrations/20240201000001_seed_data.sql` | Plan exercises with sets values |
| Schema | `/Users/jaronwright/src/workouts/supabase/migrations/20240201000000_initial_schema.sql` | exercise_sets table definition |
