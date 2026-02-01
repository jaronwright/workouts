-- Mock data seed script for Workout Tracker
-- Run this in Supabase SQL Editor after you have a user account

-- First, get your user ID by running:
-- SELECT id FROM auth.users LIMIT 1;
-- Then replace 'YOUR_USER_ID' below with your actual user ID

DO $$
DECLARE
    v_user_id UUID;
    v_push_day_id UUID := '00000000-0000-0000-0000-000000000011';
    v_pull_day_id UUID := '00000000-0000-0000-0000-000000000012';
    v_legs_day_id UUID := '00000000-0000-0000-0000-000000000013';
    v_session_id UUID;
    v_exercise RECORD;
    v_weight DECIMAL;
BEGIN
    -- Get the first user ID
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found. Please create an account first.';
    END IF;

    RAISE NOTICE 'Using user ID: %', v_user_id;

    -- Delete existing mock sessions for this user (optional - comment out to keep existing)
    -- DELETE FROM workout_sessions WHERE user_id = v_user_id;

    -- Create sessions for the past 3 weeks
    -- Week 1 - 3 weeks ago
    -- Push Day
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_push_day_id, NOW() - INTERVAL '21 days' + INTERVAL '7 hours', NOW() - INTERVAL '21 days' + INTERVAL '8 hours 15 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_push_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%push-up%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%bench press%' THEN 155
            WHEN v_exercise.name ILIKE '%db%' OR v_exercise.name ILIKE '%dumbbell%' THEN 40
            WHEN v_exercise.name ILIKE '%cable%' OR v_exercise.name ILIKE '%rope%' THEN 50
            WHEN v_exercise.name ILIKE '%dip%' THEN 25
            ELSE 60
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Pull Day - 19 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_pull_day_id, NOW() - INTERVAL '19 days' + INTERVAL '6 hours 30 minutes', NOW() - INTERVAL '19 days' + INTERVAL '7 hours 45 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_pull_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%hang%' THEN NULL
            WHEN v_exercise.name ILIKE '%row%' THEN 135
            WHEN v_exercise.name ILIKE '%pulldown%' THEN 120
            WHEN v_exercise.name ILIKE '%curl%' THEN 30
            WHEN v_exercise.name ILIKE '%deadlift%' THEN 185
            ELSE 50
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Legs Day - 17 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_legs_day_id, NOW() - INTERVAL '17 days' + INTERVAL '8 hours', NOW() - INTERVAL '17 days' + INTERVAL '9 hours 20 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_legs_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%squat hold%' OR v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%squat%' THEN 185
            WHEN v_exercise.name ILIKE '%leg press%' THEN 270
            WHEN v_exercise.name ILIKE '%leg extension%' OR v_exercise.name ILIKE '%leg curl%' THEN 90
            WHEN v_exercise.name ILIKE '%calf%' THEN 150
            WHEN v_exercise.name ILIKE '%lunge%' THEN 35
            ELSE 100
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Week 2 - 2 weeks ago
    -- Push Day - 14 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_push_day_id, NOW() - INTERVAL '14 days' + INTERVAL '7 hours 15 minutes', NOW() - INTERVAL '14 days' + INTERVAL '8 hours 30 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_push_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%push-up%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%bench press%' THEN 160
            WHEN v_exercise.name ILIKE '%db%' OR v_exercise.name ILIKE '%dumbbell%' THEN 42.5
            WHEN v_exercise.name ILIKE '%cable%' OR v_exercise.name ILIKE '%rope%' THEN 52.5
            WHEN v_exercise.name ILIKE '%dip%' THEN 30
            ELSE 62.5
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Pull Day - 12 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_pull_day_id, NOW() - INTERVAL '12 days' + INTERVAL '6 hours 45 minutes', NOW() - INTERVAL '12 days' + INTERVAL '8 hours')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_pull_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%hang%' THEN NULL
            WHEN v_exercise.name ILIKE '%row%' THEN 140
            WHEN v_exercise.name ILIKE '%pulldown%' THEN 125
            WHEN v_exercise.name ILIKE '%curl%' THEN 32.5
            WHEN v_exercise.name ILIKE '%deadlift%' THEN 195
            ELSE 52.5
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Legs Day - 10 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_legs_day_id, NOW() - INTERVAL '10 days' + INTERVAL '7 hours 30 minutes', NOW() - INTERVAL '10 days' + INTERVAL '8 hours 50 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_legs_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%squat hold%' OR v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%squat%' THEN 195
            WHEN v_exercise.name ILIKE '%leg press%' THEN 290
            WHEN v_exercise.name ILIKE '%leg extension%' OR v_exercise.name ILIKE '%leg curl%' THEN 95
            WHEN v_exercise.name ILIKE '%calf%' THEN 160
            WHEN v_exercise.name ILIKE '%lunge%' THEN 37.5
            ELSE 105
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Week 3 - Last week
    -- Push Day - 7 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_push_day_id, NOW() - INTERVAL '7 days' + INTERVAL '6 hours', NOW() - INTERVAL '7 days' + INTERVAL '7 hours 10 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_push_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%push-up%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%bench press%' THEN 165
            WHEN v_exercise.name ILIKE '%db%' OR v_exercise.name ILIKE '%dumbbell%' THEN 45
            WHEN v_exercise.name ILIKE '%cable%' OR v_exercise.name ILIKE '%rope%' THEN 55
            WHEN v_exercise.name ILIKE '%dip%' THEN 35
            ELSE 65
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Pull Day - 5 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_pull_day_id, NOW() - INTERVAL '5 days' + INTERVAL '7 hours', NOW() - INTERVAL '5 days' + INTERVAL '8 hours 15 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_pull_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%hang%' THEN NULL
            WHEN v_exercise.name ILIKE '%row%' THEN 145
            WHEN v_exercise.name ILIKE '%pulldown%' THEN 130
            WHEN v_exercise.name ILIKE '%curl%' THEN 35
            WHEN v_exercise.name ILIKE '%deadlift%' THEN 205
            ELSE 55
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- Legs Day - 3 days ago
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_legs_day_id, NOW() - INTERVAL '3 days' + INTERVAL '8 hours 30 minutes', NOW() - INTERVAL '3 days' + INTERVAL '9 hours 45 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_legs_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%squat hold%' OR v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%squat%' THEN 205
            WHEN v_exercise.name ILIKE '%leg press%' THEN 310
            WHEN v_exercise.name ILIKE '%leg extension%' OR v_exercise.name ILIKE '%leg curl%' THEN 100
            WHEN v_exercise.name ILIKE '%calf%' THEN 170
            WHEN v_exercise.name ILIKE '%lunge%' THEN 40
            ELSE 110
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    -- This week - Push Day yesterday
    INSERT INTO workout_sessions (user_id, workout_day_id, started_at, completed_at)
    VALUES (v_user_id, v_push_day_id, NOW() - INTERVAL '1 day' + INTERVAL '6 hours 30 minutes', NOW() - INTERVAL '1 day' + INTERVAL '7 hours 40 minutes')
    RETURNING id INTO v_session_id;

    FOR v_exercise IN
        SELECT pe.id, pe.name, pe.reps_min, pe.reps_unit
        FROM plan_exercises pe
        JOIN exercise_sections es ON pe.section_id = es.id
        WHERE es.workout_day_id = v_push_day_id
    LOOP
        v_weight := CASE
            WHEN v_exercise.reps_unit IN ('minutes', 'seconds', 'steps') THEN NULL
            WHEN v_exercise.name ILIKE '%band%' OR v_exercise.name ILIKE '%push-up%' OR v_exercise.name ILIKE '%plank%' THEN NULL
            WHEN v_exercise.name ILIKE '%bench press%' THEN 170
            WHEN v_exercise.name ILIKE '%db%' OR v_exercise.name ILIKE '%dumbbell%' THEN 47.5
            WHEN v_exercise.name ILIKE '%cable%' OR v_exercise.name ILIKE '%rope%' THEN 57.5
            WHEN v_exercise.name ILIKE '%dip%' THEN 40
            ELSE 67.5
        END;

        INSERT INTO exercise_sets (session_id, plan_exercise_id, set_number, reps_completed, weight_used, completed)
        VALUES (v_session_id, v_exercise.id, 1, v_exercise.reps_min, v_weight, true);
    END LOOP;

    RAISE NOTICE 'Mock data seed complete! Created 10 workout sessions.';
END $$;

-- Verify the data
SELECT
    ws.id,
    wd.name as workout,
    ws.started_at,
    ws.completed_at,
    COUNT(es.id) as exercise_count
FROM workout_sessions ws
JOIN workout_days wd ON ws.workout_day_id = wd.id
LEFT JOIN exercise_sets es ON es.session_id = ws.id
GROUP BY ws.id, wd.name, ws.started_at, ws.completed_at
ORDER BY ws.started_at DESC;
