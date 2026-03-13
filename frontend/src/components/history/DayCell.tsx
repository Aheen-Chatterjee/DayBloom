import { DayHistory } from '@/types/streaks'
import { completionToColor } from '@/lib/utils/colors'
import { getMoodColor, getMoodEmoji } from '@/types/analysis'
import { cn } from '@/lib/utils/cn'

interface DayCellProps {
  day: DayHistory & { mood_sentiment?: string | null; mood_summary?: string | null }
  isToday: boolean
  isSelected: boolean
  onClick: () => void
}

export function DayCell({ day, isToday, isSelected, onClick }: DayCellProps) {
  const bgColor = completionToColor(day.completion_percentage)
  const dayNum = new Date(day.date + 'T00:00:00').getDate()
  const isDark = day.completion_percentage > 55
  const hasMood = day.has_journal_entry && day.mood_sentiment
  const moodColor = hasMood ? getMoodColor(day.mood_sentiment) : null
  const moodEmoji = hasMood ? getMoodEmoji(day.mood_sentiment) : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center aspect-square rounded-lg overflow-hidden',
        'transition-all duration-150 hover:scale-110 hover:z-10',
        isSelected && 'ring-2 ring-[#1E3D2F] ring-offset-1 scale-110 z-10',
        isToday && !isSelected && 'ring-2 ring-[#C9A96E] ring-offset-1'
      )}
      style={{ backgroundColor: bgColor }}
      title={`${day.date}: ${day.completion_percentage.toFixed(0)}%${hasMood ? ` · ${day.mood_sentiment}` : ''}`}
    >
      <span className={cn('text-xs font-medium', isDark ? 'text-white/90' : 'text-[#5A5040]')}>
        {dayNum}
      </span>

      {/* Mood emoji in top-left corner */}
      {hasMood && moodEmoji && (
        <span className="absolute top-0.5 left-0.5 text-[9px] leading-none">{moodEmoji}</span>
      )}

      {/* Journal dot (gold when no mood, mood-coloured border when mood) */}
      {day.has_journal_entry && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: moodColor ?? '#C9A96E' }}
        />
      )}
    </button>
  )
}
