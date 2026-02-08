import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { formatTime } from '@/utils/formatters'
import type { CalendarDay } from '@/hooks/useCalendarData'
import type { UnifiedSession } from '@/utils/calendarGrid'

interface SelectedDayPanelProps {
  day: CalendarDay
}

function SessionCard({ session }: { session: UnifiedSession }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (session.type === 'weights') {
      navigate(`/history/${session.id}`)
    } else {
      navigate(`/history/cardio/${session.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4.5 h-4.5 text-[var(--color-success)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--color-text)] truncate">
                {session.name}
              </h4>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(session.started_at)}
                </span>
                {session.type === 'cardio' && session.distance_value && (
                  <span>
                    {session.distance_value} {session.distance_unit || 'miles'}
                  </span>
                )}
                {session.type === 'cardio' && session.duration_minutes && (
                  <span>{session.duration_minutes} min</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {session.completed_at && (
                <span className="text-[10px] bg-[var(--color-success)]/15 text-[var(--color-success)] px-1.5 py-0.5 rounded-full font-medium">
                  Completed
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

export function SelectedDayPanel({ day }: SelectedDayPanelProps) {
  const { date, sessions, projected, isToday, isFuture } = day
  const hasSessions = sessions.length > 0
  const hasProjection = projected && projected.name !== 'Not set'
  const isRest = projected?.isRest

  const dateLabel = isToday ? 'Today' : format(date, 'EEEE, MMM d')
  const Icon = projected?.icon

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2 px-1">
        {dateLabel}
      </h3>

      {hasSessions ? (
        <div className="space-y-2">
          {sessions.map(session => (
            <SessionCard key={`${session.type}-${session.id}`} session={session} />
          ))}
        </div>
      ) : isFuture && hasProjection ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: projected.bgColor }}
                >
                  <Icon className="w-4 h-4" style={{ color: projected.color }} />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Scheduled: {projected.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {isRest ? 'Rest day' : 'Upcoming workout'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isToday && hasProjection ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: projected.bgColor }}
                >
                  <Icon className="w-4 h-4" style={{ color: projected.color }} />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Scheduled: {projected.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {isRest ? 'Rest day' : 'Not started yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !isFuture && hasProjection && !isRest ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Skipped: {projected.name}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !isFuture && isRest ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: projected!.bgColor }}
                >
                  <Icon className="w-4 h-4" style={{ color: projected!.color }} />
                </div>
              )}
              <p className="text-sm text-[var(--color-text-muted)]">Rest day</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              No workout scheduled
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
