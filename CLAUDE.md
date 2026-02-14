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
- **Exercise Data**: ExerciseDB (V2 RapidAPI primary, V1 OSS fallback) with localStorage cache
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
7. **Exercise Details**: `useExerciseGif` → `exerciseDbService` → ExerciseDB API, cached in localStorage (7-day TTL for hits, 1-hour TTL for misses)

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
- Optional: `VITE_RAPIDAPI_KEY` for ExerciseDB V2 API (falls back to free V1 OSS without it)
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
- Exercise name matching uses a mapping table + plural stripping + fuzzy scoring + keyword fallback
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

Premium fitness brand design system. All tokens defined as CSS custom properties in `index.css` and mirrored as TypeScript constants in `src/config/designTokens.ts`.

### Typography

- **Headings**: Syne (weights 600-800) — bold, expressive, geometric
- **Body**: DM Sans (weights 400-700) — clean, highly readable
- **Loaded via**: Google Fonts `<link>` in `index.html`
- Headings get `font-family: var(--font-heading)` automatically via `h1-h6` base styles
- Body text inherits `var(--font-body)` from `<body>`
- Type scale: `--text-xs` (12px) through `--text-5xl` (48px)
- Headings: `letter-spacing: var(--tracking-tight)`, `line-height: var(--leading-tight)`

### Color Palette

| Role | Light | Dark | Purpose |
|------|-------|------|---------|
| Primary | `#CCFF00` Electric Lime | `#CCFF00` | Primary CTAs, active states, brand identity |
| Accent | `#FF6B35` Warm Ember | `#FF7F4D` | Secondary actions, warmth, notifications |
| Tertiary | `#4ECDC4` Cool Teal | `#5BDED5` | Informational, calm, tertiary actions |
| Weights | `#3B82F6` Electric Blue | `#60A5FA` | Weights workout type |
| Cardio | `#FF3366` Hot Pink | `#FF5C8A` | Cardio workout type |
| Mobility | `#34D399` Sage Green | `#4ADE80` | Mobility workout type |
| Background | `#F7F7F8` | `#0D0D0F` Warm black | Page background |
| Surface | `#FFFFFF` | `#1A1A1F` | Cards, modals |
| Surface Elevated | `#FFFFFF` | `#252529` | Elevated cards, dropdowns |

- Primary accent uses dark text (`--color-primary-text: #0D0D0F`) since lime is light
- Every color has a `*-muted` variant at ~10-15% opacity for subtle backgrounds
- Status: success (green), warning (amber), danger (red), info (blue)

### Shape & Depth

- **Radius scale**: `--radius-sm` (6px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-xl` (24px), `--radius-2xl` (32px), `--radius-full` (pill)
- **Shadow scale**: 5 levels (`xs` through `xl`) plus colored shadows (`--shadow-primary`, `--shadow-accent`)
- **Glass**: `--glass-bg` + `--glass-blur` (16px) for frosted overlays

### Spacing

4px base grid: `--space-1` (4px) through `--space-24` (96px). Use multiples of 4.

### Transitions

- Durations: `--duration-fast` (100ms), `--duration-normal` (200ms), `--duration-slow` (350ms)
- Easings: `--ease-out` (decelerate), `--ease-in-out` (smooth), `--ease-spring` (bouncy)

### Usage Guidelines

- Use CSS variables (`var(--color-primary)`) in component styles
- Import from `designTokens.ts` only when you need values in JS (Framer Motion, inline styles, chart colors)
- Primary buttons: `background: var(--color-primary); color: var(--color-primary-text)`
- Cards: `background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm)`
- Text hierarchy: `--color-text` (primary), `--color-text-secondary` (supporting), `--color-text-muted` (tertiary)
- Headings auto-apply Syne via CSS base styles; no need to set font-family on each heading
