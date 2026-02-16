# ExerciseDB — Current Integration Architecture

## Date: 2026-02-15
## Status: Minimal on-demand integration with Supabase permanent cache

---

## Architecture Overview

```
User taps "View Exercise Guide"
        │
        ▼
┌─────────────────────┐
│   FormGuideSheet    │  (React component)
│   useCachedExercise │  ← Supabase query (instant, free)
│                     │
│   Cache hit? ───────┼──→ Show guide immediately
│   Cache miss? ──────┼──→ Show "View Exercise Guide" button
└─────────────────────┘
        │ (user taps button)
        ▼
┌─────────────────────┐
│ useFetchExerciseGuide│ (TanStack mutation)
│ exerciseGuideService │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ exercise_name_mapping│ ← Check if previously looked up
│ (Supabase table)     │
│                     │
│ Found + cached? ────┼──→ Return from exercise_cache
│ Found + null? ──────┼──→ Return "not found" (no API call)
│ Not found? ─────────┼──→ Call edge function
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ fetch-exercise       │  (Supabase Edge Function)
│                     │
│ 1. Check rate limits │
│ 2. Call ExerciseDB   │  ← ONLY code path to ExerciseDB
│ 3. Cache in Supabase │
│ 4. Return result     │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│   ExerciseDB API    │  (V1 OSS — free, no key required)
│   One-time fetch     │  ← Never called again for same exercise
└─────────────────────┘
```

## Key Design Decisions

1. **Frontend NEVER calls ExerciseDB directly** — all requests go through the Supabase edge function
2. **Cached data never expires** — on Hobby plan, every API call is precious
3. **Cache-first lookup** — check Supabase before edge function, check edge function before ExerciseDB
4. **Failed lookups are cached too** — `exercise_name_mapping` with `exercise_cache_id = null` prevents wasting API calls on exercises that don't exist in ExerciseDB
5. **On-demand only** — no auto-loading, no thumbnails, no browsing. User must explicitly tap "View Exercise Guide"
6. **Mutation, not query** — `useFetchExerciseGuide` is a TanStack mutation because it's triggered by user action, not auto-fetch

## Files

### Service Layer
- `src/services/exerciseGuideService.ts` — `getCachedExercise()`, `getExerciseGuide()`, `getUsageStats()`

### Hooks
- `src/hooks/useExerciseGuide.ts` — `useCachedExercise()`, `useFetchExerciseGuide()`, `useExerciseUsageStats()`

### Components
- `src/components/workout/FormGuideSheet.tsx` — On-demand exercise guide modal
- `src/pages/Profile.tsx` — `ExerciseDataSection` component showing usage stats

### Supabase
- Table: `exercise_cache` — Permanent cache of exercise data
- Table: `exercisedb_api_usage` — Daily API call tracking
- Table: `exercise_name_mapping` — Maps app exercise names to ExerciseDB names
- Function: `get_exercisedb_usage_stats()` — Returns usage stats as JSON
- Edge Function: `fetch-exercise` — Handles ExerciseDB API calls, caching, rate limiting

## Rate Limiting

The edge function enforces soft limits BEFORE calling ExerciseDB:
- **Daily**: 450 calls (of 500 hard limit) — leaves buffer for edge cases
- **Monthly**: 1,800 calls (of 2,000 hard limit) — same buffer philosophy

When limits are hit, the edge function returns a friendly message with reset time. No ExerciseDB API call is made.

## Name Matching

The edge function contains a 130+ entry name mapping table that translates app exercise names (e.g., "Barbell Back Squat") to ExerciseDB names (e.g., "barbell full squat"). It also uses:
1. Abbreviation expansion (db → dumbbell, bb → barbell)
2. Plural stripping (lunges → lunge)
3. Fuzzy scoring (exact > starts with > word overlap > contains)
4. Keyword extraction fallback (press, curl, squat...)

## Monitoring

### Settings Screen
Profile → Exercise Data section shows:
- Exercises Cached (count)
- API Calls Today (X / 500)
- This Month (X / 2,000)
- Visual progress bar
- Remaining calls

### Supabase Dashboard
- `exercisedb_api_usage` table: daily call counts
- `exercise_cache` table: cached exercises
- `exercise_name_mapping` table: all lookup attempts

## API Key Management

- ExerciseDB V1 OSS API requires no key
- If upgrading to V2 (RapidAPI), store key as Supabase Edge Function secret:
  ```
  supabase secrets set RAPIDAPI_KEY=your-key-here
  ```
- NEVER put API keys in frontend code

## Upgrade Path

| Plan | Monthly Calls | What Changes |
|------|--------------|-------------|
| Hobby (current) | 2,000 | On-demand guide only |
| Pro (~$100/mo) | 80,000 | + Browse, Search, Thumbnails |
| Ultra (~$250/mo) | 500,000 | + Full library, Swap, Alternatives |

To re-enable removed features:
1. Upgrade ExerciseDB plan
2. Re-read `/docs/exercisedb-full-learnings.md` for preserved patterns
3. Re-read `/docs/exercisedb-teardown-audit.md` for what was removed
4. Implement features with cache-first architecture (check Supabase before API)

## Attribution

"Exercise data by ExerciseDB" is displayed in:
- FormGuideSheet modal footer
- Profile → Exercise Data section
