import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/ui'
import {
  AuthPage,
  HomePage,
  WorkoutPage,
  WorkoutSelectPage,
  HistoryPage,
  SessionDetailPage,
  ProfilePage,
  SchedulePage,
  CardioWorkoutPage,
  MobilityWorkoutPage,
  RestDayPage
} from '@/pages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading } = useAuth()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { initialize } = useAuth()
  const { initializeTheme } = useTheme()

  useEffect(() => {
    initialize()
    initializeTheme()
  }, [])

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <WorkoutSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout/:dayId"
        element={
          <ProtectedRoute>
            <WorkoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout/:dayId/active"
        element={
          <ProtectedRoute>
            <WorkoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cardio/:templateId"
        element={
          <ProtectedRoute>
            <CardioWorkoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mobility/:templateId"
        element={
          <ProtectedRoute>
            <MobilityWorkoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history/:sessionId"
        element={
          <ProtectedRoute>
            <SessionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rest-day"
        element={
          <ProtectedRoute>
            <RestDayPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <ToastProvider />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
