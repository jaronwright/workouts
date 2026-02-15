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
| BUG-001 | P0 | Home/ExerciseLibrary | ExerciseDB API returns objects `{name: string}` instead of plain strings, causing React crash "Objects are not valid as a React child" | Home page, Exercise Library | 1. Open app 2. Home page loads body parts from ExerciseDB API 3. API returns `[{name: "back"}]` instead of `["back"]` 4. React crashes rendering object as child | VERIFIED |
| BUG-002 | P2 | Community | Nested `<button>` inside `<button>` - suggested user cards wrapped in button containing FollowButton, causing HTML validation error in console | Community page (Discover tab) | 1. Navigate to /community 2. Switch to Discover tab 3. Check console for "In HTML, <button> cannot be a descendant of <button>" | VERIFIED |
| BUG-003 | P1 | Weather | UvIndexChart hardcodes `23` for array bounds, causing crash if hourly data has fewer than 24 entries. Array index out of bounds on `pts[floorH]` and `pts[ceilH]`. | Home page (WeatherCard) | 1. Open app when weather API returns < 24 hourly UV entries 2. UvIndexChart tries `pts[floorH]` where floorH > data.length 3. TypeError on undefined.y | FIXED |
| BUG-004 | P2 | Cardio | CardioWorkout timer `accumulatedSecondsRef` not reset when starting new session; old accumulated time carries over from previous paused session | CardioWorkout page | 1. Start cardio timer, pause at 45s 2. Navigate away or complete 3. Start new cardio session 4. Pause — elapsed shows previous 45s + new time | FIXED |
| BUG-005 | P2 | Workout | `handleSwapExercise` missing try/catch — if `swapPlanExerciseName` throws, unhandled promise rejection appears in console | Active workout page | 1. During active workout, tap swap button 2. Select alternative exercise 3. If network error or service throws, promise rejection is unhandled | FIXED |
| BUG-006 | P2 | Workout | ExerciseCard weight input allows multiple decimal points (e.g. "2.5.5") and bare "." which `parseFloat(".")` = NaN, potentially saving NaN to database | Active workout page | 1. Start workout 2. In weight field, type "." or "2.5.5" 3. Complete exercise 4. NaN sent as weight value | FIXED |
| BUG-007 | P2 | Profile | Profile displayName state resets when profile refetches, losing unsaved edits if user is mid-edit when TanStack Query background-refetches | Profile page | 1. Navigate to Profile 2. Click edit pencil on name 3. Start typing new name 4. Wait for background profile refetch (or trigger by switching tabs) 5. Typed name reverts to server value | FIXED |
| BUG-008 | P2 | Workout | Workout splash screen setTimeout not cleaned up on unmount — if user navigates away during 2s splash delay, setState fires on unmounted component | Pre-workout page | 1. Navigate to workout pre-view 2. Click "Start Workout" 3. Immediately press browser back during splash animation 4. Console warning about setState on unmounted component | FIXED |
| BUG-009 | P2 | Cardio Detail | CardioSessionDetail uses `\|\|` instead of `??` for durationMinutes fallback — if `duration_minutes` is 0, it falls through to timestamp calculation instead of displaying 0 | Cardio session detail page | 1. Log a cardio workout with 0 min duration 2. View the session detail 3. Duration shows computed value instead of 0 | FIXED |
| BUG-010 | P2 | Cardio Detail | CardioSessionDetail uses `{durationMinutes &&` conditional — if duration is 0, the duration metric card is hidden entirely | Cardio session detail page | 1. View a session with 0 duration_minutes 2. Duration metric card not rendered because 0 is falsy | FIXED |
| BUG-011 | P2 | Workout Select | CardioCard and CardioWorkout hero use `duration_minutes ?` truthiness check — 0 minutes treated as falsy, showing "—" or empty string instead of "0 min" | Workout select page, Cardio workout hero | 1. Complete a cardio session with 0 duration 2. View workout select page or re-open cardio page 3. Last session shows "—" instead of "0 min" | FIXED |
| BUG-012 | P2 | Workout Select | WorkoutSelect `completed_at!` non-null assertions in useMemo comparisons — could crash if data is inconsistent | Workout select page | 1. Open workout select page 2. If template session has null completed_at in map (shouldn't happen but unsafe) 3. Potential TypeError on new Date(null!) | FIXED |
| BUG-013 | P2 | PR Service | prService uses `reps \|\| null` — if reps is 0, it becomes null, losing the actual 0 value | Active workout (PR check) | 1. Log a set with 0 reps (edge case) 2. PR service converts to null instead of preserving 0 | FIXED |
| BUG-014 | P2 | PR Service | prService uses `currentPR?.weight \|\| null` — if previous PR weight is 0, it returns null instead of 0 | Active workout (PR check) | 1. Have a PR with 0 weight 2. Check new PR 3. previousPR shows null instead of 0 | FIXED |
| BUG-015 | P3 | Accessibility | Modal missing `role="dialog"`, `aria-modal="true"`, close button missing `aria-label="Close"`, backdrop missing `aria-hidden` | All modal instances | 1. Open any modal 2. Inspect with accessibility tools 3. Missing ARIA attributes for screen readers | FIXED |
| BUG-016 | P3 | Accessibility | CollapsibleSection toggle button missing `aria-expanded` attribute — screen readers can't determine expanded/collapsed state | Home page, any collapsible sections | 1. Navigate to a page with collapsible sections 2. Inspect toggle button 3. Missing aria-expanded attribute | FIXED |
| BUG-017 | P1 | Session Detail | SessionDetail `sets[0]` accessed without checking array length — `Array.every()` returns true for empty arrays, causing TypeError on `undefined.reps_completed` | Session detail page | 1. View a session detail page 2. If an exercise has zero logged sets (skipped exercise) 3. Code calls `sets[0].reps_completed` on empty array → crash | FIXED |
| BUG-018 | P2 | Share | shareFormatters uses truthiness check on `durationMinutes` and `distanceValue` — 0 values excluded from share text | Share workout dialog | 1. Log a cardio workout with 0 min or 0 distance 2. Tap Share 3. Stats line shows "Completed" instead of "0 min" | FIXED |
| BUG-019 | P2 | Schedule | Schedule `getWorkoutSubtitle` uses truthiness check on `duration_minutes` — template with 0 min duration shows no subtitle | Schedule page | 1. View schedule with a template that has 0 duration_minutes 2. Subtitle is null instead of "~0 min" | FIXED |
| BUG-020 | P2 | Sync Engine | useSyncEngine calls `sync()` without `.catch()` — if `processQueue` throws unexpectedly, unhandled promise rejection | Background sync (on reconnect) | 1. Go offline during workout 2. Come back online 3. If sync throws unexpected error, unhandled rejection in console | FIXED |
| BUG-021 | P2 | Calendar | SelectedDayPanel uses `projected!.bgColor` and `projected!.color` non-null assertions — fragile even though logically safe | Calendar selected day panel | 1. View calendar 2. Select a rest day in the past 3. If `projected` is somehow null, crash on `projected!.bgColor` | FIXED |
| BUG-022 | P2 | Workout | ExerciseCard completed weight display uses `weight_used &&` — if weight is 0 (bodyweight logged as 0), the weight badge is hidden | Active workout page | 1. Complete an exercise with weight 0 2. Weight badge not shown because 0 is falsy | FIXED |
| BUG-023 | P2 | Community | BadgeCelebration nested `setTimeout(onComplete, 300)` not cleaned up on unmount — potential setState on unmounted component | Badge celebration overlay | 1. Earn a badge 2. Rapidly dismiss/navigate during 300ms exit animation 3. onComplete fires on unmounted component | FIXED |
| BUG-024 | P2 | Review | PostWorkoutReview `setTimeout` after submit not cleaned up — if modal unmounts during 1500ms delay, setState on unmounted component | Post-workout review modal | 1. Submit a review 2. Navigate away rapidly during "submitted" animation 3. closeReview/setSubmitted fires on unmounted component | FIXED |
| BUG-025 | P3 | Accessibility | ProgressionBadge button too small — ~20px height with py-1, below 44px minimum touch target | Active workout page | 1. View progression suggestion badge 2. Button height is ~20px, hard to tap on mobile | FIXED |
| BUG-026 | P3 | Accessibility | RestTimer play/pause button missing `aria-label` — screen readers can't identify the button | Rest timer overlay | 1. Open rest timer 2. Play/pause button has no accessible label | FIXED |
| BUG-027 | P3 | Accessibility | RestTimer reset button missing `aria-label` — screen readers can't identify the button | Rest timer overlay | 1. Open rest timer 2. Reset button has no accessible label | FIXED |

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
