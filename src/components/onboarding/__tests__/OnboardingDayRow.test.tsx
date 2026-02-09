import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { OnboardingDayRow, type DaySelection } from '../OnboardingDayRow'
import type { WorkoutTemplate } from '@/services/scheduleService'

// Mock workoutConfig
vi.mock('@/config/workoutConfig', () => ({
  WEIGHTS_CONFIG: {
    push: { color: '#6366F1', bgColor: 'rgba(99,102,241,0.15)', gradient: '', icon: () => null },
    pull: { color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.15)', gradient: '', icon: () => null },
    legs: { color: '#EC4899', bgColor: 'rgba(236,72,153,0.15)', gradient: '', icon: () => null },
    upper: { color: '#6366F1', bgColor: 'rgba(99,102,241,0.15)', gradient: '', icon: () => null },
    lower: { color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.15)', gradient: '', icon: () => null },
  },
  getCardioStyle: () => ({ color: '#14B8A6', bgColor: 'rgba(20,184,166,0.15)', gradient: '', icon: () => null }),
  getMobilityStyle: () => ({ color: '#10B981', bgColor: 'rgba(16,185,129,0.15)', gradient: '', icon: () => null }),
  getWorkoutDisplayName: (name: string | null | undefined) => name || 'Workout',
}))

const mockWorkoutDays = [
  { id: 'day-1', name: 'Push (Chest, Shoulders)', day_number: 1 },
  { id: 'day-2', name: 'Pull (Back, Biceps)', day_number: 2 },
  { id: 'day-3', name: 'Legs (Quads, Hamstrings)', day_number: 3 },
]

const mockCardioTemplates: WorkoutTemplate[] = [
  { id: 'cardio-1', name: 'Running', type: 'cardio', category: 'run', description: null, icon: null, duration_minutes: 30, workout_day_id: null, created_at: '' },
  { id: 'cardio-2', name: 'Cycling', type: 'cardio', category: 'cycle', description: null, icon: null, duration_minutes: 45, workout_day_id: null, created_at: '' },
]

const mockMobilityTemplates: WorkoutTemplate[] = [
  { id: 'mob-1', name: 'Core Stability', type: 'mobility', category: 'core', description: null, icon: null, duration_minutes: 15, workout_day_id: null, created_at: '' },
]

interface RenderProps {
  dayNumber?: number
  selections?: DaySelection[]
  onSelect?: (s: DaySelection[]) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

function renderDayRow({
  dayNumber = 1,
  selections = [],
  onSelect = vi.fn(),
  isExpanded = false,
  onToggleExpand = vi.fn(),
}: RenderProps = {}) {
  return render(
    <OnboardingDayRow
      dayNumber={dayNumber}
      selections={selections}
      onSelect={onSelect}
      workoutDays={mockWorkoutDays}
      cardioTemplates={mockCardioTemplates}
      mobilityTemplates={mockMobilityTemplates}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    />
  )
}

describe('OnboardingDayRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('collapsed state', () => {
    it('shows the day number', () => {
      renderDayRow({ dayNumber: 3 })
      expect(screen.getByText('Day 3')).toBeInTheDocument()
    })

    it('shows "Tap to choose" when empty', () => {
      renderDayRow({ selections: [] })
      expect(screen.getByText('Tap to choose')).toBeInTheDocument()
    })

    it('shows day number in the circle when not configured', () => {
      renderDayRow({ dayNumber: 5 })
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows "Rest Day" for rest selection', () => {
      renderDayRow({ selections: [{ type: 'rest' }] })
      expect(screen.getByText('Rest Day')).toBeInTheDocument()
    })

    it('shows workout name for single weights selection', () => {
      renderDayRow({
        selections: [{ type: 'weights', id: 'day-1', label: 'Push' }],
      })
      expect(screen.getByText('Push')).toBeInTheDocument()
    })

    it('shows colored chips for multiple selections', () => {
      renderDayRow({
        selections: [
          { type: 'weights', id: 'day-1', label: 'Push' },
          { type: 'cardio', id: 'cardio-1', label: 'Running', category: 'run' },
        ],
      })
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
    })

    it('shows check icon when configured', () => {
      const { container } = renderDayRow({
        selections: [{ type: 'rest' }],
      })
      // Check icon should appear (green check)
      const checkCircle = container.querySelector('.bg-green-500\\/20')
      expect(checkCircle).toBeInTheDocument()
    })

    it('does not show check icon when empty', () => {
      const { container } = renderDayRow({ selections: [] })
      const checkCircle = container.querySelector('.bg-green-500\\/20')
      expect(checkCircle).not.toBeInTheDocument()
    })
  })

  describe('toggle expand', () => {
    it('calls onToggleExpand when header is clicked', () => {
      const onToggleExpand = vi.fn()
      renderDayRow({ onToggleExpand })
      fireEvent.click(screen.getByText('Tap to choose'))
      expect(onToggleExpand).toHaveBeenCalledTimes(1)
    })

    it('calls onToggleExpand when day label is clicked', () => {
      const onToggleExpand = vi.fn()
      renderDayRow({ onToggleExpand, dayNumber: 2 })
      fireEvent.click(screen.getByText('Day 2'))
      expect(onToggleExpand).toHaveBeenCalledTimes(1)
    })
  })

  describe('expanded state - empty selection', () => {
    it('shows workout picker when expanded with empty selection', () => {
      renderDayRow({ isExpanded: true, selections: [] })
      expect(screen.getByText('Rest Day')).toBeInTheDocument()
      expect(screen.getByText('Recovery and rest')).toBeInTheDocument()
    })

    it('shows weights section with workout options', () => {
      renderDayRow({ isExpanded: true, selections: [] })
      expect(screen.getByText('Weights')).toBeInTheDocument()
      expect(screen.getByText('Push (Chest, Shoulders)')).toBeInTheDocument()
      expect(screen.getByText('Pull (Back, Biceps)')).toBeInTheDocument()
      expect(screen.getByText('Legs (Quads, Hamstrings)')).toBeInTheDocument()
    })

    it('shows cardio section with template options', () => {
      renderDayRow({ isExpanded: true, selections: [] })
      expect(screen.getByText('Cardio')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Cycling')).toBeInTheDocument()
    })

    it('shows mobility section with template options', () => {
      renderDayRow({ isExpanded: true, selections: [] })
      expect(screen.getByText('Mobility')).toBeInTheDocument()
      expect(screen.getByText('Core Stability')).toBeInTheDocument()
    })
  })

  describe('expanded state - selecting rest', () => {
    it('calls onSelect with rest when Rest Day option is clicked', () => {
      const onSelect = vi.fn()
      const onToggleExpand = vi.fn()
      renderDayRow({ isExpanded: true, selections: [], onSelect, onToggleExpand })

      // Click Rest Day in the picker (there will be two "Rest Day" texts -
      // one is the option label, we need the button)
      const restButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.includes('Rest Day') && btn.textContent?.includes('Recovery')
      )
      fireEvent.click(restButtons[0])

      expect(onSelect).toHaveBeenCalledWith([{ type: 'rest' }])
      expect(onToggleExpand).toHaveBeenCalled()
    })
  })

  describe('expanded state - selecting weights', () => {
    it('calls onSelect when a weights option is clicked', () => {
      const onSelect = vi.fn()
      const onToggleExpand = vi.fn()
      renderDayRow({ isExpanded: true, selections: [], onSelect, onToggleExpand })

      // Click "Push (Chest, Shoulders)" option
      const pushButton = screen.getByText('Push (Chest, Shoulders)').closest('button')
      expect(pushButton).not.toBeNull()
      fireEvent.click(pushButton!)

      expect(onSelect).toHaveBeenCalledWith([{
        type: 'weights',
        id: 'day-1',
        label: 'Push (Chest, Shoulders)',
        dayNumber: 1,
      }])
    })
  })

  describe('expanded state - selecting cardio', () => {
    it('calls onSelect when a cardio option is clicked', () => {
      const onSelect = vi.fn()
      const onToggleExpand = vi.fn()
      renderDayRow({ isExpanded: true, selections: [], onSelect, onToggleExpand })

      const runButton = screen.getByText('Running').closest('button')
      expect(runButton).not.toBeNull()
      fireEvent.click(runButton!)

      expect(onSelect).toHaveBeenCalledWith([{
        type: 'cardio',
        id: 'cardio-1',
        label: 'Running',
        category: 'run',
      }])
    })
  })

  describe('expanded state - selecting mobility', () => {
    it('calls onSelect when a mobility option is clicked', () => {
      const onSelect = vi.fn()
      const onToggleExpand = vi.fn()
      renderDayRow({ isExpanded: true, selections: [], onSelect, onToggleExpand })

      const coreButton = screen.getByText('Core Stability').closest('button')
      expect(coreButton).not.toBeNull()
      fireEvent.click(coreButton!)

      expect(onSelect).toHaveBeenCalledWith([{
        type: 'mobility',
        id: 'mob-1',
        label: 'Core Stability',
        category: 'core',
      }])
    })
  })

  describe('expanded state - with existing workouts', () => {
    const existingSelection: DaySelection[] = [
      { type: 'weights', id: 'day-1', label: 'Push' },
    ]

    it('shows current workouts with remove buttons', () => {
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
      })
      // Push appears in both the header and the expanded workout list
      const pushTexts = screen.getAllByText('Push')
      expect(pushTexts.length).toBeGreaterThanOrEqual(2)
    })

    it('shows Add Workout button', () => {
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
      })
      expect(screen.getByText('Add Workout')).toBeInTheDocument()
    })

    it('shows Clear all button', () => {
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
      })
      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })

    it('calls onSelect without the removed item when remove is clicked', () => {
      const onSelect = vi.fn()
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
        onSelect,
      })

      // Find the remove (X) button - it should be inside the workout item
      const removeButtons = screen.getAllByRole('button').filter(btn => {
        const svg = btn.querySelector('svg')
        return svg && btn.className.includes('hover:text-red-500')
      })
      expect(removeButtons.length).toBeGreaterThan(0)
      fireEvent.click(removeButtons[0])

      expect(onSelect).toHaveBeenCalledWith([])
    })

    it('calls onSelect with empty array on Clear all', () => {
      const onSelect = vi.fn()
      const onToggleExpand = vi.fn()
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
        onSelect,
        onToggleExpand,
      })

      fireEvent.click(screen.getByText('Clear all'))
      expect(onSelect).toHaveBeenCalledWith([])
      expect(onToggleExpand).toHaveBeenCalled()
    })

    it('shows picker when Add Workout is clicked', () => {
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
      })

      fireEvent.click(screen.getByText('Add Workout'))
      // Now the picker should be visible
      expect(screen.getByText('Weights')).toBeInTheDocument()
      expect(screen.getByText('Cardio')).toBeInTheDocument()
    })

    it('appends new workout to existing selections', () => {
      const onSelect = vi.fn()
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
        onSelect,
      })

      // Click Add Workout to show picker
      fireEvent.click(screen.getByText('Add Workout'))

      // Select a cardio workout
      const runButton = screen.getByText('Running').closest('button')
      fireEvent.click(runButton!)

      expect(onSelect).toHaveBeenCalledWith([
        ...existingSelection,
        { type: 'cardio', id: 'cardio-1', label: 'Running', category: 'run' },
      ])
    })

    it('shows Cancel button when adding to existing workouts', () => {
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
      })

      fireEvent.click(screen.getByText('Add Workout'))
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('hides picker when Cancel is clicked', () => {
      renderDayRow({
        isExpanded: true,
        selections: existingSelection,
      })

      fireEvent.click(screen.getByText('Add Workout'))
      fireEvent.click(screen.getByText('Cancel'))

      // Picker should be hidden, Add Workout should be visible again
      expect(screen.getByText('Add Workout')).toBeInTheDocument()
    })
  })

  describe('overtraining warning', () => {
    it('shows warning when 3 or more sessions are scheduled', () => {
      const selections: DaySelection[] = [
        { type: 'weights', id: 'day-1', label: 'Push' },
        { type: 'cardio', id: 'cardio-1', label: 'Running', category: 'run' },
        { type: 'mobility', id: 'mob-1', label: 'Core Stability', category: 'core' },
      ]

      renderDayRow({ isExpanded: true, selections })
      expect(screen.getByText(/increases injury and overtraining risk/)).toBeInTheDocument()
    })

    it('does not show warning with 2 sessions', () => {
      const selections: DaySelection[] = [
        { type: 'weights', id: 'day-1', label: 'Push' },
        { type: 'cardio', id: 'cardio-1', label: 'Running', category: 'run' },
      ]

      renderDayRow({ isExpanded: true, selections })
      expect(screen.queryByText(/increases injury and overtraining risk/)).not.toBeInTheDocument()
    })

    it('does not show warning with 1 session', () => {
      renderDayRow({
        isExpanded: true,
        selections: [{ type: 'weights', id: 'day-1', label: 'Push' }],
      })
      expect(screen.queryByText(/increases injury and overtraining risk/)).not.toBeInTheDocument()
    })
  })

  describe('selected state indicator', () => {
    it('highlights already selected weights option in picker', () => {
      renderDayRow({
        isExpanded: true,
        selections: [{ type: 'weights', id: 'day-1', label: 'Push' }],
      })

      // Click Add Workout to see picker
      fireEvent.click(screen.getByText('Add Workout'))

      // The Push option should be marked as selected
      const pushButton = screen.getByText('Push (Chest, Shoulders)').closest('button')
      expect(pushButton?.className).toContain('border-[var(--color-primary)]')
    })
  })

  describe('rest replaces all', () => {
    it('replaces existing workouts with rest when rest is selected', () => {
      const onSelect = vi.fn()
      const onToggleExpand = vi.fn()
      renderDayRow({
        isExpanded: true,
        selections: [{ type: 'weights', id: 'day-1', label: 'Push' }],
        onSelect,
        onToggleExpand,
      })

      // Click Add Workout
      fireEvent.click(screen.getByText('Add Workout'))

      // Click Rest Day option
      const restButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.includes('Rest Day') && btn.textContent?.includes('Recovery')
      )
      fireEvent.click(restButtons[0])

      expect(onSelect).toHaveBeenCalledWith([{ type: 'rest' }])
      expect(onToggleExpand).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('renders with no workout days', () => {
      render(
        <OnboardingDayRow
          dayNumber={1}
          selections={[]}
          onSelect={vi.fn()}
          workoutDays={[]}
          cardioTemplates={[]}
          mobilityTemplates={[]}
          isExpanded={true}
          onToggleExpand={vi.fn()}
        />
      )
      // Should still render rest day option
      expect(screen.getByText(/Rest Day/)).toBeInTheDocument()
      // No Weights, Cardio, Mobility sections
      expect(screen.queryByText('Weights')).not.toBeInTheDocument()
      expect(screen.queryByText('Cardio')).not.toBeInTheDocument()
      expect(screen.queryByText('Mobility')).not.toBeInTheDocument()
    })

    it('renders with dayNumber 7', () => {
      renderDayRow({ dayNumber: 7 })
      expect(screen.getByText('Day 7')).toBeInTheDocument()
    })
  })
})
