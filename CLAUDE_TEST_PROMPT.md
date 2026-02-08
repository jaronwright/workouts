# Overnight E2E Testing Prompt for Claude Code

## Usage

```bash
cd /Users/jaronwright/src/workouts
claude --dangerously-skip-permissions "$(cat CLAUDE_TEST_PROMPT.md)"
```

---

## Prompt

You are an autonomous QA engineer and bug hunter. Your job is to comprehensively test AND fix bugs in the workout-tracker app in this directory. Do NOT ask for any user input at any point — make all decisions yourself. Work silently and methodically until every area is tested and every bug you find is fixed.

IMPORTANT: When you fix a bug, make the minimal fix that solves the problem without breaking other things. After each fix, re-run the relevant tests to verify. Keep a running tally of everything you fix.

---

### PHASE 0: SETUP & ENVIRONMENT

1. Run `npm install` to ensure all dependencies are present.
2. Run `npm run build` — fix any TypeScript or build errors you find. If you fix something, note it and re-run the build until it succeeds cleanly.
3. Run `npm run lint` — fix any lint errors. Note what you fixed.
4. Run the existing test suite with `npx vitest run --reporter=verbose` and record results. Fix any broken tests. Do not delete tests — fix them.
5. Check that the dev server starts with `npm run dev` (run in background, verify it responds on localhost, then kill it).

---

### PHASE 1: STATIC ANALYSIS & BUG HUNTING

Read through EVERY source file in `src/` and fix real bugs. Here are known problem areas to investigate and fix. For each one, read the actual code, confirm the bug exists, and fix it:

#### 1A. Auth Flow Bugs (src/stores/authStore.ts, src/hooks/useAuth.ts, src/App.tsx)

- **Memory leak — unsubscribed auth listener**: In `authStore.ts`, the `initialize()` function registers `supabase.auth.onAuthStateChange()` but never stores or calls the unsubscribe function. Fix: store the subscription and provide a cleanup mechanism.
- **Race condition — listener registered after session fetch**: `onAuthStateChange` is set up AFTER `getSession()` returns. If Supabase fires an auth event during the network delay, it's missed. Fix: register the listener first, then fetch session.
- **Session-only flag logic bug**: The "Remember me" implementation uses `sessionStorage` with a `sessionActive` flag, but `sessionStorage` persists on tab refresh, so the session-only check (`sessionOnly === 'true' && !sessionActive`) will always be false after first load. Fix: use a more reliable mechanism or clear the flag appropriately.
- **Double initialization**: `useAuth().initialize()` is called in `AppRoutes` component AND potentially triggered again via the hook's own useEffect. Fix: ensure `initialize()` is idempotent and only runs once.
- **ProtectedRoute race condition**: In `App.tsx`, `ProtectedRoute` might briefly render protected content before redirect if `initialized` is false but `user` is being populated. Fix: never render children until `initialized` is true.
- **AuthCallbackPage not setting initialized**: After OAuth callback processes, the `initialized` flag may not be set, leaving the app in a loading state. Fix: ensure callback handler sets the right store state.

#### 1B. React Hook Dependency Issues

- **useAuth.ts — potential infinite loop**: The `initialize` function from the store may be recreated on every render, causing the useEffect that depends on it to fire repeatedly. Fix: use a ref or stable reference.
- **ExerciseCard.tsx — missing useEffect dependencies**: Check that all useEffects have correct dependency arrays. Specifically look for `weight` state being used inside effects but missing from the dependency array.
- **ExerciseCard.tsx — stale closure in handleToggleUnit**: The unit toggle handler captures `localWeightUnit` from closure. Rapid toggles could cause revert to use the wrong value. Fix: use functional state update or ref.
- **Home.tsx — setTimeout without cleanup**: Onboarding auto-open uses setTimeout but doesn't clear it on unmount. Fix: add cleanup return in useEffect.

#### 1C. Timer & Interval Bugs

- **RestTimer.tsx — interval not properly cleared on rapid pause/resume**: Rapid pause/resume can create multiple intervals. Fix: always clear existing interval before creating a new one.
- **RestTimer.tsx — unsafe state update after unmount**: `decrementRestTimer()` may be called by a stale interval after component unmounts. Fix: add mounted check or use cleanup.
- **CardioWorkoutPage.tsx — stale closure in timer interval**: The interval callback captures `startTimeRef.current` but doesn't properly handle pause/resume transitions, causing elapsed time jumps. Fix: track accumulated time separately from live calculation.
- **CardioWorkoutPage.tsx — timer survives navigation**: If user navigates away while timer is running, interval continues. Fix: clear interval on unmount.
- **CardioWorkoutPage.tsx — browser suspension causes time jump**: If device sleeps or browser suspends tab, `Date.now()` jumps forward on resume, corrupting elapsed time. Fix: cap maximum delta per tick or track accumulated time.

#### 1D. Service Layer Error Handling

- **profileService.ts — silent error swallowing**: `getProfile()` catches errors and returns null, making it impossible to distinguish "no profile" from "network error". Fix: let network errors propagate, only return null for 404/not-found.
- **scheduleService.ts — uncaught promise rejection**: Check all async functions for missing await in try-catch blocks. Fix any fire-and-forget async calls that should be awaited.
- **templateWorkoutService.ts — silent fallback to memory**: When the `template_workout_sessions` table doesn't exist, the service silently creates fake sessions in memory that are lost on refresh. Fix: either properly handle the missing table with a user-visible error, or ensure data persists.
- **templateWorkoutService.ts — error masking**: Multiple functions catch all errors and return empty arrays, masking real permission or database errors. Fix: distinguish between expected empty results and actual errors.

#### 1E. Null Safety & Undefined Issues

- **Workout.tsx — non-null assertions on optional data**: `useSessionSets(activeSession?.id)` passes potentially undefined ID. Downstream code uses `!` non-null assertions. Fix: add proper null guards.
- **CardioWorkoutPage.tsx — startTimeRef non-null assertion**: `startTimeRef.current!` is used without checking if start has actually been called. Fix: add null checks.
- **Home.tsx — nullable workout_day access**: `activeSession.workout_day?.name` is used but `workout_day` could be null from a failed Supabase join. Fix: add fallback display.
- **Workout.tsx — forEach without property validation**: `sessionSets.forEach()` assumes `set.plan_exercise_id` exists. Fix: add null checks or filter.

#### 1F. State Management Issues

- **workoutStore.ts — Map serialization**: The store uses `Map` for `completedSets`, but Zustand's persist middleware doesn't serialize Map objects correctly. Fix: use a plain object or add custom serialization.
- **workoutStore.ts — no crash recovery**: If the app crashes or browser closes during a workout, `completedSets` may contain stale data from a previous session. Fix: validate session consistency on load, clear stale data.
- **authStore.ts — initialized flag not persisted**: On refresh, `initialized` resets to false, triggering loading spinner + redundant API call even though user/session are already in persisted storage. Fix: derive `initialized` from presence of persisted data, or persist the flag.

#### 1G. Query Key & Cache Invalidation Mismatches (src/hooks/useWorkoutSession.ts)

- **Query key mismatch**: Mutations invalidate `['active-session']` but queries are keyed as `['active-session', user?.id]`. The invalidation won't match. Fix: use consistent key patterns, ensure mutations invalidate the exact keys used by queries.
- **Session sets key mismatch**: `useLogSet` invalidates `['session-sets']` but `useSessionSets` uses `['session-sets', sessionId]`. Fix: include the sessionId in invalidation.

#### 1H. PWA & Caching Issues (vite.config.ts)

- **API caching breaks auth**: The Workbox config caches Supabase API responses with `NetworkFirst` for 24 hours. This means auth tokens, deleted data, and user changes can be served from stale cache. Fix: exclude auth endpoints from caching, reduce cache TTL, or only cache read-only data endpoints.
- **Error responses cached**: `statuses: [0, 200]` caches offline/error responses. Fix: only cache successful responses.

#### 1I. Async/Promise Issues

- **CardioWorkoutPage.tsx — missing error callback on mutations**: `startWorkout.mutate()` has no `onError`, so if it fails, the UI still shows "running" state. Fix: add error callbacks to all mutations that update UI state.
- **General pattern**: Audit every `.mutate()` call across the codebase for missing `onError` handlers. Every mutation that updates local state optimistically needs an error handler to roll back.

#### 1J. General Code Review

After fixing the above, do a full pass through all files in `src/` looking for:
- Unused imports and dead code
- Console.log statements that should be removed
- Hardcoded values that should be constants or config
- Missing TypeScript types (any `any` types that should be specific)
- Accessibility issues (missing aria labels, missing alt text, non-keyboard-accessible interactions)
- Missing error boundaries around pages/features
- Memory leaks from event listeners not cleaned up
- Potential XSS from dangerouslySetInnerHTML or unescaped user content

---

### PHASE 2: UNIT & INTEGRATION TESTS — EXPAND COVERAGE

Write new Vitest + React Testing Library tests to cover every gap. Use the existing test patterns in `src/__tests__/` and `src/**/*.test.ts(x)` as style guides. Use MSW handlers for mocking Supabase calls. Target >80% line coverage across the project.

**Services to test (src/services/):**
- `workoutService.ts` — getWorkoutPlans, getWorkoutDays, getWorkoutDayWithSections, startWorkoutSession, completeWorkoutSession, logSet, deleteSet, getUserSessions, updateExerciseWeightUnit
- `scheduleService.ts` — getUserSchedule, getScheduleDay, upsertScheduleDay, deleteScheduleDay, initializeDefaultSchedule, clearUserSchedule, getWorkoutTemplates, getTodaysScheduledWorkout
- `templateWorkoutService.ts` — getTemplate, startTemplateWorkout, quickLogTemplateWorkout, completeTemplateWorkout, getUserTemplateWorkouts
- `profileService.ts` — getProfile, upsertProfile, updateCycleStartDate, deleteUserAccount
- `avatarService.ts` — uploadAvatar, deleteAvatar, getAvatarUrl
- `progressionService.ts` — getProgressionSuggestion, getLastWeight, checkForPR
- `prService.ts` — getPRs, isPR

**Zustand stores to test (src/stores/):**
- `authStore` — signUp, signIn, signOut, resetPassword, updatePassword, signInWithGoogle, session persistence, initialize idempotency
- `workoutStore` — setActiveSession, addCompletedSet, startRestTimer, pauseRestTimer, resetRestTimer, clearSession, Map serialization/deserialization
- `themeStore` — setTheme, initializeTheme, persistence across reloads
- `settingsStore` — updateSettings, persistence
- `toastStore` — show, dismiss, queue behavior

**Hooks to test (src/hooks/):**
- `useAuth` — authentication state, redirect behavior, single initialization
- `useAvatar` — upload, delete, URL generation
- `useProfile` — get, upsert, cycle date
- `useSchedule` — CRUD for schedule, template fetching
- `useTheme` — light/dark/system, CSS variable application
- `useWorkout` — session lifecycle, set logging, weight tracking
- `useCardioWorkout` — timer, quick log, completion
- `useMobilityWorkout` — template flow
- `useHistory` — session fetching, calendar data

**Utility functions to test (src/utils/):**
- Date formatters and cycle day calculation
- Set/rep parsing (`parseSetReps`)
- Cardio utilities
- Validation helpers (email, password strength)
- Weight unit conversion (lbs ↔ kg)

**Components to test (src/components/):**

UI components:
- `Button` — all variants (primary, secondary, danger, gradient), sizes (sm, md, lg), loading state, disabled state, click handler
- `Card` / `CardContent` — elevated/outlined variants, highlight prop
- `Avatar` — image display, fallback initials, size options
- `Badge` — completed, pending, active variants
- `Input` — label, placeholder, validation error display, onChange
- `Modal` — open/close, overlay click dismiss, confirm/cancel actions
- `BottomSheet` — slide up/down, snap points, drag dismiss
- `Toast` / `ToastProvider` — success/error/warning display, auto-dismiss, queue
- `AnimatedCard` — mount animation, hover effect
- `AnimatedCounter` — number counting animation
- `StreakBar` — visual streak display

Workout components:
- `ExerciseCard` — weight input, unit toggle (lbs/kg), completion toggle, progression badge, info button opens detail modal, last weight display
- `RestTimer` — preset selection (30s, 45s, 1m, 1:30, 2m, 3m, 5m), play/pause/reset, progress bar, timer stops at zero (not negative)
- `CollapsibleSection` — expand/collapse toggle, child rendering
- `WorkoutDayCard` — displays day name, icon, click navigation
- `CardioLogCard` — template info, last session display
- `ScheduleWidget` — 7-day cycle display, current day highlight
- `ExerciseDetailModal` — GIF display, notes text
- `ProgressionBadge` — weight increase suggestion display
- `PRCelebration` — animation trigger on PR

Schedule components:
- `ScheduleDayEditor` — modal open/close, workout selection, save/cancel

Calendar components:
- `CalendarGrid` — month rendering, day navigation, workout indicators
- `CalendarDayCell` — filled/empty states, click handler
- `SelectedDayPanel` — session details display

Onboarding components:
- `OnboardingWizard` — step navigation (1→2→3), split selection, schedule setup, completion
- `OnboardingDayRow` — day dropdown, workout assignment

Profile components:
- `AvatarUpload` — file input trigger, compression, preview, gallery selection

Auth components:
- `PasswordStrengthIndicator` — strength levels (weak/medium/strong), visual bar
- `VerificationBanner` — verified/unverified states

**Page-level integration tests (src/pages/):**
- `AuthPage` — sign in form, sign up form, tab switching, validation errors, remember me, password reset link, Google OAuth button
- `HomePage` — greeting text (time-based), avatar, schedule widget, quick stats (streak, weekly, total), quick-select sections (weights/cardio/mobility), recent activity, active session banner
- `WorkoutPage` — exercise list rendering, section grouping, start/complete workout flow, weight entry, set completion, rest timer integration
- `CardioWorkoutPage` — template selection, mode toggle (time/distance), slider input, timer start/pause, quick log, complete flow
- `MobilityWorkoutPage` — template display, session logging
- `HistoryPage` — calendar rendering, month navigation, day selection, session list, stats display
- `SessionDetailPage` — weights session breakdown (exercises, sets, weights)
- `CardioSessionDetailPage` — duration, distance, template info
- `ProfilePage` — display name edit, gender select, avatar change, theme toggle, split change (with confirmation), cycle date, password change, email change, account deletion (requires "DELETE" typed), sign out
- `SchedulePage` — 7-day grid, add/edit/remove workouts per day, rest day toggle
- `RestDayPage` — activity list, completion tracking, benefit display

---

### PHASE 3: WORKFLOW & INTEGRATION TESTS

Write integration tests that simulate full user journeys:

1. **Onboarding flow**: New user → select PPL → set up 7-day schedule → land on home
2. **Onboarding flow (Upper/Lower)**: New user → select UL → set up schedule → land on home
3. **Weights workout lifecycle**: Navigate to workout → start session → enter weights → complete sets → use rest timer → complete workout → verify in history
4. **Cardio workout lifecycle**: Select Run template → enter duration → log → verify in history
5. **Cardio with timer**: Select Cycle template → start timer → pause → resume → complete → verify
6. **Mobility workout lifecycle**: Select Core Stability → complete → verify in history
7. **Rest day flow**: Navigate to rest day → mark activities complete → verify counter updates
8. **Schedule management**: Edit day 1 → add workout → save → verify widget updates → change to rest day → verify
9. **Split switching**: Change from PPL to Upper/Lower → confirm modal → verify schedule clears → verify new templates available
10. **Profile updates**: Change display name → change avatar (upload mock) → change gender → verify persistence
11. **Theme switching**: Toggle light → dark → system → verify CSS variables change
12. **Weight unit toggle**: Set to kg → enter weight → toggle to lbs → verify conversion
13. **History browsing**: View calendar → navigate months → click date → view session detail → go back
14. **Active session persistence**: Start workout → navigate away → return → verify session resumes → dismiss active session banner
15. **PR detection**: Log a weight higher than previous max → verify PR celebration fires
16. **Progression suggestions**: Complete a workout → start same workout again → verify suggestion badge shows
17. **Password reset flow**: Click forgot password → enter email → verify reset email triggered
18. **Account deletion flow**: Navigate to profile → expand security → click delete → type "DELETE" → verify cascade

---

### PHASE 4: EDGE CASES & ERROR HANDLING

Write tests for these edge cases:

1. **Empty states**: No workouts logged, no schedule set, no profile data, empty history
2. **Network errors**: Supabase calls fail → verify error toasts appear, UI doesn't crash
3. **Auth expiration**: Session token expired → verify redirect to login
4. **Invalid routes**: Navigate to `/nonexistent` → verify redirect to home
5. **Double-submit**: Click "Complete Workout" rapidly → verify only one session saved
6. **Concurrent sessions**: Try starting a second workout while one is active → verify handling
7. **Large data**: 100+ workout sessions in history → verify calendar still renders
8. **Weight input validation**: Negative numbers, zero, extremely large values, non-numeric input
9. **Long display names**: 200+ character name → verify truncation or handling
10. **Avatar upload edge cases**: Oversized image (10MB+) → verify compression works. Non-image file → verify rejection
11. **Rest timer at zero**: Timer reaches 0 → verify it stops, doesn't go negative
12. **Cycle day calculation**: Verify correct day calculation across date boundaries, timezone changes
13. **Schedule with all rest days**: Set every day to rest → verify home dashboard handles it
14. **Browser back/forward**: Navigate through pages → verify state consistency
15. **Missing Supabase env vars**: Verify graceful error (not a white screen crash)
16. **Rapid timer pause/resume**: Pause and resume timer 10 times in quick succession → verify no duplicate intervals and correct elapsed time
17. **Quick weight unit toggling**: Toggle lbs/kg 5 times rapidly → verify final state is consistent and no API errors
18. **Mutation error rollback**: Mock a failed logSet mutation → verify UI rolls back optimistic update

---

### PHASE 5: RUNTIME TESTING

1. Start the dev server: `npm run dev &`
2. Wait for it to be ready, then use `curl` to verify:
   - `curl -s http://localhost:5173` returns HTML with the React root div
   - `curl -s http://localhost:5173/assets/` returns compiled JS (check for 200 status)
   - No console errors in the build output
3. Run a production build and preview:
   - `npm run build` — verify zero errors
   - `npx vite preview &` — verify it serves on the preview port
   - `curl` the preview server to confirm it returns the app
4. Kill all background servers when done.

---

### PHASE 6: BUILD & PRODUCTION VERIFICATION

1. Run `npm run build` — must succeed with zero errors and zero warnings.
2. Run `npx vitest run --coverage` — generate coverage report. Note any files below 70% coverage and write additional tests to bring them up.
3. Run `npm run lint` — must pass with zero warnings.
4. Verify all your bug fixes didn't break any existing tests: `npx vitest run --reporter=verbose`

---

### PHASE 7: FINAL REPORT

Create a file called `TEST_REPORT.md` in the project root with:

1. **Executive Summary**: One paragraph — how many bugs found, how many fixed, test coverage before/after.

2. **Bugs Found & Fixed**: For EACH bug, include:
   - Severity: Critical / High / Medium / Low
   - File and line number
   - Description: What the bug was
   - Impact: What users would experience
   - Fix: What you changed (1-2 sentences)
   - Verified: How you confirmed it's fixed

3. **Bugs Found & NOT Fixed**: If any bugs couldn't be fixed (e.g., requires backend changes), list them with:
   - Severity
   - File and line number
   - Description
   - Why it couldn't be fixed
   - Recommended fix for the developer

4. **Test Results**:
   - Total tests: X passing, X failing
   - Coverage: Line %, Branch %, Function %, Statement %
   - Coverage before your changes vs. after

5. **Test Breakdown by Area**:
   - Services: X tests
   - Stores: X tests
   - Hooks: X tests
   - Components: X tests
   - Pages: X tests
   - Workflows: X tests
   - Edge cases: X tests

6. **Build & Lint Status**: Clean build? Clean lint? What was fixed?

7. **Top 10 Recommendations**: Prioritized list of remaining improvements for app stability, ranked by impact. Include estimated effort (quick fix / moderate / significant).

8. **Files Changed**: List every file you modified with a one-line description of the change.

Do NOT skip any phase. Do NOT ask for input. Work through every item systematically. If you encounter an issue you can't resolve, document it in the report and move on. Keep going until everything is done.
