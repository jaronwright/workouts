<div align="center">

# FitTrack

**A full-stack Progressive Web App for structured workout tracking**

Built with React 19, TypeScript, Supabase, and modern frontend architecture.

[Live Demo](https://workouts-ashy.vercel.app) · [Report Bug](https://github.com/jaronwright/workouts/issues)

![TypeScript](https://img.shields.io/badge/TypeScript-98.8%25-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tests](https://img.shields.io/badge/Tests-1921_passing-22c55e?style=flat-square)
![Coverage](https://img.shields.io/badge/Coverage-65%25+-eab308?style=flat-square)

</div>

---

## Overview

FitTrack is a mobile-first workout tracker designed for people who follow structured training programs. Rather than logging ad-hoc exercises, it provides a cyclical 7-day schedule system where users configure their training split once and follow it day by day — similar to how real strength training programs work.

The app supports three workout modalities (weights, cardio, and mobility), includes progression tracking with personal record detection, and works offline as an installable PWA. The backend is fully secured with Supabase Row Level Security, ensuring multi-user data isolation at the database level.

**17,000+ lines of application code · 28,700+ lines of test code · 1,900+ tests across 98 files**

---

## Key Features

### Training System
- **Cyclical 7-day schedule** — not calendar-based, so your split repeats regardless of which day of the week it is
- **Predefined workout splits** — Push/Pull/Legs, Upper/Lower, and Glute Hypertrophy, with the schedule auto-populated on selection
- **Per-exercise weight tracking** with automatic last-weight recall and unit conversion (lbs/kg)
- **Progression engine** — suggests weight increases based on your history and detects personal records with in-app celebrations
- **Rest timer** — configurable presets (30s to 5min) with haptic feedback when complete

### Workout Types
- **Weights** — structured sessions with grouped sections (warmup, main work, accessories), individual set logging, and completion tracking
- **Cardio** — templates for running, cycling, stair stepper, swimming, rowing, and boxing with either manual entry or a live timer
- **Mobility** — guided templates for core stability, hip/knee/ankle flow, spine mobility, and upper body work
- **Rest days** — recovery activity suggestions (foam rolling, stretching, yoga) with completion tracking

### User Experience
- **Guided onboarding** — 3-step wizard that walks new users through split selection and schedule setup
- **Home dashboard** — time-of-day greeting, current streak, weekly count, weather card, active session resume banner, and quick-launch cards for every workout type
- **Calendar history** — interactive monthly view with workout indicators, day-detail bottom sheets, and session breakdowns
- **Community feed** — social activity feed showing recent workouts across users
- **Weather integration** — current conditions via Open-Meteo API with location-based forecasts
- **Feedback system** — in-app bug reports and feature requests
- **Light / Dark / System theming** with CSS custom properties for instant switching
- **Installable PWA** with offline support via Workbox service worker and network-first caching for API calls

### Account & Security
- Email/password and Google OAuth authentication
- Password strength validation with visual indicator
- Session management with "remember me" control
- Full account deletion with cascading data removal
- Row Level Security on every database table

---

## Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     React 19 + Vite                       │
├──────────┬───────────┬───────────┬───────────────────────┤
│  Pages   │Components │  Hooks    │       Stores          │
│          │           │           │      (Zustand)        │
│ Home     │ UI        │ useAuth   │ authStore             │
│ Workout  │ Workout   │ useWork   │ workoutStore          │
│ Cardio   │ Calendar  │ useSched  │ themeStore            │
│ Mobility │ Profile   │ useProf   │ settingsStore         │
│ History  │ Auth      │ useHist   │ toastStore            │
│ Profile  │ Onboard   │ usePR     │ weatherStore          │
│ Schedule │ Layout    │ useTheme  │                       │
│ RestDay  │ Weather   │ useWeather│                       │
│ Community│ Social    │ useSocial │                       │
│          │ Stats     │ useFeedbk │                       │
├──────────┴───────────┴───────────┴───────────────────────┤
│                Services (Data Access Layer)               │
│  workoutService · scheduleService · profileService        │
│  templateWorkoutService · progressionService              │
│  avatarService · prService · socialService                │
│  weatherService · feedbackService · exerciseDbService     │
├──────────────────────────────────────────────────────────┤
│              Supabase (PostgreSQL + Auth)                 │
│    14 tables · RLS policies · Storage (avatars)           │
│    19 migrations · Seed data with full exercise DB        │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 19 + TypeScript 5.9 | Strict typing, latest concurrent features |
| **Build** | Vite 7 | Fast HMR, tree-shaking, code splitting |
| **Routing** | React Router 7 | File-based-style routing with lazy loading |
| **Server State** | TanStack Query 5 | Cache invalidation, optimistic updates, stale-while-revalidate |
| **Client State** | Zustand 5 | Lightweight stores with selective persistence |
| **Styling** | Tailwind CSS 4 | Utility-first with CSS variable theming |
| **Animation** | Motion (Framer Motion) | Page transitions, counter animations, gesture support |
| **Backend** | Supabase | Postgres, Auth, Storage, RLS — no custom server needed |
| **PWA** | vite-plugin-pwa + Workbox | Service worker, offline caching, install prompt |
| **Testing** | Vitest + React Testing Library + MSW | Unit, integration, and workflow tests with API mocking |

### Data Flow

```text
User Interaction
    → Component (local state + animations)
    → Custom Hook (useWorkout, useSchedule, etc.)
    → TanStack Query (caching, deduplication, background refetch)
    → Service function (Supabase client call)
    → PostgreSQL (RLS-filtered response)
    → Back up through the same chain
```

State is split intentionally: **Zustand** handles ephemeral UI state (active workout session, rest timer, theme), while **TanStack Query** manages all server-derived data with automatic cache invalidation after mutations.

---

## Database Schema

The schema is managed through 19 incremental migrations, supporting a full exercise-tracking data model:

```text
workout_plans ──→ workout_days ──→ exercise_sections ──→ plan_exercises
                                         │
                              workout_sessions ──→ exercise_sets

user_schedules (day → workout_day | template | rest)
user_profiles (display name, gender, avatar, cycle start, selected plan)
workout_templates ──→ template_workout_sessions (cardio/mobility sessions)
user_feedback (bug reports, feature requests)
```

Every user-scoped table enforces Row Level Security. Workout plans and templates are read-only shared data; user sessions, schedules, and profiles are isolated per user.

---

## Testing

The test suite covers the full stack with 1,900+ tests across 98 files:

| Category | Files | What's Covered |
|----------|-------|----------------|
| **Utilities** | 11 | Formatters, validators, date/cycle calculations, parsing |
| **Components** | 24 | All UI primitives, workout controls, calendar, auth, weather |
| **Hooks** | 18 | Auth, data fetching, theme, weather, social, workout session lifecycle |
| **Services** | 14 | CRUD operations, error handling, Supabase integration |
| **Stores** | 10 | State mutations, persistence, timer logic, weather caching |
| **Pages** | 14 | Render tests + full workflow simulations |
| **Config** | 5 | Workout config, plan constants, animation config |
| **Integration** | 2 | End-to-end workflow simulations |

Tests use **MSW** (Mock Service Worker) to intercept Supabase API calls, enabling realistic integration tests without a running database.

```bash
npm run test:run        # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:ui         # Interactive test UI
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/jaronwright/workouts.git
cd workouts
npm install
```

### 2. Configure Supabase

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

In your Supabase SQL Editor, run the migrations in order from `supabase/migrations/`. The seed migration includes a complete exercise database for both PPL and Upper/Lower splits.

### 4. Enable Authentication

In Supabase Dashboard → Authentication → Providers:
- Enable **Email** provider
- Optionally enable **Google** OAuth
- Optionally disable "Confirm email" for local development

### 5. Run

```bash
npm run dev     # Development server at localhost:5173
npm run build   # Production build
npm run preview # Preview production build locally
```

---

## Project Structure

```text
src/
├── components/
│   ├── auth/          # PasswordStrengthIndicator, VerificationBanner
│   ├── calendar/      # CalendarGrid, CalendarDayCell, SelectedDayPanel
│   ├── layout/        # AppShell, Header, BottomNav
│   ├── onboarding/    # OnboardingWizard, OnboardingDayRow
│   ├── profile/       # AvatarUpload
│   ├── schedule/      # ScheduleDayEditor
│   ├── social/        # ActivityFeed
│   ├── stats/         # StatsGrid
│   ├── ui/            # Button, Card, Modal, Toast, BottomSheet, etc.
│   ├── weather/       # WeatherCard
│   └── workout/       # ExerciseCard, RestTimer, PRCelebration, etc.
├── config/            # Workout types, rest day activities, animations
├── hooks/             # Custom hooks for auth, data, weather, social
├── pages/             # Route-level page components (16 pages)
├── services/          # Supabase data access layer (12 services)
├── stores/            # Zustand state stores (6 stores)
├── types/             # TypeScript type definitions
└── utils/             # Pure utility functions
```

---

## License

This project is for portfolio and educational purposes.

---

<div align="center">
  <sub>Built by <a href="https://github.com/jaronwright">Jaron Wright</a></sub>
</div>
