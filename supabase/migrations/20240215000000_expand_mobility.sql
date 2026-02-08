-- Migration: Expand mobility workouts to 6 types × 4 duration variants (24 total)
-- Replaces the original 4 mobility templates with 24 duration-specific variants

-- Step 1: Remove old mobility data (in correct FK order)
DELETE FROM plan_exercises WHERE section_id IN (
  SELECT id FROM exercise_sections WHERE workout_day_id IN (
    SELECT id FROM workout_days WHERE plan_id = '00000000-0000-0000-0000-000000000003'
  )
);
DELETE FROM exercise_sections WHERE workout_day_id IN (
  SELECT id FROM workout_days WHERE plan_id = '00000000-0000-0000-0000-000000000003'
);
DELETE FROM workout_days WHERE plan_id = '00000000-0000-0000-0000-000000000003';
DELETE FROM workout_templates WHERE type = 'mobility';

-- Step 2: Create 24 workout days (6 types × 4 durations)

-- Core Stability variants
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000003', 1, 'Core Stability — 15 min'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000003', 2, 'Core Stability — 30 min'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 3, 'Core Stability — 45 min'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000003', 4, 'Core Stability — 60 min');

-- Hip, Knee & Ankle Flow variants
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000003', 5, 'Hip, Knee & Ankle Flow — 15 min'),
  ('00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000003', 6, 'Hip, Knee & Ankle Flow — 30 min'),
  ('00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000003', 7, 'Hip, Knee & Ankle Flow — 45 min'),
  ('00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000003', 8, 'Hip, Knee & Ankle Flow — 60 min');

-- Spine Mobility variants
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000121', '00000000-0000-0000-0000-000000000003', 9, 'Spine Mobility — 15 min'),
  ('00000000-0000-0000-0000-000000000122', '00000000-0000-0000-0000-000000000003', 10, 'Spine Mobility — 30 min'),
  ('00000000-0000-0000-0000-000000000123', '00000000-0000-0000-0000-000000000003', 11, 'Spine Mobility — 45 min'),
  ('00000000-0000-0000-0000-000000000124', '00000000-0000-0000-0000-000000000003', 12, 'Spine Mobility — 60 min');

-- Upper Body Flow variants
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000003', 13, 'Upper Body Flow — 15 min'),
  ('00000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-000000000003', 14, 'Upper Body Flow — 30 min'),
  ('00000000-0000-0000-0000-000000000133', '00000000-0000-0000-0000-000000000003', 15, 'Upper Body Flow — 45 min'),
  ('00000000-0000-0000-0000-000000000134', '00000000-0000-0000-0000-000000000003', 16, 'Upper Body Flow — 60 min');

-- Full Body Recovery Flow variants
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000141', '00000000-0000-0000-0000-000000000003', 17, 'Full Body Recovery Flow — 15 min'),
  ('00000000-0000-0000-0000-000000000142', '00000000-0000-0000-0000-000000000003', 18, 'Full Body Recovery Flow — 30 min'),
  ('00000000-0000-0000-0000-000000000143', '00000000-0000-0000-0000-000000000003', 19, 'Full Body Recovery Flow — 45 min'),
  ('00000000-0000-0000-0000-000000000144', '00000000-0000-0000-0000-000000000003', 20, 'Full Body Recovery Flow — 60 min');

-- Shoulder & Rotator Cuff Prehab variants
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000151', '00000000-0000-0000-0000-000000000003', 21, 'Shoulder & Rotator Cuff Prehab — 15 min'),
  ('00000000-0000-0000-0000-000000000152', '00000000-0000-0000-0000-000000000003', 22, 'Shoulder & Rotator Cuff Prehab — 30 min'),
  ('00000000-0000-0000-0000-000000000153', '00000000-0000-0000-0000-000000000003', 23, 'Shoulder & Rotator Cuff Prehab — 45 min'),
  ('00000000-0000-0000-0000-000000000154', '00000000-0000-0000-0000-000000000003', 24, 'Shoulder & Rotator Cuff Prehab — 60 min');

-- Step 3: Create exercise sections (one "Main" section per workout day)

-- Core Stability sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000101', '00000000-0000-0000-0000-000000000101', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000102', '00000000-0000-0000-0000-000000000102', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000103', '00000000-0000-0000-0000-000000000103', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000104', '00000000-0000-0000-0000-000000000104', 'Main', 60, 1);

-- Hip, Knee & Ankle Flow sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000111', '00000000-0000-0000-0000-000000000111', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000112', '00000000-0000-0000-0000-000000000112', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000113', '00000000-0000-0000-0000-000000000113', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000114', '00000000-0000-0000-0000-000000000114', 'Main', 60, 1);

-- Spine Mobility sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000121', '00000000-0000-0000-0000-000000000121', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000122', '00000000-0000-0000-0000-000000000122', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000123', '00000000-0000-0000-0000-000000000123', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000124', '00000000-0000-0000-0000-000000000124', 'Main', 60, 1);

-- Upper Body Flow sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000131', '00000000-0000-0000-0000-000000000131', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000132', '00000000-0000-0000-0000-000000000132', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000133', '00000000-0000-0000-0000-000000000133', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000134', '00000000-0000-0000-0000-000000000134', 'Main', 60, 1);

-- Full Body Recovery Flow sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000141', '00000000-0000-0000-0000-000000000141', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000142', '00000000-0000-0000-0000-000000000142', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000143', '00000000-0000-0000-0000-000000000143', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000144', '00000000-0000-0000-0000-000000000144', 'Main', 60, 1);

-- Shoulder & Rotator Cuff Prehab sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000151', '00000000-0000-0000-0000-000000000151', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000152', '00000000-0000-0000-0000-000000000152', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000153', '00000000-0000-0000-0000-000000000153', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000154', '00000000-0000-0000-0000-000000000154', 'Main', 60, 1);

-- Step 4: Insert exercises for all variants

-- ============================================
-- CORE STABILITY — 15 min (4 exercises)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000101', 'Dead Bug', 3, 10, NULL, 'reps', true, 'Anti-extension, low back pressed to floor', 1),
  ('00000000-0000-0000-0001-000000000101', 'Pallof Press Hold', 3, 20, NULL, 'seconds', true, 'Anti-rotation, resist rotation', 2),
  ('00000000-0000-0000-0001-000000000101', 'Hanging Knee Raise', 3, 12, NULL, 'reps', false, 'Core flexion, curl pelvis up', 3),
  ('00000000-0000-0000-0001-000000000101', 'Side Plank', 2, 30, NULL, 'seconds', true, 'Lateral stability, straight line', 4);

-- CORE STABILITY — 30 min (7 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000102', 'Dead Bug', 3, 10, NULL, 'reps', true, 'Anti-extension, low back pressed to floor', 1),
  ('00000000-0000-0000-0001-000000000102', 'Pallof Press Hold', 3, 20, NULL, 'seconds', true, 'Anti-rotation, resist rotation', 2),
  ('00000000-0000-0000-0001-000000000102', 'Hanging Knee Raise', 3, 12, NULL, 'reps', false, 'Core flexion, curl pelvis up', 3),
  ('00000000-0000-0000-0001-000000000102', 'Side Plank', 2, 30, NULL, 'seconds', true, 'Lateral stability, straight line', 4),
  ('00000000-0000-0000-0001-000000000102', 'Bird Dog', 3, 10, NULL, 'reps', true, 'Contralateral stability, keep hips level', 5),
  ('00000000-0000-0000-0001-000000000102', 'Hollow Body Hold', 3, 30, NULL, 'seconds', false, 'Full anterior chain engagement, low back flat', 6),
  ('00000000-0000-0000-0001-000000000102', 'Plank with Shoulder Tap', 3, 10, NULL, 'reps', true, 'Anti-rotation under load, minimal hip shift', 7);

-- CORE STABILITY — 45 min (10 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000103', 'Dead Bug', 3, 10, NULL, 'reps', true, 'Anti-extension, low back pressed to floor', 1),
  ('00000000-0000-0000-0001-000000000103', 'Pallof Press Hold', 3, 20, NULL, 'seconds', true, 'Anti-rotation, resist rotation', 2),
  ('00000000-0000-0000-0001-000000000103', 'Hanging Knee Raise', 3, 12, NULL, 'reps', false, 'Core flexion, curl pelvis up', 3),
  ('00000000-0000-0000-0001-000000000103', 'Side Plank', 2, 30, NULL, 'seconds', true, 'Lateral stability, straight line', 4),
  ('00000000-0000-0000-0001-000000000103', 'Bird Dog', 3, 10, NULL, 'reps', true, 'Contralateral stability, keep hips level', 5),
  ('00000000-0000-0000-0001-000000000103', 'Hollow Body Hold', 3, 30, NULL, 'seconds', false, 'Full anterior chain engagement, low back flat', 6),
  ('00000000-0000-0000-0001-000000000103', 'Plank with Shoulder Tap', 3, 10, NULL, 'reps', true, 'Anti-rotation under load, minimal hip shift', 7),
  ('00000000-0000-0000-0001-000000000103', 'Ab Wheel Rollout', 3, 8, NULL, 'reps', false, 'From knees, full extension, brace hard', 8),
  ('00000000-0000-0000-0001-000000000103', 'Copenhagen Plank', 2, 20, NULL, 'seconds', true, 'Adductor and oblique stability', 9),
  ('00000000-0000-0000-0001-000000000103', 'Bear Crawl Hold', 3, 30, NULL, 'seconds', false, 'Knees 1 inch off ground, breathe, resist collapse', 10);

-- CORE STABILITY — 60 min (13 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000104', 'Dead Bug', 3, 10, NULL, 'reps', true, 'Anti-extension, low back pressed to floor', 1),
  ('00000000-0000-0000-0001-000000000104', 'Pallof Press Hold', 3, 20, NULL, 'seconds', true, 'Anti-rotation, resist rotation', 2),
  ('00000000-0000-0000-0001-000000000104', 'Hanging Knee Raise', 3, 12, NULL, 'reps', false, 'Core flexion, curl pelvis up', 3),
  ('00000000-0000-0000-0001-000000000104', 'Side Plank', 2, 30, NULL, 'seconds', true, 'Lateral stability, straight line', 4),
  ('00000000-0000-0000-0001-000000000104', 'Bird Dog', 3, 10, NULL, 'reps', true, 'Contralateral stability, keep hips level', 5),
  ('00000000-0000-0000-0001-000000000104', 'Hollow Body Hold', 3, 30, NULL, 'seconds', false, 'Full anterior chain engagement, low back flat', 6),
  ('00000000-0000-0000-0001-000000000104', 'Plank with Shoulder Tap', 3, 10, NULL, 'reps', true, 'Anti-rotation under load, minimal hip shift', 7),
  ('00000000-0000-0000-0001-000000000104', 'Ab Wheel Rollout', 3, 8, NULL, 'reps', false, 'From knees, full extension, brace hard', 8),
  ('00000000-0000-0000-0001-000000000104', 'Copenhagen Plank', 2, 20, NULL, 'seconds', true, 'Adductor and oblique stability', 9),
  ('00000000-0000-0000-0001-000000000104', 'Bear Crawl Hold', 3, 30, NULL, 'seconds', false, 'Knees 1 inch off ground, breathe, resist collapse', 10),
  ('00000000-0000-0000-0001-000000000104', 'Turkish Get-Up (Bodyweight)', 2, 3, NULL, 'reps', true, 'Full-body stabilization through every plane', 11),
  ('00000000-0000-0000-0001-000000000104', 'Stability Ball Stir the Pot', 3, 8, NULL, 'reps', false, 'Anti-extension with rotary challenge', 12),
  ('00000000-0000-0000-0001-000000000104', 'Banded Dead Bug', 3, 8, NULL, 'reps', true, 'Resisted anti-extension, maintain tension throughout', 13);

-- ============================================
-- HIP, KNEE & ANKLE FLOW — 15 min (4 exercises)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000111', '90/90 Hip Switches', 2, 8, NULL, 'reps', true, 'Hip internal/external rotation', 1),
  ('00000000-0000-0000-0001-000000000111', 'Deep Squat Hold', 3, 30, NULL, 'seconds', false, 'Hip/knee/ankle, pry knees with elbows', 2),
  ('00000000-0000-0000-0001-000000000111', 'Cossack Squat', 2, 8, NULL, 'reps', true, 'Lateral hip mobility + knee flexion', 3),
  ('00000000-0000-0000-0001-000000000111', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Controlled articular rotations', 4);

-- HIP, KNEE & ANKLE FLOW — 30 min (7 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000112', '90/90 Hip Switches', 2, 8, NULL, 'reps', true, 'Hip internal/external rotation', 1),
  ('00000000-0000-0000-0001-000000000112', 'Deep Squat Hold', 3, 30, NULL, 'seconds', false, 'Hip/knee/ankle, pry knees with elbows', 2),
  ('00000000-0000-0000-0001-000000000112', 'Cossack Squat', 2, 8, NULL, 'reps', true, 'Lateral hip mobility + knee flexion', 3),
  ('00000000-0000-0000-0001-000000000112', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Controlled articular rotations', 4),
  ('00000000-0000-0000-0001-000000000112', 'Pigeon Stretch', 2, 45, NULL, 'seconds', true, 'Hip external rotation and flexor lengthening', 5),
  ('00000000-0000-0000-0001-000000000112', 'Walking Knee Hugs', 2, 10, NULL, 'reps', true, 'Dynamic hip flexion and glute activation', 6),
  ('00000000-0000-0000-0001-000000000112', 'Lateral Lunge Hold', 2, 30, NULL, 'seconds', true, 'Adductor lengthening under load', 7);

-- HIP, KNEE & ANKLE FLOW — 45 min (10 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000113', '90/90 Hip Switches', 2, 8, NULL, 'reps', true, 'Hip internal/external rotation', 1),
  ('00000000-0000-0000-0001-000000000113', 'Deep Squat Hold', 3, 30, NULL, 'seconds', false, 'Hip/knee/ankle, pry knees with elbows', 2),
  ('00000000-0000-0000-0001-000000000113', 'Cossack Squat', 2, 8, NULL, 'reps', true, 'Lateral hip mobility + knee flexion', 3),
  ('00000000-0000-0000-0001-000000000113', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Controlled articular rotations', 4),
  ('00000000-0000-0000-0001-000000000113', 'Pigeon Stretch', 2, 45, NULL, 'seconds', true, 'Hip external rotation and flexor lengthening', 5),
  ('00000000-0000-0000-0001-000000000113', 'Walking Knee Hugs', 2, 10, NULL, 'reps', true, 'Dynamic hip flexion and glute activation', 6),
  ('00000000-0000-0000-0001-000000000113', 'Lateral Lunge Hold', 2, 30, NULL, 'seconds', true, 'Adductor lengthening under load', 7),
  ('00000000-0000-0000-0001-000000000113', 'Single Leg Glute Bridge', 3, 10, NULL, 'reps', true, 'Unilateral glute activation + hip stability', 8),
  ('00000000-0000-0000-0001-000000000113', 'Hip CARs (Standing)', 2, 5, NULL, 'reps', true, 'Full hip ROM, controlled articular rotations', 9),
  ('00000000-0000-0000-0001-000000000113', 'Shin Box Transitions', 2, 8, NULL, 'reps', true, 'Hip internal/external rotation with lift', 10);

-- HIP, KNEE & ANKLE FLOW — 60 min (13 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000114', '90/90 Hip Switches', 2, 8, NULL, 'reps', true, 'Hip internal/external rotation', 1),
  ('00000000-0000-0000-0001-000000000114', 'Deep Squat Hold', 3, 30, NULL, 'seconds', false, 'Hip/knee/ankle, pry knees with elbows', 2),
  ('00000000-0000-0000-0001-000000000114', 'Cossack Squat', 2, 8, NULL, 'reps', true, 'Lateral hip mobility + knee flexion', 3),
  ('00000000-0000-0000-0001-000000000114', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Controlled articular rotations', 4),
  ('00000000-0000-0000-0001-000000000114', 'Pigeon Stretch', 2, 45, NULL, 'seconds', true, 'Hip external rotation and flexor lengthening', 5),
  ('00000000-0000-0000-0001-000000000114', 'Walking Knee Hugs', 2, 10, NULL, 'reps', true, 'Dynamic hip flexion and glute activation', 6),
  ('00000000-0000-0000-0001-000000000114', 'Lateral Lunge Hold', 2, 30, NULL, 'seconds', true, 'Adductor lengthening under load', 7),
  ('00000000-0000-0000-0001-000000000114', 'Single Leg Glute Bridge', 3, 10, NULL, 'reps', true, 'Unilateral glute activation + hip stability', 8),
  ('00000000-0000-0000-0001-000000000114', 'Hip CARs (Standing)', 2, 5, NULL, 'reps', true, 'Full hip ROM, controlled articular rotations', 9),
  ('00000000-0000-0000-0001-000000000114', 'Shin Box Transitions', 2, 8, NULL, 'reps', true, 'Hip internal/external rotation with lift', 10),
  ('00000000-0000-0000-0001-000000000114', 'Tactical Frog', 3, 30, NULL, 'seconds', false, 'Deep adductor stretch, rock forward and back', 11),
  ('00000000-0000-0000-0001-000000000114', 'Half Kneeling Hip Flexor Stretch', 2, 45, NULL, 'seconds', true, 'Psoas and rectus femoris lengthening', 12),
  ('00000000-0000-0000-0001-000000000114', 'Terminal Knee Extension', 2, 12, NULL, 'reps', true, 'Banded, full lockout, VMO activation', 13);

-- ============================================
-- SPINE MOBILITY — 15 min (4 exercises)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000121', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Spinal flexion/extension', 1),
  ('00000000-0000-0000-0001-000000000121', 'Thoracic Rotations', 2, 8, NULL, 'reps', true, 'Quadruped, hand behind head, rotate up', 2),
  ('00000000-0000-0000-0001-000000000121', 'Jefferson Curl', 2, 8, NULL, 'reps', false, 'Segmental spinal flexion, bodyweight only', 3),
  ('00000000-0000-0000-0001-000000000121', 'Prone Scorpion', 2, 8, NULL, 'reps', true, 'Thoracic extension + rotation', 4);

-- SPINE MOBILITY — 30 min (7 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000122', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Spinal flexion/extension', 1),
  ('00000000-0000-0000-0001-000000000122', 'Thoracic Rotations', 2, 8, NULL, 'reps', true, 'Quadruped, hand behind head, rotate up', 2),
  ('00000000-0000-0000-0001-000000000122', 'Jefferson Curl', 2, 8, NULL, 'reps', false, 'Segmental spinal flexion, bodyweight only', 3),
  ('00000000-0000-0000-0001-000000000122', 'Prone Scorpion', 2, 8, NULL, 'reps', true, 'Thoracic extension + rotation', 4),
  ('00000000-0000-0000-0001-000000000122', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation from quadruped', 5),
  ('00000000-0000-0000-0001-000000000122', 'Segmental Bridge', 3, 6, NULL, 'reps', false, 'Roll up one vertebra at a time, slow control', 6),
  ('00000000-0000-0000-0001-000000000122', 'Side-Lying Windmill', 2, 6, NULL, 'reps', true, 'Thoracic rotation with reach, open chest', 7);

-- SPINE MOBILITY — 45 min (10 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000123', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Spinal flexion/extension', 1),
  ('00000000-0000-0000-0001-000000000123', 'Thoracic Rotations', 2, 8, NULL, 'reps', true, 'Quadruped, hand behind head, rotate up', 2),
  ('00000000-0000-0000-0001-000000000123', 'Jefferson Curl', 2, 8, NULL, 'reps', false, 'Segmental spinal flexion, bodyweight only', 3),
  ('00000000-0000-0000-0001-000000000123', 'Prone Scorpion', 2, 8, NULL, 'reps', true, 'Thoracic extension + rotation', 4),
  ('00000000-0000-0000-0001-000000000123', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation from quadruped', 5),
  ('00000000-0000-0000-0001-000000000123', 'Segmental Bridge', 3, 6, NULL, 'reps', false, 'Roll up one vertebra at a time, slow control', 6),
  ('00000000-0000-0000-0001-000000000123', 'Side-Lying Windmill', 2, 6, NULL, 'reps', true, 'Thoracic rotation with reach, open chest', 7),
  ('00000000-0000-0000-0001-000000000123', 'Prone Press-Up', 2, 10, NULL, 'reps', false, 'Lumbar extension, keep hips on floor', 8),
  ('00000000-0000-0000-0001-000000000123', 'Seated Spinal Twist', 2, 30, NULL, 'seconds', true, 'Gentle end-range rotation hold', 9),
  ('00000000-0000-0000-0001-000000000123', 'Quadruped Rock Back', 3, 10, NULL, 'reps', false, 'Sit hips to heels, maintain spinal position', 10);

-- SPINE MOBILITY — 60 min (13 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000124', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Spinal flexion/extension', 1),
  ('00000000-0000-0000-0001-000000000124', 'Thoracic Rotations', 2, 8, NULL, 'reps', true, 'Quadruped, hand behind head, rotate up', 2),
  ('00000000-0000-0000-0001-000000000124', 'Jefferson Curl', 2, 8, NULL, 'reps', false, 'Segmental spinal flexion, bodyweight only', 3),
  ('00000000-0000-0000-0001-000000000124', 'Prone Scorpion', 2, 8, NULL, 'reps', true, 'Thoracic extension + rotation', 4),
  ('00000000-0000-0000-0001-000000000124', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation from quadruped', 5),
  ('00000000-0000-0000-0001-000000000124', 'Segmental Bridge', 3, 6, NULL, 'reps', false, 'Roll up one vertebra at a time, slow control', 6),
  ('00000000-0000-0000-0001-000000000124', 'Side-Lying Windmill', 2, 6, NULL, 'reps', true, 'Thoracic rotation with reach, open chest', 7),
  ('00000000-0000-0000-0001-000000000124', 'Prone Press-Up', 2, 10, NULL, 'reps', false, 'Lumbar extension, keep hips on floor', 8),
  ('00000000-0000-0000-0001-000000000124', 'Seated Spinal Twist', 2, 30, NULL, 'seconds', true, 'Gentle end-range rotation hold', 9),
  ('00000000-0000-0000-0001-000000000124', 'Quadruped Rock Back', 3, 10, NULL, 'reps', false, 'Sit hips to heels, maintain spinal position', 10),
  ('00000000-0000-0000-0001-000000000124', 'Foam Roller Thoracic Extension', 2, 10, NULL, 'reps', false, 'Roller under upper back, hands behind head', 11),
  ('00000000-0000-0000-0001-000000000124', 'Child''s Pose with Lateral Reach', 2, 30, NULL, 'seconds', true, 'Lat and QL stretch, breathe into side', 12),
  ('00000000-0000-0000-0001-000000000124', 'Supine Spinal Twist', 2, 45, NULL, 'seconds', true, 'Passive rotation, let gravity do the work', 13);

-- ============================================
-- UPPER BODY FLOW — 15 min (4 exercises)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000131', 'Shoulder CARs', 2, 5, NULL, 'reps', true, 'Full shoulder ROM, slow circles', 1),
  ('00000000-0000-0000-0001-000000000131', 'Wall Slides', 2, 10, NULL, 'reps', false, 'Shoulder flexion + scapular upward rotation', 2),
  ('00000000-0000-0000-0001-000000000131', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation + shoulder mobility', 3),
  ('00000000-0000-0000-0001-000000000131', 'Wrist CARs', 2, 5, NULL, 'reps', true, 'Full wrist circles both directions', 4);

-- UPPER BODY FLOW — 30 min (7 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000132', 'Shoulder CARs', 2, 5, NULL, 'reps', true, 'Full shoulder ROM, slow circles', 1),
  ('00000000-0000-0000-0001-000000000132', 'Wall Slides', 2, 10, NULL, 'reps', false, 'Shoulder flexion + scapular upward rotation', 2),
  ('00000000-0000-0000-0001-000000000132', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation + shoulder mobility', 3),
  ('00000000-0000-0000-0001-000000000132', 'Wrist CARs', 2, 5, NULL, 'reps', true, 'Full wrist circles both directions', 4),
  ('00000000-0000-0000-0001-000000000132', 'Band Pull-Aparts', 2, 15, NULL, 'reps', false, 'Rear delt and scapular retraction', 5),
  ('00000000-0000-0000-0001-000000000132', 'Prone Y-T-W Raises', 2, 8, NULL, 'reps', false, 'Scapular stabilizer activation in three planes', 6),
  ('00000000-0000-0000-0001-000000000132', 'Forearm Pronation/Supination', 2, 10, NULL, 'reps', true, 'Elbow and forearm mobility', 7);

-- UPPER BODY FLOW — 45 min (10 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000133', 'Shoulder CARs', 2, 5, NULL, 'reps', true, 'Full shoulder ROM, slow circles', 1),
  ('00000000-0000-0000-0001-000000000133', 'Wall Slides', 2, 10, NULL, 'reps', false, 'Shoulder flexion + scapular upward rotation', 2),
  ('00000000-0000-0000-0001-000000000133', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation + shoulder mobility', 3),
  ('00000000-0000-0000-0001-000000000133', 'Wrist CARs', 2, 5, NULL, 'reps', true, 'Full wrist circles both directions', 4),
  ('00000000-0000-0000-0001-000000000133', 'Band Pull-Aparts', 2, 15, NULL, 'reps', false, 'Rear delt and scapular retraction', 5),
  ('00000000-0000-0000-0001-000000000133', 'Prone Y-T-W Raises', 2, 8, NULL, 'reps', false, 'Scapular stabilizer activation in three planes', 6),
  ('00000000-0000-0000-0001-000000000133', 'Forearm Pronation/Supination', 2, 10, NULL, 'reps', true, 'Elbow and forearm mobility', 7),
  ('00000000-0000-0000-0001-000000000133', 'Sleeper Stretch', 2, 30, NULL, 'seconds', true, 'Internal rotation, posterior capsule', 8),
  ('00000000-0000-0000-0001-000000000133', 'Cross-Body Shoulder Stretch', 2, 30, NULL, 'seconds', true, 'Posterior deltoid and infraspinatus', 9),
  ('00000000-0000-0000-0001-000000000133', 'Wrist Flexor/Extensor Stretch', 2, 20, NULL, 'seconds', false, 'On all fours, fingers forward then backward', 10);

-- UPPER BODY FLOW — 60 min (13 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000134', 'Shoulder CARs', 2, 5, NULL, 'reps', true, 'Full shoulder ROM, slow circles', 1),
  ('00000000-0000-0000-0001-000000000134', 'Wall Slides', 2, 10, NULL, 'reps', false, 'Shoulder flexion + scapular upward rotation', 2),
  ('00000000-0000-0000-0001-000000000134', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'T-spine rotation + shoulder mobility', 3),
  ('00000000-0000-0000-0001-000000000134', 'Wrist CARs', 2, 5, NULL, 'reps', true, 'Full wrist circles both directions', 4),
  ('00000000-0000-0000-0001-000000000134', 'Band Pull-Aparts', 2, 15, NULL, 'reps', false, 'Rear delt and scapular retraction', 5),
  ('00000000-0000-0000-0001-000000000134', 'Prone Y-T-W Raises', 2, 8, NULL, 'reps', false, 'Scapular stabilizer activation in three planes', 6),
  ('00000000-0000-0000-0001-000000000134', 'Forearm Pronation/Supination', 2, 10, NULL, 'reps', true, 'Elbow and forearm mobility', 7),
  ('00000000-0000-0000-0001-000000000134', 'Sleeper Stretch', 2, 30, NULL, 'seconds', true, 'Internal rotation, posterior capsule', 8),
  ('00000000-0000-0000-0001-000000000134', 'Cross-Body Shoulder Stretch', 2, 30, NULL, 'seconds', true, 'Posterior deltoid and infraspinatus', 9),
  ('00000000-0000-0000-0001-000000000134', 'Wrist Flexor/Extensor Stretch', 2, 20, NULL, 'seconds', false, 'On all fours, fingers forward then backward', 10),
  ('00000000-0000-0000-0001-000000000134', 'Band Shoulder Dislocates', 2, 10, NULL, 'reps', false, 'Slow and controlled, wide grip', 11),
  ('00000000-0000-0000-0001-000000000134', 'Hanging Lat Stretch', 2, 30, NULL, 'seconds', false, 'Dead hang, let lats open up', 12),
  ('00000000-0000-0000-0001-000000000134', 'Elbow CARs', 2, 8, NULL, 'reps', true, 'Full elbow ROM circles, slow and controlled', 13);

-- ============================================
-- FULL BODY RECOVERY FLOW — 15 min (4 exercises)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000141', 'Child''s Pose', 2, 45, NULL, 'seconds', false, 'Arms extended, sink hips, breathe into back', 1),
  ('00000000-0000-0000-0001-000000000141', 'World''s Greatest Stretch', 2, 5, NULL, 'reps', true, 'Lunge, rotate, reach — opens everything', 2),
  ('00000000-0000-0000-0001-000000000141', 'Supine Figure-4 Stretch', 2, 30, NULL, 'seconds', true, 'Piriformis and deep glute release', 3),
  ('00000000-0000-0000-0001-000000000141', 'Standing Forward Fold', 2, 30, NULL, 'seconds', false, 'Hamstring and posterior chain release, relax neck', 4);

-- FULL BODY RECOVERY FLOW — 30 min (8 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000142', 'Child''s Pose', 2, 45, NULL, 'seconds', false, 'Arms extended, sink hips, breathe into back', 1),
  ('00000000-0000-0000-0001-000000000142', 'World''s Greatest Stretch', 2, 5, NULL, 'reps', true, 'Lunge, rotate, reach — opens everything', 2),
  ('00000000-0000-0000-0001-000000000142', 'Supine Figure-4 Stretch', 2, 30, NULL, 'seconds', true, 'Piriformis and deep glute release', 3),
  ('00000000-0000-0000-0001-000000000142', 'Standing Forward Fold', 2, 30, NULL, 'seconds', false, 'Hamstring and posterior chain release, relax neck', 4),
  ('00000000-0000-0000-0001-000000000142', 'Prone Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle, press hip into floor', 5),
  ('00000000-0000-0000-0001-000000000142', 'Supine Spinal Twist', 2, 30, NULL, 'seconds', true, 'Passive rotation, let gravity do the work', 6),
  ('00000000-0000-0000-0001-000000000142', 'Lat Stretch on Door Frame', 2, 30, NULL, 'seconds', true, 'Reach high, lean away, breathe into lat', 7),
  ('00000000-0000-0000-0001-000000000142', 'Neck Half Circles', 2, 5, NULL, 'reps', false, 'Slow controlled arcs, ear to shoulder to chest', 8);

-- FULL BODY RECOVERY FLOW — 45 min (11 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000143', 'Child''s Pose', 2, 45, NULL, 'seconds', false, 'Arms extended, sink hips, breathe into back', 1),
  ('00000000-0000-0000-0001-000000000143', 'World''s Greatest Stretch', 2, 5, NULL, 'reps', true, 'Lunge, rotate, reach — opens everything', 2),
  ('00000000-0000-0000-0001-000000000143', 'Supine Figure-4 Stretch', 2, 30, NULL, 'seconds', true, 'Piriformis and deep glute release', 3),
  ('00000000-0000-0000-0001-000000000143', 'Standing Forward Fold', 2, 30, NULL, 'seconds', false, 'Hamstring and posterior chain release, relax neck', 4),
  ('00000000-0000-0000-0001-000000000143', 'Prone Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle, press hip into floor', 5),
  ('00000000-0000-0000-0001-000000000143', 'Supine Spinal Twist', 2, 30, NULL, 'seconds', true, 'Passive rotation, let gravity do the work', 6),
  ('00000000-0000-0000-0001-000000000143', 'Lat Stretch on Door Frame', 2, 30, NULL, 'seconds', true, 'Reach high, lean away, breathe into lat', 7),
  ('00000000-0000-0000-0001-000000000143', 'Neck Half Circles', 2, 5, NULL, 'reps', false, 'Slow controlled arcs, ear to shoulder to chest', 8),
  ('00000000-0000-0000-0001-000000000143', 'Pigeon Stretch', 2, 45, NULL, 'seconds', true, 'Deep hip opener, fold forward over front leg', 9),
  ('00000000-0000-0000-0001-000000000143', 'Doorway Chest Stretch', 2, 30, NULL, 'seconds', true, 'Arm at 90 degrees, step through, open pec', 10),
  ('00000000-0000-0000-0001-000000000143', 'Seated Straddle Reach', 2, 30, NULL, 'seconds', false, 'Wide legs, walk hands forward, breathe', 11);

-- FULL BODY RECOVERY FLOW — 60 min (14 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000144', 'Child''s Pose', 2, 45, NULL, 'seconds', false, 'Arms extended, sink hips, breathe into back', 1),
  ('00000000-0000-0000-0001-000000000144', 'World''s Greatest Stretch', 2, 5, NULL, 'reps', true, 'Lunge, rotate, reach — opens everything', 2),
  ('00000000-0000-0000-0001-000000000144', 'Supine Figure-4 Stretch', 2, 30, NULL, 'seconds', true, 'Piriformis and deep glute release', 3),
  ('00000000-0000-0000-0001-000000000144', 'Standing Forward Fold', 2, 30, NULL, 'seconds', false, 'Hamstring and posterior chain release, relax neck', 4),
  ('00000000-0000-0000-0001-000000000144', 'Prone Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle, press hip into floor', 5),
  ('00000000-0000-0000-0001-000000000144', 'Supine Spinal Twist', 2, 30, NULL, 'seconds', true, 'Passive rotation, let gravity do the work', 6),
  ('00000000-0000-0000-0001-000000000144', 'Lat Stretch on Door Frame', 2, 30, NULL, 'seconds', true, 'Reach high, lean away, breathe into lat', 7),
  ('00000000-0000-0000-0001-000000000144', 'Neck Half Circles', 2, 5, NULL, 'reps', false, 'Slow controlled arcs, ear to shoulder to chest', 8),
  ('00000000-0000-0000-0001-000000000144', 'Pigeon Stretch', 2, 45, NULL, 'seconds', true, 'Deep hip opener, fold forward over front leg', 9),
  ('00000000-0000-0000-0001-000000000144', 'Doorway Chest Stretch', 2, 30, NULL, 'seconds', true, 'Arm at 90 degrees, step through, open pec', 10),
  ('00000000-0000-0000-0001-000000000144', 'Seated Straddle Reach', 2, 30, NULL, 'seconds', false, 'Wide legs, walk hands forward, breathe', 11),
  ('00000000-0000-0000-0001-000000000144', 'Foam Roll IT Band', 2, 45, NULL, 'seconds', true, 'Slow roll from hip to knee, pause on tender spots', 12),
  ('00000000-0000-0000-0001-000000000144', 'Foam Roll Upper Back', 2, 30, NULL, 'seconds', false, 'Roll between shoulder blades, arms across chest', 13),
  ('00000000-0000-0000-0001-000000000144', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Gentle spinal flexion/extension, wind down the session', 14);

-- ============================================
-- SHOULDER & ROTATOR CUFF PREHAB — 15 min (4 exercises)
-- ============================================
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000151', 'Band External Rotation', 3, 12, NULL, 'reps', true, 'Elbow at side, 90 degree angle, rotate out slowly', 1),
  ('00000000-0000-0000-0001-000000000151', 'Band Pull-Aparts', 3, 15, NULL, 'reps', false, 'Shoulder height, pinch shoulder blades', 2),
  ('00000000-0000-0000-0001-000000000151', 'Prone Y Raise', 2, 10, NULL, 'reps', false, 'Face down on bench, thumbs up, lift to Y', 3),
  ('00000000-0000-0000-0001-000000000151', 'Scapular Push-Ups', 2, 12, NULL, 'reps', false, 'Plank position, protract and retract shoulder blades', 4);

-- SHOULDER & ROTATOR CUFF PREHAB — 30 min (7 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000152', 'Band External Rotation', 3, 12, NULL, 'reps', true, 'Elbow at side, 90 degree angle, rotate out slowly', 1),
  ('00000000-0000-0000-0001-000000000152', 'Band Pull-Aparts', 3, 15, NULL, 'reps', false, 'Shoulder height, pinch shoulder blades', 2),
  ('00000000-0000-0000-0001-000000000152', 'Prone Y Raise', 2, 10, NULL, 'reps', false, 'Face down on bench, thumbs up, lift to Y', 3),
  ('00000000-0000-0000-0001-000000000152', 'Scapular Push-Ups', 2, 12, NULL, 'reps', false, 'Plank position, protract and retract shoulder blades', 4),
  ('00000000-0000-0000-0001-000000000152', 'Band Internal Rotation', 3, 12, NULL, 'reps', true, 'Same setup as external, rotate inward with control', 5),
  ('00000000-0000-0000-0001-000000000152', 'Side-Lying External Rotation', 2, 12, NULL, 'reps', true, 'Light DB, elbow on hip, rotate up', 6),
  ('00000000-0000-0000-0001-000000000152', 'Prone T Raise', 2, 10, NULL, 'reps', false, 'Face down, arms to sides, thumbs up, squeeze mid-back', 7);

-- SHOULDER & ROTATOR CUFF PREHAB — 45 min (10 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000153', 'Band External Rotation', 3, 12, NULL, 'reps', true, 'Elbow at side, 90 degree angle, rotate out slowly', 1),
  ('00000000-0000-0000-0001-000000000153', 'Band Pull-Aparts', 3, 15, NULL, 'reps', false, 'Shoulder height, pinch shoulder blades', 2),
  ('00000000-0000-0000-0001-000000000153', 'Prone Y Raise', 2, 10, NULL, 'reps', false, 'Face down on bench, thumbs up, lift to Y', 3),
  ('00000000-0000-0000-0001-000000000153', 'Scapular Push-Ups', 2, 12, NULL, 'reps', false, 'Plank position, protract and retract shoulder blades', 4),
  ('00000000-0000-0000-0001-000000000153', 'Band Internal Rotation', 3, 12, NULL, 'reps', true, 'Same setup as external, rotate inward with control', 5),
  ('00000000-0000-0000-0001-000000000153', 'Side-Lying External Rotation', 2, 12, NULL, 'reps', true, 'Light DB, elbow on hip, rotate up', 6),
  ('00000000-0000-0000-0001-000000000153', 'Prone T Raise', 2, 10, NULL, 'reps', false, 'Face down, arms to sides, thumbs up, squeeze mid-back', 7),
  ('00000000-0000-0000-0001-000000000153', 'Wall Slides', 2, 10, NULL, 'reps', false, 'Back against wall, arms overhead, maintain contact', 8),
  ('00000000-0000-0000-0001-000000000153', 'Face Pulls (Light Band)', 3, 15, NULL, 'reps', false, 'Pull to forehead, external rotate at end range', 9),
  ('00000000-0000-0000-0001-000000000153', 'Shoulder CARs', 2, 5, NULL, 'reps', true, 'Full ROM circles, slow and deliberate', 10);

-- SHOULDER & ROTATOR CUFF PREHAB — 60 min (13 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000154', 'Band External Rotation', 3, 12, NULL, 'reps', true, 'Elbow at side, 90 degree angle, rotate out slowly', 1),
  ('00000000-0000-0000-0001-000000000154', 'Band Pull-Aparts', 3, 15, NULL, 'reps', false, 'Shoulder height, pinch shoulder blades', 2),
  ('00000000-0000-0000-0001-000000000154', 'Prone Y Raise', 2, 10, NULL, 'reps', false, 'Face down on bench, thumbs up, lift to Y', 3),
  ('00000000-0000-0000-0001-000000000154', 'Scapular Push-Ups', 2, 12, NULL, 'reps', false, 'Plank position, protract and retract shoulder blades', 4),
  ('00000000-0000-0000-0001-000000000154', 'Band Internal Rotation', 3, 12, NULL, 'reps', true, 'Same setup as external, rotate inward with control', 5),
  ('00000000-0000-0000-0001-000000000154', 'Side-Lying External Rotation', 2, 12, NULL, 'reps', true, 'Light DB, elbow on hip, rotate up', 6),
  ('00000000-0000-0000-0001-000000000154', 'Prone T Raise', 2, 10, NULL, 'reps', false, 'Face down, arms to sides, thumbs up, squeeze mid-back', 7),
  ('00000000-0000-0000-0001-000000000154', 'Wall Slides', 2, 10, NULL, 'reps', false, 'Back against wall, arms overhead, maintain contact', 8),
  ('00000000-0000-0000-0001-000000000154', 'Face Pulls (Light Band)', 3, 15, NULL, 'reps', false, 'Pull to forehead, external rotate at end range', 9),
  ('00000000-0000-0000-0001-000000000154', 'Shoulder CARs', 2, 5, NULL, 'reps', true, 'Full ROM circles, slow and deliberate', 10),
  ('00000000-0000-0000-0001-000000000154', 'Band W Raise', 2, 10, NULL, 'reps', false, 'Pull band apart into W shape, squeeze rear delts', 11),
  ('00000000-0000-0000-0001-000000000154', 'Turkish Get-Up (Light)', 2, 3, NULL, 'reps', true, 'Full shoulder stabilization through all positions', 12),
  ('00000000-0000-0000-0001-000000000154', 'Sleeper Stretch', 2, 30, NULL, 'seconds', true, 'Side-lying, press forearm toward floor gently', 13);

-- Step 5: Insert 24 workout templates (one per type+duration)
INSERT INTO workout_templates (name, type, category, description, icon, duration_minutes, workout_day_id) VALUES
  -- Core Stability (4 durations)
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 15, '00000000-0000-0000-0000-000000000101'),
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 30, '00000000-0000-0000-0000-000000000102'),
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 45, '00000000-0000-0000-0000-000000000103'),
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 60, '00000000-0000-0000-0000-000000000104'),

  -- Hip, Knee & Ankle Flow (4 durations)
  ('Hip, Knee & Ankle Flow', 'mobility', 'hip_knee_ankle', 'Lower body joint mobility and flexibility', 'workflow', 15, '00000000-0000-0000-0000-000000000111'),
  ('Hip, Knee & Ankle Flow', 'mobility', 'hip_knee_ankle', 'Lower body joint mobility and flexibility', 'workflow', 30, '00000000-0000-0000-0000-000000000112'),
  ('Hip, Knee & Ankle Flow', 'mobility', 'hip_knee_ankle', 'Lower body joint mobility and flexibility', 'workflow', 45, '00000000-0000-0000-0000-000000000113'),
  ('Hip, Knee & Ankle Flow', 'mobility', 'hip_knee_ankle', 'Lower body joint mobility and flexibility', 'workflow', 60, '00000000-0000-0000-0000-000000000114'),

  -- Spine Mobility (4 durations)
  ('Spine Mobility', 'mobility', 'spine', 'Spinal flexion, extension, and rotation work', 'activity', 15, '00000000-0000-0000-0000-000000000121'),
  ('Spine Mobility', 'mobility', 'spine', 'Spinal flexion, extension, and rotation work', 'activity', 30, '00000000-0000-0000-0000-000000000122'),
  ('Spine Mobility', 'mobility', 'spine', 'Spinal flexion, extension, and rotation work', 'activity', 45, '00000000-0000-0000-0000-000000000123'),
  ('Spine Mobility', 'mobility', 'spine', 'Spinal flexion, extension, and rotation work', 'activity', 60, '00000000-0000-0000-0000-000000000124'),

  -- Upper Body Flow (4 durations)
  ('Upper Body Flow', 'mobility', 'shoulder_elbow_wrist', 'Shoulder, elbow, and wrist mobility', 'wind', 15, '00000000-0000-0000-0000-000000000131'),
  ('Upper Body Flow', 'mobility', 'shoulder_elbow_wrist', 'Shoulder, elbow, and wrist mobility', 'wind', 30, '00000000-0000-0000-0000-000000000132'),
  ('Upper Body Flow', 'mobility', 'shoulder_elbow_wrist', 'Shoulder, elbow, and wrist mobility', 'wind', 45, '00000000-0000-0000-0000-000000000133'),
  ('Upper Body Flow', 'mobility', 'shoulder_elbow_wrist', 'Shoulder, elbow, and wrist mobility', 'wind', 60, '00000000-0000-0000-0000-000000000134'),

  -- Full Body Recovery Flow (4 durations)
  ('Full Body Recovery', 'mobility', 'recovery', 'Full-body stretching and release work for rest days', 'heart', 15, '00000000-0000-0000-0000-000000000141'),
  ('Full Body Recovery', 'mobility', 'recovery', 'Full-body stretching and release work for rest days', 'heart', 30, '00000000-0000-0000-0000-000000000142'),
  ('Full Body Recovery', 'mobility', 'recovery', 'Full-body stretching and release work for rest days', 'heart', 45, '00000000-0000-0000-0000-000000000143'),
  ('Full Body Recovery', 'mobility', 'recovery', 'Full-body stretching and release work for rest days', 'heart', 60, '00000000-0000-0000-0000-000000000144'),

  -- Shoulder & Rotator Cuff Prehab (4 durations)
  ('Shoulder Prehab', 'mobility', 'shoulder_prehab', 'Targeted rotator cuff strengthening and scapular stability', 'shield', 15, '00000000-0000-0000-0000-000000000151'),
  ('Shoulder Prehab', 'mobility', 'shoulder_prehab', 'Targeted rotator cuff strengthening and scapular stability', 'shield', 30, '00000000-0000-0000-0000-000000000152'),
  ('Shoulder Prehab', 'mobility', 'shoulder_prehab', 'Targeted rotator cuff strengthening and scapular stability', 'shield', 45, '00000000-0000-0000-0000-000000000153'),
  ('Shoulder Prehab', 'mobility', 'shoulder_prehab', 'Targeted rotator cuff strengthening and scapular stability', 'shield', 60, '00000000-0000-0000-0000-000000000154');
