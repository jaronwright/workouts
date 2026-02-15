# Bug Tracker

## Severity Definitions

- **P0** -- App crashes, data loss, feature completely broken, user cannot complete core flow
- **P1** -- Feature partially broken, incorrect data displayed, significant visual bug that blocks usability
- **P2** -- Minor visual issue, inconsistent spacing, animation glitch, edge case failure
- **P3** -- Cosmetic nitpick, copy improvement, minor polish

## Status Legend

- **OPEN** -- Bug confirmed, not yet addressed
- **IN PROGRESS** -- Fix is being worked on
- **FIXED** -- Fix merged, pending verification
- **VERIFIED** -- Fix verified in production
- **WONT FIX** -- Intentional behavior or deferred indefinitely

---

## Bugs

| BUG-ID | Severity | Area | Description | Screen | Steps to Reproduce | Status |
|--------|----------|------|-------------|--------|-------------------|--------|
| BUG-001 | P0 | Home/ExerciseLibrary | ExerciseDB API returns objects `{name: string}` instead of plain strings, causing React crash "Objects are not valid as a React child" | Home page, Exercise Library | 1. Open app 2. Home page loads body parts from ExerciseDB API 3. API returns `[{name: "back"}]` instead of `["back"]` 4. React crashes rendering object as child | FIXED |
| BUG-002 | P0 | Auth | | Auth page | 1. Open `/auth` 2. Enter valid email and password 3. Click "Sign In" 4. Observe behavior when Supabase auth service is unreachable | OPEN |
| BUG-003 | P1 | Workout/Active | | Active workout page | 1. Start a weights workout 2. Log sets for an exercise 3. Navigate away using browser back button 4. Return to the workout 5. Check if completed sets are still displayed correctly | OPEN |
| BUG-004 | P1 | History/Calendar | | History page (Calendar tab) | 1. Navigate to History 2. Switch months rapidly using month navigation arrows 3. Observe if calendar data loads correctly or shows stale data | OPEN |
| BUG-005 | P1 | Cardio Workout | | CardioWorkout page | 1. Open a cardio workout 2. Start the timer 3. Pause the timer 4. Resume the timer 5. Check if elapsed time is calculated correctly after pause/resume cycle | OPEN |
| BUG-006 | P2 | Home | | Home page | 1. Open app with no completed workouts 2. Observe the stats section (streak, this week, total) 3. Verify all show "0" and do not show NaN or undefined | OPEN |
| BUG-007 | P2 | Schedule | | Schedule page | 1. Navigate to Schedule 2. Click on an empty day slot to add a workout 3. Close the ScheduleDayEditor modal 4. Verify the schedule list does not flicker or re-render excessively | OPEN |
| BUG-008 | P2 | Profile | | Profile page | 1. Navigate to Profile 2. Click the pencil icon to edit display name 3. Enter a very long name (50+ characters) 4. Check if the name truncates properly in the hero section | OPEN |
| BUG-009 | P2 | Community | | Community page | 1. Navigate to Community 2. Open the notification bell 3. Close the notification panel 4. Open it again 5. Verify notifications are not duplicated | OPEN |
| BUG-010 | P2 | Exercise Library | | Exercise Library page | 1. Navigate to Exercise Library 2. Search for an exercise 3. Clear the search 4. Verify the browse tabs and category chips reappear without a flash of empty content | OPEN |
| BUG-011 | P2 | Mobility Workout | | Mobility workout page | 1. Open a mobility workout with exercises 2. Check all exercise checkboxes 3. Click "Complete Workout" 4. Verify the review modal opens and the correct duration is passed | OPEN |
| BUG-012 | P3 | Auth | | Auth page (Sign Up) | 1. Open `/auth` 2. Switch to Sign Up tab 3. Enter a weak password 4. Observe the PasswordStrengthIndicator 5. Verify the indicator text matches the strength level | OPEN |
| BUG-013 | P3 | Home | | Home page | 1. Open app 2. Observe the greeting text 3. Verify correct greeting for time of day (morning/afternoon/evening) | OPEN |
| BUG-014 | P3 | Workout | | Workout pre-workout view | 1. Open a workout day with many exercises 2. Scroll down through the exercise list 3. Verify the floating "Start Workout" button stays visible and does not overlap content | OPEN |
| BUG-015 | P3 | Rest Day | | Rest Day page | 1. Navigate to Rest Day page 2. Toggle several rest activities as complete 3. Verify check marks appear and disappear correctly | OPEN |

---

## Reporting a New Bug

When adding a new bug, use the next available BUG-ID and include:

1. **Severity**: P0/P1/P2/P3 per the definitions above
2. **Area**: The feature area or component name
3. **Description**: Clear, concise description of the problem
4. **Screen**: Which screen/page the bug appears on
5. **Steps to Reproduce**: Numbered steps to trigger the bug
6. **Status**: Set to OPEN when filing

### Template

```
| BUG-XXX | PX | Area | Description of the bug | Screen name | 1. Step one 2. Step two 3. Step three | OPEN |
```
