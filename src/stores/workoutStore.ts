import { create } from 'zustand'
import type { WorkoutDayWithSections, WorkoutSession, ExerciseSet } from '@/types/workout'

interface WorkoutState {
  activeSession: WorkoutSession | null
  activeWorkoutDay: WorkoutDayWithSections | null
  completedSets: Map<string, ExerciseSet[]>
  restTimerSeconds: number
  restTimerInitialSeconds: number
  isRestTimerActive: boolean

  setActiveSession: (session: WorkoutSession | null) => void
  setActiveWorkoutDay: (day: WorkoutDayWithSections | null) => void
  addCompletedSet: (exerciseId: string, set: ExerciseSet) => void
  clearCompletedSets: () => void
  startRestTimer: (seconds: number) => void
  stopRestTimer: () => void
  pauseRestTimer: () => void
  resetRestTimer: () => void
  decrementRestTimer: () => void
  clearWorkout: () => void
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  activeWorkoutDay: null,
  completedSets: new Map(),
  restTimerSeconds: 0,
  restTimerInitialSeconds: 0,
  isRestTimerActive: false,

  setActiveSession: (session) => set({ activeSession: session }),

  setActiveWorkoutDay: (day) => set({ activeWorkoutDay: day }),

  addCompletedSet: (exerciseId, exerciseSet) => {
    const current = get().completedSets
    const updated = new Map(current)
    const existing = updated.get(exerciseId) || []
    updated.set(exerciseId, [...existing, exerciseSet])
    set({ completedSets: updated })
  },

  clearCompletedSets: () => set({ completedSets: new Map() }),

  startRestTimer: (seconds) => set({
    restTimerSeconds: seconds,
    restTimerInitialSeconds: seconds,
    isRestTimerActive: true
  }),

  stopRestTimer: () => set({
    restTimerSeconds: 0,
    restTimerInitialSeconds: 0,
    isRestTimerActive: false
  }),

  pauseRestTimer: () => set({
    isRestTimerActive: false
  }),

  resetRestTimer: () => {
    const initial = get().restTimerInitialSeconds
    set({
      restTimerSeconds: initial,
      isRestTimerActive: true
    })
  },

  decrementRestTimer: () => {
    const current = get().restTimerSeconds
    if (current <= 1) {
      set({ restTimerSeconds: 0, isRestTimerActive: false })
    } else {
      set({ restTimerSeconds: current - 1 })
    }
  },

  clearWorkout: () => set({
    activeSession: null,
    activeWorkoutDay: null,
    completedSets: new Map(),
    restTimerSeconds: 0,
    restTimerInitialSeconds: 0,
    isRestTimerActive: false
  })
}))
