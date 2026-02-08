-- Migration: Add exercise-based mobility workouts
-- Links mobility templates to workout_days so they can use the existing Workout page
-- with ExerciseCard components instead of just a timer.

-- Step 1: Add workout_day_id FK to workout_templates
ALTER TABLE workout_templates
  ADD COLUMN IF NOT EXISTS workout_day_id UUID REFERENCES workout_days(id) ON DELETE SET NULL;

-- Step 2: Create Mobility workout plan
INSERT INTO workout_plans (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Mobility',
  'Structured mobility routines with exercises, sets, and reps'
);

-- Step 3: Create 4 workout days for the Mobility plan

-- Day 1: Core Stability (ab workout for injury prevention)
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000003',
  1,
  'Core Stability'
);

-- Day 2: Hip, Knee & Ankle Flow
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000003',
  2,
  'Hip, Knee & Ankle Flow'
);

-- Day 3: Spine Mobility
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000033',
  '00000000-0000-0000-0000-000000000003',
  3,
  'Spine Mobility'
);

-- Day 4: Upper Body Flow
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000034',
  '00000000-0000-0000-0000-000000000003',
  4,
  'Upper Body Flow'
);

-- Step 4: Create "Main" sections for each day (15 min each)

-- Core Stability - Main section
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000310',
  '00000000-0000-0000-0000-000000000031',
  'Main',
  15,
  1
);

-- Hip, Knee & Ankle Flow - Main section
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000320',
  '00000000-0000-0000-0000-000000000032',
  'Main',
  15,
  1
);

-- Spine Mobility - Main section
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000330',
  '00000000-0000-0000-0000-000000000033',
  'Main',
  15,
  1
);

-- Upper Body Flow - Main section
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000340',
  '00000000-0000-0000-0000-000000000034',
  'Main',
  15,
  1
);

-- Step 5: Insert exercises for each section

-- ============================================
-- CORE STABILITY (Day 1)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000310', 'Dead Bug', 3, 10, NULL, 'reps', true,
   'Anti-extension, low back pressed to floor', 1),
  ('00000000-0000-0000-0000-000000000310', 'Pallof Press Hold', 3, 20, NULL, 'seconds', true,
   'Anti-rotation, resist rotation', 2),
  ('00000000-0000-0000-0000-000000000310', 'Hanging Knee Raise', 3, 12, NULL, 'reps', false,
   'Core flexion, curl pelvis up', 3),
  ('00000000-0000-0000-0000-000000000310', 'Side Plank', 2, 30, NULL, 'seconds', true,
   'Lateral stability, straight line', 4);

-- ============================================
-- HIP, KNEE & ANKLE FLOW (Day 2)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000320', '90/90 Hip Switches', 2, 8, NULL, 'reps', true,
   'Hip internal/external rotation', 1),
  ('00000000-0000-0000-0000-000000000320', 'Deep Squat Hold', 3, 30, NULL, 'seconds', false,
   'Hip/knee/ankle, pry knees with elbows', 2),
  ('00000000-0000-0000-0000-000000000320', 'Cossack Squat', 2, 8, NULL, 'reps', true,
   'Lateral hip mobility + knee flexion', 3),
  ('00000000-0000-0000-0000-000000000320', 'Ankle CARs', 2, 8, NULL, 'reps', true,
   'Controlled articular rotations', 4);

-- ============================================
-- SPINE MOBILITY (Day 3)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000330', 'Cat-Cow', 2, 10, NULL, 'reps', false,
   'Spinal flexion/extension', 1),
  ('00000000-0000-0000-0000-000000000330', 'Thoracic Rotations', 2, 8, NULL, 'reps', true,
   'Quadruped, hand behind head, rotate up', 2),
  ('00000000-0000-0000-0000-000000000330', 'Jefferson Curl', 2, 8, NULL, 'reps', false,
   'Segmental spinal flexion, bodyweight only', 3),
  ('00000000-0000-0000-0000-000000000330', 'Prone Scorpion', 2, 8, NULL, 'reps', true,
   'Thoracic extension + rotation', 4);

-- ============================================
-- UPPER BODY FLOW (Day 4)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000340', 'Shoulder CARs', 2, 5, NULL, 'reps', true,
   'Full shoulder ROM, slow circles', 1),
  ('00000000-0000-0000-0000-000000000340', 'Wall Slides', 2, 10, NULL, 'reps', false,
   'Shoulder flexion + scapular upward rotation', 2),
  ('00000000-0000-0000-0000-000000000340', 'Thread the Needle', 2, 8, NULL, 'reps', true,
   'T-spine rotation + shoulder mobility', 3),
  ('00000000-0000-0000-0000-000000000340', 'Wrist CARs', 2, 5, NULL, 'reps', true,
   'Full wrist circles both directions', 4);

-- Step 6: Link existing mobility templates to their workout days
-- Templates were inserted with auto-generated UUIDs, so we look up by category
UPDATE workout_templates
SET workout_day_id = '00000000-0000-0000-0000-000000000031'
WHERE type = 'mobility' AND category = 'core';

UPDATE workout_templates
SET workout_day_id = '00000000-0000-0000-0000-000000000032'
WHERE type = 'mobility' AND category = 'hip_knee_ankle';

UPDATE workout_templates
SET workout_day_id = '00000000-0000-0000-0000-000000000033'
WHERE type = 'mobility' AND category = 'spine';

UPDATE workout_templates
SET workout_day_id = '00000000-0000-0000-0000-000000000034'
WHERE type = 'mobility' AND category = 'shoulder_elbow_wrist';
