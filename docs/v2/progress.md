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

| Date | Question | Decision |
|------|----------|----------|
| Feb 11, 2026 | What feedback mechanism exists for workout quality? | Built 4-step review system with 1-5 star ratings, difficulty rating, mood tracking, performance tags, and free-text reflection |
| Feb 11, 2026 | How do users track workout mood/energy? | Per-session mood before/after (5 discrete options) + energy level (1-5 scale). Mood delta computed for weekly trends. |
| Feb 11, 2026 | What post-workout reflection exists? | 4-step review flow: ratings (required) → mood/energy (optional) → tags (optional) → reflection with highlights and improvements (optional) |

### Implementation Phases
_To be filled as we build v2._

#### Phase 0: Foundation & Tech Debt
| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |

#### Phase 1: Core V2 Features
| Task | Status | Date | Notes |
|------|--------|------|-------|
| Workout Reviews - Database migration | Done | Feb 11, 2026 | `workout_reviews` table with polymorphic FKs, RLS, indexes, trigger |
| Workout Reviews - Service layer | Done | Feb 11, 2026 | `reviewService.ts` - 7 CRUD functions, 6 type exports |
| Workout Reviews - React Query hooks | Done | Feb 11, 2026 | `useReview.ts` - 10 hooks (queries, mutations, computed aggregations) |
| Workout Reviews - Zustand store | Done | Feb 11, 2026 | `reviewStore.ts` - Modal state, 4-step wizard, draft management |
| Workout Reviews - Configuration | Done | Feb 11, 2026 | `reviewConfig.ts` - Moods, tags, ratings, steps with colors/icons |
| Workout Reviews - UI components | Done | Feb 11, 2026 | 10 components: PostWorkoutReview, StarRating, MoodSelector, DifficultyRating, EnergyLevel, PerformanceTagPicker, ReflectionForm, ReviewSummaryCard, WeeklyReviewCard, ReviewBadge |
| Workout Reviews - Page integration | Done | Feb 11, 2026 | Integrated into Workout.tsx, CardioWorkout.tsx, MobilityWorkout.tsx (completion flow), SessionDetail.tsx, CardioSessionDetail.tsx (review display), Home.tsx (weekly summary) |
| Workout Reviews - Tests | Done | Feb 11, 2026 | 180 tests across 10 test files (reviewService: 36, reviewStore: 36, reviewConfig: 29, StarRating: 17, ReviewSummaryCard: ?, WeeklyReviewCard: ?, PostWorkoutReview: ?, MoodSelector: 13, EnergyLevel: 12, DifficultyRating: 13, PerformanceTagPicker: 11, ReflectionForm: 14, ReviewBadge: 16). All passing. |
| Workout Reviews - Bug fix: race condition | Done | Feb 11, 2026 | Fixed PostWorkoutReview modal not appearing after weights workout completion (clearWorkout fired before openReview in mutation lifecycle). Added PostWorkoutReview to non-active branch in Workout.tsx. |
| Workout Reviews - E2E browser testing | Done | Feb 11, 2026 | Full flow verified via Playwright: onboarding → start workout → complete → 4-step review wizard → submit → Home WeeklyReviewCard → SessionDetail ReviewSummaryCard. All existing pages verified (Schedule, Profile, History). |
| Workout Reviews - PRD documentation | Done | Feb 11, 2026 | `docs/v2/review-feature.md` |

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

### Session: Feb 11, 2026 - Workout Review Feature

**Activity**: Built complete workout review feature (backend + state management + configuration)

**Files Created**:
- `supabase/migrations/20250211000000_add_workout_reviews.sql` - Database migration with `workout_reviews` table, polymorphic session references, RLS policies, 5 indexes, and `updated_at` trigger
- `src/services/reviewService.ts` - Service layer with 7 CRUD functions, 6 type exports (`WorkoutReview`, `CreateReviewData`, `UpdateReviewData`, `MoodValue`, `PerformanceTag`)
- `src/hooks/useReview.ts` - 10 TanStack Query hooks (5 queries, 3 mutations, 2 computed aggregations with `WeeklyReviewSummary` and `ReviewStats`)
- `src/stores/reviewStore.ts` - Zustand store managing review modal state, 4-step wizard navigation, draft review with 9 fields, and tag toggling
- `src/config/reviewConfig.ts` - Configuration with 5 mood options (emoji + color), 12 performance tags (Lucide icons + colors), 3 rating scales with labels/colors, and 4 step definitions
- `docs/v2/review-feature.md` - Comprehensive PRD with executive summary, problem statement, technical architecture, UI/UX rationale, data model, component hierarchy, success metrics, and decision log

**Architecture Decisions**:
1. Polymorphic FK pattern (two nullable session FKs + CHECK constraint) to avoid refactoring V1's dual-session-table architecture
2. JSONB for performance tags (no join table) since tags are always read/written as a complete set
3. Client-side aggregation via TanStack Query `select` transform rather than database views
4. 4-step wizard with Zustand store (matching onboarding pattern) instead of single-form
5. 5-point rating scale with descriptive labels for inter-rater consistency
6. 5 discrete mood options (not numeric) for speed and consistency
7. 12 predefined tags (6 positive, 6 negative/neutral) instead of free-form for aggregation reliability
8. Cached `workout_duration_minutes` on review to avoid cross-table joins for aggregation

**Status**: COMPLETE - All layers built, integrated, tested, and documented.

**Final Stats**:
- 16 new files created (1 migration, 5 source modules, 10 UI components)
- 6 existing files modified (3 workout pages, 2 session detail pages, 1 home page)
- 101 unit tests, all passing
- Production build compiles cleanly (966 KB bundle)
- Comprehensive PRD in `docs/v2/review-feature.md` (488 lines)

### Session: Feb 11, 2026 - Deep Testing & Bug Fix

**Activity**: Deep testing of workout review feature (browser + unit tests), found and fixed race condition bug

**Bug Found & Fixed**:
- **Race condition in Workout.tsx**: `useCompleteWorkout` hook's `onSuccess` calls `clearWorkout()` (setting `activeSession = null`) before the call-site `onSuccess` can call `openReview()`. This caused the page to re-render into the "preview" branch (no `PostWorkoutReview` mounted), so the review modal never appeared.
- **Fix**: Added `<PostWorkoutReview>` to the non-active-session return branch in `Workout.tsx`, so the modal is always in the DOM regardless of session state.
- CardioWorkout and MobilityWorkout don't have this bug (they don't use conditional rendering based on active session).

**Files Modified**:
- `src/pages/Workout.tsx` - Added PostWorkoutReview to non-active branch

**Files Created** (6 new test files, 79 tests):
- `src/components/review/__tests__/MoodSelector.test.tsx` - 13 tests
- `src/components/review/__tests__/EnergyLevel.test.tsx` - 12 tests
- `src/components/review/__tests__/DifficultyRating.test.tsx` - 13 tests
- `src/components/review/__tests__/PerformanceTagPicker.test.tsx` - 11 tests
- `src/components/review/__tests__/ReflectionForm.test.tsx` - 14 tests
- `src/components/review/__tests__/ReviewBadge.test.tsx` - 16 tests

**Browser Testing Verified**:
- Onboarding flow (3 steps) → Home page
- Start Push workout → log sets → Complete Workout → Review modal appears
- 4-step review wizard: stars + difficulty → mood + energy → tags → reflection
- Review saved → Home shows WeeklyReviewCard with correct data
- SessionDetail shows ReviewSummaryCard with all review data
- Schedule, Profile, History pages all render without regressions

**Test Results**: 2,928 passing / 19 failing (all 19 pre-existing). Build: clean (1,054 KB).

### Session: Feb 10, 2026
- Fixed ExerciseDB exercise detail panel not showing for many exercises (5 bugs in `exerciseDbService.ts`)
- Created v2 planning document structure (`docs/v2/`)
- Populated research.md with full v1 architecture baseline
- Next: Begin discovery phase — answer questions in discovery.md to scope v2
