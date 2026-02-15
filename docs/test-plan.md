# Master Test Plan -- Workout Tracker PWA

## Overview

Comprehensive QA test plan covering all feature areas of the Workout Tracker PWA. Tests are organized by feature area with unique identifiers (TC-XXX). Each test case includes steps, expected results, and status tracking.

### Test Environment

- **Device widths**: 375px (iPhone SE), 428px (iPhone 14 Pro Max), desktop
- **Browsers**: Chrome (primary), Safari (iOS PWA), Firefox
- **Themes**: Light mode, Dark mode
- **Network**: Online, Offline, Slow 3G
- **Backend**: Supabase (local at `localhost:54321` for dev, production for staging)

### Status Legend

- **UNTESTED** -- Not yet executed
- **PASS** -- Test passed
- **FAIL** -- Test failed (link to BUG-ID)
- **BLOCKED** -- Cannot execute due to dependency
- **SKIP** -- Not applicable in current context

---

## 1. Authentication (TC-001 through TC-010)

- [ ] TC-001: Sign in with valid email and password
  - Steps: 1. Navigate to `/auth` 2. Enter valid email in the email field 3. Enter correct password 4. Click "Sign In" button
  - Expected: User is redirected to Home page (`/`). Auth state is set. User profile loads.
  - Status: UNTESTED

- [ ] TC-002: Sign in with invalid credentials
  - Steps: 1. Navigate to `/auth` 2. Enter a registered email 3. Enter an incorrect password 4. Click "Sign In"
  - Expected: Error message "Invalid email or password. Please try again." is displayed. User remains on auth page.
  - Status: UNTESTED

- [ ] TC-003: Sign up with new email, password, and display name
  - Steps: 1. Navigate to `/auth` 2. Click "Sign Up" tab 3. Enter new email, strong password, and display name 4. Click "Create Account"
  - Expected: Success message about email confirmation is shown (if confirmation required) OR user is redirected to Home. Profile is created with display name.
  - Status: UNTESTED

- [ ] TC-004: Sign up with already registered email
  - Steps: 1. Navigate to `/auth` 2. Click "Sign Up" tab 3. Enter an already registered email 4. Enter a password 5. Click "Create Account"
  - Expected: Error message "An account with this email already exists. Try signing in instead." is displayed.
  - Status: UNTESTED

- [ ] TC-005: Sign up with weak password
  - Steps: 1. Navigate to `/auth` 2. Click "Sign Up" tab 3. Enter email 4. Enter a weak password (e.g., "123") 5. Click "Create Account"
  - Expected: Error message "Password does not meet requirements" is displayed. PasswordStrengthIndicator shows weak status.
  - Status: UNTESTED

- [ ] TC-006: Sign in with Google OAuth
  - Steps: 1. Navigate to `/auth` 2. Click "Continue with Google" button
  - Expected: User is redirected to Google OAuth consent screen. After approval, redirected to `/auth/callback` and then to Home page.
  - Status: UNTESTED

- [ ] TC-007: Forgot password flow
  - Steps: 1. Navigate to `/auth` 2. Click "Forgot password?" link 3. Enter registered email 4. Click "Send Reset Link"
  - Expected: Success message "Password reset email sent! Check your inbox for the reset link." is displayed. Back to sign in link is visible.
  - Status: UNTESTED

- [ ] TC-008: Reset password after email link
  - Steps: 1. Click reset link from email (navigates to `/auth?mode=reset`) 2. Enter new strong password 3. Confirm password 4. Click "Update Password"
  - Expected: Success message "Password updated successfully!" is displayed. User is redirected to Home after 1.5 seconds.
  - Status: UNTESTED

- [ ] TC-009: Remember me checkbox behavior
  - Steps: 1. Navigate to `/auth` 2. Uncheck "Remember me" 3. Sign in 4. Close browser 5. Reopen app
  - Expected: When unchecked, session should expire sooner. When checked (default), session persists across browser restarts.
  - Status: UNTESTED

- [ ] TC-010: Redirect when already authenticated
  - Steps: 1. Sign in successfully 2. Manually navigate to `/auth`
  - Expected: User is automatically redirected to Home page (`/`). Auth page is not displayed.
  - Status: UNTESTED

---

## 2. Home Page (TC-011 through TC-020)

- [ ] TC-011: Home page loads with greeting and user name
  - Steps: 1. Sign in 2. Navigate to Home (`/`)
  - Expected: Correct time-of-day greeting shown (Good morning/afternoon/evening). User's first name displayed with period accent. Schedule widget loaded.
  - Status: UNTESTED

- [ ] TC-012: Stats section displays correct values
  - Steps: 1. Navigate to Home 2. Observe streak, this week, and total workout stats
  - Expected: Streak shows consecutive days with workouts. "This week" shows unique workout days since Sunday. "Total" shows all completed sessions (weights + template).
  - Status: UNTESTED

- [ ] TC-013: Active session banner appears when workout is in progress
  - Steps: 1. Start a weights workout 2. Navigate back to Home without completing
  - Expected: ScheduleWidget shows active session with "Continue" and "Dismiss" options. Continue navigates to `/workout/:dayId/active`.
  - Status: UNTESTED

- [ ] TC-014: Dismiss active session
  - Steps: 1. Have an active session 2. Navigate to Home 3. Click "Dismiss" on the active session banner
  - Expected: Active session is deleted. Banner disappears. Toast error shown if deletion fails.
  - Status: UNTESTED

- [ ] TC-015: Recent activity shows last 3 completed workouts
  - Steps: 1. Complete several workouts (mix of weights, cardio, mobility) 2. Navigate to Home
  - Expected: Up to 3 most recent completed workouts shown, sorted by completion time. Each shows workout name, type icon with correct color, duration, and relative time.
  - Status: UNTESTED

- [ ] TC-016: Recent activity links navigate to correct history detail
  - Steps: 1. Navigate to Home 2. Tap a weights workout in recent activity 3. Go back 4. Tap a cardio workout
  - Expected: Weights workout navigates to `/history/:sessionId`. Cardio/mobility navigates to `/history/cardio/:sessionId`.
  - Status: UNTESTED

- [ ] TC-017: Explore Exercises section displays body parts
  - Steps: 1. Navigate to Home 2. Scroll to "Explore Exercises" section
  - Expected: Horizontal scrollable list of body part chips loaded from ExerciseDB API. Each chip shows a Target icon and capitalized body part name.
  - Status: UNTESTED

- [ ] TC-018: Explore Exercises chips deep-link to Exercise Library
  - Steps: 1. Navigate to Home 2. Tap a body part chip (e.g., "chest")
  - Expected: Navigates to `/exercises?bodyPart=chest`. Exercise Library page opens with "chest" pre-selected as the active category.
  - Status: UNTESTED

- [ ] TC-019: Onboarding wizard auto-opens for new users
  - Steps: 1. Sign up as a new user (or user with no schedule) 2. Navigate to Home
  - Expected: OnboardingWizard modal opens automatically after schedule data loads and is empty.
  - Status: UNTESTED

- [ ] TC-020: Weather card displays current conditions
  - Steps: 1. Navigate to Home 2. Observe the WeatherCard section
  - Expected: Current weather conditions displayed including temperature and icon. Location permission may be requested. Falls back gracefully if location denied.
  - Status: UNTESTED

---

## 3. Workout Execution - Weights (TC-021 through TC-035)

- [ ] TC-021: Pre-workout view displays exercise list
  - Steps: 1. Navigate to `/workout/:dayId` (valid day ID) 2. Observe the pre-workout view
  - Expected: Large workout name displayed in magazine style. Exercise count and estimated duration shown. Sections displayed with yellow accent bar and exercises listed with sets/reps in compact format.
  - Status: UNTESTED

- [ ] TC-022: Start workout shows motivational splash screen
  - Steps: 1. On pre-workout view, tap "Start Workout" button
  - Expected: Full-screen lime green splash with motivational quote appears for ~2 seconds. Expanding ring animation plays. Loading spinner shown at bottom.
  - Status: UNTESTED

- [ ] TC-023: Active workout session is created
  - Steps: 1. Start workout 2. After splash, observe the active workout view
  - Expected: Session is created in database. Rest timer component appears. Exercise cards displayed with set logging controls. "Complete Workout" button visible at bottom.
  - Status: UNTESTED

- [ ] TC-024: Log a set for an exercise
  - Steps: 1. In active workout 2. Find an exercise card 3. Enter weight and reps 4. Complete the exercise
  - Expected: Set is logged to database. Exercise card shows completed state. Completed sets count updates. All planned sets are logged at once.
  - Status: UNTESTED

- [ ] TC-025: Uncomplete/remove sets for an exercise
  - Steps: 1. In active workout with completed sets 2. Tap the uncomplete action on a completed exercise
  - Expected: All sets for that exercise are deleted from database and removed from local store. Exercise card reverts to incomplete state.
  - Status: UNTESTED

- [ ] TC-026: Rest timer functionality
  - Steps: 1. In active workout 2. Complete a set 3. Observe the RestTimer component
  - Expected: Rest timer starts counting. Timer is visible and accessible. User can manually start/stop timer.
  - Status: UNTESTED

- [ ] TC-027: Wake lock is active during workout
  - Steps: 1. Start a workout 2. Set phone down without touching for 2+ minutes
  - Expected: Screen stays awake (wake lock active). Screen does not dim or lock during active session.
  - Status: UNTESTED

- [ ] TC-028: Complete workout triggers review modal
  - Steps: 1. In active workout 2. Log at least one set 3. Tap "Complete Workout"
  - Expected: Session is marked as completed in database. PostWorkoutReview modal opens with session info. Duration is calculated from session start time.
  - Status: UNTESTED

- [ ] TC-029: Post-workout review - 4 step wizard
  - Steps: 1. After completing workout, review modal opens 2. Complete Rating step 3. Complete Mood/Energy step 4. Complete Tags step 5. Complete Reflection step
  - Expected: Step 1 (Rating) is required, steps 2-4 are optional. Progress indicator shows current step. Can skip optional steps. Review is saved to database on completion.
  - Status: UNTESTED

- [ ] TC-030: Navigate home after review completion
  - Steps: 1. Complete post-workout review 2. Observe navigation
  - Expected: User is navigated to Home page (`/`). Active session is cleared from workout store.
  - Status: UNTESTED

- [ ] TC-031: Workout not found displays error
  - Steps: 1. Navigate to `/workout/invalid-uuid-here`
  - Expected: "Workout day not found" message displayed with back navigation button.
  - Status: UNTESTED

- [ ] TC-032: Warm-up section is collapsible
  - Steps: 1. Open a workout with a warm-up section 2. Observe the warm-up section in active view
  - Expected: Warm-up section renders inside a CollapsibleSection component. Default state is open. Can be collapsed and expanded.
  - Status: UNTESTED

- [ ] TC-033: Session sets persist after navigation
  - Steps: 1. Start a workout and log some sets 2. Navigate away (e.g., to Home) 3. Return to the workout via active session
  - Expected: Previously logged sets are still displayed. Sets are fetched from database via useSessionSets hook and restored to workoutStore.
  - Status: UNTESTED

- [ ] TC-034: Format sets/reps handles various formats
  - Steps: 1. Open a workout with exercises that have: fixed reps, rep ranges, per-side exercises, timed holds
  - Expected: Displays correctly as "4x8", "3x8-12", "3x30s", "2x10/side" respectively.
  - Status: UNTESTED

- [ ] TC-035: Only one active session allowed per user
  - Steps: 1. Start a workout 2. Try to start another workout from a different day
  - Expected: System enforces single active session constraint (RLS enforced). User should be directed to existing session or must dismiss it first.
  - Status: UNTESTED

---

## 4. Workout Execution - Cardio (TC-036 through TC-045)

- [ ] TC-036: Cardio workout page loads with template data
  - Steps: 1. Navigate to `/cardio/:templateId` with valid template ID
  - Expected: Template name, category icon with gradient, and last session data displayed. If no last session, shows "No previous sessions".
  - Status: UNTESTED

- [ ] TC-037: Metric toggle between time and distance
  - Steps: 1. Open a cardio workout (e.g., Running) 2. Toggle between available input modes (time/distance)
  - Expected: Input mode switches. Value field clears on toggle. Slider appears for step-based inputs. Correct unit label displayed.
  - Status: UNTESTED

- [ ] TC-038: Manual quick log with time value
  - Steps: 1. Open cardio workout 2. Select time mode 3. Enter duration value 4. Tap "Log Workout"
  - Expected: Quick log mutation fires. Post-workout review modal opens. Session saved with duration.
  - Status: UNTESTED

- [ ] TC-039: Manual quick log with distance value
  - Steps: 1. Open cardio workout 2. Select distance mode 3. Enter distance value 4. Tap "Log Workout"
  - Expected: Quick log mutation fires with distance value and unit. Review modal opens. Session saved with distance data.
  - Status: UNTESTED

- [ ] TC-040: Timer start, pause, resume flow
  - Steps: 1. Open cardio workout 2. Expand "Use Timer" section 3. Tap "Start Timer" 4. Observe timer counting 5. Tap pause 6. Tap resume 7. Verify elapsed time continuity
  - Expected: Timer starts counting up on start. Pausing freezes the display. Resuming continues from paused time. Accumulated seconds are preserved correctly.
  - Status: UNTESTED

- [ ] TC-041: Complete workout with timer
  - Steps: 1. Open cardio workout 2. Start timer 3. Let timer run for some time 4. Tap "Log Workout" while timer is running
  - Expected: Timer is paused. Duration is calculated from elapsed seconds (rounded up to minutes). Complete workout mutation fires with session ID and duration.
  - Status: UNTESTED

- [ ] TC-042: Log workout without entering a value shows warning
  - Steps: 1. Open cardio workout 2. Do not enter any value or use timer 3. Tap "Log Workout"
  - Expected: Toast warning "Please enter a value" is displayed. Workout is not logged.
  - Status: UNTESTED

- [ ] TC-043: Slider input for step-based metrics
  - Steps: 1. Open a cardio workout that has a slider mode (e.g., steps) 2. Adjust the slider
  - Expected: Large numeric display updates in real time. Slider range respects configured min/max/step values. Value is formatted with locale separators.
  - Status: UNTESTED

- [ ] TC-044: Cardio preference persists across sessions
  - Steps: 1. Open a running cardio workout 2. Switch to distance mode (miles) 3. Log the workout 4. Reopen the same cardio workout
  - Expected: Distance mode is pre-selected based on saved preference (via localStorage). Input mode index matches last used mode.
  - Status: UNTESTED

- [ ] TC-045: Cardio workout not found
  - Steps: 1. Navigate to `/cardio/invalid-uuid`
  - Expected: "Workout not found" message displayed with back navigation.
  - Status: UNTESTED

---

## 5. Workout Execution - Mobility (TC-046 through TC-050)

- [ ] TC-046: Mobility workout page loads with exercises
  - Steps: 1. Navigate to `/mobility/:templateId` with valid template ID
  - Expected: Template name, icon, duration, exercise count displayed. Exercise checklist rendered with names and sets/reps detail. RestTimer component present.
  - Status: UNTESTED

- [ ] TC-047: Exercise checklist toggle
  - Steps: 1. Open a mobility workout 2. Tap an exercise row to check it 3. Tap again to uncheck
  - Expected: Checked exercises show colored circle with check mark. Exercise name gets strikethrough and muted color. "X done" counter updates in header. Unchecking reverts all visual states.
  - Status: UNTESTED

- [ ] TC-048: Complete button disabled until at least one exercise checked
  - Steps: 1. Open a mobility workout with no exercises checked 2. Observe the "Complete Workout" button
  - Expected: Button shows "Complete Workout (0/N)" and is disabled. After checking at least one exercise, button becomes enabled with updated count.
  - Status: UNTESTED

- [ ] TC-049: Complete mobility workout triggers review
  - Steps: 1. Open mobility workout 2. Check several exercises 3. Tap "Complete Workout"
  - Expected: Quick log mutation fires with template ID and duration. PostWorkoutReview modal opens with sessionType 'mobility'. Duration defaults to template's duration_minutes.
  - Status: UNTESTED

- [ ] TC-050: Mobility duration picker page
  - Steps: 1. Navigate to `/mobility/:category/select`
  - Expected: Category icon and name displayed. Duration variants listed (Quick 15 min, Standard 30 min, Extended 45 min, Full Session 60 min). Tapping a variant navigates to the mobility workout.
  - Status: UNTESTED

---

## 6. Exercise Library (TC-051 through TC-060)

- [ ] TC-051: Exercise Library page loads with browse tabs
  - Steps: 1. Navigate to `/exercises`
  - Expected: Search bar at top. Three browse tabs: Body Part, Muscle, Equipment. Empty state prompting to select a category.
  - Status: UNTESTED

- [ ] TC-052: Browse by body part
  - Steps: 1. Navigate to Exercise Library 2. Select "Body Part" tab 3. Tap a body part chip (e.g., "chest")
  - Expected: Category chip becomes active (lime background). Exercise list loads below with thumbnails, names, body part, and equipment. Total count shown.
  - Status: UNTESTED

- [ ] TC-053: Browse by target muscle
  - Steps: 1. Navigate to Exercise Library 2. Select "Muscle" tab 3. Tap a muscle chip
  - Expected: Exercises filtered by target muscle load. Correct exercises displayed for the selected muscle.
  - Status: UNTESTED

- [ ] TC-054: Browse by equipment
  - Steps: 1. Navigate to Exercise Library 2. Select "Equipment" tab 3. Tap an equipment chip
  - Expected: Exercises filtered by equipment type load. Each result shows equipment label matching the filter.
  - Status: UNTESTED

- [ ] TC-055: Search exercises by name
  - Steps: 1. Navigate to Exercise Library 2. Type "bench press" in search bar 3. Wait for debounce (400ms)
  - Expected: Browse tabs and chips are hidden. Search results appear with matching exercises. Result count shown. "Load more" button if more results available.
  - Status: UNTESTED

- [ ] TC-056: Clear search returns to browse mode
  - Steps: 1. Search for an exercise 2. Click the X button to clear search
  - Expected: Search query clears. Browse tabs and category chips reappear. Previous tab selection preserved.
  - Status: UNTESTED

- [ ] TC-057: Exercise detail page loads with GIF
  - Steps: 1. From Exercise Library, tap an exercise
  - Expected: Navigates to `/exercises/:exerciseId`. GIF hero loads with loading spinner. Exercise name, body part tags, and equipment tags displayed. Instructions and Muscles tabs available.
  - Status: UNTESTED

- [ ] TC-058: Exercise detail instructions tab
  - Steps: 1. On exercise detail page 2. Observe the Instructions tab (default active)
  - Expected: Numbered list of exercise instructions displayed. "Step:N" prefix stripped from instruction text. Empty state shown if no instructions.
  - Status: UNTESTED

- [ ] TC-059: Exercise detail muscles tab
  - Steps: 1. On exercise detail page 2. Tap "Muscles" tab
  - Expected: Primary muscles shown with colored pills. Secondary muscles shown with muted pills. Empty state if no muscle data.
  - Status: UNTESTED

- [ ] TC-060: Exercise alternatives section
  - Steps: 1. On exercise detail page 2. Scroll to "Alternatives" section
  - Expected: Horizontal scrollable list of up to 6 alternative exercises targeting the same primary muscle. Each card shows GIF thumbnail, name, and equipment. Tapping navigates to that exercise's detail.
  - Status: UNTESTED

---

## 7. History & Calendar (TC-061 through TC-070)

- [ ] TC-061: History page loads with calendar view
  - Steps: 1. Navigate to `/history`
  - Expected: Calendar/Stats segmented control at top. Calendar view shows current month grid. Days with workouts are marked with indicators.
  - Status: UNTESTED

- [ ] TC-062: Calendar day selection opens bottom sheet
  - Steps: 1. On History page 2. Tap a day on the calendar
  - Expected: BottomSheet opens with SelectedDayPanel showing workout details for that day. Days with no workouts show empty panel.
  - Status: UNTESTED

- [ ] TC-063: Month navigation
  - Steps: 1. On History page 2. Tap left/right arrows to change months
  - Expected: Calendar grid updates to show the selected month. Data loads for the new month. Smooth transition between months.
  - Status: UNTESTED

- [ ] TC-064: Stats tab displays workout statistics
  - Steps: 1. On History page 2. Tap "Stats" tab
  - Expected: StatsGrid component renders with aggregated workout data. Animated transition between Calendar and Stats views.
  - Status: UNTESTED

- [ ] TC-065: Empty history state
  - Steps: 1. New user with no workouts navigates to History
  - Expected: Animated pulsing ProgressRing shown. "No workouts yet." heading with Syne font. Subtitle encouraging first workout.
  - Status: UNTESTED

- [ ] TC-066: Session detail page for weights workout
  - Steps: 1. Navigate to `/history/:sessionId` with valid weights session ID
  - Expected: Workout name, date, duration displayed. All exercise sets with weights and reps shown. Review summary if review was submitted.
  - Status: UNTESTED

- [ ] TC-067: Session detail page for cardio workout
  - Steps: 1. Navigate to `/history/cardio/:sessionId` with valid cardio session ID
  - Expected: Template name, category icon, duration, and distance (if logged) displayed. Review summary if applicable.
  - Status: UNTESTED

- [ ] TC-068: Navigate to session detail from calendar day
  - Steps: 1. On History page 2. Tap a day with workouts 3. In the bottom sheet, tap a workout entry
  - Expected: Navigates to the correct detail page (weights or cardio/mobility) based on session type.
  - Status: UNTESTED

- [ ] TC-069: Calendar shows today indicator
  - Steps: 1. Navigate to History 2. Observe the current date
  - Expected: Today's date is visually highlighted differently from other dates. Today marker is visible when viewing the current month.
  - Status: UNTESTED

- [ ] TC-070: Stats data aggregates both session types
  - Steps: 1. Have completed both weights and cardio/mobility workouts 2. Navigate to History Stats tab
  - Expected: Statistics include all session types (weights + template sessions). Total counts, frequencies, and trends reflect the complete workout history.
  - Status: UNTESTED

---

## 8. Profile & Settings (TC-071 through TC-080)

- [ ] TC-071: Profile page loads with user data
  - Steps: 1. Navigate to `/profile`
  - Expected: Avatar, display name, email displayed in hero section. Lifetime stats (total workouts, best streak, favorite) shown. Current workout split highlighted.
  - Status: UNTESTED

- [ ] TC-072: Edit display name
  - Steps: 1. On Profile page 2. Tap the pencil icon next to name 3. Type a new name 4. Tap the check mark to save
  - Expected: Name field becomes editable input with border. Saving shows "Profile saved" toast. Canceling (X or Escape) reverts to previous value.
  - Status: UNTESTED

- [ ] TC-073: Change workout split
  - Steps: 1. On Profile page 2. Tap a different workout split (e.g., "Upper/Lower") 3. Confirm in the modal
  - Expected: Confirmation modal warns about schedule reset. On confirm, selected_plan_id updates and schedule is cleared. OnboardingWizard opens at step 3 for new schedule setup.
  - Status: UNTESTED

- [ ] TC-074: Theme picker (light/dark/system)
  - Steps: 1. On Profile page 2. Find the Appearance section 3. Change theme
  - Expected: Theme changes immediately. CSS custom properties update. All components reflect new theme colors.
  - Status: UNTESTED

- [ ] TC-075: Change password
  - Steps: 1. On Profile page 2. Expand Security section 3. Enter new password and confirm 4. Tap "Update Password"
  - Expected: Password validation runs (strength indicator shown). Passwords must match. Success toast on update. Error shown if validation fails.
  - Status: UNTESTED

- [ ] TC-076: Change email
  - Steps: 1. On Profile page 2. Expand Email section 3. Enter new email 4. Tap "Update Email"
  - Expected: Email validation runs. Confirmation email sent to new address. Success message displayed. Same email rejected with error.
  - Status: UNTESTED

- [ ] TC-077: Submit feedback (bug report)
  - Steps: 1. On Profile page 2. Expand Feedback section 3. Select "Bug Report" 4. Type a message 5. Tap "Submit Feedback"
  - Expected: Feedback saved to user_feedback table. Success state shown with "Thanks for your feedback!" and option to submit another. Past submissions list updates.
  - Status: UNTESTED

- [ ] TC-078: Submit feedback (feature request)
  - Steps: 1. On Profile page 2. Expand Feedback section 3. Select "Feature Request" 4. Type a message 5. Tap "Submit Feedback"
  - Expected: Same behavior as bug report but with type='feature'. Feedback pills show correct styling for feature vs bug.
  - Status: UNTESTED

- [ ] TC-079: Delete account
  - Steps: 1. On Profile page 2. Expand Security section 3. Click "Delete Account" 4. In modal, type "DELETE" 5. Click "Delete Account" button
  - Expected: Button disabled until "DELETE" typed exactly. On confirm, account and all data deleted via deleteUserAccount(). User signed out and redirected to auth page.
  - Status: UNTESTED

- [ ] TC-080: Sign out and sign out all devices
  - Steps: 1. On Profile page 2. Tap "Log Out" button
  - Expected: User is signed out. Redirected to `/auth`. Session cleared. "Sign Out All Devices" in Security section signs out all sessions.
  - Status: UNTESTED

---

## 9. Schedule Management (TC-081 through TC-090)

- [ ] TC-081: Schedule page loads with 7-day cycle
  - Steps: 1. Navigate to `/schedule`
  - Expected: Current cycle day shown prominently with large number and pulsing animation. 7-day pill selector at top. 7-day list below with workout assignments, rest days, and empty slots.
  - Status: UNTESTED

- [ ] TC-082: Current day highlighted in schedule
  - Steps: 1. Navigate to Schedule 2. Observe the current cycle day
  - Expected: Current day pill has lime green background with glow. Corresponding list item has primary-muted background and larger day number circle.
  - Status: UNTESTED

- [ ] TC-083: Change current cycle day
  - Steps: 1. On Schedule page 2. Tap a different day pill (e.g., Day 3)
  - Expected: Cycle start date is recalculated and saved via updateProfile. Current day updates to match selection. Profile cycle_start_date is persisted.
  - Status: UNTESTED

- [ ] TC-084: Open day editor to add workout
  - Steps: 1. On Schedule page 2. Tap an empty day slot ("Add workout")
  - Expected: ScheduleDayEditor bottom sheet/modal opens. Options to add weights, cardio, or mobility workout. Rest day option available.
  - Status: UNTESTED

- [ ] TC-085: Assign a weights workout to a day
  - Steps: 1. Open day editor 2. Select a weights workout day 3. Confirm
  - Expected: Day now shows the weights workout with correct icon, color, name, and muscle group subtitle. Schedule is saved to user_schedules table.
  - Status: UNTESTED

- [ ] TC-086: Assign a cardio workout to a day
  - Steps: 1. Open day editor 2. Select a cardio template 3. Confirm
  - Expected: Day shows cardio workout with gradient icon and correct style. Duration shown as subtitle.
  - Status: UNTESTED

- [ ] TC-087: Set a rest day
  - Steps: 1. Open day editor 2. Select "Rest Day" option 3. Confirm
  - Expected: Day shows moon icon with "Rest Day" label in muted gray color.
  - Status: UNTESTED

- [ ] TC-088: Multiple workouts per day
  - Steps: 1. Open day editor for a day that already has a workout 2. Add a second workout
  - Expected: Day shows multiple workout entries stacked vertically. Day pill in header shows count number instead of icon. Left edge color from first workout.
  - Status: UNTESTED

- [ ] TC-089: Remove a workout from a day
  - Steps: 1. Open day editor for a day with workouts 2. Remove a workout
  - Expected: Workout is removed from the day. Schedule updates immediately. If all workouts removed, day shows empty "Add workout" state.
  - Status: UNTESTED

- [ ] TC-090: Schedule loading state
  - Steps: 1. Navigate to Schedule on slow connection
  - Expected: 7 skeleton cards with pulse animation displayed while data loads. No content flash or layout shift when data arrives.
  - Status: UNTESTED

---

## 10. Community (TC-091 through TC-100)

- [ ] TC-091: Community page loads with feed tabs
  - Steps: 1. Navigate to `/community`
  - Expected: Feed tabs (Following/Discover) displayed. If user follows people, defaults to "Following" tab. Otherwise defaults to "Discover". Notification bell in header.
  - Status: UNTESTED

- [ ] TC-092: Discover feed shows recent community workouts
  - Steps: 1. On Community page 2. Select "Discover" tab
  - Expected: Search bar, suggested users, active challenges, leaderboard, and workout feed displayed. Workouts from all users shown via WorkoutCard components.
  - Status: UNTESTED

- [ ] TC-093: Following feed shows workouts from followed users
  - Steps: 1. Follow at least one user 2. Navigate to Community "Following" tab
  - Expected: Only workouts from followed users shown. Empty state with "Discover People" button if no followed users have workouts.
  - Status: UNTESTED

- [ ] TC-094: Search for users
  - Steps: 1. On Discover tab 2. Type a name in search bar 3. Wait for results
  - Expected: Search results show matching users with avatars, display names, and follow buttons. Tapping a user navigates to their public profile.
  - Status: UNTESTED

- [ ] TC-095: Follow/unfollow a user
  - Steps: 1. Find a user (via search or suggested) 2. Tap the Follow button 3. Tap again to Unfollow
  - Expected: Follow button toggles state. Following count updates. Feed reflects the change when switching to "Following" tab.
  - Status: UNTESTED

- [ ] TC-096: Notification bell and panel
  - Steps: 1. On Community page 2. Observe notification bell 3. Tap the bell
  - Expected: Unread count badge shown on bell if notifications exist. NotificationPanel opens. Notifications marked as read on open.
  - Status: UNTESTED

- [ ] TC-097: Infinite scroll on feed
  - Steps: 1. On Community page with many workouts 2. Scroll to bottom of feed
  - Expected: Loading spinner appears at bottom. Next page of workouts loads automatically via IntersectionObserver. "You're all caught up!" shown when no more pages.
  - Status: UNTESTED

- [ ] TC-098: Privacy modal on first visit
  - Steps: 1. Visit Community page for the first time
  - Expected: Privacy explainer modal appears explaining how community features work. Dismissing sets localStorage flag. Does not appear on subsequent visits.
  - Status: UNTESTED

- [ ] TC-099: Active challenges display
  - Steps: 1. On Discover tab 2. Observe Active Challenges section
  - Expected: ChallengeCard components displayed for active challenges. Join button available. Joining updates challenge participation.
  - Status: UNTESTED

- [ ] TC-100: Badge celebration overlay
  - Steps: 1. Complete an action that earns a badge 2. Navigate to Community page
  - Expected: BadgeCelebration overlay appears showing newly earned badge(s). Overlay dismisses on completion. Badges checked via useCheckBadges on page load.
  - Status: UNTESTED

---

## 11. Navigation & Routing (TC-101 through TC-110)

- [ ] TC-101: Bottom navigation shows on main pages
  - Steps: 1. Navigate to Home, Schedule, History, Community
  - Expected: Bottom nav visible on all main pages with 4 icons. Active state shows Material 3-style pill behind icon. Labels visible and not truncated.
  - Status: UNTESTED

- [ ] TC-102: Bottom navigation hidden during workouts
  - Steps: 1. Start a workout (weights, cardio, or mobility) 2. Observe bottom area
  - Expected: Bottom nav is hidden (hideNav prop set). Back button available in header for navigation.
  - Status: UNTESTED

- [ ] TC-103: Protected routes redirect unauthenticated users
  - Steps: 1. Sign out 2. Navigate directly to `/profile` or `/history`
  - Expected: User is redirected to `/auth`. After sign in, returned to intended page.
  - Status: UNTESTED

- [ ] TC-104: Public route redirects authenticated users
  - Steps: 1. Sign in 2. Navigate to `/auth`
  - Expected: User is redirected to Home page (`/`).
  - Status: UNTESTED

- [ ] TC-105: Unknown routes redirect to Home
  - Steps: 1. Navigate to `/nonexistent-page`
  - Expected: `Route path="*"` catches the request. User redirected to Home via `Navigate to="/" replace`.
  - Status: UNTESTED

- [ ] TC-106: Back button navigation
  - Steps: 1. Navigate: Home > Workouts > Workout Day > Start Workout 2. Press back button at each level
  - Expected: Back button navigates to the previous page in the hierarchy. No broken navigation loops.
  - Status: UNTESTED

- [ ] TC-107: Deep link to workout works
  - Steps: 1. Open a direct URL like `/workout/:validDayId`
  - Expected: If authenticated, workout page loads directly. If not authenticated, redirected to auth then back to workout.
  - Status: UNTESTED

- [ ] TC-108: OAuth callback route
  - Steps: 1. Complete Google OAuth flow
  - Expected: `/auth/callback` processes the OAuth response. User is authenticated. Redirected to Home page.
  - Status: UNTESTED

- [ ] TC-109: Community deep links
  - Steps: 1. Navigate to `/community/profile/:userId` 2. Navigate to `/community/session/:sessionId` 3. Navigate to `/community/cardio/:sessionId`
  - Expected: Each route loads the correct page component (PublicProfile, PublicSessionDetail). Invalid IDs show appropriate error states.
  - Status: UNTESTED

- [ ] TC-110: Page transition animations
  - Steps: 1. Navigate between different pages using bottom nav 2. Navigate using back button
  - Expected: Smooth animated transitions between pages using AnimatePresence. No jarring content flashes.
  - Status: UNTESTED

---

## 12. Offline & Sync (TC-111 through TC-115)

- [ ] TC-111: App functions offline with cached data
  - Steps: 1. Load the app fully online 2. Switch to airplane mode 3. Navigate through cached pages
  - Expected: TanStack Query serves stale cached data. Pages render with cached content. No crash or blank screen. networkMode 'offlineFirst' behavior active.
  - Status: UNTESTED

- [ ] TC-112: Mutations queued offline
  - Steps: 1. Go offline 2. Start a workout 3. Log sets 4. Complete workout
  - Expected: All mutations are queued in offlineStore as QueuedMutation objects. Toast or indicator shows offline status. Actions appear to succeed locally.
  - Status: UNTESTED

- [ ] TC-113: Sync engine processes queue on reconnect
  - Steps: 1. Perform mutations offline (TC-112) 2. Reconnect to network
  - Expected: useSyncEngine detects online status change. syncService processes queue FIFO. Retries up to 3 times with exponential backoff. All queued mutations are synced.
  - Status: UNTESTED

- [ ] TC-114: Online status indicator
  - Steps: 1. Go offline 2. Observe any offline indicators 3. Go back online
  - Expected: useOnlineStatus hook detects network changes. Visual indicator (if any) reflects current status. Transitions smoothly between states.
  - Status: UNTESTED

- [ ] TC-115: PWA caching with service worker
  - Steps: 1. Install the PWA 2. Open from home screen 3. Navigate while offline
  - Expected: Service worker serves cached assets. Supabase API calls use NetworkFirst strategy. App shell loads even without network.
  - Status: UNTESTED

---

## 13. Visual & Layout (TC-116 through TC-130)

- [ ] TC-116: 375px width (iPhone SE) - Home page
  - Steps: 1. Set viewport to 375px width 2. Navigate to Home
  - Expected: All content fits without horizontal scroll. Stats cards do not overlap. Body part chips scroll horizontally. No text truncation issues.
  - Status: UNTESTED

- [ ] TC-117: 428px width (iPhone 14 Pro Max) - Home page
  - Steps: 1. Set viewport to 428px width 2. Navigate to Home
  - Expected: Layout fills wider screen appropriately. No excessive whitespace. Cards and content scale well.
  - Status: UNTESTED

- [ ] TC-118: 375px width - Workout page
  - Steps: 1. Set viewport to 375px 2. Open a workout with many exercises
  - Expected: Exercise names truncate gracefully. Sets/reps data fits. Floating start button does not overlap content. Exercise cards are readable.
  - Status: UNTESTED

- [ ] TC-119: 375px width - Exercise Library
  - Steps: 1. Set viewport to 375px 2. Navigate to Exercise Library 3. Search and browse exercises
  - Expected: Search bar full width. Tab labels fit. Category chips scroll horizontally. Exercise list items do not overflow.
  - Status: UNTESTED

- [ ] TC-120: 375px width - Profile page
  - Steps: 1. Set viewport to 375px 2. Navigate to Profile
  - Expected: Avatar and name row does not overflow. Stats cards fit three across. Workout split grid two columns. All sections accessible.
  - Status: UNTESTED

- [ ] TC-121: Dark mode - all screens
  - Steps: 1. Enable dark mode 2. Navigate through every page
  - Expected: All CSS custom properties switch to dark values. Text is readable on dark backgrounds. No white flashes. Primary lime color still has good contrast.
  - Status: UNTESTED

- [ ] TC-122: Light mode - all screens
  - Steps: 1. Enable light mode 2. Navigate through every page
  - Expected: All surfaces use light colors. Text contrast meets accessibility standards. Shadows and borders visible.
  - Status: UNTESTED

- [ ] TC-123: Typography hierarchy
  - Steps: 1. Navigate through all pages 2. Observe heading and body text
  - Expected: Headings use Syne font (var(--font-heading)). Body text uses DM Sans (var(--font-body)). Correct font weights applied. Type scale consistent.
  - Status: UNTESTED

- [ ] TC-124: Card components have correct styling
  - Steps: 1. Observe Card components across all pages
  - Expected: Cards have `position: relative` (for overlay containment). Correct border-radius (var(--radius-lg)). Surface background color. Shadow applied per elevation.
  - Status: UNTESTED

- [ ] TC-125: Bottom nav min-width and label fitting
  - Steps: 1. Observe bottom nav on narrow screens 2. Check all 4 nav items
  - Expected: Nav items use `min-w-14 px-2` (not fixed width). Labels like "Community" fit without truncation. Active state shows pill behind icon only.
  - Status: UNTESTED

- [ ] TC-126: Animations respect reduced motion preference
  - Steps: 1. Enable "Reduce motion" in OS accessibility settings 2. Navigate through app
  - Expected: useReducedMotion hook detects preference. Animations are minimized or disabled. Page transitions are instant. No motion-sickness-inducing effects.
  - Status: UNTESTED

- [ ] TC-127: Skeleton loading states
  - Steps: 1. Throttle network to slow 3G 2. Navigate to Home, Profile, Schedule, History
  - Expected: Skeleton cards/bars with pulse animation shown while loading. Correct number and shape of skeletons matching final layout. No layout shift when data loads.
  - Status: UNTESTED

- [ ] TC-128: Glass/frosted effects
  - Steps: 1. Observe elements with glass effect (floating workout button, tab switcher)
  - Expected: Backdrop blur applied. Glass background color with appropriate opacity. Glass border visible. Content behind is blurred.
  - Status: UNTESTED

- [ ] TC-129: Safe area insets (PWA notch handling)
  - Steps: 1. Open PWA on a device with notch/dynamic island 2. Navigate through pages
  - Expected: Content respects safe area insets. Bottom buttons use `pb-safe`. No content hidden behind notch or home indicator.
  - Status: UNTESTED

- [ ] TC-130: Scrollable content does not overlap fixed elements
  - Steps: 1. Navigate to any page with scrollable content 2. Scroll to top and bottom
  - Expected: Content scrolls behind sticky headers (History tab switcher). Bottom nav does not overlap scrollable content. Proper padding/margins for fixed elements.
  - Status: UNTESTED

---

## 14. Edge Cases (TC-131 through TC-145)

- [ ] TC-131: Empty display name handling
  - Steps: 1. Create account without display name 2. Navigate to Home and Profile
  - Expected: Home page omits first name greeting. Profile shows "No name set" with pencil icon.
  - Status: UNTESTED

- [ ] TC-132: Very long workout session duration
  - Steps: 1. Start a workout 2. Leave app running for 3+ hours 3. Complete workout
  - Expected: Duration calculation handles long sessions correctly. Review shows correct duration in minutes. Timer does not overflow.
  - Status: UNTESTED

- [ ] TC-133: Rapidly toggling exercise completion
  - Steps: 1. In active workout 2. Rapidly complete and uncomplete an exercise
  - Expected: No race conditions. Final state is consistent. Database and local store are in sync after rapid toggling.
  - Status: UNTESTED

- [ ] TC-134: Network error during set logging
  - Steps: 1. In active workout 2. Go offline 3. Log a set
  - Expected: Optimistic update shows set as logged. Set queued for sync. No error toast (handled by offline queue). Set syncs when back online.
  - Status: UNTESTED

- [ ] TC-135: ExerciseDB API fallback behavior
  - Steps: 1. Remove VITE_RAPIDAPI_KEY from env 2. Navigate to Exercise Library
  - Expected: App falls back to ExerciseDB V1 OSS API. Exercises still load (may be different format). No crash or blank screen.
  - Status: UNTESTED

- [ ] TC-136: localStorage cache for ExerciseDB
  - Steps: 1. Load exercises from ExerciseDB 2. Check localStorage 3. Wait for cache to expire
  - Expected: Successful API responses cached with 7-day TTL. Miss/error responses cached with 1-hour TTL. Subsequent loads use cache until expiry.
  - Status: UNTESTED

- [ ] TC-137: Concurrent session prevention
  - Steps: 1. Open app in two browser tabs 2. Start a workout in tab 1 3. Try to start a different workout in tab 2
  - Expected: RLS policy enforces one active session per user. Second tab should see the existing active session or receive an error.
  - Status: UNTESTED

- [ ] TC-138: Password reset with mismatched passwords
  - Steps: 1. Navigate to password reset (either Profile or Auth reset mode) 2. Enter password 3. Enter different confirmation password 4. Submit
  - Expected: Error message "Passwords do not match" displayed. Form not submitted.
  - Status: UNTESTED

- [ ] TC-139: Delete account confirmation
  - Steps: 1. On Profile page 2. Open delete modal 3. Type "delete" (lowercase) 4. Try to submit
  - Expected: Button remains disabled. Only exact "DELETE" (uppercase) enables the button.
  - Status: UNTESTED

- [ ] TC-140: Community feed with no workouts
  - Steps: 1. New app with no completed workouts 2. Navigate to Community
  - Expected: Empty state with appropriate icon and message. "Discover" tab shows suggested users and challenges even with no feed items.
  - Status: UNTESTED

- [ ] TC-141: Exercise Library with API downtime
  - Steps: 1. Navigate to Exercise Library when ExerciseDB API is unreachable
  - Expected: Loading skeletons shown then error state. No crash. App remains functional. Other features (workout, history) unaffected.
  - Status: UNTESTED

- [ ] TC-142: Calendar with no data for current month
  - Steps: 1. Navigate to History 2. Navigate to a future month with no data
  - Expected: Calendar grid renders with empty days. No errors. Month navigation still works.
  - Status: UNTESTED

- [ ] TC-143: Workout with zero exercises
  - Steps: 1. Navigate to a workout day that has no exercises in any section
  - Expected: Pre-workout view shows 0 exercises. Exercise list area is empty but page does not crash. Start button still functional.
  - Status: UNTESTED

- [ ] TC-144: Schedule with all rest days
  - Steps: 1. Set all 7 days to rest days in Schedule
  - Expected: All days show moon icon and "Rest Day". Home page ScheduleWidget shows rest day for today. No workout prompt shown.
  - Status: UNTESTED

- [ ] TC-145: Deep link with URL parameters
  - Steps: 1. Navigate to `/exercises?bodyPart=chest` directly 2. Observe Exercise Library
  - Expected: Body Part tab is active. "chest" category is pre-selected. Exercise list for chest loads automatically.
  - Status: UNTESTED

---

## Test Execution Summary

| Section | Total | Pass | Fail | Blocked | Untested |
|---------|-------|------|------|---------|----------|
| Authentication | 10 | 0 | 0 | 0 | 10 |
| Home Page | 10 | 0 | 0 | 0 | 10 |
| Workout - Weights | 15 | 0 | 0 | 0 | 15 |
| Workout - Cardio | 10 | 0 | 0 | 0 | 10 |
| Workout - Mobility | 5 | 0 | 0 | 0 | 5 |
| Exercise Library | 10 | 0 | 0 | 0 | 10 |
| History & Calendar | 10 | 0 | 0 | 0 | 10 |
| Profile & Settings | 10 | 0 | 0 | 0 | 10 |
| Schedule Management | 10 | 0 | 0 | 0 | 10 |
| Community | 10 | 0 | 0 | 0 | 10 |
| Navigation & Routing | 10 | 0 | 0 | 0 | 10 |
| Offline & Sync | 5 | 0 | 0 | 0 | 5 |
| Visual & Layout | 15 | 0 | 0 | 0 | 15 |
| Edge Cases | 15 | 0 | 0 | 0 | 15 |
| **TOTAL** | **145** | **0** | **0** | **0** | **145** |
