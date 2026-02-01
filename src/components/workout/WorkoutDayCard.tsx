import { ChevronRight } from 'lucide-react'
import type { WorkoutDay } from '@/types/workout'
import { Card, CardContent } from '@/components/ui'

interface WorkoutDayCardProps {
  day: WorkoutDay
  onClick: () => void
}

const dayColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-blue-500',
  3: 'bg-green-500'
}

export function WorkoutDayCard({ day, onClick }: WorkoutDayCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${dayColors[day.day_number] || 'bg-gray-500'}`}
        >
          D{day.day_number}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{day.name}</h3>
          <p className="text-sm text-gray-500">Day {day.day_number}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </CardContent>
    </Card>
  )
}
