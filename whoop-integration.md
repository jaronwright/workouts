# WHOOP API Integration — Product Requirements Document

## Overview

Integrate the WHOOP wearable platform into the Workout Tracker PWA to surface recovery, sleep, strain, and workout data alongside the user's existing training log. This creates a feedback loop: users see how their body is recovering and can make smarter training decisions without leaving the app.

## Goals

1. **Recovery-aware training** — Show WHOOP recovery score on the Home page so users know whether to push hard or dial back.
2. **Holistic view** — Combine logged workout data (sets, reps, weight) with biometric data (HRV, resting HR, strain) in one place.
3. **Reduced manual entry** — Auto-import WHOOP-tracked workouts (cardio, sport activities) into the existing session history.
4. **Sleep visibility** — Display sleep quality metrics on the Rest Day page and History to reinforce recovery habits.

## Non-Goals

- Writing data back to WHOOP (the API is read-only).
- Replacing the existing workout logging flow — WHOOP data supplements, not replaces.
- Building a standalone WHOOP dashboard — data is woven into existing pages.
- Supporting other wearables (Garmin, Apple Watch, etc.) in this phase.

---

## WHOOP API Summary

**Base URL:** `https://api.prod.whoop.com/developer`
**Auth:** OAuth 2.0 (Authorization Code flow)
**Rate Limits:** Standard per-app limits (documented in WHOOP Developer Dashboard)
**Cost:** Free

### Endpoints We Will Use

| Endpoint | Method | Scope | Purpose |
|---|---|---|---|
| `/v1/cycle` | GET | `read:cycles` | Daily physiological cycles (strain, recovery, sleep linked) |
| `/v1/recovery` | GET | `read:recovery` | Recovery score, HRV, resting HR, SpO2, skin temp |
| `/v1/sleep` | GET | `read:sleep` | Sleep stages, duration, efficiency, respiratory rate |
| `/v1/workout` | GET | `read:workout` | WHOOP-tracked workouts (type, strain, HR zones, calories) |
| `/v1/body_measurement` | GET | `read:body_measurement` | Height, weight, max heart rate |
| `/v1/user/profile/basic` | GET | `read:profile` | WHOOP user ID and basic info |

### OAuth Scopes Requested

```
read:recovery read:sleep read:workout read:cycles read:body_measurement read:profile
```

All scopes are read-only. No write access is needed.

---

## Architecture

Follows existing codebase patterns: **Service → Hook → Component**, with Zustand for client-side caching and TanStack Query for server state.

### New Files

```
src/
├── services/
│   └── whoopService.ts          # WHOOP API calls + response transforms
├── hooks/
│   ├── useWhoop.ts              # TanStack Query hooks for WHOOP data
│   └── useWhoopConnection.ts    # OAuth connect/disconnect mutations
├── stores/
│   └── whoopStore.ts            # Zustand store for connection state + preferences
├── pages/
│   └── WhoopCallback.tsx        # OAuth callback handler (like AuthCallback.tsx)
├── components/
│   └── whoop/
│       ├── WhoopConnectCard.tsx  # "Connect WHOOP" CTA on Profile page
│       ├── RecoveryBanner.tsx    # Recovery score banner for Home page
│       ├── WhoopMetricsCard.tsx  # HRV / RHR / Strain stats card
│       └── SleepSummaryCard.tsx  # Sleep data card for Rest Day page
├── types/
│   └── whoop.ts                 # TypeScript interfaces for WHOOP API responses
supabase/
└── migrations/
    └── 2026XXXX_add_whoop_integration.sql
```

### Modified Files

```
src/pages/Home.tsx               # Add RecoveryBanner + WhoopMetricsCard
src/pages/RestDay.tsx            # Add SleepSummaryCard
src/pages/Profile.tsx            # Add WhoopConnectCard (connect/disconnect)
src/pages/History.tsx            # Show WHOOP strain alongside session entries
src/App.tsx                      # Add /whoop/callback route
src/config/workoutConfig.ts      # Add WHOOP sport type → display name mapping
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Profile Page                                               │
│  ┌───────────────────┐                                      │
│  │ Connect WHOOP btn │──→ Redirect to WHOOP OAuth           │
│  └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  WHOOP OAuth (external)                                     │
│  User authorizes → redirects to /whoop/callback?code=XXX    │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  WhoopCallback.tsx                                          │
│  1. Extract auth code from URL                              │
│  2. Exchange code for tokens via Supabase Edge Function      │
│  3. Store tokens in whoop_connections table                  │
│  4. Update whoopStore (Zustand)                             │
│  5. Redirect to Home                                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Home / RestDay / History pages                             │
│  useWhoopRecovery() ─→ whoopService.fetchRecovery()         │
│  useWhoopSleep()    ─→ whoopService.fetchSleep()            │
│  useWhoopWorkouts() ─→ whoopService.fetchWorkouts()         │
│       │                        │                            │
│       │              ┌─────────┴──────────┐                 │
│       │              │  WHOOP REST API     │                 │
│       │              │  (with access token)│                 │
│       │              └────────────────────┘                  │
│       ▼                                                     │
│  Components render metric cards                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `whoop_connections`

Stores per-user OAuth tokens and connection metadata. Follows the `user_profiles` pattern — primary key references `auth.users`.

```sql
CREATE TABLE whoop_connections (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  whoop_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can only read/update their own connection
ALTER TABLE whoop_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own whoop connection"
  ON whoop_connections FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own whoop connection"
  ON whoop_connections FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own whoop connection"
  ON whoop_connections FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own whoop connection"
  ON whoop_connections FOR DELETE
  USING (auth.uid() = id);

-- Auto-update timestamp trigger (same pattern as user_profiles)
CREATE TRIGGER update_whoop_connections_updated_at
  BEFORE UPDATE ON whoop_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### New Table: `whoop_metrics` (optional — Phase 2)

Caches historical WHOOP data locally for trend charts and offline access.

```sql
CREATE TABLE whoop_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  recovery_score INTEGER,          -- 0-100
  hrv_rmssd REAL,                  -- ms
  resting_heart_rate REAL,         -- bpm
  spo2 REAL,                       -- percentage
  skin_temp REAL,                  -- celsius
  strain_score REAL,               -- 0-21
  sleep_duration_minutes INTEGER,
  sleep_efficiency REAL,           -- percentage
  calories_total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE whoop_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own whoop metrics"
  ON whoop_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whoop metrics"
  ON whoop_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Token Management

### Why a Supabase Edge Function?

The OAuth token exchange requires the WHOOP **client secret**, which must never be exposed in client-side code. A Supabase Edge Function acts as a lightweight backend proxy.

### Edge Function: `whoop-auth`

```
supabase/functions/whoop-auth/index.ts
```

**Responsibilities:**
1. **Token exchange** — Receives auth code from client, exchanges it with WHOOP for access + refresh tokens using client secret.
2. **Token refresh** — Client calls this when access token is expired; function uses refresh token to get a new pair.
3. **Token revocation** — On disconnect, revokes the token with WHOOP and deletes the DB row.

**Endpoints (via request body `action` field):**

| Action | Input | Output |
|---|---|---|
| `exchange` | `{ code, redirect_uri }` | `{ access_token, refresh_token, expires_in, whoop_user_id }` |
| `refresh` | `{ refresh_token }` | `{ access_token, refresh_token, expires_in }` |
| `revoke` | `{ access_token }` | `{ success: true }` |

**Security:**
- Edge Function validates the Supabase JWT from the request — only authenticated users can call it.
- Client secret stored as a Supabase secret (`WHOOP_CLIENT_SECRET`), never sent to the browser.
- Tokens in `whoop_connections` are accessible only to the owning user via RLS.

### Token Refresh Flow

```
useWhoop hook detects token expiring within 5 min
  ↓
Calls whoopService.refreshTokens()
  ↓
Edge Function exchanges refresh token with WHOOP
  ↓
New tokens returned → update whoop_connections + whoopStore
  ↓
Original query retries with fresh token
```

TanStack Query's `retry` + a custom `queryFn` wrapper handles this transparently.

---

## Service Layer — `whoopService.ts`

Follows the `weatherService.ts` pattern: pure functions that call the WHOOP API and transform responses.

### Key Functions

```typescript
// Fetch today's recovery (or for a specific cycle)
fetchRecovery(accessToken: string, cycleId?: string): Promise<WhoopRecovery>

// Fetch recent sleep entries
fetchSleep(accessToken: string, startDate: string, endDate: string): Promise<WhoopSleep[]>

// Fetch recent workouts
fetchWorkouts(accessToken: string, startDate: string, endDate: string): Promise<WhoopWorkout[]>

// Fetch current cycle (today's physiological day)
fetchCurrentCycle(accessToken: string): Promise<WhoopCycle>

// Fetch body measurements
fetchBodyMeasurement(accessToken: string): Promise<WhoopBodyMeasurement>

// Helper: transform WHOOP sport ID → display name
getWhoopSportName(sportId: number): string

// Helper: recovery score → color (green/yellow/red)
getRecoveryColor(score: number): string

// Helper: determine if token needs refresh
isTokenExpiringSoon(expiresAt: number, bufferMs?: number): boolean
```

---

## Hook Layer

### `useWhoopConnection.ts`

Manages the OAuth lifecycle.

```typescript
useWhoopConnection()
  → isConnected: boolean
  → connect(): void          // Redirect to WHOOP OAuth
  → disconnect(): void       // Revoke token + delete DB row
  → isLoading: boolean

useWhoopCallback(code: string)
  → Exchanges code for tokens via Edge Function
  → Stores in DB + Zustand
  → Returns success/error state
```

### `useWhoop.ts`

Data-fetching hooks following `useWeather` patterns.

```typescript
useWhoopRecovery()
  → recovery: WhoopRecovery | null
  → isLoading, error
  → staleTime: 30 minutes

useWhoopSleep(startDate?, endDate?)
  → sleepEntries: WhoopSleep[]
  → isLoading, error
  → staleTime: 1 hour

useWhoopWorkouts(startDate?, endDate?)
  → workouts: WhoopWorkout[]
  → isLoading, error
  → staleTime: 1 hour

useWhoopStrain()
  → strain: number | null
  → isLoading, error
  → staleTime: 30 minutes
```

All hooks are **conditionally enabled** — they only fire when `isConnected` is true, preventing unnecessary API calls for users without WHOOP.

---

## Store Layer — `whoopStore.ts`

Follows `weatherStore.ts` pattern with Zustand `persist` middleware.

```typescript
interface WhoopState {
  // Connection state
  isConnected: boolean
  whoopUserId: string | null

  // Display preferences
  showRecoveryOnHome: boolean       // Toggle recovery banner
  showSleepOnRestDay: boolean       // Toggle sleep card

  // Actions
  setConnected: (userId: string) => void
  setDisconnected: () => void
  toggleRecoveryOnHome: () => void
  toggleSleepOnRestDay: () => void
}
```

**Note:** Access/refresh tokens are stored in the database (`whoop_connections`), NOT in the Zustand store. The store only holds non-sensitive connection state and UI preferences.

---

## UI Components

### 1. RecoveryBanner — Home Page

Shown at the top of the Home page (below the greeting, above Quick Stats) when WHOOP is connected.

```
┌──────────────────────────────────────────┐
│  🟢 Recovery: 84%                        │
│  HRV 68ms · RHR 52bpm · Strain 8.2      │
└──────────────────────────────────────────┘
```

- **Green** (67-100): "Ready to push"
- **Yellow** (34-66): "Monitor your effort"
- **Red** (0-33): "Prioritize recovery"
- Tapping opens a detail view with full cycle data
- Skeleton loader while data loads
- Gracefully hidden if WHOOP is disconnected or data unavailable

### 2. SleepSummaryCard — Rest Day Page

Added to the rest day page to reinforce recovery.

```
┌──────────────────────────────────────────┐
│  Sleep Summary                           │
│  7h 42m  ·  86% efficiency               │
│  ░░░░████████████░░  (sleep stages viz)  │
│  REM 1h 52m · Deep 1h 18m · Light 4h 32m│
└──────────────────────────────────────────┘
```

### 3. WhoopConnectCard — Profile Page

Connection management in the Profile page.

**Disconnected state:**
```
┌──────────────────────────────────────────┐
│  WHOOP                                   │
│  Connect your WHOOP to see recovery,     │
│  sleep, and strain data.                 │
│                                          │
│  [ Connect WHOOP ]                       │
└──────────────────────────────────────────┘
```

**Connected state:**
```
┌──────────────────────────────────────────┐
│  WHOOP  ·  Connected                     │
│  Last synced: 2 hours ago                │
│                                          │
│  ☑ Show recovery on Home                 │
│  ☑ Show sleep on Rest Day                │
│                                          │
│  [ Disconnect ]                          │
└──────────────────────────────────────────┘
```

### 4. WhoopMetricsCard — History Page

In the session detail view, if a matching WHOOP workout exists for that day, show:

```
┌──────────────────────────────────────────┐
│  WHOOP Data                              │
│  Strain: 14.2  ·  Avg HR: 142bpm        │
│  Calories: 487  ·  Max HR: 178bpm       │
└──────────────────────────────────────────┘
```

---

## Routing

Add one new route:

```typescript
{ path: '/whoop/callback', element: <WhoopCallback /> }  // Public route
```

The WHOOP OAuth redirect URI registered in the WHOOP Developer Dashboard will point to:
- **Local dev:** `http://localhost:5173/whoop/callback`
- **Production:** `https://www.jaronwright.com/whoop/callback`

---

## Phased Rollout

### Phase 1 — Connect + Recovery (MVP)

**Scope:**
- WHOOP OAuth flow (connect/disconnect on Profile page)
- Edge Function for token exchange/refresh/revoke
- `whoop_connections` table + migration
- `whoopService.ts` with `fetchRecovery` and `fetchCurrentCycle`
- `useWhoop` hook with `useWhoopRecovery`
- `RecoveryBanner` on Home page
- `WhoopConnectCard` on Profile page

**Value:** Users see their recovery score every day — the single most actionable WHOOP metric.

### Phase 2 — Sleep + Strain

**Scope:**
- `fetchSleep` and `fetchWorkouts` in service layer
- `useWhoopSleep` and `useWhoopStrain` hooks
- `SleepSummaryCard` on Rest Day page
- `WhoopMetricsCard` on History/session detail pages
- `whoop_metrics` table for caching historical data
- Trend charts (HRV over time, strain over time)

**Value:** Full biometric context alongside training data.

### Phase 3 — Smart Recommendations

**Scope:**
- Recovery-based workout suggestions on Home page
- "Low recovery" warning when starting a high-intensity workout
- Auto-import WHOOP workouts into `template_workout_sessions`
- Weekly recovery/training load summary

**Value:** The app actively helps users train smarter, not just track.

---

## Environment Variables

```bash
# .env.local (not prefixed with VITE_ — used by Edge Function only)
WHOOP_CLIENT_ID=your_client_id
WHOOP_CLIENT_SECRET=your_client_secret

# .env.local (prefixed — used by frontend for OAuth redirect)
VITE_WHOOP_CLIENT_ID=your_client_id
VITE_WHOOP_REDIRECT_URI=http://localhost:5173/whoop/callback
```

The client ID is safe to expose (it's in the OAuth redirect URL). The client secret is only used server-side in the Edge Function.

---

## WHOOP Developer App Setup

1. Register at [developer.whoop.com](https://developer.whoop.com)
2. Create a new app in the Developer Dashboard
3. Set redirect URIs:
   - `http://localhost:5173/whoop/callback` (dev)
   - `https://www.jaronwright.com/whoop/callback` (prod)
4. Request scopes: `read:recovery read:sleep read:workout read:cycles read:body_measurement read:profile`
5. Copy Client ID and Client Secret into `.env.local`

---

## Error Handling

| Scenario | Behavior |
|---|---|
| WHOOP not connected | Hooks return null, components hidden gracefully |
| Token expired | Auto-refresh via Edge Function; retry query |
| Refresh token invalid | Set `is_active = false`, show "Reconnect WHOOP" prompt |
| WHOOP API rate limited | TanStack Query retry with backoff (3 attempts) |
| WHOOP API down | Show cached data if available, "Data unavailable" otherwise |
| Network offline | PWA serves cached responses; WHOOP data shows last known values |
| User revokes access on WHOOP.com | Next API call fails → mark disconnected, prompt reconnect |

---

## Testing Strategy

Following existing patterns (`__tests__` directories, vitest, React Testing Library):

- **Service tests:** Mock `fetch` calls, verify request URLs/headers, test response transforms
- **Hook tests:** Mock service functions, verify query keys, test enabled/disabled states, test token refresh flow
- **Component tests:** Mock hooks, verify connected/disconnected renders, test loading/error states
- **Edge Function tests:** Test token exchange, refresh, and revocation flows with mocked WHOOP responses
- **Integration tests:** Full OAuth callback flow with mocked WHOOP API

---

## Open Questions

1. **Token encryption** — Should we encrypt access/refresh tokens at rest in `whoop_connections`? Supabase RLS prevents unauthorized access, but encryption adds defense-in-depth. Trade-off: adds complexity to the Edge Function.
2. **Historical backfill** — On first connect, should we backfill the last 30 days of WHOOP data into `whoop_metrics`? Useful for trends but adds initial sync time.
3. **Webhook vs. polling** — WHOOP supports webhooks for new data. For Phase 1, polling via TanStack Query stale times is simpler. Webhooks could be added in Phase 2 for real-time updates.
4. **Multi-device** — If a user logs in on multiple devices, tokens are in the DB (not just local storage), so this works. But should we sync `whoopStore` preferences across devices via DB?
