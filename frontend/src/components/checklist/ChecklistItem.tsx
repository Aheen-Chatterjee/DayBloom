'use client'

import { useState } from 'react'
import { Check, Flame } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Habit } from '@/types/habits'
import { cn } from '@/lib/utils/cn'

interface ChecklistItemProps {
  habit: Habit
  completed: boolean
  onToggle: () => void
  streak?: number
}

export function ChecklistItem({ habit, completed, onToggle, streak = 0 }: ChecklistItemProps) {
  const [animating, setAnimating] = useState(false)

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    if (!completed) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
      
      // Fire confetti
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y, x },
        colors: ['#4E7D5E', '#C9A96E', '#7AA88A'],
        disableForReducedMotion: true,
      })
    }
    onToggle()
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-300 text-left group',
        completed
          ? 'bg-[#EAF3EC] border-[#A8C4B0]'
          : 'bg-white border-[#E2DBD0] hover:bg-[#F7F5F2] hover:border-[#C9A96E] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
        animating && 'scale-[1.03]'
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

      {/* Frequency & Streak badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {!completed && (
          <span className="text-xs text-[#B0A898] capitalize hidden sm:block">
            {habit.frequency}
          </span>
        )}
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-[#FFF9F0] border border-[#F0EDE4] px-2 py-1 rounded-md">
            <Flame size={12} className="text-[#D5A03A]" />
            <span className="text-xs font-bold text-[#D5A03A]">{streak}</span>
          </div>
        )}
      </div>
    </button>
  )
}
