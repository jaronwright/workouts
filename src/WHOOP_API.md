# WHOOP Developer API - Comprehensive Reference

## Table of Contents

- [Overview](#overview)
- [Full API Capabilities](#full-api-capabilities)
- [Authentication (OAuth 2.0)](#authentication-oauth-20)
- [How to Get API Keys](#how-to-get-api-keys)
- [Rate Limits](#rate-limits)
- [Data Available in Detail](#data-available-in-detail)
- [Integration Ideas for Workout Tracker PWA](#integration-ideas-for-workout-tracker-pwa)
- [Technical Integration Plan](#technical-integration-plan)
- [Limitations and Considerations](#limitations-and-considerations)
- [Code Examples](#code-examples)

---

## Overview

### What is WHOOP?

WHOOP is a wearable fitness tracker (a screenless strap worn on the wrist or body) focused on three core pillars: **Recovery**, **Strain**, and **Sleep**. Unlike step-counting fitness trackers, WHOOP continuously monitors physiological signals 24/7 (heart rate, HRV, skin temperature, blood oxygen, accelerometer data) and distills them into actionable scores that guide training decisions.

Key WHOOP concepts:

- **Recovery (0-100%)**: A daily score calculated each morning reflecting how prepared your body is to take on strain. Based on HRV, resting heart rate, respiratory rate, sleep performance, SpO2, and skin temperature.
- **Strain (0-21 scale)**: Measures cardiovascular load accumulated throughout the day from workouts and general activity. Based on the Borg Scale of Perceived Exertion. The scale is non-linear -- it takes exponentially more effort to increase strain at higher values.
- **Sleep Performance**: How well you slept relative to your body's calculated sleep need, factoring in sleep debt, recent strain, and naps.

### What is the WHOOP Developer API?

The WHOOP Developer Platform (https://developer.whoop.com) provides a RESTful API that allows third-party applications to access a WHOOP member's physiological data with their consent. The API uses OAuth 2.0 for authentication and provides endpoints for retrieving recovery scores, strain data, sleep metrics, workout details, cycle information, and user profiles.

The current version is **v2** (v1 has been deprecated). The API also supports **webhooks** for real-time event notifications instead of polling.

**Base URL**: `https://api.prod.whoop.com/developer`

---

## Full API Capabilities

### API Endpoints Reference

All endpoints require Bearer token authentication via OAuth 2.0.

#### User / Profile

| Method | Endpoint | Scope Required | Description |
|--------|----------|----------------|-------------|
| GET | `/v1/user/profile/basic` | `read:profile` | Get user profile (name, email) |
| GET | `/v1/user/measurement/body` | `read:body_measurement` | Get body measurements (height, weight, max HR) |

**Profile Response Fields:**
- `user_id` (int64) - Unique WHOOP user identifier
- `email` (string) - User's email address
- `first_name` (string) - First name
- `last_name` (string) - Last name

**Body Measurement Response Fields:**
- `height_meter` (float) - Height in meters
- `weight_kilogram` (float) - Weight in kilograms
- `max_heart_rate` (int32) - WHOOP-calculated max heart rate

#### Cycle (Physiological Day)

| Method | Endpoint | Scope Required | Description |
|--------|----------|----------------|-------------|
| GET | `/v1/cycle` | `read:cycles` | Get all cycles (paginated, descending by start time) |
| GET | `/v1/cycle/{cycleId}` | `read:cycles` | Get a specific cycle by ID |

A "Cycle" in WHOOP represents a physiological day -- starting when you wake up and ending when you wake up the next day.

**Cycle Response Fields:**
- `id` (int64) - Unique cycle identifier
- `user_id` (int64) - WHOOP user ID
- `created_at` (datetime) - When recorded
- `updated_at` (datetime) - Last update
- `start` (datetime) - Cycle start time
- `end` (datetime) - Cycle end time (absent if cycle is ongoing)
- `timezone_offset` (string) - Timezone in TZD format
- `score_state` (enum) - `SCORED`, `PENDING_SCORE`, or `UNSCORABLE`
- `score` (object, present only when `score_state` is `SCORED`):
  - `strain` (float) - Day strain score (0-21 scale)
  - `kilojoule` (float) - Total energy expenditure
  - `average_heart_rate` (int) - Average heart rate in bpm
  - `max_heart_rate` (int) - Max heart rate in bpm

#### Recovery

| Method | Endpoint | Scope Required | Description |
|--------|----------|----------------|-------------|
| GET | `/v1/recovery` | `read:recovery` | Get all recoveries (paginated) |
| GET | `/v1/cycle/{cycleId}/recovery` | `read:recovery` | Get recovery for a specific cycle |

Recovery data is linked to cycles. Not every cycle has a recovery (a recovery requires a scored sleep).

**Recovery Response Fields:**
- `cycle_id` (int64) - Associated cycle ID
- `sleep_id` (UUID string) - Associated sleep record ID
- `user_id` (int64) - WHOOP user ID
- `created_at` (datetime) - When recorded
- `updated_at` (datetime) - Last update
- `score_state` (enum) - `SCORED`, `PENDING_SCORE`, or `UNSCORABLE`
- `score` (object, present only when scored):
  - `recovery_score` (int) - Recovery percentage (0-100%)
  - `resting_heart_rate` (float) - Resting heart rate in bpm
  - `hrv_rmssd_milli` (float) - Heart rate variability (RMSSD) in milliseconds
  - `spo2_percentage` (float) - Blood oxygen saturation (WHOOP 4.0+ members)
  - `skin_temp_celsius` (float) - Skin temperature (WHOOP 4.0+ members)
  - `user_calibrating` (boolean) - Whether user is still in calibration period

**Recovery Score Categories:**
- Green (67-100%): Well recovered, ready for high strain
- Yellow (34-66%): Moderately recovered, can maintain fitness
- Red (0-33%): Recovery needed, risk of overtraining

#### Sleep

| Method | Endpoint | Scope Required | Description |
|--------|----------|----------------|-------------|
| GET | `/v1/activity/sleep` | `read:sleep` | Get all sleep records (paginated, descending) |
| GET | `/v1/activity/sleep/{sleepId}` | `read:sleep` | Get a specific sleep record |

In v2, sleep IDs use UUIDs. In v1, they use integer IDs.

**Sleep Response Fields:**
- `id` (UUID) - Unique sleep identifier
- `cycle_id` (int64) - Associated cycle
- `user_id` (int64) - WHOOP user ID
- `created_at` (datetime) - When recorded
- `updated_at` (datetime) - Last update
- `start` (datetime) - Sleep start time
- `end` (datetime) - Sleep end time
- `timezone_offset` (string) - Timezone
- `nap` (boolean) - Whether this is a nap vs. main sleep
- `score_state` (enum) - `SCORED`, `PENDING_SCORE`, or `UNSCORABLE`
- `score` (object, present only when scored):
  - **Stage Summary:**
    - `total_in_bed_time_milli` (int) - Total time in bed
    - `total_awake_time_milli` (int) - Time spent awake
    - `total_no_data_time_milli` (int) - Time with no data
    - `total_light_sleep_time_milli` (int) - Light sleep duration
    - `total_slow_wave_sleep_time_milli` (int) - Deep/slow wave sleep duration
    - `total_rem_sleep_time_milli` (int) - REM sleep duration
    - `sleep_cycle_count` (int) - Number of sleep cycles
    - `disturbance_count` (int) - Number of disturbances/wake-ups
  - **Sleep Need:**
    - `baseline_milli` (int) - Baseline sleep need
    - `need_from_sleep_debt_milli` (int) - Additional need from accumulated sleep debt
    - `need_from_recent_strain_milli` (int) - Additional need from recent physical strain
    - `need_from_recent_nap_milli` (int) - Adjustment from recent naps
  - **Performance Metrics:**
    - `respiratory_rate` (float) - Breaths per minute during sleep
    - `sleep_performance_percentage` (float) - How well sleep met calculated need
    - `sleep_consistency_percentage` (float) - Consistency of sleep/wake times
    - `sleep_efficiency_percentage` (float) - Ratio of time asleep to time in bed

#### Workout

| Method | Endpoint | Scope Required | Description |
|--------|----------|----------------|-------------|
| GET | `/v1/activity/workout` | `read:workout` | Get all workouts (paginated) |
| GET | `/v1/activity/workout/{workoutId}` | `read:workout` | Get a specific workout |

In v2, workout IDs use UUIDs.

**Workout Response Fields:**
- `id` (UUID) - Unique workout identifier
- `user_id` (int64) - WHOOP user ID
- `created_at` (datetime) - When recorded
- `updated_at` (datetime) - Last update
- `start` (datetime) - Workout start time
- `end` (datetime) - Workout end time
- `timezone_offset` (string) - Timezone
- `sport_id` (int) - Activity type ID (see Sport ID table below)
- `sport_name` (string) - Activity name
- `score_state` (enum) - `SCORED`, `PENDING_SCORE`, or `UNSCORABLE`
- `score` (object, present only when scored):
  - `strain` (float) - Workout strain (0-21 scale)
  - `average_heart_rate` (int) - Average HR during workout
  - `max_heart_rate` (int) - Max HR during workout
  - `kilojoule` (float) - Energy expenditure
  - `percent_recorded` (float) - Data completeness percentage
  - `distance_meter` (float) - Distance traveled
  - `altitude_gain_meter` (float) - Elevation gain
  - `altitude_change_meter` (float) - Net elevation change
  - `zone_durations` (object) - Time in each of 5 heart rate zones (in milliseconds):
    - `zone_zero_milli` - Below Zone 1
    - `zone_one_milli` - Zone 1 (50-60% max HR)
    - `zone_two_milli` - Zone 2 (60-70% max HR)
    - `zone_three_milli` - Zone 3 (70-80% max HR)
    - `zone_four_milli` - Zone 4 (80-90% max HR)
    - `zone_five_milli` - Zone 5 (90-100% max HR)

#### De-authorization

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | (revokeUserOauthAccess) | Revoke access token and stop receiving webhooks for user |

### Common Sport IDs (Partial List)

WHOOP supports 100+ activity types. Key mappings include:

| sport_id | Activity | sport_id | Activity |
|----------|----------|----------|----------|
| -1 | Activity (generic) | 0 | Running |
| 1 | Cycling | 16 | Baseball |
| 17 | Basketball | 18 | Rowing |
| 21 | Football | 22 | Golf |
| 24 | Ice Hockey | 25 | Lacrosse |
| 27 | Rugby | 29 | Skiing |
| 30 | Soccer | 33 | Swimming |
| 34 | Tennis | 35 | Track & Field |
| 36 | Volleyball | 39 | Boxing |
| 42 | Dance | 43 | Pilates |
| 44 | Yoga | 45 | Weightlifting |
| 47 | CrossFit | 48 | Elliptical |
| 49 | Functional Fitness | 52 | Hiking |
| 63 | HIIT | 71 | Powerlifting |
| 84 | Martial Arts | 87 | Stretching |

The `sport_name` field is also returned as a string, so you do not need to maintain this mapping client-side.

### Pagination

All collection endpoints use **token-based pagination** (not offset-based).

**Query Parameters:**
- `limit` (int) - Number of records per page
- `start` (datetime) - Filter results after this date
- `end` (datetime) - Filter results before this date
- `nextToken` (string) - Pagination cursor from previous response

**Response Format:**
```json
{
  "records": [...],
  "next_token": "eyIkIjoib0AxIiwibyI6MTB9"
}
```

When `next_token` is empty or absent, you have reached the last page.

### Webhooks

Webhooks provide real-time notifications when data changes, eliminating the need to poll.

**Available Events:**
| Event Type | Description |
|------------|-------------|
| `recovery.updated` | Recovery created or updated |
| `recovery.deleted` | Recovery deleted |
| `workout.updated` | Workout created or updated |
| `workout.deleted` | Workout deleted |
| `sleep.updated` | Sleep created or updated |
| `sleep.deleted` | Sleep deleted |

**Webhook Payload (v2):**
```json
{
  "user_id": 456,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "recovery.updated",
  "trace_id": "unique-trace-id"
}
```

**Signature Verification:**
WHOOP signs webhooks using HMAC-SHA256. Verify using these headers:
- `X-WHOOP-Signature` - The signature value
- `X-WHOOP-Signature-Timestamp` - Milliseconds since epoch

Verification formula:
```
base64Encode(HMACSHA256(timestamp_header + raw_http_request_body, client_secret))
```

**Delivery:** WHOOP retries failed deliveries up to 5 times over approximately one hour. Endpoints must return `2XX` within one second.

---

## Authentication (OAuth 2.0)

The WHOOP API uses the standard OAuth 2.0 Authorization Code flow.

### OAuth URLs

| Purpose | URL |
|---------|-----|
| Authorization | `https://api.prod.whoop.com/oauth/oauth2/auth` |
| Token Exchange | `https://api.prod.whoop.com/oauth/oauth2/token` |

### Available Scopes

| Scope | Description |
|-------|-------------|
| `read:recovery` | Recovery data (score, HRV, resting HR, SpO2, skin temp) |
| `read:cycles` | Cycle data (day strain, average HR, kilojoules) |
| `read:workout` | Workout data (activity strain, HR zones, calories) |
| `read:sleep` | Sleep data (stages, performance, efficiency, respiratory rate) |
| `read:profile` | Profile data (name, email) |
| `read:body_measurement` | Body measurements (height, weight, max HR) |
| `offline` | Returns a refresh token for long-lived access |

### OAuth Flow Steps

1. **Redirect user** to authorization URL with `client_id`, `redirect_uri`, `scope`, `state`, and `response_type=code`
2. **User signs in** to their WHOOP account and authorizes your app
3. **WHOOP redirects** back to your `redirect_uri` with an `authorization_code`
4. **Exchange code for tokens** by POSTing to the token URL with `grant_type=authorization_code`, `code`, `client_id`, `client_secret`, and `redirect_uri`
5. **Receive tokens**: access token (short-lived, check `expires_in`) and refresh token (if `offline` scope requested)
6. **Use access token** as `Authorization: Bearer {access_token}` header on all API requests
7. **Refresh when expired** by POSTing to token URL with `grant_type=refresh_token`, `refresh_token`, `client_id`, and `client_secret`

### Important Notes

- The `state` parameter should be at minimum 8 characters for CSRF protection
- Redirect URIs must be registered in the Developer Dashboard and match exactly
- Accepted redirect URI schemes: `https://` and `app://`
- New tokens invalidate previous ones; always store the latest refresh token
- Client Secret must never be exposed client-side; all token operations must happen server-side
- WHOOP recommends using established OAuth libraries rather than implementing from scratch

---

## How to Get API Keys

### Step-by-Step Registration

1. **Get a WHOOP device and membership**: You must have an active WHOOP membership to access the Developer Platform.

2. **Go to the Developer Dashboard**: Navigate to https://developer-dashboard.whoop.com and sign in with your WHOOP account credentials (redirects to id.whoop.com).

3. **Create a Team**: If you are new to the platform, you will be prompted to create a Team by selecting a team name and confirming. Teams enable collaboration with other developers.

4. **Create an App**: Navigate to https://developer-dashboard.whoop.com/apps/create
   - Enter your app name and description
   - Select the **scopes** your app needs (at least one required)
   - Add at least one **redirect URI** for OAuth callbacks
   - Submit to create the app

5. **Get your credentials**: After creation, you will receive:
   - **Client ID** - Public identifier for your app (safe to include in client-side code)
   - **Client Secret** - Secret value (NEVER expose client-side, never log, never share)

6. **Manage your app**: Access credentials later at https://developer-dashboard.whoop.com. Edit with the pencil icon. Delete with the trash icon (permanent, no recovery).

### Limits

- Maximum of **5 apps** per team (request more via WHOOP support)
- Invite collaborators via the Team section using their WHOOP account email

---

## Rate Limits

### Default Limits

| Window | Limit |
|--------|-------|
| Per minute | 100 requests |
| Per day (24 hours) | 10,000 requests |

### Rate Limit Response Headers

Every API response includes rate limit information:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Current rate limits and windows (e.g., `100, 100;window=60, 10000;window=86400`) |
| `X-RateLimit-Remaining` | Requests remaining before limit is hit |
| `X-RateLimit-Reset` | Seconds until `X-RateLimit-Remaining` resets |

### When Exceeded

The API returns **HTTP 429 Too Many Requests**. Your app should implement exponential backoff.

### Requesting Higher Limits

WHOOP can increase limits upon request. Submit a request through their support form with context explaining your use case.

---

## Data Available in Detail

### Recovery Score Breakdown

Recovery is calculated each morning after your main sleep and remains static for the day.

**Inputs to recovery calculation:**
- **Heart Rate Variability (HRV RMSSD)** - The time variation between heartbeats in milliseconds. Higher HRV generally indicates better recovery. WHOOP reports RMSSD (Root Mean Square of Successive Differences), measured during sleep.
- **Resting Heart Rate** - Your lowest sustained heart rate, typically measured during deep sleep. Lower is generally better and indicates cardiovascular fitness.
- **Respiratory Rate** - Breaths per minute during sleep.
- **Sleep Performance** - How actual sleep duration compares to calculated sleep need.
- **SpO2 (Blood Oxygen)** - Peripheral blood oxygen saturation percentage. Available on WHOOP 4.0+ hardware. Anomalies may indicate altitude changes, illness, or respiratory issues.
- **Skin Temperature** - Measured in Celsius. Available on WHOOP 4.0+ hardware. Deviations from personal baseline may indicate illness or hormonal changes.
- **User Calibrating** - Boolean flag. WHOOP needs approximately 4 days of data to establish personal baselines. During calibration, scores may be less accurate.

### Strain Calculation

Strain operates on a **0-21 non-linear scale** derived from the Borg Scale of Perceived Exertion:

| Range | Category | Description |
|-------|----------|-------------|
| 0-9 | Light | Active recovery zone |
| 10-13 | Moderate | Maintains fitness |
| 14-17 | High | Builds fitness, significant cardiovascular load |
| 18-21 | All Out | Maximum exertion, difficult recovery |

Strain is **personalized** -- the same activity produces different strain scores for different individuals based on their fitness level and current recovery state. It accumulates throughout the day from both workouts and general daily activity.

### Sleep Staging

WHOOP tracks four sleep states:
- **Awake** - Periods of wakefulness during the sleep window
- **Light Sleep** - Stage 1-2 NREM sleep
- **Slow Wave Sleep (SWS/Deep)** - Stage 3 NREM sleep, critical for physical recovery
- **REM Sleep** - Rapid eye movement sleep, critical for cognitive recovery

All durations reported in milliseconds.

**Sleep Need Calculation:**
WHOOP calculates personalized sleep need based on:
- `baseline_milli` - Your individual baseline sleep requirement
- `need_from_sleep_debt_milli` - Extra sleep needed to pay off accumulated debt
- `need_from_recent_strain_milli` - Extra sleep needed due to physical exertion
- `need_from_recent_nap_milli` - Reduction in need from daytime naps

**Sleep Performance** = (actual sleep / calculated sleep need) * 100

### Heart Rate Zone Durations

Workout data includes time spent in 5 heart rate zones based on percentage of max heart rate. Zones are reported in milliseconds, enabling precise analysis of training intensity distribution.

### Data NOT Available via API

Based on third-party analysis, the following data is available on the WHOOP device/app but **not exposed through the API**:
- Individual heart rate samples (raw time-series HR data)
- Sleep stage transition timestamps (exact times of stage changes)
- Intra-day strain progression
- Journal entries and behavioral logging
- Strength Trainer rep/set data (though Strength Trainer activities appear as workouts)

---

## Integration Ideas for Workout Tracker PWA

### 1. Recovery-Guided Home Page

Display the daily WHOOP recovery score prominently on the home page with color coding (green/yellow/red). Use this to recommend workout intensity:
- **Green (67-100%)**: Suggest high-intensity workouts, PR attempts
- **Yellow (34-66%)**: Suggest moderate workouts, maintain volume
- **Red (0-33%)**: Suggest rest day, mobility work, or light cardio

### 2. Strain Tracking Alongside Workouts

After completing a workout in the app, display the WHOOP strain score for that session alongside your logged weights and reps. Show how each workout contributes to daily strain accumulation.

### 3. Sleep-Based Rest Day Recommendations

Use sleep performance percentage and sleep debt data to automatically recommend rest days:
- Sleep performance < 70% for 2+ consecutive nights: suggest rest or deload
- High accumulated sleep debt: recommend lighter training day
- Flag when sleep need exceeds 9+ hours (high strain accumulation)

### 4. HRV Trend Analysis

Track HRV (RMSSD) over time on a dedicated stats page. Show:
- 7-day rolling average
- 30-day trend line
- Correlation between HRV and workout performance
- Alert when HRV drops significantly below personal baseline

### 5. Auto-Adjust Workout Difficulty

Based on recovery score, automatically suggest workout modifications:
- Red recovery: reduce working sets by 20%, skip heavy compounds
- Yellow recovery: maintain volume but reduce intensity by 5-10%
- Green recovery: full program, consider adding volume or attempting PRs

### 6. Sleep Quality Dashboard

Create a sleep insights page showing:
- Sleep performance trend over time
- Time in each sleep stage (stacked bar chart)
- Sleep efficiency percentage
- Sleep consistency score
- Respiratory rate trends
- Correlation between sleep quality and next-day workout performance

### 7. Recovery-Based Workout Recommendations

On the workout selection page, display a banner:
- "Recovery: 85% - Great day for Push Day (heavy)"
- "Recovery: 42% - Consider Mobility or Light Cardio instead"
- Reorder workout suggestions based on recovery score

### 8. Weekly Strain vs Recovery Report

Show a weekly summary comparing total strain accumulated vs. recovery trajectory, helping users understand if they are overtraining or undertraining.

### 9. Resting Heart Rate Tracking

Display RHR trend on the profile or stats page. RHR dropping over time indicates improving cardiovascular fitness. Sudden increases may indicate illness, overtraining, or poor recovery.

### 10. Weather + Recovery Combined Insights

Combine existing weather data with WHOOP recovery to provide holistic training recommendations (e.g., "Recovery is high and it's 72F and sunny -- great day for an outdoor run").

---

## Technical Integration Plan

### Architecture for React/Supabase Integration

#### 1. OAuth Flow via Supabase Edge Functions

Since the WHOOP OAuth flow requires a Client Secret (which must stay server-side), implement the token exchange in Supabase Edge Functions.

**File Structure:**
```
supabase/
  functions/
    whoop-auth/          # Initiate OAuth flow
    whoop-callback/      # Handle OAuth callback, exchange code for tokens
    whoop-refresh/       # Refresh expired tokens
    whoop-proxy/         # Proxy API requests (attaches tokens server-side)
    whoop-webhook/       # Receive webhook events
```

#### 2. Token Storage in Supabase

Create a table to securely store WHOOP tokens per user:

```sql
CREATE TABLE whoop_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  whoop_user_id BIGINT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own tokens
ALTER TABLE whoop_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens"
  ON whoop_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Only edge functions should write tokens (use service role key)
```

Optionally, cache recent WHOOP data to reduce API calls:

```sql
CREATE TABLE whoop_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_type TEXT NOT NULL, -- 'recovery', 'sleep', 'workout', 'cycle'
  data_id TEXT NOT NULL,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data_type, data_id)
);

ALTER TABLE whoop_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cache"
  ON whoop_cache FOR SELECT
  USING (auth.uid() = user_id);
```

#### 3. Service File Pattern (whoopService.ts)

Following the existing service pattern in the codebase:

```typescript
// src/services/whoopService.ts

import { supabase } from './supabase';

const WHOOP_BASE_URL = 'https://api.prod.whoop.com/developer';

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number;
    skin_temp_celsius: number;
    user_calibrating: boolean;
  };
}

export interface WhoopSleep {
  id: string;
  cycle_id: number;
  user_id: number;
  start: string;
  end: string;
  nap: boolean;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    total_in_bed_time_milli: number;
    total_awake_time_milli: number;
    total_light_sleep_time_milli: number;
    total_slow_wave_sleep_time_milli: number;
    total_rem_sleep_time_milli: number;
    sleep_cycle_count: number;
    disturbance_count: number;
    baseline_milli: number;
    need_from_sleep_debt_milli: number;
    need_from_recent_strain_milli: number;
    need_from_recent_nap_milli: number;
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

export interface WhoopWorkout {
  id: string;
  user_id: number;
  start: string;
  end: string;
  sport_id: number;
  sport_name: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter: number;
    altitude_gain_meter: number;
    altitude_change_meter: number;
    zone_durations: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  };
}

export interface WhoopCycle {
  id: number;
  user_id: number;
  start: string;
  end?: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

export interface WhoopPaginatedResponse<T> {
  records: T[];
  next_token?: string;
}

// Check if user has connected WHOOP
export async function isWhoopConnected(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('whoop_tokens')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !!data;
}

// Initiate WHOOP OAuth connection
export function getWhoopAuthUrl(): string {
  return `${window.location.origin}/api/whoop-auth`;
}

// Fetch data via edge function proxy (handles token refresh automatically)
async function whoopFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';

  const { data, error } = await supabase.functions.invoke('whoop-proxy', {
    body: { endpoint: `${endpoint}${queryString}` },
  });

  if (error) throw error;
  return data as T;
}

// Recovery
export async function getCurrentRecovery(): Promise<WhoopRecovery | null> {
  const cycles = await whoopFetch<WhoopPaginatedResponse<WhoopCycle>>(
    '/v1/cycle',
    { limit: '1' }
  );

  if (!cycles.records.length) return null;

  const cycleId = cycles.records[0].id;

  try {
    return await whoopFetch<WhoopRecovery>(`/v1/cycle/${cycleId}/recovery`);
  } catch {
    return null; // No recovery for current cycle yet
  }
}

export async function getRecoveryCollection(
  start?: string,
  end?: string
): Promise<WhoopPaginatedResponse<WhoopRecovery>> {
  const params: Record<string, string> = {};
  if (start) params.start = start;
  if (end) params.end = end;
  return whoopFetch('/v1/recovery', params);
}

// Sleep
export async function getSleepCollection(
  start?: string,
  end?: string
): Promise<WhoopPaginatedResponse<WhoopSleep>> {
  const params: Record<string, string> = {};
  if (start) params.start = start;
  if (end) params.end = end;
  return whoopFetch('/v1/activity/sleep', params);
}

// Workouts
export async function getWorkoutCollection(
  start?: string,
  end?: string
): Promise<WhoopPaginatedResponse<WhoopWorkout>> {
  const params: Record<string, string> = {};
  if (start) params.start = start;
  if (end) params.end = end;
  return whoopFetch('/v1/activity/workout', params);
}

// Cycles
export async function getCycleCollection(
  start?: string,
  end?: string
): Promise<WhoopPaginatedResponse<WhoopCycle>> {
  const params: Record<string, string> = {};
  if (start) params.start = start;
  if (end) params.end = end;
  return whoopFetch('/v1/cycle', params);
}
```

#### 4. React Query Hook Pattern (useWhoop.ts)

```typescript
// src/hooks/useWhoop.ts

import { useQuery } from '@tanstack/react-query';
import * as whoopService from '@/services/whoopService';

export function useWhoopConnection() {
  return useQuery({
    queryKey: ['whoop', 'connected'],
    queryFn: whoopService.isWhoopConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentRecovery() {
  return useQuery({
    queryKey: ['whoop', 'recovery', 'current'],
    queryFn: whoopService.getCurrentRecovery,
    staleTime: 15 * 60 * 1000, // 15 minutes (recovery only changes once per day)
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
}

export function useRecoveryHistory(start?: string, end?: string) {
  return useQuery({
    queryKey: ['whoop', 'recovery', 'history', start, end],
    queryFn: () => whoopService.getRecoveryCollection(start, end),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSleepHistory(start?: string, end?: string) {
  return useQuery({
    queryKey: ['whoop', 'sleep', 'history', start, end],
    queryFn: () => whoopService.getSleepCollection(start, end),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkoutHistory(start?: string, end?: string) {
  return useQuery({
    queryKey: ['whoop', 'workout', 'history', start, end],
    queryFn: () => whoopService.getWorkoutCollection(start, end),
    staleTime: 5 * 60 * 1000,
  });
}
```

#### 5. Webhooks vs Polling

**Recommended approach: Webhooks + On-Demand Fetching**

- **Webhooks** for real-time updates: Set up a Supabase Edge Function at a public HTTPS endpoint to receive webhook events. When a `recovery.updated` or `sleep.updated` event arrives, fetch the latest data and update the `whoop_cache` table.
- **On-demand fetching** for historical data: When a user navigates to history or stats pages, fetch data via the proxy edge function.
- **Polling fallback**: If webhooks are not configured, use TanStack Query's `refetchInterval` to poll periodically (e.g., every 15-30 minutes for recovery, which only changes once per day).

#### 6. Caching Strategy with TanStack Query

| Data Type | Stale Time | Refetch Interval | Rationale |
|-----------|------------|-------------------|-----------|
| Recovery (current) | 15 min | 30 min | Changes once per day after sleep |
| Sleep (latest) | 15 min | 30 min | Finalized after wake-up |
| Workouts | 5 min | None (on-demand) | Changes during/after workout |
| Cycles | 5 min | None (on-demand) | Updated throughout day |
| Profile/Body | 60 min | None (on-demand) | Rarely changes |

Use the existing 5-minute stale time pattern from the codebase as a baseline, with longer intervals for data that changes infrequently (recovery, sleep).

---

## Limitations and Considerations

### Membership Requirement

- A **WHOOP device and active membership** are required for both developers and end users. The API only provides data for users with active WHOOP memberships.
- WHOOP operates on a subscription model. Without a membership, neither the device nor the API produce data.

### API Access

- The Developer Platform is **free to use** (no API fees), but WHOOP reserves the right to charge in the future with prior notice.
- Maximum of **5 apps** per developer team.
- Rate limits of 100 req/min and 10,000 req/day may constrain high-frequency use cases.
- All endpoints are **read-only** -- you cannot write data back to WHOOP via the API.

### Data Freshness

- Recovery scores are calculated **once per day** after the main sleep period ends. They do not update throughout the day unless sleep data is revised.
- Strain accumulates throughout the day. The cycle endpoint will show partial strain for the current ongoing cycle.
- Sleep data is finalized after the user wakes up and WHOOP processes the sleep session.
- There can be a delay between when the WHOOP device collects data and when it syncs to the cloud and becomes available via API. Users must sync their WHOOP device (via Bluetooth to their phone) for data to appear.

### Data Granularity Limitations

- The API provides **aggregated metrics**, not raw sensor data. You get summary statistics (average HR, total time in sleep stages) rather than second-by-second readings.
- No access to raw heart rate time-series data through the API.
- No access to exact sleep stage transition timestamps.

### WHOOP 4.0 vs Older Hardware

- SpO2 (blood oxygen) and skin temperature data are only available for **WHOOP 4.0+** members.
- Older devices will return null/missing values for these fields.

### Terms of Use Restrictions

- Cannot resell, license, or lease WHOOP data to third parties.
- Cannot build databases or create permanent copies of WHOOP data (caching for performance is acceptable).
- Cannot use the API to compete with WHOOP.
- Must display WHOOP attribution as specified in documentation.
- Must obtain explicit user consent before accessing their data.
- HIPAA compliance is not guaranteed unless separately agreed upon with WHOOP.
- Press releases mentioning WHOOP require prior written approval.

### Calibration Period

- New WHOOP users go through a ~4-day calibration period where scores may be less accurate. The `user_calibrating` field in recovery data indicates this status.

### v1 to v2 Migration

- The v1 API has been deprecated. New development should use v2 endpoints exclusively.
- Key difference: v2 uses **UUID identifiers** for workouts and sleeps instead of integer IDs.
- Recovery webhooks in v2 use the sleep UUID as the identifier instead of the cycle ID.

---

## Code Examples

### 1. OAuth Flow -- Supabase Edge Function (Token Exchange)

```typescript
// supabase/functions/whoop-callback/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const CLIENT_ID = Deno.env.get('WHOOP_CLIENT_ID')!;
const CLIENT_SECRET = Deno.env.get('WHOOP_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('WHOOP_REDIRECT_URI')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Contains Supabase user ID

  if (!code || !state) {
    return new Response('Missing code or state', { status: 400 });
  }

  // Exchange authorization code for tokens
  const tokenResponse = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    return new Response(`Token exchange failed: ${error}`, { status: 400 });
  }

  const tokens = await tokenResponse.json();
  // tokens: { access_token, refresh_token, expires_in, scope, token_type }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Store tokens in Supabase (using service role to bypass RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { error: dbError } = await supabase
    .from('whoop_tokens')
    .upsert({
      user_id: state, // Supabase auth user ID passed via OAuth state
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scopes: tokens.scope.split(' '),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (dbError) {
    return new Response(`Database error: ${dbError.message}`, { status: 500 });
  }

  // Redirect user back to the app
  return new Response(null, {
    status: 302,
    headers: { Location: `${Deno.env.get('APP_URL')}/profile?whoop=connected` },
  });
});
```

### 2. Token Refresh Edge Function

```typescript
// supabase/functions/whoop-refresh/index.ts

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

export async function refreshWhoopToken(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  // Get current tokens
  const { data: tokenData, error } = await supabase
    .from('whoop_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) throw new Error('WHOOP not connected');

  // Check if token is still valid (with 5-minute buffer)
  const expiresAt = new Date(tokenData.expires_at);
  if (expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
    return tokenData.access_token; // Still valid
  }

  // Refresh the token
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
      client_id: Deno.env.get('WHOOP_CLIENT_ID')!,
      client_secret: Deno.env.get('WHOOP_CLIENT_SECRET')!,
    }),
  });

  if (!response.ok) throw new Error('Token refresh failed');

  const newTokens = await response.json();
  const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();

  // Update stored tokens
  await supabase
    .from('whoop_tokens')
    .update({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return newTokens.access_token;
}
```

### 3. Fetching Current Recovery

```typescript
// Example: Get today's recovery score

async function displayRecovery() {
  const recovery = await getCurrentRecovery();

  if (!recovery || recovery.score_state !== 'SCORED') {
    console.log('Recovery not yet available for today');
    return;
  }

  if (recovery.score!.user_calibrating) {
    console.log('WHOOP is still calibrating your baseline...');
  }

  const score = recovery.score!;
  console.log(`Recovery: ${score.recovery_score}%`);
  console.log(`HRV: ${score.hrv_rmssd_milli.toFixed(1)} ms`);
  console.log(`Resting HR: ${score.resting_heart_rate} bpm`);
  console.log(`SpO2: ${score.spo2_percentage}%`);
  console.log(`Skin Temp: ${score.skin_temp_celsius}C`);

  // Determine recovery zone
  if (score.recovery_score >= 67) {
    console.log('GREEN - Ready for high intensity');
  } else if (score.recovery_score >= 34) {
    console.log('YELLOW - Moderate intensity recommended');
  } else {
    console.log('RED - Recovery day recommended');
  }
}
```

### 4. Fetching Sleep Data

```typescript
// Example: Get last 7 days of sleep data

async function getWeeklySleep() {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const sleepData = await getSleepCollection(start, end);

  for (const sleep of sleepData.records) {
    if (sleep.nap || sleep.score_state !== 'SCORED') continue;

    const score = sleep.score!;
    const totalSleepMs =
      score.total_light_sleep_time_milli +
      score.total_slow_wave_sleep_time_milli +
      score.total_rem_sleep_time_milli;

    const totalSleepHrs = (totalSleepMs / 3600000).toFixed(1);
    const sleepNeedHrs = (
      (score.baseline_milli +
        score.need_from_sleep_debt_milli +
        score.need_from_recent_strain_milli +
        score.need_from_recent_nap_milli) /
      3600000
    ).toFixed(1);

    console.log(`Date: ${sleep.start}`);
    console.log(`  Total Sleep: ${totalSleepHrs}h (Need: ${sleepNeedHrs}h)`);
    console.log(`  Performance: ${score.sleep_performance_percentage}%`);
    console.log(`  Efficiency: ${score.sleep_efficiency_percentage}%`);
    console.log(`  Respiratory Rate: ${score.respiratory_rate} breaths/min`);
    console.log(`  Deep Sleep: ${(score.total_slow_wave_sleep_time_milli / 3600000).toFixed(1)}h`);
    console.log(`  REM Sleep: ${(score.total_rem_sleep_time_milli / 3600000).toFixed(1)}h`);
  }
}
```

### 5. Fetching Workout Data

```typescript
// Example: Get recent workouts with strain and HR zone breakdown

async function getRecentWorkouts() {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const workouts = await getWorkoutCollection(start, end);

  for (const workout of workouts.records) {
    if (workout.score_state !== 'SCORED') continue;

    const score = workout.score!;
    const durationMin = (
      (new Date(workout.end).getTime() - new Date(workout.start).getTime()) /
      60000
    ).toFixed(0);

    console.log(`${workout.sport_name} - ${durationMin} min`);
    console.log(`  Strain: ${score.strain.toFixed(1)}`);
    console.log(`  Avg HR: ${score.average_heart_rate} bpm`);
    console.log(`  Max HR: ${score.max_heart_rate} bpm`);
    console.log(`  Calories: ${(score.kilojoule * 0.239006).toFixed(0)} kcal`);

    if (score.distance_meter > 0) {
      console.log(`  Distance: ${(score.distance_meter / 1000).toFixed(2)} km`);
    }

    // HR Zone breakdown
    const zones = score.zone_durations;
    const totalZoneMs =
      zones.zone_zero_milli + zones.zone_one_milli + zones.zone_two_milli +
      zones.zone_three_milli + zones.zone_four_milli + zones.zone_five_milli;

    if (totalZoneMs > 0) {
      console.log(`  HR Zones:`);
      console.log(`    Zone 1 (50-60%): ${(zones.zone_one_milli / 60000).toFixed(1)} min`);
      console.log(`    Zone 2 (60-70%): ${(zones.zone_two_milli / 60000).toFixed(1)} min`);
      console.log(`    Zone 3 (70-80%): ${(zones.zone_three_milli / 60000).toFixed(1)} min`);
      console.log(`    Zone 4 (80-90%): ${(zones.zone_four_milli / 60000).toFixed(1)} min`);
      console.log(`    Zone 5 (90-100%): ${(zones.zone_five_milli / 60000).toFixed(1)} min`);
    }
  }
}
```

### 6. Webhook Handler Edge Function

```typescript
// supabase/functions/whoop-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

const CLIENT_SECRET = Deno.env.get('WHOOP_CLIENT_SECRET')!;

async function verifySignature(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(CLIENT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const message = new TextEncoder().encode(timestamp + body);
  const sig = await crypto.subtle.sign('HMAC', key, message);
  const expectedSignature = base64Encode(new Uint8Array(sig));

  return expectedSignature === signature;
}

serve(async (req) => {
  const signature = req.headers.get('X-WHOOP-Signature');
  const timestamp = req.headers.get('X-WHOOP-Signature-Timestamp');

  if (!signature || !timestamp) {
    return new Response('Missing signature headers', { status: 401 });
  }

  const body = await req.text();

  // Verify webhook signature
  const isValid = await verifySignature(body, signature, timestamp);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);
  // event: { user_id, id, type, trace_id }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Handle event types
  switch (event.type) {
    case 'recovery.updated':
      // Fetch latest recovery and cache it
      console.log(`Recovery updated for user ${event.user_id}`);
      break;
    case 'sleep.updated':
      console.log(`Sleep updated for user ${event.user_id}: ${event.id}`);
      break;
    case 'workout.updated':
      console.log(`Workout updated for user ${event.user_id}: ${event.id}`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return 200 quickly (process asynchronously in production)
  return new Response('OK', { status: 200 });
});
```

### 7. React Component -- Recovery Banner

```tsx
// Example component showing recovery on the home page

import { useCurrentRecovery, useWhoopConnection } from '@/hooks/useWhoop';

function RecoveryBanner() {
  const { data: isConnected, isLoading: checkingConnection } = useWhoopConnection();
  const { data: recovery, isLoading } = useCurrentRecovery();

  if (checkingConnection || isLoading) return null;

  if (!isConnected) {
    return (
      <a
        href={getWhoopAuthUrl()}
        className="block p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center"
      >
        Connect WHOOP to see your recovery score
      </a>
    );
  }

  if (!recovery || recovery.score_state !== 'SCORED') {
    return (
      <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-center">
        Recovery score pending...
      </div>
    );
  }

  const score = recovery.score!;
  const recoveryColor =
    score.recovery_score >= 67
      ? 'bg-green-500'
      : score.recovery_score >= 34
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className={`p-4 rounded-xl text-white ${recoveryColor}`}>
      <div className="text-sm font-medium opacity-90">WHOOP Recovery</div>
      <div className="text-3xl font-bold">{score.recovery_score}%</div>
      <div className="text-sm opacity-75 mt-1">
        HRV: {score.hrv_rmssd_milli.toFixed(0)}ms | RHR: {score.resting_heart_rate}bpm
      </div>
    </div>
  );
}
```

---

## References

- WHOOP Developer Portal: https://developer.whoop.com
- API Documentation: https://developer.whoop.com/api
- Developer Dashboard: https://developer-dashboard.whoop.com
- OAuth Guide: https://developer.whoop.com/docs/developing/oauth/
- Getting Started: https://developer.whoop.com/docs/developing/getting-started/
- Webhooks: https://developer.whoop.com/docs/developing/webhooks/
- Rate Limiting: https://developer.whoop.com/docs/developing/rate-limiting/
- Pagination: https://developer.whoop.com/docs/developing/pagination/
- Recovery Data: https://developer.whoop.com/docs/developing/user-data/recovery/
- Sleep Data: https://developer.whoop.com/docs/developing/user-data/sleep/
- Workout Data: https://developer.whoop.com/docs/developing/user-data/workout/
- Cycle Data: https://developer.whoop.com/docs/developing/user-data/cycle/
- User Data: https://developer.whoop.com/docs/developing/user-data/user/
- WHOOP 101 Concepts: https://developer.whoop.com/docs/whoop-101/
- API Changelog: https://developer.whoop.com/docs/api-changelog/
- v1 to v2 Migration: https://developer.whoop.com/docs/developing/v1-v2-migration/
- API Terms of Use: https://developer.whoop.com/api-terms-of-use/
