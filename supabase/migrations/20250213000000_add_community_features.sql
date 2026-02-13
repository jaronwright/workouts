-- =============================================
-- Community Features Migration
-- Adds: activity reactions, workout photos, community notifications,
-- privacy settings, and updated RLS policies for social features.
-- =============================================

-- =============================================
-- 1. ACTIVITY REACTIONS
-- Lightweight "cheers" on workouts (fire, strong, props, impressive)
-- Uses same polymorphic FK pattern as workout_reviews
-- =============================================

CREATE TABLE activity_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polymorphic session reference (exactly one must be set)
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,

  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'strong', 'props', 'impressive')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Exactly one session reference must be provided
  CONSTRAINT reaction_has_exactly_one_session CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL)
  ),

  -- One reaction per user per workout
  CONSTRAINT unique_user_weights_reaction UNIQUE (user_id, session_id),
  CONSTRAINT unique_user_template_reaction UNIQUE (user_id, template_session_id)
);

CREATE INDEX idx_reactions_session_id ON activity_reactions(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_reactions_template_session_id ON activity_reactions(template_session_id) WHERE template_session_id IS NOT NULL;
CREATE INDEX idx_reactions_user_id ON activity_reactions(user_id);

ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view reactions (social feature)
CREATE POLICY "Authenticated users can view reactions"
  ON activity_reactions FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own reactions
CREATE POLICY "Users can create their own reactions"
  ON activity_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions (change reaction type)
CREATE POLICY "Users can update their own reactions"
  ON activity_reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON activity_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 2. WORKOUT PHOTOS
-- Users can attach photos to completed workouts
-- =============================================

CREATE TABLE workout_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polymorphic session reference
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,

  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT photo_has_exactly_one_session CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL)
  )
);

CREATE INDEX idx_workout_photos_session_id ON workout_photos(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_workout_photos_template_session_id ON workout_photos(template_session_id) WHERE template_session_id IS NOT NULL;
CREATE INDEX idx_workout_photos_user_id ON workout_photos(user_id);

ALTER TABLE workout_photos ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view photos on public workouts
CREATE POLICY "Authenticated users can view workout photos"
  ON workout_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload their own workout photos"
  ON workout_photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout photos"
  ON workout_photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 3. WORKOUT PHOTOS STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workout-photos',
  'workout-photos',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view workout photos (public bucket)
CREATE POLICY "Anyone can view workout photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'workout-photos');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own workout photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'workout-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own photos
CREATE POLICY "Users can delete their own workout photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'workout-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- 4. COMMUNITY NOTIFICATIONS
-- In-app + push notifications for social events
-- =============================================

CREATE TABLE community_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL CHECK (notification_type IN ('reaction', 'photo_reaction')),

  -- Reference to the reaction that triggered this notification
  reaction_id UUID REFERENCES activity_reactions(id) ON DELETE CASCADE,

  -- Polymorphic session reference (what workout was reacted to)
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,

  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT notification_session_check CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL) OR
    (session_id IS NULL AND template_session_id IS NULL)
  )
);

CREATE INDEX idx_notifications_recipient ON community_notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_created_at ON community_notifications(created_at DESC);

ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON community_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- System/triggers create notifications (users don't directly insert)
-- But we allow it for the service layer
CREATE POLICY "Users can create notifications for others"
  ON community_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
  ON community_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON community_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- =============================================
-- 5. PRIVACY SETTINGS
-- Per-user controls for what's visible in Community
-- =============================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS hide_weight_details BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS community_onboarded BOOLEAN NOT NULL DEFAULT false;

-- Add social notification preferences to existing table
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS social_reactions BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS social_push_enabled BOOLEAN NOT NULL DEFAULT true;

-- =============================================
-- 6. UPDATED RLS POLICIES
-- Allow authenticated users to read other users' profiles
-- (needed for social feed to show names/avatars)
-- =============================================

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Replace with a policy that allows all authenticated users to read profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Also allow reading reviews on public workouts (for feed expansion)
DROP POLICY IF EXISTS "Users can view their own reviews" ON workout_reviews;

CREATE POLICY "Authenticated users can view reviews on public workouts"
  ON workout_reviews FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view public workout sessions (for social feed)
CREATE POLICY "Authenticated users can view public sessions"
  ON workout_sessions FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Allow authenticated users to view public template sessions (for social feed)
CREATE POLICY "Authenticated users can view public template sessions"
  ON template_workout_sessions FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Allow viewing exercise sets for public workout sessions (for feed exercise details)
CREATE POLICY "Authenticated users can view exercise sets of public sessions"
  ON exercise_sets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_sets.session_id
        AND workout_sessions.is_public = true
    )
  );

-- =============================================
-- 7. UPDATE delete_user_account TO CLEAN UP COMMUNITY DATA
-- =============================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete avatar storage objects
  DELETE FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = current_user_id::text;

  -- Delete workout photo storage objects
  DELETE FROM storage.objects
  WHERE bucket_id = 'workout-photos'
    AND (storage.foldername(name))[1] = current_user_id::text;

  -- Delete community notifications
  DELETE FROM community_notifications WHERE recipient_id = current_user_id OR actor_id = current_user_id;

  -- Delete reactions
  DELETE FROM activity_reactions WHERE user_id = current_user_id;

  -- Delete workout photos
  DELETE FROM workout_photos WHERE user_id = current_user_id;

  -- Delete user profile (cascade should handle related data)
  DELETE FROM user_profiles WHERE id = current_user_id;

  -- Delete workout sessions (if not cascaded)
  DELETE FROM workout_sessions WHERE user_id = current_user_id;
END;
$$;
