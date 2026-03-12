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
        'bg-[#FAF7F2] border border-[#D4C5A9] rounded-xl p-5',
        'hover:shadow-md transition-shadow cursor-pointer'
      )}
      onClick={onClick}
      style={{ borderLeftColor: habit.color || '#8B7355', borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {habit.emoticon && (
            <span className="text-2xl flex-shrink-0">{habit.emoticon}</span>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-[#2C2C2C] truncate">{habit.name}</h3>
            {habit.description && (
              <p className="text-xs text-[#8B7A65] mt-0.5 truncate">{habit.description}</p>
            )}
          </div>
        </div>
        {currentStreak > 0 && (
          <StreakBadge streak={currentStreak} size="sm" />
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-[#A08B6E] capitalize">{habit.frequency}</span>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
          )}
          {onArchive && (
            <Button variant="ghost" size="sm" onClick={onArchive}
              className="text-[#C4706A] hover:bg-[#F5DADA]">Archive</Button>
          )}
        </div>
      </div>
    </div>
  )
}
