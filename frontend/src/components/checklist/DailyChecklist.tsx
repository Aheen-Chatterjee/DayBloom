'use client'

import { Habit } from '@/types/habits'
import { ChecklistItem } from './ChecklistItem'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

interface DailyChecklistProps {
  habits: Habit[]
  loadingHabits: boolean
  isCompleted: (habitId: string) => boolean
  onToggle: (habitId: string) => void
}

export function DailyChecklist({ habits, loadingHabits, isCompleted, onToggle }: DailyChecklistProps) {
  if (loadingHabits) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon="✿"
        title="No habits yet"
        description="Add your first habit to start tracking your daily bloom"
      />
    )
  }

  const completed = habits.filter(h => isCompleted(h.id)).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#8B7A65]">
          {completed} / {habits.length} completed
        </span>
        {completed === habits.length && habits.length > 0 && (
          <span className="text-sm text-[#6B8E6B] font-semibold">(ﾉ◕ヮ◕)ﾉ All done!</span>
        )}
      </div>
      {habits.map(habit => (
        <ChecklistItem
          key={habit.id}
          habit={habit}
          completed={isCompleted(habit.id)}
          onToggle={() => onToggle(habit.id)}
        />
      ))}
    </div>
  )
}
