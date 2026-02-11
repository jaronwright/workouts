import { create } from 'zustand'
import type { MoodValue, PerformanceTag } from '@/services/reviewService'

export interface ReviewDraft {
  overallRating: number
  difficultyRating: number | null
  energyLevel: number | null
  moodBefore: MoodValue | null
  moodAfter: MoodValue | null
  performanceTags: PerformanceTag[]
  reflection: string
  highlights: string
  improvements: string
}

interface ReviewStoreState {
  // Modal state
  isReviewModalOpen: boolean
  currentSessionId: string | null
  currentTemplateSessionId: string | null
  sessionType: 'weights' | 'cardio' | 'mobility' | null
  workoutDurationMinutes: number | null

  // Draft review (multi-step form state)
  draft: ReviewDraft

  // Step: 0=rating, 1=mood+energy, 2=tags, 3=reflection
  step: number
  totalSteps: number

  // Actions
  openReview: (params: {
    sessionId?: string
    templateSessionId?: string
    sessionType: 'weights' | 'cardio' | 'mobility'
    durationMinutes?: number
  }) => void
  closeReview: () => void
  updateDraft: (updates: Partial<ReviewDraft>) => void
  toggleTag: (tag: PerformanceTag) => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  resetDraft: () => void
}

const defaultDraft: ReviewDraft = {
  overallRating: 0,
  difficultyRating: null,
  energyLevel: null,
  moodBefore: null,
  moodAfter: null,
  performanceTags: [],
  reflection: '',
  highlights: '',
  improvements: '',
}

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  isReviewModalOpen: false,
  currentSessionId: null,
  currentTemplateSessionId: null,
  sessionType: null,
  workoutDurationMinutes: null,
  draft: { ...defaultDraft },
  step: 0,
  totalSteps: 4,

  openReview: ({ sessionId, templateSessionId, sessionType, durationMinutes }) =>
    set({
      isReviewModalOpen: true,
      currentSessionId: sessionId || null,
      currentTemplateSessionId: templateSessionId || null,
      sessionType,
      workoutDurationMinutes: durationMinutes ?? null,
      draft: { ...defaultDraft },
      step: 0,
    }),

  closeReview: () =>
    set({
      isReviewModalOpen: false,
      currentSessionId: null,
      currentTemplateSessionId: null,
      sessionType: null,
      workoutDurationMinutes: null,
      draft: { ...defaultDraft },
      step: 0,
    }),

  updateDraft: (updates) =>
    set((state) => ({
      draft: { ...state.draft, ...updates },
    })),

  toggleTag: (tag) =>
    set((state) => {
      const tags = state.draft.performanceTags
      const hasTag = tags.includes(tag)
      return {
        draft: {
          ...state.draft,
          performanceTags: hasTag
            ? tags.filter((t) => t !== tag)
            : [...tags, tag],
        },
      }
    }),

  setStep: (step) => set({ step }),

  nextStep: () =>
    set((state) => ({ step: Math.min(state.step + 1, state.totalSteps - 1) })),

  prevStep: () =>
    set((state) => ({ step: Math.max(state.step - 1, 0) })),

  resetDraft: () => set({ draft: { ...defaultDraft }, step: 0 }),
}))
