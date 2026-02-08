import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ToastProvider } from '@/components/ui'
import { pageTransition } from '@/config/animationConfig'
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

function PageWrapper({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <>{children}</>
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  // Use the first path segment as key to avoid re-animating sub-routes
  const pageKey = '/' + (location.pathname.split('/')[1] || '')

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={pageKey}>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <PageWrapper><AuthPage /></PageWrapper>
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
              <PageWrapper><HomePage /></PageWrapper>
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
              <PageWrapper><WorkoutPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout/:dayId/active"
          element={
            <ProtectedRoute>
              <PageWrapper><WorkoutPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cardio/:templateId"
          element={
            <ProtectedRoute>
              <PageWrapper><CardioWorkoutPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mobility/:templateId"
          element={
            <ProtectedRoute>
              <PageWrapper><MobilityWorkoutPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <PageWrapper><HistoryPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:sessionId"
          element={
            <ProtectedRoute>
              <PageWrapper><SessionDetailPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/cardio/:sessionId"
          element={
            <ProtectedRoute>
              <PageWrapper><CardioSessionDetailPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper><ProfilePage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <PageWrapper><SchedulePage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rest-day"
          element={
            <ProtectedRoute>
              <PageWrapper><RestDayPage /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppRoutes() {
  useAuth() // Auth initialization happens inside useAuth's useEffect
  const { initializeTheme } = useTheme()

  useEffect(() => {
    initializeTheme()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <AnimatedRoutes />
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
