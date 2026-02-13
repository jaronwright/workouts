import type { Tables } from './database'

// ─── Reaction Types ──────────────────────────────────

export type ReactionType = 'fire' | 'strong' | 'props' | 'impressive'

export interface Reaction {
  id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
  user_profile?: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

// ─── Feed Types ──────────────────────────────────────

export type WorkoutType = 'weights' | 'cardio' | 'mobility'

export interface FeedUserProfile {
  display_name: string | null
  avatar_url: string | null
  selected_plan_id: string | null
  hide_weight_details: boolean
}

export interface FeedExerciseSet {
  id: string
  plan_exercise_id: string
  set_number: number
  reps_completed: number | null
  weight_used: number | null
  completed: boolean
  plan_exercise: {
    name: string
    weight_unit: 'lbs' | 'kg'
  }
}

export interface FeedReview {
  overall_rating: number
  difficulty_rating: number | null
  energy_level: number | null
  mood_before: string | null
  mood_after: string | null
  performance_tags: string[]
  reflection: string | null
}

export interface FeedPhoto {
  id: string
  photo_url: string
  caption: string | null
}

export interface FeedWorkout {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  notes: string | null
  is_public: boolean
  type: WorkoutType

  // User info
  user_profile: FeedUserProfile | null

  // Workout identity
  workout_name: string
  workout_category: string | null

  // Metrics (varies by type)
  duration_minutes: number | null
  distance_value: number | null
  distance_unit: string | null

  // Rich data (loaded with feed or on expand)
  exercises: FeedExerciseSet[]
  review: FeedReview | null
  reactions: Reaction[]
  photos: FeedPhoto[]

  // Computed
  total_volume: number | null
  exercise_count: number
  streak_days: number | null
}

// ─── Notification Types ──────────────────────────────

export type NotificationType = 'reaction' | 'photo_reaction'

export interface CommunityNotification {
  id: string
  recipient_id: string
  actor_id: string
  notification_type: NotificationType
  reaction_id: string | null
  session_id: string | null
  template_session_id: string | null
  is_read: boolean
  created_at: string
  // Joined data
  actor_profile?: {
    display_name: string | null
    avatar_url: string | null
  } | null
  reaction?: {
    reaction_type: ReactionType
  } | null
}

// ─── Public Profile Types ────────────────────────────

export interface PublicProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  selected_plan_id: string | null
  plan_name: string | null
  hide_weight_details: boolean
  stats: {
    total_workouts: number
    current_streak: number
    this_week: number
  }
  recent_workouts: FeedWorkout[]
}

// ─── Photo Types ─────────────────────────────────────

export type WorkoutPhoto = Tables<'workout_photos'>
