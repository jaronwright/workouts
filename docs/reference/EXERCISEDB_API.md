# ExerciseDB API -- Comprehensive Reference

## 1. Overview

[ExerciseDB](https://exercisedb.dev/) is a comprehensive fitness exercise database API that provides structured data on **1,300+ exercises** (V1 open-source dataset) or **11,000+ exercises** (V2 premium dataset). Each exercise includes animated GIF demonstrations, target/secondary muscle information, equipment details, and step-by-step instructions.

The API is primarily distributed through [RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) (V2, paid tiers) but also offers a free, open-source V1 endpoint at `oss.exercisedb.dev` that requires no API key.

**Key facts:**

- **V1 (Open Source):** 1,300+ exercises, free, no API key required, hosted at `https://oss.exercisedb.dev/api/v1`
- **V2 (RapidAPI):** 1,300+ exercises via RapidAPI with premium features (image streaming, tiered resolution), hosted at `https://exercisedb.p.rapidapi.com`
- **V2 Premium Dataset:** 11,000+ exercises with 15,000+ videos, 20,000+ images, 5,000+ GIF animations (available via separate purchase at [exercisedb.io](https://www.exercisedb.io/))
- **License:** AGPL-3.0 (open-source components)
- **GitHub:** [ExerciseDB/exercisedb-api](https://github.com/ExerciseDB/exercisedb-api)

---

## 2. Full Capabilities -- All Endpoints

### Base URLs

| Version | Base URL | Auth Required |
|---------|----------|---------------|
| V1 OSS  | `https://oss.exercisedb.dev/api/v1` | No |
| V2 RapidAPI | `https://exercisedb.p.rapidapi.com` | Yes (RapidAPI key) |

### Exercise Endpoints

All endpoints use **GET** method.

| Endpoint | Description |
|----------|-------------|
| `GET /exercises` | List all exercises (supports pagination) |
| `GET /exercises/exercise/{id}` | Get a single exercise by its unique ID |
| `GET /exercises/name/{name}` | Search exercises by name (partial match) |
| `GET /exercises/bodyPart/{bodyPart}` | Filter exercises by body part |
| `GET /exercises/target/{target}` | Filter exercises by target muscle group |
| `GET /exercises/equipment/{equipment}` | Filter exercises by equipment type |

### Reference List Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /exercises/bodyPartList` | Get all available body part categories |
| `GET /exercises/targetList` | Get all available target muscle groups |
| `GET /exercises/equipmentList` | Get all available equipment types |

### V2 Image Endpoint

| Endpoint | Description |
|----------|-------------|
| `GET /image?exerciseId={id}&resolution={res}` | Get exercise GIF/image at specified resolution (V2 only) |

### Pagination

Most list endpoints support pagination via query parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `limit` | Maximum number of results to return | 10 |
| `offset` | Number of results to skip | 0 |

Example: `GET /exercises?limit=20&offset=40` returns exercises 41-60.

For V1 OSS, the search endpoint uses: `GET /exercises?search={term}&limit=10`

---

## 3. Data Structure

### V2 Exercise Object (RapidAPI)

The V2 API returns exercise objects with singular fields for body part, target, and equipment:

```json
{
  "id": "0001",
  "name": "3/4 sit-up",
  "bodyPart": "waist",
  "target": "abs",
  "equipment": "body weight",
  "secondaryMuscles": ["hip flexors", "lower back"],
  "instructions": [
    "Lie flat on your back with your knees bent and feet flat on the ground.",
    "Place your hands behind your head with your elbows pointing outwards.",
    "Engaging your abs, slowly lift your upper body off the ground...",
    "Pause briefly at the top, then slowly lower your upper body back down..."
  ]
}
```

**Note:** The V2 API does not return a `gifUrl` directly in the exercise object. GIFs are accessed via a separate image endpoint:
```
GET https://exercisedb.p.rapidapi.com/image?exerciseId={id}&resolution=360&rapidapi-key={YOUR_KEY}
```

### V1 Exercise Object (OSS)

The V1 open-source API returns exercises with array-based fields:

```json
{
  "exerciseId": "exr_41n2hZZdH9uyYFGZ",
  "name": "Barbell Bench Press",
  "gifUrl": "https://...",
  "bodyParts": ["chest"],
  "targetMuscles": ["pectoralis major clavicular head"],
  "secondaryMuscles": ["deltoid anterior", "triceps brachii"],
  "equipments": ["barbell"],
  "instructions": [
    "Lie flat on a bench with your feet flat on the ground.",
    "Grip the barbell with hands slightly wider than shoulder-width apart.",
    "Lower the barbell to your mid-chest with controlled motion.",
    "Press the barbell back up to the starting position."
  ]
}
```

### Field Reference

| Field | V1 Name | V2 Name | Type | Description |
|-------|---------|---------|------|-------------|
| ID | `exerciseId` | `id` | `string` | Unique exercise identifier |
| Name | `name` | `name` | `string` | Exercise display name |
| Body Part | `bodyParts` | `bodyPart` | `string[]` / `string` | Targeted body region(s) |
| Target Muscle | `targetMuscles` | `target` | `string[]` / `string` | Primary muscle group(s) |
| Secondary Muscles | `secondaryMuscles` | `secondaryMuscles` | `string[]` | Supporting muscle groups |
| Equipment | `equipments` | `equipment` | `string[]` / `string` | Required equipment |
| GIF URL | `gifUrl` | (via `/image` endpoint) | `string` | Animated exercise demonstration |
| Instructions | `instructions` | `instructions` | `string[]` | Step-by-step execution guide |

### V2 Premium Dataset Additional Fields

The premium dataset (11,000+ exercises) includes extra fields:

| Field | Type | Description |
|-------|------|-------------|
| `exerciseType` | `string` | Classification (e.g., `"STRENGTH"`, `"weight_reps"`) |
| `gender` | `string` | Target demographic (`"male"` / `"female"`) |
| `imageUrl` | `string` | Static exercise image filename |
| `videoUrl` | `string` | Video demonstration filename |
| `keywords` | `string[]` | SEO/search terms (10+ per exercise) |
| `overview` | `string` | Detailed exercise description |
| `exerciseTips` | `string[]` | Form and technique recommendations |
| `variations` | `string[]` | Alternative exercise versions |
| `relatedExerciseIds` | `string[]` | Cross-references to similar exercises |

---

## 4. Available Categories

### Body Parts (10 total)

```
back, cardio, chest, lower arms, lower legs,
neck, shoulders, upper arms, upper legs, waist
```

### Target Muscles

The V1/V2 RapidAPI uses simplified target muscle names:

```
abductors, abs, adductors, biceps, calves,
cardiovascular system, delts, forearms, glutes,
hamstrings, lats, levator scapulae, pectorals,
quads, serratus anterior, spine, traps,
triceps, upper back
```

The V2 premium dataset uses more anatomically precise names (e.g., "Pectoralis Major Clavicular Head", "Deltoid Anterior").

### Equipment Types (28 total)

```
assisted, band, barbell, body weight, bosu ball,
cable, dumbbell, elliptical machine, ez barbell,
hammer, kettlebell, leverage machine, medicine ball,
olympic barbell, resistance band, roller, rope,
skierg machine, sled machine, smith machine,
stability ball, stationary bike, stepmill machine,
tire, trap bar, upper body ergometer, weighted,
wheel roller
```

---

## 5. How to Get API Keys

### Step-by-Step (RapidAPI -- V2)

1. **Create a RapidAPI account** at [rapidapi.com](https://rapidapi.com/)
2. **Search for "ExerciseDB"** in the API marketplace
3. **Navigate to** the [ExerciseDB API page](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
4. **Click "Subscribe to Test"** or select a pricing plan
5. **Choose your tier** (Basic/Free tier is available for testing)
6. **Copy your API key** from the RapidAPI dashboard under "Apps" > "Security" > "Application Key"
7. **Use the key** in requests via the `X-RapidAPI-Key` header

### Using the V1 OSS API (No Key Required)

The V1 open-source API at `https://oss.exercisedb.dev/api/v1` does not require any API key. Simply make HTTP GET requests to the endpoints. However, this endpoint is intended for exploration and development only -- it has strict rate limits and may be unstable for production use.

### One-Time Dataset Purchase

ExerciseDB also offers a one-time purchase option for the complete dataset at [exercisedb.io](https://www.exercisedb.io/), which provides the full 11,000+ exercise dataset with all media assets for self-hosting.

---

## 6. Rate Limits and Pricing

### RapidAPI Pricing Tiers (V2)

RapidAPI uses a tiered pricing structure. The ExerciseDB API follows RapidAPI's standard tier model. Exact request limits and pricing can change, so always verify at the [ExerciseDB pricing page](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/pricing).

Typical RapidAPI tier structure:

| Tier | Monthly Cost | Requests/Month | Rate Limit | Overage |
|------|-------------|----------------|------------|---------|
| **Basic (Free)** | $0 | ~500 | Hard limit | None (blocked) |
| **Pro** | ~$10-25 | ~10,000 | Soft limit | Per-request charge |
| **Ultra** | ~$50-75 | ~100,000 | Soft limit | Per-request charge |
| **Mega** | ~$100-150 | ~1,000,000 | Soft limit | Per-request charge |

> **Note:** These are approximate values based on RapidAPI's standard tier recommendations. The actual ExerciseDB pricing may differ. Always check the [pricing page](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/pricing) for current rates.

### V1 OSS Rate Limits

The free V1 API at `oss.exercisedb.dev` has strict rate limits:
- Intended for **exploration and development only**
- Not recommended for production integration
- Rate limits are not publicly documented but are enforced server-side
- 429 (Too Many Requests) responses when limits are exceeded

### Image/GIF Requests

GIF and image requests via the V2 `/image` endpoint count against your RapidAPI quota. Each GIF fetch is a separate API call, so displaying GIFs for many exercises can consume quota quickly.

---

## 7. Integration Ideas for a Workout Tracker PWA

### Show Animated Exercise GIFs During Workouts
Display the animated GIF for each exercise during an active workout session. Users can see proper form and technique in real time. This is already partially implemented in this project via the `useExerciseInfo` hook.

### Exercise Search and Discovery by Muscle Group
Build a browse/discover page where users can:
- Select a body part (e.g., "chest") to see all chest exercises
- Drill down by target muscle (e.g., "pectorals" vs "delts")
- View exercises with their animated demonstrations

### Auto-Suggest Exercises When Building Custom Workout Plans
When users create or modify workout plans, provide exercise suggestions based on:
- Selected body part or muscle group
- Available equipment (home gym vs full gym)
- Exercise type (strength, cardio, stretching)

### Show Target and Secondary Muscles for Each Exercise
Display muscle targeting information on exercise cards:
- Primary target muscle highlighted
- Secondary muscles listed
- Helps users understand which muscles each exercise works

### Equipment-Based Filtering (Home Gym vs Full Gym)
Allow users to set their available equipment in their profile, then:
- Filter exercise suggestions to only show exercises they can do
- Suggest alternatives when an exercise requires unavailable equipment
- Build "home workout" vs "gym workout" presets

### Exercise Alternatives and Substitutions
When a user cannot perform an exercise, suggest alternatives:
- Same target muscle, different equipment
- Same body part, different difficulty
- Use the `relatedExerciseIds` field (V2 premium) for curated alternatives

### Comprehensive Exercise Library Page
Build a searchable, filterable exercise library:
- Browse by body part, muscle, equipment
- Search by name with autocomplete
- Each exercise card shows GIF preview, muscles, equipment
- Tap for full details with step-by-step instructions

---

## 8. Technical Integration Plan

### Existing Implementation

This project already has a working ExerciseDB integration:

- **Service:** `src/services/exerciseDbService.ts` -- Handles V2 (RapidAPI) with V1 (OSS) fallback
- **Hook:** `src/hooks/useExerciseGif.ts` -- TanStack Query wrapper (`useExerciseInfo`)
- **Env var:** `VITE_RAPIDAPI_KEY` -- Set in `.env.local` for V2 access

### Service Layer (`exerciseDbService.ts`)

The existing service includes:
- **Dual-source fetching:** V2 RapidAPI (primary) with V1 OSS fallback
- **Name normalization:** Maps app exercise names to ExerciseDB search terms
- **Best-match scoring:** Fuzzy matching algorithm for search results
- **localStorage caching:** 7-day TTL, prevents repeated API calls
- **Rate limit handling:** Serial request queue with 2-second gaps
- **Exponential backoff:** Retries on 429 responses (2s, 4s, 8s delays)

### Caching Strategy

Exercises are static data that rarely changes. Aggressive caching is appropriate:

```
Layer 1: TanStack Query in-memory cache
  - staleTime: 7 days
  - gcTime: 30 days
  - Survives component remounts within session

Layer 2: localStorage (exerciseDbService)
  - 7-day TTL per exercise
  - Persists across sessions
  - Caches null results to avoid repeated failed lookups

Layer 3: Service Worker (PWA)
  - Workbox NetworkFirst strategy for API calls
  - Enables offline access to previously fetched data

Layer 4 (Future): Supabase table
  - Store fetched exercises in database
  - Full offline support
  - Shared across devices
  - Eliminates API dependency after initial population
```

### Supabase Integration (Future Enhancement)

Store exercise data in a Supabase table for true offline access:

```sql
CREATE TABLE exercise_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_db_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  equipment TEXT NOT NULL,
  gif_url TEXT,
  instructions TEXT[] DEFAULT '{}',
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercise_library_name ON exercise_library(name);
CREATE INDEX idx_exercise_library_body_part ON exercise_library(body_part);
CREATE INDEX idx_exercise_library_target ON exercise_library(target_muscle);
CREATE INDEX idx_exercise_library_equipment ON exercise_library(equipment);
```

### Proxy Through Supabase Edge Function

To hide the RapidAPI key from client-side code, proxy requests through a Supabase Edge Function:

```typescript
// supabase/functions/exercise-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { searchTerm } = await req.json()
  const apiKey = Deno.env.get('RAPIDAPI_KEY')

  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchTerm)}?limit=10`,
    {
      headers: {
        'X-RapidAPI-Key': apiKey!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    }
  )

  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### GIF Caching with Service Worker

GIF files can be large (200KB-1MB each). Cache them aggressively in the service worker:

```typescript
// In vite.config.ts PWA configuration
workbox: {
  runtimeCaching: [
    {
      urlPattern: /exercisedb\.p\.rapidapi\.com\/image/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'exercise-gifs',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
}
```

### TanStack Query Configuration

The existing `useExerciseInfo` hook is already well-configured:

```typescript
useQuery({
  queryKey: ['exercise-info', exerciseName],
  queryFn: () => searchExerciseByName(exerciseName!),
  enabled: !!exerciseName,
  staleTime: 7 * 24 * 60 * 60 * 1000,  // 7 days
  gcTime: 30 * 24 * 60 * 60 * 1000,     // 30 days
  retry: 1,
  retryDelay: 5000,
})
```

---

## 9. Limitations

### API Key Exposure
- The current implementation exposes `VITE_RAPIDAPI_KEY` in client-side code
- Anyone inspecting network requests can see the API key
- **Mitigation:** Proxy through a Supabase Edge Function (see Section 8)

### GIF Hosting and Reliability
- V2 GIFs are served from RapidAPI infrastructure; each GIF request counts toward quota
- V1 GIF URLs may change or become unavailable without notice
- GIF files are typically 200KB-1MB, impacting load times on slow connections
- No CDN caching headers on some responses

### Image Sizes
- GIF animations are relatively large files compared to static images
- No built-in support for different quality levels (V1); V2 supports `resolution` parameter (e.g., 360, 480)
- On mobile networks, loading multiple GIFs simultaneously can be slow
- Consider lazy loading and intersection observer patterns

### Rate Limits
- Free tier has strict request limits (~500/month)
- Each exercise lookup + GIF fetch = 2 API calls minimum
- The V1 OSS endpoint may go down or rate-limit aggressively
- Batch fetching is not supported -- each exercise requires a separate API call

### Data Consistency
- Exercise names may not match your app's exercise naming conventions
- Requires a mapping layer (already implemented in `exerciseDbService.ts`)
- Some exercises may not have GIFs or instructions
- V1 and V2 have different data schemas that need normalization

### Search Quality
- Name-based search is fuzzy and may return unexpected results
- No compound search (e.g., cannot search by name AND body part simultaneously)
- Search is case-insensitive but requires close spelling matches

---

## 10. Comparison with Alternatives

### ExerciseDB vs wger API vs API Ninjas

| Feature | ExerciseDB | wger API | API Ninjas |
|---------|-----------|----------|------------|
| **Exercise Count** | 1,300+ (V1) / 11,000+ (V2) | ~400+ | 1,000+ |
| **Animated GIFs** | Yes (every exercise) | No | No |
| **Videos** | Yes (V2 premium) | No | No |
| **Static Images** | Yes (V2 premium) | Limited SVG muscles | No |
| **Instructions** | Yes (step-by-step) | Yes | Yes |
| **Target Muscles** | Yes (primary + secondary) | Yes | Yes (single) |
| **Equipment Filter** | Yes | Yes | Yes |
| **Difficulty Level** | No (V1/V2 RapidAPI) | No | Yes |
| **Exercise Type** | Limited | No | Yes (7 types) |
| **API Key Required** | No (V1) / Yes (V2) | Optional | Yes |
| **Free Tier** | Yes | Yes (fully free) | Yes (limited) |
| **Open Source** | Yes (V1, AGPL-3.0) | Yes (AGPL-3.0) | No |
| **Self-Hostable** | Yes | Yes | No |
| **Nutrition Data** | No | Yes | No |
| **Workout Tracking** | No (data only) | Yes (full app) | No (data only) |
| **Rate Limits** | Strict on free | Generous | Moderate |

### When to Choose Each

- **ExerciseDB:** Best for apps that need animated GIF demonstrations. The visual content is the primary differentiator.
- **wger:** Best for fully open-source projects that need workout tracking + nutrition + exercises without any cost. No GIFs but fully self-hostable.
- **API Ninjas:** Best for simple exercise lookup with difficulty levels and exercise type classification. No visual content.

---

## 11. Code Examples

### Basic Fetch (V2 RapidAPI)

```typescript
const RAPIDAPI_KEY = 'your-key-here'
const BASE_URL = 'https://exercisedb.p.rapidapi.com'

const headers = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
}

// Fetch all exercises (paginated)
const response = await fetch(`${BASE_URL}/exercises?limit=20&offset=0`, { headers })
const exercises = await response.json()

// Search by name
const searchResponse = await fetch(
  `${BASE_URL}/exercises/name/bench%20press?limit=10`,
  { headers }
)
const results = await searchResponse.json()

// Filter by body part
const chestExercises = await fetch(
  `${BASE_URL}/exercises/bodyPart/chest?limit=20`,
  { headers }
).then(r => r.json())

// Filter by target muscle
const absExercises = await fetch(
  `${BASE_URL}/exercises/target/abs?limit=20`,
  { headers }
).then(r => r.json())

// Filter by equipment
const dumbbellExercises = await fetch(
  `${BASE_URL}/exercises/equipment/dumbbell?limit=20`,
  { headers }
).then(r => r.json())

// Get single exercise by ID
const exercise = await fetch(
  `${BASE_URL}/exercises/exercise/0001`,
  { headers }
).then(r => r.json())

// Get reference lists
const bodyParts = await fetch(`${BASE_URL}/exercises/bodyPartList`, { headers }).then(r => r.json())
const targets = await fetch(`${BASE_URL}/exercises/targetList`, { headers }).then(r => r.json())
const equipment = await fetch(`${BASE_URL}/exercises/equipmentList`, { headers }).then(r => r.json())
```

### Basic Fetch (V1 OSS -- No Key)

```typescript
const V1_BASE = 'https://oss.exercisedb.dev/api/v1'

// Search exercises
const response = await fetch(`${V1_BASE}/exercises?search=bench%20press&limit=10`)
const data = await response.json()
const exercises = data.data // V1 wraps results in { data: [...] }
```

### Displaying a GIF in React

```tsx
function ExerciseGif({ exerciseId }: { exerciseId: string }) {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY
  const gifUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=360&rapidapi-key=${apiKey}`

  return (
    <img
      src={gifUrl}
      alt="Exercise demonstration"
      className="w-full max-w-sm rounded-lg"
      loading="lazy"
    />
  )
}
```

### Using the Existing Hook (This Project)

```tsx
import { useExerciseInfo } from '@/hooks/useExerciseGif'

function ExerciseCard({ exerciseName }: { exerciseName: string }) {
  const { exercise, gifUrl, instructions, isLoading } = useExerciseInfo(exerciseName)

  if (isLoading) return <Skeleton />

  return (
    <div>
      {gifUrl && <img src={gifUrl} alt={exercise?.name} loading="lazy" />}
      <h3>{exercise?.name}</h3>
      <p>Target: {exercise?.targetMuscles.join(', ')}</p>
      <p>Equipment: {exercise?.equipments.join(', ')}</p>
      <ul>
        {instructions.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
    </div>
  )
}
```

### TypeScript Types

```typescript
// V2 RapidAPI response shape
interface V2Exercise {
  id: string
  name: string
  bodyPart: string
  target: string
  equipment: string
  secondaryMuscles: string[]
  instructions: string[]
}

// V1 OSS / Normalized shape (used in this project)
interface ExerciseDbExercise {
  exerciseId: string
  name: string
  gifUrl: string
  targetMuscles: string[]
  bodyParts: string[]
  equipments: string[]
  secondaryMuscles: string[]
  instructions: string[]
}
```

---

## 12. Quick Reference

### Headers for V2 RapidAPI Requests

```
X-RapidAPI-Key: {your-api-key}
X-RapidAPI-Host: exercisedb.p.rapidapi.com
```

### Environment Variable

```bash
# .env.local
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
```

### Relevant Project Files

| File | Purpose |
|------|---------|
| `src/services/exerciseDbService.ts` | API service with V2/V1 dual-source, caching, rate limiting |
| `src/hooks/useExerciseGif.ts` | TanStack Query hook (`useExerciseInfo`) |
| `src/services/__tests__/exerciseDbService.test.ts` | Service unit tests |
| `src/hooks/__tests__/useExerciseGif.test.tsx` | Hook unit tests |

### Useful Links

- [ExerciseDB on RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
- [ExerciseDB Pricing](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/pricing)
- [ExerciseDB GitHub](https://github.com/ExerciseDB/exercisedb-api)
- [ExerciseDB V2 Docs](https://v2.exercisedb.io/docs)
- [ExerciseDB V1 Docs](https://www.exercisedb.dev/docs)
- [ExerciseDB API Docs (Railway)](https://edb-docs.up.railway.app/)
- [Dataset Purchase (exercisedb.io)](https://www.exercisedb.io/)
