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
        }
        Insert: {
          id?: string
          user_id: string
          workout_day_id: string
          started_at?: string
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_day_id?: string
          started_at?: string
          completed_at?: string | null
          notes?: string | null
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
