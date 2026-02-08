-- Add calendar-based cycle day columns
-- cycle_start_date: the date Day 1 of the cycle corresponds to
-- timezone: user's IANA timezone for midnight rollover
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS cycle_start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Chicago';

-- Backfill existing users: preserve their current cycle position
-- If user is on day 3, start_date = today - 2, so computed day = 3
UPDATE user_profiles
SET cycle_start_date = CURRENT_DATE - (current_cycle_day - 1)
WHERE cycle_start_date IS NULL;
