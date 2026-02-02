-- Migration: Support multiple workouts per day
-- Removes UNIQUE constraint on (user_id, day_number) and adds sort_order column

-- Add sort_order column to track order of workouts within a day
ALTER TABLE user_schedules
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Drop the existing unique constraint
ALTER TABLE user_schedules
DROP CONSTRAINT IF EXISTS user_schedules_user_id_day_number_key;

-- Create a new unique constraint that includes sort_order
-- This allows multiple workouts per day with different sort_order values
ALTER TABLE user_schedules
ADD CONSTRAINT user_schedules_user_day_order_key UNIQUE(user_id, day_number, sort_order);

-- Create index for efficient querying by user and day
CREATE INDEX IF NOT EXISTS idx_user_schedules_user_day ON user_schedules(user_id, day_number);

-- Update the check constraint to allow proper validation
-- The original constraint is kept: is_rest_day = true OR template_id IS NOT NULL OR workout_day_id IS NOT NULL
