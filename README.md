# Workout Tracker PWA

A Progressive Web App for tracking Push/Pull/Legs workouts with Supabase backend.

## Setup

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

1. Copy contents of `supabase/migration.sql` and run it
2. Copy contents of `supabase/seed.sql` and run it to import the workout plan

### 2. Configure Environment

Create `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Enable Auth in Supabase

1. Go to Authentication > Providers
2. Enable Email provider
3. Disable "Confirm email" for easier testing (optional)

## Features

- 3-day Push/Pull/Legs workout plan
- Track sets, reps, and weights
- Rest timer with presets
- Workout history
- Works offline (PWA)
- Multi-user support with RLS

## Tech Stack

- React + TypeScript + Vite
- Supabase (Auth + Database)
- TailwindCSS
- Zustand (state)
- TanStack Query (data fetching)
- PWA with Workbox
