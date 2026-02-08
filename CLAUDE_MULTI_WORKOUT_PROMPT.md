# Multi-Workout Per Day — UI Polish & Overtraining Warning

## Usage

```bash
cd /Users/jaronwright/src/workouts
claude --dangerously-skip-permissions "$(cat CLAUDE_MULTI_WORKOUT_PROMPT.md)"
```

---

## Prompt

You are an autonomous senior full-stack engineer. The multi-workout-per-day database layer and service layer are already working — users CAN save multiple workouts to the same day. Your job is to fix the remaining UI issues and add a missing overtraining warning.

Do NOT ask for any user input. Read every referenced file before editing. Run `npm run build` after each step to catch issues early.

---

## WHAT ALREADY WORKS (DO NOT BREAK THESE)

- **Database**: `user_schedules` table has `sort_order` column, UNIQUE constraint is `(user_id, day_number, sort_order)`. Migration `20240205000001_multiple_workouts_per_day.sql` exists and is correct.
- **Service**: `scheduleService.ts` → `saveScheduleDayWorkouts()` correctly saves arrays with sort_order, has error handling, has fallback for missing migration.
- **Schedule Editor**: `ScheduleDayEditor.tsx` → `addWorkout()` correctly appends to the array, `removeWorkout()` removes by index, `handleSave()` maps to `ScheduleWorkoutItem[]` and saves.
- **Schedule Page cards**: `Schedule.tsx` → The daily card list (lines ~210-227) correctly renders ALL workout chips per day using `daySchedules.map()`.
- **History calendar**: `CalendarDayCell.tsx` → Shows "+N" badge for multiple completed sessions.
- **History detail panel**: `SelectedDayPanel.tsx` → Already maps over ALL `sessions` and renders a `SessionCard` for each one.

---

## ISSUE 1: ScheduleWidget only shows first workout per day

**File:** `src/components/workout/ScheduleWidget.tsx`

**Problem (lines 27-33):** The Map stores only the FIRST workout per day:
```typescript
const scheduleMap = new Map<number, ScheduleDay>()
schedule?.forEach(s => {
  if (!scheduleMap.has(s.day_number)) {
    scheduleMap.set(s.day_number, s)
  }
})
```

**Fix:** Change to store ALL workouts per day as arrays:
```typescript
const scheduleMap = new Map<number, ScheduleDay[]>()
schedule?.forEach(s => {
  const existing = scheduleMap.get(s.day_number) || []
  existing.push(s)
  scheduleMap.set(s.day_number, existing)
})
```

Then update `days` computation (lines 36-40) to handle arrays. The `getDayInfo()` function takes a single `ScheduleDay`, so pass the first item for the icon/name/color. But also track the count so the widget can show "2 workouts" or similar when there are multiple.

**Today's workout display (lines 159-208):** Currently shows one workout name and one icon. When multiple workouts exist for today:
- Show the first workout's icon and name (as primary)
- Add a small subtitle line: `"+ N more"` below the name when there are 2+ workouts. For example:

```
  [Push icon] Day 3 — Today
              Push Day
              + 1 more workout
```

Do NOT redesign the whole widget — just add the subtitle when count > 1.

---

## ISSUE 2: Calendar count badge improvement

**File:** `src/components/calendar/CalendarDayCell.tsx`

**Current (lines 127-132):** Shows `+{sessions.length - 1}` text in the top-right corner:
```tsx
{sessions.length > 1 && isCurrentMonth && (
  <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-[var(--color-text-muted)]">
    +{sessions.length - 1}
  </span>
)}
```

**Change to:** When `sessions.length > 1`, REPLACE the workout icon circle entirely with a count badge:
- Show the total count (e.g., "2", "3") inside the same 28px circle position where the icon normally goes
- Use a neutral gradient background (`background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))`)
- Count text should be bold, 11px, using `var(--color-text)`
- Keep the green completion dot at the bottom if ANY session is completed
- Keep the missed red dot if applicable

So the logic becomes:
- `sessions.length === 0` and projection exists → show projected icon (current behavior)
- `sessions.length === 1` → show that session's icon (current behavior)
- `sessions.length > 1` → show count badge INSTEAD of icon

Read the full file and modify the rendering logic in the `{/* Workout icon circle */}` section.

---

## ISSUE 3: Schedule page 7-day strip only shows first workout icon

**File:** `src/pages/Schedule.tsx`

**Problem (lines 105-153):** The 7-day pill strip only reads `daySchedules[0]`:
```typescript
const firstSchedule = daySchedules[0]
const chip = firstSchedule ? getWorkoutChip(firstSchedule) : null
```

And renders only one icon:
```tsx
{chip?.Icon ? (
  <chip.Icon className="w-4 h-4" />
) : (
  day
)}
```

**Fix:** When `daySchedules.length > 1`, show the count number instead of an icon:

```tsx
{daySchedules.length > 1 ? (
  <span className="text-xs font-bold">{daySchedules.length}</span>
) : chip?.Icon ? (
  <chip.Icon className="w-4 h-4" />
) : (
  day
)}
```

That's all — keep everything else about the pill styling the same.

---

## ISSUE 4: Calendar projection only shows first scheduled workout

**File:** `src/hooks/useCalendarData.ts`

**Problem (lines 52-58):** The schedule map only stores the first workout per cycle day:
```typescript
const scheduleMap = new Map<number, ScheduleDay>()
if (schedule) {
  for (const s of schedule) {
    if (!scheduleMap.has(s.day_number)) {
      scheduleMap.set(s.day_number, s)
    }
  }
}
```

And on line 115, `projected` only shows one workout's info:
```typescript
const daySchedule = scheduleMap.get(cycleDay)
projected = getDayInfo(daySchedule, cycleDay)
```

**Fix:** Change the map to store arrays:
```typescript
const scheduleMap = new Map<number, ScheduleDay[]>()
if (schedule) {
  for (const s of schedule) {
    const existing = scheduleMap.get(s.day_number) || []
    existing.push(s)
    scheduleMap.set(s.day_number, existing)
  }
}
```

Then update the projection assignment: `projected` still gets the first item's `DayInfo`, but add a `projectedCount` field to the `CalendarDay` interface:

```typescript
interface CalendarDay {
  // ... existing fields
  projectedCount: number  // NEW — total scheduled workouts for this cycle day
}
```

Set it:
```typescript
const daySchedules = scheduleMap.get(cycleDay) || []
projected = daySchedules.length > 0 ? getDayInfo(daySchedules[0], cycleDay) : null
// ...
projectedCount: daySchedules.length,
```

Then in `CalendarDayCell.tsx`, use `day.projectedCount` in addition to `sessions.length` to determine whether to show a count badge for FUTURE days. Specifically:
- Past/today with completed sessions: count = `sessions.length` (existing logic)
- Future with projections: count = `day.projectedCount`
- If the count for either source is > 1, show the count badge

---

## ISSUE 5: Add overtraining warning to ScheduleDayEditor

**File:** `src/components/schedule/ScheduleDayEditor.tsx`

The editor currently allows unlimited workouts per day with no warning. Add a soft warning when the user has 3+ workouts and tries to add more.

**Implementation:**

1. Above the `{/* Add Workout Button / Menu */}` section (before line 226), add a conditional warning banner:

```tsx
{selectedWorkouts.length >= 3 && selectedWorkouts[0]?.type !== 'rest' && (
  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
    <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
    <p className="text-sm text-amber-600 dark:text-amber-400">
      Scheduling {selectedWorkouts.length} sessions in one day increases injury and overtraining risk. Consider spreading workouts across multiple days.
    </p>
  </div>
)}
```

2. Also add a `console.warn` in `src/services/scheduleService.ts` inside `saveScheduleDayWorkouts()`, right after the `console.log('saveScheduleDayWorkouts called:', ...)` line:

```typescript
if (workouts.length > 3) {
  console.warn('Overtraining risk: User scheduling', workouts.length, 'workouts on day', dayNumber)
}
```

---

## ISSUE 6: Remove console.log statements

**File:** `src/services/scheduleService.ts`

The `saveScheduleDayWorkouts()` function has multiple `console.log` debug statements (lines 179, 184, 194, 198, 234, 287). Remove all `console.log` statements from this function. Keep only `console.warn` (for overtraining) and `console.error` (for actual errors).

---

## IMPLEMENTATION ORDER

### Step 1: Fix ScheduleWidget (Issue 1)
1. Read `src/components/workout/ScheduleWidget.tsx`
2. Read `src/utils/scheduleUtils.ts`
3. Change the Map to store arrays
4. Add "+ N more" subtitle for multi-workout days
5. Run `npm run build`

### Step 2: Fix Calendar projection (Issue 4)
1. Read `src/hooks/useCalendarData.ts`
2. Change schedule map to store arrays
3. Add `projectedCount` to `CalendarDay` interface
4. Run `npm run build`

### Step 3: Update CalendarDayCell count badge (Issue 2)
1. Read `src/components/calendar/CalendarDayCell.tsx`
2. Add count badge logic for multi-session AND multi-projected days
3. Use `sessions.length` for completed and `day.projectedCount` for projected
4. Run `npm run build`

### Step 4: Update Schedule page icon strip (Issue 3)
1. Read `src/pages/Schedule.tsx`
2. Show count number in pill when `daySchedules.length > 1`
3. Run `npm run build`

### Step 5: Add overtraining warning (Issue 5)
1. Read `src/components/schedule/ScheduleDayEditor.tsx`
2. Add amber warning banner when `selectedWorkouts.length >= 3`
3. Add `console.warn` in `scheduleService.ts`
4. Run `npm run build`

### Step 6: Clean up console.log (Issue 6)
1. Read `src/services/scheduleService.ts`
2. Remove all `console.log` from `saveScheduleDayWorkouts()`
3. Keep `console.warn` and `console.error`
4. Run `npm run build`

### Step 7: Fix any broken tests
1. Run `npx vitest run`
2. Fix any tests that break due to the new `projectedCount` field or changed rendering
3. Ensure all tests pass

### Step 8: Write new tests

Write tests covering:

1. **ScheduleWidget multi-workout display** (`src/components/workout/__tests__/ScheduleWidget.test.tsx`):
   - Renders single workout normally (icon + name)
   - Renders "+ N more" when multiple workouts exist for today
   - Handles rest days correctly

2. **CalendarDayCell count badge** (extend `src/components/calendar/__tests__/CalendarDayCell.test.tsx`):
   - Single session shows workout icon
   - 2+ sessions show count badge with total number
   - Count badge works for both completed and projected
   - Green dot still shows when completed

3. **Schedule page icon strip** (extend `src/pages/__tests__/Schedule.test.tsx`):
   - Single workout day shows icon
   - Multi-workout day shows count number

4. **ScheduleDayEditor overtraining warning** (`src/components/schedule/__tests__/ScheduleDayEditor.test.tsx`):
   - Warning hidden when < 3 workouts
   - Warning visible when 3+ workouts
   - Warning disappears when workout removed below threshold
   - Warning not shown for rest days

### Step 9: Final verification
1. Run `npm run build` — zero errors
2. Run `npm run lint` — fix any issues
3. Run `npx vitest run --reporter=verbose` — all tests pass
4. Write a brief summary to `MULTI_WORKOUT_CHANGELOG.md`

Do NOT skip any step. Do NOT ask for input. Work through everything systematically.
