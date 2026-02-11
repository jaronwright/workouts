-- =============================================
-- Workout Reviews
-- Allows users to review completed workout sessions
-- with ratings, mood tracking, energy levels, and reflections.
-- Supports both weights sessions and cardio/mobility template sessions.
-- =============================================

-- workout_reviews table
-- Polymorphic reference: links to EITHER workout_sessions OR template_workout_sessions
CREATE TABLE workout_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polymorphic session reference (exactly one must be set)
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_session_id UUID REFERENCES template_workout_sessions(id) ON DELETE CASCADE,

  -- Core ratings (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),

  -- Mood tracking
  mood_before TEXT CHECK (mood_before IN ('great', 'good', 'neutral', 'tired', 'stressed')),
  mood_after TEXT CHECK (mood_after IN ('great', 'good', 'neutral', 'tired', 'stressed')),

  -- Performance tags (JSONB array of strings)
  performance_tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Reflection fields
  reflection TEXT,
  highlights TEXT,
  improvements TEXT,

  -- Cached duration for quick aggregation
  workout_duration_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Exactly one session reference must be provided
  CONSTRAINT review_has_exactly_one_session CHECK (
    (session_id IS NOT NULL AND template_session_id IS NULL) OR
    (session_id IS NULL AND template_session_id IS NOT NULL)
  ),

  -- One review per session (enforced via unique constraints)
  CONSTRAINT unique_weights_session_review UNIQUE (session_id),
  CONSTRAINT unique_template_session_review UNIQUE (template_session_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_workout_reviews_user_id ON workout_reviews(user_id);
CREATE INDEX idx_workout_reviews_session_id ON workout_reviews(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_workout_reviews_template_session_id ON workout_reviews(template_session_id) WHERE template_session_id IS NOT NULL;
CREATE INDEX idx_workout_reviews_created_at ON workout_reviews(created_at);
CREATE INDEX idx_workout_reviews_overall_rating ON workout_reviews(overall_rating);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE workout_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reviews"
  ON workout_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews"
  ON workout_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON workout_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON workout_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: auto-update updated_at on modification
-- =============================================

CREATE OR REPLACE FUNCTION update_workout_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_workout_reviews_updated_at
  BEFORE UPDATE ON workout_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_reviews_updated_at();
