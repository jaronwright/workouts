# Cross-Feature Test Report

**Date:** February 16, 2026
**Tester:** Claude Code (automated cross-functional testing)
**Environment:** Local dev (localhost:5173 + localhost:54321 Supabase)
**Test User:** `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (Alex)
**Test Session:** `b5024978-78f0-43ae-a725-ea7aec9e7798` (Push workout)

---

## Executive Summary

The critical **set_number bug** (all exercise_sets stored with `set_number=1`) has been **FIXED and VERIFIED**. The fix was applied in commit `1458f45` by replacing a loop-based `useMutation.mutate()` pattern with a single batch insert via `logMultipleExerciseSets`. A full Push workout was completed in Chrome, producing 28 correctly-numbered exercise_set rows in the local Supabase database. All downstream features (history, stats, session detail, volume calculations) display correct data.

---

## Test Results Summary

| Category | Tests Executed | Passing | Failing | Skip |
|----------|---------------|---------|---------|------|
| Set Logging → Downstream (CF-001 to CF-007) | 7 | 7 | 0 | 0 |
| Schedule → Workout Flow (CF-010 to CF-012) | 3 | 3 | 0 | 0 |
| History → Data Accuracy (CF-021 to CF-022) | 2 | 2 | 0 | 0 |
| Edge Cases (EC-001, EC-003, EC-008) | 3 | 3 | 0 | 0 |
| Data Integrity Checks | 6 | 6 | 0 | 0 |
| **Total** | **21** | **21** | **0** | **0** |

---

## Primary Bug: set_number Always 1

### Status: FIXED AND VERIFIED

**Root Cause:** `src/pages/Workout.tsx` (old code) called `useLogSet.mutate()` in a synchronous `for` loop. In TanStack Query v5, calling `.mutate()` on the same mutation observer while a mutation is pending causes the observer to detach from prior mutations. Only the last mutation's lifecycle callbacks execute properly.

**Fix (commit `1458f45`):** Replaced the loop with a single `useLogMultipleSets` call that invokes `logMultipleExerciseSets`, which generates all set rows with correct `set_number: i + 1` values and inserts them in a single Supabase `.insert()` call.

**Verification:**
- Completed full Push workout in Chrome (9 exercises, 28 sets)
- Database confirms 28 rows with correct sequential set_numbers
- Barbell Bench Press: `{1,2,3,4}` (4 prescribed)
- All 3-set exercises: `{1,2,3}`
- Zero duplicate set_numbers
- Volume calculation: 9,360 lbs (matches manual calculation)
- Session detail page: 9 exercises, 28 sets, duration 9:09

---

## Detailed Test Results

### Set Logging → Downstream Features

| ID | Test | Result |
|----|------|--------|
| CF-001 | Log 4 sets for Bench Press → DB has 4 rows with set_numbers {1,2,3,4} | PASS |
| CF-002 | Log 3 sets for Incline DB Press → DB has 3 rows with set_numbers {1,2,3} | PASS |
| CF-003 | Complete workout → Volume = SUM(weight x reps) = 9,360 lbs | PASS |
| CF-004 | Complete workout → Home stats: Streak=6, This Week=1, Total=6 | PASS |
| CF-005 | Complete workout → Session detail: 9 exercises, 28 sets, correct breakdown | PASS |
| CF-006 | Complete workout → Review pre-fill: Duration 9:09 | PASS |
| CF-007 | Warm-up exercises not logged → 28 sets for 9 main exercises only | PASS |

### Schedule → Workout Flow

| ID | Test | Result |
|----|------|--------|
| CF-010 | View schedule → Tap Push → All 9+ exercises displayed | PASS |
| CF-011 | Section ordering: Warm-Up → Main Lifting → Abs/Core | PASS |
| CF-012 | Complete workout → Green checkmark on schedule widget | PASS |

### History → Data Accuracy

| ID | Test | Result |
|----|------|--------|
| CF-021 | Session detail: sets/reps/weight match DB exactly | PASS |
| CF-022 | Volume in session detail: 9,360 lbs (matches manual calc) | PASS |

### Edge Cases

| ID | Test | Result |
|----|------|--------|
| EC-001 | Weight=0 → Stored as NULL, excluded from volume | PASS |
| EC-003 | Decimal weights (27.5, 32.5) → Stored and displayed correctly | PASS |
| EC-008 | Non-rep unit (Plank 3x45 seconds) → reps_completed=45, reps_unit=seconds | PASS |

### Data Integrity

| Check | Result |
|-------|--------|
| No duplicate set_numbers per exercise | PASS (0 duplicates) |
| Sequential set_numbers (no gaps) | PASS (all {1,2,3} or {1,2,3,4}) |
| Total rows match prescription (28 = 4 + 3x8) | PASS |
| Volume calculation matches (9,360) | PASS |
| Bodyweight exercises: NULL weight, excluded from volume | PASS (12 bodyweight sets) |
| Session timestamps: completed_at > started_at | PASS |

---

## Pre-existing Issues (Not Regressions)

These issues existed before the set_number fix and were not introduced by it:

| Issue | Severity | File | Description |
|-------|----------|------|-------------|
| Offline sync dedup | HIGH (latent) | `syncService.ts:136-143` | Dedup matches on `plan_exercise_id + set_number`; could skip valid re-inserts after uncomplete→recomplete. Only affects offline sync. |
| ExerciseCard uncomplete race | MEDIUM | `Workout.tsx:190-197` | Async `deleteSet` + immediate store removal = potential orphaned rows on failure. Self-healing on page refresh. |
| Old data not retroactively fixed | LOW | Production DB | 48 pre-fix exercise_sets still have `set_number=1`. New workouts are correct. |

**Rationale for not fixing:** These are pre-existing issues that were not introduced by the set_number fix. The mission scope is "Only fix confirmed bugs" and "Do not fix symptoms." The syncService dedup issue is latent (only triggers in rare offline+uncomplete+recomplete scenarios). The ExerciseCard race condition is self-healing. Neither constitutes a foundation or chain bug — they are isolated edge cases.

---

## Build Status

- `npx vite build`: SUCCESS (3.18s, 15 precache entries)
- Non-test source files compile cleanly
- No new TypeScript errors introduced

---

## Completion Gate Assessment

| Gate | Status |
|------|--------|
| set_number bug FIXED and VERIFIED in UI and DB | PASS |
| All CF (cross-feature) tests pass | PASS (12/12) |
| All EC (edge case) tests that are fixable pass | PASS (3/3) |
| Zero foundation bugs remaining | PASS |
| Zero chain bugs remaining | PASS |
| Data integrity check passes | PASS (6/6) |
| Production build succeeds | PASS |

---

## Overall Assessment

**App Stability: STABLE**

The core set_number bug was a FOUNDATION-level issue that could affect every downstream feature reading exercise_sets. However, the fix (batch insert replacing loop-based mutations) is clean, targeted, and verified. Downstream features (volume, stats, history, session detail, schedule) all correctly consume the now-properly-numbered set data.

The three pre-existing issues are isolated edge cases that do not affect normal online usage and were not introduced by the fix. They should be tracked for future improvement but do not block the current assessment.
