-- Migration: Update Cycling Mobility to be more hip-opener focused
-- Swap Figure-Four Stretch for Half Pigeon across all durations
-- Replace duplicate Pigeon in 60 min with Lizard Lunge (deep hip flexor opener)

-- 15 min: Replace Figure-Four with Half Pigeon
UPDATE plan_exercises
SET name = 'Half Pigeon Pose',
    reps_min = 45,
    notes = 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists'
WHERE section_id = '00000000-0000-0000-0001-000000000161'
  AND name = 'Figure-Four Stretch';

-- 30 min: Replace Figure-Four with Half Pigeon
UPDATE plan_exercises
SET name = 'Half Pigeon Pose',
    reps_min = 45,
    notes = 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists'
WHERE section_id = '00000000-0000-0000-0001-000000000162'
  AND name = 'Figure-Four Stretch';

-- 45 min: Replace Figure-Four with Half Pigeon
UPDATE plan_exercises
SET name = 'Half Pigeon Pose',
    reps_min = 45,
    notes = 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists'
WHERE section_id = '00000000-0000-0000-0001-000000000163'
  AND name = 'Figure-Four Stretch';

-- 60 min: Replace Figure-Four (position 2) with Half Pigeon
UPDATE plan_exercises
SET name = 'Half Pigeon Pose',
    reps_min = 45,
    notes = 'Front shin across body, square hips, fold forward gently — deep hip opener for tight cyclists'
WHERE section_id = '00000000-0000-0000-0001-000000000164'
  AND name = 'Figure-Four Stretch';

-- 60 min: Replace the old Pigeon Pose (position 12, now duplicate) with Lizard Lunge
UPDATE plan_exercises
SET name = 'Lizard Lunge',
    reps_min = 30,
    reps_unit = 'seconds',
    notes = 'Hands inside front foot, sink hips low, option to drop to forearms — deep hip flexor and groin opener'
WHERE section_id = '00000000-0000-0000-0001-000000000164'
  AND name = 'Pigeon Pose';
