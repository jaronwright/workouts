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

  // Draft review
  draft: ReviewDraft

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

export const useReviewStore = create<ReviewStoreState>((set) => ({
  isReviewModalOpen: false,
  currentSessionId: null,
  currentTemplateSessionId: null,
  sessionType: null,
  workoutDurationMinutes: null,
  draft: { ...defaultDraft },

  openReview: ({ sessionId, templateSessionId, sessionType, durationMinutes }) =>
    set({
      isReviewModalOpen: true,
      currentSessionId: sessionId || null,
      currentTemplateSessionId: templateSessionId || null,
      sessionType,
      workoutDurationMinutes: durationMinutes ?? null,
      draft: { ...defaultDraft },
    }),

  closeReview: () =>
    set({
      isReviewModalOpen: false,
      currentSessionId: null,
      currentTemplateSessionId: null,
      sessionType: null,
      workoutDurationMinutes: null,
      draft: { ...defaultDraft },
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

  resetDraft: () => set({ draft: { ...defaultDraft } }),
}))
