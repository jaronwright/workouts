-- =============================================
-- Community Feature Seed Data
-- Creates fake users with workout sessions, reviews, reactions, and notifications
-- Run via: npx supabase db reset (if set as seed.sql) or manually via SQL editor
-- =============================================

-- =============================================
-- 1. Create fake auth users (local dev only)
-- =============================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role,
  confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
  email_change, email_change_confirm_status, phone_change, phone_change_token,
  reauthentication_token, is_sso_user, is_anonymous
)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'alex@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW() - INTERVAL '60 days', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Alex Chen"}'::jsonb, 'authenticated', 'authenticated', '', '', '', '', '', 0, '', '', '', false, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'jordan@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW() - INTERVAL '45 days', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Jordan Rivera"}'::jsonb, 'authenticated', 'authenticated', '', '', '', '', '', 0, '', '', '', false, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'sam@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW() - INTERVAL '30 days', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Sam Okafor"}'::jsonb, 'authenticated', 'authenticated', '', '', '', '', '', 0, '', '', '', false, false),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'taylor@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW() - INTERVAL '90 days', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Taylor Kim"}'::jsonb, 'authenticated', 'authenticated', '', '', '', '', '', 0, '', '', '', false, false),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000', 'morgan@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW() - INTERVAL '20 days', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Morgan Hayes"}'::jsonb, 'authenticated', 'authenticated', '', '', '', '', '', 0, '', '', '', false, false)
ON CONFLICT (id) DO NOTHING;

-- Also create identities for each user (required by Supabase auth)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"alex@example.com"}'::jsonb, 'email', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"jordan@example.com"}'::jsonb, 'email', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW(), NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","email":"sam@example.com"}'::jsonb, 'email', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW(), NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","email":"taylor@example.com"}'::jsonb, 'email', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW(), NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '{"sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee","email":"morgan@example.com"}'::jsonb, 'email', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. Create user profiles
-- =============================================
INSERT INTO user_profiles (id, display_name, selected_plan_id, hide_weight_details, community_onboarded, last_workout_date, created_at)
VALUES
  -- Alex: PPL enthusiast, 14-day streak, shows weights
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alex Chen', '00000000-0000-0000-0000-000000000001', false, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '60 days'),
  -- Jordan: Upper/Lower + cardio, hides weight details
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Jordan Rivera', '00000000-0000-0000-0000-000000000002', true, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '45 days'),
  -- Sam: Arnold split, new to community
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sam Okafor', '00000000-0000-0000-0000-000000000006', false, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 days'),
  -- Taylor: PPL veteran, longest streak
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Taylor Kim', '00000000-0000-0000-0000-000000000001', false, true, NOW(), NOW() - INTERVAL '90 days'),
  -- Morgan: Mobility focus, just started
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Morgan Hayes', '00000000-0000-0000-0000-000000000003', false, true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  selected_plan_id = EXCLUDED.selected_plan_id,
  hide_weight_details = EXCLUDED.hide_weight_details,
  community_onboarded = EXCLUDED.community_onboarded,
  last_workout_date = EXCLUDED.last_workout_date;

-- =============================================
-- 3. Create workout sessions (weight training) - all marked public
-- =============================================

-- Alex's Push Day (today)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000011',
   NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', true);

-- Alex's Pull Day (yesterday)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('11111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000012',
   NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 1 hour', true);

-- Alex's Legs Day (3 days ago)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('11111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000013',
   NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 45 minutes', true);

-- Jordan's Upper Day (2 days ago)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('22222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000021',
   NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 3 hours', true);

-- Jordan's Lower Day (4 days ago)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000022',
   NOW() - INTERVAL '4 days 3 hours', NOW() - INTERVAL '4 days 2 hours', true);

-- Sam's Push Day (today, early morning)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('33333333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000011',
   NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours', true);

-- Taylor's Push Day (just now - most recent)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('44444444-4444-4444-4444-444444444441', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000011',
   NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '5 minutes', true);

-- Taylor's Legs Day (2 days ago)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('44444444-4444-4444-4444-444444444442', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000013',
   NOW() - INTERVAL '2 days 1 hour', NOW() - INTERVAL '2 days', true);

-- Taylor's Pull Day (4 days ago)
INSERT INTO workout_sessions (id, user_id, workout_day_id, started_at, completed_at, is_public) VALUES
  ('44444444-4444-4444-4444-444444444443', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000012',
   NOW() - INTERVAL '4 days 1 hour', NOW() - INTERVAL '4 days', true);

-- =============================================
-- 4. Create template sessions (cardio/mobility) - all marked public
-- =============================================

-- NOTE: Template IDs are dynamically generated on db reset.
-- This block looks up template IDs by name+type to be reset-safe.

-- Jordan's 5K Run (1 day ago)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, distance_value, distance_unit, is_public)
SELECT '22222222-2222-2222-2222-222222222223', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', id,
   NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 4.5 hours', 28, 5.0, 'km', true
FROM workout_templates WHERE name = 'Running' AND type = 'cardio' LIMIT 1;

-- Jordan's Cycling (5 days ago)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, distance_value, distance_unit, is_public)
SELECT '22222222-2222-2222-2222-222222222224', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', id,
   NOW() - INTERVAL '5 days 3 hours', NOW() - INTERVAL '5 days 2 hours', 45, 18.5, 'km', true
FROM workout_templates WHERE name = 'Cycling' AND type = 'cardio' LIMIT 1;

-- Morgan's Hip Mobility (today)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, is_public)
SELECT '55555555-5555-5555-5555-555555555551', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', id,
   NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5.5 hours', 30, true
FROM workout_templates WHERE name = 'Hip, Knee & Ankle Flow' AND type = 'mobility' LIMIT 1;

-- Morgan's Core Stability (2 days ago)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, is_public)
SELECT '55555555-5555-5555-5555-555555555552', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', id,
   NOW() - INTERVAL '2 days 7 hours', NOW() - INTERVAL '2 days 6.5 hours', 30, true
FROM workout_templates WHERE name = 'Core Stability' AND type = 'mobility' LIMIT 1;

-- Morgan's Recovery (4 days ago)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, is_public)
SELECT '55555555-5555-5555-5555-555555555553', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', id,
   NOW() - INTERVAL '4 days 6 hours', NOW() - INTERVAL '4 days 5.5 hours', 30, true
FROM workout_templates WHERE name = 'Full Body Recovery' AND type = 'mobility' LIMIT 1;

-- Sam's Boxing session (yesterday)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, is_public)
SELECT '33333333-3333-3333-3333-333333333332', 'cccccccc-cccc-cccc-cccc-cccccccccccc', id,
   NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 5 hours', 45, true
FROM workout_templates WHERE name = 'Boxing' AND type = 'cardio' LIMIT 1;

-- Alex's Swimming (2 days ago)
INSERT INTO template_workout_sessions (id, user_id, template_id, started_at, completed_at, duration_minutes, distance_value, distance_unit, is_public)
SELECT '11111111-1111-1111-1111-111111111114', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id,
   NOW() - INTERVAL '2 days 5 hours', NOW() - INTERVAL '2 days 4.5 hours', 35, 1500, 'meters', true
FROM workout_templates WHERE name = 'Swimming' AND type = 'cardio' LIMIT 1;

-- =============================================
-- 5. Create exercise sets for weight sessions
-- =============================================

-- Alex's Push Day sets (Bench, Incline DB, Cable Fly)
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  -- Barbell Bench Press 4x8
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000001', 1, 8, 185, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000001', 2, 8, 185, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000001', 3, 7, 185, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000001', 4, 6, 185, true),
  -- Incline DB Press 3x10
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000002', 1, 10, 65, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000002', 2, 10, 65, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000002', 3, 8, 65, true),
  -- Cable Fly 3x12
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000005', 1, 12, 25, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000005', 2, 12, 25, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000005', 3, 10, 25, true),
  -- Overhead Rope Extension 3x12
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000006', 1, 12, 30, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000006', 2, 12, 30, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000006', 3, 10, 30, true),
  -- Weighted Dips 3x10
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000004', 1, 10, 45, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000004', 2, 10, 45, true),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0001-0002-000000000004', 3, 8, 45, true);

-- Alex's Pull Day sets (Pull-Ups, T-Bar Row, Curls)
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  -- Pull-Ups 4x8
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000001', 1, 8, 25, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000001', 2, 8, 25, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000001', 3, 7, 25, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000001', 4, 6, 25, true),
  -- T-Bar Row 4x10
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000002', 1, 10, 135, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000002', 2, 10, 135, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000002', 3, 9, 135, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000002', 4, 8, 135, true),
  -- EZ Bar Curl 3x12
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000006', 1, 12, 65, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000006', 2, 12, 65, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000006', 3, 10, 65, true),
  -- Hammer Curls 3x12
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000007', 1, 12, 30, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000007', 2, 12, 30, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000007', 3, 10, 30, true),
  -- Face Pulls 3x15
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000005', 1, 15, 40, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000005', 2, 15, 40, true),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0002-0002-000000000005', 3, 12, 40, true);

-- Alex's Legs Day sets (Hip Thrusts, Goblet Squat, Leg Press)
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000001', 1, 10, 225, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000001', 2, 10, 225, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000001', 3, 8, 225, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000001', 4, 8, 225, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000002', 1, 12, 70, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000002', 2, 12, 70, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000002', 3, 10, 70, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000002', 4, 10, 70, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000003', 1, 12, 270, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000003', 2, 12, 270, true),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0003-0002-000000000003', 3, 10, 270, true);

-- Taylor's Push Day sets (big lifter)
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000001', 1, 8, 225, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000001', 2, 8, 225, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000001', 3, 7, 225, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000001', 4, 5, 225, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000002', 1, 10, 80, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000002', 2, 10, 80, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000002', 3, 9, 80, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000005', 1, 15, 30, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000005', 2, 15, 30, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000005', 3, 12, 30, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000004', 1, 12, 70, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000004', 2, 12, 70, true),
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0001-0002-000000000004', 3, 10, 70, true);

-- Taylor's Legs Day sets
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000001', 1, 12, 315, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000001', 2, 12, 315, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000001', 3, 10, 315, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000001', 4, 10, 315, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000002', 1, 12, 90, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000002', 2, 12, 90, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000002', 3, 10, 90, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000002', 4, 10, 90, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000003', 1, 15, 360, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000003', 2, 15, 360, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000003', 3, 12, 360, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000005', 1, 12, 120, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000005', 2, 12, 120, true),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0003-0002-000000000005', 3, 10, 120, true);

-- Sam's Push Day sets (moderate lifter)
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000001', 1, 10, 155, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000001', 2, 10, 155, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000001', 3, 8, 155, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000001', 4, 8, 155, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000002', 1, 10, 50, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000002', 2, 10, 50, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000002', 3, 8, 50, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000004', 1, 10, 25, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000004', 2, 10, 25, true),
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0001-0002-000000000004', 3, 8, 25, true);

-- Jordan's Upper Day sets (Upper/Lower plan)
INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed) VALUES
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0001-0002-000000000001', 1, 8, 175, true),
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0001-0002-000000000001', 2, 8, 175, true),
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0001-0002-000000000001', 3, 7, 175, true),
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0001-0002-000000000001', 4, 6, 175, true),
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0002-0002-000000000001', 1, 8, 0, true),
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0002-0002-000000000001', 2, 7, 0, true),
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0002-0002-000000000001', 3, 6, 0, true);

-- =============================================
-- 6. Create workout reviews
-- =============================================

-- Alex's Push Day review (great session)
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   5, 4, 4, 'good', 'great', '["new_pr", "great_pump", "high_energy"]'::jsonb,
   'Hit a new PR on bench! 185 for 8 felt smooth. The pre-workout kicked in hard today.', 60);

-- Alex's Pull Day review
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111112',
   4, 3, 3, 'neutral', 'good', '["consistent", "good_form"]'::jsonb,
   'Solid pull day. Focused on mind-muscle connection with the rows.', 55);

-- Alex's Legs Day review
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111113',
   4, 5, 3, 'tired', 'good', '["pushed_through", "leg_day_survivor"]'::jsonb,
   'Almost skipped but glad I didn''t. Legs are going to be sore tomorrow.', 75);

-- Alex's Swimming review
INSERT INTO workout_reviews (id, user_id, template_session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111114',
   4, 3, 4, 'good', 'great', '["zen_mode", "consistent"]'::jsonb,
   'Great recovery swim. 1500m felt effortless today.', 35);

-- Jordan's Upper Day review
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222221',
   3, 4, 2, 'tired', 'neutral', '["pushed_through", "low_energy"]'::jsonb,
   'Not my best session. Slept poorly but still showed up.', 60);

-- Jordan's Run review
INSERT INTO workout_reviews (id, user_id, template_session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222223',
   5, 3, 5, 'good', 'great', '["new_pr", "runners_high", "high_energy"]'::jsonb,
   'New 5K PR! 28 minutes flat. The weather was perfect for a run.', 28);

-- Sam's Push Day review
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('cccc1111-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333331',
   4, 3, 4, 'good', 'great', '["great_pump", "consistent"]'::jsonb,
   'Feeling the progress week over week. Chest is finally growing!', 50);

-- Sam's Boxing review
INSERT INTO workout_reviews (id, user_id, template_session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('cccc2222-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333332',
   5, 5, 5, 'stressed', 'great', '["high_energy", "stress_relief"]'::jsonb,
   'Nothing beats hitting the bag after a stressful day. Absolute therapy.', 45);

-- Taylor's Push Day review (beast mode)
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('dddd1111-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444441',
   5, 4, 5, 'great', 'great', '["new_pr", "great_pump", "high_energy", "beast_mode"]'::jsonb,
   '225 for 8 reps! Been chasing this for months. Everything clicked today.', 55);

-- Taylor's Legs Day review
INSERT INTO workout_reviews (id, user_id, session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('dddd2222-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444442',
   4, 5, 4, 'good', 'tired', '["pushed_through", "leg_day_survivor", "consistent"]'::jsonb,
   'Hip thrusts at 315 for 12. Quads were on fire. Love/hate leg day.', 65);

-- Morgan's Hip Mobility review
INSERT INTO workout_reviews (id, user_id, template_session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555551',
   4, 2, 3, 'neutral', 'good', '["zen_mode", "good_form"]'::jsonb,
   'Hips feel so much better after this. Should do this every day.', 30);

-- Morgan's Core review
INSERT INTO workout_reviews (id, user_id, template_session_id, overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection, workout_duration_minutes) VALUES
  ('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555552',
   3, 3, 3, 'good', 'good', '["consistent"]'::jsonb,
   'Core work is never glamorous but always important.', 30);

-- =============================================
-- 7. Create activity reactions (cross-user engagement)
-- =============================================

-- Reactions on Alex's Push Day (popular post)
INSERT INTO activity_reactions (id, user_id, session_id, reaction_type) VALUES
  ('fa010001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'fire'),
  ('fa020001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'strong'),
  ('fa030001-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'impressive'),
  ('fa040001-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'props');

-- Reactions on Alex's Pull Day
INSERT INTO activity_reactions (id, user_id, session_id, reaction_type) VALUES
  ('fa010002-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111112', 'props'),
  ('fa020002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111112', 'strong');

-- Reactions on Taylor's Push Day (everyone impressed)
INSERT INTO activity_reactions (id, user_id, session_id, reaction_type) VALUES
  ('fa010003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444441', 'fire'),
  ('fa020003-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444441', 'impressive'),
  ('fa030003-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444441', 'strong'),
  ('fa040003-0000-0000-0000-000000000003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444441', 'fire');

-- Reactions on Jordan's Run (template session)
INSERT INTO activity_reactions (id, user_id, template_session_id, reaction_type) VALUES
  ('fa010004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222223', 'fire'),
  ('fa020004-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222223', 'props');

-- Reactions on Sam's Boxing
INSERT INTO activity_reactions (id, user_id, template_session_id, reaction_type) VALUES
  ('fa010005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333332', 'strong'),
  ('fa020005-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333332', 'fire'),
  ('fa030005-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333332', 'props');

-- Reactions on Taylor's Legs Day
INSERT INTO activity_reactions (id, user_id, session_id, reaction_type) VALUES
  ('fa010006-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444442', 'strong'),
  ('fa020006-0000-0000-0000-000000000006', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444442', 'fire');

-- Reactions on Morgan's Hip Mobility
INSERT INTO activity_reactions (id, user_id, template_session_id, reaction_type) VALUES
  ('fa010007-0000-0000-0000-000000000007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555551', 'props'),
  ('fa020007-0000-0000-0000-000000000007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555551', 'strong');

-- Reactions on Sam's Push Day
INSERT INTO activity_reactions (id, user_id, session_id, reaction_type) VALUES
  ('fa010008-0000-0000-0000-000000000008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333331', 'props'),
  ('fa020008-0000-0000-0000-000000000008', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333331', 'fire');

-- =============================================
-- 8. Create community notifications
-- =============================================

-- Notifications for Alex (reactions on their workouts)
INSERT INTO community_notifications (recipient_id, actor_id, notification_type, reaction_id, session_id, is_read, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'reaction', 'fa010001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', false, NOW() - INTERVAL '2 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'reaction', 'fa020001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', false, NOW() - INTERVAL '1.5 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'reaction', 'fa030001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', false, NOW() - INTERVAL '1 hour'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'reaction', 'fa040001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', false, NOW() - INTERVAL '30 minutes');

-- Notifications for Taylor (reactions on their workouts)
INSERT INTO community_notifications (recipient_id, actor_id, notification_type, reaction_id, session_id, is_read, created_at) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'reaction', 'fa010003-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444441', false, NOW() - INTERVAL '20 minutes'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'reaction', 'fa020003-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444441', false, NOW() - INTERVAL '15 minutes'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'reaction', 'fa030003-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444441', false, NOW() - INTERVAL '10 minutes');

-- Notifications for Sam (reactions on their workouts)
INSERT INTO community_notifications (recipient_id, actor_id, notification_type, reaction_id, session_id, is_read, created_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'reaction', 'fa010008-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333331', true, NOW() - INTERVAL '4 hours');

-- Notifications for Morgan (reactions on their mobility)
INSERT INTO community_notifications (recipient_id, actor_id, notification_type, reaction_id, template_session_id, is_read, created_at) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'reaction', 'fa010007-0000-0000-0000-000000000007', '55555555-5555-5555-5555-555555555551', false, NOW() - INTERVAL '5 hours');
