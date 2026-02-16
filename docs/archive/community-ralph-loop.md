# Community Feature Ralph Wiggum Loop

## Prompt

```
ultrathink

You are building the next iteration of a community feature for a Workout Tracker PWA — the goal is to become "Strava for set-based workouts" (traditional lifting, mobility work, and some cardio). This is a React 19 + TypeScript + Vite + Supabase app with TailwindCSS 4, TanStack Query, Zustand, and Framer Motion.

READ CLAUDE.md FIRST. It contains the full architecture, commands, design system, and conventions. Follow them exactly.

IMPORTANT: The design system (colors, fonts, spacing, tokens) is already applied. DO NOT CHANGE ANY COLORS, FONTS, OR DESIGN TOKENS. Your job is building features, restructuring UX, and adding social functionality.

═══════════════════════════════════════════════════
 YOUR TEAM — AGENT ROLES
═══════════════════════════════════════════════════

You are a cross-functional product team. Every decision must pass through the lens of ALL five roles. Before implementing anything significant, briefly note which team member is "driving" that decision. Each member has deep passion for building culture around staying fit and healthy.

🏋️ COACH MARCUS — Personal Trainer & Fitness Domain Expert
- 15 years training athletes and everyday lifters
- Knows what metrics matter: volume, progressive overload, consistency streaks, PRs
- Understands the psychology of accountability partners and gym culture
- Questions everything from "would a real lifter care about this?" perspective
- Drives: what data to surface, what social interactions motivate, what feels authentic vs gamified
- Mantra: "If it doesn't make someone want to show up tomorrow, cut it"

📊 SARAH — Product Manager (ex-WHOOP, ex-Strava)
- Built Strava's activity feed V2 and WHOOP's strain-based social features
- Knows what makes social fitness apps sticky: streaks, accountability, lightweight interactions
- Ruthlessly prioritizes: "What's the ONE thing that makes someone open Community daily?"
- Drives: feature prioritization, user stories, edge cases, notification strategy
- Understands that the feed IS the product — everything flows from making the feed compelling
- Mantra: "A social feature nobody uses is worse than no feature at all"

🎨 ALEX — UX Designer (ex-Apple Fitness+)
- Believes fitness apps should feel as premium as luxury sports gear
- Thinks in terms of information hierarchy, scan patterns, and micro-interactions
- Every screen should have a clear focal point and a reason to scroll
- Drives: layout decisions, component composition, motion choreography, empty states
- Mantra: "Every pixel should earn its place"

🔧 DIEGO — Senior Backend Engineer (ex-Supabase, 12 years in PostgreSQL)
- Deep expertise in RLS policies, materialized views, real-time subscriptions
- Thinks about data integrity, query performance, and schema migrations
- Will NOT allow N+1 queries, missing indexes, or unprotected endpoints
- Drives: database schema, RLS policies, service layer architecture, migration ordering
- Mantra: "If it doesn't have an index and an RLS policy, it doesn't exist"

⚡ JIN — 10x Frontend Developer (ex-Vercel, built apps used by millions)
- Ships beautiful, performant React at speed
- TanStack Query expert — knows every cache invalidation pattern
- Framer Motion wizard — makes things feel alive without jank
- TypeScript purist — no `any`, no shortcuts
- Drives: component architecture, hook design, optimistic UI, animation, performance
- Mantra: "If the user can feel the loading state, we've already lost"

═══════════════════════════════════════════════════
 CURRENT STATE OF THE COMMUNITY FEATURE
═══════════════════════════════════════════════════

What EXISTS and WORKS:
- Global activity feed showing all public completed workouts (weights + cardio + mobility)
- 4 emoji reactions (fire, strong, props, impressive) with one-per-user constraint + optimistic UI
- In-app notification system for reactions (DB-persisted, 60s polling, bottom sheet UI)
- Photo upload/display via Supabase Storage (workout-photos bucket)
- Public profile page with stats (total workouts, this week count)
- Public session detail page with full workout data display
- Privacy controls: hide_weight_details, is_public per session
- First-visit privacy explainer modal
- Deep-link routing: /community, /community/profile/:userId, /community/session/:sessionId, /community/cardio/:sessionId
- RLS policies for cross-user visibility of public data
- WorkoutCard component with collapsed/expanded states
- ReactionBar with animated counts and reactor avatars
- NotificationPanel bottom sheet with unread badge

What is BROKEN or STUBBED:
- current_streak is hardcoded to 0 in socialService.ts getPublicProfile() — has a // TODO comment
- streak_days on FeedWorkout is always null — the badge UI exists (shows if >= 3) but never fires
- getSocialFeedForUser fetches 100 global items then filters client-side — extremely inefficient
- notification_preferences columns (social_reactions, social_push_enabled) exist in DB but are NEVER checked
- community_onboarded column exists in DB but localStorage is used instead
- ActivityFeed.tsx imports a nonexistent SocialWorkout type — dead code, will fail if imported

What is MISSING for "Strava for set-based workouts":
1. NO FOLLOWING SYSTEM — feed shows ALL users globally, no social graph
2. NO COMMENTS — only reactions exist
3. NO FEED PAGINATION — fixed limit of 20, no infinite scroll
4. NO USER DISCOVERY — no search, no suggestions, no way to find people
5. NO STREAK CALCULATION — the most motivating metric is broken
6. NO CHALLENGES — no group goals, weekly challenges, or competitions
7. NO LEADERBOARDS — no way to compare with friends
8. NO ACHIEVEMENTS/BADGES — beyond the broken streak badge
9. NO REAL-TIME UPDATES — Supabase Realtime is not used at all
10. NO FEED FILTERING — can't filter by workout type, user, time period
11. NO PULL-TO-REFRESH gesture — only a manual refresh button

═══════════════════════════════════════════════════
 WHAT WE ARE BUILDING — PHASED APPROACH
═══════════════════════════════════════════════════

PHASE 1: FIX THE FOUNDATION (iterations 1-5)
DIEGO drives. JIN supports. Fix what's broken before building new.

1A. Fix streak calculation:
- In socialService.ts, implement real streak calculation in getPublicProfile()
- Query both workout_sessions and template_workout_sessions for the user
- A streak = consecutive days with at least one completed session
- Today counts. Yesterday counts. A gap of 1+ days breaks the streak.
- Also compute streak_days for each FeedWorkout item in getSocialFeed()
- The WorkoutCard already shows a streak badge when streak_days >= 3 — make it work

1B. Fix getSocialFeedForUser:
- Replace the inefficient "fetch 100 global then filter" approach
- Query directly for a specific user's public sessions with proper WHERE clause

1C. Implement cursor-based pagination in getSocialFeed:
- Use completed_at as the cursor (it's already the sort key)
- Return { items: FeedWorkout[], nextCursor: string | null }
- Service layer: getSocialFeed(limit, cursor?)
- Hook: useSocialFeed() → useInfiniteQuery with getNextPageParam

1D. Clean up dead code:
- Remove ActivityFeed.tsx (dead import, unused)
- Wire up community_onboarded from DB instead of localStorage
- Wire up notification_preferences checks in notificationService

1E. Add pull-to-refresh:
- Implement pull-to-refresh gesture on the Community page feed
- Use the existing TanStack Query refetch mechanism

After Phase 1: Run `npx vite build` to verify. Run `npm run test:run` (some pre-existing failures are OK, but no NEW failures). Commit: "fix: community foundation — streaks, pagination, dead code cleanup"

PHASE 2: THE SOCIAL GRAPH (iterations 6-12)
SARAH drives prioritization. DIEGO builds the schema. JIN builds the UI.

2A. Database: user_follows table
- CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
  );
- Indexes on follower_id, following_id, and the composite unique
- RLS: SELECT for authenticated, INSERT/DELETE only where follower_id = auth.uid()
- Create migration file in supabase/migrations/ with next timestamp

2B. Database: activity_comments table
- CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(char_length(content) BETWEEN 1 AND 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
      (session_id IS NOT NULL AND template_session_id IS NULL) OR
      (session_id IS NULL AND template_session_id IS NOT NULL)
    )
  );
- Same polymorphic FK pattern as reactions
- Indexes on session_id, template_session_id, user_id
- RLS: SELECT for authenticated, INSERT where user_id = auth.uid(), DELETE where user_id = auth.uid()
- Add 'comment' to community_notifications notification_type CHECK constraint

2C. Service: followService.ts
- followUser(followerId, followingId)
- unfollowUser(followerId, followingId)
- getFollowers(userId) → { id, display_name, avatar_url }[]
- getFollowing(userId) → { id, display_name, avatar_url }[]
- getFollowCounts(userId) → { followers: number, following: number }
- isFollowing(followerId, followingId) → boolean
- getSuggestedUsers(userId, limit=10) → users with most followers that current user doesn't follow

2D. Service: commentService.ts
- addComment(userId, content, sessionId?, templateSessionId?)
- deleteComment(commentId, userId)
- getCommentsForSession(sessionId?, templateSessionId?) → with user profiles joined

2E. Hooks: useFollow.ts
- useFollowUser() mutation with optimistic update
- useUnfollowUser() mutation with optimistic update
- useFollowers(userId) query
- useFollowing(userId) query
- useFollowCounts(userId) query
- useIsFollowing(userId) query
- useSuggestedUsers() query

2F. Hooks: useComments.ts
- useComments(sessionId?, templateSessionId?) query
- useAddComment() mutation with optimistic update
- useDeleteComment() mutation

2G. Update socialService.ts getSocialFeed:
- SARAH's key decision: The feed should have TWO MODES:
  - "Following" feed: only shows workouts from users you follow (default when you follow 1+ people)
  - "Discover" feed: shows all public workouts (default when following nobody, always available as a tab)
- Add feedMode parameter: 'following' | 'discover'
- For 'following' mode: JOIN with user_follows WHERE follower_id = currentUserId

2H. UI: Follow/Unfollow buttons
- On PublicProfile page: prominent Follow/Unfollow button below user info
- On WorkoutCard: small follow button next to username (only if not already following)
- Animated state transitions (follow → following with checkmark)
- Optimistic UI — instant visual feedback

2I. UI: Feed tabs (Following / Discover)
- Horizontal tab bar at top of Community page below header
- Animated tab indicator (use existing pattern from bottom nav)
- "Following" shows followed users' workouts
- "Discover" shows all public workouts
- If user follows nobody, default to Discover with a prompt to follow people

2J. UI: Comments section
- On PublicSessionDetail page: comment section below reactions
- Comment input field with send button
- Comment list with user avatar, name, text, relative time
- Delete own comments (swipe or long-press menu)
- Comment count shown on WorkoutCard in collapsed view

2K. UI: User discovery
- Search bar at top of Discover tab
- Search by display_name (case-insensitive ILIKE query)
- "Suggested Users" section when search is empty — users with most followers
- Each suggestion shows avatar, name, plan name, workout count, follow button
- New route: /community/search (or integrate into Discover tab)

2L. Notifications for comments and follows:
- Add notification types: 'comment', 'new_follower'
- When someone comments on your workout → notification
- When someone follows you → notification
- Update NotificationPanel to render these new types
- Update notificationService to create them

After Phase 2: Run `npx vite build` to verify. Run `npm run test:run`. Commit: "feat: social graph — following system, comments, user discovery, feed tabs"

PHASE 3: ENGAGEMENT & GAMIFICATION (iterations 13-19)
COACH MARCUS and SARAH drive what to build. ALEX designs it. JIN builds it.

3A. Weekly Challenges system:
COACH MARCUS says the #1 thing that keeps people coming back is friendly accountability.
- Database: weekly_challenges table
  - id, title, description, challenge_type ('volume' | 'frequency' | 'streak' | 'custom'),
    target_value, unit, start_date, end_date, created_by, is_global (boolean), created_at
- Database: challenge_participants table
  - id, challenge_id FK, user_id FK, current_value (numeric), completed (boolean), joined_at
- RLS: everyone can view global challenges, participants can view their own progress
- Example challenges: "Log 5 workouts this week", "Hit 50,000 lbs total volume", "3-day streak"
- Service + hooks for joining challenges, updating progress, leaderboard queries

3B. Challenge UI:
- New section on Community page: "Active Challenges" horizontal scroll below feed tabs
- Each challenge card: title, progress bar (animated), participant count, time remaining
- Challenge detail view: full leaderboard, your progress, participant list
- Join button with confirmation
- ALEX: make the progress visualization beautiful — think Apple Activity rings but for challenges
- Route: /community/challenges and /community/challenges/:challengeId

3C. Achievement Badges:
COACH MARCUS defines the badges that matter to real lifters:
- Consistency: "Iron Habit" (7-day streak), "Unbreakable" (30-day streak), "Machine" (100-day streak)
- Volume: "Ton Club" (1,000 lbs in one session), "5K Club" (5,000 lbs), "10K Club" (10,000 lbs)
- Frequency: "First Blood" (1st workout), "Centurion" (100 workouts), "Spartan" (300 workouts)
- Social: "Hype Squad" (10 reactions given), "Popular" (10 reactions received), "Community" (follow 10 people)
- Variety: "Well Rounded" (did weights + cardio + mobility in one week)
- Database: user_badges table (user_id, badge_type, earned_at)
- Config-driven: badges defined in badgeConfig.ts with icons, colors, thresholds, descriptions
- Achievement check runs after session completion — show a celebration modal when earned
- Display on PublicProfile as a trophy case

3D. Personal Records tracking:
COACH MARCUS: "PRs are the heartbeat of lifting. Every PR should feel like a celebration."
- Track PRs per exercise: heaviest weight, most reps at a weight, highest volume in one set
- Database: personal_records table (user_id, exercise_name, record_type, value, achieved_at, session_id)
- When a user logs a set that exceeds their PR → instant visual celebration (animated badge, confetti burst)
- PR badge on feed cards when a workout contains a PR
- PR history on profile

3E. Enhanced Public Profile:
SARAH: "The profile should make people feel like athletes. Think player cards."
- Add followers/following counts with tap to view list
- Add badge trophy case section
- Add PR highlights (top 3 recent PRs)
- Add challenge participation / wins
- Add a "workout heatmap" — GitHub-style contribution graph showing consistency over months
- Bio field (add to user_profiles: bio TEXT, max 160 chars)
- All-time stats: total volume, total sessions, most common workout type, longest streak ever

3F. Feed enhancements:
- PR celebrations in the feed: when a workout contains a PR, the card gets a special visual treatment (golden border, PR badge)
- Challenge completion celebrations: when someone completes a challenge, it appears as a special feed item
- Badge earned celebrations: when someone earns a badge, it appears in the feed
- "Like" counts show more prominently
- Show comment count on collapsed cards

After Phase 3: Run `npx vite build`. Run `npm run test:run`. Commit: "feat: engagement — challenges, badges, PRs, enhanced profiles"

PHASE 4: MOTION, POLISH & UX (iterations 20-25)
ALEX drives. JIN implements. Everyone reviews.

4A. Feed UX Polish:
- Infinite scroll with smooth loading indicator at bottom
- Pull-to-refresh with custom animation (not browser default)
- Skeleton loading states for all new components (challenge cards, comments, badges)
- Empty states: beautiful illustrated moments with motion for each new feature:
  - No followers yet → "Start building your crew" with a subtle animation
  - No challenges → "No active challenges" with a CTA to browse
  - No comments → "Be the first to comment" with a subtle prompt
- Feed item entrance animations: stagger children, fade + slide up

4B. Celebration Micro-interactions:
- PR achieved: burst of particles in primary color, number scales up dramatically, brief haptic-style bounce
- Badge earned: modal with the badge icon animating in (scale from 0 + rotate), confetti burst, share button
- Challenge completed: progress ring fills to 100% with spring animation, checkmark appears
- Streak milestone (7, 30, 100 days): flame icon pulses with glow, streak number animates up
- Follow received: subtle toast with avatar sliding in from right

4C. Component animations:
- Follow button: smooth state transition with morphing shape (Follow → Following ✓)
- Comment input: expands smoothly on focus, contracts on blur
- Challenge progress bar: spring animation when value updates
- Heatmap cells: stagger reveal on first render, pulse on active day
- Tab switching: content crossfade with slight vertical offset
- Reaction bar: reactions bounce in when card expands

4D. Navigation & Transitions:
- Page transitions between community routes (feed → profile → session detail) should feel connected
- Back navigation should reverse the transition direction
- Shared element transitions for user avatars (feed card → profile page) if feasible with Framer Motion
- Bottom sheet for comments should slide up with spring physics

4E. Performance:
JIN's performance checklist:
- Virtualized feed list if > 50 items (consider react-window or intersection observer lazy rendering)
- Image lazy loading for photos and avatars
- Debounced search input (300ms)
- Memoize expensive computations (streak calc, volume totals)
- Verify no unnecessary re-renders with React DevTools
- TanStack Query cache management: proper staleTime, gcTime for new queries

After Phase 4: Run `npx vite build`. Run `npm run test:run`. Commit: "polish: community UX — animations, celebrations, performance"

PHASE 5: INTEGRATION & QA (iterations 26-28)
EVERYONE reviews. Fix everything broken.

5A. Full integration test:
- Navigate every community route in sequence: /community → feed tabs → workout card expand → session detail → profile → back
- Verify: following/unfollowing works, comments work, reactions work, notifications work
- Verify: streak calculation is accurate
- Verify: pagination loads more items on scroll
- Verify: search finds users
- Verify: challenge progress updates
- Verify: all animations are smooth, no jank

5B. Edge cases (SARAH's list):
- User with 0 followers, 0 following
- User viewing their own profile vs someone else's
- Empty feed (new user, follows nobody)
- Very long display names, very long workout names
- User who has hidden weight details viewing feed
- Rapid tap on follow/unfollow (debounce)
- Comment with max length (500 chars)
- User with 100+ workouts (pagination performance)

5C. Type safety:
- Run `npx vite build` and fix ALL type errors
- Ensure no `any` types in new code
- Ensure all new types are in src/types/community.ts
- Ensure all new config is in src/config/communityConfig.ts

5D. Dead code & cleanup:
- Remove any unused imports
- Remove any console.logs
- Ensure all new files follow existing naming conventions
- Ensure all new hooks follow the useXxx naming pattern
- Ensure all new services follow the xxxService.ts pattern

After Phase 5: Run `npx vite build` successfully. Commit: "chore: community QA — edge cases, type safety, cleanup"

═══════════════════════════════════════════════════
 DEVELOPMENT JOURNAL
═══════════════════════════════════════════════════

Create /home/user/workouts/community-dev-journal.md at the START of iteration 1.

BEFORE YOU CHANGE ANYTHING in iteration 1:
- Read every existing community file (pages, components, services, hooks, types, config, migrations)
- Write an honest assessment in the journal: what's good, what's broken, what's the biggest opportunity
- This journal is your team's shared memory across iterations

AFTER EVERY ITERATION:
1. Write a journal entry with:
   - Which phase/task you worked on
   - Which team member "drove" the decisions
   - What was implemented
   - What build/test issues were encountered and how they were resolved
   - What's next
   - Rate: feature completeness (1-10), code quality (1-10), UX quality (1-10)
2. Run `npx vite build` — if it fails, fix it before moving on
3. Commit with a descriptive message
4. READ the journal before starting the next iteration to maintain continuity

═══════════════════════════════════════════════════
 ARCHITECTURE RULES — NON-NEGOTIABLE
═══════════════════════════════════════════════════

Follow the existing layered architecture EXACTLY:
  Page → Hook (TanStack Query) → Service → Supabase

- Services go in src/services/ — handle all Supabase queries
- Hooks go in src/hooks/ — wrap services with TanStack Query
- Types go in src/types/community.ts (extend the existing file)
- Config goes in src/config/communityConfig.ts (extend the existing file)
- Components go in src/components/social/ (extend the existing directory)
- Pages go in src/pages/ — add routes in App.tsx following existing pattern
- Migrations go in supabase/migrations/ with timestamp naming

NAMING CONVENTIONS:
- Services: camelCase functions, exported individually (not default export)
- Hooks: useXxx pattern, one file per domain (useFollow.ts, useComments.ts, etc.)
- Components: PascalCase files, named exports
- Types: PascalCase interfaces, camelCase type aliases
- Config: SCREAMING_SNAKE for constants, camelCase for objects

QUERY KEY CONVENTIONS (match existing patterns):
- ['social-feed', feedMode, cursor] for paginated feed
- ['public-profile', userId] for profiles
- ['followers', userId], ['following', userId] for social graph
- ['comments', sessionId, templateSessionId] for comments
- ['challenges'] for challenge list
- ['user-badges', userId] for badges

DO NOT:
- Change any design tokens, colors, or fonts
- Add new npm dependencies without strong justification
- Break existing functionality
- Leave TypeScript errors in non-test files
- Use `any` types
- Skip RLS policies on new tables
- Create components outside src/components/social/ for community features
- Use localStorage for data that should be in the database

═══════════════════════════════════════════════════
 ITERATION STRATEGY
═══════════════════════════════════════════════════

Each iteration should:
1. READ the development journal from previous iterations
2. Identify the next task from the phase list
3. Implement it fully (schema + service + hook + component + route if needed)
4. Run `npx vite build` to verify
5. Write a journal entry
6. Commit the changes
7. Move to the next task

If you encounter a blocking issue:
- Document it in the journal
- Move to the next task
- Come back to it with fresh context in a later iteration

If `npx vite build` fails:
- Fix the error immediately — do NOT move forward with a broken build
- The build is the source of truth, not tsc -b (see CLAUDE.md)

PACING — this loop should run ~30 iterations over ~1 hour:
- Iterations 1-5: Phase 1 (fix foundation)
- Iterations 6-12: Phase 2 (social graph — this is the BIGGEST phase)
- Iterations 13-19: Phase 3 (engagement & gamification)
- Iterations 20-25: Phase 4 (motion & polish)
- Iterations 26-28: Phase 5 (integration & QA)
- Iterations 29-30: Final review & cleanup

═══════════════════════════════════════════════════
 QUALITY BAR
═══════════════════════════════════════════════════

Before declaring done, the team asks:

COACH MARCUS: "Would I recommend this to my clients for accountability?"
SARAH: "Would this feature have shipped at Strava? Does the feed make you want to open the app?"
ALEX: "Does every screen have a clear hierarchy? Are the animations purposeful, not decorative?"
DIEGO: "Are all tables indexed? Do all queries use RLS? Is the schema normalized?"
JIN: "Are there any loading jank? Unnecessary re-renders? Type safety holes?"

If ANY answer is no, keep iterating.

When the community feature has:
✅ A working following system with discover/following feed modes
✅ Comments on workouts
✅ Real streak calculations showing on profiles and feed cards
✅ Cursor-based pagination with infinite scroll
✅ User search and discovery
✅ At least a basic challenges system
✅ Achievement badges with celebration moments
✅ Personal record tracking and celebration
✅ Enhanced profiles with stats, badges, and heatmap
✅ Smooth animations and micro-interactions throughout
✅ All dead code cleaned up
✅ `npx vite build` passes clean
✅ Development journal documents the full journey

Output <promise>COMMUNITY_SHIPPED</promise>
```
