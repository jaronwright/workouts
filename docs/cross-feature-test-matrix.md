# Cross-Feature Test Matrix

## Test Environment
- Local dev server: http://localhost:5173
- Local Supabase: http://localhost:54321
- Test user: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (Alex)
- Test session: `b5024978-78f0-43ae-a725-ea7aec9e7798` (Push workout, Feb 16, 2026)
- Browser: Chrome via Claude-in-Chrome MCP

---

## SET LOGGING → Downstream Features

| Test ID | Feature A | Feature B | Test Scenario | Expected | Actual | Status |
|---------|-----------|-----------|---------------|----------|--------|--------|
| CF-001 | Set Logging | Database | Log 4 sets for Barbell Bench Press (4×6-8) | 4 rows, set_numbers 1,2,3,4 | 4 rows: {1,2,3,4} at 185 lbs, 6 reps each | ✅ PASS |
| CF-002 | Set Logging | Database | Log 3 sets for Incline DB Press (3×8-10) | 3 rows, set_numbers 1,2,3 | 3 rows: {1,2,3} at 70 lbs, 8 reps each | ✅ PASS |
| CF-003 | Set Logging | Volume | Complete workout with all sets logged → Check volume | SUM(weight×reps) across ALL sets | 9,360 lbs (manual calc matches DB) | ✅ PASS |
| CF-004 | Set Logging | Home Stats | Complete workout → Home screen stats | This Week=1, Total=6, Streak=6 | Streak=6, This Week=1, Total=6 | ✅ PASS |
| CF-005 | Set Logging | Session Detail | Complete workout → View session detail | 9 exercises, 28 sets, correct per-exercise breakdown | 9 exercises, 28 sets, all correct | ✅ PASS |
| CF-006 | Set Logging | Review | Complete workout → Review pre-fill | Duration calculated from timestamps | Duration: 9:09 shown correctly | ✅ PASS |
| CF-007 | Set Logging | Partial Complete | Warm-up exercises not logged → Complete workout | Only logged exercises have exercise_sets, workout still completes | Warm-up had no sets; 28 sets for 9 main exercises | ✅ PASS |

## Edge Cases

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| EC-001 | Weight = 0 (Overhead DB Extension) | Stored as NULL, excluded from volume | weight_used=NULL, 0 volume contribution | ✅ PASS |
| EC-003 | Decimal weight (Cable Fly 27.5, Rope Ext 32.5) | Stored correctly as numeric | 27.50 and 32.50 in DB, displayed as "27.5 lbs" and "32.5 lbs" | ✅ PASS |
| EC-008 | Non-rep unit (Plank 3×45 seconds) | reps_completed=45, reps_unit=seconds | 3 rows with reps_completed=45, displayed as "45 seconds" | ✅ PASS |

## Data Integrity

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| No duplicate set_numbers per exercise | 0 duplicates | 0 rows returned | ✅ PASS |
| Sequential set_numbers (no gaps) | All {1,2,3} or {1,2,3,4} | Verified for all 9 exercises | ✅ PASS |
| Total rows match prescription | 28 (4+3×8) | 28 rows | ✅ PASS |
| Volume calculation | 9,360 | 9,360.00 | ✅ PASS |
| Bodyweight exercise handling | NULL weight, excluded from volume | 12 bodyweight sets, all NULL weight | ✅ PASS |
| Session timestamps | completed_at > started_at | 22:25:57 → 22:35:06 | ✅ PASS |

## Schedule → Workout Flow

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| CF-010 | View schedule → Tap Push workout | Exercise list matches plan_exercises | All 9+ exercises displayed correctly | ✅ PASS |
| CF-011 | Section ordering | Warm-Up before Main Lifting before Abs/Core | Sections in correct sort_order | ✅ PASS |
| CF-012 | Complete workout → Schedule reflects completion | Checkmark on today's day | Green checkmark on "Push" in schedule widget | ✅ PASS |

## History → Data Accuracy

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| CF-021 | View session detail | Sets/reps/weight match DB | All 9 exercises display correctly: set counts, reps, weights | ✅ PASS |
| CF-022 | Volume in session detail | Match manual calculation | 9,360 lbs (derived from 28 rows × per-row weight×reps) | ✅ PASS |

## Known Pre-existing Issues (Not Regressions)

| Issue | Description | Severity | Status |
|-------|-------------|----------|--------|
| syncService dedup | Matches on plan_exercise_id + set_number; could skip valid re-inserts after uncomplete→recomplete | HIGH (latent) | Pre-existing |
| ExerciseCard uncomplete race | Async deleteSet + immediate store removal = potential orphaned rows on failure | MEDIUM | Pre-existing |
| Old data set_number=1 | 48 production rows from before fix still have wrong set_numbers | LOW | Data migration needed |
