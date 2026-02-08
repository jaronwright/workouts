/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
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
    ],
  }),
}))

vi.mock('@/config/workoutConfig', () => ({
  WEIGHTS_CONFIG: {
    push: { icon: () => null, color: '#3B82F6', bgColor: '#ddd' },
  },
  CATEGORY_DEFAULTS: {
    weights: { icon: () => null, color: '#000', bgColor: '#ccc' },
  },
  getWeightsStyleByName: () => ({ icon: () => null, color: '#000', bgColor: '#ccc' }),
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
    id: 'sched-1', user_id: 'user-1', day_number: 1,
    template_id: null, workout_day_id: 'wd-1', is_rest_day: false,
    sort_order: 0, created_at: '', updated_at: '',
    workout_day: { id: 'wd-1', name: 'Push Day', day_number: 1 },
    template: null, ...overrides,
  }
}

describe('ScheduleDayEditor - Empty State', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders empty state', () => {
    render(<ScheduleDayEditor isOpen={true} onClose={vi.fn()} dayNumber={1} currentSchedules={[]} />)
    expect(screen.getByText('No workouts scheduled')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ScheduleDayEditor isOpen={false} onClose={vi.fn()} dayNumber={1} />)
    expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument()
  })
})

describe('ScheduleDayEditor - Rest Day', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows Rest Day text', () => {
    render(<ScheduleDayEditor isOpen={true} onClose={vi.fn()} dayNumber={2} currentSchedules={[makeScheduleDay({ is_rest_day: true, workout_day: null, workout_day_id: null })]} />)
    expect(screen.getByText('Rest Day')).toBeInTheDocument()
  })
})
