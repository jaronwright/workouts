import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { CardioSessionDetailPage } from '../CardioSessionDetail'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

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

// ---- Supabase mock ----
const mockMaybeSingle = vi.fn()
const mockDeleteEq = vi.fn()
const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
const mockDeleteReturn = vi.fn().mockReturnValue({ eq: mockDeleteEq })

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'template_workout_sessions') {
        return {
          select: () => ({ eq: mockSelectEq }),
          delete: () => ({ eq: mockDeleteEq }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        delete: mockDeleteReturn,
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    },
  },
}))

// ---- Layout mock ----
vi.mock('@/components/layout', () => ({
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

// ---- UI mock ----
vi.mock('@/components/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// ---- Formatters mock ----
vi.mock('@/utils/formatters', () => ({
  formatDate: (d: string) => `Date:${d.slice(0, 10)}`,
  formatTime: (d: string) => `Time:${d.slice(11, 16)}`,
  formatDuration: (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
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

// ---- TanStack Query mock (lets us control data/loading/pending states) ----
let mockSessionData: TemplateWorkoutSession | null = null
let mockIsLoading = false
let mockDeleteMutate = vi.fn()
let mockIsDeleting = false

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => ({
      data: mockSessionData,
      isLoading: mockIsLoading,
    }),
    useMutation: ({ onSuccess }: { onSuccess?: () => void }) => ({
      mutate: (...args: unknown[]) => {
        mockDeleteMutate(...args)
        if (onSuccess) onSuccess()
      },
      isPending: mockIsDeleting,
    }),
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  }
})

// Helper to create a full session object
function createSession(overrides: Partial<TemplateWorkoutSession> = {}): TemplateWorkoutSession {
  return {
    id: 'session-1',
    user_id: 'user-1',
    template_id: 'template-1',
    started_at: '2024-06-15T10:30:00Z',
    completed_at: '2024-06-15T11:15:00Z',
    duration_minutes: 45,
    distance_value: null,
    distance_unit: null,
    notes: null,
    template: {
      id: 'template-1',
      name: 'Morning Run',
      type: 'cardio',
      category: 'run',
      description: 'Outdoor running or treadmill',
      icon: 'footprints',
      duration_minutes: 30,
      workout_day_id: null,
      created_at: '2024-01-01T00:00:00Z',
    },
    ...overrides,
  }
}

describe('CardioSessionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionData = null
    mockIsLoading = false
    mockDeleteMutate = vi.fn()
    mockIsDeleting = false
    mockSessionId = 'session-1'
  })

  // ===== Loading State =====
  describe('loading state', () => {
    it('shows loading skeleton with correct title', () => {
      mockIsLoading = true
      const { container } = render(<CardioSessionDetailPage />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  // ===== Not Found State =====
  describe('not found state', () => {
    it('shows "Session not found" when session is null', () => {
      mockSessionData = null
      mockIsLoading = false
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Workout')).toBeInTheDocument()
      expect(screen.getByText('Session not found.')).toBeInTheDocument()
    })
  })

  // ===== Data Display =====
  describe('data display', () => {
    it('renders session date and time', () => {
      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Date:2024-06-15')).toBeInTheDocument()
      expect(screen.getByText('Time:10:30')).toBeInTheDocument()
    })

    it('renders template name as page title', () => {
      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      // "Morning Run" appears in AppShell title and template card
      const elements = screen.getAllByText('Morning Run')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows duration when duration_minutes is set', () => {
      mockSessionData = createSession({ duration_minutes: 45 })
      render(<CardioSessionDetailPage />)

      // formatDuration(45 * 60) = "45:00"
      expect(screen.getByText(/Duration: 45:00/)).toBeInTheDocument()
    })

    it('calculates duration from started_at/completed_at when duration_minutes is null', () => {
      mockSessionData = createSession({
        duration_minutes: null,
        started_at: '2024-06-15T10:00:00Z',
        completed_at: '2024-06-15T10:30:00Z',
      })
      render(<CardioSessionDetailPage />)

      // 30 minutes = 1800 seconds → formatDuration(1800) = "30:00"
      expect(screen.getByText(/Duration: 30:00/)).toBeInTheDocument()
    })

    it('does not show duration when both duration_minutes and completed_at are null', () => {
      mockSessionData = createSession({
        duration_minutes: null,
        completed_at: null,
      })
      render(<CardioSessionDetailPage />)

      expect(screen.queryByText(/Duration/)).not.toBeInTheDocument()
    })

    it('shows distance when distance_value is set', () => {
      mockSessionData = createSession({
        distance_value: 3.2,
        distance_unit: 'miles',
      })
      render(<CardioSessionDetailPage />)

      expect(screen.getByText(/Distance: 3.2 miles/)).toBeInTheDocument()
    })

    it('uses default unit "miles" when distance_unit is null', () => {
      mockSessionData = createSession({
        distance_value: 5,
        distance_unit: null,
      })
      render(<CardioSessionDetailPage />)

      expect(screen.getByText(/Distance: 5 miles/)).toBeInTheDocument()
    })

    it('does not show distance when distance_value is null', () => {
      mockSessionData = createSession({ distance_value: null })
      render(<CardioSessionDetailPage />)

      expect(screen.queryByText(/Distance/)).not.toBeInTheDocument()
    })

    it('shows "Completed" status when completed_at is set', () => {
      mockSessionData = createSession({ completed_at: '2024-06-15T11:15:00Z' })
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument()
    })

    it('shows "In Progress" status when completed_at is null', () => {
      mockSessionData = createSession({ completed_at: null })
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    })

    it('shows notes when present', () => {
      mockSessionData = createSession({ notes: 'Felt great today!' })
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Notes')).toBeInTheDocument()
      expect(screen.getByText('Felt great today!')).toBeInTheDocument()
    })

    it('does not show notes section when notes is null', () => {
      mockSessionData = createSession({ notes: null })
      render(<CardioSessionDetailPage />)

      expect(screen.queryByText('Notes')).not.toBeInTheDocument()
    })
  })

  // ===== Template Info Card =====
  describe('template info card', () => {
    it('renders template name and type', () => {
      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      // Template card shows name and type
      expect(screen.getByText('cardio workout')).toBeInTheDocument()
    })

    it('renders template description when present', () => {
      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Outdoor running or treadmill')).toBeInTheDocument()
    })

    it('does not show template card when template is null', () => {
      mockSessionData = createSession({ template: null })
      render(<CardioSessionDetailPage />)

      expect(screen.queryByText('cardio workout')).not.toBeInTheDocument()
    })

    it('uses "Workout" as fallback title when template name is missing', () => {
      mockSessionData = createSession({ template: undefined })
      render(<CardioSessionDetailPage />)

      // With no template, title falls back to 'Workout'
      expect(screen.getAllByText('Workout').length).toBeGreaterThanOrEqual(1)
    })
  })

  // ===== Delete Button =====
  describe('delete button', () => {
    it('renders the delete button', () => {
      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Delete Workout')).toBeInTheDocument()
    })

    it('shows "Deleting..." when deletion is in progress', () => {
      mockSessionData = createSession()
      mockIsDeleting = true
      render(<CardioSessionDetailPage />)

      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })

    it('delete button is disabled while deleting', () => {
      mockSessionData = createSession()
      mockIsDeleting = true
      render(<CardioSessionDetailPage />)

      const deleteButton = screen.getByText('Deleting...').closest('button')
      expect(deleteButton).toBeDisabled()
    })

    it('calls deleteSession and navigates to /history on success', () => {
      // Mock confirm to return true
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      fireEvent.click(screen.getByText('Delete Workout'))

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this workout?')
      expect(mockDeleteMutate).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/history')
    })

    it('does not delete when confirm is cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      mockSessionData = createSession()
      render(<CardioSessionDetailPage />)

      fireEvent.click(screen.getByText('Delete Workout'))

      expect(window.confirm).toHaveBeenCalled()
      expect(mockDeleteMutate).not.toHaveBeenCalled()
    })
  })

  // ===== Edge Cases =====
  describe('edge cases', () => {
    it('handles session with no template gracefully', () => {
      mockSessionData = createSession({ template: null })
      render(<CardioSessionDetailPage />)

      // Should still render the session info card
      expect(screen.getByText('Date:2024-06-15')).toBeInTheDocument()
    })

    it('handles distance with km unit', () => {
      mockSessionData = createSession({
        distance_value: 10,
        distance_unit: 'km',
      })
      render(<CardioSessionDetailPage />)

      expect(screen.getByText(/Distance: 10 km/)).toBeInTheDocument()
    })
  })
})
