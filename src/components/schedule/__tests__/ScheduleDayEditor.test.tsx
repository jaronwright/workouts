/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { ScheduleDayEditor } from '../ScheduleDayEditor'

vi.mock('@/hooks/useSchedule', () => ({
  useWorkoutTemplates: () => ({ data: [] }),
  useSaveScheduleDayWorkouts: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useSelectedPlanDays: () => ({
    data: [
      { id: 'wd-1', name: 'Push Day', day_number: 1 },
      { id: 'wd-2', name: 'Pull Day', day_number: 2 },
      { id: 'wd-3', name: 'Legs Day', day_number: 3 },
    ],
  }),
}))

vi.mock('@/config/workoutConfig', () => ({
  WEIGHTS_CONFIG: {
    push: { icon: () => null, color: '#3B82F6', bgColor: '#ddd' },
    pull: { icon: () => null, color: '#8B5CF6', bgColor: '#eee' },
    legs: { icon: () => null, color: '#F59E0B', bgColor: '#fff' },
    upper: { icon: () => null, color: '#10B981', bgColor: '#ddd' },
    lower: { icon: () => null, color: '#EF4444', bgColor: '#ddd' },
  },
  CATEGORY_DEFAULTS: {
    weights: { icon: () => null, color: '#000', bgColor: '#ccc' },
  },
  getWorkoutDisplayName: (name: string) => name || 'Workout',
  getCardioStyle: () => ({ icon: () => null, color: '#000', bgColor: '#ccc' }),
  getMobilityStyle: () => ({ icon: () => null, color: '#000', bgColor: '#ccc' }),
  getCategoryLabel: (type: string) => type,
}))

vi.mock('@/components/ui', () => ({
  BottomSheet: ({ children, isOpen, title }: any) => (
    isOpen ? <div data-testid="bottom-sheet"><h2>{title}</h2>{children}</div> : null
  ),
  Button: ({ children, onClick, loading, ...props }: any) => (
    <button onClick={onClick} disabled={loading} {...props}>{children}</button>
  ),
}))

function makeScheduleDay(overrides: any = {}): any {
  return {
    id: 'sched-1',
    user_id: 'user-1',
    day_number: 1,
    template_id: null,
    workout_day_id: 'wd-1',
    is_rest_day: false,
    sort_order: 0,
    created_at: '',
    updated_at: '',
    workout_day: { id: 'wd-1', name: 'Push Day', day_number: 1 },
    template: null,
    ...overrides,
  }
}

describe('ScheduleDayEditor - Overtraining Warning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not show overtraining warning when < 3 workouts', () => {
    const schedules = [
      makeScheduleDay({ sort_order: 0 }),
      makeScheduleDay({ id: 'sched-2', sort_order: 1, workout_day_id: 'wd-2', workout_day: { id: 'wd-2', name: 'Pull Day', day_number: 2 } }),
    ]

    render(
      <ScheduleDayEditor
        isOpen={true}
        onClose={vi.fn()}
        dayNumber={1}
        currentSchedules={schedules}
      />
    )

    expect(screen.queryByText(/overtraining risk/i)).not.toBeInTheDocument()
  })

  it('shows overtraining warning when 3+ workouts', () => {
    const schedules = [
      makeScheduleDay({ sort_order: 0 }),
      makeScheduleDay({ id: 'sched-2', sort_order: 1, workout_day_id: 'wd-2', workout_day: { id: 'wd-2', name: 'Pull Day', day_number: 2 } }),
      makeScheduleDay({ id: 'sched-3', sort_order: 2, workout_day_id: 'wd-3', workout_day: { id: 'wd-3', name: 'Legs Day', day_number: 3 } }),
    ]

    render(
      <ScheduleDayEditor
        isOpen={true}
        onClose={vi.fn()}
        dayNumber={1}
        currentSchedules={schedules}
      />
    )

    expect(screen.getByText(/scheduling 3 sessions in one day/i)).toBeInTheDocument()
  })

  it('does not show overtraining warning for rest days', () => {
    const schedules = [
      makeScheduleDay({ is_rest_day: true, workout_day: null, workout_day_id: null }),
    ]

    render(
      <ScheduleDayEditor
        isOpen={true}
        onClose={vi.fn()}
        dayNumber={1}
        currentSchedules={schedules}
      />
    )

    expect(screen.queryByText(/overtraining risk/i)).not.toBeInTheDocument()
  })

  it('warning disappears when workout removed below threshold', () => {
    const schedules = [
      makeScheduleDay({ sort_order: 0 }),
      makeScheduleDay({ id: 'sched-2', sort_order: 1, workout_day_id: 'wd-2', workout_day: { id: 'wd-2', name: 'Pull Day', day_number: 2 } }),
      makeScheduleDay({ id: 'sched-3', sort_order: 2, workout_day_id: 'wd-3', workout_day: { id: 'wd-3', name: 'Legs Day', day_number: 3 } }),
    ]

    render(
      <ScheduleDayEditor
        isOpen={true}
        onClose={vi.fn()}
        dayNumber={1}
        currentSchedules={schedules}
      />
    )

    // Warning should be showing
    expect(screen.getByText(/scheduling 3 sessions in one day/i)).toBeInTheDocument()

    // Remove the last workout by clicking the Trash2 button
    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('svg') && btn.className.includes('hover:text-[var(--color-error)]')
    )
    expect(deleteButtons.length).toBeGreaterThan(0)
    fireEvent.click(deleteButtons[deleteButtons.length - 1])

    // Warning should be gone (only 2 workouts now)
    expect(screen.queryByText(/scheduling.*sessions in one day/i)).not.toBeInTheDocument()
  })
})
