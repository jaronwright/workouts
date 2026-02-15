# ExerciseDB Integration Architecture

## API Strategy

**Dual-source with automatic fallback:**

| Layer | API | Auth | Use Case |
|-------|-----|------|----------|
| Primary Browse/Search | V1 OSS | None | Body part, muscle, equipment browse; search; exercise detail |
| GIF Resolution | V2 RapidAPI | `VITE_RAPIDAPI_KEY` | Higher-res GIF URLs (optional) |

If V2 key is missing, V1 handles everything. If V2 fails, V1 is used as fallback.

## Service Layer

**File:** `src/services/exerciseDbService.ts`

### Key Functions

| Function | Purpose |
|----------|---------|
| `searchExerciseByName(name)` | Name-mapped search with fuzzy fallback |
| `fetchBodyPartList()` | List all body part categories |
| `fetchTargetMuscleList()` | List all target muscles |
| `fetchEquipmentList()` | List all equipment types |
| `fetchExercisesByBodyPart(part, offset, limit)` | Paginated browse |
| `fetchExercisesByMuscle(muscle, offset, limit)` | Paginated browse |
| `fetchExercisesByEquipment(equip, offset, limit)` | Paginated browse |
| `searchExercises(query, offset, limit)` | Paginated fuzzy search |
| `fetchExerciseById(id)` | Single exercise detail |
| `fetchAlternativeExercises(muscle, excludeId, limit)` | Alternatives for swap |

### Request Queue

All API calls go through a serial queue with:
- 2-second minimum gap between requests
- Exponential backoff on 429 (rate limit): 2s, 4s, 8s
- Maximum 3 retries

## Caching Strategy

Three independent localStorage caches:

| Cache Key | TTL | Max Size | Contents |
|-----------|-----|----------|----------|
| `exercisedb_cache_v5` | 7 days (hits), 1 hour (misses) | Unbounded | Individual exercise lookups |
| `exercisedb_browse_v1` | 7 days | 200 entries (LRU) | Paginated browse/search results |
| `exercisedb_lists_v2` | 30 days | 3 entries | Body parts, muscles, equipment lists |

**Cache-first approach:** Always check cache before API call.

## Hooks Layer

**File:** `src/hooks/useExerciseLibrary.ts`

All hooks use TanStack Query with matching stale times (7-day or 30-day) and `useInfiniteQuery` for paginated endpoints.

**File:** `src/hooks/useExerciseGif.ts`

Provides `useExerciseInfo(exerciseName)` for components that need GIF URL + instructions by exercise name (used by ExerciseCard thumbnails and FormGuideSheet).

## Exercise Name Resolution

The service includes a 170+ entry mapping table that translates workout plan exercise names to ExerciseDB search terms. Resolution order:

1. Exact mapping lookup (e.g., "Incline DB Press" -> "dumbbell incline bench press")
2. Plural stripping (e.g., "Mountain Climbers" -> "Mountain Climber")
3. Keyword extraction (e.g., "Overhead DB Press" -> search "dumbbell press")
4. Fuzzy word scoring on API results

## Component Architecture

```
ExerciseLibraryPage (/exercises)
  -> useBodyPartList, useExerciseBrowse, useExerciseSearch
  -> ExerciseLibrary browse/search UI

ExerciseDetailPage (/exercises/:exerciseId)
  -> useExerciseDetail, useExerciseAlternatives
  -> GIF hero, tabs (Instructions|Muscles), alternatives carousel

ExerciseCard (in Workout.tsx active view)
  -> ExerciseGifThumb (40px thumbnail via useExerciseInfo)
  -> FormGuideSheet (bottom sheet: GIF + instructions + muscles)
  -> ExerciseSwapSheet (alternatives list with swap confirmation)

HomePage (/ - explore section)
  -> useBodyPartList -> horizontal category carousel
```

## Exercise Swap Flow

1. User taps swap icon (ArrowLeftRight) on ExerciseCard during active workout
2. ExerciseSwapSheet opens, fetches alternatives via `useExerciseAlternatives(primaryMuscle)`
3. User selects an alternative and confirms
4. `swapPlanExerciseName(exerciseId, newName)` updates `plan_exercises.name` in Supabase
5. Query cache invalidated -> UI refreshes with new exercise name
