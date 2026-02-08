-- Add theme preference to user profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark';
