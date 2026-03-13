'use client'

import { Camera, Check, Flame } from 'lucide-react'
import { Habit } from '@/types/habits'
import { cn } from '@/lib/utils/cn'

interface ChecklistItemProps {
  habit: Habit
  completed: boolean
  onProofRequest: () => void
  streak?: number
}

export function ChecklistItem({ habit, completed, onProofRequest, streak = 0 }: ChecklistItemProps) {
  return (
    <button
      onClick={completed ? undefined : onProofRequest}
      disabled={completed}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-300 text-left group',
        completed
          ? 'bg-[#EAF3EC] border-[#A8C4B0] cursor-default'
          : 'bg-white border-[#E2DBD0] hover:bg-[#F7F5F2] hover:border-[#C9A96E] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] cursor-pointer',
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
          completed
            ? 'bg-[#1E3D2F]'
            : 'border-2 border-[#D5CEC5] group-hover:border-[#C9A96E] group-hover:bg-[#FFF9F0]',
        )}
      >
        {completed
          ? <Check size={14} className="text-white" strokeWidth={3} />
          : habit.requires_proof
            ? <Camera size={14} className="text-[#B0A898] group-hover:text-[#C9A96E]" strokeWidth={2} />
            : <Check size={14} className="text-[#B0A898] group-hover:text-[#C9A96E]" strokeWidth={2.5} />
        }
      </div>

      {/* Habit name + emoticon */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {habit.emoticon && <span className="text-base flex-shrink-0">{habit.emoticon}</span>}
        <span
          className={cn(
            'text-sm font-medium truncate transition-colors',
            completed ? 'text-[#7A7169] line-through' : 'text-[#1A1A1A]',
          )}
        >
          {habit.name}
        </span>
      </div>

      {/* Frequency + streak badge */}
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
