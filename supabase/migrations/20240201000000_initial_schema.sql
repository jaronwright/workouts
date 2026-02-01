-- Workout Tracker Database Schema
-- Run this in Supabase SQL Editor

-- =============================================
-- TABLES
-- =============================================

-- Workout Plans (container for workout programs)
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Days (Push, Pull, Legs)
CREATE TABLE workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Sections (Warm-up, Main Lifting, Abs/Core)
CREATE TABLE exercise_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id UUID REFERENCES workout_days(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  duration_minutes INTEGER,
  sort_order INTEGER NOT NULL
);

-- Plan Exercises (exercises from the workout plan)
CREATE TABLE plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES exercise_sections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets INTEGER,
  reps_min INTEGER,
  reps_max INTEGER,
  reps_unit VARCHAR(50) DEFAULT 'reps',
  is_per_side BOOLEAN DEFAULT FALSE,
  target_weight DECIMAL(10,2),
  notes TEXT,
  sort_order INTEGER NOT NULL
);

-- Workout Sessions (user's logged workout sessions)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_day_id UUID REFERENCES workout_days(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Exercise Sets (individual set logs)
CREATE TABLE exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  plan_exercise_id UUID REFERENCES plan_exercises(id),
  set_number INTEGER NOT NULL,
  reps_completed INTEGER,
  weight_used DECIMAL(10,2),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_workout_days_plan_id ON workout_days(plan_id);
CREATE INDEX idx_exercise_sections_workout_day_id ON exercise_sections(workout_day_id);
CREATE INDEX idx_plan_exercises_section_id ON plan_exercises(section_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_workout_day_id ON workout_sessions(workout_day_id);
CREATE INDEX idx_exercise_sets_session_id ON exercise_sets(session_id);
CREATE INDEX idx_exercise_sets_plan_exercise_id ON exercise_sets(plan_exercise_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on user-specific tables
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- Workout Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON workout_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON workout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON workout_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON workout_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Exercise Sets policies (via session ownership)
CREATE POLICY "Users can view their own exercise sets"
  ON exercise_sets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercise sets for their sessions"
  ON exercise_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercise sets"
  ON exercise_sets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercise sets"
  ON exercise_sets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Public read access for workout plans (all authenticated users can read)
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workout plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view workout days"
  ON workout_days FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view exercise sections"
  ON exercise_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view plan exercises"
  ON plan_exercises FOR SELECT
  TO authenticated
  USING (true);
