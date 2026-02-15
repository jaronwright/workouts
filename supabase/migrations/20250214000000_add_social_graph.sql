-- ═══════════════════════════════════════════════════
-- Social Graph: user_follows + activity_comments
-- ═══════════════════════════════════════════════════

-- ─── User Follows ─────────────────────────────────

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- RLS: everyone authenticated can view follows, only owner can insert/delete
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

-- ─── Activity Comments ───────────────────────────

CREATE TABLE IF NOT EXISTS activity_comments (
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

CREATE INDEX IF NOT EXISTS idx_activity_comments_session ON activity_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_template ON activity_comments(template_session_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user ON activity_comments(user_id);

-- RLS: authenticated can view, owner can insert/delete own comments
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comments"
  ON activity_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add comments"
  ON activity_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON activity_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ─── Update Notification Type Constraint ─────────
-- Add 'comment' and 'new_follower' to allowed notification types

ALTER TABLE community_notifications
  DROP CONSTRAINT IF EXISTS community_notifications_notification_type_check;

ALTER TABLE community_notifications
  ADD CONSTRAINT community_notifications_notification_type_check
  CHECK (notification_type IN ('reaction', 'photo_reaction', 'comment', 'new_follower'));

-- ─── Add bio field to user_profiles ──────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio TEXT CHECK(char_length(bio) <= 160);
  END IF;
END $$;

-- ─── Clean up follows on user deletion ───────────

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete community data
  DELETE FROM workout_photos WHERE user_id = auth.uid();
  DELETE FROM activity_reactions WHERE user_id = auth.uid();
  DELETE FROM community_notifications WHERE recipient_id = auth.uid() OR actor_id = auth.uid();
  DELETE FROM activity_comments WHERE user_id = auth.uid();
  DELETE FROM user_follows WHERE follower_id = auth.uid() OR following_id = auth.uid();

  -- Delete workout data
  DELETE FROM exercise_sets WHERE session_id IN (
    SELECT id FROM workout_sessions WHERE user_id = auth.uid()
  );
  DELETE FROM workout_sessions WHERE user_id = auth.uid();
  DELETE FROM template_workout_sessions WHERE user_id = auth.uid();
  DELETE FROM workout_reviews WHERE user_id = auth.uid();
  DELETE FROM user_schedules WHERE user_id = auth.uid();
  DELETE FROM user_feedback WHERE user_id = auth.uid();
  DELETE FROM push_subscriptions WHERE user_id = auth.uid();

  -- Delete profile and auth
  DELETE FROM user_profiles WHERE id = auth.uid();

  -- Delete from Supabase storage
  DELETE FROM storage.objects WHERE owner = auth.uid();
END;
$$;
