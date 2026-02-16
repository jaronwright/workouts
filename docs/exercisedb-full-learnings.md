# ExerciseDB API — Complete Integration Learnings

## Date: 2026-02-15
## Plan: Hobby (Free) | Reason for rollback: 2,000 calls/month hard cap

---

## API Overview

- **V2 (Primary)**: `https://exercisedb.p.rapidapi.com` — RapidAPI proxy, requires API key
- **V1 (Fallback)**: `https://oss.exercisedb.dev/api/v1` — Free OSS endpoint, no key required
- **Auth**: RapidAPI key via `X-RapidAPI-Key` and `X-RapidAPI-Host` headers
- **Key Location (current)**: `VITE_RAPIDAPI_KEY` in `.env.local` (frontend-exposed — BAD)
- **Rate Limits**: 500/day, 2,000/month (Hobby plan hard cap)
- **Response Format**: JSON, varies between V1 (paginated with `data[]` + `metadata`) and V2 (flat arrays)

## Hobby Plan Constraints

| Constraint | Value |
|------------|-------|
| Exercises available | 200 (balanced across body parts) |
| Daily API calls | 500 |
| Monthly API calls | 2,000 (HARD LIMIT — stops working) |
| Images/Videos | Watermarked |
| Attribution | Required |
| API Keys | Single |
| Rate limiting | Enforced |

## Available Endpoints

### V2 RapidAPI Endpoints

**Search by name**: `GET /exercises/name/{name}?limit=10`
- Headers: `X-RapidAPI-Key`, `X-RapidAPI-Host: exercisedb.p.rapidapi.com`
- Response: Array of V2Exercise objects
- V2Exercise schema: `{ id, name, bodyPart, target, equipment, secondaryMuscles[], instructions[] }`
- Note: V2 uses singular fields (bodyPart, target, equipment) vs V1 arrays

**Image endpoint**: `GET /image?exerciseId={id}&resolution=360&rapidapi-key={key}`
- Returns exercise GIF directly
- Resolution options: 360 (small), higher available
- GIFs are watermarked on Hobby plan

### V1 OSS Endpoints

**Search**: `GET /exercises?search={query}&limit=10`
- Response: `{ success, metadata: V1PaginationMeta, data: ExerciseDbExercise[] }`
- V1 response schema: `{ exerciseId, name, gifUrl, targetMuscles[], bodyParts[], equipments[], secondaryMuscles[], instructions[] }`

**Body parts list**: `GET /bodyparts`
- Response: `{ data: string[] }` or `string[]`
- Some responses return `{name: string}[]` objects instead of strings (requires normalization)

**Muscles list**: `GET /muscles`
- Same format as body parts

**Equipment list**: `GET /equipments`
- Same format as body parts

**Browse by body part**: `GET /bodyparts/{name}/exercises?offset={n}&limit={n}`
- Response: V1Response with pagination

**Browse by muscle**: `GET /muscles/{name}/exercises?offset={n}&limit={n}&includeSecondary=true`
- Optional `includeSecondary` param

**Browse by equipment**: `GET /equipments/{name}/exercises?offset={n}&limit={n}`

**Search fuzzy**: `GET /exercises/search?q={query}&offset={n}&limit={n}`

**Get by ID**: `GET /exercises/{id}`
- Response: `{ data: ExerciseDbExercise }`

## V1 Pagination Metadata

```typescript
interface V1PaginationMeta {
  totalExercises: number
  totalPages: number
  currentPage: number
  previousPage: string | null
  nextPage: string | null
}
```

## Image/GIF URL Patterns

- V2: `${V2_BASE_URL}/image?exerciseId=${id}&resolution=360&rapidapi-key=${apiKey}`
- V1: Direct `gifUrl` field in exercise response
- GIFs: Animated demonstrations, ~200-500KB each
- Watermark: Present on all Hobby plan images
- Format: GIF (animated)
- Typical dimensions: 360px width

## Exercise Name Mapping (130+ entries)

Our app uses different exercise names than ExerciseDB. Critical mappings preserved:

```
'incline db press' → 'dumbbell incline bench press'
'barbell back squat' → 'barbell squat'
'hip thrusts' → 'barbell hip thrust'
'pull-ups' → 'pull up'
'push-ups' → 'push up'
'rdl' → 'barbell romanian deadlift'
'goblet squat' → 'dumbbell goblet squat'
```

Full mapping table: 130+ entries covering PPL, Upper/Lower, Full Body, Bro Split, Arnold, Glute Hypertrophy, and Mobility plans. Stored in `exerciseDbService.ts:14-170`.

## Matching Algorithm

1. Normalize: lowercase, remove parenthetical notes, expand abbreviations (db→dumbbell, bb→barbell)
2. Check explicit name mapping table
3. Strip trailing 's' for plurals (climbers→climber, lunges→lunge)
4. Check mapping table again after plural stripping
5. Search ExerciseDB API with normalized name
6. Score results using fuzzy matching (exact match > starts with > word overlap > contains)
7. If no good match, extract main keyword (press, curl, squat...) + equipment prefix, try again
8. Cache result (including null results with shorter TTL)

## Architecture Patterns That Worked

1. **Cache-first strategy**: Check localStorage before API call, cache all results including nulls
2. **Dual-version fallback**: V2 RapidAPI primary, V1 OSS fallback (graceful degradation)
3. **Name mapping table**: Explicit mapping for known exercise name mismatches
4. **Throttled serial queue**: Only 1 API call at a time with 2s minimum gap between calls
5. **Exponential backoff**: Retry on 429 with 2s/4s/8s delays (max 3 retries)
6. **Conditional fetching in hooks**: `enabled: isOpen ? exerciseName : undefined` prevents API calls until user interaction
7. **TanStack Query wrapping**: Long stale times (7 days) and gc times (30 days) for exercise data
8. **Null result caching**: Failed lookups cached for 1 hour (vs 7 days for successes) to avoid repeated API waste

## Architecture Patterns That Failed

1. **Inline thumbnails**: `ExerciseGifThumb` in `ExerciseCard` fires API call per visible exercise. A workout with 8 exercises = 8 API calls just to render the page. This alone could burn 200+ calls/month.

2. **Full browse/search tab**: The Exercise Library page loads 3 category lists on mount (bodyparts, muscles, equipment) + 1 call per category selection + 1 per search query. A user exploring 5 categories = 8+ calls in one session.

3. **Swap/alternatives feature**: Each swap button open requires loading the current exercise info (1 call) + alternatives list (1 call) = 2 calls per swap attempt. Most users never even swap.

4. **Explore Exercises on Home**: Loads `useBodyPartList()` on every Home page render. Even though it's cached, the first load of each session burns a call.

5. **Auto-loading on modal open**: `ExerciseDetailModal` and `FormGuideSheet` call `useExerciseInfo` with `enabled: isOpen`, triggering API calls immediately when opened, even if user just wanted to see the exercise name/notes.

## Component Code Worth Preserving

- **Name mapping table**: `exerciseDbService.ts:14-170` — 130+ mappings, took significant effort to build
- **Fuzzy matching algorithm**: `exerciseDbService.ts:446-496` — `findBestMatch()` with scoring system
- **Keyword extraction**: `exerciseDbService.ts:265-282` — `getMainKeyword()` for fallback searches
- **Name normalization**: `exerciseDbService.ts:237-262` — Handles abbreviations, plurals, parentheticals
- **Instructions renderer**: `FormGuideSheet.tsx:77-99` — Numbered steps with "Show all X steps" expander
- **Muscle tag display**: `FormGuideSheet.tsx:104-124` — Primary (accent) + secondary (muted) pills
- **GIF loading skeleton**: `FormGuideSheet.tsx:46-61` — Smooth loading with aspect ratio container

## Plan Upgrade Path

| Plan | Monthly Calls | Exercises | Watermark | Price | Features Re-enabled |
|------|--------------|-----------|-----------|-------|---------------------|
| Hobby (current) | 2,000 | 200 | Yes | Free | On-demand guide only |
| Pro | 80,000 | 500 | No | ~$100/mo | + Browse, Search, Thumbnails |
| Ultra | 500,000 | 1,300 | No | ~$250/mo | + Full library, Swap, Alternatives |

## Attribution Requirements

- Hobby plan: "Exercise data by ExerciseDB" visible near any ExerciseDB content
- Display format: Footer text in modals + Settings/About section
- Link not required but appreciated

## Key Technical Notes

- V1 and V2 have different response schemas — V2 uses singular fields, V1 uses arrays
- V1 category endpoints sometimes return `{name: string}[]` instead of `string[]` — needs normalization
- Rate limiting (429) happens at the RapidAPI proxy level, not ExerciseDB itself
- localStorage quota can fill up with cached GIF URLs and browse results
- The API key was in frontend code (VITE_RAPIDAPI_KEY) — visible in browser dev tools. Moving to Supabase edge function fixes this security issue.
