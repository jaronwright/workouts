/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { useTemplate, useStartTemplateWorkout, useCompleteTemplateWorkout } from '@/hooks/useTemplateWorkout'
import { useToast } from '@/hooks/useToast'
import { Play, Pause, Square, Activity, Check } from 'lucide-react'

const DURATION_OPTIONS = [15, 30, 45, 60]

export function MobilityWorkoutPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { data: template, isLoading } = useTemplate(templateId)
  const { mutate: startWorkout, isPending: isStarting } = useStartTemplateWorkout()
  const { mutate: completeWorkout, isPending: isCompleting } = useCompleteTemplateWorkout()
  const toast = useToast()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(15)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize duration from template
  useEffect(() => {
    if (template?.duration_minutes) {
      setSelectedDuration(template.duration_minutes)
    }
  }, [template])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle timer completion
  useEffect(() => {
    if (remainingSeconds === 0 && isRunning) {
      setIsRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }, [remainingSeconds, isRunning])

  const handleStart = () => {
    if (!templateId) return

    startWorkout(templateId, {
      onSuccess: (session) => {
        setSessionId(session.id)
        setRemainingSeconds(selectedDuration * 60)
        setIsRunning(true)
        intervalRef.current = setInterval(() => {
          setRemainingSeconds((prev) => Math.max(0, prev - 1))
        }, 1000)
      },
      onError: () => {
        toast.error('Failed to start workout. Please try again.')
      }
    })
  }

  const handlePause = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleResume = () => {
    if (remainingSeconds === 0) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
  }

  const handleComplete = () => {
    if (!sessionId) return

    handlePause()
    const actualDuration = selectedDuration - Math.ceil(remainingSeconds / 60)

    completeWorkout(
      {
        sessionId,
        durationMinutes: Math.max(1, actualDuration)
      },
      {
        onSuccess: () => {
          navigate('/history')
        },
        onError: () => {
          toast.error('Failed to complete workout. Please try again.')
        }
      }
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = sessionId
    ? ((selectedDuration * 60 - remainingSeconds) / (selectedDuration * 60)) * 100
    : 0

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-4">
          <div className="h-48 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
        </div>
      </AppShell>
    )
  }

  if (!template) {
    return (
      <AppShell title="Not Found" showBack>
        <div className="p-4 text-center text-[var(--color-text-muted)]">
          Workout not found
        </div>
      </AppShell>
    )
  }

  // Pre-workout view
  if (!sessionId) {
    return (
      <AppShell title={template.name} showBack>
        <div className="p-4 space-y-6">
          <Card>
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 bg-[var(--color-mobility)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-[var(--color-mobility)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                {template.name}
              </h2>
              {template.description && (
                <p className="text-[var(--color-text-muted)] mb-4">
                  {template.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <Card>
            <CardContent className="py-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Select Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      selectedDuration === duration
                        ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
                        : 'bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {duration}m
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleStart} loading={isStarting} size="lg" className="w-full">
            Start {selectedDuration} Minute Session
          </Button>
        </div>
      </AppShell>
    )
  }

  // Active workout view
  return (
    <AppShell title={template.name} showBack hideNav>
      <div className="p-4 space-y-6">
        {/* Timer Display */}
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-2">
                {remainingSeconds === 0 ? 'Complete!' : 'Time Remaining'}
              </p>
              <span className="text-5xl font-bold text-[var(--color-text)] tabular-nums">
                {formatTime(remainingSeconds)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden mt-6">
              <div
                className="h-full bg-[var(--color-mobility)] transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {remainingSeconds === 0 ? (
            <div className="w-16 h-16 bg-[var(--color-success)] rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-[var(--color-text-inverse)]" />
            </div>
          ) : isRunning ? (
            <button
              onClick={handlePause}
              className="w-16 h-16 bg-[var(--color-warning)] rounded-full flex items-center justify-center text-[var(--color-text-inverse)]"
            >
              <Pause className="w-8 h-8" />
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="w-16 h-16 bg-[var(--color-success)] rounded-full flex items-center justify-center text-[var(--color-text-inverse)]"
            >
              <Play className="w-8 h-8 ml-1" />
            </button>
          )}
        </div>

        {/* Complete Button */}
        <div className="pt-4">
          <Button
            onClick={handleComplete}
            loading={isCompleting}
            className="w-full"
            size="lg"
          >
            <Square className="w-5 h-5 mr-2" />
            {remainingSeconds === 0 ? 'Finish Session' : 'End Early'}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
