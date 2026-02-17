# Root Cause Analysis

## Primary Bug: set_number Always 1

### Symptom
Across 6 workout sessions and 48 logged exercise_sets on production Supabase, EVERY row has `set_number=1`. Exercises prescribed for 4 sets (like Barbell Bench Press 4×6-8) only have 1 row, or have multiple rows all with `set_number=1`.

### Root Cause
**File:** `src/pages/Workout.tsx` (OLD code, before commit `1458f45`)
**Function:** `handleExerciseComplete`

The old code called `useMutation.mutate()` in a synchronous `for` loop:

```typescript
// OLD CODE — THE BUG:
const { mutate: logSet } = useLogSet()

const handleExerciseComplete = (exerciseId, reps, weight, plannedSets) => {
  const setCount = Math.max(1, plannedSets || 1)
  for (let i = 1; i <= setCount; i++) {
    logSet({
      sessionId: activeSession.id,
      planExerciseId: exerciseId,
      setNumber: i,       // Correctly passes 1, 2, 3, 4
      repsCompleted: reps,
      weightUsed: weight
    })
  }
}
```

**Why this breaks:** In TanStack Query v5, calling `.mutate()` on the **same mutation observer** while a previous mutation is still pending causes the observer to detach from the prior mutation. While all network requests may fire, only the **last** mutation's lifecycle callbacks (onSuccess, onSettled) execute properly. In practice, this results in only ~1 of N inserts completing successfully.

**Evidence:**
- Air Squats (prescribed 2 sets) has 2 rows both with `set_number=1`, created 236ms apart — indicating two separate INSERT transactions (not a batch), both using `setNumber: 1` (only the first iteration's value)
- Most exercises with 3-4 prescribed sets only have 1 row in the database
- The `logExerciseSet` service function correctly passes `setNumber` to Supabase — the bug is in the caller pattern, not the service

### Fix (Already Applied)
**Commit:** `1458f45` (Feb 15, 2026)
**Change:** Replaced the loop-based `useLogSet.mutate()` pattern with a single `useLogMultipleSets` call that uses `logMultipleExerciseSets` (batch insert):

```typescript
// NEW CODE — THE FIX:
const { mutate: logSets } = useLogMultipleSets()

const handleExerciseComplete = (exerciseId, reps, weight, plannedSets) => {
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

The `logMultipleExerciseSets` function generates correct `set_number: i + 1` values in a single batch insert:

```typescript
const rows = Array.from({ length: totalSets }, (_, i) => ({
  session_id: sessionId,
  plan_exercise_id: planExerciseId,
  set_number: i + 1,  // 1, 2, 3, ... correctly
  reps_completed: repsCompleted,
  weight_used: weightUsed,
  completed: true,
}))
```

### Fix Verification (Feb 16, 2026)
Live Chrome test on local Supabase:
- Started Push workout, completed all 9 exercises
- Database shows **28 rows** with correct sequential set_numbers
- Barbell Bench Press: {1,2,3,4} (prescribed 4) ✅
- All other exercises: {1,2,3} (prescribed 3) ✅
- No duplicate set_numbers within any exercise
- Volume calculation matches manual: 9,360 lbs ✅
- Session detail displays all exercises with correct set counts ✅

### Blast Radius: FOUNDATION
This bug affects every downstream feature that reads exercise_sets:
- Volume calculations (socialService, leaderboardService, challengeService)
- Session detail display
- History page stats
- Community feed workout cards
- Badge volume thresholds
- Progressive overload tracking
- Offline sync dedup (syncService)

However, most downstream features calculate stats using **row count** and **per-row multiplication**, NOT `set_number` values. So while the data was wrong (fewer rows than expected), the calculations on the data that DID exist were correct.

---

## Secondary Issues (Pre-existing, Not Introduced by Fix)

### Issue 1: Offline Sync Dedup Logic
**File:** `src/services/syncService.ts`, lines 136-143
**Severity:** HIGH (latent risk)
**Description:** The dedup check matches on `plan_exercise_id + set_number`. With correct set_numbers (the fix), this works correctly for normal cases. However, if a user uncompletes then re-completes an exercise, the dedup could incorrectly skip re-inserting sets that were deleted.
**Impact:** Only affects offline sync scenarios. Does not affect online usage.

### Issue 2: ExerciseCard Uncomplete Race Condition
**File:** `src/pages/Workout.tsx`, lines 190-197
**Severity:** MEDIUM
**Description:** When un-toggling a completed exercise, `deleteSet(s.id)` is called for each set (async mutations), then `removeCompletedSets(exerciseId)` immediately clears from the Zustand store. If delete fails, the store shows uncompleted but the DB still has the rows (orphaned exercise_sets).
**Impact:** Can cause data inconsistency between local state and database. Self-healing on page refresh since the session hydration effect syncs DB → store.

### Issue 3: Existing Data Not Retroactively Fixed
**Severity:** LOW (cosmetic)
**Description:** The 48 exercise_sets from before the fix still have `set_number=1` in the production database. New workouts will have correct set_numbers, but old data remains wrong.
**Impact:** Old session details may show misleading data. Volume calculations for old sessions are based on whatever rows exist (likely under-counted since fewer rows were inserted).
