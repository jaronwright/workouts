# API Ninjas Exercises API - Comprehensive Reference

## 1. Overview

[API Ninjas](https://api-ninjas.com/) is a platform providing a collection of production-ready REST APIs across dozens of categories (finance, text, health, fitness, geography, and more), all accessible with a single API key. Their goal is to provide high-quality data APIs that accelerate product development.

The **Exercises API** specifically provides access to a comprehensive database of over **3,000 exercises** targeting every major muscle group. It allows developers to search, filter, and retrieve detailed exercise data including instructions, difficulty levels, equipment requirements, and safety information. The API is currently used by over 1,400 applications and holds a 4.4/5 rating from nearly 5,000 users.

- **Official Documentation**: https://www.api-ninjas.com/api/exercises
- **Base URL**: `https://api.api-ninjas.com/v1/exercises`
- **API Style**: REST (JSON responses)
- **SDKs Available**: Python, JavaScript, Node.js, Java, Swift

---

## 2. Full Capabilities

### Endpoint 1: `/v1/exercises` (GET) - Free Tier

Returns up to **5 exercises** per request that match the given filter parameters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Exercise name (partial matching supported). E.g., `press` matches "Dumbbell Bench Press". |
| `type` | string | No | Exercise category/type. |
| `muscle` | string | No | Primary muscle group targeted. |
| `difficulty` | string | No | Difficulty level of the exercise. |
| `equipments` | string | No | Equipment required. Comma-separated, supports partial matching. E.g., `dumbbell,flat bench`. |
| `offset` | integer | No | Number of results to skip for pagination. Default: `0`. **Premium only.** |

#### Valid `muscle` Values

| Value | Description |
|-------|-------------|
| `abdominals` | Core / abs |
| `abductors` | Outer thigh muscles |
| `adductors` | Inner thigh muscles |
| `biceps` | Front upper arm |
| `calves` | Lower leg |
| `chest` | Pectoral muscles |
| `forearms` | Lower arm |
| `glutes` | Gluteal muscles |
| `hamstrings` | Back of upper leg |
| `lats` | Latissimus dorsi (back) |
| `lower_back` | Lower back muscles |
| `middle_back` | Middle back / rhomboids |
| `neck` | Neck muscles |
| `quadriceps` | Front of upper leg |
| `traps` | Trapezius (upper back/neck) |
| `triceps` | Back upper arm |

#### Valid `type` Values

| Value | Description |
|-------|-------------|
| `cardio` | Cardiovascular exercises |
| `olympic_weightlifting` | Olympic lifts (clean, snatch, etc.) |
| `plyometrics` | Explosive/jump training |
| `powerlifting` | Squat, bench, deadlift focus |
| `strength` | General strength training |
| `stretching` | Flexibility/stretching exercises |
| `strongman` | Strongman-style movements |

#### Valid `difficulty` Values

| Value | Description |
|-------|-------------|
| `beginner` | Suitable for beginners |
| `intermediate` | Moderate experience required |
| `expert` | Advanced movements |

### Endpoint 2: `/v1/allexercises` (GET) - Premium Only

Returns a comprehensive list of exercise names for a given muscle group. Available only for Business, Professional, Enterprise, or annual subscription plans.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `muscle` | string | Yes | Target muscle group (same values as above). |
| `limit` | integer | No | Maximum results to return. Default: `10`, max: `100`. |
| `offset` | integer | No | Pagination offset. Default: `0`. |

**Note**: This endpoint returns an array of exercise name strings only (not full exercise objects).

---

## 3. Data Structure

### Exercise Object (from `/v1/exercises`)

Each exercise in the response array contains the following fields:

```typescript
interface Exercise {
  name: string;         // Full exercise name (e.g., "Incline Hammer Curls")
  type: string;         // Exercise type (e.g., "strength", "cardio", "stretching")
  muscle: string;       // Primary muscle group targeted (e.g., "biceps")
  difficulty: string;   // Difficulty level ("beginner", "intermediate", "expert")
  instructions: string; // Detailed text instructions for performing the exercise
  equipments: string[]; // Array of required equipment names (e.g., ["dumbbell", "incline bench"])
  safety_info: string;  // Safety precautions and technique cues
}
```

### Example Response

```json
[
  {
    "name": "Incline Hammer Curls",
    "type": "strength",
    "muscle": "biceps",
    "difficulty": "beginner",
    "instructions": "Seat yourself on an incline bench with a dumbbell in each hand. You should be pressed firmly against the back with your feet together. Allow the dumbbells to hang straight down at your side, holding them with a neutral grip. This will be your starting position. Initiate the movement by flexing at the elbow, attempting to keep the upper arm stationary. Continue to the top of the movement and pause, then slowly return to the starting position.",
    "equipments": ["dumbbell", "incline bench"],
    "safety_info": "Keep your upper arms stationary throughout the movement. Avoid swinging or using momentum."
  }
]
```

### Response from `/v1/allexercises` (Premium)

```json
[
  "Incline Hammer Curls",
  "Concentration Curls",
  "Barbell Curl",
  "EZ-Bar Curl",
  "Preacher Curl"
]
```

---

## 4. How to Get API Keys

### Step-by-Step

1. **Navigate to API Ninjas**: Go to [https://api-ninjas.com/register](https://api-ninjas.com/register).
2. **Create a Free Account**: Sign up with your email. Password must contain at least 8 characters and 1 number. No credit card required.
3. **Access Your Dashboard**: After registration and email verification, log into your account.
4. **Find Your API Key**: Your API key is available on your account dashboard. A single key unlocks access to all API Ninjas APIs.
5. **Test Without an Account**: Every API page on api-ninjas.com includes a live demo where you can test queries directly in the browser without needing an API key.

### Managing Your Key

- You can regenerate/change your API key from the dashboard at any time.
- One API key grants access to all API Ninjas APIs (not just Exercises).
- No API input or output data is stored by API Ninjas servers.

---

## 5. Rate Limits and Pricing

### Free Tier

| Feature | Details |
|---------|---------|
| **Cost** | Free (no credit card required) |
| **Results per Request** | Up to 5 exercises per `/v1/exercises` call |
| **Offset/Pagination** | Not available |
| **`/v1/allexercises`** | Not available |
| **Commercial Use** | Not permitted (non-commercial only) |
| **Data Caching/Storing** | Not permitted |
| **Support** | None |
| **Uptime Guarantee** | None |
| **Server Type** | Shared free servers (availability depends on demand) |
| **Attribution** | Required |

### Paid Plans

| Feature | Developer | Business | Professional | Enterprise |
|---------|-----------|----------|--------------|------------|
| **Monthly Price** | $39/mo | $99/mo | $199/mo | Custom |
| **Annual Price** | ~$26/mo | ~$66/mo | ~$133/mo | Custom |
| **API Calls/Month** | 100,000 | 1,000,000 | 10,000,000 | Custom |
| **Rate Limiting** | None | None | None | None |
| **Commercial Use** | Yes | Yes | Yes | Yes |
| **Data Caching/Storing** | No | Yes | Yes | Yes |
| **Offset/Pagination** | Yes | Yes | Yes | Yes |
| **`/v1/allexercises`** | No | Yes | Yes | Yes |
| **Support** | Standard | Priority | Priority | Dedicated |
| **Uptime SLA** | 99% | 99.95% | 99.95% | 99.99% |
| **Server Type** | Shared premium | Shared premium | Private | Private |
| **Analytics API** | No | No | Yes | Yes |
| **Attribution** | Not required | Not required | Not required | Not required |

### Performance Metrics

| Metric | Value |
|--------|-------|
| Average Response | 268ms |
| P50 | 290ms |
| P75 | 330ms |
| P90 | 624ms |
| P95 | 1,026ms |

---

## 6. Authentication

All API requests require the `X-Api-Key` header:

```
X-Api-Key: YOUR_API_KEY
```

### Example with cURL

```bash
curl -X GET "https://api.api-ninjas.com/v1/exercises?muscle=biceps" \
  -H "X-Api-Key: YOUR_API_KEY"
```

### Example with JavaScript Fetch

```javascript
const response = await fetch(
  'https://api.api-ninjas.com/v1/exercises?muscle=biceps',
  {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' },
  }
);
const exercises = await response.json();
```

**Important**: Never expose your API key in client-side code. Use a server-side proxy or Supabase Edge Function (see Section 8).

---

## 7. Integration Ideas for a Workout Tracker PWA

### Exercise Search by Muscle Group
Allow users to browse exercises filtered by the muscle group they want to train. When selecting a workout day targeting "chest," fetch all chest exercises to populate options.

### Difficulty-Based Exercise Recommendations
Recommend exercises based on user experience level. New users see beginner exercises; experienced users see expert movements. Could tie into user profile settings.

### Exercise Type Filtering
Let users filter between strength, cardio, stretching, and other types. Useful for building balanced workout plans that include warm-up stretches, main lifts, and cardio finishers.

### Display Detailed Text Instructions During Workouts
Show step-by-step instructions for each exercise during an active workout session. The `instructions` field provides clear guidance, and `safety_info` helps users maintain proper form.

### Exercise Discovery and Exploration
Build a searchable exercise library where users can explore new movements. The `name` parameter's partial matching makes search intuitive (typing "curl" shows all curl variations).

### Suggest Alternative Exercises by Same Muscle Group
When a user lacks equipment for a planned exercise, suggest alternatives targeting the same muscle group. Query the API with the same `muscle` parameter to find substitutes.

### Populate Exercise Database for Custom Workout Builder
Allow users to build fully custom workout plans by searching the API's 3,000+ exercise database. Users pick exercises, set their own rep/set schemes, and save custom templates.

### Equipment-Based Filtering
Users can specify what equipment they have available (e.g., "dumbbell,barbell") and get exercises matching their setup. Useful for home gym users with limited equipment.

---

## 8. Technical Integration Plan (React/Supabase)

### Service File: `apiNinjasService.ts`

```typescript
// src/services/apiNinjasService.ts

const API_BASE_URL = 'https://api.api-ninjas.com/v1';

export interface ApiNinjasExercise {
  name: string;
  type: string;
  muscle: string;
  difficulty: string;
  instructions: string;
  equipments: string[];
  safety_info: string;
}

export type MuscleGroup =
  | 'abdominals' | 'abductors' | 'adductors' | 'biceps'
  | 'calves' | 'chest' | 'forearms' | 'glutes'
  | 'hamstrings' | 'lats' | 'lower_back' | 'middle_back'
  | 'neck' | 'quadriceps' | 'traps' | 'triceps';

export type ExerciseType =
  | 'cardio' | 'olympic_weightlifting' | 'plyometrics'
  | 'powerlifting' | 'strength' | 'stretching' | 'strongman';

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

interface ExerciseSearchParams {
  name?: string;
  type?: ExerciseType;
  muscle?: MuscleGroup;
  difficulty?: Difficulty;
  equipments?: string;
  offset?: number;
}

export async function searchExercises(
  params: ExerciseSearchParams
): Promise<ApiNinjasExercise[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value));
  });

  const response = await fetch(
    `${API_BASE_URL}/exercises?${searchParams.toString()}`,
    {
      headers: { 'X-Api-Key': import.meta.env.VITE_API_NINJAS_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`API Ninjas error: ${response.status}`);
  }

  return response.json();
}
```

### API Key Management: Supabase Edge Function Proxy (Recommended)

To avoid exposing the API key in client-side code, proxy requests through a Supabase Edge Function:

```typescript
// supabase/functions/exercises-search/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { muscle, type, difficulty, name, offset } = await req.json();

  const params = new URLSearchParams();
  if (muscle) params.append('muscle', muscle);
  if (type) params.append('type', type);
  if (difficulty) params.append('difficulty', difficulty);
  if (name) params.append('name', name);
  if (offset) params.append('offset', String(offset));

  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?${params.toString()}`,
    {
      headers: {
        'X-Api-Key': Deno.env.get('API_NINJAS_KEY') ?? '',
      },
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Then call from the client:

```typescript
// src/services/apiNinjasService.ts (proxy version)
import { supabase } from '@/lib/supabase';

export async function searchExercises(
  params: ExerciseSearchParams
): Promise<ApiNinjasExercise[]> {
  const { data, error } = await supabase.functions.invoke('exercises-search', {
    body: params,
  });

  if (error) throw error;
  return data;
}
```

### Caching with TanStack Query

Exercises are essentially static data, so aggressive caching is appropriate:

```typescript
// src/hooks/useExerciseSearch.ts
import { useQuery } from '@tanstack/react-query';
import { searchExercises, type ExerciseSearchParams } from '@/services/apiNinjasService';

export function useExerciseSearch(params: ExerciseSearchParams) {
  return useQuery({
    queryKey: ['exercises', params],
    queryFn: () => searchExercises(params),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (exercises don't change)
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
    enabled: Object.values(params).some(Boolean), // Only fetch if at least one param is set
  });
}
```

### Seed Supabase Database for Offline Access

For a PWA that needs offline support, seed exercises into your own Supabase table:

```sql
-- Migration: Create exercises table
CREATE TABLE IF NOT EXISTS exercises_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  muscle TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  instructions TEXT NOT NULL,
  equipments TEXT[] DEFAULT '{}',
  safety_info TEXT DEFAULT '',
  source TEXT DEFAULT 'api_ninjas',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_muscle ON exercises_library(muscle);
CREATE INDEX idx_exercises_type ON exercises_library(type);
CREATE INDEX idx_exercises_difficulty ON exercises_library(difficulty);

-- RLS: Allow all authenticated users to read
ALTER TABLE exercises_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises are readable by all authenticated users"
  ON exercises_library FOR SELECT
  TO authenticated
  USING (true);
```

Seed script (run once with premium API access for pagination):

```typescript
// scripts/seedExercises.ts
const MUSCLES = [
  'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
  'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
  'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps',
];

async function seedAllExercises() {
  for (const muscle of MUSCLES) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const exercises = await searchExercises({ muscle, offset });

      if (exercises.length === 0) {
        hasMore = false;
        break;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('exercises_library')
        .upsert(
          exercises.map((ex) => ({
            name: ex.name,
            type: ex.type,
            muscle: ex.muscle,
            difficulty: ex.difficulty,
            instructions: ex.instructions,
            equipments: ex.equipments,
            safety_info: ex.safety_info,
          })),
          { onConflict: 'name' }
        );

      if (error) console.error(`Error seeding ${muscle}:`, error);

      offset += exercises.length;
      // Respect rate limits
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
```

### Integration with Existing Exercise Data Model

The workout tracker already has `plan_exercises` tied to `exercise_sections` within `workout_days`. API Ninjas exercises can augment this by:

1. **Linking by name**: Match `plan_exercises.name` against `exercises_library.name` for instructions lookup.
2. **Exercise picker**: When adding exercises to a custom plan, search the `exercises_library` table.
3. **Fallback**: If an exercise is not in the library, display it without instructions (graceful degradation).

---

## 9. Comparison with ExerciseDB and wger

| Feature | API Ninjas | ExerciseDB | wger |
|---------|-----------|------------|------|
| **Exercise Count** | 3,000+ | 1,300+ (open source) | 800+ |
| **GIFs/Images** | No | Yes (GIFs for every exercise) | Yes (images, community-contributed) |
| **Video** | No | Yes | No |
| **Text Instructions** | Yes (detailed) | Yes | Yes |
| **Safety Info** | Yes | No | No |
| **Difficulty Levels** | Yes (beginner/intermediate/expert) | No | No |
| **Exercise Types** | Yes (7 categories) | No (body part focus) | Yes (limited) |
| **Equipment Filter** | Yes | Yes | Yes |
| **Muscle Group Filter** | Yes (16 groups) | Yes (by body part + target muscle) | Yes |
| **Authentication** | API key (header) | API key (RapidAPI) | Token-based / open |
| **Open Source** | No | Yes (v1) | Yes (AGPL) |
| **Self-Hostable** | No | Yes | Yes |
| **Free Tier** | Yes (limited) | Yes (open source v1) | Yes (fully free) |
| **Pricing** | $39-$199+/mo | Free (open source) | Free |
| **Offline/Caching Rights** | Paid plans only | Open source | Open source |

### Pros of API Ninjas

- **Difficulty levels**: Only API Ninjas categorizes exercises by beginner/intermediate/expert, enabling personalized recommendations.
- **Exercise type taxonomy**: Seven distinct categories (strength, cardio, plyometrics, etc.) allow fine-grained filtering that other APIs lack.
- **Safety information**: The `safety_info` field provides technique cues and injury prevention guidance not found in other APIs.
- **Detailed text instructions**: Comprehensive, well-written step-by-step instructions for each exercise.
- **Large database**: Over 3,000 exercises is the largest among these three APIs.
- **Simple authentication**: Single API key, no OAuth flow required.
- **Equipment filtering with partial matching**: Flexible search by equipment names.

### Cons of API Ninjas

- **No visual media**: No GIFs, images, or videos. Text-only instructions.
- **Free tier limitations**: Only 5 results per request, no pagination, no commercial use.
- **Closed source**: Cannot self-host or inspect the data.
- **Paid for production use**: Commercial use requires at minimum the Developer plan ($39/mo).
- **Data caching restrictions**: Free and Developer plans prohibit caching/storing data locally.

### Best Strategy: Use Alongside Visual APIs

API Ninjas excels at structured metadata (difficulty, type, safety info) while ExerciseDB provides visual content. The ideal approach is to:

1. Use **ExerciseDB** for GIFs and visual exercise demonstrations.
2. Use **API Ninjas** for difficulty classification, exercise type taxonomy, and detailed text instructions/safety info.
3. Use **wger** as a fallback open-source option that can be self-hosted.
4. Match exercises across APIs by name for a comprehensive dataset.

---

## 10. Limitations

### No Visual Media
The API provides text-only content. There are no exercise GIFs, images, demonstration videos, or diagrams. For a workout app, you will need to supplement with a visual API (like ExerciseDB) or your own media assets.

### Free Tier Constraints
- Maximum of **5 results** per request on `/v1/exercises`.
- **No pagination** (offset parameter is premium-only).
- **No access** to `/v1/allexercises` endpoint.
- **Non-commercial use only** -- cannot be used in production apps.
- **No data caching/storing** -- must query the API each time.
- **No uptime guarantee** -- shared free servers may have availability issues.

### Data Caching Restrictions
Even the Developer plan ($39/mo) prohibits caching or storing API data. Only Business ($99/mo) and above allow you to persist data in your own database for offline access.

### Text Instructions Quality
While instructions are generally detailed, they are plain text without formatting, bullet points, or step numbers. You may need to parse and format them for better UI presentation.

### Single Muscle Group per Exercise
Each exercise only lists one primary muscle group. Secondary/synergist muscles are not included, which limits the ability to show compound movement muscle engagement.

### No Exercise Relationships
The API does not provide data about exercise progressions, variations, or alternatives. Building "similar exercises" features requires your own logic (e.g., same muscle + same type).

### Rate Limits on Free Tier
While paid plans advertise "no rate limiting," the free tier runs on shared servers with finite capacity. High-traffic periods may result in slower responses or temporary unavailability.

---

## 11. Code Examples

### Basic: Fetch Exercises by Muscle Group

```typescript
async function getExercisesByMuscle(muscle: string) {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`,
    { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
  );
  return response.json();
}

// Usage
const bicepExercises = await getExercisesByMuscle('biceps');
console.log(bicepExercises);
```

### Filter by Difficulty

```typescript
async function getBeginnerExercises(muscle: string) {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}&difficulty=beginner`,
    { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
  );
  return response.json();
}

// Get beginner chest exercises
const beginnerChest = await getBeginnerExercises('chest');
```

### Filter by Exercise Type

```typescript
async function getStretchingExercises() {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?type=stretching`,
    { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
  );
  return response.json();
}
```

### Combine Multiple Filters

```typescript
async function getFilteredExercises(
  muscle: string,
  difficulty: string,
  type: string
) {
  const params = new URLSearchParams({ muscle, difficulty, type });
  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?${params.toString()}`,
    { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
  );
  return response.json();
}

// Get beginner strength exercises for chest
const results = await getFilteredExercises('chest', 'beginner', 'strength');
```

### Search by Exercise Name (Partial Match)

```typescript
async function searchByName(query: string) {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(query)}`,
    { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
  );
  return response.json();
}

// Partial match: "press" will match "Bench Press", "Overhead Press", etc.
const pressExercises = await searchByName('press');
```

### Filter by Equipment

```typescript
async function getExercisesByEquipment(equipment: string) {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/exercises?equipments=${encodeURIComponent(equipment)}`,
    { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
  );
  return response.json();
}

// Find exercises using dumbbells
const dumbbellExercises = await getExercisesByEquipment('dumbbell');

// Find exercises using multiple pieces of equipment
const benchDumbbell = await getExercisesByEquipment('dumbbell,flat bench');
```

### React Hook with TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';

interface UseExerciseSearchOptions {
  muscle?: string;
  type?: string;
  difficulty?: string;
  name?: string;
  enabled?: boolean;
}

export function useExerciseSearch({
  muscle,
  type,
  difficulty,
  name,
  enabled = true,
}: UseExerciseSearchOptions) {
  return useQuery({
    queryKey: ['api-ninjas-exercises', { muscle, type, difficulty, name }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (muscle) params.append('muscle', muscle);
      if (type) params.append('type', type);
      if (difficulty) params.append('difficulty', difficulty);
      if (name) params.append('name', name);

      const response = await fetch(
        `https://api.api-ninjas.com/v1/exercises?${params.toString()}`,
        { headers: { 'X-Api-Key': import.meta.env.VITE_API_NINJAS_KEY } }
      );

      if (!response.ok) throw new Error('Failed to fetch exercises');
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    enabled,
  });
}
```

### cURL Examples

```bash
# Get exercises by muscle group
curl -X GET "https://api.api-ninjas.com/v1/exercises?muscle=biceps" \
  -H "X-Api-Key: YOUR_API_KEY"

# Get beginner exercises
curl -X GET "https://api.api-ninjas.com/v1/exercises?difficulty=beginner" \
  -H "X-Api-Key: YOUR_API_KEY"

# Combine filters: intermediate strength exercises for chest
curl -X GET "https://api.api-ninjas.com/v1/exercises?muscle=chest&type=strength&difficulty=intermediate" \
  -H "X-Api-Key: YOUR_API_KEY"

# Search by name (partial match)
curl -X GET "https://api.api-ninjas.com/v1/exercises?name=deadlift" \
  -H "X-Api-Key: YOUR_API_KEY"

# Filter by equipment
curl -X GET "https://api.api-ninjas.com/v1/exercises?equipments=barbell" \
  -H "X-Api-Key: YOUR_API_KEY"

# Premium: Get all exercise names for a muscle with pagination
curl -X GET "https://api.api-ninjas.com/v1/allexercises?muscle=quadriceps&limit=50&offset=0" \
  -H "X-Api-Key: YOUR_API_KEY"
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Base URL | `https://api.api-ninjas.com/v1/exercises` |
| Auth Header | `X-Api-Key: YOUR_API_KEY` |
| Free Results/Request | 5 |
| Premium Results/Request | Up to 100 (via `/v1/allexercises`) |
| Total Exercises | 3,000+ |
| Muscle Groups | 16 |
| Exercise Types | 7 |
| Difficulty Levels | 3 |
| Avg Response Time | 268ms |
| Docs | https://www.api-ninjas.com/api/exercises |
| Pricing | https://api-ninjas.com/pricing |
| Sign Up | https://api-ninjas.com/register |
