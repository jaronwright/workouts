/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { FadeIn, PressableButton } from '@/components/motion'
import { PostWorkoutReview } from '@/components/review/PostWorkoutReview'
import {
  useTemplate,
  useLastTemplateSession,
  useQuickLogTemplateWorkout,
  useStartTemplateWorkout,
  useCompleteTemplateWorkout
} from '@/hooks/useTemplateWorkout'
import { useToast } from '@/hooks/useToast'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useReviewStore } from '@/stores/reviewStore'
import { getCardioStyle } from '@/config/workoutConfig'
import {
  CARDIO_INPUT_CONFIG,
  getCardioPreference,
  setCardioPreference
} from '@/utils/cardioUtils'
import { Play, Pause, ChevronDown, Timer } from 'lucide-react'

export function CardioWorkoutPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: template, isLoading } = useTemplate(templateId)
  const { data: lastSession } = useLastTemplateSession(templateId)

  const quickLog = useQuickLogTemplateWorkout()
  const startWorkout = useStartTemplateWorkout()
  const completeWorkout = useCompleteTemplateWorkout()

  // Input state
  const [selectedModeIndex, setSelectedModeIndex] = useState(0)
  const [value, setValue] = useState('')
  const [sliderValue, setSliderValue] = useState(1000)

  // Timer state
  const [timerOpen, setTimerOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const accumulatedSecondsRef = useRef(0)

  useWakeLock(!!sessionId)

  // Derived
  const category = template?.category || ''
  const modes = CARDIO_INPUT_CONFIG[category] || CARDIO_INPUT_CONFIG.run
  const currentMode = modes[selectedModeIndex]
  const hasToggle = modes.length > 1
  const style = template ? getCardioStyle(template.category) : null
  const Icon = style?.icon

  // Preference initialization
  useEffect(() => {
    if (!template?.category) return
    const pref = getCardioPreference(template.category)
    if (pref) {
      const idx = modes.findIndex(m => m.mode === pref.mode && m.unit === pref.unit)
      if (idx >= 0) setSelectedModeIndex(idx)
    }
  }, [template?.category]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // ─── Timer controls ───────────────────────────────────────────────────

  const handleTimerStart = () => {
    if (!templateId) return

    startWorkout.mutate(templateId, {
      onSuccess: (session) => {
        setSessionId(session.id)
        setIsRunning(true)
        startTimeRef.current = Date.now()
        intervalRef.current = setInterval(() => {
          if (startTimeRef.current === null) return
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)
      },
      onError: () => {
        // Network errors are handled by hook (returns optimistic session)
        // This only fires for real server errors
        setIsRunning(false)
        toast.error('Failed to start workout. Please try again.')
      }
    })
  }

  const handleTimerPause = () => {
    setIsRunning(false)
    accumulatedSecondsRef.current = elapsedSeconds
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleTimerResume = () => {
    setIsRunning(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return
      const delta = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedSeconds(accumulatedSecondsRef.current + delta)
    }, 1000)
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

  // ─── Completion ───────────────────────────────────────────────────────

  const openReview = useReviewStore((s) => s.openReview)
  const [completedTemplateSessionId, setCompletedTemplateSessionId] = useState<string | null>(null)

  const onSuccess = (result?: { id?: string }) => {
    if (template?.category) {
      setCardioPreference(template.category, {
        mode: currentMode.mode,
        unit: currentMode.unit
      })
    }
    // Open post-workout review with the completed session ID
    const templateSessionId = result?.id || sessionId || undefined
    if (templateSessionId) {
      const durationMinutes = sessionId ? Math.ceil(elapsedSeconds / 60) : undefined
      setCompletedTemplateSessionId(templateSessionId)
      openReview({
        templateSessionId,
        sessionType: 'cardio',
        durationMinutes,
      })
    } else {
      toast.success(`${template?.name || 'Workout'} logged!`)
      navigate('/')
    }
  }

  const onError = () => {
    // Network errors are handled by hooks (returns optimistic session, queues for sync)
    // This only fires for real server errors
    toast.error('Failed to log workout')
  }

  const handleLog = () => {
    if (!templateId) return

    const isSlider = currentMode.slider
    const numericValue = isSlider ? sliderValue : parseFloat(value)

    // Timer flow: if timer was used, always use timer duration
    if (sessionId) {
      handleTimerPause()
      const durationMinutes = Math.ceil(elapsedSeconds / 60)

      completeWorkout.mutate(
        {
          sessionId,
          durationMinutes,
          distanceValue: currentMode.mode === 'distance' && numericValue > 0 ? numericValue : undefined,
          distanceUnit: currentMode.mode === 'distance' && numericValue > 0 ? currentMode.unit : undefined
        },
        { onSuccess, onError }
      )
      return
    }

    // Manual flow: require a value
    if (!numericValue || numericValue <= 0) {
      toast.warning('Please enter a value')
      return
    }

    const params: {
      templateId: string
      durationMinutes?: number
      distanceValue?: number
      distanceUnit?: string
    } = { templateId }

    if (currentMode.mode === 'time') {
      params.durationMinutes = numericValue
    } else {
      params.distanceValue = numericValue
      params.distanceUnit = currentMode.unit
    }

    quickLog.mutate(params, { onSuccess, onError })
  }

  const isPending = quickLog.isPending || completeWorkout.isPending

  // ─── Loading / Not Found ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-[var(--space-4)]">
          <div className="h-48 skeleton rounded-[var(--radius-xl)]" />
        </div>
      </AppShell>
    )
  }

  if (!template || !style || !Icon) {
    return (
      <AppShell title="Not Found" showBack>
        <div className="p-4 text-center text-[var(--color-text-muted)]">
          Workout not found
        </div>
      </AppShell>
    )
  }

  // ─── Main UI ──────────────────────────────────────────────────────────

  return (
    <AppShell title={template.name} showBack hideNav>
      <div className="p-[var(--space-4)] space-y-[var(--space-5)]">
        {/* Template info card */}
        <FadeIn direction="up">
          <Card>
            <CardContent className="py-[var(--space-5)] flex items-center gap-[var(--space-4)]">
              <div
                className={`w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  {template.name}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {lastSession ? (
                    <>
                      Last: {lastSession.duration_minutes ? `${lastSession.duration_minutes} min` : ''}
                      {lastSession.duration_minutes && lastSession.distance_value ? ' · ' : ''}
                      {lastSession.distance_value ? `${lastSession.distance_value} ${lastSession.distance_unit || ''}` : ''}
                      {!lastSession.duration_minutes && !lastSession.distance_value ? 'Completed' : ''}
                    </>
                  ) : (
                    'No previous sessions'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Metric toggle */}
        {hasToggle && (
          <div className="flex gap-1 p-1 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
            {modes.map((mode, idx) => (
              <button
                key={mode.label}
                onClick={() => {
                  setSelectedModeIndex(idx)
                  setValue('')
                  setSliderValue(mode.slider?.min ?? 1000)
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-[var(--radius-md)] transition-all duration-150 ${
                  selectedModeIndex === idx
                    ? 'bg-white text-[var(--color-text)] shadow-sm dark:bg-[var(--color-surface)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
                style={selectedModeIndex === idx ? { color: style.color } : undefined}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {/* Large input area */}
        <Card>
          <CardContent className="py-8">
            {currentMode.slider ? (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-5xl font-bold text-[var(--color-text)] tabular-nums">
                    {sliderValue.toLocaleString()}
                  </span>
                  <span className="text-base text-[var(--color-text-muted)] ml-2">{currentMode.unit}</span>
                </div>
                <input
                  type="range"
                  min={currentMode.slider.min}
                  max={currentMode.slider.max}
                  step={currentMode.slider.step}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${style.color} 0%, ${style.color} ${
                      ((sliderValue - currentMode.slider.min) / (currentMode.slider.max - currentMode.slider.min)) * 100
                    }%, var(--color-surface-hover) ${
                      ((sliderValue - currentMode.slider.min) / (currentMode.slider.max - currentMode.slider.min)) * 100
                    }%, var(--color-surface-hover) 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
                  <span>{currentMode.slider.min.toLocaleString()}</span>
                  <span>{currentMode.slider.max.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-32 text-center text-5xl font-bold bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-lg)] py-4 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-offset-1 tabular-nums"
                  style={{ '--tw-ring-color': style.color } as React.CSSProperties}
                />
                <span className="text-base font-medium text-[var(--color-text-muted)]">{currentMode.unit}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optional timer section */}
        <Card>
          <CardContent className="py-0">
            <button
              onClick={() => setTimerOpen(!timerOpen)}
              className="w-full flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Use Timer</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${timerOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-250 ease-in-out ${
                timerOpen ? 'max-h-60 opacity-100 pb-4' : 'max-h-0 opacity-0'
              }`}
            >
              {/* Timer display */}
              {(sessionId || elapsedSeconds > 0) && (
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-[var(--color-text)] tabular-nums">
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>
              )}

              {/* Timer controls */}
              <div className="flex justify-center gap-3">
                {!sessionId ? (
                  <Button
                    onClick={handleTimerStart}
                    loading={startWorkout.isPending}
                    size="sm"
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Timer
                  </Button>
                ) : isRunning ? (
                  <PressableButton
                    onClick={handleTimerPause}
                    className="w-14 h-14 bg-[var(--color-warning)] rounded-full flex items-center justify-center text-white"
                  >
                    <Pause className="w-6 h-6" />
                  </PressableButton>
                ) : (
                  <PressableButton
                    onClick={handleTimerResume}
                    className="w-14 h-14 bg-[var(--color-success)] rounded-full flex items-center justify-center text-white"
                  >
                    <Play className="w-6 h-6 ml-0.5" />
                  </PressableButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log workout button */}
        <Button
          variant="gradient"
          className="w-full"
          size="lg"
          onClick={handleLog}
          loading={isPending}
        >
          Log Workout
        </Button>
      </div>

      {/* Post-Workout Review Modal */}
      <PostWorkoutReview onComplete={() => navigate('/')} />
    </AppShell>
  )
}
