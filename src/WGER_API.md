# wger Workout Manager API Reference

## 1. Overview

[wger](https://wger.de/) (pronounced "veh-gehr") is a free, open-source web application for managing workouts, nutrition, and body measurements. It is built with Django/Python and provides a comprehensive REST API that can be used by third-party applications.

**Key facts:**
- **License:** AGPL-3.0 (code), Creative Commons (exercise/ingredient data), CC-BY-SA-4.0 (docs)
- **Public API:** `https://wger.de/api/v2/`
- **Source code:** [github.com/wger-project/wger](https://github.com/wger-project/wger)
- **Documentation:** [wger.readthedocs.io](https://wger.readthedocs.io/en/latest/)
- **OpenAPI schema:** `https://wger.de/api/v2/schema`
- **Swagger UI:** `https://wger.de/api/v2/schema/ui`
- **Redoc:** `https://wger.de/api/v2/schema/redoc`
- **Current version:** 2.5
- **Tech stack:** Python/Django, Django REST Framework, PostgreSQL, Redis, Celery
- **Contributors:** 232+ contributors, 8,500+ commits
- **Apps:** Web, Android, iOS, F-Droid, Flathub

---

## 2. Full API Capabilities

All endpoints are prefixed with `/api/v2/`. The API is RESTful and returns JSON by default.

### 2.1 Exercise Database (Public - No Auth Required)

| Endpoint | Method | Description |
|---|---|---|
| `/exercise/` | GET | List all exercises (base objects with muscle/equipment IDs) |
| `/exerciseinfo/{id}/` | GET | Full exercise details with nested translations, images, muscles, equipment |
| `/exercise-translation/` | GET | Exercise names and descriptions in specific languages |
| `/exerciseimage/` | GET | Exercise demonstration images |
| `/video/` | GET | Exercise demonstration videos (H.265/HEVC) |
| `/exercisecomment/` | GET | Community comments on exercises |
| `/exercisealias/` | GET | Alternative names for exercises |
| `/exercisecategory/` | GET | Exercise categories (Abs, Arms, Back, etc.) |
| `/muscle/` | GET | Muscle definitions with SVG image URLs |
| `/equipment/` | GET | Equipment types (Barbell, Dumbbell, etc.) |
| `/variation/` | GET | Exercise variation groupings |
| `/exercise/search/` | GET | Search exercises by name with autocomplete |
| `/deletion-log/` | GET | Log of deleted exercises (for sync) |
| `/language/` | GET | Supported languages for translations |
| `/license/` | GET | Content licenses |

### 2.2 Workout Routines (Auth Required)

| Endpoint | Method | Description |
|---|---|---|
| `/routine/` | GET, POST | User workout routines with name, description, dates |
| `/day/` | GET, POST | Days within a routine (supports custom, EMOM, AMRAP, HIIT, Tabata, EDT, RFT, AFAP) |
| `/slot/` | GET, POST | Exercise slots within a day |
| `/slot-entry/` | GET, POST | Exercises within a slot (multiple entries = supersets) |
| `/templates/` | GET, POST | User workout templates |
| `/public-templates/` | GET | Community-shared workout templates |

### 2.3 Progressive Overload Configuration (Auth Required)

Each has both a base config and a max config endpoint:

| Endpoint | Description |
|---|---|
| `/weight-config/`, `/max-weight-config/` | Weight progression rules |
| `/repetitions-config/`, `/max-repetitions-config/` | Rep progression rules |
| `/sets-config/`, `/max-sets-config/` | Set count progression rules |
| `/rest-config/`, `/max-rest-config/` | Rest period progression rules |
| `/rir-config/`, `/max-rir-config/` | Reps-in-reserve progression rules |

Each config supports:
- `iteration`: Which cycle iteration the rule applies to
- `operation`: `+` (increase), `-` (decrease), or `replace`
- `step`: Amount to change (absolute or percentage)
- `repeat`: Whether to repeat the rule on subsequent iterations

### 2.4 Routine Result Endpoints (Auth Required)

| Endpoint | Description |
|---|---|
| `/routine/{id}/date-sequence-display/` | Frontend-optimized grouped workout data |
| `/routine/{id}/date-sequence-gym/` | Gym mode with interleaved supersets |
| `/routine/{id}/structure/` | Raw routine architecture |
| `/routine/{id}/logs/` | Session history and statistics |

### 2.5 Workout Logging (Auth Required)

| Endpoint | Method | Description |
|---|---|---|
| `/workoutlog/` | GET, POST | Individual exercise log entries (weight, reps, sets, date) |
| `/workoutsession/` | GET, POST | Workout session metadata (date, impression, notes) |

### 2.6 Nutrition (Auth Required, Ingredients Public)

| Endpoint | Method | Description |
|---|---|---|
| `/nutritionplan/` | GET, POST | Nutrition plans |
| `/nutritionplaninfo/` | GET | Detailed plan info with computed nutritional values |
| `/meal/` | GET, POST | Meals within a plan |
| `/mealitem/` | GET, POST | Food items within a meal |
| `/nutritiondiary/` | GET, POST | Daily nutrition log entries |
| `/ingredient/` | GET | Ingredient database (public, from Open Food Facts) |
| `/ingredientinfo/{id}/` | GET | Full ingredient details with nutritional values |
| `/ingredient-image/` | GET | Ingredient images |
| `/weightunit/` | GET | Weight units (g, oz, etc.) |
| `/ingredientweightunit/` | GET | Ingredient-specific weight units |

### 2.7 Body Tracking (Auth Required)

| Endpoint | Method | Description |
|---|---|---|
| `/weight-entry/` | GET, POST | Body weight entries with date |
| `/measurement-category/` | GET, POST | Measurement categories (biceps, chest, waist, etc.) |
| `/measurement/` | GET, POST | Individual measurements linked to categories |

### 2.8 User & Profile (Auth Required)

| Endpoint | Method | Description |
|---|---|---|
| `/userprofile/` | GET, PATCH | User profile data |
| `/user-statistics/` | GET | Computed user statistics |
| `/user-trophy/` | GET | Achievement trophies |
| `/gallery/` | GET, POST | Progress photo gallery |

### 2.9 Reference Data (Public)

| Endpoint | Description |
|---|---|
| `/setting-repetitionunit/` | Repetition unit types (reps, seconds, minutes, etc.) |
| `/setting-weightunit/` | Weight unit types (kg, lb, plates, etc.) |
| `/trophy/` | Trophy definitions |

---

## 3. Data Structures

### 3.1 Exercise Object (`/exercise/`)

```json
{
  "id": 9,
  "uuid": "1b020b3a-3732-4c7e-92fd-a0cec90ed69b",
  "created": "2023-08-06T10:17:17.422900+02:00",
  "last_update": "2024-01-17T11:39:48.517525+01:00",
  "category": 10,
  "muscles": [8],
  "muscles_secondary": [],
  "equipment": [10],
  "variations": 47,
  "license_author": "deusinvictus"
}
```

### 3.2 Exercise Info Object (`/exerciseinfo/{id}/`)

The enriched view with all nested data:

```json
{
  "id": 9,
  "uuid": "...",
  "created": "...",
  "last_update": "...",
  "last_update_global": "...",
  "category": {
    "id": 10,
    "name": "Abs"
  },
  "muscles": [
    { "id": 6, "name": "Rectus abdominis", "name_en": "Abs", "is_front": true,
      "image_url_main": "/static/images/muscles/main/muscle-6.svg",
      "image_url_secondary": "/static/images/muscles/secondary/muscle-6.svg" }
  ],
  "muscles_secondary": [],
  "equipment": [
    { "id": 10, "name": "Kettlebell" }
  ],
  "license": {
    "id": 2,
    "full_name": "Creative Commons Attribution Share Alike 4",
    "short_name": "CC-BY-SA 4",
    "url": "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
  },
  "license_author": "...",
  "images": [
    {
      "id": 1,
      "uuid": "...",
      "exercise": 9,
      "image": "https://wger.de/media/exercise-images/9/image.jpg",
      "is_main": true,
      "style": 2,
      "license": 2,
      "license_title": "CC-BY-SA 4",
      "license_author": "..."
    }
  ],
  "translations": [
    {
      "id": 100,
      "uuid": "...",
      "name": "Exercise Name",
      "exercise": 9,
      "description": "<p>Exercise instructions...</p>",
      "language": 2,
      "aliases": [],
      "notes": [],
      "license": 2,
      "license_author": "..."
    }
  ],
  "variations": 47,
  "videos": [
    {
      "id": 1,
      "uuid": "...",
      "exercise": 9,
      "video": "https://wger.de/media/exercise-video/9/video.mp4",
      "is_main": true,
      "size": 1234567,
      "duration": "15",
      "width": 1920,
      "height": 1080,
      "codec": "hevc",
      "codec_long": "H.265 / HEVC (High Efficiency Video Coding)"
    }
  ],
  "author_history": [],
  "total_authors_history": []
}
```

### 3.3 Exercise Translation (`/exercise-translation/`)

```json
{
  "id": 2433,
  "uuid": "...",
  "name": "Bench Press",
  "exercise": 192,
  "description": "<p>Lie on a flat bench...</p>",
  "created": "2023-08-06T...",
  "language": 2,
  "aliases": [
    { "id": 1, "alias": "Flat Bench" }
  ],
  "notes": [
    { "id": 1, "comment": "Keep elbows at 45 degrees" }
  ],
  "license": 2,
  "license_title": "CC-BY-SA 4",
  "license_author": "..."
}
```

### 3.4 Muscle Object (`/muscle/`)

```json
{
  "id": 4,
  "name": "Pectoralis major",
  "name_en": "Chest",
  "is_front": true,
  "image_url_main": "/static/images/muscles/main/muscle-4.svg",
  "image_url_secondary": "/static/images/muscles/secondary/muscle-4.svg"
}
```

### 3.5 Exercise Search Response (`/exercise/search/?term=...`)

```json
{
  "suggestions": [
    {
      "value": "Bench Press",
      "data": {
        "id": 2433,
        "base_id": 192,
        "name": "Bench Press",
        "category": "Chest",
        "image": "https://wger.de/media/exercise-images/192/image.jpg",
        "image_thumbnail": "https://wger.de/media/exercise-images/192/thumb.jpg"
      }
    }
  ]
}
```

### 3.6 Exercise Video (`/video/`)

```json
{
  "id": 1,
  "uuid": "...",
  "exercise": 9,
  "exercise_uuid": "...",
  "video": "https://wger.de/media/exercise-video/9/video.mp4",
  "is_main": true,
  "size": 1234567,
  "duration": "15",
  "width": 1920,
  "height": 1080,
  "codec": "hevc",
  "codec_long": "H.265 / HEVC (High Efficiency Video Coding)"
}
```

### 3.7 Routine Structure (Authenticated)

```
Routine
  -> Day (type: custom | emom | amrap | hiit | tabata | edt | rft | afap)
    -> Slot
      -> Slot Entry (exercise + config)
        -> Weight Config (progression rules)
        -> Reps Config (progression rules)
        -> Sets Config (progression rules)
        -> Rest Config (progression rules)
        -> RIR Config (progression rules)
```

---

## 4. Authentication

### 4.1 JWT Tokens (Recommended)

**Obtain tokens:**
```bash
curl -X POST https://wger.de/api/v2/token \
  -H "Content-Type: application/json" \
  -d '{"username": "your_user", "password": "your_pass"}'
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Use access token in requests:**
```bash
curl https://wger.de/api/v2/routine/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Refresh expired access token:**
```bash
curl -X POST https://wger.de/api/v2/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJhbGciOiJIUzI1NiIs..."}'
```

**Verify token validity:**
```bash
curl -X POST https://wger.de/api/v2/token/verify/ \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJhbGciOiJIUzI1NiIs..."}'
```

### 4.2 Permanent API Token (Deprecated)

Generate from the web UI at `/en/user/api-key` or via the login endpoint:

```bash
curl -X POST https://wger.de/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_user", "password": "your_pass"}'
```

**Use in requests:**
```bash
curl https://wger.de/api/v2/routine/ \
  -H "Authorization: Token abc123def456..."
```

### 4.3 Public Endpoints (No Auth)

The following can be accessed without any authentication:
- Exercise database (`/exercise/`, `/exerciseinfo/`, `/exercise-translation/`)
- Exercise images and videos (`/exerciseimage/`, `/video/`)
- Exercise metadata (`/exercisecategory/`, `/muscle/`, `/equipment/`, `/variation/`)
- Exercise search (`/exercise/search/`)
- Ingredients (`/ingredient/`, `/ingredientinfo/`)
- Languages (`/language/`)
- Licenses (`/license/`)
- Reference units (`/setting-repetitionunit/`, `/setting-weightunit/`)

---

## 5. How to Get API Access

### Option 1: Public API (No Key Needed for Reads)

The public instance at `https://wger.de/api/v2/` allows read access to the entire exercise database, ingredients, and reference data without any authentication. Just make HTTP requests directly.

### Option 2: Create a Free Account

1. Go to [wger.de](https://wger.de/) and create a free account
2. Navigate to `/en/user/api-key` to generate a permanent API token
3. Or use the `/api/v2/token` endpoint with your credentials for JWT tokens
4. Use your token to access user-specific endpoints (routines, logs, nutrition, etc.)

### Option 3: Self-Host for Full Control

Clone the [docker repository](https://github.com/wger-project/docker) and run `docker compose up -d`. This gives you:
- Unlimited API access with no rate limits
- Full admin control
- Custom exercise database
- Private user data
- No dependency on external services

**No RapidAPI or third-party API marketplace dependency.** The API is served directly by the wger application.

---

## 6. Rate Limits

### Public API (wger.de)

The wger API uses Django REST Framework's throttling. The exact rates for the public instance are not prominently documented, but the framework supports:
- **Anonymous requests:** Throttled by IP address
- **Authenticated requests:** Higher limits, throttled by user

Based on DRF defaults and typical Django configurations, expect:
- Anonymous: ~100 requests/hour (conservative estimate)
- Authenticated: ~1000 requests/hour (conservative estimate)

**Best practices for the public API:**
- Cache exercise data locally (it changes infrequently)
- Use pagination (`?limit=100`) to reduce request count
- Batch requests where possible
- Use the `deletion-log` endpoint for incremental sync instead of full re-fetches

### Self-Hosted Instance

No rate limits. You control the Django settings entirely. Throttling can be configured in `settings.py` via Django REST Framework's `DEFAULT_THROTTLE_RATES`.

---

## 7. Pricing

| Tier | Cost | Details |
|---|---|---|
| Public API (read-only exercise/ingredient data) | Free | No account needed |
| Free account on wger.de | Free | Full API access for personal data |
| Self-hosted instance | Free | AGPL-3.0 license, you provide hosting |

**wger is 100% free and open source.** There are no paid tiers, no premium features, and no API key marketplace.

---

## 8. Query Parameters

### Pagination

```
GET /api/v2/exercise/?limit=50&offset=100
```

- `limit`: Number of results per page (default: 20)
- `offset`: Number of results to skip
- Response includes `count`, `next`, and `previous` fields

### Filtering

```
GET /api/v2/exercise/?category=11&equipment=1&language=2
GET /api/v2/exercise-translation/?language=2
```

- Filter by any field using query parameters
- Multiple filters are AND-joined
- Boolean values must be `True` or `False` (capitalized)
- OR filtering is not supported

### Ordering

```
GET /api/v2/exercise/?ordering=category
GET /api/v2/exercise/?ordering=-created,category
```

- Prefix with `-` for descending order
- Comma-separate multiple fields

### Format

```
GET /api/v2/exercise/?format=json
GET /api/v2/exercise/?format=api
GET /api/v2/exercise/.json
```

- `json`: Standard JSON response
- `api`: Browsable HTML API interface

---

## 9. Reference Data

### Exercise Categories (8 total)

| ID | Name |
|---|---|
| 10 | Abs |
| 8 | Arms |
| 12 | Back |
| 14 | Calves |
| 15 | Cardio |
| 11 | Chest |
| 9 | Legs |
| 13 | Shoulders |

### Equipment Types (11 total)

| ID | Name |
|---|---|
| 1 | Barbell |
| 2 | SZ-Bar |
| 3 | Dumbbell |
| 4 | Gym mat |
| 5 | Swiss Ball |
| 6 | Pull-up bar |
| 7 | none (bodyweight) |
| 8 | Bench |
| 9 | Incline bench |
| 10 | Kettlebell |
| 11 | Resistance band |

### Muscles (15 total)

| ID | Name | English Name | Front/Back |
|---|---|---|---|
| 1 | Biceps brachii | Biceps | Front |
| 2 | Anterior deltoid | Shoulders | Front |
| 3 | Serratus anterior | - | Front |
| 4 | Pectoralis major | Chest | Front |
| 5 | Triceps brachii | Triceps | Back |
| 6 | Rectus abdominis | Abs | Front |
| 7 | Gastrocnemius | Calves | Back |
| 8 | Gluteus maximus | Glutes | Back |
| 9 | Trapezius | - | Back |
| 10 | Quadriceps femoris | Quads | Front |
| 11 | Biceps femoris | Hamstrings | Back |
| 12 | Latissimus dorsi | Lats | Back |
| 13 | Brachialis | - | Front |
| 14 | Obliquus externus abdominis | - | Front |
| 15 | Soleus | - | Back |

### Supported Languages (30 total, notable ones)

| ID | Code | Language |
|---|---|---|
| 2 | en | English |
| 1 | de | German |
| 4 | es | Spanish |
| 12 | fr | French |
| 13 | it | Italian |
| 7 | pt | Portuguese |
| 6 | nl | Dutch |
| 14 | pl | Polish |
| 16 | tr | Turkish |
| 9 | cs | Czech |
| 8 | el | Greek |
| 10 | sv | Swedish |
| 11 | no | Norwegian |
| 22 | hr | Croatian |
| 23 | id | Indonesian |

---

## 10. Integration Ideas for a Workout Tracker PWA

### 10.1 Free Exercise Database with Images and Muscle Maps

Replace or supplement a paid exercise API (like ExerciseDB on RapidAPI) with wger's free exercise database:
- 800+ exercises with community-contributed descriptions
- 300+ exercise images (photos, not animated GIFs)
- Exercise videos in H.265/HEVC format
- All under Creative Commons licensing

### 10.2 Multi-Language Exercise Names

Support international users with exercise translations in 30 languages. Use the `language` parameter to filter translations:
```
GET /api/v2/exercise-translation/?language=4  (Spanish)
```

### 10.3 Muscle Group Visualization (SVG Muscle Maps)

Each muscle object includes SVG image URLs for front and back body views:
- `image_url_main`: Highlighted muscle on body outline
- `image_url_secondary`: Secondary muscle highlight
- `is_front`: Boolean to determine front vs. back body placement

Combine these SVGs to create interactive muscle targeting displays showing which muscles a workout hits.

### 10.4 Exercise Search and Discovery

The `/exercise/search/` endpoint provides autocomplete-ready results:
- Returns exercise name, category, image, and thumbnail
- Filter by category, equipment, or muscle group
- Build exercise discovery features (browse by muscle, equipment, or category)

### 10.5 Nutrition Tracking Integration

Leverage the ingredient database (sourced from Open Food Facts) for:
- Food search and nutritional information
- Meal planning with macro breakdowns
- Daily nutrition diary logging

### 10.6 Body Measurement Tracking

User-defined measurement categories (biceps, chest, waist, thighs, etc.) with dated entries for tracking body composition changes over time.

### 10.7 Import/Export Workout Plans

Use the routine and template endpoints to:
- Share workout plans between users via public templates
- Import community-created workout routines
- Export user routines as structured data

### 10.8 Offline Exercise Database Sync

Use the `deletion-log` endpoint for incremental sync:
1. Initial sync: Fetch all exercises and cache locally
2. Subsequent syncs: Check `deletion-log` and `last_update` for changes
3. Store exercise data in Supabase for offline access

---

## 11. Technical Integration Plan (React/Supabase)

### 11.1 Service File: `wgerService.ts`

```typescript
// src/services/wgerService.ts

const WGER_BASE_URL = 'https://wger.de/api/v2';

interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface WgerExercise {
  id: number;
  uuid: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  variations: number | null;
  created: string;
  last_update: string;
}

interface WgerExerciseTranslation {
  id: number;
  uuid: string;
  name: string;
  exercise: number;
  description: string;
  language: number;
  aliases: Array<{ id: number; alias: string }>;
  notes: Array<{ id: number; comment: string }>;
}

interface WgerMuscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
}

interface WgerExerciseImage {
  id: number;
  uuid: string;
  exercise: number;
  exercise_uuid: string;
  image: string;
  is_main: boolean;
  style: number;
}

interface WgerExerciseCategory {
  id: number;
  name: string;
}

interface WgerEquipment {
  id: number;
  name: string;
}

interface WgerSearchSuggestion {
  value: string;
  data: {
    id: number;
    base_id: number;
    name: string;
    category: string;
    image: string | null;
    image_thumbnail: string | null;
  };
}

// No API key needed for public read endpoints
async function fetchWger<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${WGER_BASE_URL}${endpoint}`);
  url.searchParams.set('format', 'json');

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`wger API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Fetch all pages of a paginated endpoint
async function fetchAllPages<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T[]> {
  const allResults: T[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetchWger<WgerPaginatedResponse<T>>(endpoint, {
      ...params,
      limit,
      offset,
    });
    allResults.push(...response.results);

    if (!response.next) break;
    offset += limit;
  }

  return allResults;
}

// --- Public Exercise Database ---

export async function getExercises(
  language: number = 2 // English
): Promise<WgerExercise[]> {
  return fetchAllPages<WgerExercise>('/exercise/', { language });
}

export async function getExerciseTranslations(
  language: number = 2
): Promise<WgerExerciseTranslation[]> {
  return fetchAllPages<WgerExerciseTranslation>('/exercise-translation/', {
    language,
  });
}

export async function getExerciseInfo(exerciseId: number) {
  return fetchWger(`/exerciseinfo/${exerciseId}/`);
}

export async function searchExercises(
  term: string,
  language: string = 'english'
): Promise<{ suggestions: WgerSearchSuggestion[] }> {
  return fetchWger('/exercise/search/', { term, language });
}

export async function getExerciseImages(): Promise<WgerExerciseImage[]> {
  return fetchAllPages<WgerExerciseImage>('/exerciseimage/');
}

export async function getMuscles(): Promise<WgerMuscle[]> {
  return fetchAllPages<WgerMuscle>('/muscle/');
}

export async function getCategories(): Promise<WgerExerciseCategory[]> {
  return fetchAllPages<WgerExerciseCategory>('/exercisecategory/');
}

export async function getEquipment(): Promise<WgerEquipment[]> {
  return fetchAllPages<WgerEquipment>('/equipment/');
}

// --- Sync Strategy ---

export async function getDeletionLog(since?: string) {
  const params: Record<string, string> = {};
  if (since) params.ordering = '-timestamp';
  return fetchAllPages('/deletion-log/', params);
}
```

### 11.2 React Query Hook: `useWgerExercises.ts`

```typescript
// src/hooks/useWgerExercises.ts

import { useQuery } from '@tanstack/react-query';
import * as wgerService from '@/services/wgerService';

export function useWgerExerciseSearch(term: string) {
  return useQuery({
    queryKey: ['wger', 'search', term],
    queryFn: () => wgerService.searchExercises(term),
    enabled: term.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWgerMuscles() {
  return useQuery({
    queryKey: ['wger', 'muscles'],
    queryFn: () => wgerService.getMuscles(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (rarely changes)
  });
}

export function useWgerCategories() {
  return useQuery({
    queryKey: ['wger', 'categories'],
    queryFn: () => wgerService.getCategories(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useWgerEquipment() {
  return useQuery({
    queryKey: ['wger', 'equipment'],
    queryFn: () => wgerService.getEquipment(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useWgerExerciseInfo(exerciseId: number) {
  return useQuery({
    queryKey: ['wger', 'exerciseInfo', exerciseId],
    queryFn: () => wgerService.getExerciseInfo(exerciseId),
    enabled: exerciseId > 0,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
```

### 11.3 Supabase Cache Strategy

Cache exercise data in Supabase for offline access and reduced API calls:

```sql
-- Supabase migration for wger exercise cache
CREATE TABLE wger_exercises (
  id INTEGER PRIMARY KEY,
  uuid TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  category_name TEXT NOT NULL,
  muscles INTEGER[] DEFAULT '{}',
  muscles_secondary INTEGER[] DEFAULT '{}',
  equipment INTEGER[] DEFAULT '{}',
  last_update TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wger_exercise_translations (
  id INTEGER PRIMARY KEY,
  exercise_id INTEGER NOT NULL REFERENCES wger_exercises(id),
  name TEXT NOT NULL,
  description TEXT,
  language_id INTEGER NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wger_muscles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  is_front BOOLEAN NOT NULL,
  image_url_main TEXT,
  image_url_secondary TEXT
);

CREATE TABLE wger_exercise_images (
  id INTEGER PRIMARY KEY,
  exercise_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false
);

CREATE TABLE wger_sync_log (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  record_count INTEGER
);

-- No RLS needed - this is public reference data
```

### 11.4 Sync Service

```typescript
// src/services/wgerSyncService.ts

import { supabase } from '@/services/supabaseClient';
import * as wgerService from '@/services/wgerService';

export async function syncExerciseDatabase() {
  // Check last sync time
  const { data: syncLog } = await supabase
    .from('wger_sync_log')
    .select('last_synced_at')
    .eq('entity_type', 'exercises')
    .single();

  const lastSync = syncLog?.last_synced_at;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Skip if synced within 24 hours
  if (lastSync && lastSync > oneDayAgo) return;

  // Fetch and upsert exercises
  const exercises = await wgerService.getExercises();
  const translations = await wgerService.getExerciseTranslations();
  const images = await wgerService.getExerciseImages();
  const muscles = await wgerService.getMuscles();

  // Upsert in batches
  await supabase.from('wger_muscles').upsert(
    muscles.map((m) => ({
      id: m.id,
      name: m.name,
      name_en: m.name_en,
      is_front: m.is_front,
      image_url_main: m.image_url_main,
      image_url_secondary: m.image_url_secondary,
    }))
  );

  // ... similar upserts for exercises, translations, images

  // Update sync log
  await supabase.from('wger_sync_log').upsert({
    entity_type: 'exercises',
    last_synced_at: new Date().toISOString(),
    record_count: exercises.length,
  });
}
```

### 11.5 Muscle Map Component

```tsx
// src/components/workout/MuscleMap.tsx

import { useWgerMuscles } from '@/hooks/useWgerExercises';

interface MuscleMapProps {
  targetMuscles: number[];      // Primary muscle IDs
  secondaryMuscles?: number[];  // Secondary muscle IDs
  view: 'front' | 'back';
}

export function MuscleMap({ targetMuscles, secondaryMuscles = [], view }: MuscleMapProps) {
  const { data: muscles } = useWgerMuscles();

  if (!muscles) return null;

  const filteredMuscles = muscles.filter(
    (m) => m.is_front === (view === 'front')
  );

  return (
    <div className="relative w-48 h-64">
      {/* Base body outline SVG */}
      <img
        src={`https://wger.de/static/images/muscles/muscular_system_${view}.svg`}
        alt={`${view} body outline`}
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay targeted muscles */}
      {filteredMuscles.map((muscle) => {
        const isPrimary = targetMuscles.includes(muscle.id);
        const isSecondary = secondaryMuscles.includes(muscle.id);

        if (!isPrimary && !isSecondary) return null;

        const imageUrl = isPrimary
          ? muscle.image_url_main
          : muscle.image_url_secondary;

        return (
          <img
            key={muscle.id}
            src={`https://wger.de${imageUrl}`}
            alt={muscle.name_en || muscle.name}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: isPrimary ? 1 : 0.5 }}
          />
        );
      })}
    </div>
  );
}
```

---

## 12. Self-Hosting Option

### Docker Compose Setup

```bash
# Clone the Docker repository
git clone https://github.com/wger-project/docker.git wger-docker
cd wger-docker

# Start all services
docker compose up -d
```

This starts 5 services:
1. **web** - Gunicorn application server (wger/server image)
2. **db** - PostgreSQL database
3. **cache** - Redis for caching
4. **nginx** - Reverse proxy and static file serving
5. **celery** - Worker and beat for background tasks

### Initial Data Population

```bash
# Sync exercise database from wger.de
docker compose exec web python3 manage.py sync-exercises

# Download exercise images
docker compose exec web python3 manage.py download-exercise-images

# Load base ingredient fixtures
docker compose exec web wger load-online-fixtures

# Full ingredient sync (large dataset)
docker compose exec web python3 manage.py sync-ingredients
```

### Default Credentials

- URL: `http://localhost`
- Username: `admin`
- Password: `adminadmin`

### Key Configuration

- Set `SITE_URL` to your public domain (no trailing slash)
- Set `CSRF_TRUSTED_ORIGINS` to include your domain with port
- Use `docker-compose.override.yml` for custom port mappings
- Data is persisted in Docker volumes by default

### Benefits of Self-Hosting

- No rate limits on API requests
- Full admin control over exercise database
- Private user data (no third-party dependency)
- Custom exercise entries and modifications
- Can serve as your own exercise API backend
- Offline capability for your infrastructure

### Updating

```bash
docker compose down
docker compose pull
docker compose up -d
```

---

## 13. Advantages over Paid Alternatives

| Feature | wger | ExerciseDB (RapidAPI) | Other Paid APIs |
|---|---|---|---|
| Cost | Free | $10-100+/month | Varies |
| Open source | Yes (AGPL-3.0) | No | No |
| Self-hostable | Yes | No | No |
| API key for reads | Not required | Required | Required |
| Exercise count | 800+ | 1300+ | Varies |
| Exercise media | Photos + H.265 video | Animated GIFs | Varies |
| Muscle SVGs | Yes (front/back maps) | No | Varies |
| Multi-language | 30 languages | English only | Varies |
| Nutrition data | Yes (Open Food Facts) | No | Varies |
| Body tracking | Yes | No | Varies |
| Workout plans | Yes (full CRUD) | No | Varies |
| Rate limits | None (self-hosted) | Strict per plan | Varies |
| Data ownership | Full (self-hosted) | None | None |
| Vendor lock-in | None | RapidAPI dependency | Platform-dependent |
| Community | Active (Discord, GitHub) | Support tickets | Varies |

---

## 14. Limitations

### Image Quality
- wger uses **static photos** rather than animated GIFs
- Exercise image coverage is incomplete (~310 images for 800+ exercises)
- Image quality varies as they are community-contributed
- ExerciseDB provides higher-quality animated GIF demonstrations

### Data Quality
- Community-contributed exercise descriptions vary in quality and completeness
- Some exercises lack descriptions or translations in certain languages
- Muscle mappings may be incomplete for newer exercises

### API Maturity
- The OpenAPI documentation is described as "very new" and subject to change
- Some search endpoints (exercise/ingredient search) are underdocumented
- The routine API was recently restructured (v2.5)

### Public Instance Limitations
- Shared infrastructure (wger.de may have downtime)
- Rate limiting on the public instance (exact limits undocumented)
- Account creation required for write operations

### Exercise Database Scope
- 15 muscles defined (vs. more granular anatomy in some alternatives)
- 8 exercise categories (relatively broad groupings)
- No animated demonstrations natively (videos available but fewer in number)

---

## 15. Code Examples

### Fetch All English Exercises with Names

```typescript
async function getEnglishExercisesWithNames() {
  // Fetch base exercises and translations in parallel
  const [exercises, translations] = await Promise.all([
    fetch('https://wger.de/api/v2/exercise/?format=json&limit=100&language=2')
      .then(r => r.json()),
    fetch('https://wger.de/api/v2/exercise-translation/?format=json&limit=100&language=2')
      .then(r => r.json()),
  ]);

  // Map translations to exercises
  const translationMap = new Map(
    translations.results.map((t: any) => [t.exercise, t])
  );

  return exercises.results.map((ex: any) => ({
    id: ex.id,
    name: translationMap.get(ex.id)?.name || 'Unknown',
    description: translationMap.get(ex.id)?.description || '',
    category: ex.category,
    muscles: ex.muscles,
    muscles_secondary: ex.muscles_secondary,
    equipment: ex.equipment,
  }));
}
```

### Search Exercises

```typescript
async function searchExercises(query: string) {
  const response = await fetch(
    `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}&language=english&format=json`
  );
  const data = await response.json();

  return data.suggestions.map((s: any) => ({
    id: s.data.base_id,
    name: s.data.name,
    category: s.data.category,
    image: s.data.image,
    thumbnail: s.data.image_thumbnail,
  }));
}

// Usage
const results = await searchExercises('bench press');
// Returns: [{ id: 192, name: "Bench Press", category: "Chest", ... }, ...]
```

### Get Muscle Data with SVG URLs

```typescript
async function getMuscleMap() {
  const response = await fetch(
    'https://wger.de/api/v2/muscle/?format=json'
  );
  const data = await response.json();

  const frontMuscles = data.results.filter((m: any) => m.is_front);
  const backMuscles = data.results.filter((m: any) => !m.is_front);

  return { frontMuscles, backMuscles };
}

// SVG URLs are relative to wger.de:
// https://wger.de/static/images/muscles/main/muscle-4.svg
// https://wger.de/static/images/muscles/secondary/muscle-4.svg
```

### Filter Exercises by Category and Equipment

```typescript
async function getChestBarbellExercises() {
  const response = await fetch(
    'https://wger.de/api/v2/exercise/?format=json&category=11&equipment=1&language=2'
  );
  const data = await response.json();
  return data.results;
}
```

### Get Full Exercise Details

```typescript
async function getExerciseDetails(exerciseId: number) {
  const response = await fetch(
    `https://wger.de/api/v2/exerciseinfo/${exerciseId}/?format=json`
  );
  const data = await response.json();

  return {
    id: data.id,
    category: data.category.name,
    muscles: data.muscles.map((m: any) => m.name_en || m.name),
    secondaryMuscles: data.muscles_secondary.map((m: any) => m.name_en || m.name),
    equipment: data.equipment.map((e: any) => e.name),
    images: data.images.map((img: any) => img.image),
    videos: data.videos.map((v: any) => ({
      url: v.video,
      duration: v.duration,
      width: v.width,
      height: v.height,
    })),
    translations: data.translations.reduce((acc: any, t: any) => {
      acc[t.language] = { name: t.name, description: t.description };
      return acc;
    }, {}),
  };
}
```

### Paginate Through All Exercises

```typescript
async function getAllExercises() {
  const allExercises: any[] = [];
  let url: string | null =
    'https://wger.de/api/v2/exercise/?format=json&limit=100&language=2';

  while (url) {
    const response = await fetch(url);
    const data = await response.json();
    allExercises.push(...data.results);
    url = data.next;
  }

  console.log(`Fetched ${allExercises.length} exercises`);
  return allExercises;
}
```

### JWT Authentication Flow

```typescript
class WgerAuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl = 'https://wger.de/api/v2';

  async login(username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    this.accessToken = data.access;
    this.refreshToken = data.refresh;
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseUrl}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: this.refreshToken }),
    });

    const data = await response.json();
    this.accessToken = data.access;
  }

  async authenticatedFetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      return fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return response;
  }

  // Example: Get user's workout routines
  async getRoutines() {
    const response = await this.authenticatedFetch('/routine/?format=json');
    return response.json();
  }

  // Example: Log a workout set
  async logWorkout(exerciseId: number, weight: number, reps: number) {
    const response = await this.authenticatedFetch('/workoutlog/', {
      method: 'POST',
      body: JSON.stringify({
        exercise: exerciseId,
        weight,
        reps,
        date: new Date().toISOString().split('T')[0],
      }),
    });
    return response.json();
  }
}
```

---

## 16. Useful Links

| Resource | URL |
|---|---|
| Public API Root | https://wger.de/api/v2/ |
| API Documentation | https://wger.readthedocs.io/en/latest/api/api.html |
| Routine API Docs | https://wger.readthedocs.io/en/latest/api/routines.html |
| Swagger UI | https://wger.de/api/v2/schema/ui |
| Redoc | https://wger.de/api/v2/schema/redoc |
| OpenAPI Schema | https://wger.de/api/v2/schema |
| GitHub (Main) | https://github.com/wger-project/wger |
| GitHub (Docker) | https://github.com/wger-project/docker |
| Docker Hub | https://hub.docker.com/r/wger/server |
| Discord Community | https://discord.gg/rPWFv6W |
| Live Instance | https://wger.de |
| ReadTheDocs | https://wger.readthedocs.io |
