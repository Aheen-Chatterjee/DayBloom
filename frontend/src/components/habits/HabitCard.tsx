'use client'

import { Habit } from '@/types/habits'
import { StreakBadge } from '@/components/streaks/StreakBadge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface HabitCardProps {
  habit: Habit
  currentStreak?: number
  onEdit?: () => void
  onArchive?: () => void
  onClick?: () => void
}

export function HabitCard({ habit, currentStreak = 0, onEdit, onArchive, onClick }: HabitCardProps) {
  return (
    <div
      className={cn(
        'group relative bg-white border border-[#E2DBD0] rounded-2xl p-5 cursor-pointer',
        'hover:border-[#C9A96E60] hover:shadow-md transition-all duration-200',
        'shadow-[0_1px_4px_rgba(30,61,47,0.04)]'
      )}
      onClick={onClick}
    >
      {/* Colored accent line */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
        style={{ backgroundColor: habit.color || '#1E3D2F' }}
      />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {habit.emoticon && (
              <span className="text-xl flex-shrink-0">{habit.emoticon}</span>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-[#1A1A1A] truncate text-sm">{habit.name}</h3>
              {habit.description && (
                <p className="text-xs text-[#7A7169] mt-0.5 truncate">{habit.description}</p>
              )}
            </div>
          </div>
          {currentStreak > 0 && <StreakBadge streak={currentStreak} size="sm" />}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#B0A898] capitalize font-medium">{habit.frequency}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>}
            {onArchive && (
              <Button variant="ghost" size="sm" onClick={onArchive} className="text-[#B5534D] hover:bg-[#B5534D0D]">
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
