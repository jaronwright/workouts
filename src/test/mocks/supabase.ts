import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  }),
}

// Helper to mock specific table responses
export function mockSupabaseResponse<T>(data: T, error: Error | null = null) {
  return {
    data,
    error,
  }
}

// Reset all mocks
export function resetSupabaseMocks() {
  vi.clearAllMocks()
}

// Mock workout templates
export const mockWorkoutTemplates = [
  {
    id: 'template-1',
    name: 'Swimming',
    type: 'cardio' as const,
    category: 'swim',
    description: 'Pool laps or open water swimming',
    icon: 'waves',
    duration_minutes: 30,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'template-2',
    name: 'Running',
    type: 'cardio' as const,
    category: 'run',
    description: 'Outdoor running or treadmill',
    icon: 'footprints',
    duration_minutes: 30,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'template-3',
    name: 'Hip, Knee & Ankle Flow',
    type: 'mobility' as const,
    category: 'hip_knee_ankle',
    description: 'Lower body joint mobility and flexibility',
    icon: 'activity',
    duration_minutes: 15,
    created_at: '2024-01-01T00:00:00Z',
  },
]

// Mock workout days - Names should be Title Case (matching database)
export const mockWorkoutDays = [
  {
    id: 'day-1',
    name: 'Push (Chest, Shoulders, Triceps)',
    day_number: 1,
    workout_plan_id: 'plan-1',
  },
  {
    id: 'day-2',
    name: 'Pull (Back, Biceps, Rear Delts)',
    day_number: 2,
    workout_plan_id: 'plan-1',
  },
  {
    id: 'day-3',
    name: 'Legs (Quads, Hamstrings, Calves)',
    day_number: 3,
    workout_plan_id: 'plan-1',
  },
]

// Mock user schedule
export const mockUserSchedule = [
  {
    id: 'schedule-1',
    user_id: 'user-1',
    day_number: 1,
    template_id: null,
    workout_day_id: 'day-1',
    is_rest_day: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    template: null,
    workout_day: mockWorkoutDays[0],
  },
  {
    id: 'schedule-2',
    user_id: 'user-1',
    day_number: 2,
    template_id: null,
    workout_day_id: 'day-2',
    is_rest_day: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    template: null,
    workout_day: mockWorkoutDays[1],
  },
  {
    id: 'schedule-3',
    user_id: 'user-1',
    day_number: 3,
    template_id: null,
    workout_day_id: 'day-3',
    is_rest_day: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    template: null,
    workout_day: mockWorkoutDays[2],
  },
  {
    id: 'schedule-4',
    user_id: 'user-1',
    day_number: 4,
    template_id: null,
    workout_day_id: null,
    is_rest_day: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    template: null,
    workout_day: null,
  },
]

// Mock user
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
}

// Mock session
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}
