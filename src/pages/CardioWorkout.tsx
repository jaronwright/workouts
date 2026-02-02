import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useTemplate, useStartTemplateWorkout, useCompleteTemplateWorkout } from '@/hooks/useTemplateWorkout'
import { Play, Pause, Square, Heart } from 'lucide-react'

export function CardioWorkoutPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { data: template, isLoading } = useTemplate(templateId)
  const { mutate: startWorkout, isPending: isStarting } = useStartTemplateWorkout()
  const { mutate: completeWorkout, isPending: isCompleting } = useCompleteTemplateWorkout()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [distance, setDistance] = useState('')
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'km'>('miles')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleStart = () => {
    if (!templateId) return

    startWorkout(templateId, {
      onSuccess: (session) => {
        setSessionId(session.id)
        setIsRunning(true)
        startTimeRef.current = Date.now()
        intervalRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000))
        }, 1000)
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
    setIsRunning(true)
    const currentElapsed = elapsedSeconds
    startTimeRef.current = Date.now() - currentElapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000))
    }, 1000)
  }

  const handleComplete = () => {
    if (!sessionId) return

    handlePause()
    const durationMinutes = Math.ceil(elapsedSeconds / 60)

    completeWorkout(
      {
        sessionId,
        durationMinutes,
        distanceValue: distance ? parseFloat(distance) : undefined,
        distanceUnit: distance ? distanceUnit : undefined
      },
      {
        onSuccess: () => {
          navigate('/history')
        }
      }
    )
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
              <div className="w-16 h-16 bg-[var(--color-cardio)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[var(--color-cardio)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                {template.name}
              </h2>
              {template.description && (
                <p className="text-[var(--color-text-muted)] mb-4">
                  {template.description}
                </p>
              )}
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Target: {template.duration_minutes} minutes
              </p>
              <Button onClick={handleStart} loading={isStarting} size="lg">
                Start Workout
              </Button>
            </CardContent>
          </Card>
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
              <p className="text-sm text-[var(--color-text-muted)] mb-2">Elapsed Time</p>
              <span className="text-5xl font-bold text-[var(--color-text)] tabular-nums">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {isRunning ? (
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

        {/* Distance Input */}
        <Card>
          <CardContent className="py-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Distance (optional)
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                placeholder="0.00"
                value={distance}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '')
                  setDistance(val)
                }}
                className="flex-1"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as 'miles' | 'km')}
                className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
              >
                <option value="miles">miles</option>
                <option value="km">km</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="pt-4">
          <Button
            onClick={handleComplete}
            loading={isCompleting}
            className="w-full"
            size="lg"
          >
            <Square className="w-5 h-5 mr-2" />
            Complete Workout
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
