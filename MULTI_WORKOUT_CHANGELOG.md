# Multi-Workout Per Day — UI Polish & Overtraining Warning

## Changes

### Issue 1: ScheduleWidget shows all workouts per day
- **File:** `src/components/workout/ScheduleWidget.tsx`
- Changed schedule map from `Map<number, ScheduleDay>` to `Map<number, ScheduleDay[]>` to store all workouts per day
- Today's workout display now shows "+ N more workout(s)" subtitle when multiple workouts are scheduled

### Issue 2: Calendar count badge improvement
- **File:** `src/components/calendar/CalendarDayCell.tsx`
- When multiple sessions exist for a day, the icon circle is replaced with a count badge showing the total (e.g., "2", "3")
- Count badge uses a neutral gradient background
- Green completion dot and red missed dot still display correctly alongside count badges

### Issue 3: Schedule page 7-day strip shows count for multi-workout days
- **File:** `src/pages/Schedule.tsx`
- When a day has multiple workouts, the pill shows the count number instead of a single workout icon

### Issue 4: Calendar projection supports multi-workout days
- **File:** `src/hooks/useCalendarData.ts`
- Changed schedule map to store arrays of `ScheduleDay[]`
- Added `projectedCount` field to `CalendarDay` interface
- Future days with multiple projected workouts now show count badges in the calendar

### Issue 5: Overtraining warning in ScheduleDayEditor
- **File:** `src/components/schedule/ScheduleDayEditor.tsx`
- Added amber warning banner when 3+ workouts are scheduled for a single day
- Warning dynamically updates as workouts are added/removed
- **File:** `src/services/scheduleService.ts`
- Added `console.warn` for overtraining risk when saving 4+ workouts to a day

### Issue 6: Removed debug console.log statements
- **File:** `src/services/scheduleService.ts`
- Removed all `console.log` from `saveScheduleDayWorkouts()`
- Preserved `console.warn` (overtraining) and `console.error` (actual errors)

## New Tests

- `src/components/workout/__tests__/ScheduleWidget.test.tsx` — 5 tests covering single/multi-workout display, rest days, and empty schedule
- `src/components/schedule/__tests__/ScheduleDayEditor.test.tsx` — 4 tests covering overtraining warning visibility, threshold, rest day exclusion, and dynamic removal
- `src/components/calendar/__tests__/CalendarDayCell.test.tsx` — 4 new tests added for count badge (multi-session, single session, projected multi-workout, green dot with count badge)
- `src/pages/__tests__/Schedule.test.tsx` — 2 new tests for multi-workout pill count and single workout icon display
