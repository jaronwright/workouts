# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workout Tracker PWA - A Progressive Web App for tracking workouts with Supabase backend. Users can manage customizable workout schedules (weights, cardio, mobility), log exercises, track weights/reps, view workout history, check weather, submit feedback, and see community activity — all with offline support.

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

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, TailwindCSS 4
- **State**: TanStack Query (server state), Zustand (client state)
- **Animation**: Framer Motion (`motion/react`)
- **Backend**: Supabase (auth + PostgreSQL with RLS)
- **Weather**: Open-Meteo API (free, no API key required)
- **PWA**: vite-plugin-pwa with Workbox for offline caching

## Architecture

### Data Flow
1. **Authentication**: `useAuth` hook → `authStore` (Zustand) → Supabase Auth
2. **Workout Data**: Pages → custom hooks (`useWorkoutPlan`, `useWorkoutSession`) → TanStack Query → `workoutService` → Supabase
3. **Profile/Schedule/Templates**: Same pattern — `useProfile`, `useSchedule`, `useTemplateWorkout` hooks → TanStack Query → corresponding services → Supabase
4. **Active Session State**: `workoutStore` (Zustand) manages active workout, completed sets, rest timer
5. **Weather**: `useWeather` hook → `weatherService` → Open-Meteo API, cached in `weatherStore` (Zustand)
6. **Feedback**: `useFeedback` hook → `feedbackService` → Supabase `user_feedback` table

### Key Directories
- `src/pages/` - Route components (Home, Workout, WorkoutSelect, CardioWorkout, MobilityWorkout, MobilityDurationPicker, History, SessionDetail, CardioSessionDetail, Profile, Schedule, RestDay, Community, Auth, AuthCallback)
- `src/components/` - UI (`ui/`), layout (`layout/`), workout-specific (`workout/`), onboarding (`onboarding/`), profile (`profile/`), schedule (`schedule/`), calendar (`calendar/`), stats (`stats/`), social (`social/`), weather (`weather/`), auth (`auth/`)
- `src/hooks/` - React Query hooks wrapping service calls
- `src/services/` - Supabase client and database operations: `workoutService`, `profileService`, `scheduleService`, `templateWorkoutService`, `avatarService`, `progressionService`, `prService`, `socialService`, `exerciseDbService`, `weatherService`, `feedbackService`
- `src/stores/` - Zustand stores: `authStore`, `workoutStore`, `settingsStore` (weight units), `themeStore` (dark mode), `toastStore`, `weatherStore` (location cache, temp unit)
- `src/config/` - `workoutConfig.ts` (centralized style/display-name mappings), `planConstants.ts` (plan IDs), `animationConfig.ts` (Framer Motion variants), `defaultAvatars.ts`, `restDayActivities.ts`
- `src/types/` - TypeScript types including Supabase-generated database types

### Database Schema
- `workout_plans` → `workout_days` → `exercise_sections` → `plan_exercises` (workout structure)
- `workout_sessions` → `exercise_sets` (user's logged data)
- `template_workout_sessions` (cardio/mobility logged sessions, linked to `workout_templates`)
- `user_profiles` (display name, gender, avatar, selected plan, cycle start date)
- `user_schedules` (day-of-week → workout day mapping, supports multiple workouts per day)
- `workout_templates` (cardio/mobility templates with categories and durations)
- `user_feedback` (bug reports and feature requests)
- RLS policies ensure users only access their own data

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
- Supabase migrations in `supabase/migrations/` (run in order: schema first, then seed)
- PWA caches Supabase API calls with NetworkFirst strategy

## Testing

- Test files use `__tests__` directories adjacent to source (e.g., `src/utils/__tests__/`)
- Test setup in `src/test/setup.ts` with Supabase mocks in `src/test/mocks/`
- Test utilities including custom render with providers in `src/test/utils.tsx`
- Uses jsdom environment with React Testing Library
- Comprehensive tests use `.comprehensive.test.ts` suffix; edge case tests use `.edgecases.test.ts`

## Important Notes

- Only one active workout session per user at a time (enforced by RLS)
- Database has cascading deletes configured
- React Query uses 5-minute stale time
- All timestamps are TIMESTAMPTZ (timezone-aware)
- Card component includes `position: relative` to contain absolute-positioned overlays (gradients, etc.)
- Weather uses geolocation (permission prompt on first visit); data cached in Zustand store
- Cardio workout page shows last session data instead of static target duration
- Bottom nav uses Material 3-style animated pill indicator for active state
