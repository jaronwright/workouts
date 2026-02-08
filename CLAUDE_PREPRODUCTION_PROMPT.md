# Pre-Production Testing, Bug Fixing & Test Coverage Prompt

You are performing a comprehensive pre-production audit of a React 19 + TypeScript + Supabase workout tracking PWA. Your job is to find every bug, fix it, and write tests that lock in correctness — so this app is production-ready when you're done.

**IMPORTANT:** Do NOT ask for any user input. Run everything autonomously. Do NOT skip any phase. If a phase produces zero findings, note that and move on. If you find bugs, fix them IMMEDIATELY in that phase before moving on. After fixing a bug, write a regression test for it.

**Working directory:** The root of this repository.

---

## APP OVERVIEW

This is a workout tracker PWA with:
- **5 workout splits**: Push/Pull/Legs, Upper/Lower, Full Body (5 days), Bro Split (5 days), Arnold Split (3-day cycle×2)
- **6 cardio types**: Running, Cycling, Stair Stepper, Swimming, Rower, Boxing
- **6 mobility categories**: Core, Hip/Knee/Ankle, Spine, Shoulder/Elbow/Wrist, Full Body Recovery, Shoulder Prehab — each with 4 duration variants (15/30/45/60 min)
- **Multi-workout per day**: Users can schedule 2+ workouts per day with count badges and an overtraining warning at 3+
- **7-day cycle scheduling**: Not calendar-based — rotates through a 7-day cycle
- **PWA with offline support**: Service worker caches API responses (excluding auth endpoints)

### Tech Stack
- React 19, TypeScript 5.9, Vite 7, TailwindCSS 4
- Supabase (PostgreSQL + Auth + Storage), TanStack Query 5, Zustand 5
- Motion (Framer Motion), React Router 7, Lucide icons
- Vitest 4, React Testing Library, MSW

### Architecture
```
Pages → Components → Custom Hooks → TanStack Query → Services → Supabase → PostgreSQL (RLS)
                                                    ↘ Zustand (ephemeral UI state)
```

---

## PHASE 1: ENVIRONMENT SETUP & BASELINE

1. Run `npm install` to ensure all dependencies are present.
2. Run `npm run build` to verify the app compiles cleanly. If it fails, fix every build error before continuing.
3. Run `npm run lint` to check for lint errors. Fix any that are actual problems (not stylistic preferences).
4. Run `npm run test:run` to get the current test baseline. Record the number of tests, pass count, fail count, and overall coverage.
5. If any existing tests fail, fix them first. The baseline must be green before you proceed.

**Deliverable:** Record baseline stats in `TEST_REPORT.md` (create or append):
```
## Pre-Production Audit — [date]
### Baseline
- Tests: X passing, Y failing
- Build: PASS/FAIL
- Lint: X errors, Y warnings
```

---

## PHASE 2: STATIC ANALYSIS & BUG HUNTING

Go through every source file and hunt for bugs. For each file, read it carefully and look for the categories below. When you find a bug, fix it immediately and write a test for it.

### 2A: Auth & Session Management
**Files:** `src/stores/authStore.ts`, `src/hooks/useAuth.ts`, `src/pages/Auth.tsx`, `src/pages/AuthCallback.tsx`, `src/App.tsx`

Check for:
- Memory leaks: Is `onAuthStateChange` subscription cleaned up? If not, add cleanup.
- Race conditions: Does `getSession()` run before `onAuthStateChange` is registered? If so, reorder.
- Double initialization: Are auth listeners registered more than once (App.tsx + useAuth.ts)?
- Session refresh: Does the app handle expired tokens and 401 responses gracefully?
- OAuth callback: Does AuthCallback.tsx handle error states, timeouts, and edge cases?
- ProtectedRoute: Can users briefly see protected content before redirect? Is there a loading gate?
- Console statements: Remove any `console.log` or `console.error` debug statements that shouldn't be in production.

### 2B: Workout Session Lifecycle
**Files:** `src/pages/Workout.tsx`, `src/hooks/useWorkoutSession.ts`, `src/services/workoutService.ts`, `src/stores/workoutStore.ts`

Check for:
- Stale closures: Do event handlers capture stale state (especially in ExerciseCard's handleToggleUnit)?
- Session persistence: Can a user navigate away and resume their session?
- Concurrent sessions: What happens if a user has two active sessions?
- Set logging: Are exercise sets validated (no negative weights, no zero reps)?
- Session completion: Does completing a session clear all ephemeral state in workoutStore?
- Query cache: Are TanStack Query cache keys consistent? Do mutations properly invalidate related queries?
- PR detection: Does `prService` correctly detect new personal records?
- Missing onError: Do ALL TanStack Query mutations have `onError` callbacks that show toast messages?

### 2C: Cardio & Timer Logic
**Files:** `src/pages/CardioWorkout.tsx`, `src/services/templateWorkoutService.ts`

Check for:
- Timer stale closure: Does the timer interval callback read stale values of `isPaused` or `elapsedTime`? Timer state should use refs, not stale closure variables.
- Timer cleanup: Are intervals cleared on unmount, pause, and completion?
- Unsafe ref access: Is `startTimeRef.current` accessed with `!` (non-null assertion) when it could be null?
- Quick log: Does quick-logging a cardio session work without starting a full timer?
- Template service fallback: Does `templateWorkoutService` silently fall back to in-memory storage, causing data loss on refresh? If so, it should throw errors instead.
- Error handling: Are `onError` callbacks present on all mutations? Do they show user-visible error messages via toast?
- Console statements: Remove any `console.log` or `console.warn` debug statements from `templateWorkoutService.ts`.

### 2D: Mobility Workouts
**Files:** `src/pages/MobilityWorkout.tsx`, `src/pages/MobilityDurationPicker.tsx`, `src/hooks/useMobilityTemplates.ts`, `src/services/scheduleService.ts` (functions: `getMobilityTemplatesByCategory`, `getMobilityCategories`)

Check for:
- Hardcoded duration: Is anything still hardcoded to 15 minutes instead of reading `template.duration_minutes`?
- Duration picker: Does it correctly filter templates by category and navigate to `/mobility/:templateId`?
- Route params: Are route params validated? What if someone navigates to `/mobility/invalid-category/select`?
- Empty state: What happens if a category has no templates?
- Home page navigation: Does tapping a mobility category on Home navigate to `/mobility/:category/select` (duration picker) NOT directly to a template?
- Template loading: Is there proper loading/error state while fetching templates?

### 2E: Schedule & Multi-Workout Per Day
**Files:** `src/services/scheduleService.ts`, `src/hooks/useSchedule.ts`, `src/components/schedule/ScheduleDayEditor.tsx`, `src/components/workout/ScheduleWidget.tsx`, `src/pages/Schedule.tsx`, `src/hooks/useCalendarData.ts`

Check for:
- ScheduleWidget: Does it store ALL workouts per day as arrays (`Map<number, ScheduleDay[]>`)? Does it show "+ N more" for multi-workout days?
- Schedule page strip: Does the 7-day pill strip show count numbers for multi-workout days?
- CalendarDayCell: Does it show count badges (not just "+N" text) when multiple sessions OR projections exist?
- useCalendarData: Does the schedule map store arrays? Does `projectedCount` field exist on CalendarDay?
- Overtraining warning: Does ScheduleDayEditor show an amber warning when 3+ workouts are selected?
- Console cleanup: Are there any remaining `console.log` statements in `saveScheduleDayWorkouts()`? Only `console.warn` (overtraining) and `console.error` (failures) should remain.
- Delete-then-insert: Does `saveScheduleDayWorkouts()` have proper error recovery if the insert fails after the delete succeeds?

### 2F: Calendar & History
**Files:** `src/pages/History.tsx`, `src/pages/SessionDetail.tsx`, `src/pages/CardioSessionDetail.tsx`, `src/hooks/useCalendarData.ts`, `src/components/calendar/CalendarDayCell.tsx`, `src/components/calendar/CalendarGrid.tsx`, `src/components/calendar/SelectedDayPanel.tsx`

Check for:
- Multi-workout display: Does SelectedDayPanel show ALL workouts for a day (not just the first)?
- Count badge: Does CalendarDayCell show count badges for both completed sessions AND projected multi-workout days?
- Timezone boundaries: Are workouts at 11:55 PM displayed on the correct date?
- Empty states: What shows when history is completely empty? When a day has no workouts?
- Session deletion: Can users delete sessions from the detail view? Does it update the calendar?
- Month navigation: Does navigating months preserve selected state?

### 2G: Profile & Account Management
**Files:** `src/pages/Profile.tsx`, `src/services/profileService.ts`, `src/hooks/useProfile.ts`, `src/components/profile/AvatarUpload.tsx`, `src/services/avatarService.ts`

Check for:
- Error swallowing: Does `profileService` catch and silently discard errors (including network failures)? It should propagate errors.
- Account deletion: Does `deleteUserAccount()` clean up all user data?
- Avatar upload: Is image compression applied? Is there a file size limit? What happens with invalid formats?
- Split switching: When a user changes their workout split, is the old schedule cleared?
- Console cleanup: Remove debug `console.error` statements in Profile.tsx (around split/schedule updates).

### 2H: Onboarding
**Files:** `src/components/onboarding/OnboardingWizard.tsx`, `src/components/onboarding/OnboardingDayRow.tsx`

Check for:
- All 5 splits present: Does the wizard show cards for PPL, Upper/Lower, Full Body, Bro Split, Arnold Split?
- Plan IDs: Are plan IDs imported from `src/config/planConstants.ts` (not hardcoded)?
- Default schedule: Does selecting a split correctly initialize a default 7-day schedule?
- Console cleanup: Remove debug `console.error` statements.

### 2I: PWA & Service Worker
**File:** `vite.config.ts`

Check for:
- Auth endpoint caching: The Workbox urlPattern should use a negative lookahead to EXCLUDE Supabase auth endpoints (`/auth/v1/`). Currently uses `(?!auth)` — verify this is correct.
- Error response caching: `cacheableResponse.statuses` should be `[200]` only — not caching status 0 or 5xx.
- Cache sizes: Verify limits are reasonable (50 API, 100 assets).

### 2J: Cross-Cutting Concerns
Check ALL source files for:
- Missing `onError` callbacks on TanStack Query mutations — should show toast on failure.
- Missing loading states — buttons should be disabled during mutations (`isPending`/`loading` prop).
- Missing TypeScript null checks — especially on `.data` from Supabase queries.
- `useEffect` cleanup functions missing for timers, subscriptions, and intervals.
- Remaining `console.log` statements — remove ALL from production code. Keep `console.error` for actual errors only.
- Hardcoded values that should be constants or config.
- `any` types that should be properly typed.
- Unused imports.

**Deliverable:** For every bug found, record in `TEST_REPORT.md` under `### Bugs Found & Fixed` with severity, file, description, and fix.

---

## PHASE 3: RUNTIME VALIDATION

After fixing all static analysis bugs:

1. Run `npm run build` — must pass cleanly.
2. Run `npm run lint` — fix any new issues.
3. Run `npm run test:run` — all existing tests must pass.

If anything fails, fix it before proceeding.

---

## PHASE 4: COMPREHENSIVE UNIT TEST CREATION

Write tests for every gap below. Use Vitest + React Testing Library. Follow existing test patterns in the codebase. Mock Supabase via the existing patterns (vi.mock or MSW).

### Existing test files (81 files) — DO NOT duplicate. Extend where noted.

### 4A: Auth Tests (HIGH PRIORITY)
**Extend:** `src/stores/__tests__/authStore.test.ts`
- Test `signIn()` with valid and invalid credentials
- Test `signUp()` with valid input and duplicate email
- Test `signOut()` clears session and user state
- Test `resetPassword()` sends reset email
- Test `refreshSession()` updates token
- Test `initialize()` restores session from storage
- Test `onAuthStateChange` listener cleanup

**Create:** `src/pages/__tests__/AuthCallback.test.tsx`
- Test successful OAuth callback redirects to home
- Test error in callback shows error state

### 4B: Workout Session Tests (HIGH PRIORITY)
**Extend:** `src/services/__tests__/workoutService.test.ts`
- Test `startWorkoutSession()` creates session
- Test `logExerciseSet()` with valid data
- Test `logExerciseSet()` rejects invalid data (negative weight, zero reps)
- Test `completeWorkoutSession()` marks complete
- Test `deleteWorkoutSession()` removes session and sets
- Test `getActiveSession()` returns current or null
- Test `getExerciseHistory()` returns progression data

**Create:** `src/components/workout/__tests__/ExerciseCard.test.tsx`
- Test renders exercise name, sets, reps
- Test weight unit toggle (lbs ↔ kg)
- Test mark set complete/incomplete
- Test progression badge display

### 4C: Schedule & Multi-Workout Tests (HIGH PRIORITY)
**Extend:** `src/services/__tests__/scheduleService.test.ts`
- Test `saveScheduleDayWorkouts()` with 1, 2, and 3 workouts
- Test `saveScheduleDayWorkouts()` with rest day
- Test `saveScheduleDayWorkouts()` overtraining console.warn at 4+ workouts
- Test `initializeDefaultSchedule()` for each split type (PPL, Upper/Lower, Full Body, Bro, Arnold)
- Test `clearUserSchedule()` removes all entries
- Test `getMobilityTemplatesByCategory()` filters correctly
- Test `getMobilityCategories()` returns unique categories

**Create:** `src/components/schedule/__tests__/ScheduleDayEditor.test.tsx`
- Test renders current day's workouts
- Test add workout to day
- Test remove workout from day
- Test overtraining warning appears at 3+ workouts
- Test overtraining warning hidden when < 3 workouts
- Test overtraining warning not shown for rest days
- Test save calls mutation with correct data

**Create:** `src/components/workout/__tests__/ScheduleWidget.test.tsx`
- Test renders single workout with name and icon
- Test renders "+ N more" when multiple workouts exist for today
- Test handles rest days
- Test handles empty schedule

### 4D: Mobility Tests (HIGH PRIORITY)
**Create:** `src/pages/__tests__/MobilityDurationPicker.test.tsx`
- Test renders all 4 duration options (15, 30, 45, 60)
- Test clicking a duration navigates to `/mobility/:templateId`
- Test shows correct labels (Quick, Standard, Extended, Full Session)
- Test handles invalid/missing category param (shows "Not Found")
- Test loading state

**Create:** `src/hooks/__tests__/useMobilityTemplates.test.ts`
- Test `useMobilityCategories()` fetches categories
- Test `useMobilityVariants(category)` fetches templates filtered by category
- Test `useMobilityVariants('')` is disabled (enabled: !!category)

### 4E: Calendar & History Tests (MEDIUM PRIORITY)
**Create:** `src/hooks/__tests__/useCalendarData.test.ts`
- Test generates correct month grid
- Test marks days with workouts (completed sessions)
- Test handles multi-workout days (projectedCount > 1)
- Test handles empty months
- Test timezone boundary handling

**Extend:** `src/components/calendar/__tests__/CalendarDayCell.test.tsx`
- Test single session shows workout icon
- Test 2+ sessions show count badge with total number
- Test multi-projected days (day.projectedCount > 1) show count badge
- Test green completion dot shows when completed
- Test missed workout red dot for past unfinished days

**Create:** `src/pages/__tests__/SessionDetail.test.tsx`
- Test renders session with exercises and sets
- Test delete session flow
- Test loading and error states

**Create:** `src/pages/__tests__/CardioSessionDetail.test.tsx`
- Test renders cardio session with time/distance
- Test delete session flow

### 4F: Profile Tests (MEDIUM PRIORITY)
**Extend:** `src/services/__tests__/profileService.test.ts`
- Test `getProfile()` returns profile data
- Test `getProfile()` propagates network errors (not swallowed)
- Test `updateProfile()` persists changes
- Test `deleteUserAccount()` cascades cleanup
- Test `upsertProfile()` creates when missing, updates when existing

### 4G: Onboarding Tests (MEDIUM PRIORITY)
**Extend:** `src/components/onboarding/__tests__/OnboardingWizard.test.tsx`
- Test all 5 workout split cards are displayed (PPL, Upper/Lower, Full Body, Bro, Arnold)
- Test selecting a split advances to schedule step
- Test completing onboarding initializes default schedule
- Test completing onboarding navigates to home

### 4H: Timer & Cardio Tests (MEDIUM PRIORITY)
**Extend:** `src/pages/__tests__/CardioWorkout.test.tsx`
- Test timer starts counting
- Test timer pause freezes count
- Test timer resume continues from paused value
- Test quick log mode (no timer)
- Test session completion saves correct duration
- Test `onError` handler shows toast on failure

### 4I: Rest Timer Tests (MEDIUM PRIORITY)
**Extend:** `src/components/workout/__tests__/RestTimer.test.tsx`
- Test timer counts down from set value
- Test timer pause/resume
- Test timer auto-stops at zero
- Test timer reset

### 4J: PR & Progression Tests (LOW PRIORITY)
**Extend:** `src/services/__tests__/prService.test.ts`
- Test `checkAndUpdatePR()` detects new PR
- Test `checkAndUpdatePR()` ignores non-PR sets
- Test `getRecentPRs()` returns chronological PRs

**Extend:** `src/services/__tests__/progressionService.test.ts`
- Test `getProgressionSuggestion()` recommends weight increase after consistent performance
- Test handles first-time exercises (no history)

### 4K: Template Workout Service Tests (LOW PRIORITY)
**Extend:** `src/services/__tests__/templateWorkoutService.test.ts`
- Test `startTemplateWorkout()` creates session
- Test `completeTemplateWorkout()` marks complete with duration
- Test `quickLogTemplateWorkout()` creates and completes in one call
- Test error propagation (errors thrown, not caught silently)

### 4L: Home Page Tests (LOW PRIORITY)
**Extend:** `src/pages/__tests__/Home.test.tsx`
- Test shows active session resume card when session exists
- Test shows today's scheduled workouts
- Test mobility section shows 6 category cards navigating to duration picker
- Test setTimeout cleanup on unmount
- Test handles null workout_day gracefully

### 4M: Schedule Page Tests (LOW PRIORITY)
**Extend:** `src/pages/__tests__/Schedule.test.tsx`
- Test 7-day icon strip shows count number for multi-workout days
- Test single workout day shows icon in strip
- Test daily card list shows all workout chips per day
- Test tapping a day opens ScheduleDayEditor

---

## PHASE 5: INTEGRATION & WORKFLOW TESTS

Write tests that simulate complete user workflows end-to-end:

### 5A: Complete Weighted Workout Flow
**File:** `src/pages/__tests__/weightedWorkoutWorkflow.test.tsx`
1. User taps "Push Day" on home → navigates to Workout page
2. Session starts → exercises load in sections
3. User logs 3 sets of bench press (135×10, 155×8, 175×6)
4. Rest timer starts between sets (60s countdown)
5. User completes all exercises → marks workout complete
6. Session appears in History with correct data

### 5B: Mobility Workout Flow
**File:** `src/pages/__tests__/mobilityWorkoutWorkflow.test.tsx`
1. User taps mobility category on Home (e.g., "Hip Mobility")
2. Duration picker shows 4 options (15, 30, 45, 60 min)
3. User selects 30 minutes → navigates to MobilityWorkout with correct template
4. Exercises displayed match 30-minute variant
5. User completes → session logged with 30-minute duration

### 5C: Multi-Workout Day Flow
**File:** `src/pages/__tests__/multiWorkoutWorkflow.test.tsx`
1. User opens Schedule → selects Monday
2. Adds "Push Day" as first workout
3. Adds "Running" as second workout
4. Count badge shows on both schedule page strip and calendar
5. User tries to add 4th workout → overtraining warning appears
6. ScheduleWidget on Home shows "+ 1 more workout"

### 5D: Schedule Change Flow
**File:** `src/pages/__tests__/scheduleChangeWorkflow.test.tsx`
1. User goes to Profile → changes split from PPL to Full Body
2. Confirmation dialog appears → user confirms
3. Old schedule cleared → new default schedule initialized
4. Schedule page shows Full Body workouts
5. Home page shows updated today's workout

### 5E: Profile & Account Flow
**File:** `src/pages/__tests__/profileWorkflow.test.tsx`
1. User updates display name → saved successfully
2. User uploads avatar → compressed and uploaded
3. User changes weight unit to kg → all weights display in kg
4. User changes theme → UI updates immediately

---

## PHASE 6: ERROR RESILIENCE TESTS

**File:** `src/__tests__/errorResilience.test.tsx`

Test that the app handles failures gracefully:

1. **Network failure during workout save** — Toast shows error, data not lost
2. **Auth token expired mid-session** — App refreshes token or redirects to login
3. **Supabase 500 error on schedule save** — Error shown to user, schedule not corrupted
4. **Invalid route param** — `/workout/nonexistent-id` shows error state, not crash
5. **Empty database** — New user with no sessions sees proper empty states everywhere
6. **Rapid button clicks** — Double-clicking "Complete Workout" doesn't create duplicate sessions
7. **Navigation during save** — Leaving page during async operation doesn't cause errors

---

## PHASE 7: BUILD VERIFICATION & FINAL REPORT

1. Run `npm run build` — must pass cleanly with zero errors.
2. Run `npm run lint` — must pass with zero errors (warnings acceptable).
3. Run `npm run test:run` — all tests must pass.
4. Run `npm run test:coverage` — record final coverage numbers.

**Deliverable:** Update `TEST_REPORT.md` with the final report:

```
### Final Results
- Tests: X passing, 0 failing (up from Y at baseline)
- Coverage: XX.XX%
- Build: PASS
- Lint: PASS
- Bugs found and fixed: N

### Bugs Fixed Summary
| # | Severity | File | Description | Fix |
|---|----------|------|-------------|-----|
| 1 | CRITICAL | file.ts | description | what was fixed |

### New Tests Added
| Category | Tests Added | Files |
|----------|-------------|-------|
| Auth | N | files |
| Workout Session | N | files |
| Schedule & Multi-Workout | N | files |
| Mobility & Duration Picker | N | files |
| Calendar & History | N | files |
| Profile | N | files |
| Onboarding | N | files |
| Timer/Cardio | N | files |
| Workflow/E2E | N | files |
| Error Resilience | N | files |
| TOTAL | N | |

### Coverage by Category
| Category | Lines | Branches | Functions |
|----------|-------|----------|-----------|
| Pages | XX% | XX% | XX% |
| Components | XX% | XX% | XX% |
| Hooks | XX% | XX% | XX% |
| Services | XX% | XX% | XX% |
| Stores | XX% | XX% | XX% |
| Utils | XX% | XX% | XX% |
| Config | XX% | XX% | XX% |
| OVERALL | XX% | XX% | XX% |
```

---

## CURRENT FILE INVENTORY

### Pages (15)
```
src/pages/Auth.tsx                    — Login/signup/forgot/reset
src/pages/AuthCallback.tsx            — OAuth redirect handler
src/pages/Home.tsx                    — Dashboard with stats, quick select, recent activity
src/pages/Workout.tsx                 — Strength workout execution
src/pages/CardioWorkout.tsx           — Cardio logging with timer
src/pages/MobilityWorkout.tsx         — Mobility exercise checklist
src/pages/MobilityDurationPicker.tsx  — Duration selector (15/30/45/60 min)
src/pages/History.tsx                 — Calendar view with session history
src/pages/SessionDetail.tsx           — Weights session detail
src/pages/CardioSessionDetail.tsx     — Cardio session detail
src/pages/Profile.tsx                 — Settings, split selection, account
src/pages/Schedule.tsx                — 7-day schedule editor
src/pages/RestDay.tsx                 — Recovery activity suggestions
src/pages/Community.tsx               — Social activity feed
src/pages/WorkoutSelect.tsx           — Workout type selection
```

### Routes (src/App.tsx)
```
/auth                         — PublicRoute → AuthPage
/auth/callback                — AuthCallbackPage
/                             — ProtectedRoute → HomePage
/community                    — ProtectedRoute → CommunityPage
/workout/:dayId               — ProtectedRoute → WorkoutPage
/workout/:dayId/active        — ProtectedRoute → WorkoutPage
/cardio/:templateId           — ProtectedRoute → CardioWorkoutPage
/mobility/:category/select    — ProtectedRoute → MobilityDurationPickerPage
/mobility/:templateId         — ProtectedRoute → MobilityWorkoutPage
/history                      — ProtectedRoute → HistoryPage
/history/:sessionId           — ProtectedRoute → SessionDetailPage
/history/cardio/:sessionId    — ProtectedRoute → CardioSessionDetailPage
/profile                      — ProtectedRoute → ProfilePage
/schedule                     — ProtectedRoute → SchedulePage
/rest-day                     — ProtectedRoute → RestDayPage
*                             — Redirect to /
```

### Services (9)
```
supabase.ts, workoutService.ts, profileService.ts, scheduleService.ts,
templateWorkoutService.ts, prService.ts, progressionService.ts,
exerciseDbService.ts, avatarService.ts, socialService.ts
```

### Stores (5)
```
authStore.ts, workoutStore.ts, themeStore.ts, toastStore.ts, settingsStore.ts
```

### Hooks (18)
```
useAuth, useProfile, useWorkoutSession, useTemplateWorkout, useSchedule,
useWorkoutPlan, useCycleDay, usePR, useProgression, useExerciseGif,
useAvatar, useTheme, useToast, useReducedMotion, useMobilityTemplates,
useSocial, useCalendarData
```

### Config (6)
```
workoutConfig.ts     — WEIGHTS_CONFIG, CARDIO_CONFIG, MOBILITY_CONFIG (6 categories), display names
planConstants.ts     — 6 plan IDs (PPL, Upper/Lower, Mobility, Full Body, Bro, Arnold) + SPLIT_NAMES
animationConfig.ts   — Spring configs, page/stagger transitions
restDayActivities.ts — 8 recovery activities
defaultAvatars.ts    — 7 default avatar SVGs
```

### Existing Test Files (81)
```
Pages:      Auth, CardioWorkout, History, HistoryWorkflows, Home, HomeWorkflows,
            MobilityWorkout, Profile, ProfileWorkflows, RestDay, Schedule,
            Workout, WorkoutWorkflows
Components: PasswordStrengthIndicator, VerificationBanner, CalendarDayCell,
            CalendarGrid, SelectedDayPanel, AppShell, OnboardingWizard,
            AvatarUpload, AnimatedCard, AnimatedCounter, Avatar, Badge,
            BottomSheet, Button, Card, Input, Modal, StreakBar, Toast,
            ToastProvider, CollapsibleSection, ProgressionBadge, RestTimer
Hooks:      errorHandling, useAuth, useAvatar, useCycleDay, useExerciseGif,
            usePR, useProfile, useProgression, useReducedMotion, useSchedule,
            useScheduleSplits, useTemplateWorkout, useTheme, useToast,
            useWorkoutPlanSplits, useWorkoutSession
Services:   avatarService, exerciseDbService, prService, profileService,
            progressionService, scheduleService (3 files), socialService,
            templateWorkoutService, workoutService
Stores:     authStore, settingsStore, themeStore, toastStore, workoutStore
Utils:      calendarGrid, cardioUtils, cycleDay, edgeCases, formatters,
            parseSetReps, scheduleUtils, validation
Other:      bugfixes, newSplitsConfig, planConstants, workoutConfig
```

### Database Migrations (17)
```
20240201000000_initial_schema.sql
20240201000001_seed_data.sql
20240202000000_add_user_profiles.sql
20240203000000_unified_schema.sql
20240204000000_add_exercise_weight_unit.sql
20240205000000_delete_user_function.sql
20240205000001_multiple_workouts_per_day.sql
20240206000000_title_case_workout_names.sql
20240208000000_add_rower.sql
20240209000000_add_avatar_storage.sql
20240210000000_add_workout_splits.sql
20240211000000_cycle_start_date.sql
20240212000000_mobility_exercises.sql
20240213000000_add_boxing.sql
20240214000000_add_new_splits.sql
20240215000000_expand_mobility.sql
```

---

## RULES

1. **Fix bugs immediately when found.** Don't just report them — fix them and write a regression test.
2. **Don't break existing tests.** If your fix changes behavior that existing tests rely on, update those tests.
3. **Follow existing code patterns.** Match style, naming conventions, and test patterns already in the codebase.
4. **Every mutation needs an `onError` handler.** If you find one missing, add it with a `toast.error()` call.
5. **No `console.log` in production code.** Remove any you find. Use `console.error` only for actual errors.
6. **No `any` types.** If you find them, add proper types.
7. **Test edge cases, not just happy paths.** Every test file should have at least one error/edge case test.
8. **Run the full test suite after every phase.** Don't let failures accumulate.
9. **Target 80%+ overall coverage.** Prioritize critical paths (auth, workout sessions, schedule, mobility) for 90%+.
10. **Do NOT ask for user input.** Work through everything autonomously.
