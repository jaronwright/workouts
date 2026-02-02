-- Add weight_unit column to plan_exercises table
-- Allows per-exercise weight unit selection (lbs or kg)

ALTER TABLE plan_exercises
ADD COLUMN weight_unit TEXT DEFAULT 'lbs' CHECK (weight_unit IN ('lbs', 'kg'));

-- Update existing exercises to use the default
UPDATE plan_exercises SET weight_unit = 'lbs' WHERE weight_unit IS NULL;

-- Make it NOT NULL after setting defaults
ALTER TABLE plan_exercises ALTER COLUMN weight_unit SET NOT NULL;

COMMENT ON COLUMN plan_exercises.weight_unit IS 'Weight unit for this exercise (lbs or kg)';
