# ExerciseDB Teardown Report

## Date: 2026-02-15
## Reason: Hobby plan hard cap (2,000 calls/month) burned through in days

---

## Summary

Rolled back the over-built ExerciseDB integration and rebuilt it as a minimal, on-demand system with permanent Supabase caching. The frontend no longer calls ExerciseDB directly — all requests go through a Supabase edge function that caches results permanently.

## What Was Removed

### Pages Deleted (2)
- `src/pages/ExerciseLibrary.tsx` — Full browse/search page (415 lines)
- `src/pages/ExerciseDetail.tsx` — Exercise detail page (363 lines)

### Components Deleted (2)
- `src/components/workout/ExerciseSwapSheet.tsx` — Swap alternatives bottom sheet (171 lines)
- `src/components/workout/ExerciseDetailModal.tsx` — Exercise detail modal (181 lines)

### Hooks Deleted (2)
- `src/hooks/useExerciseLibrary.ts` — 7 hooks for browse/search/filter (133 lines)
- `src/hooks/useExerciseGif.ts` — Direct ExerciseDB lookup hook (30 lines)

### Services Deleted (1)
- `src/services/exerciseDbService.ts` — Full ExerciseDB API client (832 lines)

### Test Files Deleted (4)
- `src/services/__tests__/exerciseDbService.test.ts`
- `src/hooks/__tests__/useExerciseGif.test.tsx`
- `src/hooks/__tests__/useExerciseLibrary.test.tsx`
- `src/components/workout/__tests__/ExerciseDetailModal.test.tsx`

### Features Removed
- **Exercises tab** in bottom navigation
- **Explore Exercises** section on Home screen (body part category cards)
- **Browse All** link to exercise library
- **Exercise swap** buttons (⇄ arrows) in workout view
- **Inline GIF thumbnails** next to exercise names in workout lists
- **Auto-loading** exercise data on modal open
- `/exercises` and `/exercises/:exerciseId` routes
- Direct ExerciseDB API calls from frontend code
- `VITE_RAPIDAPI_KEY` frontend environment variable usage

## What Was Modified

### Routes (1 file)
- `src/App.tsx` — Removed exercise page imports and routes

### Navigation (1 file)
- `src/components/layout/BottomNav.tsx` — Removed Exercises tab, removed Dumbbell icon import

### Home Screen (1 file)
- `src/pages/Home.tsx` — Removed Explore Exercises section, useBodyPartList import, Target icon

### Workout View (2 files)
- `src/components/workout/ExerciseCard.tsx` — Removed GIF thumbnail, swap button, ExerciseSwapSheet, useExerciseInfo; added Dumbbell icon placeholder; removed onSwapExercise prop
- `src/pages/Workout.tsx` — Removed swapPlanExerciseName import, handleSwapExercise, onSwapExercise props, useQueryClient

### Barrel Exports (2 files)
- `src/pages/index.ts` — Removed ExerciseDetailPage, ExerciseLibraryPage exports
- `src/components/workout/index.ts` — Removed ExerciseDetailModal, ExerciseSwapSheet exports

### Services (1 file)
- `src/services/workoutService.ts` — Removed swapPlanExerciseName function

### Tests (1 file)
- `src/components/workout/__tests__/ExerciseCard.test.tsx` — Removed useExerciseGif mock

## What Was Rebuilt

### New Service
- `src/services/exerciseGuideService.ts` — Cache-first Supabase lookups + edge function fallback

### New Hook
- `src/hooks/useExerciseGuide.ts` — useCachedExercise, useFetchExerciseGuide, useExerciseUsageStats

### Rebuilt Component
- `src/components/workout/FormGuideSheet.tsx` — On-demand exercise guide with cache-first pattern

### New UI Section
- `src/pages/Profile.tsx` — ExerciseDataSection component showing API usage stats

## Supabase Changes

### Tables Created (3)
1. `exercise_cache` — Permanent cache of exercise data (RLS: read-only for authenticated)
2. `exercisedb_api_usage` — Daily API call tracking (RLS: read-only for authenticated)
3. `exercise_name_mapping` — App name → ExerciseDB name mappings (RLS: read-only for authenticated)

### Functions Created (1)
- `get_exercisedb_usage_stats()` — Returns daily/monthly usage stats as JSON

### Edge Functions Deployed (1)
- `fetch-exercise` — Handles ExerciseDB API calls, caching, rate limiting, name matching

### Migrations Applied (2)
1. `create_exercise_cache_tables` — Tables, indexes, RLS policies, usage stats function
2. `fix_usage_stats_search_path` — Security fix for function search_path

## API Call Savings

| Metric | Before | After |
|--------|--------|-------|
| Calls on page load | 3-10 (category lists, thumbnails) | 0 |
| Calls per workout view | 8+ (one per exercise thumbnail) | 0 |
| Calls per exercise browse | 1-3 per page | N/A (feature removed) |
| Calls per exercise swap | 2 per attempt | N/A (feature removed) |
| Calls per guide view | 1 | 1 (first time only, then 0) |
| Monthly est. (1 user) | 1,000+ | 30-50 trending to 0 |

## Known Issues
- Pre-existing test failures in unrelated files (useProfile, useSocial, scheduleService, HomeWorkflows) — not caused by this refactor
- Pre-existing security warnings on old functions (search_path) — not related to new tables
- ExerciseDB V1 OSS API has no rate limit headers, so we can't detect actual limits from response

## Documentation
- `/docs/exercisedb-full-learnings.md` — Complete API documentation and patterns preserved
- `/docs/exercisedb-teardown-audit.md` — Full touchpoint inventory before removal
- `/docs/exercisedb-current-integration.md` — New architecture documentation
