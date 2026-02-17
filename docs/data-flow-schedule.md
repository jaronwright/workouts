# Data Flow: Schedule to Workout Start

## Overview

This document traces the complete data flow from the Schedule page through to starting an active workout session. There are two distinct paths: (1) the Schedule page itself (for editing), and (2) the Home page ScheduleWidget (for launching workouts).

---

## 1. Database Schema (Relevant Tables)

```
user_schedules
  - id (uuid PK)
  - user_id (uuid FK -> auth.users)
  - day_number (int, 1-7)
  - workout_day_id (uuid FK -> workout_days, nullable)
  - template_id (uuid FK -> workout_templates, nullable)
  - is_rest_day (boolean)
  - sort_order (int, supports multiple workouts per day)

workout_days
  - id (uuid PK)
  - plan_id (uuid FK -> workout_plans)
  - name (text, e.g. "Push (Chest, Shoulders, Triceps)")
  - day_number (int)

exercise_sections
  - id (uuid PK)
  - workout_day_id (uuid FK -> workout_days)
  - name (text, e.g. "Warm-Up", "Main Lifts")
  - sort_order (int)

plan_exercises
  - id (uuid PK)
  - section_id (uuid FK -> exercise_sections)
  - name (text)
  - sets (int)
  - reps_min / reps_max (int)
  - reps_unit (text: "reps", "seconds", "minutes", "steps")
  - weight_unit ("lbs" | "kg")
  - is_per_side (boolean)
  - sort_order (int)

workout_templates
  - id (uuid PK)
  - name (text)
  - type ("weights" | "cardio" | "mobility")
  - category (text, nullable)
  - duration_minutes (int, nullable)
  - workout_day_id (uuid FK -> workout_days, nullable, for mobility templates)

user_profiles
  - cycle_start_date (date)
  - timezone (text)
  - selected_plan_id (uuid FK -> workout_plans)
```

---

## 2. Schedule Page (Display + Editing)

### File: `src/pages/Schedule.tsx`

**Data fetching:**
```
useUserSchedule() -> scheduleService.getUserSchedule(userId) -> Supabase
useCycleDay()     -> useProfile() + getCurrentCycleDay(cycle_start_date, tz)
useProfile()      -> profileService.getProfile(userId) -> Supabase
```

**Key query (scheduleService.ts line 133):**
```sql
SELECT *,
  template:workout_templates(*),
  workout_day:workout_days(id, name, day_number)
FROM user_schedules
WHERE user_id = $1
ORDER BY day_number ASC
```

The `SCHEDULE_SELECT` constant joins `workout_templates` and `workout_days` in a single query via Supabase's embedded syntax.

**How workout_days are mapped to the week:**
1. `useCycleDay()` computes the current day (1-7) based on `profile.cycle_start_date` and the user's timezone.
2. Schedule data is grouped into a `Map<number, ScheduleDay[]>` keyed by `day_number` (supports multiple workouts per day).
3. Days 1-7 are rendered in a fixed list. The `currentCycleDay` determines which day gets the "active" highlight.

**Schedule editing (ScheduleDayEditor):**
- Tapping any day row opens `ScheduleDayEditor` (a BottomSheet).
- The editor fetches `useWorkoutTemplates()` (all templates) and `useSelectedPlanDays()` (workout_days for the user's selected plan).
- User can add: rest day, weights (workout_day), cardio (template), or mobility (template).
- Save calls `saveScheduleDayWorkouts()` which:
  1. Deletes all existing schedules for that day_number
  2. Inserts new rows with `sort_order` for multi-workout support
  3. Falls back to single-insert without `sort_order` if the migration hasn't been applied

**IMPORTANT: The Schedule page does NOT navigate to workouts.** It is purely for editing the 7-day cycle. Navigation to actual workouts happens via the Home page's ScheduleWidget.

---

## 3. Home Page -> ScheduleWidget -> Workout Navigation

### File: `src/pages/Home.tsx` -> `src/components/workout/ScheduleWidget.tsx`

**Data fetching in ScheduleWidget:**
```
useUserSchedule()         -> full 7-day schedule with joined data
useCycleDay()             -> current cycle day (1-7)
useUserSessions()         -> all user's weight sessions (for completion tracking)
useUserTemplateWorkouts() -> all user's cardio/mobility sessions (for completion tracking)
```

**How tapping a scheduled workout navigates to the workout page:**

The `handleDayClick(day: DayInfo)` function (ScheduleWidget.tsx line 252) routes based on workout type:

```typescript
if (day.isRest) -> navigate('/rest-day')
if (day.workoutDayId) -> navigate(`/workout/${day.workoutDayId}`)
if (day.templateId && type === 'cardio') -> navigate(`/cardio/${day.templateId}`)
if (day.templateId && type === 'mobility') -> navigate(`/mobility/${day.templateId}`)
else -> navigate('/schedule')  // no workout assigned
```

The `DayInfo` object is constructed by `getDayInfo()` in `src/utils/scheduleUtils.ts`, which extracts `workoutDayId`, `templateId`, and `templateType` from the `ScheduleDay` join data.

**Trigger points in ScheduleWidget:**
- "Start Workout" CTA button calls `handleActiveClick()` -> `handleDayClick(activeInfo)`
- "Continue" button (for in-progress sessions) calls `onContinueSession()` -> `navigate(/workout/${activeSession.workout_day_id}/active)`
- "View Details" button (for completed workouts) also calls `handleDayClick(activeInfo)`

---

## 4. Workout Page: Fetching exercise_sections and plan_exercises

### File: `src/pages/Workout.tsx`

**Route:** `/workout/:dayId` or `/workout/:dayId/active`

**Data fetching:**
```
useWorkoutDay(dayId) -> workoutService.getWorkoutDayWithSections(dayId) -> Supabase
```

**The `getWorkoutDayWithSections` function (workoutService.ts line 50) performs 3 sequential queries:**

1. **Fetch the workout day:**
   ```sql
   SELECT * FROM workout_days WHERE id = $dayId
   ```

2. **Fetch sections ordered by sort_order:**
   ```sql
   SELECT * FROM exercise_sections
   WHERE workout_day_id = $dayId
   ORDER BY sort_order ASC
   ```

3. **For each section, fetch exercises ordered by sort_order:**
   ```sql
   SELECT * FROM plan_exercises
   WHERE section_id = $sectionId
   ORDER BY sort_order ASC
   ```

These are run with `Promise.all` for the exercises (parallel per section), producing a `WorkoutDayWithSections` object:

```typescript
{
  ...workoutDay,
  sections: [
    {
      ...section,
      exercises: [planExercise, planExercise, ...]
    },
    ...
  ]
}
```

**Rendering order:**
- Sections render in `sort_order` order
- Warm-up sections (name contains "warm") are wrapped in `CollapsibleSection` (default closed)
- Within each section, exercises render in `sort_order` order
- Each exercise shows: name, sets x reps range, reps_unit, is_per_side

---

## 5. Starting a Workout Session

**When user taps "Start Workout" on the Workout page:**

1. `startWorkout` mutation calls `workoutService.startWorkoutSession(userId, workoutDayId)`
2. This first **deletes any orphaned incomplete sessions** for the user:
   ```sql
   DELETE FROM workout_sessions WHERE user_id = $1 AND completed_at IS NULL
   ```
3. Then inserts a new session:
   ```sql
   INSERT INTO workout_sessions (user_id, workout_day_id) VALUES ($1, $2)
   ```
4. The session is stored in `workoutStore` (Zustand) as `activeSession`
5. UI transitions to active workout mode showing exercise cards

---

## 6. Logging Sets (set_number flow)

**When a user completes an exercise:**

`Workout.tsx` calls `handleExerciseComplete(exerciseId, reps, weight, plannedSets)` (line 178):
```typescript
const totalSets = Math.max(1, plannedSets || 1)
logSets({
  sessionId: activeSession.id,
  planExerciseId: exerciseId,
  totalSets,
  repsCompleted: reps,
  weightUsed: weight
})
```

This calls `logMultipleExerciseSets` in workoutService.ts (line 165), which creates an array of rows with **properly incrementing set_number** (i + 1):

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

The single-set `logExerciseSet` also accepts `setNumber` as a parameter, so it relies on the caller passing the correct value.

---

## 7. Complete Data Flow Summary

```
Schedule Page (edit only):
  useUserSchedule() -> user_schedules + joins
  ScheduleDayEditor -> saveScheduleDayWorkouts() -> DELETE + INSERT

Home Page -> ScheduleWidget (navigation):
  useUserSchedule() -> schedule data
  useCycleDay() -> current day (1-7)
  User taps "Start Workout" -> navigate(/workout/{workoutDayId})

Workout Page:
  useWorkoutDay(dayId) -> workout_days + exercise_sections + plan_exercises
  Start session -> workout_sessions INSERT
  Log sets -> exercise_sets INSERT (set_number = i+1 from logMultipleExerciseSets)
  Complete -> workout_sessions UPDATE (completed_at)
```

---

## 8. Key Observations

1. **Schedule page is edit-only** -- it does not provide navigation to start workouts. That is handled by the Home page's ScheduleWidget.

2. **Cycle day calculation** depends on `profile.cycle_start_date` and timezone. If either is missing, defaults to day 1.

3. **Multiple workouts per day** are supported via `sort_order` column. The ScheduleWidget shows tabs when multiple workouts are scheduled.

4. **Exercise sections ordering** is guaranteed by `sort_order` at both the section and exercise level. Warm-up sections are auto-collapsed.

5. **The `logMultipleExerciseSets` function correctly increments `set_number`** from 1 to N. There is no "all sets = 1" bug in this path. However, if `logExerciseSet` (single-set) is called with incorrect `setNumber`, that could produce duplicates.
