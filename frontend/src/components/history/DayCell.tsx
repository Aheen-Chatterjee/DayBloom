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
  const isDark = day.completion_percentage > 55

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center aspect-square rounded-lg',
        'transition-all duration-150 hover:scale-110 hover:z-10',
        isSelected && 'ring-2 ring-[#1E3D2F] ring-offset-1 scale-110 z-10',
        isToday && !isSelected && 'ring-2 ring-[#C9A96E] ring-offset-1'
      )}
      style={{ backgroundColor: bgColor }}
      title={`${day.date}: ${day.completion_percentage.toFixed(0)}%`}
    >
      <span className={cn('text-xs font-medium', isDark ? 'text-white/90' : 'text-[#5A5040]')}>
        {dayNum}
      </span>
      {day.has_journal_entry && (
        <div className={cn('absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full', isDark ? 'bg-white/60' : 'bg-[#C9A96E]')} />
      )}
    </button>
  )
}
