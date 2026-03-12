'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Habit } from '@/types/habits'
import { cn } from '@/lib/utils/cn'

interface ChecklistItemProps {
  habit: Habit
  completed: boolean
  onToggle: () => void
}

export function ChecklistItem({ habit, completed, onToggle }: ChecklistItemProps) {
  const [animating, setAnimating] = useState(false)

  const handleToggle = () => {
    if (!completed) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    }
    onToggle()
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left group',
        completed
          ? 'bg-[#1E3D2F08] border-[#1E3D2F20]'
          : 'bg-white border-[#E2DBD0] hover:border-[#C9A96E60] hover:shadow-sm',
        animating && 'scale-[1.01]'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
          completed
            ? 'bg-[#1E3D2F] border-[#1E3D2F]'
            : 'border-[#D5CEC5] group-hover:border-[#C9A96E]'
        )}
      >
        {completed && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {habit.emoticon && <span className="text-base flex-shrink-0">{habit.emoticon}</span>}
        <span
          className={cn(
            'text-sm font-medium truncate transition-colors',
            completed ? 'text-[#7A7169] line-through' : 'text-[#1A1A1A]'
          )}
        >
          {habit.name}
        </span>
      </div>

      {/* Frequency badge */}
      {!completed && (
        <span className="text-xs text-[#B0A898] flex-shrink-0 capitalize hidden sm:block">
          {habit.frequency}
        </span>
      )}
    </button>
  )
}
