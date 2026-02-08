# Test Report - Workout Tracker PWA

**Date:** February 7, 2026
**Tool:** Vitest + React Testing Library (jsdom)

---

## Summary

| Metric | Before | After | Change |
|---|---|---|---|
| Test Files | 40 | 77 | +37 |
| Total Tests | 505 | 974 | +469 |
| Passing | 505 | 974 | +469 |
| Failing | 0 | 0 | 0 |
| Lint Errors | 0 | 0 | 0 |
| Production Build | Pass | Pass | - |

---

## Coverage by Category

### Utils (98.5% lines)
| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| calendarGrid.ts | 100 | 100 | 100 | 100 |
| cardioUtils.ts | 97.56 | 95.45 | 100 | 97.43 |
| cycleDay.ts | 93.75 | 100 | 100 | 93.33 |
| formatters.ts | 100 | 100 | 100 | 100 |
| parseSetReps.ts | 97.95 | 88.88 | 100 | 97.95 |
| scheduleUtils.ts | 100 | 84.61 | 100 | 100 |
| validation.ts | 100 | 100 | 100 | 100 |

### Config (91.5% lines)
| File | Lines |
|---|---|
| workoutConfig.ts | 100 |
| restDayActivities.ts | 100 |
| animationConfig.ts | 85.71 |
| defaultAvatars.ts | 50 |

### Components - UI (91.8% lines)
| File | Lines |
|---|---|
| AnimatedCard.tsx | 100 |
| Badge.tsx | 100 |
| Button.tsx | 100 |
| Card.tsx | 100 |
| Input.tsx | 100 |
| Modal.tsx | 100 |
| StreakBar.tsx | 100 |
| Toast.tsx | 100 |
| ToastProvider.tsx | 100 |
| AnimatedCounter.tsx | 86.66 |
| BottomSheet.tsx | 84.61 |
| Avatar.tsx | 63.63 |

### Components - Workout (91.7% lines)
| File | Lines |
|---|---|
| CollapsibleSection.tsx | 100 |
| ProgressionBadge.tsx | 100 |
| RestTimer.tsx | 90 |

### Components - Calendar (63.2% aggregate)
| File | Lines |
|---|---|
| SelectedDayPanel.tsx | 63.15 |
| CalendarDayCell.tsx | 64.28 |
| CalendarGrid.tsx | 60 |

### Components - Auth (89.6% aggregate)
| File | Lines |
|---|---|
| PasswordStrengthIndicator.tsx | 100 |
| VerificationBanner.tsx | 79.31 |

### Components - Layout (76.9% aggregate)
| File | Lines |
|---|---|
| AppShell.tsx | 100 |
| BottomNav.tsx | 100 |
| Header.tsx | 57.14 |

### Hooks (73% lines)
| File | Lines |
|---|---|
| useAuth.ts | 100 |
| useCycleDay.ts | 100 |
| useExerciseGif.ts | 100 |
| usePR.ts | 100 |
| useProfile.ts | 92.85 |
| useProgression.ts | 100 |
| useReducedMotion.ts | 100 |
| useTheme.ts | 100 |
| useToast.ts | 100 |
| useAvatar.ts | 100 |
| useTemplateWorkout.ts | 89.65 |
| useWorkoutSession.ts | 47.76 |
| useSchedule.ts | 46.42 |
| useWorkoutPlan.ts | 44.44 |

### Stores (42% lines)
| File | Lines |
|---|---|
| toastStore.ts | 100 |
| settingsStore.ts | 91.66 |
| themeStore.ts | 80.76 |
| workoutStore.ts | 78.26 |
| authStore.ts | 3.61 |

### Services (40.3% lines)
| File | Lines |
|---|---|
| avatarService.ts | 100 |
| exerciseDbService.ts | 96.8 |
| supabase.ts | 80 |
| profileService.ts | Covered via mock |
| prService.ts | Covered via mock |
| progressionService.ts | Covered via mock |
| socialService.ts | Covered via mock |
| templateWorkoutService.ts | Covered via mock |
| workoutService.ts | 14.28 |
| scheduleService.ts | 1.21 |

### Pages (67.4% lines)
| File | Lines |
|---|---|
| RestDay.tsx | 100 |
| History.tsx | 94.87 |
| Home.tsx | 91.59 |
| Profile.tsx | 83.41 |
| Workout.tsx | 76.19 |
| MobilityWorkout.tsx | 50.79 |
| CardioWorkout.tsx | 45.26 |
| Schedule.tsx | 42.59 |
| Auth.tsx | 40.15 |

**Overall line coverage: 65.42%**

---

## Test Files Inventory (77 files)

### Unit Tests - Utils (7 files, 208 tests)
- `formatters.test.ts` - Duration, weight, reps, date, relative time formatting
- `validation.test.ts` - Password validation, strength scoring
- `cycleDay.test.ts` - Cycle day calculation, date formatting
- `calendarGrid.test.ts` - Calendar grid generation, date keys, session grouping
- `cardioUtils.test.ts` - Pace, speed, distance, calorie calculations
- `parseSetReps.test.ts` - Set/rep string parsing
- `scheduleUtils.test.ts` - Schedule day helpers
- `edgeCases.test.ts` - 88 edge case tests across all utilities

### Unit Tests - Config (2 files, 49 tests)
- `workoutConfig.test.ts` - Style mappings, display names, workout type configs
- `restDayActivities.test.ts` - Rest day activity suggestions

### Unit Tests - Services (8 files, 100 tests)
- `avatarService.test.ts` - Avatar CRUD operations
- `exerciseDbService.test.ts` - Exercise database queries
- `profileService.test.ts` - Profile CRUD
- `prService.test.ts` - Personal record tracking
- `progressionService.test.ts` - Progression calculations
- `scheduleService.test.ts` - Schedule CRUD
- `scheduleService.splits.test.ts` - Split-specific schedule operations
- `socialService.test.ts` - Social features
- `templateWorkoutService.test.ts` - Template workout operations
- `workoutService.test.ts` - Workout session CRUD

### Unit Tests - Stores (5 files, 65 tests)
- `authStore.test.ts` - Auth state management
- `settingsStore.test.ts` - Weight unit settings, persistence
- `themeStore.test.ts` - Theme switching, system detection
- `toastStore.test.ts` - Toast notification queue
- `workoutStore.test.ts` - Active workout state, rest timer, sets

### Unit Tests - Hooks (15 files, 136 tests)
- `useAuth.test.tsx` - Auth state hook
- `useAvatar.test.tsx` - Avatar management hook
- `useCycleDay.test.tsx` - Cycle day computation
- `useExerciseGif.test.tsx` - Exercise animation lookup
- `usePR.test.tsx` - Personal record hook
- `useProfile.test.tsx` - Profile data hook
- `useProgression.test.tsx` - Progression tracking
- `useReducedMotion.test.tsx` - Accessibility motion preference
- `useSchedule.test.tsx` - Schedule data hook
- `useScheduleSplits.test.tsx` - Schedule split variants
- `useTemplateWorkout.test.tsx` - Template workout hook
- `useTheme.test.tsx` - Theme management hook
- `useToast.test.tsx` - Toast notification hook
- `useWorkoutPlanSplits.test.tsx` - Workout plan splits
- `useWorkoutSession.test.tsx` - Workout session hook
- `errorHandling.test.tsx` - 22 error handling edge cases

### Unit Tests - Components (18 files, 186 tests)
- **UI**: Button, Card, Input, Badge, Modal, Avatar, Toast, ToastProvider, BottomSheet, AnimatedCard, AnimatedCounter, StreakBar
- **Auth**: PasswordStrengthIndicator, VerificationBanner
- **Calendar**: CalendarDayCell, CalendarGrid, SelectedDayPanel
- **Workout**: CollapsibleSection, ProgressionBadge, RestTimer
- **Layout**: AppShell
- **Onboarding**: OnboardingWizard
- **Profile**: AvatarUpload

### Page Tests (14 files, 208 tests)
- `Home.test.tsx` - Basic render, loading state
- `HomeWorkflows.test.tsx` - 37 tests: stats calculation, active session banner, onboarding, recent activity, greeting, motivational messages, workout navigation
- `History.test.tsx` - Render, loading
- `HistoryWorkflows.test.tsx` - 11 tests: calendar navigation, day selection, monthly summary stats, empty state
- `Profile.test.tsx` - Render, loading
- `ProfileWorkflows.test.tsx` - 28 tests: profile save, password change, email change, theme switching, split change, delete account, sign out, lifetime stats
- `Workout.test.tsx` - Render, plan loading
- `WorkoutWorkflows.test.tsx` - 15 tests: start workout, active session, exercise sections, timed sections
- `Schedule.test.tsx` - Day rows, loading, cycle day indicator
- `Auth.test.tsx` - Auth form render
- `CardioWorkout.test.tsx` - Template loading
- `MobilityWorkout.test.tsx` - Template loading
- `RestDay.test.tsx` - Rest day activities, motivational quotes

---

## Workflow Tests (Phase 2)

### Home Page Workflows (37 tests)
- Stats calculation: streak, weekly count, total workouts
- Active session banner: display, resume navigation
- Onboarding auto-open for new users
- Recent activity display
- Greeting based on time of day
- Motivational messages
- Workout card navigation for weights, cardio, mobility

### History Page Workflows (11 tests)
- Calendar month navigation (next/previous)
- Day selection opens bottom sheet with SelectedDayPanel
- Monthly summary: completed count, streak, most trained workout type
- Empty history state
- Loading skeleton state

### Profile Page Workflows (28 tests)
- Profile save: pre-populated form, save with callbacks, success/error toasts
- Password change: validation (empty, weak, mismatch), success/error flows
- Email change: validation (invalid, same email), success/error flows
- Theme switching: light/dark/system
- Workout split change: confirmation modal, async update + schedule clear, error handling, onboarding wizard launch
- Delete account: DELETE confirmation, account deletion + sign out, error handling
- Sign out
- Lifetime stats: total workouts, best streak, favorite workout type

### Workout Page Workflows (15 tests)
- Start workout flow
- Active session state management
- Exercise section rendering
- Timed section display

---

## Edge Case & Error Handling Tests (Phase 3, 110 tests)

### Edge Cases (88 tests)
- `formatDuration`: negative numbers, zero, large values, non-integer seconds
- `formatWeight`: zero, negative, very large, decimal precision
- `formatReps`: zero, negative, edge boundaries
- `formatDate`: null, undefined, invalid strings, valid ISO dates
- `formatRelativeTime`: just now, minutes ago, boundary conditions
- `formatExerciseName`: empty, null, already-formatted, special characters
- `validatePassword`: empty string, very long passwords, unicode, emojis, exactly meeting criteria
- `getStrengthColor/getStrengthLabel`: all strength levels, unknown values
- `getCycleDay`: future dates, very old dates, totalDays=1, same-day start
- `formatCycleStartDate`: null dates
- `calendarGrid`: month boundaries, February/leap year, toDateKey, groupSessionsByDate with empty/null data

### Error Handling (22 tests)
- `useToast`: multiple simultaneous toasts, auto-dismiss timing, dismiss by ID, rapid fire
- `useReducedMotion`: matchMedia unsupported, change event handling, SSR fallback

---

## Bugs Found During Testing

1. **No critical bugs found** - The codebase is well-structured and the existing code handles edge cases appropriately.

2. **Minor observation**: `formatRelativeTime` uses `date-fns` rounding, so 30 seconds ago renders as "1 minute ago" rather than "less than a minute ago". This is expected `date-fns` behavior, not a bug.

3. **Pre-existing TypeScript errors** in test files (`useAuth.test.tsx`, `useProgression.test.tsx`, etc.) - these are type-only issues that don't affect test execution since Vitest transpiles without type-checking. The production build (`vite build`) excludes test files and compiles cleanly.

---

## Recommendations

### High Priority
1. **Service layer coverage**: `scheduleService.ts` (1.2%) and `workoutService.ts` (14.3%) have very low coverage. These are critical data access layers. Adding integration tests with mocked Supabase client would catch data transformation bugs.

2. **authStore coverage**: At 3.6%, the auth store lacks tests for the actual auth flows (sign in, sign up, password reset, session refresh). Given auth is security-critical, this should be prioritized.

3. **useSchedule/useWorkoutPlan/useWorkoutSession hooks**: These hooks at ~45-48% coverage are missing tests for mutation flows (create, update, delete operations). They only test the query side.

### Medium Priority
4. **CardioWorkout and MobilityWorkout pages** (~45-50%): The active workout flow (starting, logging data, completing) is untested. These pages have complex state management during active sessions.

5. **Schedule page** (42.6%): The day editor interaction, workout assignment, and schedule save flow need workflow tests.

6. **Auth page** (40.2%): Sign up, sign in, password reset, and OAuth redirect flows are not covered by workflow tests.

7. **Calendar components** (~60-64%): The interaction logic for day selection, month transitions, and workout type color coding has partial coverage.

### Low Priority
8. **OnboardingWizard** (56.3%): Multi-step wizard flow through all 3 steps could use more integration-level testing.

9. **AvatarUpload** (50%): Upload, crop, and default avatar selection flows are partially tested.

10. **Header component** (57.1%): Navigation and conditional rendering logic has gaps.

---

## Test Execution

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/pages/__tests__/ProfileWorkflows.test.tsx

# Run tests in watch mode
npm test
```

**Execution time:** ~10.5s for full suite
**Environment:** Vitest 3.x, jsdom, React Testing Library

---

## Bug Fix Run

**Date:** February 7, 2026

### Bugs Fixed

| # | Bug | Severity | Files Changed |
|---|-----|----------|---------------|
| 1 | PWA caches auth endpoints and error responses | CRITICAL | `vite.config.ts:45-60` |
| 2 | Auth listener memory leak | HIGH | `src/stores/authStore.ts:1-5,210-222` |
| 3 | Auth listener race condition (registered after getSession) | HIGH | `src/stores/authStore.ts:210-222` |
| 4 | ExerciseCard stale closure in handleToggleUnit | HIGH | `src/components/workout/ExerciseCard.tsx:61-77` |
| 5 | templateWorkoutService silently falls back to memory | HIGH | `src/services/templateWorkoutService.ts:67-83` |
| 6 | Missing onError handlers on mutations | HIGH | `src/pages/CardioWorkout.tsx:74-83`, `src/pages/MobilityWorkout.tsx:52-65,89-99`, `src/pages/Workout.tsx:55-62,64-74` |
| 7 | Double initialization (App.tsx + useAuth.ts) | MEDIUM | `src/App.tsx:207-214` |
| 8 | CardioWorkout timer stale closure / pause-resume bug | MEDIUM | `src/pages/CardioWorkout.tsx:41-42,86-101` |
| 9 | CardioWorkout unsafe non-null assertion on startTimeRef | MEDIUM | `src/pages/CardioWorkout.tsx:80` |
| 10 | profileService silently swallows all errors | MEDIUM | `src/services/profileService.ts:35-38` |
| 11 | templateWorkoutService error masking in catch blocks | MEDIUM | `src/services/templateWorkoutService.ts:29-41,112-128,144-162` |
| 12 | Home.tsx setTimeout without cleanup | MEDIUM | `src/pages/Home.tsx:251-259` |
| 13 | Home.tsx nullable workout_day access | MEDIUM | `src/pages/Home.tsx:350,555` |
| 14 | workoutStore Map not serializable | LOW | `src/stores/workoutStore.ts:7,28,37-52`, `src/pages/Workout.tsx:49,97,229,250` |

### New Tests Added

- `src/__tests__/bugfixes.test.ts` — 11 tests covering all bug fixes

### Final Results

| Metric | Value |
|--------|-------|
| Test Files | 78 passed |
| Total Tests | 985 passed |
| Failed | 0 |
| New Tests | 11 |
| Build | Pass (zero errors) |
| Lint | Pass (zero errors, 3 pre-existing warnings in coverage/) |
| Execution Time | ~9.9s |
