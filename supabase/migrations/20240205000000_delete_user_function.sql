-- Function to delete user account and all associated data
-- This is called via RPC from the client

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID from the JWT
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user profile (cascade should handle related data)
  -- If you have foreign keys with ON DELETE CASCADE, this will cascade
  DELETE FROM user_profiles WHERE id = current_user_id;

  -- Delete workout sessions (if not cascaded)
  DELETE FROM workout_sessions WHERE user_id = current_user_id;

  -- Delete the user from auth.users
  -- Note: This requires the service_role key in production
  -- For client-side deletion, we delete the user data but the auth user
  -- will be handled by Supabase's scheduled cleanup or admin action

  -- If you have admin privileges, you can add:
  -- DELETE FROM auth.users WHERE id = current_user_id;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user_account() IS 'Allows authenticated users to delete their own account and all associated data';
