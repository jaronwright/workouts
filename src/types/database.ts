export interface Database {
  public: {
    Tables: {
      workout_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      workout_days: {
        Row: {
          id: string
          plan_id: string
          day_number: number
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          day_number: number
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          day_number?: number
          name?: string
          created_at?: string
        }
      }
      exercise_sections: {
        Row: {
          id: string
          workout_day_id: string
          name: string
          duration_minutes: number | null
          sort_order: number
        }
        Insert: {
          id?: string
          workout_day_id: string
          name: string
          duration_minutes?: number | null
          sort_order: number
        }
        Update: {
          id?: string
          workout_day_id?: string
          name?: string
          duration_minutes?: number | null
          sort_order?: number
        }
      }
      plan_exercises: {
        Row: {
          id: string
          section_id: string
          name: string
          sets: number | null
          reps_min: number | null
          reps_max: number | null
          reps_unit: string
          is_per_side: boolean
          target_weight: number | null
          weight_unit: 'lbs' | 'kg'
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          section_id: string
          name: string
          sets?: number | null
          reps_min?: number | null
          reps_max?: number | null
          reps_unit?: string
          is_per_side?: boolean
          target_weight?: number | null
          weight_unit?: 'lbs' | 'kg'
          notes?: string | null
          sort_order: number
        }
        Update: {
          id?: string
          section_id?: string
          name?: string
          sets?: number | null
          reps_min?: number | null
          reps_max?: number | null
          reps_unit?: string
          is_per_side?: boolean
          target_weight?: number | null
          weight_unit?: 'lbs' | 'kg'
          notes?: string | null
          sort_order?: number
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          workout_day_id: string
          started_at: string
          completed_at: string | null
          notes: string | null
          is_public: boolean
        }
        Insert: {
          id?: string
          user_id: string
          workout_day_id: string
          started_at?: string
          completed_at?: string | null
          notes?: string | null
          is_public?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          workout_day_id?: string
          started_at?: string
          completed_at?: string | null
          notes?: string | null
          is_public?: boolean
        }
      }
      exercise_sets: {
        Row: {
          id: string
          session_id: string
          plan_exercise_id: string
          set_number: number
          reps_completed: number | null
          weight_used: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          plan_exercise_id: string
          set_number: number
          reps_completed?: number | null
          weight_used?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          plan_exercise_id?: string
          set_number?: number
          reps_completed?: number | null
          weight_used?: number | null
          completed?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          current_cycle_day: number
          last_workout_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          current_cycle_day?: number
          last_workout_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          current_cycle_day?: number
          last_workout_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          name: string
          type: 'weights' | 'cardio' | 'mobility'
          category: string | null
          description: string | null
          icon: string | null
          duration_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'weights' | 'cardio' | 'mobility'
          category?: string | null
          description?: string | null
          icon?: string | null
          duration_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'weights' | 'cardio' | 'mobility'
          category?: string | null
          description?: string | null
          icon?: string | null
          duration_minutes?: number | null
          created_at?: string
        }
      }
      user_schedules: {
        Row: {
          id: string
          user_id: string
          day_number: number
          template_id: string | null
          workout_day_id: string | null
          is_rest_day: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_number: number
          template_id?: string | null
          workout_day_id?: string | null
          is_rest_day?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_number?: number
          template_id?: string | null
          workout_day_id?: string | null
          is_rest_day?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          plan_exercise_id: string
          weight: number
          reps: number | null
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_exercise_id: string
          weight: number
          reps?: number | null
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_exercise_id?: string
          weight?: number
          reps?: number | null
          achieved_at?: string
        }
      }
      template_workout_sessions: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          started_at: string
          completed_at: string | null
          duration_minutes: number | null
          distance_value: number | null
          distance_unit: 'miles' | 'km' | 'yards' | 'meters' | null
          notes: string | null
          is_public: boolean
          created_at: string
          interval_workout_id: string | null
          pool_length_meters: number | null
          avg_pace_per_km: number | null
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          started_at?: string
          completed_at?: string | null
          duration_minutes?: number | null
          distance_value?: number | null
          distance_unit?: 'miles' | 'km' | 'yards' | 'meters' | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
          interval_workout_id?: string | null
          pool_length_meters?: number | null
          avg_pace_per_km?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          started_at?: string
          completed_at?: string | null
          duration_minutes?: number | null
          distance_value?: number | null
          distance_unit?: 'miles' | 'km' | 'yards' | 'meters' | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
          interval_workout_id?: string | null
          pool_length_meters?: number | null
          avg_pace_per_km?: number | null
        }
      }
      user_race_goals: {
        Row: {
          id: string
          user_id: string
          race_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          target_finish_time_minutes: number
          swim_distance_meters: number
          bike_distance_km: number
          run_distance_km: number
          target_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          race_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          target_finish_time_minutes: number
          swim_distance_meters: number
          bike_distance_km: number
          run_distance_km: number
          target_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          race_type?: 'sprint' | 'olympic' | '70.3' | 'ironman'
          target_finish_time_minutes?: number
          swim_distance_meters?: number
          bike_distance_km?: number
          run_distance_km?: number
          target_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_pace_zones: {
        Row: {
          id: string
          user_id: string
          race_goal_id: string
          sport: 'swim' | 'bike' | 'run'
          z1_recovery_pace_low: number
          z1_recovery_pace_high: number
          z2_easy_pace_low: number
          z2_easy_pace_high: number
          z3_tempo_pace_low: number
          z3_tempo_pace_high: number
          z4_threshold_pace_low: number
          z4_threshold_pace_high: number
          z5_vo2max_pace_low: number
          z5_vo2max_pace_high: number
          race_pace: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          race_goal_id: string
          sport: 'swim' | 'bike' | 'run'
          z1_recovery_pace_low: number
          z1_recovery_pace_high: number
          z2_easy_pace_low: number
          z2_easy_pace_high: number
          z3_tempo_pace_low: number
          z3_tempo_pace_high: number
          z4_threshold_pace_low: number
          z4_threshold_pace_high: number
          z5_vo2max_pace_low: number
          z5_vo2max_pace_high: number
          race_pace: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          race_goal_id?: string
          sport?: 'swim' | 'bike' | 'run'
          z1_recovery_pace_low?: number
          z1_recovery_pace_high?: number
          z2_easy_pace_low?: number
          z2_easy_pace_high?: number
          z3_tempo_pace_low?: number
          z3_tempo_pace_high?: number
          z4_threshold_pace_low?: number
          z4_threshold_pace_high?: number
          z5_vo2max_pace_low?: number
          z5_vo2max_pace_high?: number
          race_pace?: number
          created_at?: string
        }
      }
      interval_workout_templates: {
        Row: {
          id: string
          name: string
          sport: 'swim' | 'bike' | 'run'
          difficulty: 'easy' | 'moderate' | 'hard' | 'race_pace'
          description: string | null
          total_distance_meters: number | null
          estimated_duration_minutes: number | null
          target_zone: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          is_system_template: boolean
          created_by_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sport: 'swim' | 'bike' | 'run'
          difficulty: 'easy' | 'moderate' | 'hard' | 'race_pace'
          description?: string | null
          total_distance_meters?: number | null
          estimated_duration_minutes?: number | null
          target_zone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          is_system_template?: boolean
          created_by_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sport?: 'swim' | 'bike' | 'run'
          difficulty?: 'easy' | 'moderate' | 'hard' | 'race_pace'
          description?: string | null
          total_distance_meters?: number | null
          estimated_duration_minutes?: number | null
          target_zone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          is_system_template?: boolean
          created_by_user_id?: string | null
          created_at?: string
        }
      }
      interval_workout_segments: {
        Row: {
          id: string
          template_id: string
          segment_type: 'warmup' | 'main' | 'cooldown' | 'rest' | 'recovery'
          sort_order: number
          name: string | null
          repeat_count: number
          duration_seconds: number | null
          distance_meters: number | null
          target_zone: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          target_pace_percentage: number | null
          rest_seconds: number
          instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          segment_type: 'warmup' | 'main' | 'cooldown' | 'rest' | 'recovery'
          sort_order: number
          name?: string | null
          repeat_count?: number
          duration_seconds?: number | null
          distance_meters?: number | null
          target_zone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          target_pace_percentage?: number | null
          rest_seconds?: number
          instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          segment_type?: 'warmup' | 'main' | 'cooldown' | 'rest' | 'recovery'
          sort_order?: number
          name?: string | null
          repeat_count?: number
          duration_seconds?: number | null
          distance_meters?: number | null
          target_zone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          target_pace_percentage?: number | null
          rest_seconds?: number
          instructions?: string | null
          created_at?: string
        }
      }
      interval_session_logs: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          template_workout_session_id: string | null
          segment_id: string | null
          segment_index: number
          actual_duration_seconds: number | null
          actual_distance_meters: number | null
          actual_pace_seconds: number | null
          started_at: string
          completed_at: string | null
          avg_heart_rate: number | null
          max_heart_rate: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          template_workout_session_id?: string | null
          segment_id?: string | null
          segment_index: number
          actual_duration_seconds?: number | null
          actual_distance_meters?: number | null
          actual_pace_seconds?: number | null
          started_at: string
          completed_at?: string | null
          avg_heart_rate?: number | null
          max_heart_rate?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          template_workout_session_id?: string | null
          segment_id?: string | null
          segment_index?: number
          actual_duration_seconds?: number | null
          actual_distance_meters?: number | null
          actual_pace_seconds?: number | null
          started_at?: string
          completed_at?: string | null
          avg_heart_rate?: number | null
          max_heart_rate?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      training_plans: {
        Row: {
          id: string
          name: string
          race_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          duration_weeks: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          description: string | null
          goal_description: string | null
          weekly_hours_min: number | null
          weekly_hours_max: number | null
          is_system_plan: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          race_type: 'sprint' | 'olympic' | '70.3' | 'ironman'
          duration_weeks: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          description?: string | null
          goal_description?: string | null
          weekly_hours_min?: number | null
          weekly_hours_max?: number | null
          is_system_plan?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          race_type?: 'sprint' | 'olympic' | '70.3' | 'ironman'
          duration_weeks?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          description?: string | null
          goal_description?: string | null
          weekly_hours_min?: number | null
          weekly_hours_max?: number | null
          is_system_plan?: boolean
          created_at?: string
        }
      }
      training_plan_weeks: {
        Row: {
          id: string
          plan_id: string
          week_number: number
          phase: 'base' | 'build' | 'peak' | 'taper' | 'recovery'
          focus: string | null
          total_hours: number | null
          swim_hours: number | null
          bike_hours: number | null
          run_hours: number | null
          strength_hours: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          week_number: number
          phase: 'base' | 'build' | 'peak' | 'taper' | 'recovery'
          focus?: string | null
          total_hours?: number | null
          swim_hours?: number | null
          bike_hours?: number | null
          run_hours?: number | null
          strength_hours?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          week_number?: number
          phase?: 'base' | 'build' | 'peak' | 'taper' | 'recovery'
          focus?: string | null
          total_hours?: number | null
          swim_hours?: number | null
          bike_hours?: number | null
          run_hours?: number | null
          strength_hours?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      training_plan_workouts: {
        Row: {
          id: string
          week_id: string
          day_of_week: number
          sport: 'swim' | 'bike' | 'run' | 'strength' | 'brick' | 'rest'
          workout_type: string | null
          interval_template_id: string | null
          duration_minutes: number | null
          distance_meters: number | null
          target_zone: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          description: string | null
          is_key_workout: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          week_id: string
          day_of_week: number
          sport: 'swim' | 'bike' | 'run' | 'strength' | 'brick' | 'rest'
          workout_type?: string | null
          interval_template_id?: string | null
          duration_minutes?: number | null
          distance_meters?: number | null
          target_zone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          description?: string | null
          is_key_workout?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          week_id?: string
          day_of_week?: number
          sport?: 'swim' | 'bike' | 'run' | 'strength' | 'brick' | 'rest'
          workout_type?: string | null
          interval_template_id?: string | null
          duration_minutes?: number | null
          distance_meters?: number | null
          target_zone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | null
          description?: string | null
          is_key_workout?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      user_training_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          race_goal_id: string | null
          start_date: string
          current_week: number
          status: 'active' | 'paused' | 'completed' | 'abandoned'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          race_goal_id?: string | null
          start_date: string
          current_week?: number
          status?: 'active' | 'paused' | 'completed' | 'abandoned'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          race_goal_id?: string | null
          start_date?: string
          current_week?: number
          status?: 'active' | 'paused' | 'completed' | 'abandoned'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      brick_workout_sessions: {
        Row: {
          id: string
          user_id: string
          user_training_plan_id: string | null
          name: string | null
          started_at: string
          completed_at: string | null
          total_duration_minutes: number | null
          notes: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_training_plan_id?: string | null
          name?: string | null
          started_at?: string
          completed_at?: string | null
          total_duration_minutes?: number | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_training_plan_id?: string | null
          name?: string | null
          started_at?: string
          completed_at?: string | null
          total_duration_minutes?: number | null
          notes?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      brick_workout_legs: {
        Row: {
          id: string
          brick_session_id: string
          leg_number: number
          sport: 'swim' | 'bike' | 'run'
          template_workout_session_id: string | null
          transition_time_seconds: number | null
          started_at: string | null
          completed_at: string | null
          duration_minutes: number | null
          distance_meters: number | null
          avg_pace_per_km: number | null
          avg_heart_rate: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brick_session_id: string
          leg_number: number
          sport: 'swim' | 'bike' | 'run'
          template_workout_session_id?: string | null
          transition_time_seconds?: number | null
          started_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          distance_meters?: number | null
          avg_pace_per_km?: number | null
          avg_heart_rate?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brick_session_id?: string
          leg_number?: number
          sport?: 'swim' | 'bike' | 'run'
          template_workout_session_id?: string | null
          transition_time_seconds?: number | null
          started_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          distance_meters?: number | null
          avg_pace_per_km?: number | null
          avg_heart_rate?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      activity_reactions: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          template_session_id: string | null
          reaction_type: 'fire' | 'strong' | 'props' | 'impressive'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          template_session_id?: string | null
          reaction_type: 'fire' | 'strong' | 'props' | 'impressive'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          template_session_id?: string | null
          reaction_type?: 'fire' | 'strong' | 'props' | 'impressive'
          created_at?: string
        }
      }
      workout_photos: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          template_session_id: string | null
          photo_url: string
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          template_session_id?: string | null
          photo_url: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          template_session_id?: string | null
          photo_url?: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      community_notifications: {
        Row: {
          id: string
          recipient_id: string
          actor_id: string
          notification_type: 'reaction' | 'photo_reaction'
          reaction_id: string | null
          session_id: string | null
          template_session_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          actor_id: string
          notification_type: 'reaction' | 'photo_reaction'
          reaction_id?: string | null
          session_id?: string | null
          template_session_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          actor_id?: string
          notification_type?: 'reaction' | 'photo_reaction'
          reaction_id?: string | null
          session_id?: string | null
          template_session_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
