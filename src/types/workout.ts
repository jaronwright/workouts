import type { Tables } from './database'

export type WorkoutPlan = Tables<'workout_plans'>
export type WorkoutDay = Tables<'workout_days'>
export type ExerciseSection = Tables<'exercise_sections'>
export type PlanExercise = Tables<'plan_exercises'>
export type WorkoutSession = Tables<'workout_sessions'>
export type ExerciseSet = Tables<'exercise_sets'>

export interface WorkoutDayWithSections extends WorkoutDay {
  sections: ExerciseSectionWithExercises[]
}

export interface ExerciseSectionWithExercises extends ExerciseSection {
  exercises: PlanExercise[]
}

export interface WorkoutSessionWithSets extends WorkoutSession {
  sets: ExerciseSet[]
  workout_day: WorkoutDay
}

export interface ActiveWorkout {
  session: WorkoutSession
  workoutDay: WorkoutDayWithSections
  completedSets: Map<string, ExerciseSet[]>
}
