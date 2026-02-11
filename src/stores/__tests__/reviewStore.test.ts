import { describe, it, expect, beforeEach } from 'vitest'
import { useReviewStore } from '../reviewStore'
import type { ReviewDraft } from '../reviewStore'

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

describe('reviewStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useReviewStore.setState({
      isReviewModalOpen: false,
      currentSessionId: null,
      currentTemplateSessionId: null,
      sessionType: null,
      workoutDurationMinutes: null,
      draft: { ...defaultDraft },
      step: 0,
      totalSteps: 4,
    })
  })

  // ────────────────────────────────────────────────────────
  // Initial state
  // ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with modal closed', () => {
      const state = useReviewStore.getState()
      expect(state.isReviewModalOpen).toBe(false)
    })

    it('starts with null session IDs', () => {
      const state = useReviewStore.getState()
      expect(state.currentSessionId).toBeNull()
      expect(state.currentTemplateSessionId).toBeNull()
    })

    it('starts with null session type', () => {
      const state = useReviewStore.getState()
      expect(state.sessionType).toBeNull()
    })

    it('starts with default draft', () => {
      const state = useReviewStore.getState()
      expect(state.draft).toEqual(defaultDraft)
    })

    it('starts at step 0 with 4 total steps', () => {
      const state = useReviewStore.getState()
      expect(state.step).toBe(0)
      expect(state.totalSteps).toBe(4)
    })
  })

  // ────────────────────────────────────────────────────────
  // openReview
  // ────────────────────────────────────────────────────────

  describe('openReview', () => {
    it('opens modal for a weights session', () => {
      useReviewStore.getState().openReview({
        sessionId: 'session-1',
        sessionType: 'weights',
        durationMinutes: 60,
      })

      const state = useReviewStore.getState()
      expect(state.isReviewModalOpen).toBe(true)
      expect(state.currentSessionId).toBe('session-1')
      expect(state.currentTemplateSessionId).toBeNull()
      expect(state.sessionType).toBe('weights')
      expect(state.workoutDurationMinutes).toBe(60)
    })

    it('opens modal for a cardio template session', () => {
      useReviewStore.getState().openReview({
        templateSessionId: 'template-session-1',
        sessionType: 'cardio',
        durationMinutes: 30,
      })

      const state = useReviewStore.getState()
      expect(state.isReviewModalOpen).toBe(true)
      expect(state.currentSessionId).toBeNull()
      expect(state.currentTemplateSessionId).toBe('template-session-1')
      expect(state.sessionType).toBe('cardio')
      expect(state.workoutDurationMinutes).toBe(30)
    })

    it('opens modal for a mobility template session', () => {
      useReviewStore.getState().openReview({
        templateSessionId: 'template-session-2',
        sessionType: 'mobility',
      })

      const state = useReviewStore.getState()
      expect(state.sessionType).toBe('mobility')
      expect(state.currentTemplateSessionId).toBe('template-session-2')
    })

    it('resets draft and step when opening', () => {
      // First modify draft and step
      useReviewStore.getState().updateDraft({ overallRating: 5 })
      useReviewStore.getState().setStep(2)

      // Then open review
      useReviewStore.getState().openReview({
        sessionId: 'session-1',
        sessionType: 'weights',
      })

      const state = useReviewStore.getState()
      expect(state.draft).toEqual(defaultDraft)
      expect(state.step).toBe(0)
    })

    it('sets workoutDurationMinutes to null when not provided', () => {
      useReviewStore.getState().openReview({
        sessionId: 'session-1',
        sessionType: 'weights',
      })

      expect(useReviewStore.getState().workoutDurationMinutes).toBeNull()
    })

    it('sets currentSessionId to null when sessionId is not provided', () => {
      useReviewStore.getState().openReview({
        templateSessionId: 'template-1',
        sessionType: 'cardio',
      })

      expect(useReviewStore.getState().currentSessionId).toBeNull()
    })
  })

  // ────────────────────────────────────────────────────────
  // closeReview
  // ────────────────────────────────────────────────────────

  describe('closeReview', () => {
    it('resets all state to initial values', () => {
      // Set up some state
      useReviewStore.getState().openReview({
        sessionId: 'session-1',
        sessionType: 'weights',
        durationMinutes: 45,
      })
      useReviewStore.getState().updateDraft({ overallRating: 4 })
      useReviewStore.getState().setStep(2)

      // Close
      useReviewStore.getState().closeReview()

      const state = useReviewStore.getState()
      expect(state.isReviewModalOpen).toBe(false)
      expect(state.currentSessionId).toBeNull()
      expect(state.currentTemplateSessionId).toBeNull()
      expect(state.sessionType).toBeNull()
      expect(state.workoutDurationMinutes).toBeNull()
      expect(state.draft).toEqual(defaultDraft)
      expect(state.step).toBe(0)
    })

    it('can close an already-closed modal without error', () => {
      useReviewStore.getState().closeReview()

      const state = useReviewStore.getState()
      expect(state.isReviewModalOpen).toBe(false)
    })
  })

  // ────────────────────────────────────────────────────────
  // updateDraft
  // ────────────────────────────────────────────────────────

  describe('updateDraft', () => {
    it('updates a single field', () => {
      useReviewStore.getState().updateDraft({ overallRating: 4 })

      expect(useReviewStore.getState().draft.overallRating).toBe(4)
    })

    it('merges partial updates without overwriting other fields', () => {
      useReviewStore.getState().updateDraft({ overallRating: 4, reflection: 'Good' })
      useReviewStore.getState().updateDraft({ moodBefore: 'neutral' })

      const { draft } = useReviewStore.getState()
      expect(draft.overallRating).toBe(4)
      expect(draft.reflection).toBe('Good')
      expect(draft.moodBefore).toBe('neutral')
    })

    it('updates mood fields', () => {
      useReviewStore.getState().updateDraft({
        moodBefore: 'tired',
        moodAfter: 'great',
      })

      const { draft } = useReviewStore.getState()
      expect(draft.moodBefore).toBe('tired')
      expect(draft.moodAfter).toBe('great')
    })

    it('updates energy and difficulty ratings', () => {
      useReviewStore.getState().updateDraft({
        difficultyRating: 5,
        energyLevel: 3,
      })

      const { draft } = useReviewStore.getState()
      expect(draft.difficultyRating).toBe(5)
      expect(draft.energyLevel).toBe(3)
    })

    it('updates text fields', () => {
      useReviewStore.getState().updateDraft({
        reflection: 'Solid session',
        highlights: 'New PR',
        improvements: 'More stretching',
      })

      const { draft } = useReviewStore.getState()
      expect(draft.reflection).toBe('Solid session')
      expect(draft.highlights).toBe('New PR')
      expect(draft.improvements).toBe('More stretching')
    })

    it('can set nullable fields to null', () => {
      useReviewStore.getState().updateDraft({ difficultyRating: 4 })
      useReviewStore.getState().updateDraft({ difficultyRating: null })

      expect(useReviewStore.getState().draft.difficultyRating).toBeNull()
    })
  })

  // ────────────────────────────────────────────────────────
  // toggleTag
  // ────────────────────────────────────────────────────────

  describe('toggleTag', () => {
    it('adds a tag when not present', () => {
      useReviewStore.getState().toggleTag('felt_strong')

      expect(useReviewStore.getState().draft.performanceTags).toEqual(['felt_strong'])
    })

    it('removes a tag when already present', () => {
      useReviewStore.getState().updateDraft({ performanceTags: ['felt_strong', 'pumped'] })
      useReviewStore.getState().toggleTag('felt_strong')

      expect(useReviewStore.getState().draft.performanceTags).toEqual(['pumped'])
    })

    it('can toggle multiple tags independently', () => {
      useReviewStore.getState().toggleTag('felt_strong')
      useReviewStore.getState().toggleTag('new_pr')
      useReviewStore.getState().toggleTag('pumped')

      expect(useReviewStore.getState().draft.performanceTags).toEqual([
        'felt_strong',
        'new_pr',
        'pumped',
      ])

      useReviewStore.getState().toggleTag('new_pr')

      expect(useReviewStore.getState().draft.performanceTags).toEqual([
        'felt_strong',
        'pumped',
      ])
    })

    it('handles toggling same tag on and off', () => {
      useReviewStore.getState().toggleTag('focused')
      expect(useReviewStore.getState().draft.performanceTags).toContain('focused')

      useReviewStore.getState().toggleTag('focused')
      expect(useReviewStore.getState().draft.performanceTags).not.toContain('focused')
    })
  })

  // ────────────────────────────────────────────────────────
  // Navigation: nextStep / prevStep / setStep
  // ────────────────────────────────────────────────────────

  describe('nextStep', () => {
    it('increments step from 0 to 1', () => {
      useReviewStore.getState().nextStep()

      expect(useReviewStore.getState().step).toBe(1)
    })

    it('increments step sequentially', () => {
      useReviewStore.getState().nextStep()
      useReviewStore.getState().nextStep()
      useReviewStore.getState().nextStep()

      expect(useReviewStore.getState().step).toBe(3)
    })

    it('does not exceed totalSteps - 1 (clamped at 3)', () => {
      useReviewStore.getState().setStep(3)
      useReviewStore.getState().nextStep()

      expect(useReviewStore.getState().step).toBe(3)
    })

    it('stays at max after repeated calls', () => {
      for (let i = 0; i < 10; i++) {
        useReviewStore.getState().nextStep()
      }

      expect(useReviewStore.getState().step).toBe(3)
    })
  })

  describe('prevStep', () => {
    it('decrements step from 1 to 0', () => {
      useReviewStore.getState().setStep(1)
      useReviewStore.getState().prevStep()

      expect(useReviewStore.getState().step).toBe(0)
    })

    it('does not go below 0', () => {
      useReviewStore.getState().prevStep()

      expect(useReviewStore.getState().step).toBe(0)
    })

    it('stays at 0 after repeated calls', () => {
      for (let i = 0; i < 10; i++) {
        useReviewStore.getState().prevStep()
      }

      expect(useReviewStore.getState().step).toBe(0)
    })
  })

  describe('setStep', () => {
    it('sets step to an arbitrary value', () => {
      useReviewStore.getState().setStep(2)

      expect(useReviewStore.getState().step).toBe(2)
    })

    it('sets step to 0', () => {
      useReviewStore.getState().setStep(2)
      useReviewStore.getState().setStep(0)

      expect(useReviewStore.getState().step).toBe(0)
    })

    it('sets step to the last step', () => {
      useReviewStore.getState().setStep(3)

      expect(useReviewStore.getState().step).toBe(3)
    })
  })

  // ────────────────────────────────────────────────────────
  // resetDraft
  // ────────────────────────────────────────────────────────

  describe('resetDraft', () => {
    it('resets draft to default values', () => {
      useReviewStore.getState().updateDraft({
        overallRating: 5,
        moodBefore: 'great',
        reflection: 'Amazing workout',
      })
      useReviewStore.getState().toggleTag('new_pr')

      useReviewStore.getState().resetDraft()

      expect(useReviewStore.getState().draft).toEqual(defaultDraft)
    })

    it('resets step to 0', () => {
      useReviewStore.getState().setStep(3)

      useReviewStore.getState().resetDraft()

      expect(useReviewStore.getState().step).toBe(0)
    })

    it('keeps modal open when resetting draft', () => {
      useReviewStore.getState().openReview({
        sessionId: 'session-1',
        sessionType: 'weights',
      })
      useReviewStore.getState().updateDraft({ overallRating: 3 })

      useReviewStore.getState().resetDraft()

      const state = useReviewStore.getState()
      expect(state.isReviewModalOpen).toBe(true)
      expect(state.currentSessionId).toBe('session-1')
      expect(state.draft).toEqual(defaultDraft)
    })
  })
})
