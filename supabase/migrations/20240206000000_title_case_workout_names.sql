-- Migration: Update workout names to Title Case
-- This ensures consistency in display names across the application
-- Database is the single source of truth for all display names

-- Update workout_days names from uppercase to Title Case
UPDATE workout_days SET name = 'Push (Chest, Shoulders, Triceps)' WHERE name = 'PUSH (Chest, Shoulders, Triceps)';
UPDATE workout_days SET name = 'Pull (Back, Biceps, Rear Delts)' WHERE name = 'PULL (Back, Biceps, Rear Delts)';
UPDATE workout_days SET name = 'Legs (Quads, Glutes, Hamstrings, Calves)' WHERE name = 'LEGS (Quads, Glutes, Hamstrings, Calves)';

-- Also handle any partial matches (in case names were slightly different)
UPDATE workout_days SET name = INITCAP(SUBSTRING(name FROM 1 FOR POSITION('(' IN name) - 1)) || SUBSTRING(name FROM POSITION('(' IN name))
WHERE name ~ '^[A-Z]+ \('
  AND name NOT LIKE 'Push %'
  AND name NOT LIKE 'Pull %'
  AND name NOT LIKE 'Legs %';

-- Add comment for documentation
COMMENT ON TABLE workout_days IS 'Workout day templates. Names should be stored in Title Case for consistent display.';
