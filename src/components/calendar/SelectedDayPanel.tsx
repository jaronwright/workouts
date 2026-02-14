import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'
import { formatTime } from '@/utils/formatters'
import {
  getWeightsStyleByName,
  getCardioStyle,
  getMobilityStyle
} from '@/config/workoutConfig'
import type { CalendarDay } from '@/hooks/useCalendarData'
import type { UnifiedSession } from '@/utils/calendarGrid'

interface SelectedDayPanelProps {
  day: CalendarDay
}

function getSessionStyle(session: UnifiedSession) {
  if (session.type === 'weights') return getWeightsStyleByName(session.name)
  if (session.type === 'mobility') return getMobilityStyle(session.category)
  return getCardioStyle(session.category)
}

function SessionCard({ session }: { session: UnifiedSession }) {
  const navigate = useNavigate()
  const style = getSessionStyle(session)
  const Icon = style.icon

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
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: style.bgColor }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: style.color }} />
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
                <Badge variant="completed">Completed</Badge>
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
  const navigate = useNavigate()
  const { date, sessions, projected, isToday, isFuture } = day
  const hasSessions = sessions.length > 0
  const hasProjection = projected && projected.name !== 'Not set'
  const isRest = projected?.isRest

  const dateLabel = isToday ? 'Today' : format(date, 'EEEE, MMM d')
  const Icon = projected?.icon

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
        {dateLabel}
      </h3>

      {hasSessions ? (
        <div className="space-y-2">
          {sessions.map(session => (
            <SessionCard key={`${session.type}-${session.id}`} session={session} />
          ))}
        </div>
      ) : isToday && hasProjection && !isRest ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: projected.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: projected.color }} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {projected.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Not started yet
                </p>
              </div>
              <button
                onClick={() => {
                  if (projected.workoutDayId) {
                    navigate(`/workout/${projected.workoutDayId}`)
                  } else if (projected.templateId) {
                    navigate(`/${projected.templateType || 'cardio'}/${projected.templateId}`)
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-text)] text-sm font-medium active:scale-95 transition-transform"
              >
                Start
              </button>
            </div>
          </CardContent>
        </Card>
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
                  {projected.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {isRest ? 'Rest day' : 'Upcoming workout'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !isFuture && hasProjection && !isRest ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]">
                  {projected.name}
                </p>
                <Badge variant="missed" className="mt-1">Missed</Badge>
              </div>
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
