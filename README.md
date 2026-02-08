<div align="center">

# FitTrack

**A full-stack Progressive Web App for structured workout tracking**

Built with React 19, TypeScript, Supabase, and modern frontend architecture.

[Live Demo](https://workouts-ashy.vercel.app) · [Report Bug](https://github.com/jaronwright/workouts/issues)

![TypeScript](https://img.shields.io/badge/TypeScript-98.8%25-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tests](https://img.shields.io/badge/Tests-985_passing-22c55e?style=flat-square)
![Coverage](https://img.shields.io/badge/Coverage-65%25+-eab308?style=flat-square)

</div>

---

## Overview

FitTrack is a mobile-first workout tracker designed for people who follow structured training programs. Rather than logging ad-hoc exercises, it provides a cyclical 7-day schedule system where users configure their training split once and follow it day by day — similar to how real strength training programs work.

The app supports three workout modalities (weights, cardio, and mobility), includes progression tracking with personal record detection, and works offline as an installable PWA. The backend is fully secured with Supabase Row Level Security, ensuring multi-user data isolation at the database level.

**14,400+ lines of application code · 15,100+ lines of test code · 985 tests across 78 files**

---

## Key Features

### Training System
- **Cyclical 7-day schedule** — not calendar-based, so your split repeats regardless of which day of the week it is
- **Predefined workout splits** — Push/Pull/Legs and Upper/Lower, with the schedule auto-populated on selection
- **Per-exercise weight tracking** with automatic last-weight recall and unit conversion (lbs/kg)
- **Progression engine** — suggests weight increases based on your history and detects personal records with in-app celebrations
- **Rest timer** — configurable presets (30s to 5min) with haptic feedback when complete

### Workout Types
- **Weights** — structured sessions with grouped sections (warmup, main work, accessories), individual set logging, and completion tracking
- **Cardio** — templates for running, cycling, stair stepper, swimming, and rowing with either manual entry or a live timer
- **Mobility** — guided templates for core stability, hip/knee/ankle flow, spine mobility, and upper body work
- **Rest days** — recovery activity suggestions (foam rolling, stretching, yoga) with completion tracking

### User Experience
- **Guided onboarding** — 3-step wizard that walks new users through split selection and schedule setup
- **Home dashboard** — time-of-day greeting, current streak, weekly count, active session resume banner, and quick-launch cards for every workout type
- **Calendar history** — interactive monthly view with workout indicators, day-detail bottom sheets, and session breakdowns
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
┌─────────────────────────────────────────────────────┐
│                    React 19 + Vite                   │
├──────────┬──────────┬──────────┬────────────────────┤
│  Pages   │Components│  Hooks   │      Stores        │
│          │          │          │    (Zustand)        │
│ Home     │ UI       │ useAuth  │ authStore           │
│ Workout  │ Workout  │ useWork  │ workoutStore        │
│ Cardio   │ Calendar │ useSched │ themeStore          │
│ Mobility │ Profile  │ useProf  │ settingsStore       │
│ History  │ Auth     │ useHist  │ toastStore          │
│ Profile  │ Onboard  │ usePR    │                    │
│ Schedule │ Layout   │ useTheme │                    │
├──────────┴──────────┴──────────┴────────────────────┤
│              Services (Data Access Layer)            │
│  workoutService · scheduleService · profileService   │
│  templateWorkoutService · progressionService         │
│  avatarService · prService                           │
├─────────────────────────────────────────────────────┤
│            Supabase (PostgreSQL + Auth)              │
│    12 tables · RLS policies · Storage (avatars)      │
│    14 migrations · Seed data with full exercise DB   │
└─────────────────────────────────────────────────────┘
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

The schema is managed through 14 incremental migrations, supporting a full exercise-tracking data model:

```text
workout_plans ──→ workout_days ──→ exercise_sections ──→ plan_exercises
                                         │
                              workout_sessions ──→ exercise_sets

user_schedules (day → workout_day | template | rest)
profiles (display name, gender, avatar, cycle start, selected plan)
workout_templates ──→ template_workouts (cardio/mobility sessions)
```

Every user-scoped table enforces Row Level Security. Workout plans and templates are read-only shared data; user sessions, schedules, and profiles are isolated per user.

---

## Testing

The test suite covers the full stack with 985 tests across 78 files:

| Category | Files | Tests | What's Covered |
|----------|-------|-------|----------------|
| **Utilities** | 8 | 208 | Formatters, validators, date/cycle calculations, parsing |
| **Components** | 18 | 186 | All UI primitives, workout controls, calendar, auth |
| **Hooks** | 15 | 136 | Auth, data fetching, theme, workout session lifecycle |
| **Services** | 8 | 100 | CRUD operations, error handling, Supabase integration |
| **Stores** | 5 | 65 | State mutations, persistence, timer logic |
| **Pages** | 14 | 208 | Render tests + full workflow simulations |
| **Edge Cases** | 2 | 82 | Boundary values, error states, malformed input |

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
│   ├── ui/            # Button, Card, Modal, Toast, BottomSheet, etc.
│   └── workout/       # ExerciseCard, RestTimer, PRCelebration, etc.
├── config/            # Workout types, rest day activities, animations
├── hooks/             # Custom hooks for auth, data, UI concerns
├── pages/             # Route-level page components
├── services/          # Supabase data access layer
├── stores/            # Zustand state stores
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
