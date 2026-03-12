import { DayHistory } from '@/types/streaks'
import { completionToColor } from '@/lib/utils/colors'
import { cn } from '@/lib/utils/cn'

interface DayCellProps {
  day: DayHistory
  isToday: boolean
  isSelected: boolean
  onClick: () => void
}

export function DayCell({ day, isToday, isSelected, onClick }: DayCellProps) {
  const bgColor = completionToColor(day.completion_percentage)
  const dayNum = new Date(day.date + 'T00:00:00').getDate()

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center aspect-square rounded-lg',
        'text-xs font-medium transition-all hover:scale-105',
        isSelected && 'ring-2 ring-[#8B7355]',
        isToday && 'ring-2 ring-[#8E6B8B]'
      )}
      style={{ backgroundColor: bgColor }}
    >
      <span className={cn(
        'text-xs',
        day.completion_percentage > 50 ? 'text-white' : 'text-[#2C2C2C]'
      )}>
        {dayNum}
      </span>
      {day.has_journal_entry && (
        <span className="absolute top-0.5 right-0.5 text-[8px]">✿</span>
      )}
    </button>
  )
}
