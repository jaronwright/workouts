import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/ui'
import { SyncManager } from '@/components/layout/SyncManager'
import { PageTransition } from '@/components/motion'
import {
  AuthPage,
  AuthCallbackPage,
  HomePage,
  WorkoutPage,
  HistoryPage,
  SessionDetailPage,
  CardioSessionDetailPage,
  ProfilePage,
  SchedulePage,
  CardioWorkoutPage,
  MobilityWorkoutPage,
  MobilityDurationPickerPage,
  RestDayPage,
  CommunityPage,
  PublicProfilePage,
  PublicSessionDetailPage,
  ExerciseLibraryPage
} from '@/pages'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      networkMode: 'offlineFirst',  // Serve stale cache when offline
    },
    mutations: {
      networkMode: 'always',  // Let our offline handling in hooks manage this
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

function AnimatedRoutes() {
  const location = useLocation()
  // Use the first path segment as key to avoid re-animating sub-routes
  const pageKey = '/' + (location.pathname.split('/')[1] || '')

  return (
    <PageTransition pageKey={pageKey}>
      <Routes location={location} key={pageKey}>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/callback"
          element={<AuthCallbackPage />}
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
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/profile/:userId"
          element={
            <ProtectedRoute>
              <PublicProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/session/:sessionId"
          element={
            <ProtectedRoute>
              <PublicSessionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/cardio/:sessionId"
          element={
            <ProtectedRoute>
              <PublicSessionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={<Navigate to="/" replace />}
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
          path="/mobility/:category/select"
          element={
            <ProtectedRoute>
              <MobilityDurationPickerPage />
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
          path="/history/cardio/:sessionId"
          element={
            <ProtectedRoute>
              <CardioSessionDetailPage />
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
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <ExerciseLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  )
}

function AppRoutes() {
  useAuth() // Auth initialization happens inside useAuth's useEffect
  const { initializeTheme } = useTheme()

  useEffect(() => {
    initializeTheme()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SyncManager />
      <AnimatedRoutes />
    </>
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
