# Strava API Integration Reference

Comprehensive reference for integrating the Strava V3 API into the Workout Tracker PWA.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Full Capabilities](#2-full-capabilities)
3. [Authentication](#3-authentication)
4. [Rate Limits](#4-rate-limits)
5. [How to Get API Keys](#5-how-to-get-api-keys)
6. [Data Available](#6-data-available)
7. [Integration Ideas for Workout Tracker PWA](#7-integration-ideas-for-workout-tracker-pwa)
8. [Technical Integration Plan](#8-technical-integration-plan)
9. [Limitations and Considerations](#9-limitations-and-considerations)
10. [Code Examples](#10-code-examples)

---

## 1. Overview

The Strava V3 API is a publicly available RESTful interface that provides access to Strava's dataset of athletic activities. It allows developers to read and write activity data, access athlete profiles, interact with segments and routes, and receive real-time notifications via webhooks.

**Base URL:** `https://www.strava.com/api/v3/`

**What data it provides access to:**

- **Activities** - Runs, rides, swims, hikes, weight training sessions, and 50+ other sport types with detailed metrics (distance, pace, heart rate, power, elevation, GPS tracks)
- **Athletes** - Profile information, stats, and zones for authenticated users
- **Segments** - Portions of roads/trails where athletes compete for times (leaderboards, personal efforts)
- **Routes** - Planned courses with elevation and turn-by-turn data, exportable as GPX/TCX
- **Clubs** - Group information, members, and club activity feeds
- **Gear** - Equipment tracking (shoes, bikes) with distance totals
- **Streams** - Time-series data for activities (second-by-second GPS, heart rate, power, cadence, etc.)
- **Uploads** - File-based activity imports (FIT, GPX, TCX formats)
- **Webhooks** - Real-time push notifications when activities are created, updated, or deleted

All API calls require an `access_token` obtained through OAuth 2.0 authentication.

---

## 2. Full Capabilities

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/activities` | Create a manual activity |
| `GET` | `/activities/{id}` | Get a specific activity (detail if owned, summary otherwise) |
| `PUT` | `/activities/{id}` | Update an activity's name, type, description, gear, etc. |
| `GET` | `/athlete/activities` | List the authenticated athlete's activities (paginated) |
| `GET` | `/activities/{id}/comments` | List comments on an activity |
| `GET` | `/activities/{id}/kudos` | List athletes who gave kudos on an activity |
| `GET` | `/activities/{id}/laps` | List laps for an activity |
| `GET` | `/activities/{id}/zones` | Get heart rate and power zones for an activity |

### Athletes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/athlete` | Get the authenticated athlete's profile |
| `PUT` | `/athlete` | Update the authenticated athlete's weight and FTP |
| `GET` | `/athletes/{id}/stats` | Get an athlete's aggregated stats (totals, records) |
| `GET` | `/athlete/zones` | Get the authenticated athlete's heart rate and power zones |

### Clubs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/clubs/{id}` | Get a specific club |
| `GET` | `/clubs/{id}/members` | List club members |
| `GET` | `/clubs/{id}/admins` | List club administrators |
| `GET` | `/clubs/{id}/activities` | List recent activities posted by club members |
| `GET` | `/athlete/clubs` | List clubs the authenticated athlete belongs to |

### Gear

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/gear/{id}` | Get equipment details (name, distance, brand, model) |

### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/routes/{id}` | Get a specific route |
| `GET` | `/athletes/{id}/routes` | List an athlete's routes |
| `GET` | `/routes/{id}/export_gpx` | Export a route as GPX file |
| `GET` | `/routes/{id}/export_tcx` | Export a route as TCX file |

### Segment Efforts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/segment_efforts/{id}` | Get a specific segment effort |
| `GET` | `/segments/{id}/all_efforts` | List efforts on a segment by the authenticated athlete |

### Segments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/segments/{id}` | Get a specific segment |
| `GET` | `/segments/explore` | Explore segments in a geographic bounding box |
| `GET` | `/athlete/starred_segments` | List the authenticated athlete's starred segments |
| `POST` | `/segments/{id}/starred` | Star or unstar a segment |

### Streams (Time-Series Data)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/activities/{id}/streams` | Get time-series data for an activity |
| `GET` | `/segment_efforts/{id}/streams` | Get time-series data for a segment effort |
| `GET` | `/segments/{id}/streams` | Get time-series data for a segment |
| `GET` | `/routes/{id}/streams` | Get time-series data for a route |

**Available stream types:** `time`, `distance`, `latlng`, `altitude`, `velocity_smooth`, `heartrate`, `cadence`, `watts`, `temp`, `moving`, `grade_smooth`

### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/uploads` | Upload an activity file (FIT, GPX, TCX) |
| `GET` | `/uploads/{id}` | Check the status of an upload |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/push_subscriptions` | Create a webhook subscription |
| `GET` | `/push_subscriptions` | View existing subscription |
| `DELETE` | `/push_subscriptions/{id}` | Delete a webhook subscription |

---

## 3. Authentication

Strava uses OAuth 2.0 for authentication. Access tokens expire every 6 hours and must be refreshed using a refresh token.

### OAuth 2.0 Flow

```
1. Redirect user to Strava authorization page
2. User logs in and grants permission
3. Strava redirects back with an authorization code
4. Exchange authorization code for access + refresh tokens
5. Use access token for API calls
6. Refresh access token when it expires (every 6 hours)
```

### Step 1: Authorization Request

Redirect users to the Strava authorization URL:

```
GET https://www.strava.com/oauth/authorize
```

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your application's client ID |
| `redirect_uri` | Yes | URL to redirect back to after authorization |
| `response_type` | Yes | Must be `code` |
| `scope` | Yes | Comma-separated list of scopes |
| `approval_prompt` | No | `auto` (default) or `force` to always show the authorization prompt |
| `state` | No | Returned in the redirect, useful for CSRF protection |

**Example Authorization URL:**

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://yourapp.com/auth/strava/callback&response_type=code&scope=read,activity:read_all,activity:write&approval_prompt=auto
```

For mobile apps, use: `https://www.strava.com/oauth/mobile/authorize`

### Step 2: Token Exchange

After the user authorizes, Strava redirects to your `redirect_uri` with a `code` parameter. Exchange it for tokens:

```
POST https://www.strava.com/oauth/token
```

**Body Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your application's client ID |
| `client_secret` | Yes | Your application's client secret |
| `code` | Yes | The authorization code from the redirect |
| `grant_type` | Yes | Must be `authorization_code` |

**Response:**

```json
{
  "token_type": "Bearer",
  "expires_at": 1568775134,
  "expires_in": 21600,
  "refresh_token": "e5n567567...",
  "access_token": "a4b945687g...",
  "athlete": {
    "id": 134815,
    "username": "JohnDoe",
    "firstname": "John",
    "lastname": "Doe",
    "city": "Denver",
    "state": "Colorado",
    "country": "United States",
    "profile": "https://example.com/photo.jpg"
  }
}
```

### Step 3: Token Refresh

Access tokens expire every 6 hours. Use the refresh token to get a new one:

```
POST https://www.strava.com/oauth/token
```

**Body Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your application's client ID |
| `client_secret` | Yes | Your application's client secret |
| `grant_type` | Yes | Must be `refresh_token` |
| `refresh_token` | Yes | The refresh token from the last token exchange |

**Response:**

```json
{
  "token_type": "Bearer",
  "expires_at": 1568775134,
  "expires_in": 21600,
  "refresh_token": "new_refresh_token...",
  "access_token": "new_access_token..."
}
```

**Important:** Each refresh returns a new refresh token. The old refresh token is immediately invalidated. Always store the latest refresh token.

### Available Scopes

| Scope | Description |
|-------|-------------|
| `read` | Read public segments, routes, profiles, posts, events, club feeds, leaderboards |
| `read_all` | Read private routes, segments, and events |
| `profile:read_all` | Read all profile information regardless of visibility settings |
| `profile:write` | Update athlete weight and FTP; star/unstar segments |
| `activity:read` | Read activities visible to "Everyone" and "Followers" (excludes privacy zones) |
| `activity:read_all` | Read all activities including those set to "Only You" and data within privacy zones |
| `activity:write` | Create manual activities and uploads; edit activities |

### Deauthorization

Revoke access for your application:

```
POST https://www.strava.com/oauth/deauthorize
```

Pass the `access_token` in the Authorization header. This invalidates all tokens and removes the app from the user's authorized applications.

---

## 4. Rate Limits

### Default Limits

| Limit Type | 15-Minute Limit | Daily Limit |
|------------|----------------|-------------|
| **Overall** (all requests) | 200 requests | 2,000 requests |
| **Read-only** (non-upload) | 100 requests | 1,000 requests |

"Non-upload" excludes `POST /activities`, `POST /uploads`, and activity media uploads.

### Response Headers

Rate limit usage is communicated via response headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Overall 15-minute and daily limits (comma-separated) |
| `X-RateLimit-Usage` | Overall 15-minute and daily usage (comma-separated) |
| `X-ReadRateLimit-Limit` | Read 15-minute and daily limits (comma-separated) |
| `X-ReadRateLimit-Usage` | Read 15-minute and daily usage (comma-separated) |

**Example header value:** `100,1000` (15-minute limit, daily limit)

### Reset Schedule

- **15-minute window:** Resets at 0, 15, 30, and 45 minutes past each hour
- **Daily limit:** Resets at midnight UTC

### Exceeding Limits

Requests exceeding the limit return `429 Too Many Requests` with a JSON error message. Requests that violate the short-term limit still count toward the long-term (daily) limit.

### Requesting Higher Limits

To request increased rate limits:

1. Your app should be approaching 100+ authorized users
2. Review and comply with the Strava API Agreement
3. Comply with Strava Brand Guidelines
4. Submit the Developer Program form at the Strava Developer site with screenshots of how Strava data is displayed
5. Email `developers@strava.com` with subject "Rate Limit Increase" including your API App ID

---

## 5. How to Get API Keys

### Step-by-Step Setup

1. **Create a Strava account** (if you don't have one):
   - Go to [https://www.strava.com/register](https://www.strava.com/register)
   - Complete the signup process

2. **Navigate to the API settings page:**
   - Log into Strava
   - Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)

3. **Create your application:**
   - Fill in the required fields:
     - **Application Name**: Your app's name (e.g., "Workout Tracker")
     - **Category**: Select the appropriate category
     - **Club**: Optional club association
     - **Website**: Your application's URL
     - **Authorization Callback Domain**: `localhost` for development, your production domain for deployment
     - **Description**: Brief description of your application
   - Click "Create"

4. **Retrieve your credentials:**
   After creation, the "My API Application" page displays:
   - **Client ID** - Your unique application identifier (public)
   - **Client Secret** - Click "show" to reveal (keep confidential)
   - **Access Token** - A short-lived token for immediate testing (expires every 6 hours)
   - **Refresh Token** - Used to obtain new access tokens

5. **Test your setup:**
   ```bash
   curl -X GET "https://www.strava.com/api/v3/athlete" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Important Security Notes

- Never commit your `client_secret` to version control
- Store credentials in environment variables (`.env.local`)
- The initial access token on the settings page is for testing only; implement proper OAuth for production
- Your application starts in "Single Player Mode" (only your own data accessible) until approved for broader access

---

## 6. Data Available

### Sport Types (Complete List)

The `sport_type` field on activities supports 50+ types. The `sport_type` field is the preferred field going forward (`type` is deprecated).

| Category | Sport Types |
|----------|-------------|
| **Running** | `Run`, `TrailRun`, `VirtualRun` |
| **Cycling** | `Ride`, `MountainBikeRide`, `GravelRide`, `EBikeRide`, `EMountainBikeRide`, `VirtualRide`, `Velomobile`, `Handcycle` |
| **Swimming** | `Swim` |
| **Winter Sports** | `AlpineSki`, `BackcountrySki`, `NordicSki`, `Snowboard`, `Snowshoe`, `IceSkate` |
| **Water Sports** | `Canoeing`, `Kayaking`, `Rowing`, `VirtualRow`, `Sail`, `StandUpPaddling`, `Surfing`, `Kitesurf`, `Windsurf` |
| **Gym/Fitness** | `WeightTraining`, `Crossfit`, `Elliptical`, `StairStepper`, `HighIntensityIntervalTraining`, `Pilates`, `Yoga`, `Workout` |
| **Walking/Hiking** | `Walk`, `Hike`, `Wheelchair` |
| **Racket Sports** | `Badminton`, `Pickleball`, `Racquetball`, `Squash`, `TableTennis`, `Tennis` |
| **Other** | `Golf`, `InlineSkate`, `RockClimbing`, `RollerSki`, `Skateboard`, `Soccer` |

### Activity Data Fields

#### Summary Activity (from list endpoints)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `long` | Unique activity identifier |
| `name` | `string` | Activity title |
| `sport_type` | `SportType` | Sport type (see list above) |
| `type` | `ActivityType` | Legacy activity type (deprecated) |
| `distance` | `float` | Distance in meters |
| `moving_time` | `integer` | Moving time in seconds |
| `elapsed_time` | `integer` | Total elapsed time in seconds |
| `total_elevation_gain` | `float` | Elevation gain in meters |
| `start_date` | `datetime` | UTC start time |
| `start_date_local` | `datetime` | Local start time |
| `timezone` | `string` | Timezone string |
| `start_latlng` | `[lat, lng]` | Start coordinates |
| `end_latlng` | `[lat, lng]` | End coordinates |
| `average_speed` | `float` | Average speed in meters/second |
| `max_speed` | `float` | Maximum speed in meters/second |
| `average_heartrate` | `float` | Average heart rate (if available) |
| `max_heartrate` | `float` | Maximum heart rate (if available) |
| `has_heartrate` | `boolean` | Whether HR data is present |
| `elev_high` | `float` | Highest elevation point in meters |
| `elev_low` | `float` | Lowest elevation point in meters |
| `kudos_count` | `integer` | Number of kudos received |
| `comment_count` | `integer` | Number of comments |
| `achievement_count` | `integer` | Number of achievements earned |
| `athlete_count` | `integer` | Number of athletes on group activity |
| `map` | `PolylineMap` | Summary and detailed polylines |
| `trainer` | `boolean` | Whether recorded on a trainer |
| `commute` | `boolean` | Whether flagged as a commute |
| `manual` | `boolean` | Whether manually entered |
| `private` | `boolean` | Whether set to private |
| `gear_id` | `string` | ID of gear used |
| `workout_type` | `integer` | Workout type enum for runs/rides |

#### Detail Activity (additional fields from single-activity endpoint)

| Field | Type | Description |
|-------|------|-------------|
| `description` | `string` | Activity description text |
| `calories` | `float` | Kilocalories consumed |
| `device_name` | `string` | Recording device name |
| `gear` | `SummaryGear` | Full gear object |
| `segment_efforts` | `DetailedSegmentEffort[]` | Matched segment efforts |
| `splits_metric` | `Split[]` | Per-kilometer splits (runs) |
| `splits_standard` | `Split[]` | Per-mile splits (runs) |
| `laps` | `Lap[]` | Lap data |
| `best_efforts` | `DetailedSegmentEffort[]` | Best efforts for standard distances |
| `photos` | `PhotosSummary` | Activity photos |
| `embed_token` | `string` | Token for embedding |

### Athlete Stats

Available via `GET /athletes/{id}/stats`:

| Field | Type | Description |
|-------|------|-------------|
| `biggest_ride_distance` | `double` | Longest ride distance in meters |
| `biggest_climb_elevation_gain` | `double` | Biggest climb elevation in meters |
| `recent_ride_totals` | `ActivityTotal` | Last 4 weeks ride totals |
| `recent_run_totals` | `ActivityTotal` | Last 4 weeks run totals |
| `recent_swim_totals` | `ActivityTotal` | Last 4 weeks swim totals |
| `ytd_ride_totals` | `ActivityTotal` | Year-to-date ride totals |
| `ytd_run_totals` | `ActivityTotal` | Year-to-date run totals |
| `ytd_swim_totals` | `ActivityTotal` | Year-to-date swim totals |
| `all_ride_totals` | `ActivityTotal` | All-time ride totals |
| `all_run_totals` | `ActivityTotal` | All-time run totals |
| `all_swim_totals` | `ActivityTotal` | All-time swim totals |

Each `ActivityTotal` object contains: `count`, `distance`, `moving_time`, `elapsed_time`, `elevation_gain`.

### Stream Data (Time-Series)

Available via `GET /activities/{id}/streams`:

| Stream Type | Description |
|-------------|-------------|
| `time` | Seconds since start of activity |
| `distance` | Cumulative distance in meters |
| `latlng` | GPS coordinates `[latitude, longitude]` |
| `altitude` | Elevation in meters |
| `velocity_smooth` | Smoothed speed in meters/second |
| `heartrate` | Heart rate in BPM |
| `cadence` | Cadence in RPM (cycling) or SPM (running) |
| `watts` | Power in watts |
| `temp` | Temperature in Celsius |
| `moving` | Boolean, whether athlete is moving |
| `grade_smooth` | Smoothed grade/gradient as percentage |

Streams are recorded approximately every second. If a particular stream is not available for an activity (e.g., no heart rate monitor), it is omitted from the response.

### Upload Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| FIT | `.fit`, `.fit.gz` | Garmin's Flexible and Interoperable Data Transfer protocol; richest data |
| TCX | `.tcx`, `.tcx.gz` | Garmin Training Center XML |
| GPX | `.gpx`, `.gpx.gz` | GPS Exchange Format (widely supported) |

Maximum file size: 25 MB.

---

## 7. Integration Ideas for Workout Tracker PWA

### 7.1 Import Outdoor Activities into Workout History

Sync Strava activities (runs, rides, hikes) into the existing workout history timeline alongside gym sessions. Map Strava sport types to workout categories:

- `Run`, `TrailRun`, `VirtualRun` -> Cardio
- `Ride`, `MountainBikeRide`, `GravelRide` -> Cardio
- `Swim` -> Cardio
- `Yoga`, `Pilates` -> Mobility
- `WeightTraining`, `Crossfit` -> Weights
- `Hike`, `Walk` -> Cardio/Active Recovery

Display imported activities in the History page with Strava branding, showing distance, duration, pace, elevation, and heart rate data.

### 7.2 Display Strava Stats on the Home Page

Show aggregated Strava stats using `GET /athletes/{id}/stats`:

- Weekly/monthly/yearly running/cycling/swimming totals
- Longest ride, biggest climb records
- Recent activity streak
- Combined training load (gym + outdoor sessions)

This creates a unified fitness dashboard that goes beyond just gym workouts.

### 7.3 Sync Completed Workouts Back to Strava

After completing a gym workout in the app, create a corresponding activity on Strava using `POST /activities`:

```
POST /activities
{
  "name": "Push Day - Chest & Shoulders",
  "type": "WeightTraining",
  "sport_type": "WeightTraining",
  "start_date_local": "2025-01-15T07:30:00Z",
  "elapsed_time": 3600,
  "description": "Bench Press 4x8, OHP 3x10, Lateral Raises 3x15..."
}
```

This gives users a complete view of all training in one place and makes gym sessions visible to their Strava followers.

### 7.4 Show Training Load Alongside Gym Workouts

Combine gym workout data with Strava activity data to display:

- Total weekly training hours (gym + outdoor)
- Training frequency heatmap on the calendar
- Rest day recommendations based on combined load
- Weekly volume trends across all activity types

### 7.5 Use Strava Social Features

Leverage Strava's social data to enhance the Community page:

- Show kudos and comments on synced activities
- Display when friends complete workouts
- Show club activity feeds
- Enable giving kudos from within the app

### 7.6 Webhook Subscriptions for Real-Time Activity Sync

Instead of polling, use Strava webhooks to receive instant notifications when a user:

- Completes a new activity (auto-import into workout history)
- Updates an activity (sync changes)
- Deletes an activity (remove from history)
- Deauthorizes the app (clean up tokens)

This provides a seamless, always-up-to-date experience without manual sync actions.

### 7.7 GPS Route Display

Use activity stream data (`latlng`, `altitude`) and polyline map data to render interactive maps of outdoor activities directly in session detail pages. Show the route with color-coded segments for pace or heart rate zones.

### 7.8 Personal Records Integration

Use `best_efforts` data from detailed activities to display PRs for standard distances (1 mile, 5K, 10K, half marathon, marathon) alongside gym PRs already tracked in the app.

---

## 8. Technical Integration Plan

### 8.1 Database Schema Additions

Add Supabase tables to store Strava connection data:

```sql
-- Store Strava OAuth tokens per user
CREATE TABLE strava_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strava_athlete_id BIGINT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Store imported Strava activities
CREATE TABLE strava_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strava_activity_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  distance REAL,
  moving_time INTEGER,
  elapsed_time INTEGER,
  total_elevation_gain REAL,
  start_date TIMESTAMPTZ NOT NULL,
  average_speed REAL,
  max_speed REAL,
  average_heartrate REAL,
  max_heartrate REAL,
  calories REAL,
  summary_polyline TEXT,
  device_name TEXT,
  strava_gear_id TEXT,
  raw_data JSONB,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE strava_activities ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own strava connection"
  ON strava_connections FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own strava activities"
  ON strava_activities FOR ALL USING (auth.uid() = user_id);
```

### 8.2 OAuth Flow with Supabase Edge Functions

The OAuth flow requires server-side code to protect the `client_secret`. Use Supabase Edge Functions:

**Edge Function: `strava-auth` (initiates OAuth)**

```typescript
// supabase/functions/strava-auth/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { redirectUri } = await req.json()

  const clientId = Deno.env.get('STRAVA_CLIENT_ID')!
  const scope = 'read,activity:read_all,activity:write'
  const state = crypto.randomUUID() // CSRF protection

  const authUrl = new URL('https://www.strava.com/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scope)
  authUrl.searchParams.set('approval_prompt', 'auto')
  authUrl.searchParams.set('state', state)

  return new Response(
    JSON.stringify({ url: authUrl.toString(), state }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

**Edge Function: `strava-callback` (exchanges code for tokens)**

```typescript
// supabase/functions/strava-callback/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { code } = await req.json()
  const authHeader = req.headers.get('Authorization')!

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Exchange authorization code for tokens
  const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: Deno.env.get('STRAVA_CLIENT_ID'),
      client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
      code,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenResponse.json()

  if (tokenData.errors) {
    return new Response(
      JSON.stringify({ error: tokenData.errors }),
      { status: 400 }
    )
  }

  // Store tokens in Supabase
  const { error } = await supabase
    .from('strava_connections')
    .upsert({
      user_id: user.id,
      strava_athlete_id: tokenData.athlete.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      scope: 'read,activity:read_all,activity:write',
    })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }

  return new Response(
    JSON.stringify({
      athlete: tokenData.athlete,
      connected: true,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

**Edge Function: `strava-refresh` (refreshes expired tokens)**

```typescript
// supabase/functions/strava-refresh/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get current connection
  const { data: connection } = await supabase
    .from('strava_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!connection) {
    return new Response(
      JSON.stringify({ error: 'No Strava connection found' }),
      { status: 404 }
    )
  }

  // Check if token is still valid
  if (new Date(connection.expires_at) > new Date()) {
    return new Response(
      JSON.stringify({ access_token: connection.access_token }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Refresh the token
  const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: Deno.env.get('STRAVA_CLIENT_ID'),
      client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
    }),
  })

  const tokenData = await refreshResponse.json()

  // Update stored tokens
  await supabase
    .from('strava_connections')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return new Response(
    JSON.stringify({ access_token: tokenData.access_token }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### 8.3 Service File (`stravaService.ts`)

Following the existing service pattern in the codebase (e.g., `weatherService.ts`, `workoutService.ts`):

```typescript
// src/services/stravaService.ts
import { supabase } from './supabase'

// Types
export interface StravaConnection {
  id: string
  user_id: string
  strava_athlete_id: number
  access_token: string
  refresh_token: string
  expires_at: string
  scope: string
}

export interface StravaActivity {
  id: string
  strava_activity_id: number
  name: string
  sport_type: string
  distance: number | null
  moving_time: number | null
  elapsed_time: number | null
  total_elevation_gain: number | null
  start_date: string
  average_speed: number | null
  max_speed: number | null
  average_heartrate: number | null
  max_heartrate: number | null
  calories: number | null
  summary_polyline: string | null
  device_name: string | null
}

export interface StravaAthleteStats {
  biggest_ride_distance: number
  biggest_climb_elevation_gain: number
  recent_ride_totals: ActivityTotal
  recent_run_totals: ActivityTotal
  recent_swim_totals: ActivityTotal
  ytd_ride_totals: ActivityTotal
  ytd_run_totals: ActivityTotal
  ytd_swim_totals: ActivityTotal
  all_ride_totals: ActivityTotal
  all_run_totals: ActivityTotal
  all_swim_totals: ActivityTotal
}

export interface ActivityTotal {
  count: number
  distance: number
  moving_time: number
  elapsed_time: number
  elevation_gain: number
}

// Get a valid access token (refreshes if needed)
async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('strava-refresh')
  if (error) throw error
  return data.access_token
}

// Strava API wrapper
async function stravaFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `https://www.strava.com/api/v3${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  )

  if (response.status === 429) {
    throw new Error('Strava rate limit exceeded. Please try again later.')
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Strava API error')
  }

  return response.json()
}

// Connection management
export async function getStravaConnection(): Promise<StravaConnection | null> {
  const { data, error } = await supabase
    .from('strava_connections')
    .select('*')
    .single()

  if (error) return null
  return data
}

export async function disconnectStrava(): Promise<void> {
  const accessToken = await getAccessToken()

  // Deauthorize on Strava
  await fetch('https://www.strava.com/oauth/deauthorize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  // Remove local connection
  const { error } = await supabase
    .from('strava_connections')
    .delete()
    .eq('user_id', (await supabase.auth.getUser()).data.user!.id)

  if (error) throw error
}

// Activities
export async function fetchStravaActivities(
  page = 1,
  perPage = 30,
  after?: number
): Promise<StravaActivity[]> {
  let endpoint = `/athlete/activities?page=${page}&per_page=${perPage}`
  if (after) endpoint += `&after=${after}`

  return stravaFetch(endpoint)
}

export async function getStravaActivity(activityId: number) {
  return stravaFetch(`/activities/${activityId}`)
}

export async function createStravaActivity(activity: {
  name: string
  sport_type: string
  start_date_local: string
  elapsed_time: number
  description?: string
  distance?: number
}) {
  return stravaFetch('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  })
}

// Athlete stats
export async function getAthleteStats(
  athleteId: number
): Promise<StravaAthleteStats> {
  return stravaFetch(`/athletes/${athleteId}/stats`)
}

// Activity streams
export async function getActivityStreams(
  activityId: number,
  streamTypes: string[] = ['time', 'distance', 'heartrate', 'altitude', 'latlng']
) {
  const keys = streamTypes.join(',')
  return stravaFetch(
    `/activities/${activityId}/streams?keys=${keys}&key_by_type=true`
  )
}

// Sync activities to local database
export async function syncStravaActivities(
  since?: Date
): Promise<number> {
  const afterTimestamp = since
    ? Math.floor(since.getTime() / 1000)
    : undefined

  const activities = await fetchStravaActivities(1, 50, afterTimestamp)
  const userId = (await supabase.auth.getUser()).data.user!.id

  let syncedCount = 0
  for (const activity of activities) {
    const { error } = await supabase
      .from('strava_activities')
      .upsert({
        user_id: userId,
        strava_activity_id: activity.strava_activity_id,
        name: activity.name,
        sport_type: activity.sport_type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        start_date: activity.start_date,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        calories: activity.calories,
        summary_polyline: activity.summary_polyline,
        device_name: activity.device_name,
        raw_data: activity,
      }, {
        onConflict: 'strava_activity_id',
      })

    if (!error) syncedCount++
  }

  return syncedCount
}

// Get locally stored Strava activities
export async function getLocalStravaActivities(
  limit = 50,
  offset = 0
): Promise<StravaActivity[]> {
  const { data, error } = await supabase
    .from('strava_activities')
    .select('*')
    .order('start_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}
```

### 8.4 React Hook (`useStrava.ts`)

Following the TanStack Query hook pattern used throughout the codebase:

```typescript
// src/hooks/useStrava.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as stravaService from '@/services/stravaService'

export function useStravaConnection() {
  return useQuery({
    queryKey: ['strava', 'connection'],
    queryFn: stravaService.getStravaConnection,
    staleTime: 5 * 60 * 1000, // 5 minutes, matching existing pattern
  })
}

export function useStravaActivities(limit = 50) {
  return useQuery({
    queryKey: ['strava', 'activities', limit],
    queryFn: () => stravaService.getLocalStravaActivities(limit),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  })
}

export function useStravaStats(athleteId: number | undefined) {
  return useQuery({
    queryKey: ['strava', 'stats', athleteId],
    queryFn: () => stravaService.getAthleteStats(athleteId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!athleteId,
  })
}

export function useSyncStravaActivities() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (since?: Date) => stravaService.syncStravaActivities(since),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strava', 'activities'] })
    },
  })
}

export function useDisconnectStrava() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: stravaService.disconnectStrava,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strava'] })
    },
  })
}

export function useCreateStravaActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: stravaService.createStravaActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strava', 'activities'] })
    },
  })
}
```

### 8.5 Webhook Handler (Supabase Edge Function)

```typescript
// supabase/functions/strava-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Handle webhook validation (GET request from Strava)
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const challenge = url.searchParams.get('hub.challenge')
    const verifyToken = url.searchParams.get('hub.verify_token')

    if (
      mode === 'subscribe' &&
      verifyToken === Deno.env.get('STRAVA_VERIFY_TOKEN')
    ) {
      return new Response(
        JSON.stringify({ 'hub.challenge': challenge }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response('Forbidden', { status: 403 })
  }

  // Handle webhook events (POST request from Strava)
  if (req.method === 'POST') {
    const event = await req.json()

    // Use service role for server-side operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { object_type, aspect_type, object_id, owner_id } = event

    if (object_type === 'activity') {
      // Find the user by their Strava athlete ID
      const { data: connection } = await supabase
        .from('strava_connections')
        .select('*')
        .eq('strava_athlete_id', owner_id)
        .single()

      if (!connection) {
        return new Response('OK', { status: 200 })
      }

      if (aspect_type === 'create' || aspect_type === 'update') {
        // Fetch the full activity from Strava
        const activityResponse = await fetch(
          `https://www.strava.com/api/v3/activities/${object_id}`,
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
            },
          }
        )
        const activity = await activityResponse.json()

        // Upsert into local database
        await supabase
          .from('strava_activities')
          .upsert({
            user_id: connection.user_id,
            strava_activity_id: activity.id,
            name: activity.name,
            sport_type: activity.sport_type,
            distance: activity.distance,
            moving_time: activity.moving_time,
            elapsed_time: activity.elapsed_time,
            total_elevation_gain: activity.total_elevation_gain,
            start_date: activity.start_date,
            average_speed: activity.average_speed,
            max_speed: activity.max_speed,
            average_heartrate: activity.average_heartrate,
            max_heartrate: activity.max_heartrate,
            calories: activity.calories,
            summary_polyline: activity.map?.summary_polyline,
            device_name: activity.device_name,
            raw_data: activity,
          }, {
            onConflict: 'strava_activity_id',
          })
      }

      if (aspect_type === 'delete') {
        await supabase
          .from('strava_activities')
          .delete()
          .eq('strava_activity_id', object_id)
      }
    }

    if (object_type === 'athlete' && aspect_type === 'update') {
      // Handle deauthorization
      const updates = event.updates
      if (updates?.authorized === 'false') {
        await supabase
          .from('strava_connections')
          .delete()
          .eq('strava_athlete_id', owner_id)
      }
    }

    // Must respond with 200 within 2 seconds
    return new Response('OK', { status: 200 })
  }

  return new Response('Method not allowed', { status: 405 })
})
```

### 8.6 Environment Variables

Add to `.env.local`:

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_VERIFY_TOKEN=your_custom_webhook_verify_token
```

Add to Supabase Edge Function secrets:

```bash
supabase secrets set STRAVA_CLIENT_ID=your_client_id
supabase secrets set STRAVA_CLIENT_SECRET=your_client_secret
supabase secrets set STRAVA_VERIFY_TOKEN=your_custom_webhook_verify_token
```

### 8.7 Frontend OAuth Callback Route

Add a new route `/auth/strava/callback` to handle the OAuth redirect:

```typescript
// src/pages/StravaCallback.tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { useToast } from '@/hooks/useToast'

export default function StravaCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      showToast('Strava connection cancelled', 'error')
      navigate('/profile')
      return
    }

    if (code) {
      supabase.functions
        .invoke('strava-callback', {
          body: { code },
        })
        .then(({ data, error }) => {
          if (error) {
            showToast('Failed to connect Strava', 'error')
          } else {
            showToast('Strava connected!', 'success')
          }
          navigate('/profile')
        })
    }
  }, [searchParams, navigate, showToast])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Connecting to Strava...</p>
    </div>
  )
}
```

---

## 9. Limitations and Considerations

### Rate Limits

- **200 requests per 15 minutes, 2,000 per day** is the default. For a single-user app this is generous, but for multi-user deployment you will need to request an increase.
- Implement exponential backoff when receiving `429` responses.
- Cache Strava data locally in Supabase to minimize API calls.
- Use webhooks instead of polling to stay within limits.

### Token Management

- Access tokens expire every **6 hours**. You must implement automatic refresh.
- Each refresh returns a **new refresh token** that invalidates the previous one. Always update stored tokens atomically.
- If a refresh token is lost or corrupted, the user must re-authorize via OAuth.

### Data Access

- Apps start in **"Single Player Mode"** with a capacity of 1 athlete (the developer only).
- To allow other users, you must apply to the Strava Developer Program.
- Users can opt out of any requested scope. Handle partial authorization gracefully.
- Activities set to "Only You" visibility require `activity:read_all` scope.
- Privacy zones are only included with `activity:read_all` scope.

### Branding Requirements

- You **must** display "Powered by Strava" branding when showing Strava data.
- Use the official "Connect with Strava" button for the OAuth initiation.
- Do not use Strava's name or logo as part of your app's name, icon, or branding.
- Brand assets and guidelines are available at [https://developers.strava.com/guidelines/](https://developers.strava.com/guidelines/).

### API Agreement (Key Points)

- Do not cache Strava data for longer than necessary.
- Do not replicate Strava's core features (segment leaderboards, route planning, social feed).
- Respect user privacy and data deletion requests.
- Display proper attribution for all Strava data.
- The API agreement was updated in late 2024 with stricter terms around data display and third-party app functionality.

### Webhook Requirements

- Your callback URL must be publicly accessible (HTTPS required).
- Must respond to both validation and event requests within **2 seconds**.
- Each application can have **only one** webhook subscription.
- Events are retried up to 3 times if a `200` response is not received.
- Some activity attributes are updated asynchronously, so a single save by the user can trigger multiple webhook events.
- For local development, use a tunnel service (e.g., ngrok) to expose your local server.

### What Is NOT Available via API

- Strava's "Relative Effort" / "Suffer Score" (proprietary metric)
- Strava's route recommendations
- Full segment leaderboard data beyond the authenticated athlete
- Detailed training plan features
- Beacon / live tracking data

### PWA / Offline Considerations

- Strava API calls require network connectivity; design the sync flow to handle offline gracefully.
- Cache imported activities in Supabase for offline access.
- Queue outbound syncs (creating activities on Strava) for when connectivity is restored.
- The existing NetworkFirst PWA caching strategy for Supabase calls covers locally stored Strava data.

---

## 10. Code Examples

### 10.1 Initiate Strava OAuth from the Frontend

```typescript
async function connectStrava() {
  const redirectUri = `${window.location.origin}/auth/strava/callback`

  const { data, error } = await supabase.functions.invoke('strava-auth', {
    body: { redirectUri },
  })

  if (error) throw error

  // Store state for CSRF validation
  sessionStorage.setItem('strava_oauth_state', data.state)

  // Redirect to Strava authorization page
  window.location.href = data.url
}
```

### 10.2 Fetch Activities with Pagination

```typescript
async function fetchAllActivities(accessToken: string) {
  const allActivities = []
  let page = 1
  const perPage = 100

  while (true) {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (response.status === 429) {
      // Rate limited - wait and retry
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      continue
    }

    const activities = await response.json()
    if (activities.length === 0) break

    allActivities.push(...activities)
    page++
  }

  return allActivities
}
```

### 10.3 Create a Manual Activity on Strava After Completing a Gym Workout

```typescript
async function syncWorkoutToStrava(
  accessToken: string,
  session: {
    name: string
    startTime: string
    durationSeconds: number
    exercises: Array<{ name: string; sets: number; reps: number; weight: number }>
  }
) {
  const description = session.exercises
    .map(e => `${e.name}: ${e.sets}x${e.reps} @ ${e.weight}lbs`)
    .join('\n')

  const response = await fetch('https://www.strava.com/api/v3/activities', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: session.name,
      sport_type: 'WeightTraining',
      start_date_local: session.startTime,
      elapsed_time: session.durationSeconds,
      description: description,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create Strava activity: ${response.statusText}`)
  }

  return response.json()
}
```

### 10.4 Fetch Activity Streams (Heart Rate, GPS, Elevation)

```typescript
async function getActivityDetails(accessToken: string, activityId: number) {
  const streams = ['time', 'latlng', 'altitude', 'heartrate', 'velocity_smooth', 'cadence', 'watts']
  const keys = streams.join(',')

  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=${keys}&key_by_type=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  const data = await response.json()

  // Data comes back as { time: { data: [...] }, latlng: { data: [...] }, ... }
  return {
    time: data.time?.data || [],
    coordinates: data.latlng?.data || [],
    elevation: data.altitude?.data || [],
    heartRate: data.heartrate?.data || [],
    speed: data.velocity_smooth?.data || [],
    cadence: data.cadence?.data || [],
    power: data.watts?.data || [],
  }
}
```

### 10.5 Set Up Webhook Subscription (One-Time Setup Script)

```bash
# Create webhook subscription
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/strava-webhook \
  -F verify_token=YOUR_CUSTOM_VERIFY_TOKEN

# View existing subscription
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET

# Delete a subscription
curl -X DELETE "https://www.strava.com/api/v3/push_subscriptions/SUBSCRIPTION_ID?client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

### 10.6 Check Rate Limit Headers

```typescript
async function stravaFetchWithRateLimitCheck(
  endpoint: string,
  accessToken: string
) {
  const response = await fetch(
    `https://www.strava.com/api/v3${endpoint}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  // Parse rate limit headers
  const limitHeader = response.headers.get('X-RateLimit-Limit')    // "100,1000"
  const usageHeader = response.headers.get('X-RateLimit-Usage')    // "34,562"

  if (limitHeader && usageHeader) {
    const [fifteenMinLimit, dailyLimit] = limitHeader.split(',').map(Number)
    const [fifteenMinUsage, dailyUsage] = usageHeader.split(',').map(Number)

    console.log(`Rate limit: ${fifteenMinUsage}/${fifteenMinLimit} (15 min), ${dailyUsage}/${dailyLimit} (daily)`)

    // Warn if approaching limits
    if (fifteenMinUsage / fifteenMinLimit > 0.8) {
      console.warn('Approaching 15-minute rate limit!')
    }
    if (dailyUsage / dailyLimit > 0.8) {
      console.warn('Approaching daily rate limit!')
    }
  }

  if (response.status === 429) {
    throw new Error('Rate limit exceeded')
  }

  return response.json()
}
```

### 10.7 Token Refresh Flow (Standalone)

```typescript
async function refreshStravaToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<{
  access_token: string
  refresh_token: string
  expires_at: number
}> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token')
  }

  const data = await response.json()

  // IMPORTANT: Store the new refresh_token immediately.
  // The old refresh_token is now invalid.
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }
}
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Base URL | `https://www.strava.com/api/v3/` |
| Auth URL | `https://www.strava.com/oauth/authorize` |
| Token URL | `https://www.strava.com/oauth/token` |
| Deauth URL | `https://www.strava.com/oauth/deauthorize` |
| Webhook URL | `https://www.strava.com/api/v3/push_subscriptions` |
| Token Expiry | 6 hours |
| Rate Limit (15 min) | 200 overall / 100 read-only |
| Rate Limit (daily) | 2,000 overall / 1,000 read-only |
| Upload Max Size | 25 MB |
| Upload Formats | FIT, TCX, GPX (+ gzipped variants) |
| API Settings Page | [strava.com/settings/api](https://www.strava.com/settings/api) |
| Developer Docs | [developers.strava.com/docs](https://developers.strava.com/docs/) |
| API Reference | [developers.strava.com/docs/reference](https://developers.strava.com/docs/reference/) |
| Brand Guidelines | [developers.strava.com/guidelines](https://developers.strava.com/guidelines/) |
| API Playground | [developers.strava.com/playground](https://developers.strava.com/playground/) |
