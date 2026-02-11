# Community Tab PRD

> Product Requirements Document for the Community tab redesign.
> Informed by competitive research across Strava, Apple Fitness, Hevy, Peloton, and Nike Run Club,
> plus UX engagement research on fitness app community features (2025-2026).

---

## 1. Executive Summary

The Community tab is currently a basic activity feed shell showing public workout completions. This PRD defines a full-featured community experience that drives workout consistency through social accountability, achievements, and lightweight competition.

**Core thesis**: Community should amplify the core behavior (working out), not compete with it. Every social feature must answer: "Does this make people work out more?"

**Key insight from research**: Strava's introduction of Challenges boosted 90-day retention from 18% to 32% and daily active users by 28%. Small accountability groups of 5-8 people have the highest goal-completion rates (Stanford Behavior Design Lab). Users with social accountability are 95% more likely to complete fitness goals vs. 65% with solo commitment (ASTD).

---

## 2. Current State

### What Exists Today

| Layer | File | What It Does |
|---|---|---|
| Page | `src/pages/Community.tsx` | Basic shell with `<ActivityFeed />` |
| Component | `src/components/social/ActivityFeed.tsx` | Lists public workouts from all users |
| Hook | `src/hooks/useSocial.ts` | `useSocialFeed()` + `useToggleVisibility()` |
| Service | `src/services/socialService.ts` | Queries `workout_sessions` + `template_workout_sessions` where `is_public = true` |
| Schema | `workout_sessions.is_public` | Boolean toggle on both session tables |
| Schema | `user_profiles` | `display_name`, `gender`, `avatar_url` (via storage) |

### What's Missing

- No follow/friend system (feed shows ALL public workouts from ALL users)
- No reactions, kudos, or comments
- No challenges or competitions
- No achievements or badges
- No groups or accountability partners
- No workout sharing cards
- No notifications for social activity
- No privacy controls beyond the `is_public` toggle

---

## 3. Target User

Primary: Self-tracking gym-goers who already use the app for workout logging (V1 audience).

The community features should serve three user segments:

| Segment | Behavior | Community Need |
|---|---|---|
| **Solo Tracker** | Logs workouts consistently, doesn't care about social | Passive social proof ("74 workouts today"), optional badges |
| **Accountability Seeker** | Wants a workout buddy or small group to stay consistent | Accountability groups, mutual visibility, nudges |
| **Social Sharer** | Wants to celebrate PRs, share progress, see friends | Activity feed, reactions, workout cards, challenges |

All three segments must be served without forcing social features on anyone. Default to private, invite to share.

---

## 4. Feature Specification

### 4.1 Social Graph: Following & Friends

**Inspiration**: Strava's asymmetric follow model + Hevy's discovery feed.

#### Follow System
- Asymmetric follows: you can follow someone without mutual follow
- "Friends" = mutual follows (both follow each other)
- Follow requests when profile is set to private
- Block/remove follower capability

#### Discovery
- Search by display name
- Invite via shareable link (deep link to profile)
- "People you may know" based on mutual follows
- Import contacts (optional, native share sheet)

#### Privacy Controls
- Profile visibility: `public` | `friends_only` | `private`
- Activity visibility per workout: `everyone` | `friends` | `only_me` (default: `friends`)
- Default new users to `friends_only` profile, `friends` activity visibility
- Option to hide from search/discovery

#### Database Schema

```sql
-- Follow relationships
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Privacy settings
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT NOT NULL DEFAULT 'friends_only'
    CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
  default_activity_visibility TEXT NOT NULL DEFAULT 'friends'
    CHECK (default_activity_visibility IN ('everyone', 'friends', 'only_me')),
  show_in_search BOOLEAN NOT NULL DEFAULT true,
  show_workout_details BOOLEAN NOT NULL DEFAULT true,  -- false = abstract ("completed Push Day")
  show_in_leaderboards BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### RLS Policies
- Users can only see profiles where: profile is `public`, OR they are friends, OR they follow the user and profile is `friends_only`
- Activity feed filtered by: activity visibility setting AND follow relationship

---

### 4.2 Activity Feed (Redesigned)

**Inspiration**: Hevy's workout feed + Strava's activity cards.

#### Feed Tabs
The community page should have two tabs:

1. **Friends** (default) -- Workouts from people you follow, chronological
2. **Discover** -- Recent public workouts from all users (current behavior, scoped)

#### Activity Card Content

Each card shows:
- **Header**: Avatar, display name, relative time ("2h ago")
- **Workout badge**: Type pill (Weights / Cardio / Mobility) with category color
- **Workout name**: "Push Day", "5K Run", "Spine Mobility"
- **Stats row** (configurable by privacy settings):
  - Weights: duration, total volume (sets x reps x weight), PR count
  - Cardio: duration, distance, avg pace
  - Mobility: duration, category
- **Review mood** (if user shared it): mood emoji from their post-workout review
- **Action row**: Kudos button + count, comment icon + count

#### Interactions

| Action | Description | Inspiration |
|---|---|---|
| **Kudos** | Single-tap reaction on an activity (like Strava) | Strava: 14B kudos in 2025 |
| **Comments** | Text comments on activities | Hevy, Strava |
| **Quick Reactions** | Emoji reactions beyond kudos (fire, muscle, clap, heart) | Slack-style reactions |

#### Database Schema

```sql
-- Kudos / reactions on activities
CREATE TABLE activity_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Polymorphic FK (same pattern as workout_reviews)
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'kudos'
    CHECK (reaction_type IN ('kudos', 'fire', 'muscle', 'clap', 'heart')),
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Ensure exactly one FK is set
  CONSTRAINT one_session_type CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL)
  ),
  -- One reaction type per user per activity
  UNIQUE(user_id, session_id, reaction_type),
  UNIQUE(user_id, template_session_id, reaction_type)
);

-- Comments on activities
CREATE TABLE activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) <= 500),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT one_session_type CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL)
  )
);
```

---

### 4.3 Accountability Groups

**Inspiration**: Apple Watch competitions + BetterTogether + Squad app.

**Why this matters**: The single highest-impact social feature per research. Stanford found groups of 5-8 people have the highest engagement rates for goal completion.

#### Group Structure
- **Size**: 3-8 members per group
- **Creation**: Any user can create a group and invite friends via share link
- **Joining**: Invite-only (no public groups initially)
- **Naming**: User-defined group name + optional emoji
- **Roles**: Creator (admin) + members. Admin can remove members.

#### Group Features

| Feature | Description |
|---|---|
| **Activity ring** | Donut chart showing group's collective workout completion for the week |
| **Member status** | Grid showing each member's workout status today (checkmark or empty) |
| **Group streak** | Consecutive weeks where ALL members completed their workout goal |
| **Group challenges** | Time-boxed challenges within the group (see 4.4) |
| **Quick reactions** | Send fire/clap/muscle to group members when they complete a workout |
| **Group chat** | Simple text chat within the group (Phase 3, optional) |

#### Weekly Goal
- Each member sets their weekly workout count goal (e.g., "4 workouts this week")
- Group shows progress: "3 of 5 members hit their goal this week"
- Push notification: "Your buddy Sarah just finished Leg Day -- your turn?"

#### Database Schema

```sql
CREATE TABLE accountability_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 50),
  emoji TEXT,  -- optional group emoji
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES accountability_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  weekly_goal INTEGER NOT NULL DEFAULT 3 CHECK (weekly_goal BETWEEN 1 AND 7),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);
```

---

### 4.4 Challenges

**Inspiration**: Strava challenges + Peloton's Club Peloton.

#### Challenge Types

| Type | Description | Example |
|---|---|---|
| **Frequency** | Complete X workouts in Y days | "4 workouts in 7 days" |
| **Streak** | Work out X days in a row | "7-day streak challenge" |
| **Volume** | Log X total sets/reps/minutes | "100 sets this week" |
| **Variety** | Complete workouts across categories | "Do weights + cardio + mobility this week" |

#### Challenge Scopes

1. **Personal challenges** -- self-imposed goals with badge rewards
2. **Group challenges** -- created within accountability groups
3. **Community challenges** -- platform-wide monthly challenges (admin-created)

#### Challenge Lifecycle
1. **Created** with title, description, goal type, target value, start/end date
2. **Active** -- progress tracked automatically from workout completions
3. **Completed** -- badge awarded, celebration animation
4. **Expired** -- incomplete challenges silently expire (no shame mechanic)

#### Database Schema

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('personal', 'group', 'community')),
  group_id UUID REFERENCES accountability_groups(id) ON DELETE CASCADE, -- null for personal/community
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('frequency', 'streak', 'volume', 'variety')),
  goal_target INTEGER NOT NULL,
  goal_unit TEXT, -- 'workouts', 'sets', 'minutes', 'categories'
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  badge_name TEXT, -- config key for badge
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);
```

---

### 4.5 Achievements & Badges

**Inspiration**: Nike Run Club multi-stage achievements + Peloton milestone badges + Apple Watch awards.

#### Achievement Categories

| Category | Examples | Trigger |
|---|---|---|
| **Milestone** | 1st, 10th, 25th, 50th, 100th workout | Workout count |
| **Streak** | 3-day, 7-day, 14-day, 30-day, 60-day, 90-day streak | Consecutive days with workouts |
| **Category Explorer** | "Well-Rounded" (all 3 categories in one week) | Category variety |
| **PR Collector** | 1st, 5th, 10th, 25th personal record | PR count |
| **Early Bird / Night Owl** | 10 workouts before 7am / after 9pm | Workout time of day |
| **Weekend Warrior** | 4 consecutive weekends with workouts | Weekend consistency |
| **Challenge Champion** | Complete 1st, 5th, 10th challenge | Challenge completions |
| **Social Butterfly** | Give 100 kudos, join first group | Social activity |
| **Iron Week** | Complete every scheduled workout in a week | Schedule adherence |

#### Badge Display
- Trophy case on user profile (like Strava)
- 4 "pinned" badges displayed prominently
- Badge earned notification with celebration animation
- Shareable badge cards (see 4.6)

#### Config-Driven (No Migration Needed for New Badges)

Like `reviewConfig.ts`, achievements should be defined in `achievementConfig.ts`:

```typescript
export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string      // emoji or icon key
  category: 'milestone' | 'streak' | 'variety' | 'pr' | 'time' | 'social' | 'challenge'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  trigger: {
    type: 'workout_count' | 'streak_days' | 'pr_count' | 'challenge_count' | ...
    threshold: number
  }
}
```

#### Database Schema

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL, -- key from achievementConfig
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
```

---

### 4.6 Workout Sharing Cards

**Inspiration**: Strava Stats Stickers + Apple Watch workout summary cards + Hevy shareables.

#### Share Card Content
Generated image/card for completed workouts containing:
- App logo/watermark (small, bottom corner)
- Workout type + name ("Push Day")
- Date and duration
- Key stats (total volume, PR count, or distance/pace for cardio)
- Mood emoji (from post-workout review, if provided)
- Achievement badges earned during this session (if any)
- Gradient background matching workout category color

#### Share Destinations
- Copy image to clipboard
- Web Share API (`navigator.share()`) for native sharing on mobile
- Direct share to Instagram Stories (Stats Sticker style)
- Share within the app's activity feed

#### Implementation Approach
- Use `html-to-image` or `html2canvas` library to render a React component as an image
- Render a hidden `<ShareCard>` component off-screen, capture as PNG
- Use Web Share API for native share sheet on mobile

#### Share Triggers
- Post-workout completion screen: "Share your workout" button
- History/session detail page: share icon in header
- Achievement earned: "Share this achievement" prompt

---

### 4.7 Notifications

**Inspiration**: Strava's three-channel notification system.

#### Notification Types

| Type | Channel | Trigger |
|---|---|---|
| Kudos received | Push + in-app | Someone reacts to your workout |
| Comment received | Push + in-app | Someone comments on your workout |
| New follower | In-app | Someone follows you |
| Friend completed workout | Push (opt-in) | A friend finishes a workout |
| Group member worked out | Push (opt-in) | Accountability group member completes |
| Challenge progress | Push | You're 75%/90% toward a challenge goal |
| Challenge completed | Push + in-app | You complete a challenge |
| Achievement earned | In-app + celebration | You earn a new badge |
| Streak at risk | Push | You haven't worked out and your streak is at risk (evening) |
| Weekly recap | Push | Sunday evening: "3/4 workouts this week" |

#### Notification Settings
- Global toggle: enable/disable all push notifications
- Per-type toggles for each notification category
- Quiet hours setting (no push notifications between X and Y)

#### Implementation
- Leverage existing `push_subscriptions` table and push notification infrastructure (V1)
- Add `notifications` table for in-app notification bell

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB, -- flexible payload: { session_id, achievement_id, challenge_id, etc. }
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kudos_push BOOLEAN NOT NULL DEFAULT true,
  comments_push BOOLEAN NOT NULL DEFAULT true,
  friend_workout_push BOOLEAN NOT NULL DEFAULT false,
  group_activity_push BOOLEAN NOT NULL DEFAULT true,
  challenge_push BOOLEAN NOT NULL DEFAULT true,
  streak_warning_push BOOLEAN NOT NULL DEFAULT true,
  weekly_recap_push BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME, -- e.g., '22:00'
  quiet_hours_end TIME,   -- e.g., '07:00'
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 4.8 Leaderboards

**Inspiration**: Strava segment leaderboards (scoped) + Peloton weekly leaderboards.

#### Scoping (Critical -- Avoid Toxic Competition)

Leaderboards must be **scoped to friends or groups only**. No global leaderboards.

Research shows that global leaderboards with strangers cause stress, shift focus from personal progress to social comparison, and can hurt performance self-esteem.

#### Leaderboard Types

| Leaderboard | Metric | Reset |
|---|---|---|
| **Weekly Workouts** | Workout count this week | Every Monday |
| **Weekly Volume** | Total sets x reps x weight | Every Monday |
| **Streak Leaders** | Current streak length | Rolling |
| **Challenge Rankings** | Progress toward active challenge | Per challenge |

#### Display
- Shown within accountability group page
- Optional "Compare with friends" section on the Review/History tab
- User can opt out of leaderboards via privacy settings

---

### 4.9 Weekly & Monthly Recaps

**Inspiration**: Strava Monthly Recap + Year in Sport.

#### Weekly Recap (Push Notification, Sunday Evening)
Content:
- Workouts completed vs. goal
- Total training time
- PRs hit this week
- Streak status
- Comparison to last week (arrows up/down)
- "Your friend X had a great week too" (if applicable)

#### Monthly Recap (In-App Card)
Content:
- Total workouts, total training time
- Most-trained category
- PRs achieved
- Longest streak during the month
- Badge earned this month
- Shareable summary card

#### Year in Review (December, In-App)
- Total workouts, hours trained
- Category breakdown (pie chart)
- All badges earned
- Longest streak
- Top exercises by volume
- "Your year in fitness" shareable card
- Requires 10+ workouts to generate

---

## 5. Community Tab Page Structure

### Information Architecture

```
Community Tab
├── Header: "Community" + notification bell (count badge)
├── Tab Bar: [Friends Feed] [Discover] [Groups]
│
├── Friends Feed (default)
│   ├── Social proof banner: "127 workouts today"
│   ├── Activity cards (friends' workouts, chronological)
│   └── Empty state: "Follow friends to see their activity"
│
├── Discover
│   ├── Active community challenges
│   ├── Recent public workouts
│   └── Suggested people to follow
│
└── Groups
    ├── Your accountability groups (cards)
    ├── Group activity summary (who worked out today)
    ├── Active group challenges
    └── "Create a Group" button
```

### Navigation from Community Tab
- Tap activity card -> Session detail page (read-only for others' workouts)
- Tap user avatar -> User profile page
- Tap group card -> Group detail page (members, challenges, leaderboard)
- Tap challenge -> Challenge detail page (progress, participants)
- Tap notification bell -> Notifications list

---

## 6. Privacy & Safety

### Guiding Principles
1. **Default to private**: New users have `friends_only` profiles, `friends` activity visibility
2. **Abstract sharing option**: Users can share "completed Push Day" without exposing weights/reps
3. **No body metrics in social contexts**: Body weight, body fat %, and measurements are NEVER shown in feeds or shared
4. **Celebrate consistency over performance**: Feature workout count and streaks, not absolute weight numbers
5. **No shame mechanics**: Expired challenges silently expire. Broken streaks show grace, not punishment
6. **Easy opt-out**: One toggle to disable all social features (reverts to solo mode)
7. **Report and block**: Every piece of user-generated content has a report button

### Anti-Patterns to Avoid
- Global leaderboards with strangers
- Displaying body weight/composition in feeds
- Gamifying caloric restriction or weight loss
- "You missed your workout" shame notifications (use positive framing: "Ready to get back to it?")
- Algorithmic feed ordering that creates FOMO
- Requiring social features to use core app functionality

### Streak Freeze
- Users get 1 free "streak freeze" per week (auto-applied)
- Additional streak freezes earned through challenge completion
- Prevents the "streak anxiety / broken streak depression" anti-pattern

---

## 7. Onboarding into Community

Community features should NOT be part of initial onboarding. Use progressive disclosure:

| Stage | Timing | Feature Introduced |
|---|---|---|
| 1. Solo foundation | Days 1-7 | Core workout tracking only |
| 2. Soft social proof | After 3rd workout | "127 workouts today" banner on home page |
| 3. Friend discovery | After 5th workout | "Know someone who'd keep you accountable?" prompt |
| 4. Group suggestion | After 2 weeks | "Create an accountability group" card on community tab |
| 5. Challenges | After 3 weeks | "Join your first challenge" suggestion |
| 6. Full social | After 1 month | All features available, badges retroactively awarded |

---

## 8. Phased Implementation

### Phase 1: Foundation (2-3 weeks)

**Goal**: Following system + redesigned feed + basic reactions

| Task | Files | Effort |
|---|---|---|
| `user_follows` table + RLS | New migration | S |
| `user_privacy_settings` table + RLS | New migration | S |
| `followService.ts` + `useFollow` hook | New files | M |
| `privacyService.ts` + `usePrivacy` hook | New files | S |
| Redesign Community page with Friends/Discover tabs | `Community.tsx` | M |
| Redesign ActivityFeed cards with new layout | `ActivityFeed.tsx` | M |
| User profile page (public view for other users) | New page | M |
| Search/discover users | New component | M |
| `activity_reactions` table + kudos button | New migration + component | M |
| Follow/unfollow button on profiles | New component | S |

### Phase 2: Accountability (2-3 weeks)

**Goal**: Groups + achievements + notifications

| Task | Files | Effort |
|---|---|---|
| `accountability_groups` + `group_members` tables | New migration | S |
| Group CRUD service + hooks | New files | M |
| Group detail page (members, status, weekly progress) | New page | L |
| `user_achievements` table | New migration | S |
| `achievementConfig.ts` with all badge definitions | New config | M |
| Achievement evaluation engine (check on workout completion) | New service | L |
| Trophy case on profile page | New component | M |
| `notifications` + `notification_preferences` tables | New migration | S |
| Notification service + in-app notification bell | New files + component | M |
| Push notifications for social events | Extend existing push infra | M |

### Phase 3: Engagement (2-3 weeks)

**Goal**: Challenges + sharing cards + comments + recaps

| Task | Files | Effort |
|---|---|---|
| `challenges` + `challenge_participants` tables | New migration | S |
| Challenge CRUD + auto-progress tracking | New service + hooks | L |
| Challenge cards on community/group pages | New components | M |
| `activity_comments` table + comment UI | New migration + component | M |
| Workout sharing cards (html-to-image) | New component | L |
| Web Share API integration for cards | Extend share service | S |
| Weekly recap push notification | New service | M |
| Monthly recap in-app card | New component | M |
| Streak freeze logic | Extend streak service | S |

### Phase 4: Polish & Advanced (2-3 weeks)

**Goal**: Leaderboards + Year in Review + onboarding flow

| Task | Files | Effort |
|---|---|---|
| Friend-scoped leaderboards | New component | M |
| Group leaderboards (weekly workouts, volume) | New component | M |
| Year in Review page | New page | L |
| Progressive onboarding prompts | Extend home page + community page | M |
| Notification quiet hours | Extend notification service | S |
| Group chat (optional) | New component + table | L |
| Performance optimization (feed pagination, caching) | Multiple files | M |

---

## 9. Technical Considerations

### Performance
- Activity feed: paginated queries (20 items per page, cursor-based)
- Reaction counts: denormalized counter columns on session tables (avoid COUNT queries)
- Achievement checks: trigger on workout completion (not polling)
- Feed caching: TanStack Query with 2-minute stale time for social data

### Offline Support
- Kudos and reactions queue in `offlineStore` for sync on reconnect
- Comments queue in `offlineStore`
- Achievement badges cached locally after first fetch
- Feed shows cached data when offline with "you're offline" banner

### Real-Time (Future)
- Supabase Realtime subscriptions for live feed updates (Phase 4)
- Live "typing" indicator in group chat (Phase 4)
- Real-time kudos animations (Phase 4)

### Security
- All social tables use RLS policies scoped to authenticated users
- Comments rate-limited (max 10 per minute per user)
- Reaction rate-limited (max 60 per minute per user)
- Group invite codes expire after 7 days
- Report system flags content for admin review

---

## 10. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Community activation rate | 30% of users engage with social within 30 days | % of users with any social action |
| Social-to-workout uplift | +20% more workouts for social users vs. solo | Compare workout frequency |
| Group formation rate | 15% of active users join or create a group | Group membership count |
| Challenge participation | 25% of active users join a challenge | Challenge participant count |
| Day-30 retention (social users) | 25%+ (vs. ~12% industry average) | Cohort retention analysis |
| Kudos per active user per week | 5+ reactions given | Reaction count |
| Weekly recap open rate | 40%+ push notification tap rate | Notification analytics |

---

## 11. Competitive Feature Matrix

| Feature | Strava | Apple Fitness | Hevy | Peloton | Our App (Planned) |
|---|---|---|---|---|---|
| Activity feed | Full | No | Full | Limited | Full (Phase 1) |
| Follow system | Asymmetric | Mutual | Asymmetric | Tags | Asymmetric (Phase 1) |
| Kudos/reactions | Kudos only | No | Likes | High-five | Multi-reaction (Phase 1) |
| Comments | Yes | No | Yes | No | Yes (Phase 3) |
| Clubs/groups | 1M+ clubs | No | No | Tags | Accountability groups (Phase 2) |
| Challenges | Platform + user | Monthly awards | No | Badges | Personal + group + community (Phase 3) |
| Badges/achievements | Trophies | Awards/rings | PRs | 100+ badges | Config-driven badges (Phase 2) |
| Sharing cards | Stats Stickers | Workout summary | Shareables | No | Workout cards (Phase 3) |
| Leaderboards | Segments | Competition | No | Live class | Friend-scoped (Phase 4) |
| AI coaching | Athlete Intel | Workout Buddy | No | No | Future consideration |
| Workout Buddy pairing | No | Competition | No | No | Accountability groups (Phase 2) |
| Streak freeze | No | No | No | No | Yes (Phase 3) |
| Privacy controls | Granular | Limited | Basic | Basic | Granular (Phase 1) |

---

## 12. Open Questions

1. **Monetization**: Should any community features be premium-only? (Strava locks leaderboard filters, Year in Sport behind paywall)
2. **Coach mode**: Should we support one user creating workout plans for another? (Related but separate PRD)
3. **Apple Health / Google Fit integration**: Prerequisite for wearable data sharing features (separate PRD)
4. **Content moderation**: Start with manual review queue or invest in automated filters?
5. **Group size limit**: 8 members max, or allow larger groups (Strava allows 199 in challenges)?
6. **Real-time feed updates**: Worth the Supabase Realtime cost, or polling is sufficient?

---

## Appendix A: Research Sources

### Apps Analyzed
- **Strava**: Activity feed, clubs, challenges, segments, leaderboards, privacy controls, sharing
- **Apple Fitness / watchOS 26**: Activity sharing, competitions, Workout Buddy AI, awards
- **Hevy**: Workout feed, discovery feed, social features, shareables (10M+ users in 2025)
- **Peloton**: High-fives, Club Peloton loyalty system, milestone badges, daily/weekly streaks
- **Nike Run Club**: Multi-stage achievement badges, streak achievements, challenge partnerships
- **BetterTogether / Squad / Cohorty**: Small-group accountability apps

### UX Research Referenced
- Stanford Behavior Design Lab: Optimal accountability group sizes (5-8 people)
- ASTD: 95% goal completion with specific accountability appointment
- Frontiers in Psychology 2025: Fitness social media and exercise behavior
- Information Systems Research: Social comparison and well-being in fitness tech
- Industry retention benchmarks: Day-1 (30-35%), Day-7 (15-20%), Day-30 (8-12%)
- Strava Challenges impact: 90-day retention 18% -> 32%, DAU +28%
