# ExerciseDB API Audit

## API Versions

| Version | Base URL | Auth | Exercises |
|---------|----------|------|-----------|
| V1 OSS | `https://oss.exercisedb.dev/api/v1` | None | ~1,500 |
| V2 RapidAPI | `https://exercisedb.p.rapidapi.com` | RapidAPI key | ~1,300 |
| V2 Premium | Purchased dataset | N/A | 11,000+ |

**Decision**: Use **V1 OSS as primary** for browse/search (better endpoints, free, no rate limit concerns). Use **V2 RapidAPI only for GIF resolution** via `/image` endpoint. V2 Premium fields (tips, variations, video, overview) are not available without purchasing the dataset.

---

## V1 OSS Endpoints

### List/Filter Endpoints

| Endpoint | Description | Params |
|----------|-------------|--------|
| `GET /exercises` | List all exercises | `search`, `offset`, `limit` (max 25), `sortBy`, `sortOrder` |
| `GET /exercises/search` | Fuzzy search | `q` (required), `offset`, `limit`, `threshold` (0-1) |
| `GET /exercises/filter` | Multi-criteria filter | `search`, `muscles`, `equipment`, `bodyParts`, `offset`, `limit`, `sortBy`, `sortOrder` |
| `GET /exercises/{exerciseId}` | Single exercise by ID | - |
| `GET /bodyparts` | List body part categories | - |
| `GET /bodyparts/{name}/exercises` | Exercises by body part | `offset`, `limit` |
| `GET /muscles` | List target muscles | - |
| `GET /muscles/{name}/exercises` | Exercises by muscle | `offset`, `limit`, `includeSecondary` |
| `GET /equipments` | List equipment types | - |
| `GET /equipments/{name}/exercises` | Exercises by equipment | `offset`, `limit` |

### V1 Response Envelope
```json
{
  "success": true,
  "metadata": {
    "totalExercises": 120,
    "totalPages": 5,
    "currentPage": 1,
    "previousPage": null,
    "nextPage": "https://..."
  },
  "data": [ ... ]
}
```

---

## V1 Exercise Object Schema

```typescript
interface V1Exercise {
  exerciseId: string       // Hash-like ID (e.g. "WcHl7ru")
  name: string             // e.g. "barbell bench press"
  gifUrl: string           // Full URL to animated GIF
  targetMuscles: string[]  // Primary muscles targeted
  bodyParts: string[]      // Body regions (e.g. ["chest"])
  equipments: string[]     // Required equipment
  secondaryMuscles: string[] // Supporting muscles
  instructions: string[]   // Step-by-step (prefixed with "Step:N")
}
```

**That's it.** V1 OSS has exactly 8 fields per exercise. No tips, no variations, no video, no overview, no keywords, no exercise type, no gender variants. These are V2 Premium-only fields.

---

## V2 RapidAPI Differences

| Aspect | V1 OSS | V2 RapidAPI |
|--------|--------|-------------|
| IDs | Hash strings ("WcHl7ru") | Numeric strings ("0001") |
| Body part | `bodyParts: string[]` | `bodyPart: string` |
| Target | `targetMuscles: string[]` | `target: string` |
| Equipment | `equipments: string[]` | `equipment: string` |
| GIF URL | `gifUrl` in response | Separate `/image` endpoint |
| Response | `{ success, metadata, data }` | Bare array |
| Pagination meta | Yes | No |
| Fuzzy search | `/exercises/search` with threshold | `/exercises/name/{name}` |
| Multi-filter | `/exercises/filter` | Not available |
| `includeSecondary` | Yes | No |
| Sort options | Yes | No |

---

## Available Categories

### Body Parts (10)
back, cardio, chest, lower arms, lower legs, neck, shoulders, upper arms, upper legs, waist

### Target Muscles (50 in V1, 19 in V2)
V1: abs, abductors, adductors, biceps, brachialis, calves, cardiovascular system, chest, core, deltoids, delts, forearms, glutes, hamstrings, hip flexors, lats, levator scapulae, lower back, obliques, pectorals, quadriceps, quads, rear deltoids, rhomboids, rotator cuff, serratus anterior, shoulders, spine, traps, trapezius, triceps, upper back, upper chest, wrist extensors, wrist flexors, + more

### Equipment (29)
assisted, band, barbell, body weight, bosu ball, cable, dumbbell, elliptical machine, ez barbell, hammer, kettlebell, leverage machine, medicine ball, olympic barbell, resistance band, roller, rope, skierg machine, sled machine, smith machine, stability ball, stationary bike, stepmill machine, tire, trap bar, upper body ergometer, weighted, wheel roller

---

## Current Integration Gap

### What we use now
- Name-based search → single best match for GIF display in ExerciseDetailModal
- Fields displayed: gifUrl, bodyParts, equipments, targetMuscles, secondaryMuscles, instructions

### What we're NOT using
- `/exercises/search` fuzzy endpoint with configurable threshold
- `/exercises/filter` multi-criteria endpoint
- `/bodyparts`, `/muscles`, `/equipments` list endpoints
- Browse by category endpoints (`/bodyparts/{name}/exercises`, etc.)
- `includeSecondary` flag on muscle endpoint
- Pagination metadata (totalExercises, totalPages, nextPage)
- Sort parameters (sortBy, sortOrder)
- The `instructions` field is parsed but could be used more prominently (mid-workout overlay)

---

## Rate Limits

### V1 OSS
- Not documented, returns 429 when exceeded
- Intended for development, not heavy production use
- Our existing throttledFetch (2s gap, serial queue) should be sufficient

### V2 RapidAPI
| Tier | Requests/Month | GIF Resolution | Cost |
|------|---------------|----------------|------|
| BASIC (Free) | 690 | 180px only | $0 |
| PRO | 2,300 | 180, 360px | $11.99 |
| ULTRA | 8,625 | Up to 1080px | $17.99 |

Each GIF fetch via `/image` counts as a separate API call.

---

## Caching Strategy Recommendation

| Data | Storage | TTL | Rationale |
|------|---------|-----|-----------|
| Category lists | localStorage | 30 days | Rarely change |
| Search/browse results | localStorage | 7 days | Exercises don't change often |
| Individual exercise detail | localStorage | 7 days | Same as above |
| Failed lookups | localStorage | 1 hour | Retry sooner |
| GIF images | Browser cache + service worker | NetworkFirst | CDN-cached, let browser handle |

Add cache size limits: max 500 entries in browse cache, LRU eviction.
