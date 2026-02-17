# Data Flow: Workout Completion to Community Feed

## Overview

This document traces how completed workouts flow from the database into the Community page feed, what stats are computed and displayed, and whether the `set_number` bug (all sets having set_number=1) would affect community-visible stats.

---

## 1. Community Page Architecture

### File: `src/pages/Community.tsx`

**Two feed modes:**
- `'discover'` -- shows all public workouts (default for new users)
- `'following'` -- shows workouts from followed users + own workouts

**Key hooks:**
```
useSocialFeed(feedMode)          -> socialService.getSocialFeed()   -> infinite query
useFollowCounts(userId)          -> follow counts for tab badges
useSuggestedUsers(6)             -> user suggestions on discover tab
useSearchUsers(query)            -> search people
useActiveChallenges()            -> active challenge cards
useCommunityNotifications()      -> notification panel
useCheckBadges()                 -> badge award check on page load
```

The feed only renders on the `'following'` tab. The `'discover'` tab shows: search bar, suggested users, active challenges, and leaderboard.

---

## 2. Social Feed Data Fetching

### File: `src/services/socialService.ts` -> `getSocialFeed()`

**Step 1: Fetch completed sessions from two tables in parallel**

```sql
-- Weights sessions
SELECT id, user_id, started_at, completed_at, notes, is_public,
       workout_day:workout_days(name)
FROM workout_sessions
WHERE is_public = true AND completed_at IS NOT NULL
  [AND user_id IN (followingIds)]  -- only for 'following' mode
  [AND completed_at < cursor]       -- pagination
ORDER BY completed_at DESC
LIMIT 20

-- Template sessions (cardio/mobility)
SELECT id, user_id, started_at, completed_at, notes, is_public,
       duration_minutes, distance_value, distance_unit,
       template:workout_templates(name, type, category)
FROM template_workout_sessions
WHERE is_public = true AND completed_at IS NOT NULL
  [AND user_id IN (followingIds)]
  [AND completed_at < cursor]
ORDER BY completed_at DESC
LIMIT 20
```

**Step 2: Batch fetch related data (6 parallel queries)**

```typescript
const [profiles, reactions, reviews, photos, exerciseSets, streaks] = await Promise.all([
  fetchUserProfiles([...userIds]),
  fetchReactionsForSessions(sessionIds, templateSessionIds),
  fetchReviewsForSessions(sessionIds, templateSessionIds),
  fetchPhotosForSessions(sessionIds, templateSessionIds),
  fetchExerciseSetsForSessions(sessionIds),       // WEIGHTS ONLY
  computeStreaksForUsers([...userIds]),
])
```

**Step 3: Build FeedWorkout objects and sort by completed_at DESC**

---

## 3. Exercise Sets Fetching for Community Feed

### `fetchExerciseSetsForSessions()` (socialService.ts line 630)

```sql
SELECT id, session_id, plan_exercise_id, set_number,
       reps_completed, weight_used, completed,
       plan_exercise:plan_exercises(name, weight_unit, reps_unit)
FROM exercise_sets
WHERE session_id IN ($sessionIds)
ORDER BY set_number ASC
```

Results are grouped into `Map<session_id, FeedExerciseSet[]>`.

---

## 4. Stats Computed for Each Weights Workout

### In `getSocialFeed()` (socialService.ts lines 127-157):

```typescript
const sets = exerciseSets.get(w.id) || []

// 1. exercise_count: count of unique exercise NAMES
const exerciseNames = new Set(sets.map(s => s.plan_exercise?.name).filter(Boolean))
exercise_count = exerciseNames.size

// 2. total_volume: sum of (reps * weight) across all sets
const totalVolume = sets.reduce((sum, s) => {
  if (s.reps_completed && s.weight_used) return sum + s.reps_completed * s.weight_used
  return sum
}, 0)

// 3. duration_minutes: computed from completed_at - started_at
const duration = w.completed_at && w.started_at
  ? Math.round((new Date(w.completed_at).getTime() - new Date(w.started_at).getTime()) / 60000)
  : null
```

### For cardio/mobility template sessions:
```typescript
exercise_count = 0           // Always 0 (no exercise_sets for templates)
total_volume = null           // Not applicable
duration_minutes = t.duration_minutes  // From the session record
distance_value / distance_unit        // From the session record
```

---

## 5. How Stats Are Displayed in WorkoutCard

### File: `src/components/social/WorkoutCard.tsx`

**Collapsed view shows:**
- User avatar + display name
- Workout name (from `getWorkoutDisplayName()`)
- Duration (minutes)
- Exercise count (weights only): `"{exercise_count} exercises"`
- Distance + pace (cardio only)
- Total volume (weights only): `"{formatVolume(total_volume)} lbs total volume"`
- Mood before -> after (emoji pills)
- Top performance tag
- Streak badge (if >= STREAK_BADGE_THRESHOLD = 3 days)
- Photo previews (up to 3)

**Expanded view adds (via `ExpandedContent`):**
- Review rating (stars) + difficulty
- Full mood before -> after with labels
- Exercise list with sets x reps (`groupExercises()` -> `formatExerciseSummary()`)
- All performance tags
- Reflection text
- Reaction bar
- "View Full Workout" button

### `groupExercises()` function (WorkoutCard.tsx line 50):

Groups `FeedExerciseSet[]` by `plan_exercise_id` (not name), then:
```typescript
setCount = exerciseSets.length   // COUNT of rows per exercise
reps = exerciseSets[0]?.reps_completed  // First set's reps
```

Display format: `"{setCount}x{reps}"` (e.g., "3x10")

---

## 6. Impact of set_number Bug on Community Stats

### Scenario: All exercise_sets have `set_number = 1`

If a bug caused all logged sets to have `set_number = 1` instead of incrementing (1, 2, 3...):

| Stat | Affected? | Explanation |
|------|-----------|-------------|
| **exercise_count** | NO | Computed from `new Set(sets.map(s => s.plan_exercise?.name))` -- uses exercise names, not set_number |
| **total_volume** | NO | Computed from `sum(reps_completed * weight_used)` across ALL set rows -- does not reference set_number |
| **duration_minutes** | NO | Computed from `completed_at - started_at` timestamps, independent of sets |
| **Expanded exercise list (setCount)** | NO | `groupExercises()` counts rows via `exerciseSets.length`, not set_number |
| **Expanded exercise list (reps)** | POSSIBLY | Uses `exerciseSets[0]?.reps_completed` -- if set_number ordering is wrong, the "first" set might not be the representative one, but since all sets in `logMultipleExerciseSets` have the same reps, this is fine |
| **Expanded exercise list (order)** | YES (minor) | The SQL `ORDER BY set_number` would return all rows in arbitrary order if all have set_number=1. However since `groupExercises` groups by `plan_exercise_id`, the grouping is still correct -- only within-exercise ordering would be scrambled |

### Conclusion: set_number bug has MINIMAL impact on community stats

The community feed does NOT use `set_number` for any computed stat. All key metrics (exercise_count, total_volume, duration, setCount display) are derived from:
- Row count (number of exercise_set rows)
- Actual `reps_completed` and `weight_used` values
- Session timestamps
- Distinct exercise names

The only place `set_number` matters is the `ORDER BY set_number` in the fetch query, which affects the ordering of sets within an exercise in the expanded view. If all sets have set_number=1, they would appear in insertion order (which is typically correct anyway from `logMultipleExerciseSets`).

---

## 7. Additional Feed Features

### Reactions (ReactionBar)
- `activity_reactions` table with polymorphic FKs (session_id / template_session_id)
- 4 reaction types: fire, strong, props, impressive
- Batch-fetched with sessions, attached to FeedWorkout

### Reviews
- `workout_reviews` table with polymorphic FKs
- 1:1 with sessions, shows: rating, difficulty, mood, tags, reflection
- Batch-fetched, converted to single-value map

### Photos
- `workout_photos` table with polymorphic FKs
- Ordered by `sort_order`, shown as thumbnail grid

### Streaks
- Computed from all completed sessions (both tables) within last 365 days
- Walks backward from today counting consecutive workout days
- Today without a workout doesn't break the streak
- Displayed as badge when >= 3 days

### Privacy Controls
- `is_public` flag on both session tables (default: true based on `?? true` fallback)
- `hide_weight_details` on user_profiles hides volume/weight from other users
- `toggleWorkoutPublic()` updates the is_public flag

---

## 8. Complete Data Flow Summary

```
Workout Completion:
  Workout.tsx -> completeWorkout() -> workout_sessions UPDATE (completed_at)
  Session marked is_public = true (default)

Community Feed Loading:
  CommunityPage -> useSocialFeed(feedMode) -> getSocialFeed()
    1. Fetch public completed sessions from workout_sessions + template_workout_sessions
    2. Batch fetch: profiles, reactions, reviews, photos, exercise_sets, streaks
    3. Build FeedWorkout[] with computed stats (exercise_count, total_volume, duration)
    4. Sort by completed_at DESC, paginate with cursor

WorkoutCard Rendering:
  Collapsed: name, duration, exercise_count, volume, mood, tag, streak, photos
  Expanded:  + grouped exercises (setCount x reps), review details, reactions, reflection

Stats Derivation:
  exercise_count = count of unique plan_exercise names in exercise_sets
  total_volume   = sum(reps_completed * weight_used) across all exercise_sets
  duration       = completed_at - started_at (timestamps)
  setCount (UI)  = count of exercise_set rows per plan_exercise_id
```

---

## 9. Key Files

| File | Role |
|------|------|
| `src/pages/Community.tsx` | Page component, feed modes, search, challenges, notifications |
| `src/hooks/useSocial.ts` | TanStack infinite query wrapper for getSocialFeed |
| `src/services/socialService.ts` | All Supabase queries: feed, profiles, reactions, reviews, photos, sets, streaks |
| `src/components/social/WorkoutCard.tsx` | Main feed card: collapsed + expanded views, stat display |
| `src/components/social/ActivityFeed.tsx` | Simpler feed component (used elsewhere, not on Community page) |
| `src/components/social/ReactionBar.tsx` | Reaction UI for each workout card |
| `src/types/community.ts` | FeedWorkout, FeedExerciseSet, FeedReview, etc. type definitions |
| `src/config/communityConfig.ts` | Feed page size, stale time, reaction config, UI limits |
