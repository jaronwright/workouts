# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workout Tracker PWA - A Progressive Web App for tracking Push/Pull/Legs workouts with Supabase backend. Users can manage a 3-day workout split, log exercises, track weights/reps, and view workout history with offline support.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # TypeScript compilation + Vite production build
npm run lint      # Run ESLint on all files
npm run preview   # Preview production build locally
```

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite, TailwindCSS 4
- **State**: TanStack Query (server state), Zustand (client state)
- **Backend**: Supabase (auth + PostgreSQL with RLS)
- **PWA**: vite-plugin-pwa with Workbox for offline caching

## Architecture

### Data Flow
1. **Authentication**: `useAuth` hook → `authStore` (Zustand) → Supabase Auth
2. **Workout Data**: Pages → custom hooks (`useWorkoutPlan`, `useWorkoutSession`) → TanStack Query → `workoutService` → Supabase
3. **Active Session State**: `workoutStore` (Zustand) manages active workout, completed sets, rest timer

### Key Directories
- `src/pages/` - Route components (Auth, Home, Workout, History, SessionDetail)
- `src/components/` - UI (`ui/`), layout (`layout/`), workout-specific (`workout/`)
- `src/hooks/` - React Query hooks wrapping workoutService calls
- `src/services/` - Supabase client and all database operations (`workoutService.ts`)
- `src/stores/` - Zustand stores for auth and workout state
- `src/types/` - TypeScript types including Supabase-generated database types

### Database Schema
- `workout_plans` → `workout_days` → `exercise_sections` → `plan_exercises` (workout structure)
- `workout_sessions` → `exercise_sets` (user's logged data)
- RLS policies ensure users only access their own session data

### Routing
Protected routes require authentication. Routes: `/auth` (public), `/` (home), `/workout/:dayId`, `/workout/:dayId/active`, `/history`, `/history/:sessionId`

## Configuration

- Path alias: `@/` maps to `./src/`
- Environment variables in `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Supabase migrations in `supabase/migrations/` (run in order: schema first, then seed)
- PWA caches Supabase API calls with NetworkFirst strategy

## Important Notes

- Only one active workout session per user at a time (enforced by RLS)
- Database has cascading deletes configured
- React Query uses 5-minute stale time
- All timestamps are TIMESTAMPTZ (timezone-aware)
