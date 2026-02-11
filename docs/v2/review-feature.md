# Workout Review Feature - Product Requirements Document

> **Status**: Implemented (Phase 1)
> **Date**: February 11, 2026
> **Author**: Auto-generated from implementation

---

## Executive Summary

The Workout Review feature adds a structured post-workout reflection system to the Workout Tracker PWA. After completing any workout session (weights, cardio, or mobility), users are prompted to rate their experience, track their mood and energy levels, tag performance attributes, and write free-form reflections. This transforms the app from a pure exercise logger into a holistic training journal that captures the subjective quality of every session.

**What**: A 4-step review flow (rating, mood/energy, performance tags, reflection) triggered after workout completion, with review data persisted in Supabase and aggregated into weekly summaries and lifetime stats.

**Why**: Workout tracking apps typically capture only the objective data (weight, reps, duration) but miss the subjective experience. Research in sports psychology shows that self-reflection on training quality, mood, and perceived exertion is a strong predictor of long-term adherence and program optimization. Users need a low-friction way to capture "how it felt" alongside "what I did."

**For Whom**: All existing users of the Workout Tracker PWA who complete weights, cardio, or mobility sessions. The feature is designed for self-tracking gym-goers who want deeper insight into their training quality over time.

---

## Problem Statement

### Gap in V1

V1 captures **what** a user did (exercises, sets, reps, weight, duration) but not **how** it went. After finishing a workout, the session is saved and the user moves on. There is no mechanism to:

1. **Rate workout quality** - Was this a productive session or a slog?
2. **Track mood changes** - Did the workout improve their mental state?
3. **Identify patterns** - Are mornings better? Are certain exercises draining?
4. **Reflect and learn** - What went well? What should change next time?

### User Impact

Without this feedback loop, users have no way to:
- Correlate training quality with external factors (sleep, stress, nutrition)
- Detect overtraining or undertraining from subjective signals
- Celebrate good sessions or learn from poor ones
- Build a narrative of their fitness journey beyond raw numbers

### Product Impact

Without review data, the product cannot:
- Surface training quality trends on the home page or stats dashboard
- Power future AI-driven workout recommendations
- Differentiate from commodity rep-tracking apps
- Provide community features like "how others felt" on similar workouts

---

## Feature Overview

### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| R-1 | User who just finished a workout | Rate my overall workout experience (1-5 stars) | I can track workout quality over time |
| R-2 | User reviewing my workout | Record my mood before and after the session | I can see how exercise affects my mental state |
| R-3 | User reviewing my workout | Rate the difficulty and my energy level | I can detect overtraining or under-recovery |
| R-4 | User reviewing my workout | Tag my session with performance labels (e.g., "Felt Strong", "New PR") | I can quickly categorize sessions without writing |
| R-5 | User reviewing my workout | Write a free-form reflection, highlights, and areas for improvement | I can capture nuanced thoughts that tags and ratings miss |
| R-6 | User viewing my history | See the review I left for any past session | I can recall how a workout felt, not just what I did |
| R-7 | User on the home/stats page | See weekly review summaries with average ratings and mood trends | I can spot patterns in my training quality |
| R-8 | User who skips reviews | Skip the review entirely or skip optional steps | The feature never blocks my post-workout flow |

### Acceptance Criteria

- **AC-1**: After completing any workout type (weights, cardio, mobility), a review modal appears.
- **AC-2**: The review flow has 4 steps: Rating (required), Mood/Energy (optional), Tags (optional), Reflection (optional).
- **AC-3**: Only the overall rating is required; users can skip all other steps.
- **AC-4**: Each session can have at most one review (enforced at the database level).
- **AC-5**: Reviews can be viewed alongside session details in History.
- **AC-6**: Reviews can be edited or deleted after creation.
- **AC-7**: Weekly review summaries aggregate rating, difficulty, energy, mood improvement, and top tags.
- **AC-8**: The review modal preserves draft state across steps (Zustand store).
- **AC-9**: RLS policies ensure users can only access their own reviews.

---

## Technical Architecture

### Database Schema Rationale

The `workout_reviews` table uses a **polymorphic session reference** pattern:

```sql
session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,
CONSTRAINT review_has_exactly_one_session CHECK (
  (session_id IS NOT NULL AND template_session_id IS NULL) OR
  (session_id IS NULL AND template_session_id IS NOT NULL)
)
```

**Why polymorphic references instead of a unified session table?**

V1 has two distinct session tables: `workout_sessions` (weights) and `template_workout_sessions` (cardio/mobility). Refactoring them into a single table would be a massive migration affecting the entire app. The polymorphic approach lets us add reviews without touching existing tables, following the v2 migration strategy of "additive only, no dropping existing tables/columns."

**Why a CHECK constraint for exclusivity?**

A simple nullable pattern (both columns nullable) would allow invalid states where both are NULL or both are set. The CHECK constraint at the database level makes illegal states unrepresentable, which is stronger than application-level validation alone.

**Why UNIQUE constraints per session column?**

```sql
CONSTRAINT unique_weights_session_review UNIQUE (session_id),
CONSTRAINT unique_template_session_review UNIQUE (template_session_id)
```

This enforces one-review-per-session at the database level. PostgreSQL unique constraints on nullable columns ignore NULL values, so this works correctly with the polymorphic pattern: the UNIQUE on `session_id` only applies when `session_id` is not NULL.

**Why JSONB for performance_tags?**

Tags are a variable-length list of enum-like strings. JSONB provides:
- No join table needed (simpler queries)
- Array containment queries (`@>`) for filtering
- Easy to extend with new tag values without migrations
- Adequate performance for per-user queries (not a high-cardinality search dimension)

A normalized `review_tags` join table was considered but rejected as over-engineering for a feature where tags are always read/written as a complete set, never queried individually at scale.

**Why cache `workout_duration_minutes`?**

Duration is derived from session start/end timestamps, but computing it requires joining to the session tables. Caching it on the review enables aggregation queries (average workout duration in reviewed sessions) without cross-table joins.

### Indexes

Five indexes support the expected query patterns:

| Index | Purpose |
|-------|---------|
| `idx_workout_reviews_user_id` | All queries filter by user (RLS + application) |
| `idx_workout_reviews_session_id` (partial) | Look up review for a specific weights session |
| `idx_workout_reviews_template_session_id` (partial) | Look up review for a specific cardio/mobility session |
| `idx_workout_reviews_created_at` | Date range queries (weekly summaries) |
| `idx_workout_reviews_overall_rating` | Future: filter/sort by rating |

Partial indexes (`WHERE ... IS NOT NULL`) on the session columns avoid indexing the NULL side of the polymorphic reference, saving space.

### Row Level Security

Standard user-scoped RLS pattern matching all other tables in the app:

- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id` (WITH CHECK)
- UPDATE: `auth.uid() = user_id` (both USING and WITH CHECK)
- DELETE: `auth.uid() = user_id`

This ensures a user can never read, create, modify, or delete another user's reviews, even if they somehow obtain the review ID.

### Service Layer Design

`reviewService.ts` follows the exact same pattern as every other service in the app (e.g., `feedbackService.ts`, `profileService.ts`):

```
Types → CRUD functions → Supabase client calls
```

**Key design decisions:**

1. **Types co-located with service**: `WorkoutReview`, `CreateReviewData`, `UpdateReviewData`, `MoodValue`, `PerformanceTag` are defined in the service file rather than in `src/types/`. This matches the existing pattern where domain types live alongside the service that operates on them (see `profileService.ts` with `UserProfile`).

2. **Separation of create vs update types**: `CreateReviewData` has `session_id` and `template_session_id` as optional (the polymorphic reference), while `UpdateReviewData` excludes them entirely. Once a review is linked to a session, that link cannot change.

3. **`maybeSingle()` for lookups**: `getReviewBySessionId` and `getReviewByTemplateSessionId` use `.maybeSingle()` instead of `.single()` because a session may not have a review yet. This returns `null` instead of throwing.

4. **Pagination on `getUserReviews`**: Uses `.range(offset, offset + limit - 1)` for cursor-free pagination. This is adequate for personal review lists (unlikely to exceed hundreds of entries).

5. **`getReviewCount` uses `head: true`**: Efficient count-only query that does not transfer row data.

### Data Flow

```
User completes workout
  → workoutStore.completeWorkout() or templateWorkout completion
    → reviewStore.openReview({ sessionId, sessionType, durationMinutes })
      → ReviewModal opens (step 0)
        → User navigates steps, reviewStore.updateDraft() on each change
          → User submits → useCreateReview().mutate(draft)
            → reviewService.createReview() → Supabase INSERT
              → onSuccess → invalidate ['reviews'] and ['review', 'session', id] queries
                → ReviewModal closes, reviewStore.closeReview()
```

For reading reviews later:

```
SessionDetail page loads
  → useSessionReview(sessionId) or useTemplateSessionReview(templateSessionId)
    → reviewService.getReviewBySessionId() → Supabase SELECT
      → Review data displayed in session detail view
```

For aggregation:

```
Stats/Home page loads
  → useWeeklyReview(weekStart) or useReviewStats()
    → reviewService.getReviewsInRange() or getUserReviews()
      → TanStack Query `select` transform → computeWeeklyStats() or computeReviewStats()
        → Derived stats rendered in UI
```

---

## UI/UX Design Decisions

### Multi-Step Review Flow Rationale

The review is a 4-step wizard rather than a single form because:

1. **Reduced cognitive load**: A single form with 10+ fields feels overwhelming after a tiring workout. Breaking it into focused steps (one concern per step) makes each step feel quick and achievable.

2. **Progressive disclosure**: Only the rating (step 0) is required. Steps 1-3 are marked as optional in the step config. Users who want a quick review can rate and submit in under 5 seconds. Users who want depth can continue through all steps.

3. **Mobile-first design**: Each step fits on a single mobile screen without scrolling, with large touch targets (star ratings, mood buttons, tag chips).

4. **Preservation of state**: The Zustand `reviewStore` holds the draft across steps, so navigating back and forth never loses data. This is the same pattern used by the onboarding wizard.

### Step Breakdown

| Step | Content | Required? | Why This Order |
|------|---------|-----------|---------------|
| 0 - Rating | Overall rating (1-5 stars), difficulty rating (1-5) | Overall rating required | First impression is most valuable; captures gut reaction |
| 1 - Mood & Energy | Mood before (5 options), mood after (5 options), energy level (1-5) | Optional | Mood recall degrades quickly; asking early preserves accuracy |
| 2 - Tags | 12 performance tags (multi-select chips) | Optional | Quick categorization before the effort of writing |
| 3 - Reflection | Free-form text: reflection, highlights, improvements | Optional | Writing requires the most effort; placed last so fatigued users can skip |

### Mood Tracking Rationale

**Why track mood before AND after?**

The before/after delta is more valuable than either value alone. A user who starts "stressed" and ends "great" had a transformative workout. A user who starts "good" and ends "tired" may be overtraining. This delta is computed in `computeWeeklyStats()` as `moodImprovement` using numeric scores (stressed=1 through great=5).

**Why 5 mood options (not a numeric scale)?**

Discrete, labeled moods are faster to select than a numeric slider and produce more consistent data. Users intuitively know the difference between "great" and "good" but struggle to distinguish between "7" and "8" on a 10-point scale. The 5 options (great, good, neutral, tired, stressed) cover the key emotional states relevant to exercise.

**Why emojis alongside text labels?**

Emojis provide instant visual recognition across languages and reduce reading time. The fire emoji for "great" and the sleeping face for "tired" are universally understood. This matches fitness app conventions (Strava, Garmin Connect) where mood selection uses visual indicators.

### Tag System Design

**Why 12 tags?**

The tag list covers two categories:
- **Positive** (6): felt_strong, new_pr, pumped, focused, good_form, breakthrough
- **Negative/Neutral** (6): heavy, light_day, tired, sore, rushed, distracted

This balance prevents positivity bias while keeping the list scannable. Each tag has a distinct Lucide icon and color for quick visual differentiation.

**Why toggle chips instead of free-form tags?**

- Predefined tags ensure consistent data for aggregation (top tags per week/month)
- Chip UI is faster than typing, especially on mobile after a workout
- Free-form tags lead to inconsistency ("felt strong" vs "strong" vs "STRONG")
- The reflection text field (step 3) exists for users who want to express something the tags do not cover

**Why JSONB storage?**

Tags are always read and written as a complete set (never individually queried). JSONB avoids a join table and makes the insert/update operations simpler. For the expected data volume (one review per workout per user), JSONB performance is identical to a normalized approach.

### Rating Scale Design

**Why 1-5 instead of 1-10?**

A 5-point scale has higher inter-rater reliability. Users produce more consistent ratings when the options are fewer and more distinct. Each value has a clear label:

| Rating | Overall | Difficulty | Energy |
|--------|---------|-----------|--------|
| 1 | Poor | Easy | Drained |
| 2 | Fair | Moderate | Low |
| 3 | Good | Challenging | Normal |
| 4 | Great | Hard | High |
| 5 | Amazing | Brutal | Energized |

**Why different color scales for different ratings?**

Overall rating and energy use a green-to-indigo scale (higher is better). Difficulty uses an inverted green-to-red scale (higher = harder, not necessarily better). This prevents the visual confusion of "red = good" for difficulty while "red = bad" for overall quality.

---

## Component Hierarchy

The review feature introduces the following component structure (to be built by the UI engineer):

```
ReviewModal (bottom sheet / modal)
  ReviewStepIndicator (dot progress indicator showing 4 steps)
  Step 0: ReviewRatingStep
    StarRating (reusable 1-5 star input)
    DifficultyRating (1-5 labeled scale)
  Step 1: ReviewMoodStep
    MoodSelector (mood before)
    MoodSelector (mood after)
    EnergyRating (1-5 energy scale)
  Step 2: ReviewTagsStep
    TagChip (x12, multi-select toggle buttons)
  Step 3: ReviewReflectionStep
    TextArea (reflection)
    TextArea (highlights)
    TextArea (improvements)
  ReviewNavigation (Back / Next / Submit buttons)

ReviewSummaryCard (displayed in session detail pages)
  StarDisplay (read-only star visualization)
  MoodBadge (emoji + label)
  TagList (read-only tag chips)
  ReflectionText (collapsible reflection content)

ReviewStatsWidget (displayed on stats/home page)
  WeeklyRatingChart (bar or trend visualization)
  MoodTrendIndicator (mood improvement arrow)
  TopTagsList (most frequent tags this week)
```

### Component Descriptions

- **ReviewModal**: Full-screen bottom sheet that opens after workout completion. Manages step transitions with Framer Motion page animations. Uses `useReviewStore` for state and `useCreateReview` mutation for submission.

- **StarRating**: Reusable component rendering 5 tappable stars. Supports half-star display for averages (read-only mode) and full-star input (interactive mode). Uses `RATING_COLORS` from `reviewConfig.ts`.

- **MoodSelector**: Horizontal row of 5 mood options. Each option shows emoji + label with color-coded background. Selected state uses the mood's `bgColor` and `color` from `MOOD_OPTIONS`. Supports `mood_before` and `mood_after` contexts with different prompt text.

- **TagChip**: Individual toggle button for a performance tag. Shows Lucide icon + label. Unselected state is muted; selected state uses the tag's assigned `color`. Uses `toggleTag` from the review store.

- **ReviewStepIndicator**: Row of 4 dots (or segments) showing current step progress. Active step is highlighted; completed steps are filled. Matches the onboarding wizard's step indicator pattern.

- **ReviewNavigation**: Bottom-fixed bar with Back/Next/Submit buttons. "Next" advances to the next step; "Submit" appears on the final step and triggers the mutation. "Skip" is available on optional steps.

- **ReviewSummaryCard**: Read-only display of a review within session detail pages. Shows star rating, mood emojis, tag chips, and expandable reflection text. Uses `useSessionReview` or `useTemplateSessionReview` to fetch data.

- **ReviewStatsWidget**: Aggregated view of recent review data. Uses `useWeeklyReview` and `useReviewStats` hooks. Shows average rating, mood improvement trend, and most common tags.

---

## Data Model Explanations

### WorkoutReview (database row)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | UUID | No | Primary key, auto-generated |
| `user_id` | UUID | No | Owner, foreign key to `auth.users`, used by RLS |
| `session_id` | UUID | Yes | Link to weights session (polymorphic, exactly one of two) |
| `template_session_id` | UUID | Yes | Link to cardio/mobility session (polymorphic) |
| `overall_rating` | INTEGER (1-5) | No | Core metric, the only required review field |
| `difficulty_rating` | INTEGER (1-5) | Yes | How hard the workout felt (subjective RPE proxy) |
| `energy_level` | INTEGER (1-5) | Yes | Post-workout energy level |
| `mood_before` | TEXT (enum) | Yes | Mood state entering the session |
| `mood_after` | TEXT (enum) | Yes | Mood state after the session |
| `performance_tags` | JSONB | No (defaults to `[]`) | Array of string tags from predefined set |
| `reflection` | TEXT | Yes | General thoughts about the session |
| `highlights` | TEXT | Yes | What went well |
| `improvements` | TEXT | Yes | What to improve next time |
| `workout_duration_minutes` | INTEGER | Yes | Cached duration for aggregation |
| `created_at` | TIMESTAMPTZ | No | Auto-set on insert |
| `updated_at` | TIMESTAMPTZ | No | Auto-updated via trigger |

### ReviewDraft (Zustand store state)

The `ReviewDraft` interface in `reviewStore.ts` mirrors the review data but uses camelCase (JavaScript convention) and omits server-managed fields (`id`, `user_id`, `created_at`, `updated_at`). It also omits session references because those are set when the modal opens, not during the draft editing flow.

### Computed Types

- **WeeklyReviewSummary**: Aggregated stats for a 7-day window. Includes `averageRating`, `averageDifficulty`, `averageEnergy`, `moodImprovement` (delta), `topTags` (top 5 by frequency), and `ratingTrend` (daily rating values for charting).

- **ReviewStats**: Lifetime aggregated stats. Includes `totalReviews`, averages for all numeric fields, `moodDistribution` (count per mood value), and `topTags`.

Both computed types are derived client-side using TanStack Query's `select` transform, not via database views or stored procedures. This keeps the database simple and allows the frontend to recompute without additional API calls.

---

## Animation and Interaction Design

### Modal Entrance

The review modal should use a bottom-sheet slide-up animation consistent with other modals in the app. Framer Motion variants from `animationConfig.ts` should be reused where possible.

### Step Transitions

Horizontal slide transitions between steps (left-to-right for next, right-to-left for back) using Framer Motion's `AnimatePresence` with directional variants. This gives the multi-step flow a natural "page turning" feel.

### Star Rating Interaction

Stars should have a subtle scale-up animation on hover/tap and a color fill animation when selected. The rating label (e.g., "Great") should fade in/out as the rating changes.

### Mood Selection

Mood buttons should have a press/scale animation and a background color fade when selected. Only one mood can be active per context (before/after), so selecting a new one deselects the previous with a cross-fade.

### Tag Chips

Tags should have a spring-based toggle animation (scale + color transition) when selected/deselected. Selected tags might show a subtle pulse to reinforce the selection.

### Submit Celebration

On successful submission, a brief success animation (checkmark with confetti or a subtle pulse) should play before the modal closes. This rewards the user for completing the review.

---

## Integration Points with Existing Features

### Workout Completion Flow

The review modal is triggered when:
1. **Weights sessions**: After `workoutStore.completeWorkout()` saves the session
2. **Cardio sessions**: After the CardioWorkout page's timer completes and the session is saved
3. **Mobility sessions**: After the MobilityWorkout checklist is completed and saved

In each case, `reviewStore.openReview()` is called with the appropriate `sessionId` or `templateSessionId`, `sessionType`, and `durationMinutes`.

### Session Detail Pages

The `SessionDetail` page (weights) and `CardioSessionDetail` page should display the review if one exists, using `useSessionReview` or `useTemplateSessionReview`. The review data appears as a `ReviewSummaryCard` below the exercise/activity details.

### History Page

The History calendar and session list could optionally show review indicators (e.g., star rating badge) on sessions that have reviews. This provides a quick visual scan of training quality over time.

### Stats Dashboard

The home page stats section can include a `ReviewStatsWidget` showing:
- Average rating this week vs last week
- Mood improvement trend
- Most common tags this week

### TanStack Query Cache

Review queries use the `['review']` and `['reviews']` key prefixes. Mutations invalidate these keys broadly to ensure all review-related queries refetch. This follows the same invalidation pattern used by the workout session mutations.

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Review completion rate | >40% of completed sessions | `review_count / session_count` per user |
| Steps completed per review | Average >2 of 4 steps | Count non-null fields per review |
| Weekly active reviewers | >60% of weekly active users | Distinct users with reviews in last 7 days |
| Review edit rate | <10% (indicates first-pass quality) | Count of UPDATE operations vs INSERT |
| Mood improvement correlation | Positive trend over time | Average `mood_after - mood_before` score per user per month |
| Feature retention | Sustained usage after 4 weeks | Compare week-1 review rate vs week-4 review rate per cohort |

---

## Future Enhancements (Considered but Deferred)

### Photo Attachments
Allow users to attach a post-workout selfie or gym photo. Deferred because it requires Supabase Storage integration and significantly increases the review modal complexity.

### AI-Generated Insights
Use an LLM to analyze review patterns and suggest training adjustments ("You seem tired on Mondays - consider moving your heavy session to Tuesday"). Deferred to Phase 2 or 3 after AI integration is scoped.

### Social Review Sharing
Share your review as a card to the Community feed or social media. Deferred because the Community feature is in Phase 2.

### Review Streaks
Gamify review completion with a streak counter ("5 workouts reviewed in a row!"). Deferred because the gamification system is not yet designed.

### Structured RPE Integration
Replace the freeform difficulty rating with exercise-level RPE (Rate of Perceived Exertion) tracking per set. Deferred because it changes the active workout flow, not just the post-workout review.

### Review Templates
Save a review as a template to quickly apply to similar sessions. Deferred as premature optimization before user behavior data is collected.

### Aggregate Public Stats
Anonymous, aggregate review data across all users ("Average rating for Push Day: 3.8"). Deferred because it requires careful privacy design and backend aggregation pipelines.

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale | Date |
|---|----------|------------------------|-----------|------|
| 1 | Polymorphic session reference (two nullable FKs + CHECK) | Single FK to a unified session table; Intermediate `reviewable_sessions` bridge table | Avoids refactoring V1's dual-session-table architecture. CHECK constraint prevents invalid states. Additive-only migration. | Feb 11, 2026 |
| 2 | 4-step wizard with only step 0 required | Single-page form; 2-step (rating + everything else); 5+ steps | 4 steps balance detail vs friction. Each step has a clear focus. Optional steps preserve flexibility. | Feb 11, 2026 |
| 3 | 5-point rating scale | 10-point scale; Thumbs up/down; No rating (tags only) | 5-point has higher consistency. Labels make each point meaningful. Standard in fitness apps (Strong, Hevy). | Feb 11, 2026 |
| 4 | Discrete mood options (5 values) | Numeric mood scale (1-10); Emoji-only (no text); Free-text mood | Discrete options are fast to select and produce clean data. Text labels prevent ambiguity. | Feb 11, 2026 |
| 5 | Predefined performance tags (12) | Free-form tags; Category-based tags; No tags | Predefined tags ensure consistency for aggregation. 12 tags cover positive and negative without overwhelm. | Feb 11, 2026 |
| 6 | JSONB for tags instead of join table | `review_tags` junction table with FK to `tag_types` | Tags are always read/written as a set, never queried individually. JSONB avoids join overhead. Adequate for per-user volumes. | Feb 11, 2026 |
| 7 | Client-side aggregation via TanStack Query `select` | Database views; Stored procedures; Backend API endpoints | Keeps database simple. Frontend can recompute without API calls. Expected data volume (100s of reviews per user) is trivially fast client-side. | Feb 11, 2026 |
| 8 | Zustand store for draft state | React state (useState); URL params; localStorage | Multi-step wizard needs shared state across steps. Zustand matches existing pattern (onboarding wizard, workout store). Store is ephemeral (cleared on close). | Feb 11, 2026 |
| 9 | Mood emojis as visual indicators | Text-only labels; Custom icon set; Slider with emoji endpoints | Emojis are universally recognized, fast to scan, and match fitness app conventions. Mixed emoji+text provides accessibility. | Feb 11, 2026 |
| 10 | Cache `workout_duration_minutes` on review | Derive via join at query time; Store in a separate aggregation table | Avoids cross-table join for simple aggregation queries. Minor denormalization is acceptable for read-heavy, write-once data. | Feb 11, 2026 |
| 11 | Separate `highlights` and `improvements` fields | Single `notes` field; Structured `good`/`bad`/`next` fields | Two fields provide gentle structure without being prescriptive. Prompts "what went well" and "what to improve" encourage constructive reflection. | Feb 11, 2026 |
| 12 | `updated_at` trigger function | Application-level timestamp management; No updated_at tracking | Database trigger ensures `updated_at` is always correct regardless of which client or service performs the update. Matches V1 pattern. | Feb 11, 2026 |
