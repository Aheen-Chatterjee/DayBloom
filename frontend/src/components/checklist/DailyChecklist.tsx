'use client'

import { Habit } from '@/types/habits'
import { ChecklistItem } from './ChecklistItem'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Sparkles } from 'lucide-react'

interface DailyChecklistProps {
  habits: Habit[]
  loadingHabits: boolean
  isCompleted: (habitId: string) => boolean
  onToggle: (habitId: string) => void
}

export function DailyChecklist({ habits, loadingHabits, isCompleted, onToggle }: DailyChecklistProps) {
  if (loadingHabits) {
    return <div className="flex justify-center py-8"><Spinner /></div>
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        title="No habits yet"
        description="Add your first habit to begin tracking your daily practice"
      />
    )
  }

  const completed = habits.filter(h => isCompleted(h.id)).length
  const allDone = completed === habits.length

  return (
    <div className="space-y-2">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-[#7A7169]">
            {completed} <span className="text-[#C0B8B0]">/</span> {habits.length} completed
          </div>
        </div>
        {allDone && habits.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4E7D5E]">
            <Sparkles size={12} />
            Perfect day!
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F0EDE4] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${habits.length > 0 ? (completed / habits.length) * 100 : 0}%`,
            background: allDone
              ? 'linear-gradient(90deg, #4E7D5E, #C9A96E)'
              : '#1E3D2F',
          }}
        />
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
