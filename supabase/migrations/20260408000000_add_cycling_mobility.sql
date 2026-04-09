-- Migration: Add Cycling Mobility category (4 duration variants)
-- Targeted mobility for cyclists: hip flexors, lower back, IT band/knee, thoracic spine

-- Day numbers continue from existing mobility (25-28)
-- Workout day IDs: 161-164 range

-- Step 1: Create 4 workout days (15, 30, 45, 60 min)
INSERT INTO workout_days (id, plan_id, day_number, name) VALUES
  ('00000000-0000-0000-0000-000000000161', '00000000-0000-0000-0000-000000000003', 25, 'Cycling Mobility — 15 min'),
  ('00000000-0000-0000-0000-000000000162', '00000000-0000-0000-0000-000000000003', 26, 'Cycling Mobility — 30 min'),
  ('00000000-0000-0000-0000-000000000163', '00000000-0000-0000-0000-000000000003', 27, 'Cycling Mobility — 45 min'),
  ('00000000-0000-0000-0000-000000000164', '00000000-0000-0000-0000-000000000003', 28, 'Cycling Mobility — 60 min');

-- Step 2: Create exercise sections (one "Main" section per workout day)
INSERT INTO exercise_sections (id, workout_day_id, name, duration_minutes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000161', '00000000-0000-0000-0000-000000000161', 'Main', 15, 1),
  ('00000000-0000-0000-0001-000000000162', '00000000-0000-0000-0000-000000000162', 'Main', 30, 1),
  ('00000000-0000-0000-0001-000000000163', '00000000-0000-0000-0000-000000000163', 'Main', 45, 1),
  ('00000000-0000-0000-0001-000000000164', '00000000-0000-0000-0000-000000000164', 'Main', 60, 1);

-- Step 3: Insert exercises per duration tier
-- Each longer duration includes all exercises from shorter durations plus additional ones

-- CYCLING MOBILITY — 15 min (5 exercises: quick pre/post ride essentials)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000161', 'Kneeling Hip Flexor Stretch', 2, 30, NULL, 'seconds', true, 'Rear knee down, squeeze glute, push hips forward — counteracts cycling hip flexion', 1),
  ('00000000-0000-0000-0001-000000000161', 'Half Pigeon Pose', 2, 45, NULL, 'seconds', true, 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists', 2),
  ('00000000-0000-0000-0001-000000000161', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Slow and controlled, full spinal flexion and extension — relieves compressed lower back', 3),
  ('00000000-0000-0000-0001-000000000161', 'Standing Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle behind you, knees together, squeeze glute — releases dominant quads', 4),
  ('00000000-0000-0000-0001-000000000161', 'Standing IT Band Stretch', 2, 30, NULL, 'seconds', true, 'Cross rear leg behind, lean away and reach overhead — protects lateral knee', 5);

-- CYCLING MOBILITY — 30 min (8 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000162', 'Kneeling Hip Flexor Stretch', 2, 30, NULL, 'seconds', true, 'Rear knee down, squeeze glute, push hips forward — counteracts cycling hip flexion', 1),
  ('00000000-0000-0000-0001-000000000162', 'Half Pigeon Pose', 2, 45, NULL, 'seconds', true, 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists', 2),
  ('00000000-0000-0000-0001-000000000162', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Slow and controlled, full spinal flexion and extension — relieves compressed lower back', 3),
  ('00000000-0000-0000-0001-000000000162', 'Standing Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle behind you, knees together, squeeze glute — releases dominant quads', 4),
  ('00000000-0000-0000-0001-000000000162', 'Standing IT Band Stretch', 2, 30, NULL, 'seconds', true, 'Cross rear leg behind, lean away and reach overhead — protects lateral knee', 5),
  ('00000000-0000-0000-0001-000000000162', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'Quadruped position, reach under and rotate — opens thoracic spine locked from aero position', 6),
  ('00000000-0000-0000-0001-000000000162', 'Supine Hamstring Stretch', 2, 30, NULL, 'seconds', true, 'Leg straight up, use strap or hands, keep hips flat — balances quad-dominant pedaling', 7),
  ('00000000-0000-0000-0001-000000000162', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Full controlled circles in each direction — restores ROM limited by fixed pedal position', 8);

-- CYCLING MOBILITY — 45 min (11 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000163', 'Kneeling Hip Flexor Stretch', 2, 30, NULL, 'seconds', true, 'Rear knee down, squeeze glute, push hips forward — counteracts cycling hip flexion', 1),
  ('00000000-0000-0000-0001-000000000163', 'Half Pigeon Pose', 2, 45, NULL, 'seconds', true, 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists', 2),
  ('00000000-0000-0000-0001-000000000163', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Slow and controlled, full spinal flexion and extension — relieves compressed lower back', 3),
  ('00000000-0000-0000-0001-000000000163', 'Standing Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle behind you, knees together, squeeze glute — releases dominant quads', 4),
  ('00000000-0000-0000-0001-000000000163', 'Standing IT Band Stretch', 2, 30, NULL, 'seconds', true, 'Cross rear leg behind, lean away and reach overhead — protects lateral knee', 5),
  ('00000000-0000-0000-0001-000000000163', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'Quadruped position, reach under and rotate — opens thoracic spine locked from aero position', 6),
  ('00000000-0000-0000-0001-000000000163', 'Supine Hamstring Stretch', 2, 30, NULL, 'seconds', true, 'Leg straight up, use strap or hands, keep hips flat — balances quad-dominant pedaling', 7),
  ('00000000-0000-0000-0001-000000000163', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Full controlled circles in each direction — restores ROM limited by fixed pedal position', 8),
  ('00000000-0000-0000-0001-000000000163', '90/90 Hip Switch', 2, 8, NULL, 'reps', false, 'Seated, rotate knees side to side through full range — full hip internal/external rotation', 9),
  ('00000000-0000-0000-0001-000000000163', 'Foam Roll IT Band', 1, 60, NULL, 'seconds', true, 'Side-lying on roller, slow passes from hip to knee — deep myofascial release for IT band', 10),
  ('00000000-0000-0000-0001-000000000163', 'Child''s Pose to Cobra Flow', 2, 8, NULL, 'reps', false, 'Flow between positions, full spinal wave — reverses cycling posture through entire spine', 11);

-- CYCLING MOBILITY — 60 min (14 exercises)
INSERT INTO plan_exercises (section_id, name, sets, reps_min, reps_max, reps_unit, is_per_side, notes, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000164', 'Kneeling Hip Flexor Stretch', 2, 30, NULL, 'seconds', true, 'Rear knee down, squeeze glute, push hips forward — counteracts cycling hip flexion', 1),
  ('00000000-0000-0000-0001-000000000164', 'Half Pigeon Pose', 2, 45, NULL, 'seconds', true, 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists', 2),
  ('00000000-0000-0000-0001-000000000164', 'Cat-Cow', 2, 10, NULL, 'reps', false, 'Slow and controlled, full spinal flexion and extension — relieves compressed lower back', 3),
  ('00000000-0000-0000-0001-000000000164', 'Standing Quad Stretch', 2, 30, NULL, 'seconds', true, 'Grab ankle behind you, knees together, squeeze glute — releases dominant quads', 4),
  ('00000000-0000-0000-0001-000000000164', 'Standing IT Band Stretch', 2, 30, NULL, 'seconds', true, 'Cross rear leg behind, lean away and reach overhead — protects lateral knee', 5),
  ('00000000-0000-0000-0001-000000000164', 'Thread the Needle', 2, 8, NULL, 'reps', true, 'Quadruped position, reach under and rotate — opens thoracic spine locked from aero position', 6),
  ('00000000-0000-0000-0001-000000000164', 'Supine Hamstring Stretch', 2, 30, NULL, 'seconds', true, 'Leg straight up, use strap or hands, keep hips flat — balances quad-dominant pedaling', 7),
  ('00000000-0000-0000-0001-000000000164', 'Ankle CARs', 2, 8, NULL, 'reps', true, 'Full controlled circles in each direction — restores ROM limited by fixed pedal position', 8),
  ('00000000-0000-0000-0001-000000000164', '90/90 Hip Switch', 2, 8, NULL, 'reps', false, 'Seated, rotate knees side to side through full range — full hip internal/external rotation', 9),
  ('00000000-0000-0000-0001-000000000164', 'Foam Roll IT Band', 1, 60, NULL, 'seconds', true, 'Side-lying on roller, slow passes from hip to knee — deep myofascial release for IT band', 10),
  ('00000000-0000-0000-0001-000000000164', 'Child''s Pose to Cobra Flow', 2, 8, NULL, 'reps', false, 'Flow between positions, full spinal wave — reverses cycling posture through entire spine', 11),
  ('00000000-0000-0000-0001-000000000164', 'Lizard Lunge', 2, 30, NULL, 'seconds', true, 'Hands inside front foot, sink hips low, option to drop to forearms — deep hip flexor and groin opener', 12),
  ('00000000-0000-0000-0001-000000000164', 'Dead Bug', 2, 10, NULL, 'reps', true, 'Arms up, opposite arm/leg extend, low back flat — builds core stability to protect lower back', 13),
  ('00000000-0000-0000-0001-000000000164', 'Supine Spinal Twist', 2, 30, NULL, 'seconds', true, 'Knees to one side, arms wide, let gravity decompress — gentle lower back relief', 14);

-- Step 4: Insert 4 workout templates (one per duration)
INSERT INTO workout_templates (name, type, category, description, icon, duration_minutes, workout_day_id) VALUES
  ('Cycling Mobility', 'mobility', 'cycling_mobility', 'Pre/post ride mobility for cyclists — hips, back, knees, and thoracic spine', 'bicycle', 15, '00000000-0000-0000-0000-000000000161'),
  ('Cycling Mobility', 'mobility', 'cycling_mobility', 'Pre/post ride mobility for cyclists — hips, back, knees, and thoracic spine', 'bicycle', 30, '00000000-0000-0000-0000-000000000162'),
  ('Cycling Mobility', 'mobility', 'cycling_mobility', 'Pre/post ride mobility for cyclists — hips, back, knees, and thoracic spine', 'bicycle', 45, '00000000-0000-0000-0000-000000000163'),
  ('Cycling Mobility', 'mobility', 'cycling_mobility', 'Pre/post ride mobility for cyclists — hips, back, knees, and thoracic spine', 'bicycle', 60, '00000000-0000-0000-0000-000000000164');
