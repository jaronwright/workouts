# ExerciseDB API Research Report

*Compiled: February 8, 2026*

---

## Executive Summary

This report documents a deep investigation into the ExerciseDB API — what it offers, how our app currently integrates with it, why exercise images are frequently missing, and what options exist to fix the problem. The root cause is **not broken image URLs** — it's a combination of aggressive rate limiting on the free OSS endpoint and exercise name mismatches causing failed lookups.

---

## Table of Contents

1. [API Versions Overview](#1-api-versions-overview)
2. [V1 Open Source API (Current Integration)](#2-v1-open-source-api-current-integration)
3. [V2 RapidAPI (Paid Tier)](#3-v2-rapidapi-paid-tier)
4. [V2 GitHub Dataset (Full Data)](#4-v2-github-dataset-full-data)
5. [Image & GIF System](#5-image--gif-system)
6. [Our Current Integration](#6-our-current-integration)
7. [Root Cause Analysis: Missing Images](#7-root-cause-analysis-missing-images)
8. [Recommendations](#8-recommendations)

---

## 1. API Versions Overview

ExerciseDB exists in multiple forms. Understanding the differences is critical:

| Aspect | V1 OSS (Free) | V2 RapidAPI (Paid) | V2 GitHub Dataset |
|--------|---------------|--------------------|--------------------|
| **Base URL** | `oss.exercisedb.dev/api/v1` | `exercisedb.p.rapidapi.com` | Static data download |
| **Exercises** | ~1,300 | 11,000+ | 11,000+ |
| **Auth** | None | RapidAPI key | N/A |
| **GIF Access** | `gifUrl` field in response | Separate `/image` endpoint | Direct file download |
| **Rate Limits** | Very aggressive (undocumented) | Tiered by plan | None |
| **Endpoints** | Search only | 9 endpoints (browse, filter, search) | N/A |
| **Production Ready** | No (explicitly warned) | Yes | Yes (self-hosted) |
| **Cost** | Free | $0-$150/mo | Free (self-host media) |

**Key distinction**: V1 and V2 are **different datasets** with different exercise IDs and different response schemas.

---

## 2. V1 Open Source API (Current Integration)

This is what our app currently uses.

### Base URL
```
https://oss.exercisedb.dev/api/v1
```

### Available Endpoint
Only **one** endpoint is available:

```
GET /exercises?search={term}&limit={N}
```

There are **no** endpoints for browsing by body part, equipment, or target muscle. All lookups must go through text search.

### Response Format
```json
{
  "success": true,
  "metadata": {
    "totalPages": 26,
    "totalExercises": 51,
    "currentPage": 1,
    "previousPage": null,
    "nextPage": "http://oss.exercisedb.dev/api/v1/exercises?offset=2&limit=2&search=..."
  },
  "data": [
    {
      "exerciseId": "WcHl7ru",
      "name": "smith close-grip bench press",
      "gifUrl": "https://static.exercisedb.dev/media/WcHl7ru.gif",
      "targetMuscles": ["triceps"],
      "bodyParts": ["upper arms"],
      "equipments": ["smith machine"],
      "secondaryMuscles": ["chest", "shoulders"],
      "instructions": [
        "Step:1 Adjust the seat height...",
        "Step:2 Grasp the barbell..."
      ]
    }
  ]
}
```

### V1 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `exerciseId` | string | Short alphanumeric ID (e.g., "WcHl7ru") |
| `name` | string | Exercise name, lowercase |
| `gifUrl` | string | Direct URL to animated GIF |
| `targetMuscles` | string[] | Primary muscle groups |
| `bodyParts` | string[] | Body part categories |
| `equipments` | string[] | Equipment required |
| `secondaryMuscles` | string[] | Secondary muscles worked |
| `instructions` | string[] | Step-by-step instructions (prefixed with "Step:N") |

### GIF Hosting
GIF URLs follow the pattern:
```
https://static.exercisedb.dev/media/{exerciseId}.gif
```
These URLs **are accessible** (confirmed HTTP 200) — the GIFs themselves are not broken.

### Rate Limiting (Critical Issue)
- Returns HTTP 429 "Too Many Requests" very aggressively
- Recovery time appears to be **10+ seconds** (not the 1.5s our retry logic assumes)
- No `Retry-After` header provided
- No documentation on exact limits
- The OSS endpoint explicitly states: **"These endpoints are for exploration only and not recommended for production integration — strict rate limits and potential instability may apply."**

### Limitations
- Only ~1,300 exercises (vs 11,000+ in v2)
- Search-only — no browse/filter endpoints
- No difficulty levels, categories, or descriptions
- No videos, only GIFs
- Unstable for production use

---

## 3. V2 RapidAPI (Paid Tier)

The production-grade API available through RapidAPI.

### Base URL
```
https://exercisedb.p.rapidapi.com
```

### Authentication
```
Header: X-RapidAPI-Key: YOUR_API_KEY
  — or —
Query: ?rapidapi-key=YOUR_API_KEY
```

### All Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/exercises` | GET | List all exercises (paginated) |
| `/exercises/name/{name}` | GET | Search exercises by name |
| `/exercises/exercise/{id}` | GET | Get single exercise by ID |
| `/exercises/bodyPart/{bodyPart}` | GET | Filter by body part |
| `/exercises/bodyPartList` | GET | List all body part values |
| `/exercises/target/{target}` | GET | Filter by target muscle |
| `/exercises/targetList` | GET | List all target muscle values |
| `/exercises/equipment/{equipment}` | GET | Filter by equipment type |
| `/exercises/equipmentList` | GET | List all equipment types |
| `/image` | GET | Stream exercise GIF by ID |

### Common Query Parameters (all exercise endpoints)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offset` | number | 0 | Pagination offset |
| `limit` | number | 10 | Results per page (0 = all) |
| `sortMethod` | string | "id" | Sort by: id, name, bodyPart, target, equipment |
| `sortOrder` | string | "ascending" | ascending or descending |

**Note**: `limit > 10` requires PRO plan or higher.

### V2 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Exercise identifier |
| `name` | string | Exercise name |
| `bodyPart` | string | Single body part (not array) |
| `target` | string | Single target muscle (not array) |
| `equipment` | string | Single equipment type (not array) |
| `secondaryMuscles` | string[] | Secondary muscles |
| `instructions` | string[] | Step-by-step guide |
| `description` | string | Exercise description |
| `difficulty` | enum | beginner, intermediate, advanced |
| `category` | enum | strength, cardio, mobility, balance, stretching, plyometrics, rehabilitation |

**Important schema difference from V1**: V2 uses singular `bodyPart`, `target`, `equipment` (strings) while V1 uses plural arrays (`bodyParts`, `targetMuscles`, `equipments`).

### Image Endpoint

```
GET /image?exerciseId={id}&resolution={180|360|720|1080}
```

Returns: `Content-Type: image/gif` (streamed binary)

**Resolution access by plan:**

| Plan | Resolutions Available |
|------|-----------------------|
| BASIC (Free) | 180px only |
| PRO (~$25/mo) | 180px, 360px |
| ULTRA (~$75/mo) | 180px, 360px, 720px, 1080px |
| MEGA (~$150/mo) | 180px, 360px, 720px, 1080px |

If you request a resolution above your tier, it silently downgrades to your max.

### Pricing Tiers (RapidAPI)

| Plan | Price | Typical Limit |
|------|-------|---------------|
| BASIC | Free | ~500 req/month |
| PRO | ~$25/mo | Higher limits |
| ULTRA | ~$75/mo | Higher limits |
| MEGA | ~$150/mo | Highest limits |

---

## 4. V2 GitHub Dataset (Full Data)

The GitHub repository (`github.com/ExerciseDB/exercisedb-api`) contains the full dataset with the richest schema:

### Full V2 Dataset Fields

| Field | Type | Description |
|-------|------|-------------|
| `exerciseId` | string | Unique identifier |
| `name` | string | Exercise name |
| `imageUrl` | string | Static image filename |
| `videoUrl` | string | Video filename |
| `equipments` | string[] | Equipment types |
| `bodyParts` | string[] | Body part categories |
| `gender` | string | male/female demonstration |
| `exerciseType` | string | e.g., STRENGTH |
| `targetMuscles` | string[] | Primary muscles |
| `secondaryMuscles` | string[] | Secondary muscles |
| `keywords` | string[] | Search terms |
| `overview` | string | Exercise description |
| `instructions` | string[] | Step-by-step guide |
| `exerciseTips` | string[] | Coaching cues |
| `variations` | string[] | Alternative exercises |
| `relatedExerciseIds` | string[] | Related exercise IDs |

### Media Assets
- 15,000+ videos (MP4 format, CDN-hosted)
- 20,000+ images (PNG format)
- 5,000+ GIF animations
- Male and female visual demonstrations

---

## 5. Image & GIF System

### How GIFs Work Across Versions

**V1 OSS**: GIF URL is returned inline in the exercise response as `gifUrl`. URLs point to `static.exercisedb.dev/media/{id}.gif`. These are directly usable in `<img>` tags.

**V2 RapidAPI**: No `gifUrl` in the response. Instead, you must call the separate `/image` endpoint with the exercise ID. The response streams the GIF binary directly (Content-Type: image/gif). For use in `<img>` tags, you'd construct:
```
https://exercisedb.p.rapidapi.com/image?exerciseId={id}&resolution=360&rapidapi-key=YOUR_KEY
```

**V2 Dataset**: References `imageUrl` and `videoUrl` as filenames, not full URLs. These map to CDN-hosted assets.

### GIF Availability Confirmed
Live testing confirmed that V1 GIF URLs (e.g., `https://static.exercisedb.dev/media/WcHl7ru.gif`) return HTTP 200 successfully. **The GIFs are not broken — the issue is exercises not being found.**

---

## 6. Our Current Integration

### Architecture
```
ExerciseCard (tap info button)
  → ExerciseDetailModal
    → useExerciseInfo hook (TanStack Query)
      → searchExerciseByName (exerciseDbService.ts)
        → OSS V1 API: GET /exercises?search={term}&limit=10
        → Score-based best-match algorithm
        → localStorage cache (7-day TTL)
```

### Service: `exerciseDbService.ts`
- **Base URL**: `https://oss.exercisedb.dev/api/v1`
- **54 exercise name mappings** to normalize app names → API search terms
- **Smart matching**: Score-based algorithm (exact match, starts-with, word overlap, length similarity)
- **Fallback search**: Extracts keyword + equipment type for second attempt
- **Rate limit handling**: Single retry after 1.5s on 429
- **Caching**: localStorage with 7-day TTL, caches null results too

### Hook: `useExerciseInfo`
- TanStack Query wrapper with 7-day staleTime, 30-day gcTime
- 2 retries with 1-second delay
- Returns: exercise object, gifUrl, instructions, loading/error states

### Component: `ExerciseDetailModal`
- Shows GIF animation, body parts, equipment, target/secondary muscles, instructions
- Graceful fallback: loading spinner → error state → "no details available"
- Supports user notes display alongside API data

---

## 7. Root Cause Analysis: Missing Images

After thorough investigation, **missing exercise images are caused by multiple compounding issues**:

### Issue 1: Aggressive Rate Limiting (Primary)
The OSS V1 endpoint returns 429 errors very frequently. Our retry logic waits only 1.5 seconds, but the rate limiter appears to need 10+ seconds to recover. When a user opens multiple exercise details in quick succession, most requests fail silently.

**Evidence**: Live testing hit 429 after just 3 rapid requests. The endpoint explicitly warns it's "not recommended for production integration."

### Issue 2: Name Mismatch (Secondary)
Our app's exercise names (from Supabase) don't always match ExerciseDB's naming conventions. While we have 54 manual mappings, any unmapped exercise falls through to raw search, which may return poor or no matches.

**Examples of likely failures**:
- App: "Incline DB Press" → Mapped to "dumbbell incline bench press" → But V1 search still returned "dumbbell twisting bench press" as first result (wrong exercise!)
- Exercises without mappings rely on fuzzy matching that can pick wrong exercises

### Issue 3: Small Dataset
V1 OSS only has ~1,300 exercises. Some exercises in our plans may simply not exist in the V1 dataset, especially less common movements.

### Issue 4: Search-Only API
With no ability to browse by body part or equipment, every lookup depends entirely on text search quality. A single missing word or different naming convention means no match.

### Issue 5: Null Caching
When a search fails (rate limit or no match), we cache `null` for 7 days. This means a temporary rate limit error permanently prevents that exercise from showing for a week.

---

## 8. Recommendations

### Option A: Optimize Current V1 Integration (Quick Win)
**Cost**: Free | **Effort**: Low

1. **Fix rate limit handling**: Implement exponential backoff (2s → 4s → 8s) instead of fixed 1.5s retry
2. **Don't cache rate limit failures**: Only cache actual null results, not 429 errors
3. **Add request queuing**: Throttle to max 1 request per 3 seconds
4. **Expand name mappings**: Audit all exercises in our plans and add missing mappings
5. **Pre-warm cache**: On first app load, batch-fetch all plan exercises with throttling

### Option B: Switch to V2 RapidAPI BASIC (Free Tier)
**Cost**: Free (500 req/month) | **Effort**: Medium

1. Better search with browse-by endpoints (bodyPart, target, equipment)
2. 11,000+ exercises (vs 1,300)
3. Difficulty levels and categories
4. More reliable infrastructure
5. **Trade-off**: 500 req/month limit, 180px GIF resolution only, limit of 10 results per call

### Option C: Switch to V2 RapidAPI PRO
**Cost**: ~$25/month | **Effort**: Medium

1. Everything in Option B plus:
2. Higher request limits
3. 360px GIF resolution
4. `limit > 10` per call
5. **Best balance of cost vs capability**

### Option D: Self-Host Exercise Data (Best Long-Term)
**Cost**: Free (hosting costs only) | **Effort**: High

1. Download the V2 dataset from GitHub
2. Store exercise data + GIFs in Supabase Storage or CDN
3. Match exercises at data-entry time (when building workout plans), not at display time
4. Zero rate limits, zero API dependency, fastest possible loading
5. **Trade-off**: Must maintain dataset updates, storage costs for GIFs

### Option E: Hybrid Approach (Recommended)
**Cost**: Free-$25/mo | **Effort**: Medium

1. **Immediate**: Fix Option A issues (rate limiting, null caching, name mappings)
2. **Short-term**: Add the V2 RapidAPI BASIC key for better search quality (already have `VITE_RAPIDAPI_KEY` in .env.local)
3. **Medium-term**: Pre-compute exercise-to-ExerciseDB mappings at plan creation time and store the exerciseId + gifUrl in Supabase
4. **Long-term**: Consider self-hosting the dataset for full control

---

## Appendix A: V1 vs V2 Response Schema Comparison

```
V1 OSS Response:                    V2 RapidAPI Response:
─────────────────                   ─────────────────────
exerciseId: string                  id: string
name: string                        name: string
gifUrl: string                      (no gifUrl - use /image endpoint)
targetMuscles: string[]             target: string (singular!)
bodyParts: string[]                 bodyPart: string (singular!)
equipments: string[]                equipment: string (singular!)
secondaryMuscles: string[]          secondaryMuscles: string[]
instructions: string[]              instructions: string[]
                                    description: string (NEW)
                                    difficulty: enum (NEW)
                                    category: enum (NEW)
```

## Appendix B: All Exercise Name Mappings in Our App

Currently 54 mappings in `exerciseDbService.ts`:

**Push Day**: incline db press, overhead db extension, overhead rope extension, weighted dips, cable fly, rope pulldown crunches, hanging leg raises, band pull-aparts, band shoulder dislocates

**Pull Day**: pull-ups, t-bar row, close grip lat pulldown, single-arm cable row, face pulls, ez bar curl, hammer curls, dead hangs, scapular pull-ups, band rows, reverse crunches, ab wheel rollouts

**Legs Day**: hip thrusts, goblet squat, leg press, leg extension, lying leg curl, hip abductor machine, walking lunges, seated calf raises, air squats, banded lateral walks, deep squat hold, zombie walks

**Cardio/Warmup**: incline treadmill walk, push-ups, rowing machine, bike or stair stepper, plank

## Appendix C: Useful Links

- ExerciseDB Main Site: https://exercisedb.dev
- V1 API Docs: https://exercisedb.dev/docs
- V2 API Docs: https://edb-docs.up.railway.app
- GitHub Repository: https://github.com/ExerciseDB/exercisedb-api
- RapidAPI Marketplace: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
- RapidAPI Pricing: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/pricing
- V2 Dataset Playground: https://v2.exercisedb.dev/docs

## Appendix D: Live API Test Results (Feb 8, 2026)

```
# Test 1: Search works and GIFs are accessible
GET https://oss.exercisedb.dev/api/v1/exercises?search=bench%20press&limit=2
→ 200 OK, returned 2 exercises with valid gifUrl

# Test 2: GIF URL is accessible
GET https://static.exercisedb.dev/media/WcHl7ru.gif
→ 200 OK (GIF loads successfully)

# Test 3: Rate limiting is aggressive
GET (3 rapid requests)
→ 429 Too Many Requests after 3rd call
→ Still 429 after 5-second wait
→ Still 429 after 8-second wait

# Test 4: Name mapping quality issue
Search: "dumbbell incline bench press" (our mapped name for "incline db press")
→ First result: "dumbbell twisting bench press" (WRONG exercise)
→ Correct exercise not in top 3 results
```
