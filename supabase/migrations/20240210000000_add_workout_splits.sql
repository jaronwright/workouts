-- Add selected_plan_id to user_profiles
ALTER TABLE user_profiles ADD COLUMN selected_plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL;

-- Default existing users to PPL plan
UPDATE user_profiles SET selected_plan_id = '00000000-0000-0000-0000-000000000001';

-- ============================================================
-- INSERT UPPER/LOWER WORKOUT PLAN
-- ============================================================

INSERT INTO workout_plans (id, name) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Upper/Lower');

-- Upper Day
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', 1, 'Upper (Chest, Back, Shoulders, Arms)');

-- Lower Day
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 2, 'Lower (Quads, Glutes, Hamstrings, Calves)');

-- ============================================================
-- UPPER DAY EXERCISES
-- ============================================================

-- Upper: Warm-up section
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000021', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000211', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, '3% incline, moderate pace', 1),
  ('00000000-0000-0000-0000-000000000211', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, 'Shoulders back, squeeze rear delts', 2),
  ('00000000-0000-0000-0000-000000000211', 'Arm Circles', 2, 10, 10, 'reps', true, 'Forward and backward', 3);

-- Upper: Main Lifting section
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000021', 'Main Lifting', 1, 50);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000212', 'Barbell Bench Press', 4, 6, 8, 'reps', false, '2-3 min rest, control descent, ribs down', 1),
  ('00000000-0000-0000-0000-000000000212', 'Bent Over Barbell Row', 4, 8, 10, 'reps', false, '2 min rest, squeeze shoulder blades', 2),
  ('00000000-0000-0000-0000-000000000212', 'Overhead Press', 3, 8, 10, 'reps', false, '90 sec rest, brace core, full lockout', 3),
  ('00000000-0000-0000-0000-000000000212', 'Lat Pulldown', 3, 10, 12, 'reps', false, '90 sec rest, pull to chest, squeeze lats', 4),
  ('00000000-0000-0000-0000-000000000212', 'Lateral Raises', 3, 12, 15, 'reps', false, '60 sec rest, slight lean forward', 5),
  ('00000000-0000-0000-0000-000000000212', 'EZ Bar Curl', 3, 10, 12, 'reps', false, '60 sec rest, control the negative', 6),
  ('00000000-0000-0000-0000-000000000212', 'Tricep Pushdown', 3, 12, 15, 'reps', false, '60 sec rest, elbows pinned to sides', 7),
  ('00000000-0000-0000-0000-000000000212', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead, external rotate', 8);

-- Upper: Abs/Core section
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000021', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000213', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Control the swing, curl pelvis up', 1),
  ('00000000-0000-0000-0000-000000000213', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 2),
  ('00000000-0000-0000-0000-000000000213', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, protect low back', 3);

-- ============================================================
-- LOWER DAY EXERCISES
-- ============================================================

-- Lower: Warm-up section
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000022', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000221', 'Bike or Stair Stepper', NULL, 5, 5, 'minutes', false, 'Easy pace, blood flowing', 1),
  ('00000000-0000-0000-0000-000000000221', 'Bodyweight Squats', 2, 15, 15, 'reps', false, 'Controlled depth, activate legs', 2),
  ('00000000-0000-0000-0000-000000000221', 'Banded Lateral Walks', 2, 10, 10, 'steps', true, 'Glute med activation', 3),
  ('00000000-0000-0000-0000-000000000221', 'Hip Circles', 2, 10, 10, 'reps', true, 'Open up hip joints, both directions', 4);

-- Lower: Main Lifting section
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000222', '00000000-0000-0000-0000-000000000022', 'Main Lifting', 1, 50);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000222', 'Leg Press', 4, 10, 12, 'reps', false, '2 min rest, controlled, don''t lock knees', 1),
  ('00000000-0000-0000-0000-000000000222', 'Hip Thrust', 4, 10, 12, 'reps', false, '2 min rest, pause and squeeze at top', 2),
  ('00000000-0000-0000-0000-000000000222', 'RDL', 3, 10, 12, 'reps', false, '90 sec rest, hinge at hips, feel hamstrings', 3),
  ('00000000-0000-0000-0000-000000000222', 'Leg Extension', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at top, knee-friendly weight', 4),
  ('00000000-0000-0000-0000-000000000222', 'Leg Abduction', 3, 15, 15, 'reps', false, '60 sec rest, controlled, squeeze glutes', 5),
  ('00000000-0000-0000-0000-000000000222', 'Bulgarian Split Squats', 3, 10, 10, 'reps', true, '90 sec rest, upright torso, depth focus', 6),
  ('00000000-0000-0000-0000-000000000222', 'Leg Cable Kickback', 3, 12, 12, 'reps', true, '60 sec rest, squeeze glute at top', 7),
  ('00000000-0000-0000-0000-000000000222', 'Seated Calf Raises', 4, 15, 20, 'reps', false, '60 sec rest, full stretch at bottom', 8);

-- Lower: Abs/Core section
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000223', '00000000-0000-0000-0000-000000000022', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000223', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Controlled, no swinging, curl pelvis', 1),
  ('00000000-0000-0000-0000-000000000223', 'Reverse Crunches', 3, 15, 15, 'reps', false, 'Curl hips off floor, no momentum', 2),
  ('00000000-0000-0000-0000-000000000223', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, low back neutral', 3);
