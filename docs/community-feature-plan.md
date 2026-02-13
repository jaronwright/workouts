# Community Feature — V1 Plan

> Multi-agent design process output. Review and approve before implementation begins.

---

## Table of Contents

1. [Phase 0: App Audit](#phase-0-app-audit)
2. [Phase 1: Discovery & Alignment](#phase-1-discovery--alignment)
3. [Phase 2: Feature Scoping](#phase-2-feature-scoping)
4. [Phase 3: The Plan](#phase-3-the-plan)
   - [V1 Feature Summary](#1-v1-feature-summary)
   - [What's Intentionally Excluded](#2-whats-intentionally-excluded-and-why)
   - [User Stories](#3-user-stories)
   - [The Workout Card Concept](#4-the-workout-card-concept)
   - [Data Model Overview](#5-data-model-overview)
   - [Screen Inventory](#6-screen-inventory)
   - [Key Design Decisions](#7-key-design-decisions)
   - [Risks & Mitigations](#8-risks--mitigations)
   - [Open Questions for the Founder](#9-open-questions-for-the-founder)

---

## Phase 0: App Audit

### PM (Jordan) — Setting the Stage

The app is a well-structured fitness PWA with a layered architecture (`Page -> Hook -> Service -> Supabase`), 8 Zustand stores, TanStack Query for server state, and a polished dark-theme UI with Framer Motion animations. The Community tab exists in the bottom nav but shows a "Coming Soon" placeholder. There's already a basic `socialService.ts` and `ActivityFeed` component, but they're minimal.

---

### Designer (Sage) — Design System Assessment

The app has a mature, consistent design system:

**Component Library:**
- `Card` (3 variants: default/elevated/outlined), `Button` (5 variants), `Modal`, `BottomSheet`, `Badge`, `Toast`, `AnimatedCard`, `Avatar`, `Input`
- Dark theme via CSS custom properties
- Frosted-glass effects
- Spring animations everywhere (stiffness: 300, damping: 30 default)

**Patterns to Follow:**
- Cards use `radius-xl` (24px), `position: relative` for gradient overlays
- Interactive elements use `active:scale-0.98` press feedback
- Stagger entrance: `i * 0.06s` delay per card
- Section headers: `text-xs font-medium uppercase tracking-wider text-text-muted`
- Gradient icon circles: `w-10 h-10 rounded-full` with `bg-{color}/20` and colored icon
- Bottom nav: Material 3 animated pill, `min-w-14 px-2`, `text-[10px]` labels
- Workout type color signatures: weights = indigo `#6366F1`, cardio = teal `#14B8A6`, mobility = emerald `#10B981`

**Tone in Copy:** Warm, personal, encouraging. "Age well, my friends." Not corporate.

**Gap:** No social-specific components exist yet — no reaction buttons, comment UI, follow states, or user discovery patterns. The `ActivityFeed` is a bare-bones list with no expandability.

---

### UXR (Riley) — User Experience Assessment

**What exists:** The app already captures *rich* post-workout data via the review system — mood before/after (5 emojis), 12 performance tags with icons/colors, 1-5 star ratings, difficulty, energy level, and free-text reflection. This is gold for a social feed.

**User context:** The user base is "friends of the founder." This is critical — these aren't strangers. They already have social bonds. The Community feature doesn't need to *create* relationships; it needs to *leverage* existing ones.

**Data surfaceable today:** Completed workouts (with `is_public` toggle already on both session tables), workout names, duration, exercise sets (reps x weight), reviews with mood/tags/ratings, personal records, streaks, weekly counts.

**Gap:** The `socialService.getSocialFeed()` currently does NOT join `user_profiles` — there's a comment saying "removed user_profile join - no FK relationship." So the feed can't even show *who* did a workout. That's the first fix needed. Also: no follow system, no reactions, no comments, no notification infrastructure for social events.

---

### Backend (Dev) — Technical State

**What exists:**
- Two session tables: `workout_sessions` (weights) and `template_workout_sessions` (cardio/mobility) — both have `is_public BOOLEAN DEFAULT true`
- `workout_reviews` with polymorphic FK pattern (exactly one of `session_id` or `template_session_id` must be set)
- `personal_records` table with `(user_id, plan_exercise_id)` unique constraint
- `user_profiles` with `display_name`, `avatar_url`, `selected_plan_id`
- RLS everywhere — users can only read/write their own data
- `socialService` queries both session tables and merges results client-side

**Architecture concern:** The social feed currently does a dual-query (one per session table) and merges client-side. This works for small scale but means we can't do server-side pagination cleanly. For v1 with <50 users, this is fine.

**Critical gap:** No `user_follows` table, no `activity_reactions` table, no way to fetch *other users'* profiles (RLS currently blocks cross-user profile reads). We need new RLS policies that allow reading public profile data of other users.

**Schema advantage:** The `exercise_sets` table has everything needed to compute per-workout summaries (total volume = sum of reps x weight, exercise count, max weight). The `workout_reviews` table gives us mood, tags, ratings. This data is already there — we just need to surface it.

---

### Frontend (Alex) — Client-Side Assessment

**What exists:**
- `useSocialFeed(limit)` hook wrapping the service with TanStack Query (2-min stale time)
- `useToggleWorkoutPublic()` mutation that invalidates feed + session queries
- `ActivityFeed` component rendering basic cards: colored icon pill, user name (broken — always "Anonymous"), workout name, relative time
- `Community.tsx` page is a placeholder with "Coming Soon" messaging

**Patterns to follow:**
- TanStack Query for all server data (matching existing hooks pattern)
- Zustand only for ephemeral client state (not social data)
- `AnimatedCard` with stagger for feed items
- `BottomSheet` for expandable workout details (already used for calendar day details)
- `workoutConfig` helpers for consistent workout type styling

**Gaps:** No infinite scroll pattern exists yet (all lists are fully loaded). No pull-to-refresh. No optimistic updates for reactions. No user search/discovery UI. The `ActivityFeed` component is too simple to evolve — we'll likely want to build a new `WorkoutCard` component from scratch.

---

### Fitness (Coach) — Workout Data Assessment

**What's captured per weights session:** Exercise names, sets x reps x weight, section groupings (warmup/main/accessories), notes, duration (start -> complete timestamps), and optionally: overall rating, difficulty, energy, mood change, performance tags, reflection text.

**What's captured per cardio/mobility:** Template name + category, duration minutes, distance + unit (for running/cycling), pace, notes, and the same review data.

**What's meaningful to share socially:**
- Workout *completion* (consistency > performance)
- Mood transformation (tired -> great is a great story)
- Performance tags like "Felt Strong", "New PR", "Breakthrough"
- Personal records (celebration-worthy)
- Workout type variety (weights + cardio + mobility = well-rounded)

**What to be careful about:**
- Raw weights can trigger unhealthy comparison. A beginner's 95lb squat is just as valid as an advanced 405lb squat.
- Showing exact reps/weight should be *opt-in* or *drill-down only*, not front-and-center
- Mobility and cardio sessions shouldn't feel "lesser" than heavy lifting days

---

### Social (Dr. Mara) — Behavioral Assessment

**Positive signals:**
- `is_public` defaults to `true` — good default for a friends-only app. Opt-out is easier than opt-in for building feed volume.
- The review system captures *subjective* experience (mood, energy, reflection), not just *objective* metrics. This enables empathy-based social interaction ("I see you felt tired but still showed up").
- The performance tags are *effort-oriented*, not just *outcome-oriented* — "Felt Strong", "Good Form", "Breakthrough" celebrate process, not just numbers.

**Risks to watch:**
- Social comparison theory is real. Showing leaderboards or volume comparisons can demotivate lower-performing users.
- The user base is tiny (friends). Social features need to work with 5-10 active users, not feel empty.
- Asymmetric engagement: if only 2 of 8 friends post, the feed feels dead. We need the feed to *auto-populate* from workout completions (already `is_public: true` by default).

**Key principle:** For a friends-only app, the default should be *ambient awareness* ("I can see my friends are working out") with optional *active engagement* (reactions, comments). Don't require active sharing — the workout completion itself *is* the share.

---

### PM (Jordan) — Audit Synthesis

| Dimension | Current State |
|-----------|--------------|
| **Data richness** | Excellent — sets, reps, weight, duration, mood, tags, ratings, PRs all exist |
| **Social infrastructure** | Minimal — basic feed query, no follows/reactions/comments |
| **UI foundation** | Strong — mature component library, consistent design language |
| **User base** | ~5-10 friends of the founder, all know each other |
| **Default visibility** | `is_public: true` on both session tables — workouts auto-share |
| **Key blocker** | Can't show *who* did a workout (user_profiles RLS blocks cross-user reads) |
| **Biggest opportunity** | The review data (mood, tags, reflection) makes workouts *stories*, not just stats |

---

## Phase 1: Discovery & Alignment

### Key Questions by Agent

**PM (Jordan):**
1. Do we need a follow system for v1, or is "everyone sees everyone" sufficient for a 5-10 person friend group?
2. What's the minimum social interaction that creates a feedback loop (someone works out -> someone acknowledges it -> first person feels motivated)?
3. Should the workout card show exercise-level detail by default, or keep it summary-only with expand?

**Designer (Sage):**
1. How much detail should a workout card show in collapsed vs expanded state? Multi-exercise workouts could easily overwhelm a card.
2. Should reactions be emoji-based (like Strava's kudos) or richer (like specific encouragements)?
3. How do we handle the "empty feed" state gracefully when only 1-2 people have worked out recently?

**UXR (Riley):**
1. What's the social dynamic among these specific friends? Are they competitive? Supportive? Mixed fitness levels?
2. Is there anxiety about sharing workout data? Even among friends, some people feel vulnerable about their fitness level.
3. What happens when someone stops working out for a week? Does the feed make them feel guilty or welcomed back?

**Backend (Dev):**
1. Do we build a follow system now (flexible, future-proof) or hardcode "everyone sees everyone" (fast, simple)?
2. How do we efficiently aggregate workout data for the feed without N+1 queries per card?
3. Should reactions be real-time (Supabase Realtime) or poll-based for v1?

**Frontend (Alex):**
1. How do we render a variable-length workout (1-10 exercises) in a card without layout jank?
2. Should the feed be infinite-scroll or paginated? (For 5-10 users, probably neither — just load all)
3. Do we need offline support for the feed, or is it online-only?

**Fitness (Coach):**
1. How do we celebrate effort and consistency, not just heavy weights? A beginner doing their first 3 workouts this week deserves recognition.
2. Should we surface *streaks* and *weekly counts* in the feed, or keep those private?
3. How do we handle mixed fitness levels — someone squatting 135 shouldn't feel bad next to someone squatting 405.

**Social (Dr. Mara):**
1. What's the minimum viable social loop? Argument: workout completion -> ambient visibility -> lightweight reaction -> dopamine -> repeat.
2. How do we prevent the "empty feed" problem from killing engagement before it starts?
3. Should reactions be anonymous or attributed? (Anonymous reduces social pressure but also reduces connection.)

---

### Assumptions That Could Be Wrong

- That users *want* to see each other's workouts (they might find it creepy or pressuring)
- That the review data (mood/tags) will actually be filled out by most users
- That 5-10 users generate enough activity for a feed to feel alive
- That "public by default" is the right choice — some users may not realize their workouts are being shared
- That friends want to see *every* workout, not just highlights
- That lightweight reactions (kudos/cheers) are sufficient — users might want to say something specific
- That showing any weight numbers is safe (even in expanded view, it can trigger comparison)
- That all workout types feel equally valued (a 15-min mobility session next to a 90-min leg day)

---

### The Workout Card Challenge

A single weights workout might contain:
```
Push Day — 62 min
  Barbell Bench Press: 4x8 @ 185 lbs
  Incline DB Press: 3x10 @ 60 lbs
  Cable Flyes: 3x12 @ 30 lbs
  Tricep Pushdowns: 4x15 @ 40 lbs
  Overhead Tricep Extension: 3x12 @ 25 lbs
Review: 4 stars, "Felt Strong" "Good Form" | Mood: tired -> great
```

Meanwhile, a cardio session might be:
```
Running — 32 min, 3.2 mi
Review: 3 stars, "Tired" | Mood: neutral -> good
```

And a mobility session:
```
Hip/Knee/Ankle Flow — 20 min
Review: 5 stars | Mood: good -> great
```

**Team consensus on approach:** A two-layer card system.

**Collapsed state (default — glanceable):**
- User avatar + name + relative time
- Workout type color accent (left border or icon)
- Workout name + duration in a single line
- 1-2 highlight "pills": mood transformation emoji pair, top performance tag, or PR badge
- Single summary stat: "5 exercises, 62 min" (weights), "3.2 mi, 32 min" (cardio), "20 min" (mobility)

**Expanded state (tap to reveal):**
- Full exercise list with sets/reps/weight (weights only, capped at 5)
- Distance + pace details (cardio)
- Full review: star rating, mood before -> after, all tags, reflection text
- Reaction bar at the bottom

**Key principle (Coach + Dr. Mara):** Collapsed cards emphasize *effort signals* (mood transformation, tags like "Felt Strong"), not *performance data* (weight numbers). Performance data lives in the expanded view for people who want it.

---

## Phase 2: Feature Scoping

### PM (Jordan) — Proposed V1 Scope

Guiding principle: **build the smallest social loop that creates real engagement for 5-10 friends.**

1. **Activity Feed** — A scrolling feed of friends' completed workouts (everyone sees everyone, auto-populated)
2. **Workout Card** — Collapsed/expanded states with the two-layer design described above
3. **Reactions** — 4 types (fire, strong, props, impressive), one per person per workout, shows *who* reacted
4. **Public Profiles** — Tap a name to see their profile, stats, recent activity
5. **Privacy Controls** — First-time explainer + per-workout toggle in completion flow
6. **Streak Badges** — Subtle consistency celebration on cards (3+ day streaks)
7. **Empty State** — Warm, encouraging design for when the feed has no activity

### Team Reactions

**UXR (Riley):**
- Serves the core need of "I want to know my friends are working out too" (ambient awareness) and "I want to encourage them" (reactions).
- Concern: The privacy toggle is critical. Recommends a *first-time notification* when a user completes their first workout after the Community feature launches: "Your workouts are now visible to friends in the Community tab. You can change this anytime."
- Missing: An "empty feed" strategy. What does a new user see on day 1?

**Social (Dr. Mara):**
- Positive: Auto-populated feed (no friction to "post") + lightweight reactions = low-effort social loop. Exactly the "ambient awareness + optional engagement" pattern that works for small groups.
- Risk: Reactions could become *obligatory*. If Jordan always reacts but nobody reacts to Jordan, that's socially painful.
- Recommendation: Don't show reaction *counts* prominently. Show *who* reacted (avatar stack), not how many. Keeps it personal, not performative.

**Fitness (Coach):**
- Card format treats weights, cardio, and mobility as equally valid with distinct colors and appropriate summary stats.
- Concern on expanded weights view: Showing "Bench Press 4x8 @ 185" is fine *if* the user chose to share. Frame it as workout detail, not comparison.
- Suggestion: Add a consistency highlight — when someone works out 3+ days in a row, show a small streak badge. Celebrates *showing up*, not performance.

**Designer (Sage):**
- Everything maps to existing patterns — `AnimatedCard` for feed items, `BottomSheet` for overflow details, `Badge` for tags, `Avatar` for identity.
- UX concern: Expanded weights card with 8+ exercises could get very long. Cap at ~5 exercises with "View full workout" link.

**Backend (Dev):**
- Feasible. Core additions: `activity_reactions` table, new RLS policy on `user_profiles`, enhanced feed query, public profile endpoint.
- The dual-table architecture means reactions also need the polymorphic FK pattern. Slightly annoying but consistent with the review system.
- Timeline: 1-2 weeks of focused work.

**Frontend (Alex):**
- Moderate complexity. Workout card is the hardest component — variable content, expand/collapse animation, reaction bar.
- For <50 users, load all items at once. No infinite scroll needed in v1.
- Optimistic updates for reactions via TanStack Query's `onMutate`.
- New components needed: `WorkoutCard`, `WorkoutCardExpanded`, `ReactionBar`, `PublicProfile`.

---

## Phase 3: The Plan

---

### 1. V1 Feature Summary

- **Activity Feed:** Scrolling feed of all users' completed public workouts, sorted newest-first. No follow system — everyone sees everyone (appropriate for ~5-10 friends).

- **Workout Card (collapsed):** Avatar + name, workout type color accent, workout name + duration, mood emoji pair (if reviewed), top performance tag pill, summary stat ("5 exercises, 62 min" / "3.2 mi, 32 min" / "20 min"), streak badge (3+ days).

- **Workout Card (expanded):** Tap to expand inline. Full exercise list with sets/reps/weight (weights, capped at 5 with "View full workout" overflow), distance + pace (cardio), full review display (stars, mood before -> after, all tags, reflection snippet), reaction bar.

- **Reactions:** 4 reaction types — Fire, Strong, Props, Impressive. One per user per workout (tap to toggle, tap different to change). Shown as avatar stack of who reacted, not a count.

- **Public Profile Page:** Tap any user's name/avatar to see their display name, avatar, current workout plan, streak, this-week count, total workouts, and last 5 public workouts. Read-only.

- **Privacy Controls:** First-time explainer modal when Community feature launches ("Your workouts are visible to friends — you can change this anytime"). Per-workout `is_public` toggle surfaced in the workout completion flow.

- **Empty & Loading States:** Skeleton loading cards while feed loads. Warm empty state with illustration/messaging when no workouts exist yet.

---

### 2. What's Intentionally Excluded (and Why)

| Feature | Reason for Deferral |
|---------|-------------------|
| **Follow system** | Unnecessary for 5-10 friends. Adds complexity. Revisit when user base grows. |
| **Comments** | Requires moderation considerations. Reactions are sufficient for v1 encouragement. |
| **Leaderboards / competitions** | High risk of toxic comparison and demotivation. Need to observe social dynamics first. |
| **Push notifications for social events** | Infrastructure exists (`push_subscriptions` table) but not wired. Defer to v2 to avoid notification fatigue. |
| **Shareable workout images** | "Share to Instagram" cards are a v2 polish feature. |
| **Groups / challenges** | Significant infrastructure. Defer until we know what kind of social interaction users actually want. |
| **Real-time feed updates** | Supabase Realtime could power live feed, but poll-on-focus is simpler and sufficient for v1. |

---

### 3. User Stories

1. **As a user**, when I open the Community tab, I see a feed of my friends' recent workouts so I know who's been active and feel motivated to work out too.

2. **As a user**, when I see a friend's workout in the feed, I can tap a reaction (fire, strong, props, impressive) to cheer them on, and they'll see my avatar on their workout card.

3. **As a user**, I can tap on a friend's workout card to expand it and see their full exercise list, review mood/tags, and reflection — so I can appreciate the detail of their session.

4. **As a user**, I can tap on a friend's name to see their profile (avatar, plan, stats, recent workouts) — so I feel connected to their fitness journey.

5. **As a user**, when I complete a workout, I see a clear indication that it will be shared to the Community, with an easy toggle to keep it private if I prefer.

---

### 4. The Workout Card Concept

#### Collapsed State (Default — Glanceable)

```
+---------------------------------------------+
| [AV]  Jordan              2h ago            |
|       Push Day - 62 min                     |
|       tired->great  [Felt Strong]  3d streak|
|       5 exercises - 14,820 lbs volume       |
+---------------------------------------------+
```

- **Left:** Workout-type colored icon circle (indigo for weights, teal for cardio, emerald for mobility)
- **Top line:** User name (semi-bold) + relative time (muted)
- **Middle line:** Workout name + duration
- **Bottom line:** Mood emoji pair (if reviewed) + top performance tag pill + streak badge (if 3+)
- **Summary stat:** Exercise count + total volume (weights), distance + duration (cardio), duration (mobility)

#### Collapsed Cardio Variant

```
+---------------------------------------------+
| [AV]  Alex                45m ago           |
|       Running - 32 min                      |
|       neutral->good  [Tired]                |
|       3.2 mi - 10:00/mi pace               |
+---------------------------------------------+
```

#### Collapsed Mobility Variant

```
+---------------------------------------------+
| [AV]  Riley               1d ago            |
|       Hip/Knee/Ankle Flow - 20 min          |
|       good->great  [Good Form]              |
+---------------------------------------------+
```

#### Expanded State (Tap to Reveal)

Smoothly animates open below the collapsed content:

```
+---------------------------------------------+
|  [Collapsed content as above]               |
|---------------------------------------------|
|  4 stars Great - Difficulty: Challenging     |
|  Energy: High - Mood: tired -> great        |
|                                             |
|  Exercises:                                 |
|  * Bench Press      4x8 @ 185 lbs          |
|  * Incline DB Press 3x10 @ 60 lbs          |
|  * Cable Flyes      3x12 @ 30 lbs          |
|  * Tricep Pushdowns 4x15 @ 40 lbs          |
|  + 1 more exercise...                       |
|                                             |
|  Tags: [Felt Strong] [Good Form] [Pumped]   |
|                                             |
|  "Great session today, energy came back     |
|   after warmup sets..."                     |
|                                             |
|  [fire] [strong] [props] [star]  Sage, Dev  |
+---------------------------------------------+
```

#### Edge Cases

| Scenario | Handling |
|----------|---------|
| 1 exercise only | Show inline, no "more" link |
| 10+ exercises | Show first 5, "+ N more" links to full detail |
| No review submitted | Skip the review section entirely, card is shorter |
| Cardio expanded | Show distance, duration, pace — no exercise list |
| Mobility expanded | Show duration only — clean and simple |
| No mood data | Skip mood pill in collapsed, skip mood line in expanded |
| Very long reflection | Truncate at ~120 chars with "read more" in expanded |

---

### 5. Data Model Overview

#### New Tables

**`activity_reactions`**

```sql
CREATE TABLE activity_reactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_id            UUID REFERENCES workout_sessions ON DELETE CASCADE,
  template_session_id   UUID REFERENCES template_workout_sessions ON DELETE CASCADE,
  reaction_type         TEXT NOT NULL CHECK (reaction_type IN ('fire', 'strong', 'props', 'impressive')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One reaction per user per workout
  UNIQUE(user_id, session_id),
  UNIQUE(user_id, template_session_id),

  -- Polymorphic FK: exactly one must be set
  CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL)
  )
);
```

#### Modified Tables / Policies

**`user_profiles`** — New RLS policy allowing cross-user profile reads:

```sql
-- Allow all authenticated users to read profiles
-- (Currently users can only read their own profile)
CREATE POLICY "Users can view public profile fields"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);
```

#### Connection to Existing Data

```
user_profiles <-- user_id --> workout_sessions --> exercise_sets
                  user_id --> template_workout_sessions
                  user_id --> workout_reviews (via session_id or template_session_id)
                  user_id --> personal_records
                  user_id --> activity_reactions (NEW)
```

The feed query joins: sessions + user_profiles + workout_reviews + activity_reactions. Exercise sets are fetched on-demand when a card is expanded.

---

### 6. Screen Inventory

| Screen | Description |
|--------|------------|
| **Community Feed** | Main tab view. Scrolling list of workout cards. Pull-down to refresh. |
| **Workout Card (collapsed)** | Inline component in feed. Summary view with avatar, name, workout info, mood, tags. |
| **Workout Card (expanded)** | Inline expansion with review, exercises, reactions. |
| **Public Profile** | Full-screen page (push navigation). User stats + recent workouts. |
| **Privacy Explainer** | One-time modal on first visit to Community tab. |
| **Empty Feed State** | Shown when no public workouts exist. Encouraging message. |
| **Loading State** | Skeleton cards (3) while feed loads. |

---

### 7. Key Design Decisions

1. **No follow system** — everyone sees everyone. Simplest possible social graph for a friend group. Avoids the "request/accept" friction and the risk of someone feeling excluded.

2. **Effort over performance** — collapsed cards highlight mood transformation and tags, not weight numbers. Weight data is available in expanded view for those who want it, but isn't the headline.

3. **Reactions over comments** — 4 positive-only reactions keep the social loop lightweight and unambiguously supportive. No opportunity for negative or ambiguous feedback.

4. **Avatar stack, not counts** — "Sage and Dev reacted" feels personal. "2 reactions" feels metrics-driven. For a small friend group, names matter more than numbers.

5. **Auto-share by default** — workouts are public by default (`is_public: true`, already exists). The Community feed auto-populates without requiring users to actively "post." This prevents the empty-feed problem and reduces friction.

6. **Capped exercise display** — max 5 exercises shown inline in expanded state. Prevents extremely long cards from dominating the feed. "View full workout" navigates to the full session detail page (already exists in History).

---

### 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Feed feels empty** with only 5-10 users | High | High (kills engagement) | Auto-share default, warm empty state, encourage founder to seed activity early |
| **Social comparison** causes someone to feel bad | Medium | High (could lose a user) | Effort-first card design, no leaderboards, positive-only reactions, weight data tucked in expanded view |
| **Privacy surprise** — users don't realize workouts are shared | Medium | Medium | First-time explainer modal, visible toggle in completion flow, `is_public` was already defaulting to true |

---

### 9. Open Questions for the Founder

1. **User profile reads:** Currently, RLS blocks users from reading other users' profiles. We need to open this up for authenticated users. Are you comfortable with all profile fields (display_name, avatar_url, selected_plan_id, gender) being readable by all authenticated users, or should we restrict to just display_name + avatar_url?

2. **Reaction notifications:** For v1, should we show reactions only when the user visits the Community tab, or do you want an in-app notification (toast/badge) when someone reacts to your workout? (Not push notifications — just in-app awareness.)

3. **"View full workout" navigation:** When a user taps "View full workout" on someone else's expanded card, should we build a new read-only session detail page, or reuse the existing History session detail page with a "read-only" mode?

4. **Seeding the feed:** Would you be willing to actively use the app and encourage friends to do so during the first week of launch? The biggest risk is an empty feed. Alternatively, we could show the founder's own recent workouts in the feed alongside others to guarantee some content.

---

> **Does this plan look good? Any changes before we start building?**
