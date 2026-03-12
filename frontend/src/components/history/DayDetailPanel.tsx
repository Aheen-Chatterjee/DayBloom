'use client'

import { DayHistory } from '@/types/streaks'
import { formatDate } from '@/lib/utils/dates'

interface DayDetailPanelProps {
  day: DayHistory | null
  onClose: () => void
}

export function DayDetailPanel({ day, onClose }: DayDetailPanelProps) {
  if (!day) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-[#FAF7F2] border-l border-[#D4C5A9] shadow-xl z-30 p-6 overflow-y-auto animate-in slide-in-from-right">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-[#8B7355]">{formatDate(day.date)}</h3>
        <button onClick={onClose} className="text-[#B0A090] hover:text-[#2C2C2C] text-xl">×</button>
      </div>

      <div className="space-y-3">
        <div className="bg-[#EDE8DF] rounded-lg p-3">
          <div className="text-2xl font-bold text-[#8B7355]">
            {day.completion_percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-[#8B7A65]">
            {day.completion_count} of {day.total_habits} habits completed
          </div>
        </div>

        {day.has_journal_entry && (
          <div className="bg-[#EDE8DF] rounded-lg p-3 flex items-center gap-2">
            <span>✿</span>
            <span className="text-sm text-[#8B7355]">Journal entry written</span>
          </div>
        )}

        {day.completion_percentage === 100 && (
          <div className="text-center py-2 text-[#6B8E6B] font-semibold text-sm">
            (ﾉ◕ヮ◕)ﾉ Perfect day!
          </div>
        )}
      </div>
    </div>
  )
}
