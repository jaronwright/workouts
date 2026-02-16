# Debugging Ralph Loop — Workout Tracker PWA

Copy everything below the line and paste it into Claude Code:

---

```
/ralph-wiggum:ralph-loop "ultrathink
You are a focused debugging and verification team for a Workout Tracker PWA. The app was previously stabilized and should be mostly working, but it needs a fresh pair of eyes to find any lurking issues, verify all flows actually work end-to-end, and fix anything broken.

Your approach: DIAGNOSE FIRST, FIX SECOND. Never fix what you haven't understood. Never assume something works without testing it.

APP OVERVIEW:
A Progressive Web App for tracking workouts (weights, cardio, mobility) with Supabase backend, offline-first sync, social features, and weather integration.

TECH STACK:
React 19 + TypeScript + Vite 7 + TailwindCSS 4 + TanStack Query 5 + Zustand 5 + Framer Motion + Supabase + React Router 7

SUPABASE PROJECT ID: cvxzuxbgufpzvbmlxayr

BOTTOM NAV TABS: Home (/), Community (/community), Schedule (/schedule), Review/History (/history)

ALL ROUTES:
- Public: /auth, /auth/callback
- Protected: /, /community, /schedule, /history, /profile, /rest-day
- Workout: /workouts (select), /workout/:dayId, /workout/:dayId/active
- Cardio: /cardio/:templateId
- Mobility: /mobility/:category/select, /mobility/:templateId
- History: /history/:sessionId, /history/cardio/:sessionId
- Community: /community/profile/:userId, /community/session/:sessionId, /community/cardio/:sessionId

KEY DATABASE TABLES:
workout_plans, workout_days, exercise_sections, plan_exercises, workout_sessions, template_workout_sessions, exercise_sets, workout_reviews, user_profiles, user_schedules, workout_templates, user_follows, activity_reactions, activity_comments, community_notifications, personal_records, user_badges

EXERCISEDB STATUS:
Minimal integration remains — on-demand form guide only (cache-first via Supabase edge function). NO browse/search/swap features. The exercise_cache table and fetch-exercise edge function exist in Supabase. Frontend has exerciseGuideService.ts, useExerciseGuide.ts, and FormGuideSheet.tsx.

BUILD COMMAND: npx vite build (NOT tsc -b — test files have pre-existing TS errors that tsc catches but vite ignores)

TEAM STRUCTURE:

1. 'scout' — Opens the app in Chrome. Navigates every screen. Reads every console error. Checks the network tab. Documents what works and what doesn't. Takes screenshots. Does NOT fix anything.

2. 'analyst' — Reads the scout's findings and the codebase to understand root causes. Traces broken imports, dead references, type mismatches, and data flow issues. Creates a prioritized fix plan.

3. 'fixer' — Makes targeted, minimal fixes based on the analyst's plan. Tests each fix immediately. One bug, one fix, one verification. Never touches code without understanding the full impact.

4. 'tester' — After fixes are applied, does a full end-to-end regression in Chrome. Tests every critical user flow. Compares before/after. Declares pass or fail with evidence.

========================================================================
PHASE 0 — ENVIRONMENT SETUP (iteration 1)
========================================================================

scout does the following:
1. Run 'npx vite build' to verify the build compiles. If it fails, log the errors — this is Tier 0.
2. Start the dev server: 'npm run dev' in the background.
3. Open Chrome to http://localhost:5173
4. If the app doesn't load or shows auth screen, check if we can reach the Supabase project by verifying the .env.local file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set.

Write initial status to /docs/debug-session-status.md

========================================================================
PHASE 1 — FULL DIAGNOSTIC (iterations 2-6)
========================================================================

scout opens Chrome DevTools Console (clear first) and navigates EVERY screen:

SCREEN CHECKLIST — for each screen document: loads? / console errors? / visual bugs? / missing data?

1. Auth screen (/auth) — Does login UI render? Google OAuth button present?
2. Home (/) — Greeting, today's workout card, weekly strip, weather widget, stats
3. Community (/community) — Social feed loads? Following/Discover tabs?
4. Schedule (/schedule) — 7-day cycle view? Workout assignments display?
5. History (/history) — Calendar view? Past workouts listed?
6. Profile (/profile) — User data, avatar, theme toggle, settings
7. Workout Select (/workouts) — Three workout types listed (weights/cardio/mobility)?
8. Workout Detail (/workout/:dayId) — Exercise list with sections?
9. Active Workout (/workout/:dayId/active) — Logging view, set inputs, rest timer?
10. Rest Day (/rest-day) — Activity suggestions?

CRITICAL FLOW TESTS:

Flow A — WORKOUT LIFECYCLE:
Home → tap today's workout → see exercises → start workout → log a set (enter weight + reps) → see set saved → rest timer → complete workout → see in history

Flow B — CARDIO:
Workout Select → choose cardio → pick activity → log session → complete → see in history

Flow C — NAVIGATION:
Tap each bottom nav tab → each loads correctly → back navigation works

Flow D — SOCIAL:
Community tab → see feed → reactions load → tap a user profile

Flow E — SCHEDULE:
Schedule tab → see 7-day cycle → workout assignments display correctly

Flow F — REVIEW/HISTORY:
History tab → calendar loads → tap a past workout → see session detail with sets/exercises

NETWORK TAB CHECK:
- Any failed Supabase calls (red)?
- Any unexpected ExerciseDB API calls?
- Any 404s?
- Any CORS errors?

Write ALL findings to /docs/debug-diagnostic.md:
## Build Status
## Screen-by-Screen Results (pass/fail with details)
## Critical Flow Results (pass/fail with details)
## Console Errors (grouped by screen)
## Network Failures
## Visual Bugs (with screenshot paths)

Save screenshots to /screenshots/debug/

========================================================================
PHASE 2 — ANALYSIS & TRIAGE (iteration 7)
========================================================================

analyst reads /docs/debug-diagnostic.md and creates /docs/debug-fix-plan.md:

Categorize every issue:

TIER 0 — APP BREAKING: White screens, crashes, failed imports, can't navigate, auth broken, build fails
TIER 1 — CORE FLOW BROKEN: Can't log workouts, sets don't save, timer broken, history wrong, data missing
TIER 2 — FEATURE BROKEN: Social/community issues, schedule display, review flow, profile editing
TIER 3 — VISUAL/POLISH: Alignment, spacing, colors, animations, loading states, error states

For EACH bug:
| ID | Tier | Screen | Description | Root Cause | Files | Fix Strategy | Risk |

If ZERO bugs are found in Phase 1, skip to Phase 4 for proactive hardening. Document: 'No bugs found during diagnostic. Proceeding to proactive hardening.'

========================================================================
PHASE 3 — SURGICAL FIXES (iterations 8-16)
========================================================================

fixer works through bugs tier by tier (T0 first, then T1, T2, T3):

For EVERY fix:
1. Read the full context — not just the error line, but the component tree and data flow
2. Make the MINIMAL correct fix
3. If removing dead code: follow the chain — imports, routes, state, types
4. Do NOT comment out code. Delete it or fix it.
5. Do NOT add try-catch that swallows errors silently
6. Do NOT hide broken UI with CSS
7. Test in Chrome immediately after each fix
8. If the fix touches shared code, check every screen that uses it

After each fix, tester verifies:
- Fixed screen loads correctly
- Adjacent screens still work
- No new console errors
- The specific flow that was broken now passes

========================================================================
PHASE 4 — PROACTIVE HARDENING (iterations 17-20)
========================================================================

Even if no bugs were found, the team does a proactive sweep:

analyst checks for:
1. Dead imports — any import that references a deleted file
2. Unused exports — any exported function nothing imports
3. console.log statements that should be removed (not in dev-only contexts)
4. Any remaining TODO/FIXME/HACK comments in production code
5. TypeScript 'any' types hiding potential issues
6. Missing error boundaries or loading states on async screens
7. Orphaned files — components/services/hooks that nothing uses

fixer cleans up anything found. Each cleanup is one commit.

========================================================================
PHASE 5 — FULL REGRESSION (iterations 21-25)
========================================================================

tester does a COMPLETE end-to-end pass in Chrome:

NAVIGATION:
- [ ] Every bottom nav tab loads
- [ ] Back navigation works from every screen
- [ ] No dead routes or white screens
- [ ] No console errors during full navigation

HOME:
- [ ] User greeting displays
- [ ] Today's workout card shows correct workout
- [ ] Weather widget loads (or shows appropriate fallback)
- [ ] Weekly activity strip renders

WORKOUT FLOW:
- [ ] Can view workout detail with exercise sections
- [ ] Can start a workout
- [ ] Can log weight and reps
- [ ] Sets save to Supabase (verify in network tab)
- [ ] Rest timer works (start, countdown, vibrate/sound on complete)
- [ ] Can complete workout
- [ ] Completed workout appears in history

HISTORY:
- [ ] Calendar shows workout dates
- [ ] Tapping a date shows session detail
- [ ] Exercise names, sets, reps, weights display correctly

SOCIAL:
- [ ] Community feed loads
- [ ] Can switch between Following/Discover
- [ ] User profiles accessible

SCHEDULE:
- [ ] 7-day cycle displays
- [ ] Correct workouts assigned to each day

PROFILE:
- [ ] User info displays
- [ ] Theme toggle works (light ↔ dark)
- [ ] Settings accessible

CHROME DEVTOOLS:
- [ ] Console: Zero errors during full walkthrough
- [ ] Network: Zero failed requests
- [ ] Network: No unexpected API calls

Screenshot every screen → /screenshots/debug-final/

========================================================================
PHASE 6 — FINAL REPORT (iteration 26)
========================================================================

Write to /docs/debug-report.md:

## Summary
- Bugs found: X (T0: _, T1: _, T2: _, T3: _)
- Bugs fixed: X
- Proactive cleanups: X

## Screen Status (pass/fail for each)

## Critical Flow Status (pass/fail for each)

## Console & Network Status
- Console errors: 0 / X warnings
- Network failures: 0 / X

## Files Modified
(list every file changed with one-line description)

## Files Deleted
(list any orphaned files removed)

## Build Status
npx vite build: PASS / FAIL

## Remaining Issues
(anything deferred with justification)

## Verdict: STABLE / NEEDS-WORK

HARD RULES:
- Diagnostic MUST be written before ANY fix is attempted
- DO NOT comment out code as a fix — delete or fix properly
- DO NOT add error-swallowing try-catches
- DO NOT hide broken UI with CSS
- DO NOT skip testing. Every fix verified in Chrome.
- DO NOT make speculative fixes. Trace to root cause first.
- DO NOT batch fixes. One bug, one fix, one test.
- Build must pass with 'npx vite build' (NOT tsc -b)
- Every screen must have a screenshot in the final report
- If zero bugs found, the diagnostic should still document this with evidence

COMPLETION GATE:
- Zero Tier 0 bugs
- Zero Tier 1 bugs
- All critical user flows pass
- Chrome console: zero errors
- Build passes
- Debug report written
- Every screen screenshotted

When all gates pass and the report shows STABLE, output <promise>DEBUGGED</promise>" --max-iterations 26 --completion-promise "DEBUGGED"
```
