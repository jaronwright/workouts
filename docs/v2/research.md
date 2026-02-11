# V2 Research

> Technical research, competitive analysis, and findings that inform v2 decisions.
> Each section documents what was investigated, key findings, and recommendations.

---

## Current Architecture (V1 Baseline)

### Tech Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 19 + TypeScript | Vite bundler |
| Styling | TailwindCSS 4 | Dark mode via `themeStore` |
| Server State | TanStack Query | 5-min stale time, QueryClient in providers |
| Client State | Zustand | `authStore`, `workoutStore`, `settingsStore`, `themeStore`, `toastStore`, `weatherStore`, `offlineStore`, `reviewStore` |
| Animation | Framer Motion (`motion/react`) | `animationConfig.ts` for shared variants |
| Backend | Supabase (Auth + PostgreSQL) | RLS policies, 20 migrations |
| PWA | vite-plugin-pwa + Workbox | NetworkFirst for API, CacheFirst for static |
| Weather | Open-Meteo API | Free, no API key, cached in Zustand |
| Exercise Data | ExerciseDB (V2 RapidAPI + V1 OSS fallback) | Cached in localStorage 7 days |
| Deployment | Vercel | SPA rewrites in `vercel.json` |

### Database Schema (key tables)
```
workout_plans → workout_days → exercise_sections → plan_exercises  (structure)
workout_sessions → exercise_sets                                    (logged data)
template_workout_sessions → workout_templates                       (cardio/mobility)
workout_reviews                                                     (post-workout reviews, polymorphic FK to sessions)
user_profiles                                                       (display name, avatar, plan, cycle start)
user_schedules                                                      (day → workout mapping, multi per day)
user_feedback                                                       (bugs/features)
```

### Feature Surface (V1)
- **Auth**: Google OAuth + email/password via Supabase Auth
- **7 Workout Plans**: PPL, Upper/Lower, Full Body, Bro Split, Arnold, Glute Hypertrophy, Mobility
- **3 Workout Types**: Weights (set/rep tracking), Cardio (duration), Mobility (checklist)
- **Schedule**: Drag-to-assign days, multiple workouts per day, cycle-based rotation
- **Active Workout**: Set logging, rest timer, exercise detail modal with GIFs
- **History**: Calendar view with workout-type icons, session detail pages
- **Stats**: Weekly frequency, streaks, PR tracking, progression suggestions
- **Weather**: Home page widget with expandable details (wind, UV, humidity, rain, sun times)
- **Community**: Basic social page (placeholder for v2 expansion)
- **Profile**: Avatar upload, display name, plan selection, theme toggle, weight unit preference
- **PWA**: Offline caching, wake lock during workouts, web share, push notification infrastructure
- **Offline Sync**: `useSyncEngine` + `offlineStore` for queuing mutations when offline

### Pages & Routes (16 routes)
```
/auth, /auth/callback
/, /profile, /schedule, /rest-day, /community
/workout/:dayId, /workout/:dayId/active
/cardio/:templateId
/mobility/:category/select, /mobility/:templateId
/history, /history/:sessionId, /history/cardio/:sessionId
```

### Hooks (25 custom hooks)
```
useAuth, useAvatar, useCalendarData, useCycleDay, useExerciseGif,
useFeedback, useMobilityTemplates, useNotifications, useOnlineStatus,
usePR, useProfile, useProgression, useReducedMotion, useReview,
useSchedule, useShare, useSocial, useSyncEngine, useTemplateWorkout,
useTheme, useToast, useWakeLock, useWeather, useWorkoutPlan, useWorkoutSession
```

### Test Coverage
- 1,900+ tests across 98 test files
- Vitest + React Testing Library + jsdom
- Pre-existing TS errors in some test files (non-blocking, vitest skips tsc)
- `npx vite build` is the canonical production verification

---

## Known V1 Issues & Tech Debt

### Bugs Fixed in Recent Sessions
- ExerciseDB name matching: plural handling, null cache duration, missing mappings (just fixed)
- WeatherCard hooks order violation
- Bottom nav sizing for longer labels
- Card `position: relative` needed for gradient overlays
- Google OAuth localhost vs 127.0.0.1 mismatch

### Remaining Tech Debt
- Test files have TS errors (unrelated to runtime, but noisy)
- `tsc -b` fails on test files (vitest works fine)
- Some lint rule workarounds (`react-hooks/set-state-in-effect`)
- Bundle size: 966 KB JS — single chunk, no code splitting
- No CI/CD pipeline (manual `npm run build` verification)
- No error monitoring in production
- No usage analytics

---

## API & Service Research

### ExerciseDB API
- **V2 (RapidAPI)**: Requires API key, returns singular fields, has rate limits (429 backoff)
- **V1 (OSS)**: Free, no key, array fields, used as fallback
- **Coverage**: ~1300 exercises, good for standard gym movements
- **Gaps**: Missing many mobility/stretching exercises, foam rolling, CARs
- **Caching**: localStorage with 7-day TTL (success), 1-hour TTL (null results)
- **Name matching**: Mapping table + plural stripping + fuzzy `findBestMatch` + keyword fallback

### Open-Meteo Weather API
- Free, no API key, reliable
- Used for home page weather widget
- Geolocation-based, cached in Zustand store

### Supabase
- Auth: Google OAuth + email/password
- Database: PostgreSQL with RLS (row-level security)
- Storage: Avatar uploads
- Realtime: Not currently used (potential for v2 social features)

---

## Competitive Analysis

### Review / Post-Workout Reflection Features

| App | Review Feature | Mood Tracking | Tags/Labels | Reflection/Notes | Ratings |
|-----|---------------|---------------|-------------|-----------------|---------|
| **Strong** | Per-session notes field, PR celebrations | None | None | Single text field per workout | None (no explicit rating system) |
| **Hevy** | Post-workout summary screen, optional notes | None | None | Per-exercise and per-session notes | Implicit via "like" on social feed |
| **JEFIT** | Post-workout stats summary | Basic (3-option: easy/medium/hard) | None | Per-exercise notes only | Difficulty rating only |
| **Fitbod** | Auto-generated workout summary with muscle group coverage | None | None | None | None |
| **Apple Fitness+** | Post-workout "burn bar" ranking in group classes | None | None | None | None |
| **Strava** | Post-activity description, "perceived exertion" (1-10) | None | None | Title + description + photos | Perceived exertion scale |
| **Garmin Connect** | Post-activity "feel" rating (1-5 smiley faces) | Basic (5-level smiley scale) | None | Notes field | Effort/feel rating |

### Key Takeaways for Our Implementation

1. **No competitor has a comprehensive review system.** Most apps offer at best a notes field and sometimes a single rating. Our 4-step review flow (rating + mood + tags + reflection) is more thorough than any major competitor, creating a genuine differentiator.

2. **Mood tracking is rare in fitness apps.** Garmin Connect has basic emoji-based mood, Strava has perceived exertion, but no competitor tracks mood before AND after a workout. The mood delta concept (measuring how exercise changes your emotional state) is unique.

3. **Tags are absent from all competitors.** Performance tags (e.g., "Felt Strong", "New PR", "Rushed") provide structured categorization that free-text notes cannot match. This enables aggregation (e.g., "you felt strongest on Push days") that no competitor offers.

4. **Notes/reflection is universally single-field.** Competitors offer one text box at most. Our structured approach (reflection + highlights + improvements) gently guides constructive self-reflection without forcing it.

### Design System Choices

#### Why Emojis for Moods

Emojis were chosen over custom icons, text-only labels, or a numeric slider for mood selection:

- **Universal recognition**: Emojis are language-independent and instantly communicative. A fire emoji conveys "energized/great" faster than reading a label.
- **Fitness app convention**: Garmin Connect uses smiley faces, Strava uses emoji-like perceived exertion icons. Users expect this visual vocabulary in fitness contexts.
- **Reduced decision time**: Visual indicators are processed ~60ms faster than text in selection tasks. Post-workout, when cognitive resources are depleted, this matters.
- **Accessibility pairing**: Each emoji is paired with a text label ("Great", "Tired", etc.) so the meaning is unambiguous and screen-reader friendly.

#### Why 5-Star Rating (Not 10-Point or Thumbs Up/Down)

- **5-point scales have higher inter-rater reliability** than 10-point scales. Users consistently distinguish "Good" from "Great" but struggle with "7" vs "8" on a 10-point scale.
- **Industry standard**: App Store ratings, Google Reviews, Amazon, Strong app's implicit system -- all use 5-point. Users have trained intuition for what each star means.
- **Sufficient granularity**: For workout quality tracking, 5 levels (Poor/Fair/Good/Great/Amazing) capture meaningful variance without false precision.
- **Binary (thumbs up/down) was rejected** because it loses too much signal. A workout that was "okay but not great" needs more than two buckets.
- **Each point has a descriptive label**: This anchors the scale and ensures consistency across sessions and users.

#### Why Predefined Tags (Not Free-Form)

- **Aggregation**: Free-form tags produce inconsistent data ("felt strong" vs "strong" vs "STRONG" vs "felt really strong"). Predefined tags enable reliable frequency counting and trend analysis.
- **Speed**: Tapping a chip is faster than typing, especially on mobile after a workout when fine motor control may be reduced.
- **Categorization balance**: 12 tags were chosen -- 6 positive (felt_strong, new_pr, pumped, focused, good_form, breakthrough) and 6 negative/neutral (heavy, light_day, tired, sore, rushed, distracted). This prevents positivity bias while keeping the list scannable in a single screen.
- **Visual distinction**: Each tag has a unique Lucide icon and color, enabling instant recognition without reading labels.
- **Extensibility**: New tags can be added to `reviewConfig.ts` without a database migration (tags are stored as JSONB strings, not FK references).

### Database Schema Alternatives Considered

| Approach | Description | Pros | Cons | Verdict |
|----------|------------|------|------|---------|
| **Polymorphic FK (chosen)** | Two nullable FKs (`session_id`, `template_session_id`) with CHECK constraint ensuring exactly one is set | Additive-only migration; no changes to existing tables; database-enforced exclusivity | Two nullable columns feel inelegant; queries need COALESCE or OR conditions | **Selected** -- pragmatic, safe, follows v2 migration strategy |
| **Unified session table** | Refactor `workout_sessions` and `template_workout_sessions` into a single `sessions` table, then FK from reviews | Clean single FK; simpler queries | Massive migration affecting entire app; breaks existing services, hooks, and tests; high risk | Rejected -- too much blast radius for a review feature |
| **Bridge table** | `reviewable_sessions` table with polymorphic reference, then reviews FK to bridge | Clean FK on reviews; bridge table absorbs polymorphism | Extra join on every query; adds complexity for no real benefit; bridge table is just moving the polymorphism | Rejected -- adds indirection without solving the core issue |
| **Separate review tables** | `weights_reviews` and `template_reviews` as distinct tables | No polymorphism; each table has clean FK | Duplicated schema, duplicated service code, duplicated hooks; cannot aggregate reviews across workout types without UNION queries | Rejected -- violates DRY, complicates aggregation |
| **Generic `entity_type` + `entity_id` pattern** | Single string `entity_type` ("weights" or "template") + single UUID `entity_id` with no FK | Maximum flexibility; single column pair | No referential integrity (FK constraint impossible); no cascade deletes; stringly-typed; error-prone | Rejected -- sacrifices database safety for false flexibility |

| App | Strengths | Weaknesses | Ideas to Borrow |
|-----|-----------|------------|-----------------|
| Strong | Clean UI, fast set logging, Apple Watch | No review/mood system, limited analytics | Session notes UX |
| Hevy | Social feed, exercise library, free tier | No structured review, basic analytics | Post-workout summary screen |
| JEFIT | Large exercise database, community plans | Dated UI, intrusive ads | Difficulty rating concept |
| Fitbod | AI-generated workouts, muscle recovery tracking | No user-created plans, expensive | Recovery-aware programming |
| Apple Fitness+ | Guided classes, health integration | No custom workouts, Apple-only | Celebratory completion animations |

---

## Technology Investigations

_To be filled in as we research specific technologies for v2._

### Charting Libraries
- _TBD: Recharts, Nivo, Victory, lightweight custom SVG?_

### Native vs PWA
- _TBD: Capacitor, Expo, React Native comparison_

### AI/LLM Integration
- _TBD: Claude API for workout suggestions, form analysis_

### Push Notifications
- _V1 has infrastructure (`useNotifications`), needs activation and use cases_

---

## Key Findings & Recommendations

_Synthesized insights that feed into plan.md._

1. **Bundle size needs attention** — 939KB JS chunk should be code-split before adding v2 features
2. **Offline sync is in place** — Good foundation to build on, needs battle-testing
3. **ExerciseDB has gaps** — May need supplemental exercise data for mobility/stretching
4. **Community is a shell** — V1 has the page but minimal functionality, biggest growth opportunity
5. **No custom workouts** — All 7 plans are pre-built; user-created plans is the #1 missing feature
6. **Stats are basic** — PR tracking exists but no charts, no body measurements, no export
