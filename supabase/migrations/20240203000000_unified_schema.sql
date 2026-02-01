-- Unified Schema Migration
-- Adds workout_templates for scalable workout type support (weights, cardio, mobility)
-- Adds user_schedules for 7-day schedule management
-- Adds personal_records for PR tracking

-- =============================================
-- WORKOUT TEMPLATES TABLE
-- =============================================

-- Unified workout templates (works alongside existing workout_days for weights)
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('weights', 'cardio', 'mobility')),
  category VARCHAR(50), -- 'push','pull','legs' | 'swim','cycle','run','stair_stepper' | 'hip_knee_ankle','spine','shoulder_elbow_wrist','core'
  description TEXT,
  icon VARCHAR(50),
  duration_minutes INTEGER, -- estimated/default duration
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by type
CREATE INDEX idx_workout_templates_type ON workout_templates(type);

-- =============================================
-- USER SCHEDULES TABLE
-- =============================================

-- User's 7-day workout schedule
CREATE TABLE user_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  workout_day_id UUID REFERENCES workout_days(id) ON DELETE SET NULL, -- For weights workouts (legacy support)
  is_rest_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_number),
  -- Either template_id, workout_day_id, or is_rest_day must be set
  CONSTRAINT valid_schedule_entry CHECK (
    is_rest_day = true OR template_id IS NOT NULL OR workout_day_id IS NOT NULL
  )
);

-- Index for user lookups
CREATE INDEX idx_user_schedules_user_id ON user_schedules(user_id);

-- =============================================
-- PERSONAL RECORDS TABLE
-- =============================================

-- Track personal records for exercises
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_exercise_id UUID REFERENCES plan_exercises(id) ON DELETE CASCADE,
  weight DECIMAL(10,2) NOT NULL,
  reps INTEGER,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_exercise_id)
);

-- Index for user lookups
CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_personal_records_exercise ON personal_records(plan_exercise_id);

-- =============================================
-- TEMPLATE WORKOUT SESSIONS TABLE
-- =============================================

-- Sessions for cardio and mobility workouts (linked to templates)
CREATE TABLE template_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  distance_value DECIMAL(10,2),
  distance_unit VARCHAR(20) CHECK (distance_unit IN ('miles', 'km', 'yards', 'meters')),
  notes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_sessions_user_id ON template_workout_sessions(user_id);
CREATE INDEX idx_template_sessions_template_id ON template_workout_sessions(template_id);

-- =============================================
-- UPDATE user_profiles if not exists (add schedule tracking)
-- =============================================

-- Add is_public column to workout_sessions for social feed
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- Workout templates are public (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view workout templates"
  ON workout_templates FOR SELECT
  TO authenticated
  USING (true);

-- User schedules policies
CREATE POLICY "Users can view their own schedules"
  ON user_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
  ON user_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON user_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON user_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Personal records policies
CREATE POLICY "Users can view their own PRs"
  ON personal_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PRs"
  ON personal_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PRs"
  ON personal_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PRs"
  ON personal_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Template workout sessions RLS
ALTER TABLE template_workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own template sessions"
  ON template_workout_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own template sessions"
  ON template_workout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own template sessions"
  ON template_workout_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own template sessions"
  ON template_workout_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- AUTO-UPDATE TRIGGERS
-- =============================================

-- Trigger for auto-updating updated_at on user_schedules
CREATE TRIGGER update_user_schedules_updated_at
  BEFORE UPDATE ON user_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED WORKOUT TEMPLATES
-- =============================================

-- Cardio templates
INSERT INTO workout_templates (name, type, category, description, icon, duration_minutes) VALUES
  ('Swimming', 'cardio', 'swim', 'Pool laps or open water swimming', 'waves', 30),
  ('Cycling', 'cardio', 'cycle', 'Outdoor cycling or stationary bike', 'bike', 45),
  ('Running', 'cardio', 'run', 'Outdoor running or treadmill', 'footprints', 30),
  ('Stair Stepper', 'cardio', 'stair_stepper', 'Stair machine cardio workout', 'stairs', 20);

-- Mobility templates
INSERT INTO workout_templates (name, type, category, description, icon, duration_minutes) VALUES
  ('Hip, Knee & Ankle Flow', 'mobility', 'hip_knee_ankle', 'Lower body joint mobility and flexibility', 'activity', 15),
  ('Spine Mobility', 'mobility', 'spine', 'Thoracic and lumbar spine mobility work', 'align-vertical-justify-center', 15),
  ('Upper Body Flow', 'mobility', 'shoulder_elbow_wrist', 'Shoulder, elbow, and wrist mobility', 'hand', 15),
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 15);
