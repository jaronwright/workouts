-- ============================================================
-- Phase 3: Engagement & Gamification
-- Adds badges, challenges, and leaderboard support
-- ============================================================

-- ─── Badges ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any badges"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "System inserts badges for authenticated users"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Challenges ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('weekly', 'monthly', 'community')),
  target_value INT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('workouts', 'streak', 'volume', 'duration', 'distance')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  badge_key TEXT, -- optional badge awarded on completion
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are publicly readable"
  ON challenges FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all challenge participants"
  ON challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Seed initial challenges ─────────────────────────────

INSERT INTO challenges (title, description, challenge_type, target_value, metric, starts_at, ends_at, badge_key) VALUES
  ('Week Warrior', 'Complete 5 workouts this week', 'weekly', 5, 'workouts',
   date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', 'week_warrior'),
  ('Iron Month', 'Log 20 workouts this month', 'monthly', 20, 'workouts',
   date_trunc('month', now()), date_trunc('month', now()) + interval '1 month', 'iron_month'),
  ('Streak Master', 'Build a 7-day workout streak', 'monthly', 7, 'streak',
   date_trunc('month', now()), date_trunc('month', now()) + interval '1 month', 'streak_master'),
  ('Volume King', 'Lift 50,000 lbs total this month', 'monthly', 50000, 'volume',
   date_trunc('month', now()), date_trunc('month', now()) + interval '1 month', 'volume_king');

-- ─── Update delete_user_account function ─────────────────

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Community & social
  DELETE FROM activity_reactions WHERE user_id = auth.uid();
  DELETE FROM activity_comments WHERE user_id = auth.uid();
  DELETE FROM community_notifications WHERE recipient_id = auth.uid() OR actor_id = auth.uid();
  DELETE FROM user_follows WHERE follower_id = auth.uid() OR following_id = auth.uid();

  -- Gamification
  DELETE FROM challenge_participants WHERE user_id = auth.uid();
  DELETE FROM user_badges WHERE user_id = auth.uid();

  -- Workout data
  DELETE FROM workout_photos WHERE user_id = auth.uid();
  DELETE FROM personal_records WHERE user_id = auth.uid();
  DELETE FROM workout_reviews WHERE user_id = auth.uid();
  DELETE FROM exercise_sets WHERE session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid());
  DELETE FROM workout_sessions WHERE user_id = auth.uid();
  DELETE FROM template_workout_sessions WHERE user_id = auth.uid();
  DELETE FROM user_schedules WHERE user_id = auth.uid();
  DELETE FROM user_feedback WHERE user_id = auth.uid();
  DELETE FROM push_subscriptions WHERE user_id = auth.uid();
  DELETE FROM user_profiles WHERE id = auth.uid();
END;
$$;
