# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workout Tracker PWA - A Progressive Web App for tracking workouts with Supabase backend. Users can manage customizable workout schedules (weights, cardio, mobility), log exercises, track weights/reps, review workouts with mood/tags, view workout history, check weather, submit feedback, and see community activity — all with offline-first support.

## Commands

```bash
npm run dev           # Start Vite dev server (http://localhost:5173)
npm run build         # TypeScript compilation + Vite production build
npm run lint          # Run ESLint on all files
npm run preview       # Preview production build locally

# Testing (Vitest)
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with interactive UI
npm run test:coverage # Run tests with coverage report
npx vitest run src/utils/__tests__/formatters.test.ts  # Run single test file
```

### Build Verification

Use `npx vite build` (not `tsc -b`) to verify production builds. Some test files have pre-existing TS errors that cause `tsc -b` to fail, but `vitest` and `vite build` work correctly because they skip type-checking test files. Non-test source files compile cleanly.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, TailwindCSS 4
- **State**: TanStack Query (server state), Zustand (client state)
- **Animation**: Framer Motion (`motion/react`)
- **Backend**: Supabase (auth + PostgreSQL with RLS)
- **Weather**: Open-Meteo API (free, no API key required)
- **Exercise Data**: ExerciseDB (V1 OSS) via Supabase edge function with permanent Supabase cache
- **PWA**: vite-plugin-pwa with Workbox for offline caching

## Architecture

### Core Pattern

Every feature follows the same layered architecture:

```
Page → Hook (TanStack Query) → Service → Supabase
                                  ↕
                          Zustand Store (client-only state)
```

- **Services** (`src/services/`) handle all Supabase queries and external API calls
- **Hooks** (`src/hooks/`) wrap services with TanStack Query for caching, loading states, and mutations
- **Stores** (`src/stores/`) manage ephemeral client state (active workout, UI state, offline queue)
- **Config** (`src/config/`) holds constants, style mappings, and display configurations

### Data Flow

1. **Authentication**: `useAuth` → `authStore` (Zustand) → Supabase Auth (Google OAuth + email/password)
2. **Workout Data**: Pages → `useWorkoutPlan` / `useWorkoutSession` → TanStack Query → `workoutService` → Supabase
3. **Active Session**: `workoutStore` (Zustand) manages active workout, completed sets, rest timer
4. **Reviews**: `useReview` → TanStack Query → `reviewService` → Supabase `workout_reviews` table; `reviewStore` manages 4-step wizard UI state
5. **Offline Sync**: `useOnlineStatus` detects connectivity → `useSyncEngine` triggers `syncService` to process `offlineStore` queue on reconnect
6. **Weather**: `useWeather` → `weatherService` → Open-Meteo API, cached in `weatherStore`
7. **Exercise Guides**: `useExerciseGuide` → `exerciseGuideService` → Supabase `exercise_cache` (permanent cache) → `fetch-exercise` edge function → ExerciseDB API (one-time only)

### Key Directories

- `src/pages/` - Route components
- `src/components/` - Organized by domain: `ui/`, `layout/`, `workout/`, `review/`, `onboarding/`, `profile/`, `schedule/`, `calendar/`, `stats/`, `social/`, `weather/`, `auth/`
- `src/hooks/` - Custom hooks wrapping services with TanStack Query
- `src/services/` - Service modules (Supabase operations + external APIs)
- `src/stores/` - Zustand stores: `authStore`, `workoutStore`, `reviewStore`, `offlineStore`, `settingsStore`, `themeStore`, `toastStore`, `weatherStore`
- `src/config/` - `workoutConfig.ts` (style/display-name mappings), `reviewConfig.ts` (moods, tags, ratings), `planConstants.ts`, `animationConfig.ts`, `defaultAvatars.ts`, `restDayActivities.ts`
- `src/types/` - TypeScript types including Supabase-generated database types

### Database Schema

- `workout_plans` → `workout_days` → `exercise_sections` → `plan_exercises` (workout structure)
- `workout_sessions` → `exercise_sets` (user's logged weight/rep data)
- `template_workout_sessions` → `workout_templates` (cardio/mobility logged sessions)
- `workout_reviews` (post-workout reviews with polymorphic FK to either session type via CHECK constraint)
- `user_profiles` (display name, avatar, selected plan, cycle start date)
- `user_schedules` (day-of-week → workout day mapping, supports multiple workouts per day)
- `user_feedback` (bug reports and feature requests)
- `push_subscriptions` (web push notification subscriptions)
- RLS policies ensure users only access their own data; cascading deletes configured

### Review System

The workout review feature uses a polymorphic FK pattern: `workout_reviews` has two nullable FKs (`session_id` for weights, `template_session_id` for cardio/mobility) with a CHECK constraint ensuring exactly one is set. This avoids refactoring V1's dual-session-table architecture.

- **Config-driven**: Moods (5 emoji options), tags (12 predefined with icons/colors), and rating scales are all defined in `reviewConfig.ts` — new options don't require migrations
- **4-step wizard**: Rating (required) → Mood/Energy (optional) → Tags (optional) → Reflection (optional), managed by `reviewStore`
- **Integrated into completion flow**: Workout.tsx, CardioWorkout.tsx, MobilityWorkout.tsx all trigger the review modal on session completion

### Offline-First Architecture

- `offlineStore` (Zustand) queues mutations as `QueuedMutation` objects with typed actions (log-set, delete-set, start-session, complete-session, etc.)
- `syncService` processes the queue FIFO with retry logic (max 3 retries, exponential backoff)
- `useSyncEngine` hook watches online status + queue length and triggers processing on reconnect
- TanStack Query configured with `networkMode: 'offlineFirst'` to serve stale cache when offline

### Routing

Protected routes require authentication. Full route list:
- `/auth` (public), `/auth/callback` (OAuth redirect)
- `/` (home), `/profile`, `/schedule`, `/rest-day`, `/community`
- `/workout/:dayId`, `/workout/:dayId/active`
- `/cardio/:templateId`
- `/mobility/:category/select`, `/mobility/:templateId`
- `/history`, `/history/:sessionId`, `/history/cardio/:sessionId`

## Configuration

- Path alias: `@/` maps to `./src/`
- Environment variables in `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- ExerciseDB API key stored in Supabase edge function environment only (never in frontend)
- Supabase migrations in `supabase/migrations/` (21 migrations, run in order)
- PWA caches Supabase API calls with NetworkFirst strategy
- React Query: 5-minute stale time, 1 retry, offlineFirst network mode

## Testing

- Tests in `__tests__` directories adjacent to source
- Test setup in `src/test/setup.ts` with Supabase mocks in `src/test/mocks/`
- Custom render with providers in `src/test/utils.tsx`
- Uses jsdom environment with React Testing Library
- Suffixes: `.comprehensive.test.ts`, `.edgecases.test.ts`, `.integration.test.ts`
- All `UserProfile` mocks must include `selected_plan_id` field
- Mock objects with `gender: 'male'` need explicit type annotation (`as profileService.UserProfile`)

## Important Notes

- Only one active workout session per user at a time (enforced by RLS)
- All timestamps are TIMESTAMPTZ (timezone-aware)
- Card component requires `position: relative` to contain absolute-positioned gradient overlays
- Seven workout splits: PPL, Upper/Lower, Full Body, Bro Split, Arnold, Glute Hypertrophy, Mobility
- Exercise name matching uses a 130+ entry mapping table + plural stripping + fuzzy scoring + keyword fallback (in Supabase edge function)
- Bottom nav uses `min-w-14 px-2` (not fixed width) so longer labels fit; active state is Material 3-style pill
- `react-hooks/set-state-in-effect` lint rule requires `/* eslint-disable */` for effects that reset state on open/close
- Deployed to Vercel with SPA rewrites configured in `vercel.json`

## CRITICAL ALIGNMENT RULES

- Always use flexbox or grid for layout. Never use absolute positioning unless for overlays.
- Test every screen at 375px width (iPhone SE) and 428px width (iPhone 14 Pro Max)
- If elements overlap or misalign, the FIRST priority is fixing alignment before adding any new features
- Check Chrome after EVERY file save. Do not batch changes.

## Design System V2

### Overview

Electric Mint Pro — premium fitness brand design system. Two personalities: Light mode = "Editorial" (layered grays, colored shadows), Dark mode = "Cinematic" (neon glow, gradient surfaces). All tokens defined as CSS custom properties in `index.css` and mirrored as TypeScript constants in `src/config/designTokens.ts`.

### Typography

- **Headings**: Syne (weights 600-800) — bold, expressive, geometric
- **Body**: Outfit (weights 400-700) — clean, highly readable
- **Loaded via**: Google Fonts `<link>` in `index.html`
- Headings get `font-family: var(--font-heading)` automatically via `h1-h6` base styles
- Body text inherits `var(--font-body)` from `<body>`
- Type scale: `--text-xs` (12px) through `--text-5xl` (48px)
- Headings: `letter-spacing: var(--tracking-tight)`, `line-height: var(--leading-tight)`

### Color Palette

| Role | Light | Dark | Purpose |
|------|-------|------|---------|
| Primary | `#00C261` Electric Mint | `#00E676` Neon Mint | Primary CTAs, active states, brand identity |
| Accent | `#00A89A` Teal | `#00D4C8` | Secondary actions, informational |
| Reward Gold | `#D99700` | `#FFC233` | Achievements ONLY (PRs, streaks, milestones) |
| Weights | `#5B5DF0` Indigo | `#818CF8` | Weights workout type |
| Cardio | `#E63B57` Rose | `#FB7185` | Cardio workout type |
| Mobility | `#00C261` Mint | `#00E676` | Mobility workout type |
| Background | `#ECEEF2` | `#0B0D10` Cool steel | Page background |
| Surface | `#F7F8FA` | `#13161B` | Cards, default containers |
| Surface Elevated | `#FFFFFF` | `#1B1F26` | Modals, bottom sheets, dropdowns |
| Surface Sunken | `#E3E5EA` | `#070809` | Inputs, recessed areas |

- Primary uses white text (`--color-primary-text: #FFFFFF`) since mint is medium-dark
- Every color has a `*-muted` variant at ~8-10% opacity for subtle backgrounds
- Reward Gold is restricted to achievements — never use for general CTAs
- Status: success (mint), warning (amber), danger (rose), info (indigo)
- Heatmap intensity: `--heatmap-1` (25%), `--heatmap-2` (50%), `--heatmap-3` (80%) for contribution graphs

### Shape & Depth

- **Radius scale**: `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (20px), `--radius-xl` (20px), `--radius-full` (pill)
- **Shadow scale**: 5 levels (`xs` through `xl`) plus semantic shadows (`--shadow-card`, `--shadow-elevated`, `--shadow-primary`, `--shadow-reward`, `--shadow-accent`)
- **Glass**: `--glass-bg` + `--glass-blur` (24px) for frosted overlays (BottomNav, BottomSheet)
- **Three-tier surfaces**: Inputs → `surface-sunken`, Cards → `surface`, Modals/Sheets → `surface-elevated`

### Spacing

4px base grid: `--space-1` (4px) through `--space-24` (96px). Use multiples of 4.

### Transitions

- Durations: `--duration-fast` (100ms), `--duration-normal` (200ms), `--duration-slow` (350ms)
- Easings: `--ease-out` (decelerate), `--ease-in-out` (smooth), `--ease-spring` (bouncy)

### Usage Guidelines

- Use CSS variables (`var(--color-primary)`) in component styles
- Import from `designTokens.ts` only when you need values in JS (Framer Motion, inline styles, chart colors)
- Primary buttons: `background: var(--color-primary); color: var(--color-primary-text); box-shadow: var(--shadow-primary)`
- Cards: `background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-card)`
- Modals/Sheets: `background: var(--color-surface-elevated); box-shadow: var(--shadow-elevated)`
- Inputs: `background: var(--color-surface-sunken)`
- Text hierarchy: `--color-text` (primary), `--color-text-secondary` (supporting), `--color-text-muted` (tertiary)
- Headings auto-apply Syne via CSS base styles; no need to set font-family on each heading
- Never use hardcoded hex colors — always use CSS variables for theme compatibility
