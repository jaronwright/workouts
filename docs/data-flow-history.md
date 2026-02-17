# Data Flow Trace: History, Stats, and Volume Calculations

## 1. Overview of Data Flow

The workout history and statistics system spans multiple layers:

```
History.tsx / Home.tsx / Profile.tsx
    |
    v
useCalendarData / useScrollableCalendarData / useLifetimeStats
    |
    v
useUserSessions / useUserTemplateWorkouts
    |
    v
workoutService.getUserSessions / templateWorkoutService
    |
    v
Supabase: workout_sessions + exercise_sets
```

---

## 2. How History Data Is Fetched

### 2a. Session Listing (User Sessions)

**File**: `/src/services/workoutService.ts` (line 224)

```ts
// getUserSessions
const { data, error } = await supabase
  .from('workout_sessions')
  .select(`*, workout_day:workout_days(*)`)
  .eq('user_id', userId)
  .order('started_at', { ascending: false })
```

This returns `SessionWithDay[]` — all of a user's weight sessions with their associated workout day.

**Hook**: `/src/hooks/useWorkoutSession.ts` — `useUserSessions()` (line 41)

### 2b. Session Detail (Exercise Sets for a Session)

**File**: `/src/pages/SessionDetail.tsx` (line 53, inline `getSessionDetail`)

```ts
// Fetches exercise_sets with joined plan_exercise -> exercise_sections
const { data: sets } = await supabase
  .from('exercise_sets')
  .select(`
    *,
    plan_exercise:plan_exercises(
      id, name, sets, reps_min, reps_max, reps_unit, weight_unit,
      section:exercise_sections(name, sort_order)
    )
  `)
  .eq('session_id', sessionId)
  .order('created_at')
```

Sets are grouped by `plan_exercise.id` and sorted by `section.sort_order`.

### 2c. Calendar Data

**File**: `/src/hooks/useCalendarData.ts`

Merges `useUserSessions()` (weights) + `useUserTemplateWorkouts()` (cardio/mobility) into `UnifiedSession[]`.
Uses `groupSessionsByDate()` from `/src/utils/calendarGrid.ts` to map sessions to calendar dates.
Then `buildCalendarDaysForMonth()` builds `CalendarDay[]` with `sessions[]`, `hasCompletedSession`, etc.

The scrollable calendar (`useScrollableCalendarData`) does the same across 13 months (6 back + current + 6 forward).

---

## 3. How Volume Is Calculated

### 3a. Community Feed Volume (socialService.ts)

**File**: `/src/services/socialService.ts` (lines 129-132, 279-282)

```ts
const totalVolume = sets.reduce((sum, s) => {
  if (s.reps_completed && s.weight_used) return sum + s.reps_completed * s.weight_used
  return sum
}, 0)
```

**Formula**: `SUM(reps_completed * weight_used)` for each exercise_set row in the session.

This is used to populate `FeedWorkout.total_volume` shown on community feed `WorkoutCard`.

### 3b. Leaderboard Volume (leaderboardService.ts)

**File**: `/src/services/leaderboardService.ts` (lines 153-210)

```ts
// getVolumeLeaderboard
for (const set of sets) {
  if (!set.weight_used || !set.reps_completed) continue
  volumeMap.set(userId, (volumeMap.get(userId) || 0) + set.weight_used * set.reps_completed)
}
```

**Formula**: Same — `SUM(weight_used * reps_completed)` per row.

### 3c. Challenge Volume Progress (challengeService.ts)

**File**: `/src/services/challengeService.ts` (lines 203-224)

```ts
return data.reduce((sum, s) => {
  if (s.weight_used && s.reps_completed) return sum + s.weight_used * s.reps_completed
  return sum
}, 0)
```

**Formula**: Same pattern — `SUM(weight_used * reps_completed)` per row.

### 3d. Badge Volume Thresholds (badgeConfig.ts)

**File**: `/src/config/badgeConfig.ts`

- `volume_10k`: "Lift 10,000 lbs in one session"
- `volume_25k`: "Lift 25,000 lbs in one session"

These rely on the same per-row volume calculation.

### CRITICAL: Volume is calculated per ROW, not per set_number

All volume calculations iterate over individual `exercise_sets` rows and compute `weight_used * reps_completed` per row. **The `set_number` column is NOT used in any volume calculation.** Volume depends solely on:
- How many rows exist in `exercise_sets` for a session
- The `weight_used` and `reps_completed` values in each row

---

## 4. How Sets Are Logged (The set_number Bug Source)

### 4a. Single-Set Logging (useLogSet)

**File**: `/src/hooks/useWorkoutSession.ts` (line 157)

The caller passes `setNumber` explicitly. This is used in individual set logging.

### 4b. Multi-Set Logging (Primary Path — useLogMultipleSets)

**File**: `/src/hooks/useWorkoutSession.ts` (line 206)

Calls `logMultipleExerciseSets()` in workoutService.

**File**: `/src/services/workoutService.ts` (lines 165-188)

```ts
export async function logMultipleExerciseSets(
  sessionId, planExerciseId, totalSets, repsCompleted, weightUsed
) {
  const rows = Array.from({ length: totalSets }, (_, i) => ({
    session_id: sessionId,
    plan_exercise_id: planExerciseId,
    set_number: i + 1,       // <-- CORRECTLY incremented: 1, 2, 3, ...
    reps_completed: repsCompleted,
    weight_used: weightUsed,
    completed: true,
  }))
  // Bulk insert
}
```

**This function correctly sets set_number to 1, 2, 3, ... N.**

### 4c. How Workout.tsx Calls the Logger

**File**: `/src/pages/Workout.tsx` (lines 178-188)

```ts
const handleExerciseComplete = (exerciseId, reps, weight, plannedSets) => {
  if (!activeSession) return
  const totalSets = Math.max(1, plannedSets || 1)
  logSets({
    sessionId: activeSession.id,
    planExerciseId: exerciseId,
    totalSets,            // <-- from exercise.sets (the plan's configured set count)
    repsCompleted: reps,
    weightUsed: weight
  })
}
```

Called from ExerciseCard as:
```ts
onExerciseComplete={(reps, weight) =>
  handleExerciseComplete(exercise.id, reps, weight, exercise.sets || 1)
}
```

### 4d. Single-Set Logging Path (logExerciseSet)

**File**: `/src/services/workoutService.ts` (lines 141-163)

```ts
export async function logExerciseSet(
  sessionId, planExerciseId, setNumber, repsCompleted, weightUsed
) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert({
      session_id: sessionId,
      plan_exercise_id: planExerciseId,
      set_number: setNumber,    // <-- Whatever the caller passes
      ...
    })
}
```

The caller controls `setNumber`. If the caller always passes 1, all single-logged sets get `set_number=1`.

---

## 5. How Streaks Are Calculated

### 5a. Home Page Streak

**File**: `/src/pages/Home.tsx` (lines 32-65)

```ts
function calculateStreak(sessions) {
  // Walk backward from today, day by day
  // If a day has a completed session → streak++
  // Break when encountering a missed day (after allowing one gap)
  // Max 30-day lookback
}
```

Uses `completed_at` date set. **Not affected by set_number at all.**

### 5b. Stats Page (StatsGrid) — Current Streak + Best Streak

**File**: `/src/components/stats/StatsGrid.tsx` (lines 167-187)

```ts
// Current streak: walk backward from today through calendarDays
// Only breaks on a missed SCHEDULED day (non-rest, non-rest-day)
let currentStreak = 0
const sortedPast = [...pastDays].sort((a, b) => b.date.getTime() - a.date.getTime())
for (const d of sortedPast) {
  if (d.hasCompletedSession) currentStreak++
  else if (d.projected && !d.projected.isRest) break
}

// Best streak: walk forward through pastDays
let bestStreak = 0, tempStreak = 0
for (const d of pastDays) {
  if (d.hasCompletedSession) { tempStreak++; bestStreak = max(bestStreak, tempStreak) }
  else if (d.projected && !d.projected.isRest) tempStreak = 0
}
```

**Not affected by set_number.** Streaks are based on `CalendarDay.hasCompletedSession`, which checks `sessions.some(s => s.completed_at !== null)`.

### 5c. Lifetime Stats Streak

**File**: `/src/hooks/useLifetimeStats.ts` (lines 19-40)

```ts
// Longest streak across all time
// Deduplicates dates, sorts, walks forward counting consecutive days
const uniqueDates = [...new Set(completedDates)]
for (let i = 1; i < uniqueDates.length; i++) {
  if (diff <= 86400000) currentStreak++
  else { longestStreak = max(longestStreak, currentStreak); currentStreak = 1 }
}
```

**Not affected by set_number.** Based on session completion dates only.

---

## 6. Stats Displayed on Home Screen

**File**: `/src/pages/Home.tsx` (lines 124-142)

```ts
const allCompleted = [...weightsSessions, ...templateSessions]

const streak = calculateStreak(allCompleted)     // Day streak (see 5a)
const thisWeek = getWeeklyCount(allCompleted)     // Unique days with workouts this week
const totalWorkouts = allCompleted.filter(s => s.completed_at).length  // Total completed sessions
```

Three stats displayed:
1. **Streak** — Consecutive days with at least one completed session
2. **This Week** — Unique days with a completed session this week
3. **Total** — Count of all completed sessions (weights + templates)

**None of these use `set_number` or exercise_sets data at all.**

---

## 7. Stats Displayed on History Page (StatsGrid)

**File**: `/src/components/stats/StatsGrid.tsx` (lines 138-284)

Stats computed from `CalendarDay[]` and `UnifiedSession[]`:

| Stat | Calculation | Uses set_number? |
|------|-------------|------------------|
| Momentum Score | `completionRate * 0.5 + streak * 8 + perWeek/5 * 20` | No |
| Current Streak | Walk backward from today on scheduled days | No |
| Best Streak | Walk forward through month | No |
| 30-Day Heat Map | Session count per day | No |
| Weekly Frequency | Day-of-week average across all history | No |
| Total Time | `SUM(completed_at - started_at)` or `duration_minutes` | No |
| Total Sessions | Count of completed sessions this month | No |
| Per-Week Average | `totalSessions / weeksElapsed` | No |
| Workout Mix | Count by type (weights/cardio/mobility) | No |
| Completion Rate | `completedDays / scheduledDays` | No |
| Weekly Target | Completed vs scheduled this week | No |
| Active Days | Unique days with a workout | No |
| Longest Session | Max duration this month | No |

**None of these stats use `set_number` or reference `exercise_sets` at all.**

---

## 8. Where set_number IS Used

| Location | How set_number Is Used | Impact of All-1 Bug |
|----------|----------------------|---------------------|
| `SessionDetail.tsx` | Displays "Edit Set N" in modal title; uses `set_number` from DB | All sets show "Edit Set 1" |
| `SessionDetail.tsx` | Display logic: `S{index+1}` uses array index, NOT set_number | Visual display unaffected (uses index) |
| `WorkoutCard.tsx` (community) | Groups by `plan_exercise_id`, counts `.length` for set count | Unaffected (counts rows, not set_number) |
| `socialService.ts` | Orders by `set_number` when fetching | Order may be wrong but volume unaffected |
| `syncService.ts` | Dedup check: matches `plan_exercise_id + set_number` | **BUG**: Would incorrectly dedup offline sets if all have set_number=1 |
| `progressionService.ts` | Fetches last 5 sets, no reference to set_number | Unaffected |

---

## 9. Impact Analysis: Does set_number=1 Bug Affect Volume/Stats?

### Volume Calculations: NOT AFFECTED

All volume calculations (`socialService`, `leaderboardService`, `challengeService`) iterate over all exercise_set rows and compute `weight_used * reps_completed` per row. They never use `set_number` as a multiplier or aggregation key.

If an exercise has 3 sets with `set_number=1, 1, 1` (instead of `1, 2, 3`), there are still 3 rows, each with its own `weight_used` and `reps_completed`. The volume sum is identical.

### Streaks: NOT AFFECTED

All streak calculations operate at the session level (workout_sessions.completed_at). They never look at exercise_sets.

### Home Screen Stats: NOT AFFECTED

Streak, this-week count, and total workouts are all session-level counts.

### History Stats (StatsGrid): NOT AFFECTED

All stats are session-level or day-level aggregations. No exercise_set data is used.

### WHERE THE BUG DOES CAUSE PROBLEMS:

1. **Offline Sync Dedup (syncService.ts line 138-143)**: The dedup check matches on `plan_exercise_id + set_number`. If all sets have `set_number=1`, syncing offline mutations could incorrectly skip inserting sets 2, 3, etc. because it would find `set_number=1` already exists.

2. **SessionDetail Edit Modal Title**: Shows "Edit Set 1" for every set. Cosmetic but confusing.

3. **Data Integrity**: The `set_number` field loses its semantic meaning as a positional identifier within an exercise. Any future feature that relies on set ordering by `set_number` (e.g., pyramid set tracking, drop set detection, per-set progression) would break.

4. **Exercise History Order**: `getExerciseHistory` orders by `created_at` not `set_number`, so display is fine, but any future sort by `set_number` would collapse all sets to position 1.

---

## 10. Root Cause Investigation: Where Does set_number=1 Come From?

Looking at the logging paths:

### Path A: `logMultipleExerciseSets` (Primary — batch complete)
```ts
// workoutService.ts line 172
set_number: i + 1    // CORRECT: 1, 2, 3, ...
```
This is the primary path used by `Workout.tsx` when an exercise is completed. **This path correctly increments set_number.**

### Path B: `logExerciseSet` (Single set)
```ts
// workoutService.ts line 153
set_number: setNumber    // Whatever caller passes
```
The `useLogSet` hook passes `setNumber` from the mutation input. The bug would be in whatever UI component calls `useLogSet` — if it always passes `setNumber: 1`.

### Conclusion on the Bug

**If the database actually shows all `set_number=1`**, the issue is likely:
1. The multi-set path (`logMultipleExerciseSets`) may not be the path being used, or
2. An older version of the code may have logged sets differently, or
3. A migration or data import set all values to 1

The current code in `logMultipleExerciseSets` correctly generates `set_number: i + 1`. The critical offline sync dedup in `syncService.ts` is the most serious downstream effect, as it could cause data loss during offline sync by incorrectly deduplicating sets that share `set_number=1`.

---

## 11. Summary Table

| System | set_number Dependency | Bug Impact |
|--------|----------------------|------------|
| Volume (feed, leaderboard, challenges) | None (per-row sum) | NONE |
| Streaks (home, stats, lifetime) | None (session-level) | NONE |
| Home stats (streak, weekly, total) | None (session-level) | NONE |
| StatsGrid (momentum, completion, etc.) | None (day/session-level) | NONE |
| Session Detail display | Uses array index for "S1/S2/S3" | NONE (cosmetic) |
| Edit Set modal | Uses `set_number` for title | Minor (shows "Edit Set 1" always) |
| Offline sync dedup | Matches `plan_exercise_id + set_number` | **HIGH** — could skip valid sets |
| Social feed ordering | Orders by `set_number` | Minor (wrong order) |
| Future features | Would need correct positional data | **Latent risk** |
