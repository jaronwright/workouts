# V2 Progress Log

> Chronological record of all phases, tasks, and decisions.
> Read this to recover context from any previous session.

---

## V1 Development History (Complete)

### Initial Build
- Set up React 19 + TypeScript + Vite + Supabase project
- Implemented auth (email/password + Google OAuth)
- Built core workout tracking: plans, sessions, exercise sets
- Created PPL (Push/Pull/Legs) and Upper/Lower workout plans
- Added profile system (display name, avatar upload, gender, plan selection)
- Built schedule system with cycle-based day rotation

### Feature Expansion
- Added cardio tracking (duration-based sessions with templates)
- Expanded to 6 mobility categories with duration selection (15/30/45/60 min)
- Added Full Body, Bro Split, Arnold Split, and Glute Hypertrophy plans (7 total)
- Built multi-workout-per-day support in schedules
- Created 4-step onboarding wizard
- Added calendar view in History with workout-type icons

### UI/UX Redesign ("Soft UI / Elevated Clean")
- Complete visual overhaul: soft shadows, indigo accents, generous whitespace
- Material 3-style bottom navigation with animated pill indicator
- Framer Motion animations throughout (page transitions, stagger entrances, card flips)
- Dark mode with user preference persistence
- Stat dashboard with flipping info cards
- Motivational splash screen on workout start

### Infrastructure & Quality
- PWA setup: vite-plugin-pwa, Workbox caching (NetworkFirst for API, CacheFirst for static)
- Wake Lock during active workouts
- Web Share API integration
- Push notification infrastructure (registered, not yet activated)
- Offline-first sync engine (`useSyncEngine` + `offlineStore`)
- Weather widget with Open-Meteo API (geolocation, expandable details)
- Exercise detail modal with ExerciseDB GIFs/instructions
- Community page (basic shell)
- Feedback system (bug reports + feature requests → Supabase)
- 1,900+ unit tests across 98 files
- Deployed to Vercel with SPA rewrites

### Bug Fixes & Polish (Recent)
- **ExerciseDB matching overhaul** (Feb 2026):
  - Fixed null results cached for 7 days → reduced to 1 hour
  - Added plural stripping in `normalizeSearchName()` ("climbers" → "climber")
  - Added ~55 missing exercise name mappings (all 7 plans now covered)
  - Expanded `getMainKeyword()` fallback list (+11 keywords)
  - Bumped cache version to v5 to clear stale entries
- Fixed WeatherCard hooks order violation
- Fixed bottom nav sizing for longer labels ("Community")
- Fixed Card `position: relative` for gradient overlay clipping
- Fixed Google OAuth localhost vs 127.0.0.1 mismatch
- Fixed cardio page to show last session data instead of static targets
- Added offline-first sync engine for workout tracking

### Key Commits (chronological)
```
351c67d  Centralize workout display names and enhance UI features
0f968a1  Full UI/UX redesign: Soft UI aesthetic with motion animations
494f017  Fix 14 bugs: auth leaks, PWA caching, error handling, timer issues
9f3a988  Add comprehensive test suite for components, hooks, pages, and utils
a1cbdca  Fix exercise image loading: V2 API support, exponential backoff
644064e  Add Glute Hypertrophy split (5-day, 3 lower / 2 upper)
34321a1  Add Community page, multi-workout schedule support, and new splits
ff72586  Pre-production audit: fix bugs, expand test suite to 1342 tests
fcfe517  Fix Card gradient bleed, show last session on cardio, modernize bottom nav
f01c9c6  Add weather card to Home page with Open-Meteo API
9a0c87d  Add expandable weather details panel
79aea21  Add PWA icons, Wake Lock, Web Share, and push notification infrastructure
d686f4c  Add 713 unit tests and 6 API integration research docs
9ab18de  Add offline-first sync engine for workout tracking
```

---

## V2 Progress

### Planning Phase
| Date | Activity | Outcome |
|------|----------|---------|
| Feb 10, 2026 | Created v2 planning documents | `docs/v2/` with discovery.md, research.md, plan.md, progress.md |
| | Documented full v1 architecture baseline | research.md populated with tech stack, schema, features, hooks, test coverage |
| | Catalogued all exercise names across 7 plans | ~180 unique exercises identified, mapped to ExerciseDB API terms |

### Discovery Phase
_To be filled as we go through discovery.md questions._

| Date | Question | Decision |
|------|----------|----------|
| | | |

### Implementation Phases
_To be filled as we build v2._

#### Phase 0: Foundation & Tech Debt
| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |

#### Phase 1: Core V2 Features
| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |

#### Phase 2: Social & Community
| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |

#### Phase 3: Polish & Platform
| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |

---

## Session Log

_Brief notes from each working session for quick context recovery._

### Session: Feb 10, 2026 (Current)
- Fixed ExerciseDB exercise detail panel not showing for many exercises (5 bugs in `exerciseDbService.ts`)
- Created v2 planning document structure (`docs/v2/`)
- Populated research.md with full v1 architecture baseline
- Next: Begin discovery phase — answer questions in discovery.md to scope v2
