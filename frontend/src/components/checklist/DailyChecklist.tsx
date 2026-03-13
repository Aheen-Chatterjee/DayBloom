'use client'

import { useState } from 'react'
import { Habit } from '@/types/habits'
import { Completion } from '@/types/completions'
import { ChecklistItem } from './ChecklistItem'
import { ProofUploadModal } from './ProofUploadModal'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

interface DailyChecklistProps {
  habits: Habit[]
  loadingHabits: boolean
  isCompleted: (habitId: string) => boolean
  onAddCompletion: (completion: Completion) => void
  streaks?: Record<string, { current_streak: number }>
}

export function DailyChecklist({
  habits,
  loadingHabits,
  isCompleted,
  onAddCompletion,
  streaks,
}: DailyChecklistProps) {
  const [proofHabitId, setProofHabitId] = useState<string | null>(null)

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
  const proofHabit = proofHabitId ? habits.find(h => h.id === proofHabitId) ?? null : null

  return (
    <>
      <div className="space-y-2">
        {/* Progress header */}
        <div className="bg-[#1E3D2F08] border border-[#1E3D2F15] rounded-xl p-5 mb-6 flex items-center gap-5">
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E2DBD0]"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={allDone ? 'text-[#4E7D5E]' : 'text-[#C9A96E]'}
                strokeWidth="3"
                strokeDasharray={`${habits.length > 0 ? (completed / habits.length) * 100 : 0}, 100`}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[#1E3D2F]">
                {Math.round(habits.length > 0 ? (completed / habits.length) * 100 : 0)}%
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-0.5">
              {completed} of {habits.length} habits verified
            </h3>
            <p className="text-sm font-medium text-[#7A7169]">
              {allDone ? 'Perfect day! You bloomed ✨' : 'Prove it 📸'}
            </p>
          </div>
        </div>

        {habits.map(habit => (
          <ChecklistItem
            key={habit.id}
            habit={habit}
            completed={isCompleted(habit.id)}
            onProofRequest={() => setProofHabitId(habit.id)}
            streak={streaks?.[habit.id]?.current_streak || 0}
          />
        ))}
      </div>

      {proofHabit && (
        <ProofUploadModal
          habit={proofHabit}
          onClose={() => setProofHabitId(null)}
          onSuccess={(completion) => {
            onAddCompletion(completion)
            setProofHabitId(null)
          }}
        />
      )}
    </>
  )
}
