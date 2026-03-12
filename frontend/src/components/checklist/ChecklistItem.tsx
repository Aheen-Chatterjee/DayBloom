'use client'

import { useState } from 'react'
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
        'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
        completed
          ? 'bg-[#E8F0E8] border-[#6B8E6B] text-[#4A6B4A]'
          : 'bg-[#FAF7F2] border-[#D4C5A9] text-[#2C2C2C] hover:bg-[#EDE8DF]',
        animating && 'scale-[1.02]'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          completed ? 'bg-[#6B8E6B] border-[#6B8E6B] text-white' : 'border-[#D4C5A9]'
        )}
      >
        {completed && <span className="text-xs">✓</span>}
      </div>
      <div className="flex items-center gap-2 flex-1 text-left">
        {habit.emoticon && <span className="text-lg">{habit.emoticon}</span>}
        <span className={cn('font-medium', completed && 'line-through opacity-70')}>
          {habit.name}
        </span>
      </div>
      {completed && <span className="text-xs text-[#6B8E6B]">v(^_^)v</span>}
    </button>
  )
}
