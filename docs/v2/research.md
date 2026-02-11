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
| Client State | Zustand | `authStore`, `workoutStore`, `settingsStore`, `themeStore`, `toastStore`, `weatherStore`, `offlineStore` |
| Animation | Framer Motion (`motion/react`) | `animationConfig.ts` for shared variants |
| Backend | Supabase (Auth + PostgreSQL) | RLS policies, 19 migrations |
| PWA | vite-plugin-pwa + Workbox | NetworkFirst for API, CacheFirst for static |
| Weather | Open-Meteo API | Free, no API key, cached in Zustand |
| Exercise Data | ExerciseDB (V2 RapidAPI + V1 OSS fallback) | Cached in localStorage 7 days |
| Deployment | Vercel | SPA rewrites in `vercel.json` |

### Database Schema (key tables)
```
workout_plans → workout_days → exercise_sections → plan_exercises  (structure)
workout_sessions → exercise_sets                                    (logged data)
template_workout_sessions → workout_templates                       (cardio/mobility)
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

### Hooks (24 custom hooks)
```
useAuth, useAvatar, useCalendarData, useCycleDay, useExerciseGif,
useFeedback, useMobilityTemplates, useNotifications, useOnlineStatus,
usePR, useProfile, useProgression, useReducedMotion, useSchedule,
useShare, useSocial, useSyncEngine, useTemplateWorkout, useTheme,
useToast, useWakeLock, useWeather, useWorkoutPlan, useWorkoutSession
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
- Bundle size: 939 KB JS (gzipped 271 KB) — single chunk, no code splitting
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

_To be filled in during research phase._

| App | Strengths | Weaknesses | Ideas to Borrow |
|-----|-----------|------------|-----------------|
| Strong | | | |
| Hevy | | | |
| JEFIT | | | |
| Fitbod | | | |
| Apple Fitness+ | | | |

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
