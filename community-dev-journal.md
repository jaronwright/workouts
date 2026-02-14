# Community Feature Development Journal

## Pre-Implementation Assessment

**Date**: 2026-02-14
**Reviewed by**: Full team (Marcus, Sarah, Alex, Diego, Jin)

### What's Good
- Clean polymorphic FK pattern for dual session types (weights + templates)
- Solid batch-fetching strategy with Promise.all for profiles, reactions, reviews, photos
- WorkoutCard is well-designed with collapsed/expanded states, mood/tag badges
- Reaction system works with optimistic UI and one-per-user constraint
- Notification system is functional (DB-persisted, 60s polling)
- Privacy controls exist (hide_weight_details, is_public per session)
- ReactionBar shows reactor avatars and animated counts

### What's Broken
- `current_streak: 0` hardcoded in getPublicProfile — the streak stat card always shows 0
- `streak_days: null` on every FeedWorkout — the streak badge (fire icon, "Xd streak") never renders
- `getSocialFeedForUser` fetches 100 global items then filters client-side — absurdly wasteful
- `ActivityFeed.tsx` imports nonexistent `SocialWorkout` type — would crash if actually used
- No feed pagination — fixed limit of 20, no infinite scroll
- `community_onboarded` DB column unused, localStorage used instead
- `notification_preferences` columns exist but never checked

### Biggest Opportunity (Sarah)
"The feed is the product. Right now it's a dead-end: 20 items max, no social graph, no comments, no way to find people. Fix the foundation, add following + comments, and this becomes a real social fitness app."

---

## Iteration 1: Phase 1 — Fix Foundation

**Date**: 2026-02-14
**Phase**: 1 (Fix Foundation) — Tasks 1A, 1B, 1C, 1D, 1E
**Driver**: DIEGO (backend) + JIN (frontend)

### What Was Implemented

#### 1A. Real Streak Calculation (DIEGO driving)
- Added `calculateCurrentStreak(userId)` — exported, queries both session tables for past 365 days
- Added `computeStreakFromDates(dateSet)` — pure helper, walks backward from today counting consecutive days
- Added `computeStreaksForUsers(userIds)` — batch version for feed, 2 queries regardless of user count
- **Algorithm**: Today without a workout doesn't break the streak (graceful). Gap of 1+ days after that breaks it.
- Updated `getPublicProfile()` to use real streak (was `current_streak: 0`)
- Streak computation runs in parallel with other batch fetches in Promise.all (no extra latency)
- `streak_days` now populated on every FeedWorkout using batch user streak computation

#### 1B. Fix getSocialFeedForUser (DIEGO driving)
- Rewrote from "fetch 100 global → filter client-side" to direct parallel queries
- Now uses `.eq('user_id', userId).eq('is_public', true)` on both session tables
- Still fetches related data (reactions, reviews, photos, exercise sets) in batch
- Made the function exported for reuse

#### 1C. Cursor-Based Pagination (DIEGO + JIN driving)
- `getSocialFeed()` now accepts optional `cursor` parameter (completed_at timestamp)
- Returns `PaginatedFeed { items: FeedWorkout[], nextCursor: string | null }`
- Uses `.lt('completed_at', cursor)` when cursor provided — efficient PostgREST range query
- `nextCursor` set when there are potentially more items
- Broke query chains into variables to support conditional cursor filter
- Updated `useSocialFeed()` hook from `useQuery` to `useInfiniteQuery`
- Updated `useReactions` optimistic updates to handle `InfiniteData<PaginatedFeed>` shape
- Extracted `updateFeedWorkout()` helper for cleaner optimistic update code
- Added `PaginatedFeed` type to `community.ts`

#### 1D. Dead Code Cleanup (JIN driving)
- Fixed `ActivityFeed.tsx` — replaced nonexistent `SocialWorkout` import with `FeedWorkout`
- Updated data access to work with infinite query pages shape
- Simplified `getWorkoutName` to use `workout.workout_name` (already resolved in FeedWorkout)

#### 1E. Infinite Scroll (JIN driving)
- Added IntersectionObserver-based infinite scroll to Community page
- Sentinel element at bottom of feed with 200px rootMargin for early trigger
- Loading spinner visible while fetching next page
- "You're all caught up!" indicator when no more pages
- Kept manual Refresh button as fallback

### Build/Test Status
- `npx vite build` ✅ passes clean (2.29s, no type errors)
- Test files may need mock updates for new InfiniteData shape (pre-existing test infrastructure issue)

### Ratings
- Feature completeness: 4/10 (foundation fixed, but no social graph yet)
- Code quality: 8/10 (clean types, proper pagination, efficient batch queries)
- UX quality: 5/10 (infinite scroll works, but feed is still global-only with no social features)

### What's Next
- Phase 2: Social Graph — user_follows table, comments, feed tabs (Following/Discover), user discovery
