/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { ExerciseCard } from '../ExerciseCard'
import type { PlanExercise, ExerciseSet } from '@/types/workout'

// Mock hooks
vi.mock('@/hooks/useWorkoutSession', () => ({
  useLastWeight: vi.fn().mockReturnValue({ data: undefined }),
}))

vi.mock('@/hooks/useProgression', () => ({
  useProgressionSuggestion: vi.fn().mockReturnValue({ data: undefined }),
}))

vi.mock('@/services/workoutService', () => ({
  updateExerciseWeightUnit: vi.fn().mockResolvedValue(null),
}))

// Mock the ExerciseDetailModal to simplify tests
vi.mock('../ExerciseDetailModal', () => ({
  ExerciseDetailModal: ({ isOpen, onClose, exerciseName }: any) =>
    isOpen ? (
      <div data-testid="exercise-detail-modal">
        <span>{exerciseName}</span>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}))

// Mock ProgressionBadge
vi.mock('../ProgressionBadge', () => ({
  ProgressionBadge: ({ suggestion, onClick }: any) => (
    <button data-testid="progression-badge" onClick={onClick}>
      Try {suggestion.suggestedWeight} lbs
    </button>
  ),
}))

import { useLastWeight } from '@/hooks/useWorkoutSession'
import { useProgressionSuggestion } from '@/hooks/useProgression'
import { updateExerciseWeightUnit } from '@/services/workoutService'

const mockUseLastWeight = vi.mocked(useLastWeight)
const mockUseProgressionSuggestion = vi.mocked(useProgressionSuggestion)
const mockUpdateExerciseWeightUnit = vi.mocked(updateExerciseWeightUnit)

const createMockExercise = (overrides: Partial<PlanExercise> = {}): PlanExercise => ({
  id: 'exercise-1',
  section_id: 'section-1',
  name: 'Bench Press',
  sets: 3,
  reps_min: 8,
  reps_max: 12,
  reps_unit: 'reps',
  is_per_side: false,
  target_weight: 135,
  weight_unit: 'lbs',
  notes: null,
  sort_order: 1,
  ...overrides,
})

const createMockExerciseSet = (overrides: Partial<ExerciseSet> = {}): ExerciseSet => ({
  id: 'set-1',
  session_id: 'session-1',
  plan_exercise_id: 'exercise-1',
  set_number: 1,
  reps_completed: 10,
  weight_used: 135,
  completed: true,
  created_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

// Helper to render with a specific exercise, avoiding spread-override issues
function renderExerciseCard(overrides: {
  exercise?: PlanExercise
  completedSets?: ExerciseSet[]
  onExerciseComplete?: ReturnType<typeof vi.fn>
  onExerciseUncomplete?: ReturnType<typeof vi.fn>
  onExerciseUpdate?: ReturnType<typeof vi.fn>
} = {}) {
  return render(
    <ExerciseCard
      exercise={overrides.exercise ?? createMockExercise()}
      completedSets={overrides.completedSets ?? []}
      onExerciseComplete={overrides.onExerciseComplete ?? vi.fn()}
      onExerciseUncomplete={overrides.onExerciseUncomplete}
      onExerciseUpdate={overrides.onExerciseUpdate}
    />
  )
}

describe('ExerciseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLastWeight.mockReturnValue({ data: undefined } as any)
    mockUseProgressionSuggestion.mockReturnValue({ data: undefined } as any)
    mockUpdateExerciseWeightUnit.mockResolvedValue(null)
  })

  describe('rendering', () => {
    it('renders the exercise name', () => {
      renderExerciseCard()
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    it('renders the set/rep info', () => {
      renderExerciseCard()
      // formatSetReps for 3x8-12 should produce "3x8-12"
      expect(screen.getByText('3x8-12')).toBeInTheDocument()
    })

    it('renders the weight input for non-bodyweight exercises', () => {
      renderExerciseCard()
      const input = screen.getByPlaceholderText('0')
      expect(input).toBeInTheDocument()
    })

    it('renders the weight unit button', () => {
      renderExerciseCard()
      expect(screen.getByText('lbs')).toBeInTheDocument()
    })

    it('renders the info button', () => {
      renderExerciseCard()
      const buttons = screen.getAllByRole('button')
      // Should have at least the complete toggle and info button
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('displays the target weight as default in the input', () => {
      renderExerciseCard()
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      expect(input.value).toBe('135')
    })
  })

  describe('bodyweight exercises', () => {
    it('does not render weight input for push-up exercises', () => {
      renderExerciseCard({ exercise: createMockExercise({ name: 'Push-ups' }) })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('does not render weight input for exercises with minutes reps_unit', () => {
      renderExerciseCard({
        exercise: createMockExercise({ name: 'Treadmill Walk', reps_unit: 'minutes' }),
      })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('does not render weight input for exercises with seconds reps_unit', () => {
      renderExerciseCard({
        exercise: createMockExercise({ name: 'Plank Hold', reps_unit: 'seconds' }),
      })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('does not render weight input for band exercises', () => {
      renderExerciseCard({ exercise: createMockExercise({ name: 'Band Pull-apart' }) })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('does not render weight input for plank exercises', () => {
      renderExerciseCard({ exercise: createMockExercise({ name: 'Side Plank' }) })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('does not render weight input for pull-up exercises', () => {
      renderExerciseCard({ exercise: createMockExercise({ name: 'Pull-ups' }) })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('does not render weight input for exercises with steps reps_unit', () => {
      renderExerciseCard({
        exercise: createMockExercise({ name: 'Walking Lunges', reps_unit: 'steps' }),
      })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })
  })

  describe('completion toggle', () => {
    it('shows uncompleted state with circle icon when not completed', () => {
      renderExerciseCard()
      const toggleButton = screen.getAllByRole('button')[0]
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton.className).toContain('border-2')
    })

    it('calls onExerciseComplete with reps and weight when toggled to complete', () => {
      const onExerciseComplete = vi.fn()
      renderExerciseCard({ onExerciseComplete })
      const toggleButton = screen.getAllByRole('button')[0]
      fireEvent.click(toggleButton)
      expect(onExerciseComplete).toHaveBeenCalledWith(8, 135)
    })

    it('calls onExerciseComplete with null weight for bodyweight exercises', () => {
      const onExerciseComplete = vi.fn()
      renderExerciseCard({
        exercise: createMockExercise({ name: 'Push-ups' }),
        onExerciseComplete,
      })
      const toggleButton = screen.getAllByRole('button')[0]
      fireEvent.click(toggleButton)
      expect(onExerciseComplete).toHaveBeenCalledWith(8, null)
    })

    it('shows completed state with check icon when completed', () => {
      renderExerciseCard({ completedSets: [createMockExerciseSet()] })
      const toggleButton = screen.getAllByRole('button')[0]
      expect(toggleButton.className).toContain('bg-[var(--color-success)]')
    })

    it('calls onExerciseUncomplete when toggled while already completed', () => {
      const onExerciseUncomplete = vi.fn()
      renderExerciseCard({
        completedSets: [createMockExerciseSet()],
        onExerciseUncomplete,
      })
      const toggleButton = screen.getAllByRole('button')[0]
      fireEvent.click(toggleButton)
      expect(onExerciseUncomplete).toHaveBeenCalledTimes(1)
    })

    it('hides weight input when completed', () => {
      renderExerciseCard({ completedSets: [createMockExerciseSet()] })
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
    })

    it('displays the completed weight when exercise is completed', () => {
      renderExerciseCard({
        completedSets: [createMockExerciseSet({ weight_used: 145 })],
      })
      expect(screen.getByText(/145/)).toBeInTheDocument()
    })
  })

  describe('weight input', () => {
    it('allows typing a weight value', async () => {
      const user = userEvent.setup()
      renderExerciseCard({ exercise: createMockExercise({ target_weight: null }) })
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      await user.clear(input)
      await user.type(input, '185')
      expect(input.value).toBe('185')
    })

    it('only allows numeric input', async () => {
      const user = userEvent.setup()
      renderExerciseCard({ exercise: createMockExercise({ target_weight: null }) })
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      await user.type(input, 'abc123')
      expect(input.value).toBe('123')
    })

    it('allows decimal values', async () => {
      const user = userEvent.setup()
      renderExerciseCard({ exercise: createMockExercise({ target_weight: null }) })
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      await user.type(input, '22.5')
      expect(input.value).toBe('22.5')
    })

    it('uses the weight value when completing', () => {
      const onExerciseComplete = vi.fn()
      renderExerciseCard({
        exercise: createMockExercise({ target_weight: null }),
        onExerciseComplete,
      })
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      fireEvent.change(input, { target: { value: '200' } })
      const toggleButton = screen.getAllByRole('button')[0]
      fireEvent.click(toggleButton)
      expect(onExerciseComplete).toHaveBeenCalledWith(8, 200)
    })

    it('sends null weight when input is empty', () => {
      const onExerciseComplete = vi.fn()
      renderExerciseCard({
        exercise: createMockExercise({ target_weight: null }),
        onExerciseComplete,
      })
      const toggleButton = screen.getAllByRole('button')[0]
      fireEvent.click(toggleButton)
      expect(onExerciseComplete).toHaveBeenCalledWith(8, null)
    })
  })

  describe('weight unit toggle', () => {
    it('displays lbs by default', () => {
      renderExerciseCard()
      expect(screen.getByText('lbs')).toBeInTheDocument()
    })

    it('displays kg when exercise weight_unit is kg', () => {
      renderExerciseCard({ exercise: createMockExercise({ weight_unit: 'kg' }) })
      expect(screen.getByText('kg')).toBeInTheDocument()
    })

    it('toggles unit from lbs to kg when unit button clicked', async () => {
      renderExerciseCard()
      const unitButton = screen.getByText('lbs')
      fireEvent.click(unitButton)
      await waitFor(() => {
        expect(screen.getByText('kg')).toBeInTheDocument()
      })
    })

    it('calls updateExerciseWeightUnit when unit is toggled', async () => {
      renderExerciseCard()
      const unitButton = screen.getByText('lbs')
      fireEvent.click(unitButton)
      await waitFor(() => {
        expect(mockUpdateExerciseWeightUnit).toHaveBeenCalledWith('exercise-1', 'kg')
      })
    })

    it('reverts unit on error', async () => {
      mockUpdateExerciseWeightUnit.mockRejectedValue(new Error('Network error'))
      renderExerciseCard()
      const unitButton = screen.getByText('lbs')
      fireEvent.click(unitButton)
      await waitFor(() => {
        expect(screen.getByText('lbs')).toBeInTheDocument()
      })
    })
  })

  describe('last weight badge', () => {
    it('shows last weight when available and no progression suggestion', () => {
      mockUseLastWeight.mockReturnValue({ data: 130 } as any)
      renderExerciseCard()
      expect(screen.getByText(/Last: 130 lbs/)).toBeInTheDocument()
    })

    it('does not show last weight badge for bodyweight exercises', () => {
      mockUseLastWeight.mockReturnValue({ data: 130 } as any)
      renderExerciseCard({ exercise: createMockExercise({ name: 'Push-ups' }) })
      expect(screen.queryByText(/Last:/)).not.toBeInTheDocument()
    })

    it('does not show last weight badge when exercise is completed', () => {
      mockUseLastWeight.mockReturnValue({ data: 130 } as any)
      renderExerciseCard({ completedSets: [createMockExerciseSet()] })
      expect(screen.queryByText(/Last:/)).not.toBeInTheDocument()
    })

    it('does not show last weight badge when progression suggestion exists', () => {
      mockUseLastWeight.mockReturnValue({ data: 130 } as any)
      mockUseProgressionSuggestion.mockReturnValue({
        data: {
          exerciseId: 'exercise-1',
          currentWeight: 130,
          suggestedWeight: 135,
          increase: 5,
          reason: 'Good progress',
        },
      } as any)
      renderExerciseCard()
      expect(screen.queryByText(/Last:/)).not.toBeInTheDocument()
    })
  })

  describe('progression badge', () => {
    it('shows progression badge when suggestion is available', () => {
      mockUseProgressionSuggestion.mockReturnValue({
        data: {
          exerciseId: 'exercise-1',
          currentWeight: 130,
          suggestedWeight: 135,
          increase: 5,
          reason: 'Good progress',
        },
      } as any)
      renderExerciseCard()
      expect(screen.getByTestId('progression-badge')).toBeInTheDocument()
    })

    it('applies progression suggestion when clicked', () => {
      mockUseProgressionSuggestion.mockReturnValue({
        data: {
          exerciseId: 'exercise-1',
          currentWeight: 130,
          suggestedWeight: 140,
          increase: 10,
          reason: 'Strong performance',
        },
      } as any)
      renderExerciseCard()
      fireEvent.click(screen.getByTestId('progression-badge'))
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      expect(input.value).toBe('140')
    })
  })

  describe('last weight initialization', () => {
    it('initializes weight from lastWeight hook', () => {
      mockUseLastWeight.mockReturnValue({ data: 155 } as any)
      renderExerciseCard({ exercise: createMockExercise({ target_weight: null }) })
      const input = screen.getByPlaceholderText('0') as HTMLInputElement
      expect(input.value).toBe('155')
    })
  })

  describe('exercise detail modal', () => {
    it('does not show detail modal by default', () => {
      renderExerciseCard()
      expect(screen.queryByTestId('exercise-detail-modal')).not.toBeInTheDocument()
    })

    it('opens detail modal when info button is clicked', () => {
      renderExerciseCard()
      const buttons = screen.getAllByRole('button')
      const infoButton = buttons[buttons.length - 1]
      fireEvent.click(infoButton)
      expect(screen.getByTestId('exercise-detail-modal')).toBeInTheDocument()
    })

    it('closes detail modal when close is triggered', () => {
      renderExerciseCard()
      const buttons = screen.getAllByRole('button')
      const infoButton = buttons[buttons.length - 1]
      fireEvent.click(infoButton)
      expect(screen.getByTestId('exercise-detail-modal')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Close Modal'))
      expect(screen.queryByTestId('exercise-detail-modal')).not.toBeInTheDocument()
    })

    it('passes exercise name to the modal', () => {
      renderExerciseCard()
      const buttons = screen.getAllByRole('button')
      const infoButton = buttons[buttons.length - 1]
      fireEvent.click(infoButton)
      // Both the exercise card and modal show "Bench Press"
      expect(screen.getByTestId('exercise-detail-modal')).toHaveTextContent('Bench Press')
    })
  })

  describe('completed exercise display', () => {
    it('shows success styling when completed', () => {
      const { container } = renderExerciseCard({
        completedSets: [createMockExerciseSet()],
      })
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-[var(--color-success)]')
    })

    it('applies success text color to exercise name when completed', () => {
      renderExerciseCard({ completedSets: [createMockExerciseSet()] })
      const name = screen.getByText('Bench Press')
      expect(name.className).toContain('text-[var(--color-success)]')
    })
  })

  describe('exercise with notes', () => {
    it('highlights info button when exercise has notes', () => {
      renderExerciseCard({ exercise: createMockExercise({ notes: 'Keep elbows tucked' }) })
      const buttons = screen.getAllByRole('button')
      const infoButton = buttons[buttons.length - 1]
      expect(infoButton.className).toContain('text-[var(--color-primary)]')
    })

    it('uses muted color for info button when no notes', () => {
      renderExerciseCard({ exercise: createMockExercise({ notes: null }) })
      const buttons = screen.getAllByRole('button')
      const infoButton = buttons[buttons.length - 1]
      expect(infoButton.className).toContain('text-[var(--color-text-muted)]')
    })
  })

  describe('per-side exercises', () => {
    it('renders per-side formatting', () => {
      renderExerciseCard({
        exercise: createMockExercise({
          name: 'Lunges',
          sets: 3,
          reps_min: 10,
          reps_max: 10,
          is_per_side: true,
        }),
      })
      expect(screen.getByText('3x10/side')).toBeInTheDocument()
    })
  })
})
