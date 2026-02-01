import { useState } from 'react'
import { AppShell } from '@/components/layout'
import { Card, CardContent, Button } from '@/components/ui'
import { ScheduleDayEditor } from '@/components/schedule'
import { useUserSchedule, useInitializeSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import { getDayName, type ScheduleDay } from '@/services/scheduleService'
import { Dumbbell, Heart, Activity, Moon, Edit2, Plus } from 'lucide-react'

function getWorkoutIcon(schedule: ScheduleDay | null) {
  if (!schedule || schedule.is_rest_day) {
    return { Icon: Moon, color: 'var(--color-text-muted)', label: 'Rest Day' }
  }
  if (schedule.workout_day) {
    return { Icon: Dumbbell, color: 'var(--color-weights)', label: schedule.workout_day.name }
  }
  if (schedule.template) {
    switch (schedule.template.type) {
      case 'cardio':
        return { Icon: Heart, color: 'var(--color-cardio)', label: schedule.template.name }
      case 'mobility':
        return { Icon: Activity, color: 'var(--color-mobility)', label: schedule.template.name }
      default:
        return { Icon: Dumbbell, color: 'var(--color-weights)', label: schedule.template.name }
    }
  }
  return { Icon: Plus, color: 'var(--color-text-muted)', label: 'Not set' }
}

export function SchedulePage() {
  const { data: schedule, isLoading } = useUserSchedule()
  const { data: profile } = useProfile()
  const { mutate: initializeSchedule, isPending: isInitializing } = useInitializeSchedule()

  const [editingDay, setEditingDay] = useState<number | null>(null)

  // Create a map of day number to schedule
  const scheduleMap = new Map<number, ScheduleDay>()
  schedule?.forEach(s => scheduleMap.set(s.day_number, s))

  const handleInitialize = () => {
    initializeSchedule()
  }

  if (isLoading) {
    return (
      <AppShell title="Schedule">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Schedule">
      <div className="p-4 space-y-4">
        {/* Current Day Indicator */}
        {profile?.current_cycle_day && (
          <div className="text-center py-2">
            <span className="text-sm text-[var(--color-text-muted)]">Current cycle day: </span>
            <span className="text-sm font-semibold text-[var(--color-primary)]">
              Day {profile.current_cycle_day} of 7
            </span>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
            const daySchedule = scheduleMap.get(dayNumber) || null
            const { Icon, color, label } = getWorkoutIcon(daySchedule)
            const isCurrentDay = profile?.current_cycle_day === dayNumber

            return (
              <Card
                key={dayNumber}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isCurrentDay ? 'ring-2 ring-[var(--color-primary)]' : ''
                }`}
                onClick={() => setEditingDay(dayNumber)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-text)]">
                          {getDayName(dayNumber)}
                        </h3>
                        {isCurrentDay && (
                          <span className="text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
                    </div>
                    <Edit2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Initialize Schedule Button (if no schedule exists) */}
        {(!schedule || schedule.length === 0) && (
          <div className="pt-4">
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)] mb-4">
                  No schedule set up yet. Create a default Push/Pull/Legs schedule?
                </p>
                <Button onClick={handleInitialize} loading={isInitializing}>
                  Create Default Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Day Editor Modal */}
      <ScheduleDayEditor
        isOpen={editingDay !== null}
        onClose={() => setEditingDay(null)}
        dayNumber={editingDay || 1}
        currentSchedule={editingDay ? scheduleMap.get(editingDay) : null}
      />
    </AppShell>
  )
}
