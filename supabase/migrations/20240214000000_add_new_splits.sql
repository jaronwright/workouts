-- New Workout Splits: Full Body, Bro Split, Arnold Split
-- Run this AFTER all previous migrations

-- =============================================
-- FULL BODY PLAN
-- =============================================

INSERT INTO workout_plans (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Full Body',
  'Train your entire body each session with 5 unique workouts. Pick 3 per week for balanced full-body stimulus.'
);

-- Full Body Day 1: Full Body A — Squat & Press Focus
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000004',
  1,
  'Full Body A'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0004-000000004101', '00000000-0000-0000-0000-000000000041', 'Warm-up', 10, 1),
('00000000-0000-0000-0004-000000004102', '00000000-0000-0000-0000-000000000041', 'Main Lifting', 45, 2),
('00000000-0000-0000-0004-000000004103', '00000000-0000-0000-0000-000000000041', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004101', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0004-000000004101', 'Air Squats', 2, 15, 15, 'reps', false, NULL, 2),
('00000000-0000-0000-0004-000000004101', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, NULL, 3),
('00000000-0000-0000-0004-000000004101', 'Arm Circles', 2, 10, 10, 'reps', true, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004102', 'Goblet Squat', 4, 8, 10, 'reps', false, NULL, 1),
('00000000-0000-0000-0004-000000004102', 'Barbell Bench Press', 4, 6, 8, 'reps', false, '2-3 min rest, control descent, ribs down', 2),
('00000000-0000-0000-0004-000000004102', 'Bent Over Barbell Row', 3, 8, 10, 'reps', false, '90 sec rest, squeeze shoulder blades', 3),
('00000000-0000-0000-0004-000000004102', 'Overhead Press', 3, 8, 10, 'reps', false, '90 sec rest, brace core, full lockout', 4),
('00000000-0000-0000-0004-000000004102', 'Leg Curl', 3, 12, 15, 'reps', false, '60 sec rest, control the negative', 5),
('00000000-0000-0000-0004-000000004102', 'Lateral Raises', 3, 12, 15, 'reps', false, '60 sec rest, slight lean forward', 6),
('00000000-0000-0000-0004-000000004102', 'EZ Bar Curl', 2, 10, 12, 'reps', false, '60 sec rest, control the negative', 7);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004103', 'Hanging Leg Raises', 3, 12, 12, 'reps', false, 'Control the swing, curl pelvis up', 1),
('00000000-0000-0000-0004-000000004103', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, protect low back', 2);

-- Full Body Day 2: Full Body B — Hinge & Pull Focus
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000004',
  2,
  'Full Body B'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0004-000000004201', '00000000-0000-0000-0000-000000000042', 'Warm-up', 10, 1),
('00000000-0000-0000-0004-000000004202', '00000000-0000-0000-0000-000000000042', 'Main Lifting', 45, 2),
('00000000-0000-0000-0004-000000004203', '00000000-0000-0000-0000-000000000042', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004201', 'Rowing Machine', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0004-000000004201', 'Dead Hangs', 2, 30, 30, 'seconds', false, NULL, 2),
('00000000-0000-0000-0004-000000004201', 'Zombie Walks', 2, 10, 10, 'reps', true, NULL, 3),
('00000000-0000-0000-0004-000000004201', 'Band Rows', 2, 15, 15, 'reps', false, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004202', 'RDL', 4, 8, 10, 'reps', false, '2 min rest, hinge at hips, feel hamstrings', 1),
('00000000-0000-0000-0004-000000004202', 'Pull-Ups', 4, 8, 12, 'reps', false, '2-3 min rest, full hang to chin over', 2),
('00000000-0000-0000-0004-000000004202', 'Incline DB Press', 3, 10, 12, 'reps', false, '90 sec rest, stretch at bottom', 3),
('00000000-0000-0000-0004-000000004202', 'Leg Press', 3, 12, 15, 'reps', false, '90 sec rest, controlled, don''t lock knees', 4),
('00000000-0000-0000-0004-000000004202', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead, external rotate', 5),
('00000000-0000-0000-0004-000000004202', 'Hip Abductor Machine', 3, 15, 15, 'reps', false, '60 sec rest, squeeze at top', 6),
('00000000-0000-0000-0004-000000004202', 'Hammer Curls', 2, 12, 12, 'reps', false, '60 sec rest, no swinging', 7);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004203', 'Ab Wheel Rollouts', 3, 10, 12, 'reps', false, 'From knees, brace core, protect low back', 1),
('00000000-0000-0000-0004-000000004203', 'Reverse Crunches', 3, 15, 15, 'reps', false, 'Curl hips off floor, no momentum', 2);

-- Full Body Day 3: Full Body C — Unilateral & Stability Focus
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000043',
  '00000000-0000-0000-0000-000000000004',
  3,
  'Full Body C'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0004-000000004301', '00000000-0000-0000-0000-000000000043', 'Warm-up', 10, 1),
('00000000-0000-0000-0004-000000004302', '00000000-0000-0000-0000-000000000043', 'Main Lifting', 45, 2),
('00000000-0000-0000-0004-000000004303', '00000000-0000-0000-0000-000000000043', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004301', 'Bike or Stair Stepper', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0004-000000004301', 'Banded Lateral Walks', 2, 10, 10, 'steps', true, NULL, 2),
('00000000-0000-0000-0004-000000004301', 'Push-Ups', 2, 12, 12, 'reps', false, NULL, 3),
('00000000-0000-0000-0004-000000004301', 'Hip Circles', 2, 10, 10, 'reps', true, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004302', 'Bulgarian Split Squats', 4, 10, 10, 'reps', true, '90 sec rest, upright torso, depth focus', 1),
('00000000-0000-0000-0004-000000004302', 'Single-Arm DB Row', 4, 10, 10, 'reps', true, '90 sec rest, brace on bench, squeeze lat', 2),
('00000000-0000-0000-0004-000000004302', 'DB Bench Press', 3, 10, 12, 'reps', false, '90 sec rest, equal push from both arms', 3),
('00000000-0000-0000-0004-000000004302', 'Single Leg RDL', 3, 10, 10, 'reps', true, '60 sec rest, hinge slow, balance challenge', 4),
('00000000-0000-0000-0004-000000004302', 'Cable Fly', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at peak', 5),
('00000000-0000-0000-0004-000000004302', 'Leg Extension', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at top', 6),
('00000000-0000-0000-0004-000000004302', 'Tricep Pushdown', 2, 12, 15, 'reps', false, '60 sec rest, elbows pinned to sides', 7);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004303', 'Pallof Press Hold', 3, 20, 20, 'seconds', true, 'Anti-rotation, resist rotation', 1),
('00000000-0000-0000-0004-000000004303', 'Dead Bug', 3, 10, 10, 'reps', true, 'Anti-extension, low back pressed to floor', 2);

-- Full Body Day 4: Full Body D — Strength Emphasis
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000044',
  '00000000-0000-0000-0000-000000000004',
  4,
  'Full Body D'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0004-000000004401', '00000000-0000-0000-0000-000000000044', 'Warm-up', 10, 1),
('00000000-0000-0000-0004-000000004402', '00000000-0000-0000-0000-000000000044', 'Main Lifting', 50, 2),
('00000000-0000-0000-0004-000000004403', '00000000-0000-0000-0000-000000000044', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004401', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0004-000000004401', 'Band Shoulder Dislocates', 2, 10, 10, 'reps', false, NULL, 2),
('00000000-0000-0000-0004-000000004401', 'Bodyweight Squats', 2, 15, 15, 'reps', false, NULL, 3),
('00000000-0000-0000-0004-000000004401', 'Scapular Pull-Ups', 2, 10, 10, 'reps', false, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004402', 'Barbell Back Squat', 4, 5, 6, 'reps', false, '3 min rest, brace core, hit depth', 1),
('00000000-0000-0000-0004-000000004402', 'Overhead Press', 4, 5, 6, 'reps', false, '3 min rest, strict, no leg drive', 2),
('00000000-0000-0000-0004-000000004402', 'Barbell Row', 4, 6, 8, 'reps', false, '2 min rest, pull to lower chest', 3),
('00000000-0000-0000-0004-000000004402', 'Hip Thrust', 3, 10, 12, 'reps', false, '90 sec rest, pause and squeeze at top', 4),
('00000000-0000-0000-0004-000000004402', 'Close Grip Lat Pulldown', 3, 10, 12, 'reps', false, '90 sec rest, pull to chest, squeeze lats', 5),
('00000000-0000-0000-0004-000000004402', 'Seated Calf Raises', 3, 15, 20, 'reps', false, '45 sec rest, pause at stretch', 6);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004403', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Controlled, curl pelvis up at top', 1),
('00000000-0000-0000-0004-000000004403', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 2);

-- Full Body Day 5: Full Body E — Pump & Volume Focus
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000045',
  '00000000-0000-0000-0000-000000000004',
  5,
  'Full Body E'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0004-000000004501', '00000000-0000-0000-0000-000000000045', 'Warm-up', 10, 1),
('00000000-0000-0000-0004-000000004502', '00000000-0000-0000-0000-000000000045', 'Main Lifting', 45, 2),
('00000000-0000-0000-0004-000000004503', '00000000-0000-0000-0000-000000000045', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004501', 'Rowing Machine', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0004-000000004501', 'Push-Ups', 2, 15, 20, 'reps', false, NULL, 2),
('00000000-0000-0000-0004-000000004501', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, NULL, 3),
('00000000-0000-0000-0004-000000004501', 'Deep Squat Hold', NULL, 2, 2, 'minutes', false, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004502', 'Leg Press', 4, 12, 15, 'reps', false, '90 sec rest, controlled, don''t lock knees', 1),
('00000000-0000-0000-0004-000000004502', 'Incline DB Press', 3, 12, 15, 'reps', false, '60 sec rest, stretch at bottom', 2),
('00000000-0000-0000-0004-000000004502', 'Cable Row', 3, 12, 15, 'reps', false, '60 sec rest, squeeze shoulder blades', 3),
('00000000-0000-0000-0004-000000004502', 'Walking Lunges', 3, 10, 10, 'reps', true, 'Light DBs or bodyweight, short steps', 4),
('00000000-0000-0000-0004-000000004502', 'Lateral Raises', 3, 15, 20, 'reps', false, '45 sec rest, light weight, chase the burn', 5),
('00000000-0000-0000-0004-000000004502', 'Lying Leg Curl', 3, 12, 15, 'reps', false, '60 sec rest, control the negative', 6),
('00000000-0000-0000-0004-000000004502', 'Cable Curl', 2, 15, 15, 'reps', false, '45 sec rest, constant tension', 7),
('00000000-0000-0000-0004-000000004502', 'Overhead Rope Extension', 2, 15, 15, 'reps', false, '45 sec rest, full stretch at bottom', 8);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0004-000000004503', 'Rope Pulldown Crunches', 3, 20, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 1),
('00000000-0000-0000-0004-000000004503', 'Side Plank', 2, 30, 30, 'seconds', true, 'Lateral stability, straight line', 2),
('00000000-0000-0000-0004-000000004503', 'Plank', 2, 45, 45, 'seconds', false, 'Squeeze glutes, brace core', 3);


-- =============================================
-- BRO SPLIT PLAN
-- =============================================

INSERT INTO workout_plans (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Bro Split',
  'Dedicated days for each muscle group with high volume. 5 days per week for maximum focus on individual body parts.'
);

-- Bro Split Day 1: Chest
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000005',
  1,
  'Chest'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0005-000000005101', '00000000-0000-0000-0000-000000000051', 'Warm-up', 10, 1),
('00000000-0000-0000-0005-000000005102', '00000000-0000-0000-0000-000000000051', 'Main Lifting', 45, 2),
('00000000-0000-0000-0005-000000005103', '00000000-0000-0000-0000-000000000051', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005101', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0005-000000005101', 'Push-Ups', 2, 15, 20, 'reps', false, 'Full range, controlled, feel the stretch', 2),
('00000000-0000-0000-0005-000000005101', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, 'Shoulders back, protect the joints', 3),
('00000000-0000-0000-0005-000000005101', 'Band Shoulder Dislocates', 2, 10, 10, 'reps', false, 'Slow and controlled, wide grip', 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005102', 'Barbell Bench Press', 4, 6, 8, 'reps', false, '2-3 min rest, control descent, ribs down', 1),
('00000000-0000-0000-0005-000000005102', 'Incline DB Press', 4, 8, 10, 'reps', false, '90 sec rest, stretch at bottom', 2),
('00000000-0000-0000-0005-000000005102', 'Weighted Dips', 3, 8, 10, 'reps', false, '90 sec rest, lean forward for chest', 3),
('00000000-0000-0000-0005-000000005102', 'Cable Fly', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at peak', 4),
('00000000-0000-0000-0005-000000005102', 'Pec Deck Machine', 3, 12, 15, 'reps', false, '60 sec rest, deep stretch, controlled squeeze', 5),
('00000000-0000-0000-0005-000000005102', 'Decline DB Press', 3, 10, 12, 'reps', false, '60 sec rest, focus on lower chest contraction', 6);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005103', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Control the swing, curl pelvis up', 1),
('00000000-0000-0000-0005-000000005103', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 2);

-- Bro Split Day 2: Back
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000052',
  '00000000-0000-0000-0000-000000000005',
  2,
  'Back'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0005-000000005201', '00000000-0000-0000-0000-000000000052', 'Warm-up', 10, 1),
('00000000-0000-0000-0005-000000005202', '00000000-0000-0000-0000-000000000052', 'Main Lifting', 45, 2),
('00000000-0000-0000-0005-000000005203', '00000000-0000-0000-0000-000000000052', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005201', 'Rowing Machine', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0005-000000005201', 'Dead Hangs', 2, 30, 30, 'seconds', false, NULL, 2),
('00000000-0000-0000-0005-000000005201', 'Scapular Pull-Ups', 2, 10, 10, 'reps', false, NULL, 3),
('00000000-0000-0000-0005-000000005201', 'Band Rows', 2, 15, 15, 'reps', false, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005202', 'Pull-Ups', 4, 8, 12, 'reps', false, '2-3 min rest, full hang to chin over', 1),
('00000000-0000-0000-0005-000000005202', 'T-Bar Row', 4, 8, 10, 'reps', false, '2 min rest, chest supported if needed', 2),
('00000000-0000-0000-0005-000000005202', 'Close Grip Lat Pulldown', 3, 10, 12, 'reps', false, '90 sec rest, pull to chest, squeeze lats', 3),
('00000000-0000-0000-0005-000000005202', 'Single-Arm Cable Row', 3, 12, 12, 'reps', true, '60 sec rest, pull straight back', 4),
('00000000-0000-0000-0005-000000005202', 'Straight Arm Pulldown', 3, 12, 15, 'reps', false, '60 sec rest, feel lats stretch and contract', 5),
('00000000-0000-0000-0005-000000005202', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead', 6),
('00000000-0000-0000-0005-000000005202', 'DB Shrugs', 3, 12, 15, 'reps', false, '60 sec rest, hold at top for 2 sec', 7);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005203', 'Ab Wheel Rollouts', 3, 10, 12, 'reps', false, 'From knees, brace core, protect low back', 1),
('00000000-0000-0000-0005-000000005203', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core', 2);

-- Bro Split Day 3: Legs
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000053',
  '00000000-0000-0000-0000-000000000005',
  3,
  'Legs'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0005-000000005301', '00000000-0000-0000-0000-000000000053', 'Warm-up', 10, 1),
('00000000-0000-0000-0005-000000005302', '00000000-0000-0000-0000-000000000053', 'Main Lifting', 45, 2),
('00000000-0000-0000-0005-000000005303', '00000000-0000-0000-0000-000000000053', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005301', 'Bike or Stair Stepper', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0005-000000005301', 'Air Squats', 2, 20, 20, 'reps', false, NULL, 2),
('00000000-0000-0000-0005-000000005301', 'Zombie Walks', 2, 10, 10, 'reps', true, NULL, 3),
('00000000-0000-0000-0005-000000005301', 'Banded Lateral Walks', 2, 10, 10, 'steps', true, NULL, 4),
('00000000-0000-0000-0005-000000005301', 'Deep Squat Hold', NULL, 2, 2, 'minutes', false, NULL, 5);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005302', 'Barbell Back Squat', 4, 6, 8, 'reps', false, '3 min rest, brace core, hit depth', 1),
('00000000-0000-0000-0005-000000005302', 'Hip Thrust', 4, 10, 12, 'reps', false, '2 min rest, pause and squeeze at top', 2),
('00000000-0000-0000-0005-000000005302', 'Leg Press', 3, 12, 15, 'reps', false, '90 sec rest, controlled, don''t lock knees', 3),
('00000000-0000-0000-0005-000000005302', 'RDL', 3, 10, 12, 'reps', false, '90 sec rest, hinge at hips, feel hamstrings', 4),
('00000000-0000-0000-0005-000000005302', 'Leg Extension', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at top', 5),
('00000000-0000-0000-0005-000000005302', 'Lying Leg Curl', 3, 12, 15, 'reps', false, '60 sec rest, control the negative', 6),
('00000000-0000-0000-0005-000000005302', 'Hip Abductor Machine', 3, 15, 15, 'reps', false, '60 sec rest, squeeze at top', 7),
('00000000-0000-0000-0005-000000005302', 'Seated Calf Raises', 4, 15, 20, 'reps', false, '45 sec rest, pause at stretch', 8);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005303', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Controlled, no swinging, curl pelvis', 1),
('00000000-0000-0000-0005-000000005303', 'Reverse Crunches', 3, 15, 15, 'reps', false, 'Curl hips off floor, no momentum', 2);

-- Bro Split Day 4: Shoulders
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000054',
  '00000000-0000-0000-0000-000000000005',
  4,
  'Shoulders'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0005-000000005401', '00000000-0000-0000-0000-000000000054', 'Warm-up', 10, 1),
('00000000-0000-0000-0005-000000005402', '00000000-0000-0000-0000-000000000054', 'Main Lifting', 45, 2),
('00000000-0000-0000-0005-000000005403', '00000000-0000-0000-0000-000000000054', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005401', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0005-000000005401', 'Band Shoulder Dislocates', 2, 10, 10, 'reps', false, NULL, 2),
('00000000-0000-0000-0005-000000005401', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, NULL, 3),
('00000000-0000-0000-0005-000000005401', 'Arm Circles', 2, 10, 10, 'reps', true, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005402', 'Overhead Press', 4, 6, 8, 'reps', false, '2-3 min rest, brace core, full lockout', 1),
('00000000-0000-0000-0005-000000005402', 'Seated DB Shoulder Press', 3, 10, 12, 'reps', false, '90 sec rest, don''t flare elbows too wide', 2),
('00000000-0000-0000-0005-000000005402', 'Lateral Raises', 4, 12, 15, 'reps', false, '60 sec rest, slight lean forward', 3),
('00000000-0000-0000-0005-000000005402', 'Cable Lateral Raises', 3, 12, 15, 'reps', true, '60 sec rest, behind-the-body cable path', 4),
('00000000-0000-0000-0005-000000005402', 'Rear Delt Fly Machine', 3, 15, 15, 'reps', false, '60 sec rest, squeeze shoulder blades', 5),
('00000000-0000-0000-0005-000000005402', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead, external rotate', 6),
('00000000-0000-0000-0005-000000005402', 'DB Front Raises', 2, 12, 12, 'reps', false, '60 sec rest, alternating, controlled', 7);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005403', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 1),
('00000000-0000-0000-0005-000000005403', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, protect low back', 2);

-- Bro Split Day 5: Arms
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000055',
  '00000000-0000-0000-0000-000000000005',
  5,
  'Arms'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0005-000000005501', '00000000-0000-0000-0000-000000000055', 'Warm-up', 10, 1),
('00000000-0000-0000-0005-000000005502', '00000000-0000-0000-0000-000000000055', 'Main Lifting', 45, 2),
('00000000-0000-0000-0005-000000005503', '00000000-0000-0000-0000-000000000055', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005501', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0005-000000005501', 'Push-Ups', 2, 12, 12, 'reps', false, 'Narrow hand position, feel triceps', 2),
('00000000-0000-0000-0005-000000005501', 'Band Curls', 2, 15, 15, 'reps', false, 'Light, pump blood into biceps', 3),
('00000000-0000-0000-0005-000000005501', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, 'Shoulders back, warm up elbows', 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005502', 'EZ Bar Curl', 4, 8, 10, 'reps', false, '90 sec rest, control the negative', 1),
('00000000-0000-0000-0005-000000005502', 'Close Grip Bench Press', 4, 8, 10, 'reps', false, '90 sec rest, elbows tucked, tricep focus', 2),
('00000000-0000-0000-0005-000000005502', 'Incline DB Curl', 3, 10, 12, 'reps', false, '60 sec rest, let arms hang, full stretch', 3),
('00000000-0000-0000-0005-000000005502', 'Overhead Rope Extension', 3, 12, 15, 'reps', false, '60 sec rest, full stretch at bottom', 4),
('00000000-0000-0000-0005-000000005502', 'Hammer Curls', 3, 12, 12, 'reps', false, '60 sec rest, no swinging', 5),
('00000000-0000-0000-0005-000000005502', 'Tricep Pushdown', 3, 12, 15, 'reps', false, '60 sec rest, elbows pinned to sides', 6),
('00000000-0000-0000-0005-000000005502', 'Cable Curl', 2, 15, 15, 'reps', false, '45 sec rest, constant tension, squeeze', 7),
('00000000-0000-0000-0005-000000005502', 'Weighted Dips', 2, 10, 12, 'reps', false, '90 sec rest, upright torso for tricep focus', 8);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0005-000000005503', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Control the swing, curl pelvis up', 1),
('00000000-0000-0000-0005-000000005503', 'Side Plank', 2, 30, 30, 'seconds', true, 'Lateral stability, straight line', 2);


-- =============================================
-- ARNOLD SPLIT PLAN
-- =============================================

INSERT INTO workout_plans (id, name, description)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'Arnold Split',
  'High-volume 3-day cycle pairing chest with back, shoulders with arms, and a dedicated leg day. Repeat twice per week.'
);

-- Arnold Split Day 1: Chest & Back
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000061',
  '00000000-0000-0000-0000-000000000006',
  1,
  'Chest & Back'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0006-000000006101', '00000000-0000-0000-0000-000000000061', 'Warm-up', 10, 1),
('00000000-0000-0000-0006-000000006102', '00000000-0000-0000-0000-000000000061', 'Main Lifting', 50, 2),
('00000000-0000-0000-0006-000000006103', '00000000-0000-0000-0000-000000000061', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006101', 'Rowing Machine', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0006-000000006101', 'Push-Ups', 2, 15, 15, 'reps', false, NULL, 2),
('00000000-0000-0000-0006-000000006101', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, NULL, 3),
('00000000-0000-0000-0006-000000006101', 'Scapular Pull-Ups', 2, 10, 10, 'reps', false, NULL, 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006102', 'Barbell Bench Press', 4, 6, 8, 'reps', false, '2-3 min rest, control descent, ribs down', 1),
('00000000-0000-0000-0006-000000006102', 'Pull-Ups', 4, 8, 12, 'reps', false, '2-3 min rest, full hang to chin over, superset with bench', 2),
('00000000-0000-0000-0006-000000006102', 'Incline DB Press', 3, 10, 12, 'reps', false, '90 sec rest, stretch at bottom', 3),
('00000000-0000-0000-0006-000000006102', 'T-Bar Row', 3, 8, 10, 'reps', false, '90 sec rest, superset with incline press', 4),
('00000000-0000-0000-0006-000000006102', 'Cable Fly', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at peak', 5),
('00000000-0000-0000-0006-000000006102', 'Close Grip Lat Pulldown', 3, 10, 12, 'reps', false, '60 sec rest, pull to chest, superset with cable fly', 6),
('00000000-0000-0000-0006-000000006102', 'Weighted Dips', 3, 8, 10, 'reps', false, '90 sec rest, lean forward for chest', 7),
('00000000-0000-0000-0006-000000006102', 'Single-Arm Cable Row', 3, 12, 12, 'reps', true, '60 sec rest, pull straight back', 8);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006103', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Control the swing, curl pelvis up', 1),
('00000000-0000-0000-0006-000000006103', 'Rope Pulldown Crunches', 3, 15, 20, 'reps', false, 'Curl ribs to hips, exhale hard', 2);

-- Arnold Split Day 2: Shoulders & Arms
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000062',
  '00000000-0000-0000-0000-000000000006',
  2,
  'Shoulders & Arms'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0006-000000006201', '00000000-0000-0000-0000-000000000062', 'Warm-up', 10, 1),
('00000000-0000-0000-0006-000000006202', '00000000-0000-0000-0000-000000000062', 'Main Lifting', 50, 2),
('00000000-0000-0000-0006-000000006203', '00000000-0000-0000-0000-000000000062', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006201', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0006-000000006201', 'Band Shoulder Dislocates', 2, 10, 10, 'reps', false, NULL, 2),
('00000000-0000-0000-0006-000000006201', 'Arm Circles', 2, 10, 10, 'reps', true, NULL, 3),
('00000000-0000-0000-0006-000000006201', 'Band Curls', 2, 15, 15, 'reps', false, 'Light, pump blood into biceps', 4);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006202', 'Overhead Press', 4, 6, 8, 'reps', false, '2-3 min rest, brace core, full lockout', 1),
('00000000-0000-0000-0006-000000006202', 'Lateral Raises', 4, 12, 15, 'reps', false, '60 sec rest, slight lean forward', 2),
('00000000-0000-0000-0006-000000006202', 'EZ Bar Curl', 3, 10, 12, 'reps', false, '90 sec rest, control the negative', 3),
('00000000-0000-0000-0006-000000006202', 'Overhead Rope Extension', 3, 12, 15, 'reps', false, '60 sec rest, full stretch, superset with curls', 4),
('00000000-0000-0000-0006-000000006202', 'Rear Delt Fly Machine', 3, 15, 15, 'reps', false, '60 sec rest, squeeze shoulder blades', 5),
('00000000-0000-0000-0006-000000006202', 'Hammer Curls', 3, 12, 12, 'reps', false, '60 sec rest, no swinging', 6),
('00000000-0000-0000-0006-000000006202', 'Tricep Pushdown', 3, 12, 15, 'reps', false, '60 sec rest, superset with hammer curls', 7),
('00000000-0000-0000-0006-000000006202', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead, external rotate', 8),
('00000000-0000-0000-0006-000000006202', 'Incline DB Curl', 2, 10, 12, 'reps', false, '60 sec rest, let arms hang, full stretch', 9);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006203', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, brace core, protect low back', 1),
('00000000-0000-0000-0006-000000006203', 'Pallof Press Hold', 3, 20, 20, 'seconds', true, 'Anti-rotation, resist rotation', 2);

-- Arnold Split Day 3: Legs
INSERT INTO workout_days (id, plan_id, day_number, name)
VALUES (
  '00000000-0000-0000-0000-000000000063',
  '00000000-0000-0000-0000-000000000006',
  3,
  'Legs'
);

INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
('00000000-0000-0000-0006-000000006301', '00000000-0000-0000-0000-000000000063', 'Warm-up', 10, 1),
('00000000-0000-0000-0006-000000006302', '00000000-0000-0000-0000-000000000063', 'Main Lifting', 50, 2),
('00000000-0000-0000-0006-000000006303', '00000000-0000-0000-0000-000000000063', 'Abs/Core', 10, 3);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006301', 'Bike or Stair Stepper', NULL, 5, 5, 'minutes', false, NULL, 1),
('00000000-0000-0000-0006-000000006301', 'Air Squats', 2, 20, 20, 'reps', false, NULL, 2),
('00000000-0000-0000-0006-000000006301', 'Zombie Walks', 2, 10, 10, 'reps', true, NULL, 3),
('00000000-0000-0000-0006-000000006301', 'Banded Lateral Walks', 2, 10, 10, 'steps', true, NULL, 4),
('00000000-0000-0000-0006-000000006301', 'Deep Squat Hold', NULL, 2, 2, 'minutes', false, NULL, 5);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006302', 'Barbell Back Squat', 4, 6, 8, 'reps', false, '3 min rest, brace core, hit depth', 1),
('00000000-0000-0000-0006-000000006302', 'Hip Thrust', 4, 10, 12, 'reps', false, '2 min rest, pause and squeeze at top', 2),
('00000000-0000-0000-0006-000000006302', 'Leg Press', 3, 12, 15, 'reps', false, '90 sec rest, controlled, don''t lock knees', 3),
('00000000-0000-0000-0006-000000006302', 'RDL', 3, 10, 12, 'reps', false, '90 sec rest, hinge at hips, feel hamstrings', 4),
('00000000-0000-0000-0006-000000006302', 'Bulgarian Split Squats', 3, 10, 10, 'reps', true, '90 sec rest, upright torso, depth focus', 5),
('00000000-0000-0000-0006-000000006302', 'Leg Extension', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at top', 6),
('00000000-0000-0000-0006-000000006302', 'Lying Leg Curl', 3, 12, 15, 'reps', false, '60 sec rest, control the negative', 7),
('00000000-0000-0000-0006-000000006302', 'Seated Calf Raises', 4, 15, 20, 'reps', false, '45 sec rest, pause at stretch', 8);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
('00000000-0000-0000-0006-000000006303', 'Hanging Leg Raises', 3, 15, 15, 'reps', false, 'Controlled, no swinging, curl pelvis', 1),
('00000000-0000-0000-0006-000000006303', 'Reverse Crunches', 3, 15, 15, 'reps', false, 'Curl hips off floor, no momentum', 2),
('00000000-0000-0000-0006-000000006303', 'Ab Wheel Rollouts', 3, 10, 12, 'reps', false, 'From knees, brace core, protect low back', 3);
