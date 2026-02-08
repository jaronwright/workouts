-- ============================================================
-- GLUTE HYPERTROPHY WORKOUT PLAN
-- 5-day split: 3 Lower / 2 Upper, glute-focused
-- ============================================================

INSERT INTO workout_plans (id, name) VALUES
  ('00000000-0000-0000-0000-000000000007', 'Glute Hypertrophy');

-- Day 1: Lower A (Posterior Chain - Glutes & Hamstrings)
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000007', 1, 'Lower A (Glutes & Hamstrings)');

-- Day 2: Upper A (Push & Pull)
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000007', 2, 'Upper A (Push & Pull)');

-- Day 3: Lower B (Quads & Glutes)
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000073', '00000000-0000-0000-0000-000000000007', 3, 'Lower B (Quads & Glutes)');

-- Day 4: Upper B (Shoulders & Back)
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000074', '00000000-0000-0000-0000-000000000007', 4, 'Upper B (Shoulders & Back)');

-- Day 5: Lower C (Glute Isolation)
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000075', '00000000-0000-0000-0000-000000000007', 5, 'Lower C (Glute Isolation)');

-- ============================================================
-- DAY 1: LOWER A — Posterior Chain (Glutes & Hamstrings)
-- ============================================================

-- Day 1: Warm-up
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000071', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000711', 'Incline Treadmill Walk', NULL, 5, 5, 'minutes', false, '3% incline, moderate pace', 1),
  ('00000000-0000-0000-0000-000000000711', 'Banded Glute Bridges', 2, 15, 15, 'reps', false, 'Squeeze at top, pause 2 sec', 2),
  ('00000000-0000-0000-0000-000000000711', 'Banded Lateral Walks', 2, 10, 10, 'reps', true, 'Fire up glute medius', 3),
  ('00000000-0000-0000-0000-000000000711', 'Leg Swings', 2, 10, 10, 'reps', true, 'Forward/back + side to side', 4);

-- Day 1: Main Lifting
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000071', 'Main Lifting', 1, 50);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000712', 'Barbell Hip Thrust', 4, 8, 10, 'reps', false, '2-3 min rest, heavy, pause at top', 1),
  ('00000000-0000-0000-0000-000000000712', 'Romanian Deadlift', 4, 8, 10, 'reps', false, '2 min rest, hinge deep, feel hamstrings', 2),
  ('00000000-0000-0000-0000-000000000712', 'Glute-focused Hyperextension', 3, 12, 15, 'reps', false, 'Round upper back, squeeze glutes', 3),
  ('00000000-0000-0000-0000-000000000712', 'Seated Leg Curl', 3, 10, 12, 'reps', false, '90 sec rest, slow eccentric', 4),
  ('00000000-0000-0000-0000-000000000712', 'Single-leg Hip Thrust', 3, 10, 12, 'reps', true, 'Body weight or light load, per side', 5),
  ('00000000-0000-0000-0000-000000000712', 'Cable Pull-through', 3, 12, 15, 'reps', false, 'Hinge, squeeze glutes at top', 6);

-- Day 1: Abs/Core
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000713', '00000000-0000-0000-0000-000000000071', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000713', 'Dead Bug', 3, 10, 10, 'reps', true, 'Brace core, low back flat on floor', 1),
  ('00000000-0000-0000-0000-000000000713', 'Plank', 3, 45, 45, 'seconds', false, 'Squeeze glutes, don''t sag', 2),
  ('00000000-0000-0000-0000-000000000713', 'Pallof Press', 3, 10, 10, 'reps', true, 'Anti-rotation, controlled', 3);

-- ============================================================
-- DAY 2: UPPER A — Push & Pull (Structure & Posture)
-- ============================================================

-- Day 2: Warm-up
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000721', '00000000-0000-0000-0000-000000000072', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000721', 'Incline Treadmill Walk', NULL, 3, 3, 'minutes', false, 'Light pace, loosen up', 1),
  ('00000000-0000-0000-0000-000000000721', 'Band Pull-Aparts', 2, 15, 15, 'reps', false, 'Shoulders back, squeeze rear delts', 2),
  ('00000000-0000-0000-0000-000000000721', 'Arm Circles', 2, 10, 10, 'reps', true, 'Forward and backward', 3),
  ('00000000-0000-0000-0000-000000000721', 'Cat-Cow Stretch', 2, 8, 8, 'reps', false, 'Open up thoracic spine', 4);

-- Day 2: Main Lifting
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000722', '00000000-0000-0000-0000-000000000072', 'Main Lifting', 1, 45);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000722', 'Incline Dumbbell Press', 4, 8, 10, 'reps', false, '2 min rest, 30 degree incline, full ROM', 1),
  ('00000000-0000-0000-0000-000000000722', 'Lat Pulldown', 4, 10, 12, 'reps', false, '90 sec rest, pull to chest, squeeze lats', 2),
  ('00000000-0000-0000-0000-000000000722', 'Overhead Press (Dumbbell)', 3, 8, 10, 'reps', false, '90 sec rest, brace core, full lockout', 3),
  ('00000000-0000-0000-0000-000000000722', 'Single-arm Dumbbell Row', 3, 10, 12, 'reps', true, '90 sec rest, pull to hip, squeeze back', 4),
  ('00000000-0000-0000-0000-000000000722', 'Lateral Raises', 3, 12, 15, 'reps', false, '60 sec rest, slight lean forward', 5),
  ('00000000-0000-0000-0000-000000000722', 'Tricep Pushdown', 3, 12, 15, 'reps', false, '60 sec rest, elbows pinned', 6),
  ('00000000-0000-0000-0000-000000000722', 'Face Pulls', 3, 15, 15, 'reps', false, '60 sec rest, pull to forehead, external rotate', 7);

-- Day 2: Abs/Core
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000723', '00000000-0000-0000-0000-000000000072', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000723', 'Hanging Knee Raises', 3, 12, 15, 'reps', false, 'Control the swing', 1),
  ('00000000-0000-0000-0000-000000000723', 'Cable Woodchop', 3, 10, 10, 'reps', true, 'Rotate through core, not arms', 2);

-- ============================================================
-- DAY 3: LOWER B — Anterior Chain (Quads & Glutes)
-- ============================================================

-- Day 3: Warm-up
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000731', '00000000-0000-0000-0000-000000000073', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000731', 'Bike or Stair Stepper', NULL, 5, 5, 'minutes', false, 'Easy pace, warm up legs', 1),
  ('00000000-0000-0000-0000-000000000731', 'Bodyweight Squats', 2, 15, 15, 'reps', false, 'Full depth, activate quads', 2),
  ('00000000-0000-0000-0000-000000000731', 'Walking Quad Stretch', 2, 8, 8, 'reps', true, 'Dynamic, open hip flexors', 3),
  ('00000000-0000-0000-0000-000000000731', 'Banded Monster Walks', 2, 10, 10, 'reps', true, 'Forward and lateral', 4);

-- Day 3: Main Lifting
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000732', '00000000-0000-0000-0000-000000000073', 'Main Lifting', 1, 50);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000732', 'Barbell Squat', 4, 6, 8, 'reps', false, '2-3 min rest, below parallel, brace core', 1),
  ('00000000-0000-0000-0000-000000000732', 'Bulgarian Split Squat', 3, 10, 12, 'reps', true, '90 sec rest, lean forward slightly for glutes', 2),
  ('00000000-0000-0000-0000-000000000732', 'Walking Lunges', 3, 12, 12, 'reps', true, '90 sec rest, long stride, push through heel', 3),
  ('00000000-0000-0000-0000-000000000732', 'Leg Press', 3, 10, 12, 'reps', false, 'High foot placement for glutes, full depth', 4),
  ('00000000-0000-0000-0000-000000000732', 'Leg Extension', 3, 12, 15, 'reps', false, '60 sec rest, squeeze at top', 5),
  ('00000000-0000-0000-0000-000000000732', 'Leg Curl (Lying)', 3, 10, 12, 'reps', false, '60 sec rest, slow eccentric', 6);

-- Day 3: Abs/Core
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000733', '00000000-0000-0000-0000-000000000073', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000733', 'Reverse Crunch', 3, 15, 15, 'reps', false, 'Curl pelvis toward ribs', 1),
  ('00000000-0000-0000-0000-000000000733', 'Side Plank', 3, 30, 30, 'seconds', true, 'Stack hips, don''t sag', 2),
  ('00000000-0000-0000-0000-000000000733', 'Bird Dog', 3, 10, 10, 'reps', true, 'Controlled, extend opposite arm and leg', 3);

-- ============================================================
-- DAY 4: UPPER B — Sculpting (Shoulders & Back Focus)
-- ============================================================

-- Day 4: Warm-up
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000741', '00000000-0000-0000-0000-000000000074', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000741', 'Jump Rope or Jumping Jacks', NULL, 2, 2, 'minutes', false, 'Get heart rate up', 1),
  ('00000000-0000-0000-0000-000000000741', 'Band Dislocates', 2, 10, 10, 'reps', false, 'Open up shoulders', 2),
  ('00000000-0000-0000-0000-000000000741', 'Scapula Push-ups', 2, 10, 10, 'reps', false, 'Protract and retract shoulder blades', 3);

-- Day 4: Main Lifting
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000742', '00000000-0000-0000-0000-000000000074', 'Main Lifting', 1, 40);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000742', 'Face Pulls', 3, 15, 20, 'reps', false, '60 sec rest, posture focus', 1),
  ('00000000-0000-0000-0000-000000000742', 'Lateral Raises', 4, 12, 15, 'reps', false, '60 sec rest, controlled tempo', 2),
  ('00000000-0000-0000-0000-000000000742', 'Push-ups', 3, 12, 15, 'reps', false, 'Full range, chest to floor', 3),
  ('00000000-0000-0000-0000-000000000742', 'Cable Row (Seated)', 3, 12, 15, 'reps', false, '60 sec rest, squeeze shoulder blades', 4),
  ('00000000-0000-0000-0000-000000000742', 'Bicep Curl (Dumbbell)', 3, 12, 15, 'reps', false, '60 sec rest, no swinging', 5),
  ('00000000-0000-0000-0000-000000000742', 'Overhead Tricep Extension', 3, 12, 15, 'reps', false, '60 sec rest, stretch at bottom', 6),
  ('00000000-0000-0000-0000-000000000742', 'Rear Delt Fly', 3, 15, 20, 'reps', false, 'Light weight, slow squeeze', 7);

-- Day 4: Abs/Core
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000743', '00000000-0000-0000-0000-000000000074', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000743', 'Ab Wheel Rollout', 3, 10, 10, 'reps', false, 'On knees if needed, brace hard', 1),
  ('00000000-0000-0000-0000-000000000743', 'Russian Twist', 3, 15, 15, 'reps', true, 'Controlled rotation', 2);

-- ============================================================
-- DAY 5: LOWER C — Glute Isolation (Pump Day)
-- ============================================================

-- Day 5: Warm-up
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000751', '00000000-0000-0000-0000-000000000075', 'Warm-up', 0, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000751', 'Bike', NULL, 5, 5, 'minutes', false, 'Easy spin, warm up', 1),
  ('00000000-0000-0000-0000-000000000751', 'Banded Clamshells', 2, 15, 15, 'reps', true, 'Activate glute medius', 2),
  ('00000000-0000-0000-0000-000000000751', 'Banded Fire Hydrants', 2, 12, 12, 'reps', true, 'Squeeze at top', 3),
  ('00000000-0000-0000-0000-000000000751', 'Glute Bridge Hold', 2, 20, 20, 'seconds', false, 'Squeeze and hold at top', 4);

-- Day 5: Main Lifting
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000752', '00000000-0000-0000-0000-000000000075', 'Main Lifting', 1, 45);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000752', 'Cable Glute Kickback', 4, 15, 15, 'reps', true, '60 sec rest, squeeze at top, no swinging', 1),
  ('00000000-0000-0000-0000-000000000752', 'Abductor Machine', 4, 15, 20, 'reps', false, '60 sec rest, slow and controlled', 2),
  ('00000000-0000-0000-0000-000000000752', 'Cable Pull-through', 3, 15, 20, 'reps', false, 'Hinge, full glute contraction at top', 3),
  ('00000000-0000-0000-0000-000000000752', 'Frog Pumps', 3, 20, 25, 'reps', false, 'Feet together, knees out, high reps', 4),
  ('00000000-0000-0000-0000-000000000752', 'Banded Lateral Walk', 3, 15, 15, 'reps', true, 'Stay low in quarter squat', 5),
  ('00000000-0000-0000-0000-000000000752', 'Step-ups (Dumbbell)', 3, 12, 12, 'reps', true, 'Drive through heel, glute focus', 6),
  ('00000000-0000-0000-0000-000000000752', 'Smith Machine Hip Thrust', 3, 12, 15, 'reps', false, 'Moderate weight, full squeeze', 7);

-- Day 5: Abs/Core
INSERT INTO exercise_sections (id, workout_day_id, name, sort_order, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000753', '00000000-0000-0000-0000-000000000075', 'Abs/Core', 2, 10);

INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000753', 'Flutter Kicks', 3, 20, 20, 'reps', false, 'Low back stays on floor', 1),
  ('00000000-0000-0000-0000-000000000753', 'Glute Bridge March', 3, 10, 10, 'reps', true, 'Hold bridge, alternate legs', 2),
  ('00000000-0000-0000-0000-000000000753', 'Mountain Climbers', 3, 20, 20, 'reps', false, 'Controlled, engage core', 3);
