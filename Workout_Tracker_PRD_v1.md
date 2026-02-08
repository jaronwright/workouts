# Product Requirements Document
## Workout Tracker

**A Modern Fitness Companion for Triathletes & Lifters**

---

**Version:** 1.0
**Date:** February 1, 2026
**Author:** Jaron Wright

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Target Audience](#3-target-audience)
4. [User Stories](#4-user-stories)
5. [Feature Requirements](#5-feature-requirements)
6. [Information Architecture](#6-information-architecture)
7. [Design System](#7-design-system)
8. [Technical Requirements](#8-technical-requirements)
9. [Data Model](#9-data-model)
10. [User Flows](#10-user-flows)
11. [Success Metrics](#11-success-metrics)
12. [Version Roadmap](#12-version-roadmap)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

Workout Tracker is a mobile-first fitness application designed for individuals training for triathlons while maintaining a strength training regimen. The app provides a flexible, cycle-based scheduling system that adapts to real-life inconsistencies, comprehensive workout logging across cardio, weights, and mobility disciplines, and lightweight social features for accountability.

### Key Differentiators

- **Cycle-based scheduling** (Days 1-7) that picks up where you left off, not tied to calendar days
- **Unified platform** for triathlon cardio training (swim, cycle, run, stair stepper) and weightlifting
- **Integrated mobility work** inspired by professional wellness programming (Bali Nirvana Life)
- **Clean, modern UI** with Nordic Forest color palette — moody, grounded, Scandinavian-inspired
- **Progressive overload suggestions** after consistent performance
- **PR tracking and celebration** to keep motivation high

---

## 2. Product Overview

### 2.1 Problem Statement

Athletes training for triathlons while maintaining strength often struggle with apps that are either cardio-focused OR lifting-focused. Additionally, most fitness apps tie workouts to specific weekdays, causing frustration when life interrupts a schedule. Missing Monday means either skipping that workout entirely or manually reorganizing the week.

### 2.2 Solution

Workout Tracker uses a **7-day cycle system** where days are numbered 1-7 rather than Monday-Sunday. When you complete Day 3, the app recommends Day 4 next time you open it, regardless of how many calendar days have passed. This approach eliminates guilt and confusion while maintaining program progression.

### 2.3 Workout Categories

The app organizes workouts into three primary categories:

| Category | Options | Notes |
|----------|---------|-------|
| **Cardio** | Swim, Cycle, Run, Stair Stepper | Swim uses interval structure; others are flexible |
| **Weights** | Push, Pull, Legs, Upper Body, Lower Body | Structured sets/reps with weight logging |
| **Mobility** | Hip/Knee/Ankle, Spine, Shoulder/Elbow/Wrist, Core Strengthening | 15 or 30 min options; inspired by Bali Nirvana Life |

---

## 3. Target Audience

### 3.1 Primary Users

The primary users are Jaron and his girlfriend, who share the following characteristics:

- Active weightlifters with established gym routines
- Training for triathlon events (swim, bike, run)
- Managing physical considerations (Jaron: partial meniscus removal; both: lower back sensitivity)
- Value simplicity and clean design over feature bloat
- Want lightweight accountability without invasive social features

### 3.2 Secondary Users

Friends and acquaintances who may sign up. The app should be intuitive enough for any fitness-minded individual to create their own schedule and track workouts without requiring the same triathlon focus.

### 3.3 User Personas

**Persona 1: The Hybrid Athlete (Jaron)**
- **Goals:** Complete a triathlon while maintaining strength gains
- **Pain Points:** Apps force choosing between cardio or lifting focus; rigid weekly schedules
- **Needs:** Flexibility to combine workout types in a single day; knee-friendly progressions

**Persona 2: The Consistent Partner**
- **Goals:** Stay consistent with partner; improve mobility for back pain
- **Pain Points:** Losing track of where in the program she is; forgetting to stretch
- **Needs:** Clear daily recommendations; easy-to-follow mobility routines

---

## 4. User Stories

### 4.1 Authentication

- As a new user, I want to sign up with my email, password, and gender so I can create my account
- As a returning user, I want to log in quickly so I can access my workout

### 4.2 Schedule Management

- As a user, I want to create a 7-day cycle schedule so my workouts adapt to my life
- As a user, I want to add multiple workouts to a single day (e.g., Swim + Mobility) so I can combine training
- As a user, I want to edit my schedule at any time so I can adjust as my goals change
- As a user, I want rest days to only be recommended after 3 consecutive workout days so I stay active

### 4.3 Workout Execution

- As a user, I want to see my recommended workout when I open the app so I know what to do today
- As a user, I want to choose a different workout if I prefer so I maintain autonomy
- As a user, I want to use a timer with preset intervals (30s, 45s, 1m, 1:30, 2m, 3m, 5m) for rest periods
- As a user, I want to log weight for each exercise so I can track progression
- As a user, I want some exercises to be simple checkboxes (warm-ups, cardio) for quick logging
- As a user, I want to see exercise notes (e.g., "protect low back") in subtle text so I remember form cues
- As a user, I want to tap an info icon to see a video/image of the exercise so I can check form
- As a user, I want warm-up sections to be collapsible/skippable so I can skip them if I warmed up already

### 4.4 Progressive Overload

- As a user, I want to receive a suggestion to increase weight after logging the same weight 2 times in a row
- As a user, I want to see my personal records celebrated when I hit a new max

### 4.5 Rest Days

- As a user, I want rest day suggestions (light walk, foam rolling, stretching) so rest days feel productive

### 4.6 History & Social

- As a user, I want to see my complete workout history so I can review past performance
- As a user, I want to see a feed of all users' recent workouts on the home page for accountability

---

## 5. Feature Requirements

### 5.1 Authentication (P0 - Must Have)

| Field | Requirements |
|-------|--------------|
| Email | Valid email format, used as unique identifier |
| Password | Minimum 8 characters, secure hashing |
| Gender | Options: Male, Female, Other |

### 5.2 Schedule System (P0 - Must Have)

- **Cycle-based:** Days numbered 1-7, not tied to calendar weekdays
- **Multi-workout days:** Users can assign multiple workouts to a single day
- **Single schedule:** One active schedule per user (editable)
- **Auto-advance:** After completing Day N, recommend Day N+1
- **Rest day logic:** Only recommend rest after 3 consecutive workout days

### 5.3 Timer (P0 - Must Have)

- Positioned at top of workout screen
- Manual trigger (not auto-start)
- Preset options: 30s, 45s, 1m, 1:30, 2m, 3m, 5m
- Visual countdown with audio/haptic alert on completion

### 5.4 Workout Logging (P0 - Must Have)

**Weights:**
- Log single weight value per exercise (applies to all sets)
- Display target sets × reps from program
- Show notes in subtle/light text (e.g., "control descent, ribs down")
- Collapsible warm-up section

**Cardio:**
- Simpler logging than weights (easier/faster)
- Track distance as primary metric
- Swim: Interval structure with warm-up sets
- Run/Cycle/Stair Stepper: Flexible user choice for structure

**Mobility:**
- Duration options: 15 min or 30 min (selected at start)
- Focus areas: Hip/Knee/Ankle, Spine, Shoulder/Elbow/Wrist
- Core Strengthening as a mobility option (moved from weights)
- Inspired by Bali Nirvana Life wellness programming

### 5.5 Exercise Information (P1 - Should Have)

- Info icon next to each exercise listing
- Tapping opens modal with video (in-app playback) and/or image
- Source: ExerciseDB API (free tier for v1)
- Graceful fallback if video unavailable (image only or placeholder)

### 5.6 Progressive Overload (P1 - Should Have)

- Track weight history per exercise per user
- After logging same weight 2 consecutive times, show suggestion: "Try increasing to [X] lbs"
- Suggestion is dismissible, not mandatory

### 5.7 Personal Records (P1 - Should Have)

- Auto-detect when user sets a new max weight on any exercise
- Celebrate with visual feedback (animation, badge, toast notification)
- Display PR history in user profile or exercise detail

### 5.8 Rest Day Activities (P1 - Should Have)

When rest day is selected/recommended, offer suggestions:
- Light walk (20-30 min)
- Foam rolling routine
- Gentle stretching

User can log rest day activity for engagement tracking.

### 5.9 History (P0 - Must Have)

- Complete log of all past workouts
- Show date, time, workout type, duration, completion status
- Tap to view workout details (exercises, weights logged)

### 5.10 Social Feed (P1 - Should Have)

- Home page section showing recent workouts from all users
- Sorted by recency (newest first)
- Display: User name, workout type, relative time ("2 hours ago")
- No comments/reactions in v1 (lightweight accountability only)

---

## 6. Information Architecture

### 6.1 Navigation Structure

Bottom navigation with three primary tabs:

1. **Home** — Recommended workout, social feed, quick start
2. **Workout** — Browse all workout options, start any workout
3. **History** — Past workout log, PRs, stats

### 6.2 Screen Map

**Authentication Flow:**
- Splash Screen
- Login Screen
- Sign Up Screen (email, password, gender)

**Main App:**
- Home (recommended workout, social feed)
- Workout Browser (categories → options)
- Active Workout (timer, exercise list, logging)
- Workout Complete (summary, PR celebration)
- History List
- Workout Detail (past workout review)
- Schedule Editor
- Settings / Profile

---

## 7. Design System

### 7.1 Design Philosophy

The design draws inspiration from **Anthropic's minimal, clean aesthetic** combined with a **Nordic Forest color palette** that evokes moody Scandinavian cabin vibes — grounded, natural, and sophisticated. The interface prioritizes whitespace, subtle animations, and intuitive interactions over feature density.

### 7.2 Color Palette: "Nordic Forest"

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary** | `#4A5D52` Deep Moss | `#6B8F7A` Soft Moss | Headers, primary buttons |
| **Secondary** | `#8C8578` Warm Stone | `#A69F94` Light Stone | Secondary elements, tags |
| **Accent** | `#C4745D` Burnt Sienna | `#D4896E` Warm Sienna | CTAs, highlights, PRs |
| **Cardio** | `#7A8B8C` Nordic Slate | `#92A3A4` Light Slate | Swim/Cycle/Run/Stairs |
| **Weights** | `#8B7262` Umber | `#A68B7A` Warm Umber | Push/Pull/Legs |
| **Mobility** | `#8A9A7A` Sage | `#9FB08F` Light Sage | Mobility + Core |
| **Background** | `#F5F3EF` Cream | `#1E2220` Deep Charcoal | App background |
| **Surface** | `#FDFCFA` Warm White | `#2A2E2C` Slate | Cards, modals |
| **Text Primary** | `#2D3230` Charcoal | `#EAE8E4` Cream | Main text |
| **Text Secondary** | `#6E7370` Muted | `#9A9D9B` Soft Gray | Subtitles, notes |

### 7.3 Typography

- **Primary Font:** Inter or SF Pro (system default)
- **Headings:** Semi-bold, Deep Moss (`#4A5D52`)
- **Body:** Regular weight, high contrast
- **Notes/Hints:** Light weight, Muted (`#6E7370`)

### 7.4 Components

- **Cards:** Rounded corners (12px), subtle shadow, warm white surface
- **Buttons:** Rounded (8px), primary moss or burnt sienna accent
- **Icons:** Simple, modern line icons (Lucide or similar)
- **Transitions:** Smooth 200-300ms ease-out animations

### 7.5 Dark Mode

Full dark mode support with Deep Charcoal (`#1E2220`) background and adjusted color brightness for accessibility. Colors shift slightly warmer/lighter to maintain vibrancy against dark surfaces.

---

## 8. Technical Requirements

### 8.1 Platform

- **Framework:** React (Vite) with TypeScript
- **Backend:** Supabase (Authentication, Database, Real-time)
- **Target:** Mobile-first PWA (Progressive Web App)
- **State Management:** Zustand (already in use)

### 8.2 API Integrations

**ExerciseDB API (v1):**
- Free tier for exercise images and GIFs
- Endpoint: `https://exercisedb.p.rapidapi.com`
- Cache responses locally to minimize API calls
- Graceful degradation if exercise not found

### 8.3 Performance Requirements

- App load time: < 3 seconds on 4G connection
- Workout logging: Real-time sync with optimistic updates
- Offline support: Allow workout logging when offline, sync on reconnect

---

## 9. Data Model

### 9.1 Core Entities

**Users**
```
id, email, password_hash, gender, created_at, current_day (1-7), consecutive_workout_days
```

**Schedules**
```
id, user_id, day_number (1-7), workout_ids[] (array for multi-workout days)
```

**Workouts**
```
id, name, category (cardio/weights/mobility), subcategory, duration_options[], exercises[]
```

**Exercises**
```
id, name, sets, reps, notes, section (warm-up/main/core), exercise_db_id
```

**WorkoutSessions**
```
id, user_id, workout_id, started_at, completed_at, status (in_progress/completed)
```

**ExerciseLogs**
```
id, session_id, exercise_id, weight, completed (boolean), logged_at
```

**PersonalRecords**
```
id, user_id, exercise_id, weight, achieved_at
```

---

## 10. User Flows

### 10.1 First-Time User Flow

1. User opens app, sees splash screen
2. Taps "Sign Up"
3. Enters email, password, selects gender
4. Prompted to create schedule (or use default template)
5. Selects workouts for Days 1-7
6. Lands on Home with Day 1 recommended

### 10.2 Daily Workout Flow

1. User opens app, sees recommended workout for today
2. Taps "Start Workout" (or browses alternatives)
3. For Mobility: Selects 15 or 30 min duration
4. Workout screen loads with timer at top
5. User progresses through exercises:
   - **Weights:** Logs weight, checks off sets
   - **Cardio:** Logs distance, checks completion
   - **Mobility:** Follows timed sequence, checks completion
6. Uses rest timer between sets as needed
7. Completes workout, sees summary
8. If PR achieved, celebration animation plays
9. App advances to recommend next day in cycle

### 10.3 Schedule Edit Flow

1. User navigates to Settings → Edit Schedule
2. Sees 7-day grid with current assignments
3. Taps a day to modify
4. Selects workout(s) from category picker
5. Can add multiple workouts to single day
6. Saves changes, returns to Home

---

## 11. Success Metrics

### 11.1 Engagement Metrics

- **Weekly Active Users (WAU):** Target 80%+ of registered users
- **Workout Completion Rate:** Target 70%+ of started workouts completed
- **Schedule Adherence:** Target 60%+ follow recommended workout

### 11.2 Progress Metrics

- **PRs Set:** Track total PRs across user base
- **Progressive Overload Adoption:** % of suggestions accepted

### 11.3 Retention

- **7-Day Retention:** Target 70%+
- **30-Day Retention:** Target 50%+

---

## 12. Version Roadmap

### 12.1 Version 1.0 (Current Scope)

- Authentication (email, password, gender)
- 7-day cycle schedule system
- All workout categories (Cardio, Weights, Mobility)
- Timer with presets
- Workout logging (weight, distance, completion)
- Exercise info via ExerciseDB
- Progressive overload suggestions
- PR tracking and celebration
- Rest day activity suggestions
- Collapsible warm-up sections
- Workout history
- Social feed (all users' recent workouts)
- Dark mode
- Nordic Forest color palette

### 12.2 Version 2.0 (Future)

- Wearable integration (Apple Watch, Garmin)
- Quick Start mode (condensed workouts)
- Custom workout builder
- Premium exercise video API
- Workout templates library
- Social reactions/comments
- Push notifications

---

## 13. Appendix

### 13.1 Sample Schedule

Example 7-day cycle for a triathlete maintaining strength:

| Day | Workout(s) |
|-----|------------|
| **1** | Push (Chest, Shoulders, Triceps) |
| **2** | Cycle + Mobility: Hip, Knee & Ankle |
| **3** | Pull (Back, Biceps, Rear Delts) |
| **4** | Swim (Intervals) + Mobility: Spine |
| **5** | Legs (Quads, Glutes, Hamstrings, Calves) |
| **6** | Run + Core Strengthening |
| **7** | Rest Day *(light walk, foam rolling suggested)* |

### 13.2 Color Palette Quick Reference

```
Light Mode                    Dark Mode
─────────────────────────────────────────────
Primary:    #4A5D52           #6B8F7A
Secondary:  #8C8578           #A69F94
Accent:     #C4745D           #D4896E
Cardio:     #7A8B8C           #92A3A4
Weights:    #8B7262           #A68B7A
Mobility:   #8A9A7A           #9FB08F
Background: #F5F3EF           #1E2220
Surface:    #FDFCFA           #2A2E2C
Text:       #2D3230           #EAE8E4
Text Muted: #6E7370           #9A9D9B
```

---

*— End of Document —*
