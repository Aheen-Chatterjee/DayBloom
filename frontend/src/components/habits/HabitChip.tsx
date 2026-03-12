import { Habit } from '@/types/habits'
import { cn } from '@/lib/utils/cn'

interface HabitChipProps {
  habit: Habit
  streak?: number
  onClick?: () => void
}

export function HabitChip({ habit, streak, onClick }: HabitChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium',
        'border border-[#D4C5A9] bg-[#FAF7F2] hover:bg-[#EDE8DF] transition-colors',
        'text-[#2C2C2C]'
      )}
    >
      {habit.emoticon && <span>{habit.emoticon}</span>}
      <span>{habit.name}</span>
      {streak !== undefined && streak > 0 && (
        <span className="text-xs text-[#6B8E6B] font-semibold">{streak}d</span>
      )}
    </button>
  )
}
