# Screen Inventory

## Overview

Complete inventory of every screen in the Workout Tracker PWA. Each entry documents the route, component, purpose, key UI elements, data dependencies, and authentication requirements.

---

## Screen List

### 1. AuthPage -- Sign In / Sign Up / Forgot Password

| Field | Value |
|-------|-------|
| **Route** | `/auth` |
| **Component** | `AuthPage` (`src/pages/Auth.tsx`) |
| **Auth Required** | No (PublicRoute -- redirects to `/` if already signed in) |
| **Purpose** | User authentication: sign in, sign up, forgot password, and reset password flows |
| **Key UI Elements** | Brand header with dumbbell icon and app name; Sign In / Sign Up tabbed toggle; Email input field; Password input field with PasswordStrengthIndicator (sign up mode); Display Name input (sign up mode); Remember Me checkbox and Forgot Password link (sign in mode); Sign In / Create Account gradient button; "or continue with" divider; Google OAuth button; Forgot Password form (email + send reset link); Reset Password form (new password + confirm + PasswordStrengthIndicator); Error and success message banners |
| **Data Dependencies** | `useAuth` hook (signIn, signUp, signInWithGoogle, resetPassword, updatePassword); `useAuthStore` for session state; `upsertProfile` from profileService |
| **States** | 4 modes: signin, signup, forgot, reset; Loading state on buttons; Error/success messages; Form validation states |
| **Navigation** | Redirects to `/` on successful sign in; Redirects to Google OAuth on Google sign in; Back to sign in from forgot password |

---

### 2. AuthCallbackPage -- OAuth Redirect Handler

| Field | Value |
|-------|-------|
| **Route** | `/auth/callback` |
| **Component** | `AuthCallbackPage` (`src/pages/AuthCallback.tsx`) |
| **Auth Required** | No (processes OAuth callback) |
| **Purpose** | Handles the OAuth redirect from Google, exchanges code for session, and redirects user to the app |
| **Key UI Elements** | Loading spinner or redirect indicator |
| **Data Dependencies** | Supabase auth callback processing; `useAuthStore` session hydration |
| **States** | Processing (loading), Success (redirect to `/`), Error (redirect to `/auth` with error) |
| **Navigation** | Redirects to `/` on success; Redirects to `/auth` on failure |

---

### 3. HomePage -- Main Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Component** | `HomePage` (`src/pages/Home.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Main dashboard showing today's workout, stats, weather, explore exercises, and recent activity |
| **Key UI Elements** | Time-of-day greeting with user's first name (Syne heading); ScheduleWidget (today's workout, active session banner with Continue/Dismiss); WeatherCard; Stats row (streak, this week, total) in unified surface card with animated numbers; Explore Exercises horizontal scroll of body part chips; Recent Activity list (last 3 completed workouts with type icons, names, durations, relative times); OnboardingWizard modal (auto-opens for new users with no schedule) |
| **Data Dependencies** | `useActiveSession`, `useUserSessions`, `useDeleteSession` from useWorkoutSession; `useProfile`; `useUserSchedule`; `useUserTemplateWorkouts`; `useBodyPartList` from useExerciseLibrary |
| **States** | Loading (skeleton states for stats); Empty (no workouts, no body parts); Active session present; Onboarding needed |
| **Navigation** | Stats card links to `/history`; Recent activity items link to `/history/:id` or `/history/cardio/:id`; Body part chips link to `/exercises?bodyPart=X`; "Browse All" links to `/exercises`; "See All" links to `/history` |

---

### 4. WorkoutSelectPage -- Choose Workout

| Field | Value |
|-------|-------|
| **Route** | `/workouts` |
| **Component** | `WorkoutSelectPage` (`src/pages/WorkoutSelect.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Browse and select available workout types: weights days, cardio templates, and mobility categories |
| **Key UI Elements** | Active session warning banner (if one exists) with dismiss option; Weights section with WorkoutDayCard components for each available day; Cardio section with CardioCard components showing last session data; Mobility section with category cards; Back navigation |
| **Data Dependencies** | `useSelectedPlanDays` from useWorkoutPlan; `useActiveSession`, `useDeleteSession` from useWorkoutSession; `useWorkoutTemplatesByType` from useSchedule; `useMobilityCategories` from useMobilityTemplates; `useUserTemplateWorkouts` for last session data |
| **States** | Loading; Active session exists; No workout data; Empty categories |
| **Navigation** | Weights cards navigate to `/workout/:dayId`; Cardio cards navigate to `/cardio/:templateId`; Mobility cards navigate to `/mobility/:category/select` |

---

### 5. WorkoutPage -- Pre-Workout View

| Field | Value |
|-------|-------|
| **Route** | `/workout/:dayId` |
| **Component** | `WorkoutPage` (`src/pages/Workout.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Preview workout exercises before starting; editorial magazine-style layout |
| **Key UI Elements** | Large workout name (clamp-scaled heading); Exercise count and estimated duration; Motivational quote (italic, delayed fade); Section headers with yellow accent bars; Exercise list with names and compact sets/reps; Floating "Start Workout" button with glass backdrop and animated arrow; Motivational splash screen (lime background, expanding rings, quote, loading spinner) |
| **Data Dependencies** | `useWorkoutDay` from useWorkoutPlan; `useStartWorkout` from useWorkoutSession; `useWorkoutStore` for active session state |
| **States** | Loading (skeleton cards); Not found; Pre-workout (no active session); Splash screen (starting workout); Post-workout review modal |
| **Navigation** | Back button; After start, transitions to active workout view; PostWorkoutReview navigates to `/` on complete |

---

### 6. WorkoutPage -- Active Workout

| Field | Value |
|-------|-------|
| **Route** | `/workout/:dayId/active` |
| **Component** | `WorkoutPage` (`src/pages/Workout.tsx`) -- active session branch |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Active workout session with exercise tracking, set logging, and rest timer |
| **Key UI Elements** | RestTimer component; Collapsible warm-up sections; Exercise cards (ExerciseCard) with weight/rep inputs and completion controls; Section headers with yellow accent bars; "Complete Workout" gradient button; PostWorkoutReview modal |
| **Data Dependencies** | `useWorkoutDay`; `useCompleteWorkout`, `useLogSet`, `useDeleteSet`, `useSessionSets` from useWorkoutSession; `useWorkoutStore` (activeSession, completedSets); `useWakeLock`; `useReviewStore` |
| **States** | Active session with logged sets; Completing workout (loading); Post-workout review flow (4-step wizard) |
| **Navigation** | Back button; Complete Workout triggers review then navigates to `/` |

---

### 7. CardioWorkoutPage

| Field | Value |
|-------|-------|
| **Route** | `/cardio/:templateId` |
| **Component** | `CardioWorkoutPage` (`src/pages/CardioWorkout.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Log a cardio workout with manual entry or timer |
| **Key UI Elements** | Editorial hero with category icon (gradient background), template name, and last session info; Metric toggle pills (time/distance modes); Large input area (numeric input or slider depending on mode); "Use Timer" collapsible section with start/pause/resume controls and large time display; "Log Workout" gradient button; PostWorkoutReview modal |
| **Data Dependencies** | `useTemplate`, `useLastTemplateSession`, `useQuickLogTemplateWorkout`, `useStartTemplateWorkout`, `useCompleteTemplateWorkout` from useTemplateWorkout; `useWakeLock`; `useReviewStore`; `CARDIO_INPUT_CONFIG` from cardioUtils |
| **States** | Loading; Not found; Manual entry (no timer); Timer running; Timer paused; Logging (pending); Post-workout review |
| **Navigation** | Back button; PostWorkoutReview navigates to `/` on complete |

---

### 8. MobilityDurationPickerPage

| Field | Value |
|-------|-------|
| **Route** | `/mobility/:category/select` |
| **Component** | `MobilityDurationPickerPage` (`src/pages/MobilityDurationPicker.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Select a duration variant for a mobility workout category |
| **Key UI Elements** | Category icon and name; Duration variant cards (Quick 15min, Standard 30min, Extended 45min, Full Session 60min) with clock icons; Back navigation |
| **Data Dependencies** | `useMobilityVariants` from useMobilityTemplates; `getMobilityStyle` from workoutConfig |
| **States** | Loading (skeleton cards); Not found (no variants); Variant list |
| **Navigation** | Back button; Selecting a variant navigates to `/mobility/:templateId` |

---

### 9. MobilityWorkoutPage

| Field | Value |
|-------|-------|
| **Route** | `/mobility/:templateId` |
| **Component** | `MobilityWorkoutPage` (`src/pages/MobilityWorkout.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Guided mobility workout with exercise checklist |
| **Key UI Elements** | Editorial hero with category icon, template name, duration, exercise count, and checked count; RestTimer component; Exercise checklist with toggleable check circles, exercise names with strikethrough on check, notes, and sets/reps detail; "Complete Workout (X/N)" gradient button (disabled when 0 checked); PostWorkoutReview modal |
| **Data Dependencies** | `useTemplate`, `useQuickLogTemplateWorkout` from useTemplateWorkout; `useWorkoutDay` from useWorkoutPlan; `useWakeLock`; `useReviewStore` |
| **States** | Loading; Not found; No exercises; Exercises with check state; Completing (pending); Post-workout review |
| **Navigation** | Back button; PostWorkoutReview navigates to `/history` on complete |

---

### 10. ExerciseLibraryPage

| Field | Value |
|-------|-------|
| **Route** | `/exercises` |
| **Component** | `ExerciseLibraryPage` (`src/pages/ExerciseLibrary.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Browse and search the exercise database by body part, muscle, or equipment |
| **Key UI Elements** | Search bar with clear button; Three browse tabs (Body Part, Muscle, Equipment) with animated indicator; Category chips (horizontal scroll); Exercise list items with GIF thumbnails, names, body part, equipment, and chevron; "Load more" button for pagination; Search results with total count; Empty states for no results and no category selected |
| **Data Dependencies** | `useBodyPartList`, `useTargetMuscleList`, `useEquipmentList`, `useExerciseBrowse`, `useExerciseSearch` from useExerciseLibrary; URL search params for initial bodyPart |
| **States** | Loading (shimmer skeletons); Browse mode (tabs + chips + results); Search mode (search results only); Empty category; No results |
| **Navigation** | Exercise items navigate to `/exercises/:exerciseId`; Bottom nav visible |

---

### 11. ExerciseDetailPage

| Field | Value |
|-------|-------|
| **Route** | `/exercises/:exerciseId` |
| **Component** | `ExerciseDetailPage` (`src/pages/ExerciseDetail.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Detailed view of a single exercise with GIF, instructions, muscles, and alternatives |
| **Key UI Elements** | GIF hero (4:3 aspect, loading spinner, error fallback); Exercise name (bold, capitalized); Tag pills (body parts with Target icon, equipment with Dumbbell icon); Tabbed content card (Instructions tab with numbered steps, Muscles tab with primary/secondary pills); Alternatives horizontal scroll (up to 6 cards with GIF thumbnails) |
| **Data Dependencies** | `useExerciseDetail`, `useExerciseAlternatives` from useExerciseLibrary |
| **States** | Loading (shimmer skeleton); Error/not found; Loaded with tabs; GIF loading/error states |
| **Navigation** | Back button (hideNav); Alternative exercise cards navigate to `/exercises/:exerciseId` |

---

### 12. HistoryPage

| Field | Value |
|-------|-------|
| **Route** | `/history` |
| **Component** | `HistoryPage` (`src/pages/History.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | View workout history via calendar and statistics |
| **Key UI Elements** | Calendar/Stats segmented control (floating glass pill with animated indicator); Calendar view: CalendarGrid with month navigation, day selection, workout indicators; Stats view: StatsGrid with aggregated statistics; BottomSheet with SelectedDayPanel for day detail; Empty state with pulsing ProgressRing |
| **Data Dependencies** | `useCalendarData` from useCalendarData (calendarDays, allSessions, today) |
| **States** | Loading (skeleton); Empty (no workouts); Calendar tab; Stats tab; Bottom sheet open/closed |
| **Navigation** | Bottom nav visible; Day selection opens bottom sheet; Workout entries in bottom sheet link to detail pages |

---

### 13. SessionDetailPage -- Weights Session

| Field | Value |
|-------|-------|
| **Route** | `/history/:sessionId` |
| **Component** | `SessionDetailPage` (`src/pages/SessionDetail.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Detailed view of a completed weights workout session |
| **Key UI Elements** | Workout name and date; Duration; Exercise breakdown with sets, weights, and reps; Review summary (rating, mood, tags, reflection) if submitted |
| **Data Dependencies** | Session data and exercise sets from workoutService; Review data from reviewService |
| **States** | Loading; Not found; Loaded with optional review data |
| **Navigation** | Back button |

---

### 14. CardioSessionDetailPage -- Cardio/Mobility Session

| Field | Value |
|-------|-------|
| **Route** | `/history/cardio/:sessionId` |
| **Component** | `CardioSessionDetailPage` (`src/pages/CardioSessionDetail.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Detailed view of a completed cardio or mobility session |
| **Key UI Elements** | Template name and category icon; Duration and distance (if logged); Session date; Review summary if submitted |
| **Data Dependencies** | Template session data from templateWorkoutService; Review data from reviewService |
| **States** | Loading; Not found; Loaded with optional review |
| **Navigation** | Back button |

---

### 15. ProfilePage

| Field | Value |
|-------|-------|
| **Route** | `/profile` |
| **Component** | `ProfilePage` (`src/pages/Profile.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | User profile management, settings, and app configuration |
| **Key UI Elements** | Player card hero: AvatarUpload, editable display name, email, warm glow backdrop; Trophy stats: total workouts, best streak, favorite workout; Workout Split selector: 6 plan options in 2-column grid with confirmation modal; Appearance: ThemePicker (light/dark/system); Notifications: NotificationSettings component; Privacy: Hide weight details toggle switch; Workout Cycle: current day of 7, cycle start date with date picker; Security: CollapsibleSection with change password (PasswordStrengthIndicator), sign out all devices, delete account; Email: CollapsibleSection with change email; Feedback: CollapsibleSection with bug/feature toggle pills, textarea, submit button, past submissions; Log Out button; Split change confirmation modal; OnboardingWizard (post-split-change); Delete account confirmation modal |
| **Data Dependencies** | `useProfile`, `useUpdateProfile`; `useCycleDay`; `useClearSchedule`; `useUserSessions`, `useUserTemplateWorkouts` for stats; `useAuthStore` (user, updatePassword, updateEmail, signOut, signOutAllDevices); `useSubmitFeedback`, `useUserFeedback`; `deleteUserAccount` from profileService |
| **States** | Loading; Editing name; Changing password (pending); Changing email (pending); Split change modal; Onboarding wizard; Delete account modal; Feedback submitted state |
| **Navigation** | Back button (hideNav); Onboarding close navigates to `/`; Sign out navigates to `/auth` |

---

### 16. SchedulePage

| Field | Value |
|-------|-------|
| **Route** | `/schedule` |
| **Component** | `SchedulePage` (`src/pages/Schedule.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | View and edit the 7-day workout cycle schedule |
| **Key UI Elements** | Hero heading: large current day number (pulsing animation), cycle info; 7-day pill selector (active day with lime glow, icons for assigned workouts); 7-Day Cycle list: day number circles, workout assignments (icon + colored name + subtitle), rest days (moon icon), empty slots (plus icon + "Add workout"); Left edge color indicators for workout types; ScheduleDayEditor bottom sheet/modal; Chevron arrows on each row |
| **Data Dependencies** | `useUserSchedule`; `useProfile`, `useUpdateProfile` for cycle day; `useCycleDay` |
| **States** | Loading (skeleton cards); Populated schedule; Empty slots; Editing a day (ScheduleDayEditor open) |
| **Navigation** | Bottom nav visible; Day rows open ScheduleDayEditor |

---

### 17. RestDayPage

| Field | Value |
|-------|-------|
| **Route** | `/rest-day` |
| **Component** | `RestDayPage` (`src/pages/RestDay.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Guided rest day activities and recovery suggestions |
| **Key UI Elements** | Rest day header with icon; Activity cards from `restDayActivities` config; Toggleable checkboxes for completed activities; Activity icons mapped from config |
| **Data Dependencies** | `restDayActivities` from config (static data); Local state for checked activities |
| **States** | Default (no activities checked); Activities checked (local state only) |
| **Navigation** | Back button |

---

### 18. CommunityPage

| Field | Value |
|-------|-------|
| **Route** | `/community` |
| **Component** | `CommunityPage` (`src/pages/Community.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | Social feed showing community workout activity, user discovery, challenges, and leaderboard |
| **Key UI Elements** | Notification bell in header with unread count badge; FeedTabs (Following/Discover); Discover tab extras: search bar for users, suggested users horizontal scroll, active challenge cards, leaderboard panel; Feed header with refresh button; WorkoutCard components for feed items; Infinite scroll sentinel with loading spinner; "You're all caught up!" end indicator; NotificationPanel bottom sheet; Privacy explainer modal (first visit); BadgeCelebration overlay for new badges; Empty states for both feed modes |
| **Data Dependencies** | `useSocialFeed`; `useFollowCounts`, `useSuggestedUsers`, `useSearchUsers` from useFollow; `useActiveChallenges`, `useJoinChallenge`; `useCheckBadges`; `useCommunityNotifications`, `useUnreadNotificationCount`, `useMarkNotificationsRead`; `useAuthStore` |
| **States** | Loading; Empty feed; Feed with items; Searching; Notifications panel open; Privacy modal; Badge celebration; Infinite scroll loading |
| **Navigation** | Bottom nav visible; User items navigate to `/community/profile/:userId`; WorkoutCard items may link to session details |

---

### 19. PublicProfilePage

| Field | Value |
|-------|-------|
| **Route** | `/community/profile/:userId` |
| **Component** | `PublicProfilePage` (`src/pages/PublicProfile.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | View another user's public profile, stats, badges, and recent workouts |
| **Key UI Elements** | User avatar and display name; Follow/Unfollow button; Public workout stats; Badge display; Recent workout activity list |
| **Data Dependencies** | Public profile data for the given userId; Follow state; Public workout history; Badge data |
| **States** | Loading; Not found; Loaded with stats and activity |
| **Navigation** | Back button; Workout items may link to public session detail |

---

### 20. PublicSessionDetailPage -- Weights Session

| Field | Value |
|-------|-------|
| **Route** | `/community/session/:sessionId` |
| **Component** | `PublicSessionDetailPage` (`src/pages/PublicSessionDetail.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | View details of another user's completed weights workout session |
| **Key UI Elements** | User info header; Workout name and date; Exercise breakdown (weights may be hidden based on user's privacy setting `hide_weight_details`); Reaction/comment controls |
| **Data Dependencies** | Public session data; User privacy preferences; Reaction and comment data |
| **States** | Loading; Not found; Loaded (with or without weight details based on privacy) |
| **Navigation** | Back button |

---

### 21. PublicSessionDetailPage -- Cardio Session

| Field | Value |
|-------|-------|
| **Route** | `/community/cardio/:sessionId` |
| **Component** | `PublicSessionDetailPage` (`src/pages/PublicSessionDetail.tsx`) |
| **Auth Required** | Yes (ProtectedRoute) |
| **Purpose** | View details of another user's completed cardio workout session |
| **Key UI Elements** | User info header; Template name and category icon; Duration and distance; Reaction/comment controls |
| **Data Dependencies** | Public template session data; Reaction and comment data |
| **States** | Loading; Not found; Loaded |
| **Navigation** | Back button |

---

## Route Summary Table

| # | Route | Component | Auth | Bottom Nav | Back Button |
|---|-------|-----------|------|-----------|-------------|
| 1 | `/auth` | AuthPage | Public | No | No |
| 2 | `/auth/callback` | AuthCallbackPage | Public | No | No |
| 3 | `/` | HomePage | Protected | Yes | No |
| 4 | `/workouts` | WorkoutSelectPage | Protected | No | Yes |
| 5 | `/workout/:dayId` | WorkoutPage (pre-workout) | Protected | No | Yes |
| 6 | `/workout/:dayId/active` | WorkoutPage (active) | Protected | No | Yes |
| 7 | `/cardio/:templateId` | CardioWorkoutPage | Protected | No | Yes |
| 8 | `/mobility/:category/select` | MobilityDurationPickerPage | Protected | No | Yes |
| 9 | `/mobility/:templateId` | MobilityWorkoutPage | Protected | No | Yes |
| 10 | `/exercises` | ExerciseLibraryPage | Protected | Yes | No |
| 11 | `/exercises/:exerciseId` | ExerciseDetailPage | Protected | No | Yes |
| 12 | `/history` | HistoryPage | Protected | Yes | No |
| 13 | `/history/:sessionId` | SessionDetailPage | Protected | No | Yes |
| 14 | `/history/cardio/:sessionId` | CardioSessionDetailPage | Protected | No | Yes |
| 15 | `/profile` | ProfilePage | Protected | No | Yes |
| 16 | `/schedule` | SchedulePage | Protected | Yes | No |
| 17 | `/rest-day` | RestDayPage | Protected | No | Yes |
| 18 | `/community` | CommunityPage | Protected | Yes | No |
| 19 | `/community/profile/:userId` | PublicProfilePage | Protected | No | Yes |
| 20 | `/community/session/:sessionId` | PublicSessionDetailPage | Protected | No | Yes |
| 21 | `/community/cardio/:sessionId` | PublicSessionDetailPage | Protected | No | Yes |
| -- | `*` (catch-all) | Navigate to `/` | -- | -- | -- |

---

## Shared Components Appearing Across Screens

| Component | Screens Used | Purpose |
|-----------|-------------|---------|
| `AppShell` | All screens | Layout wrapper with header, optional back button, optional bottom nav |
| `PostWorkoutReview` | WorkoutPage, CardioWorkoutPage, MobilityWorkoutPage | 4-step post-workout review wizard modal |
| `RestTimer` | WorkoutPage (active), MobilityWorkoutPage | Configurable rest timer between sets |
| `OnboardingWizard` | HomePage, ProfilePage | Multi-step onboarding for schedule setup |
| `BottomSheet` | HistoryPage, SchedulePage | Slide-up modal for contextual content |
| `ScheduleWidget` | HomePage | Today's workout card with active session controls |
| `WeatherCard` | HomePage | Current weather display |
| `FadeIn` / `StaggerList` / `StaggerItem` | All screens | Framer Motion animation wrappers |
| `Card` / `CardContent` | Most screens | Surface-level container components |
| `Button` | Most screens | Styled button with variants (gradient, secondary, danger) and loading state |
| `Modal` | ProfilePage | Centered overlay dialog |
| `Avatar` | CommunityPage, PublicProfilePage | User avatar display |
| `ThemePicker` | ProfilePage | Light/dark/system theme selector |
| `PasswordStrengthIndicator` | AuthPage, ProfilePage | Visual password strength meter |
