-- Workout Plan Seed Data
-- Generated from plan.csv
-- Run this AFTER migration.sql

-- Insert the workout plan
INSERT INTO workout_plans (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Push/Pull/Legs',
  '3-day split targeting all major muscle groups with progressive overload'
);

-- =============================================
-- DAY 1: PUSH (Chest, Shoulders, Triceps)
-- =============================================

INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  1,
  'PUSH (Chest, Shoulders, Triceps)'
);

-- Day 1 Sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000011', 'Warm-up', 10, 1),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000011', 'Main Lifting', 45, 2),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000011', 'Abs/Core', 10, 3);

-- Day 1 Warm-up Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0001-0001-000000000001', '00000000-0000-0000-0001-000000000001', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, '3% incline, moderate pace', 1),
('00000000-0000-0001-0001-000000000002', '00000000-0000-0000-0001-000000000001', 'Push-Ups', 2, 15, 20, 'reps', false, 'Full range, controlled', 2),
('00000000-0000-0001-0001-000000000003', '00000000-0000-0000-0001-000000000001', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, 'Shoulders back, squeeze rear delts', 3),
('00000000-0000-0001-0001-000000000004', '00000000-0000-0000-0001-000000000001', 'Band Shoulder Dislocates', 2, 10, 10, 'reps', false, 'Slow and controlled, wide grip', 4);

-- Day 1 Main Lifting Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0001-0002-000000000001', '00000000-0000-0000-0001-000000000002', 'Barbell Bench Press', 4, 6, 8, 'reps', false, '2-3 min rest, control descent, ribs down', 1),
('00000000-0000-0001-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Incline DB Press', 3, 8, 10, 'reps', false, '90 sec rest, stretch at bottom', 2),
('00000000-0000-0001-0002-000000000003', '00000000-0000-0000-0001-000000000002', 'Overhead DB Extension', 3, 12, 12, 'reps', false, '60 sec rest, stretch at bottom', 3),
('00000000-0000-0001-0002-000000000004', '00000000-0000-0000-0001-000000000002', 'Weighted Dips', 3, 8, 10, 'reps', false, '90 sec rest, lean forward for chest', 4),
('00000000-0000-0001-0002-000000000005', '00000000-0000-0000-0001-000000000002', 'Cable Fly', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at peak', 5),
('00000000-0000-0001-0002-000000000006', '00000000-0000-0000-0001-000000000002', 'Overhead Rope Extension', 3, 12, 15, 'reps', false, '60 sec rest, full stretch at bottom', 6);

-- Day 1 Abs/Core Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0001-0003-000000000001', '00000000-0000-0000-0001-000000000003', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Control the swing, curl pelvis up', 1),
('00000000-0000-0001-0003-000000000002', '00000000-0000-0000-0001-000000000003', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 2),
('00000000-0000-0001-0003-000000000003', '00000000-0000-0000-0001-000000000003', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, protect low back', 3);

-- =============================================
-- DAY 2: PULL (Back, Biceps, Rear Delts)
-- =============================================

INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  2,
  'PULL (Back, Biceps, Rear Delts)'
);

-- Day 2 Sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000012', 'Warm-up', 10, 1),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000012', 'Main Lifting', 45, 2),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000012', 'Abs/Core', 10, 3);

-- Day 2 Warm-up Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0002-0001-000000000001', '00000000-0000-0000-0002-000000000001', 'Rowing Machine', NULL, 5, 5, 'minutes', false, 'Moderate pace, feel lats engage', 1),
('00000000-0000-0002-0001-000000000002', '00000000-0000-0000-0002-000000000001', 'Dead Hangs', 2, 30, 30, 'seconds', false, 'Relax shoulders, decompress spine', 2),
('00000000-0000-0002-0001-000000000003', '00000000-0000-0000-0002-000000000001', 'Scapular Pull-Ups', 2, 10, 10, 'reps', false, 'Depress and retract', 3),
('00000000-0000-0002-0001-000000000004', '00000000-0000-0000-0002-000000000001', 'Band Rows', 2, 15, 15, 'reps', false, 'Light, activate rhomboids', 4);

-- Day 2 Main Lifting Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0002-0002-000000000001', '00000000-0000-0000-0002-000000000002', 'Pull-Ups', 4, 10, 12, 'reps', false, '2-3 min rest, full hang to chin over', 1),
('00000000-0000-0002-0002-000000000002', '00000000-0000-0000-0002-000000000002', 'T-Bar Row', 4, 8, 10, 'reps', false, '2 min rest, chest supported if needed', 2),
('00000000-0000-0002-0002-000000000003', '00000000-0000-0000-0002-000000000002', 'Close Grip Lat Pulldown', 3, 10, 12, 'reps', false, '90 sec rest, pull to chest, squeeze lats', 3),
('00000000-0000-0002-0002-000000000004', '00000000-0000-0000-0002-000000000002', 'Single-Arm Cable Row', 3, 12, 12, 'reps', true, '60 sec rest, pull straight back', 4),
('00000000-0000-0002-0002-000000000005', '00000000-0000-0000-0002-000000000002', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead', 5),
('00000000-0000-0002-0002-000000000006', '00000000-0000-0000-0002-000000000002', 'EZ Bar Curl', 3, 10, 10, 'reps', false, '90 sec rest, control eccentric', 6),
('00000000-0000-0002-0002-000000000007', '00000000-0000-0000-0002-000000000002', 'Hammer Curls', 3, 12, 12, 'reps', false, '60 sec rest, no swinging', 7);

-- Day 2 Abs/Core Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0002-0003-000000000001', '00000000-0000-0000-0002-000000000003', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Controlled, curl pelvis up at top', 1),
('00000000-0000-0002-0003-000000000002', '00000000-0000-0000-0002-000000000003', 'Reverse Crunches', 3, 15, 15, 'reps', false, 'Curl hips off floor, no momentum', 2),
('00000000-0000-0002-0003-000000000003', '00000000-0000-0000-0002-000000000003', 'Ab Wheel Rollouts', 3, 10, 12, 'reps', false, 'From knees, brace core, protect low back', 3);

-- =============================================
-- DAY 3: LEGS (Quads, Glutes, Hamstrings, Calves)
-- =============================================

INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  3,
  'LEGS (Quads, Glutes, Hamstrings, Calves)'
);

-- Day 3 Sections
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000013', 'Warm-up', 10, 1),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000013', 'Main Lifting', 45, 2),
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000013', 'Abs/Core', 10, 3);

-- Day 3 Warm-up Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0003-0001-000000000001', '00000000-0000-0000-0003-000000000001', 'Bike or Stair Stepper', NULL, 5, 5, 'minutes', false, 'Easy pace, blood flowing', 1),
('00000000-0000-0003-0001-000000000002', '00000000-0000-0000-0003-000000000001', 'Air Squats', 2, 20, 20, 'reps', false, 'Controlled depth, activate legs', 2),
('00000000-0000-0003-0001-000000000003', '00000000-0000-0000-0003-000000000001', 'Zombie Walks', 2, 10, 10, 'reps', true, 'Straight leg kicks, feel hamstring stretch', 3),
('00000000-0000-0003-0001-000000000004', '00000000-0000-0000-0003-000000000001', 'Banded Lateral Walks', 2, 10, 10, 'steps', true, 'Glute med activation', 4),
('00000000-0000-0003-0001-000000000005', '00000000-0000-0000-0003-000000000001', 'Deep Squat Hold', NULL, 2, 2, 'minutes', false, 'Sink low, pry knees out, breathe', 5);

-- Day 3 Main Lifting Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0003-0002-000000000001', '00000000-0000-0000-0003-000000000002', 'Hip Thrusts', 4, 10, 12, 'reps', false, '2 min rest, pause and squeeze at top', 1),
('00000000-0000-0003-0002-000000000002', '00000000-0000-0000-0003-000000000002', 'Goblet Squat', 4, 10, 12, 'reps', false, '2 min rest, depth focus, upright torso', 2),
('00000000-0000-0003-0002-000000000003', '00000000-0000-0000-0003-000000000002', 'Leg Press', 3, 12, 15, 'reps', false, '90 sec rest, controlled, don''t lock knees', 3),
('00000000-0000-0003-0002-000000000004', '00000000-0000-0000-0003-000000000002', 'Leg Extension', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at top, knee-friendly weight', 4),
('00000000-0000-0003-0002-000000000005', '00000000-0000-0000-0003-000000000002', 'Lying Leg Curl', 3, 12, 15, 'reps', false, '60 sec rest, control the negative', 5),
('00000000-0000-0003-0002-000000000006', '00000000-0000-0000-0003-000000000002', 'Hip Abductor Machine', 3, 15, 15, 'reps', false, '60 sec rest, squeeze at top', 6),
('00000000-0000-0003-0002-000000000007', '00000000-0000-0000-0003-000000000002', 'Walking Lunges (Light)', 3, 10, 10, 'reps', true, 'Light DBs or bodyweight, short steps, upright torso', 7),
('00000000-0000-0003-0002-000000000008', '00000000-0000-0000-0003-000000000002', 'Seated Calf Raises', 4, 15, 20, 'reps', false, '45 sec rest, pause at stretch', 8);

-- Day 3 Abs/Core Exercises
INSERT INTO plan_exercises (id, section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0003-0003-000000000001', '00000000-0000-0000-0003-000000000003', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Controlled, no swinging, curl pelvis', 1),
('00000000-0000-0003-0003-000000000002', '00000000-0000-0000-0003-000000000003', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 2),
('00000000-0000-0003-0003-000000000003', '00000000-0000-0000-0003-000000000003', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, low back neutral', 3);
