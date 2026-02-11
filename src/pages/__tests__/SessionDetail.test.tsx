import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { SessionDetailPage } from '../SessionDetail'

// ---- Router mocks ----
const mockNavigate = vi.fn()
let mockSessionId = 'session-1'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ sessionId: mockSessionId }),
  }
})

// ---- Supabase mock (used by inline getSessionDetail function) ----
const mockSessionSingle = vi.fn()
const mockSetsOrder = vi.fn()

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'workout_sessions') {
        return {
          select: () => ({
            eq: () => ({
              single: mockSessionSingle,
            }),
          }),
        }
      }
      if (table === 'exercise_sets') {
        return {
          select: () => ({
            eq: () => ({
              order: mockSetsOrder,
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    },
  },
}))

// ---- Workout session hooks mock ----
let mockDeleteSessionMutate = vi.fn()
let mockDeleteSessionPending = false
let mockUpdateSessionMutate = vi.fn()
let mockUpdateSessionPending = false
let mockUpdateSetMutate = vi.fn()
let mockUpdateSetPending = false
let mockDeleteSetMutate = vi.fn()
let mockDeleteSetPending = false

vi.mock('@/hooks/useWorkoutSession', () => ({
  useDeleteSession: () => ({
    mutate: mockDeleteSessionMutate,
    isPending: mockDeleteSessionPending,
  }),
  useUpdateSession: () => ({
    mutate: mockUpdateSessionMutate,
    isPending: mockUpdateSessionPending,
  }),
  useUpdateSet: () => ({
    mutate: mockUpdateSetMutate,
    isPending: mockUpdateSetPending,
  }),
  useDeleteSet: () => ({
    mutate: mockDeleteSetMutate,
    isPending: mockDeleteSetPending,
  }),
}))

// ---- Review hooks mock ----
vi.mock('@/hooks/useReview', () => ({
  useSessionReview: () => ({ data: null, isLoading: false }),
}))

// ---- Review component mock ----
vi.mock('@/components/review/ReviewSummaryCard', () => ({
  ReviewSummaryCard: () => null,
}))

// ---- Layout mock ----
vi.mock('@/components/layout', () => ({
  AppShell: ({
    children,
    title,
    headerAction,
  }: {
    children: React.ReactNode
    title: string
    showBack?: boolean
    headerAction?: React.ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {headerAction && <div data-testid="header-action">{headerAction}</div>}
      {children}
    </div>
  ),
}))

// ---- UI mocks ----
vi.mock('@/components/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Modal: ({
    children,
    isOpen,
    onClose,
    title,
  }: {
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
    title?: string
  }) =>
    isOpen ? (
      <div data-testid="modal" role="dialog">
        {title && <h2>{title}</h2>}
        {children}
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    ) : null,
  Button: ({
    children,
    onClick,
    loading,
    disabled,
    variant,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
    loading?: boolean
    disabled?: boolean
    variant?: string
    [key: string]: unknown
  }) => (
    <button onClick={onClick} disabled={disabled || loading} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}))

// ---- Formatters mock ----
vi.mock('@/utils/formatters', () => ({
  formatDate: (d: string) => `Date:${d.slice(0, 10)}`,
  formatTime: (d: string) => `Time:${d.slice(11, 16)}`,
  formatDuration: (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
}))

// ---- Workout config mock ----
vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: (name: string | null | undefined) => {
    if (!name) return 'Workout'
    const map: Record<string, string> = {
      'Push (Chest, Shoulders, Triceps)': 'Push',
      'Pull (Back, Biceps)': 'Pull',
      push: 'Push',
      pull: 'Pull',
    }
    return map[name] || name
  },
}))

// ---- motion mock ----
vi.mock('motion/react', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: (props: Record<string, unknown>) => <button {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// ---- TanStack Query mock ----
interface SessionDetailData {
  session: {
    id: string
    started_at: string
    completed_at: string | null
    notes: string | null
    workout_day: { id: string; name: string } | null
  }
  sets: Array<{
    id: string
    set_number: number
    reps_completed: number | null
    weight_used: number | null
    completed: boolean
    plan_exercise: {
      id: string
      name: string
      sets: number | null
      reps_min: number | null
      reps_max: number | null
      reps_unit: string | null
      weight_unit: string | null
      section: { name: string; sort_order: number }
    }
  }>
}

let mockData: SessionDetailData | null = null
let mockIsLoading = false
const mockRefetch = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => ({
      data: mockData,
      isLoading: mockIsLoading,
      refetch: mockRefetch,
    }),
  }
})

// ---- Reduced motion mock (needed by Modal) ----
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))

// Helper: create session data
function createSessionData(overrides: Partial<SessionDetailData> = {}): SessionDetailData {
  return {
    session: {
      id: 'session-1',
      started_at: '2024-06-15T10:30:00Z',
      completed_at: '2024-06-15T11:15:00Z',
      notes: null,
      workout_day: { id: 'day-1', name: 'Push (Chest, Shoulders, Triceps)' },
    },
    sets: [
      {
        id: 'set-1',
        set_number: 1,
        reps_completed: 10,
        weight_used: 135,
        completed: true,
        plan_exercise: {
          id: 'ex-1',
          name: 'Bench Press',
          sets: 3,
          reps_min: 8,
          reps_max: 12,
          reps_unit: 'reps',
          weight_unit: 'lbs',
          section: { name: 'Main Lifts', sort_order: 1 },
        },
      },
      {
        id: 'set-2',
        set_number: 2,
        reps_completed: 8,
        weight_used: 135,
        completed: true,
        plan_exercise: {
          id: 'ex-1',
          name: 'Bench Press',
          sets: 3,
          reps_min: 8,
          reps_max: 12,
          reps_unit: 'reps',
          weight_unit: 'lbs',
          section: { name: 'Main Lifts', sort_order: 1 },
        },
      },
      {
        id: 'set-3',
        set_number: 1,
        reps_completed: 15,
        weight_used: 20,
        completed: true,
        plan_exercise: {
          id: 'ex-2',
          name: 'Lateral Raises',
          sets: 3,
          reps_min: 12,
          reps_max: 15,
          reps_unit: 'reps',
          weight_unit: 'lbs',
          section: { name: 'Accessories', sort_order: 2 },
        },
      },
    ],
    ...overrides,
  }
}

describe('SessionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData = null
    mockIsLoading = false
    mockDeleteSessionMutate = vi.fn()
    mockDeleteSessionPending = false
    mockUpdateSessionMutate = vi.fn()
    mockUpdateSessionPending = false
    mockUpdateSetMutate = vi.fn()
    mockUpdateSetPending = false
    mockDeleteSetMutate = vi.fn()
    mockDeleteSetPending = false
    mockSessionId = 'session-1'
  })

  // ===== Loading State =====
  describe('loading state', () => {
    it('shows loading skeletons', () => {
      mockIsLoading = true
      const { container } = render(<SessionDetailPage />)

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(3)
    })

    it('shows fallback title when loading', () => {
      mockIsLoading = true
      render(<SessionDetailPage />)

      // getWorkoutDisplayName(undefined) returns 'Workout' which is truthy, so title is 'Workout'
      expect(screen.getByText('Workout')).toBeInTheDocument()
    })
  })

  // ===== Not Found State =====
  describe('not found state', () => {
    it('shows "Session not found." when data is null', () => {
      mockData = null
      mockIsLoading = false
      render(<SessionDetailPage />)

      expect(screen.getByText('Session not found.')).toBeInTheDocument()
    })
  })

  // ===== Session Info Display =====
  describe('session info display', () => {
    it('renders workout display name as page title', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      expect(screen.getByText('Push')).toBeInTheDocument()
    })

    it('renders date and time', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      expect(screen.getByText('Date:2024-06-15')).toBeInTheDocument()
      expect(screen.getByText('Time:10:30')).toBeInTheDocument()
    })

    it('shows duration when both started_at and completed_at exist', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // 45 minutes = 2700 seconds → "45:00"
      expect(screen.getByText('Duration: 45:00')).toBeInTheDocument()
    })

    it('does not show duration when completed_at is null', () => {
      mockData = createSessionData({
        session: {
          id: 'session-1',
          started_at: '2024-06-15T10:30:00Z',
          completed_at: null,
          notes: null,
          workout_day: { id: 'day-1', name: 'push' },
        },
      })
      render(<SessionDetailPage />)

      expect(screen.queryByText(/Duration/)).not.toBeInTheDocument()
    })

    it('shows "Completed" status when completed_at is set', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('does not show "Completed" when completed_at is null', () => {
      mockData = createSessionData({
        session: {
          id: 'session-1',
          started_at: '2024-06-15T10:30:00Z',
          completed_at: null,
          notes: null,
          workout_day: { id: 'day-1', name: 'push' },
        },
      })
      render(<SessionDetailPage />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    })
  })

  // ===== Notes =====
  describe('notes', () => {
    it('shows "Add notes" link when session has no notes', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      expect(screen.getByText('+ Add notes')).toBeInTheDocument()
    })

    it('shows existing notes with "(tap to edit)" hint', () => {
      mockData = createSessionData({
        session: {
          id: 'session-1',
          started_at: '2024-06-15T10:30:00Z',
          completed_at: '2024-06-15T11:15:00Z',
          notes: 'Great workout!',
          workout_day: { id: 'day-1', name: 'push' },
        },
      })
      render(<SessionDetailPage />)

      expect(screen.getByText(/Great workout!/)).toBeInTheDocument()
      expect(screen.getByText('(tap to edit)')).toBeInTheDocument()
    })

    it('opens notes editor when "Add notes" is clicked', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Need to open the actions menu first, then click Edit Notes
      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      expect(actionsButton).toBeTruthy()
      await userEvent.click(actionsButton!)

      const editNotesButton = screen.getByText('Edit Notes')
      await userEvent.click(editNotesButton)

      expect(screen.getByPlaceholderText('Add notes about this workout...')).toBeInTheDocument()
    })

    it('saves notes when Save button is clicked', async () => {
      // Make mutate call onSuccess to simulate successful save
      mockUpdateSessionMutate = vi.fn((_data: unknown, options?: { onSuccess?: () => void }) => {
        if (options?.onSuccess) options.onSuccess()
      })

      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Open actions menu and click Edit Notes
      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      await userEvent.click(actionsButton!)
      await userEvent.click(screen.getByText('Edit Notes'))

      // Type in the textarea
      const textarea = screen.getByPlaceholderText('Add notes about this workout...')
      await userEvent.type(textarea, 'New workout notes')

      // Click Save
      const saveButton = screen.getByText('Save').closest('button')
      await userEvent.click(saveButton!)

      expect(mockUpdateSessionMutate).toHaveBeenCalledWith(
        { sessionId: 'session-1', notes: 'New workout notes' },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('cancels notes editing when Cancel is clicked', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Open actions menu and click Edit Notes
      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      await userEvent.click(actionsButton!)
      await userEvent.click(screen.getByText('Edit Notes'))

      expect(screen.getByPlaceholderText('Add notes about this workout...')).toBeInTheDocument()

      // Click Cancel
      const cancelButton = screen.getByText('Cancel').closest('button')
      await userEvent.click(cancelButton!)

      // Textarea should be gone
      expect(screen.queryByPlaceholderText('Add notes about this workout...')).not.toBeInTheDocument()
    })
  })

  // ===== Exercise Sections =====
  describe('exercises', () => {
    it('groups exercises by section', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Section headers
      expect(screen.getByText('Main Lifts')).toBeInTheDocument()
      expect(screen.getByText('Accessories')).toBeInTheDocument()
    })

    it('displays exercise names', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('Lateral Raises')).toBeInTheDocument()
    })

    it('displays set details with reps and weight', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Set 1 appears for both Bench Press and Lateral Raises
      const set1Elements = screen.getAllByText('Set 1')
      expect(set1Elements.length).toBe(2)

      // Reps and weight are displayed (split across child spans)
      const reps10 = screen.getAllByText(/10/)
      expect(reps10.length).toBeGreaterThanOrEqual(1)
      const weight135 = screen.getAllByText(/135/)
      expect(weight135.length).toBeGreaterThanOrEqual(1)
    })

    it('shows "Tap a set to edit" hint', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const hints = screen.getAllByText('Tap a set to edit')
      expect(hints.length).toBeGreaterThanOrEqual(1)
    })

    it('shows empty state when no exercises are logged', () => {
      mockData = createSessionData({ sets: [] })
      render(<SessionDetailPage />)

      expect(screen.getByText('No exercises logged for this session.')).toBeInTheDocument()
    })
  })

  // ===== Actions Menu =====
  describe('actions menu', () => {
    it('renders the actions menu button in header', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const headerAction = screen.getByTestId('header-action')
      expect(headerAction).toBeInTheDocument()
      expect(headerAction.querySelector('button')).toBeInTheDocument()
    })

    it('opens actions menu on click', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      await userEvent.click(actionsButton!)

      expect(screen.getByText('Edit Notes')).toBeInTheDocument()
      expect(screen.getByText('Delete Workout')).toBeInTheDocument()
    })

    it('does not show actions menu when data is null', () => {
      mockData = null
      mockIsLoading = false
      render(<SessionDetailPage />)

      // When data is null, headerAction prop is falsy so no header-action is rendered
      expect(screen.queryByTestId('header-action')).not.toBeInTheDocument()
    })
  })

  // ===== Delete Session Modal =====
  describe('delete session modal', () => {
    it('opens delete modal from actions menu', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Open actions menu
      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      await userEvent.click(actionsButton!)

      // Click Delete Workout
      await userEvent.click(screen.getByText('Delete Workout'))

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this workout session?')).toBeInTheDocument()
      expect(screen.getByText(/This will permanently delete/)).toBeInTheDocument()
    })

    it('cancels delete when Cancel is clicked in modal', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Open actions menu
      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      await userEvent.click(actionsButton!)
      await userEvent.click(screen.getByText('Delete Workout'))

      // Click Cancel in the modal
      const cancelButtons = screen.getAllByText('Cancel')
      const modalCancel = cancelButtons.find((btn) => btn.closest('[role="dialog"]'))
      await userEvent.click(modalCancel!)

      // Modal should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('calls deleteSession and navigates on confirm', async () => {
      mockDeleteSessionMutate = vi.fn((sessionId: string, options?: { onSuccess?: () => void }) => {
        if (options?.onSuccess) options.onSuccess()
      })

      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Open actions menu
      const actionsButton = screen.getByTestId('header-action').querySelector('button')
      await userEvent.click(actionsButton!)
      await userEvent.click(screen.getByText('Delete Workout'))

      // Click Delete in the modal
      const deleteButtons = screen.getAllByText('Delete')
      const modalDelete = deleteButtons.find((btn) => btn.closest('[role="dialog"]'))
      await userEvent.click(modalDelete!)

      expect(mockDeleteSessionMutate).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/history', { replace: true })
    })
  })

  // ===== Edit Set Modal =====
  describe('edit set modal', () => {
    it('opens edit set modal when a set button is clicked', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Click on Set 1 of Bench Press
      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      // Edit Set Modal should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Edit Set 1')).toBeInTheDocument()
    })

    it('shows reps and weight inputs in edit modal', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      // Should have reps and weight fields
      expect(screen.getByText('reps')).toBeInTheDocument()
      expect(screen.getByText('Weight (lbs)')).toBeInTheDocument()
    })

    it('pre-fills reps and weight from the set data', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      const inputs = screen.getAllByRole('spinbutton')
      // First input is reps (10), second is weight (135)
      expect(inputs[0]).toHaveValue(10)
      expect(inputs[1]).toHaveValue(135)
    })

    it('saves set changes when Save is clicked', async () => {
      mockUpdateSetMutate = vi.fn((_data: unknown, options?: { onSuccess?: () => void }) => {
        if (options?.onSuccess) options.onSuccess()
      })

      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      // Change reps value
      const repsInput = screen.getAllByRole('spinbutton')[0]
      await userEvent.clear(repsInput)
      await userEvent.type(repsInput, '12')

      // Click Save
      await userEvent.click(screen.getByText('Save'))

      expect(mockUpdateSetMutate).toHaveBeenCalledWith(
        { setId: 'set-1', updates: { reps_completed: 12, weight_used: 135 } },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('closes edit modal when Cancel is clicked', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Find the Cancel button inside the edit set modal
      const cancelButtons = screen.getAllByText('Cancel')
      const editModalCancel = cancelButtons.find((btn) => btn.closest('[role="dialog"]'))
      await userEvent.click(editModalCancel!)

      // Dialog should close
      expect(screen.queryByText('Edit Set 1')).not.toBeInTheDocument()
    })

    it('hides weight input when weight_unit is null', async () => {
      mockData = createSessionData({
        sets: [
          {
            id: 'set-1',
            set_number: 1,
            reps_completed: 30,
            weight_used: null,
            completed: true,
            plan_exercise: {
              id: 'ex-1',
              name: 'Plank Hold',
              sets: 3,
              reps_min: 30,
              reps_max: 60,
              reps_unit: 'seconds',
              weight_unit: null,
              section: { name: 'Core', sort_order: 1 },
            },
          },
        ],
      })
      render(<SessionDetailPage />)

      // Click on Set 1
      await userEvent.click(screen.getByText('Set 1'))

      // Should show reps label
      expect(screen.getByText('seconds')).toBeInTheDocument()
      // Should NOT show weight input
      expect(screen.queryByText(/Weight/)).not.toBeInTheDocument()
    })

    it('shows delete confirmation in edit set modal', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      // Find the delete button (it has a Trash2 icon, variant=danger)
      const deleteButtons = screen.getAllByRole('button')
      const trashButton = deleteButtons.find(
        (btn) => btn.getAttribute('data-variant') === 'danger' && btn.closest('[role="dialog"]')
      )
      expect(trashButton).toBeTruthy()
      await userEvent.click(trashButton!)

      // Should show delete confirmation text
      expect(screen.getByText('Delete this set? This cannot be undone.')).toBeInTheDocument()
    })

    it('deletes set when confirmed in edit modal', async () => {
      mockDeleteSetMutate = vi.fn((setId: string, options?: { onSuccess?: () => void }) => {
        if (options?.onSuccess) options.onSuccess()
      })

      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      // Click trash button to show confirm
      const deleteButtons = screen.getAllByRole('button')
      const trashButton = deleteButtons.find(
        (btn) => btn.getAttribute('data-variant') === 'danger' && btn.closest('[role="dialog"]')
      )
      await userEvent.click(trashButton!)

      // Click the Delete confirm button
      await userEvent.click(screen.getByText('Delete'))

      expect(mockDeleteSetMutate).toHaveBeenCalledWith(
        'set-1',
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('cancels delete confirmation and returns to edit form', async () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      const setBtns = screen.getAllByText('Set 1')
      await userEvent.click(setBtns[0])

      // Click trash button
      const deleteButtons = screen.getAllByRole('button')
      const trashButton = deleteButtons.find(
        (btn) => btn.getAttribute('data-variant') === 'danger' && btn.closest('[role="dialog"]')
      )
      await userEvent.click(trashButton!)

      expect(screen.getByText('Delete this set? This cannot be undone.')).toBeInTheDocument()

      // Click Cancel to go back to edit form
      await userEvent.click(screen.getByText('Cancel'))

      // Should be back to the edit form with Save button
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.queryByText('Delete this set? This cannot be undone.')).not.toBeInTheDocument()
    })
  })

  // ===== Edge Cases =====
  describe('edge cases', () => {
    it('handles session with no workout_day gracefully', () => {
      mockData = createSessionData({
        session: {
          id: 'session-1',
          started_at: '2024-06-15T10:30:00Z',
          completed_at: null,
          notes: null,
          workout_day: null,
        },
      })
      render(<SessionDetailPage />)

      // getWorkoutDisplayName(undefined) returns 'Workout' which is truthy, so title is 'Workout'
      expect(screen.getByText('Workout')).toBeInTheDocument()
    })

    it('renders multiple sets for the same exercise', () => {
      mockData = createSessionData()
      render(<SessionDetailPage />)

      // Bench Press has 2 sets
      const set1 = screen.getAllByText('Set 1')
      const set2 = screen.getAllByText('Set 2')
      expect(set1.length).toBeGreaterThanOrEqual(1)
      expect(set2.length).toBeGreaterThanOrEqual(1)
    })
  })
})
