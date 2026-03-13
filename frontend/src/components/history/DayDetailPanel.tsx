'use client'

import { DayHistory } from '@/types/streaks'
import { formatDate } from '@/lib/utils/dates'
import { X, BookOpen, TrendingUp } from 'lucide-react'
import { MoodBadge } from '@/components/journal/MoodBadge'

interface DayDetailPanelProps {
  day: (DayHistory & { mood_sentiment?: string | null; mood_summary?: string | null }) | null
  onClose: () => void
}

export function DayDetailPanel({ day, onClose }: DayDetailPanelProps) {
  if (!day) return null

  return (
    <div
      className="fixed inset-y-0 right-0 w-72 bg-white border-l border-[#E2DBD0] z-30 overflow-y-auto"
      style={{ boxShadow: '-4px 0 24px rgba(30,61,47,0.08)' }}
    >
      <div className="p-5 border-b border-[#F0EDE4] flex items-center justify-between">
        <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>
          {formatDate(day.date)}
        </h3>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#B0A898] hover:bg-[#F7F5EF] hover:text-[#1A1A1A] transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Completion ring */}
        <div className="bg-[#F7F5EF] rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#1E3D2F]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {day.completion_percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-[#7A7169] mt-1">
            {day.completion_count} of {day.total_habits} habits
          </div>
          <div className="mt-3 h-1.5 bg-[#E2DBD0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1E3D2F] transition-all"
              style={{ width: `${day.completion_percentage}%` }}
            />
          </div>
        </div>

        {/* Mood block */}
        {day.has_journal_entry && day.mood_sentiment && (
          <div className="rounded-xl p-3.5 border" style={{ background: '#F9F7F2', borderColor: '#E2DBD0' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={13} className="text-[#8A6E3A]" />
              <span className="text-xs font-semibold text-[#8A6E3A]">Today&apos;s mood</span>
            </div>
            <MoodBadge sentiment={day.mood_sentiment} size="sm" />
            {day.mood_summary && (
              <p className="mt-2 text-xs italic text-[#7A7169] leading-relaxed">&ldquo;{day.mood_summary}&rdquo;</p>
            )}
          </div>
        )}

        {day.has_journal_entry && !day.mood_sentiment && (
          <div className="flex items-center gap-3 bg-[#C9A96E12] border border-[#C9A96E30] rounded-xl p-3.5">
            <BookOpen size={15} className="text-[#8A6E3A] flex-shrink-0" />
            <span className="text-sm font-medium text-[#8A6E3A]">Journal entry written</span>
          </div>
        )}

        {day.completion_percentage === 100 && (
          <div className="flex items-center gap-3 bg-[#4E7D5E12] border border-[#4E7D5E25] rounded-xl p-3.5">
            <TrendingUp size={15} className="text-[#2D5A3D] flex-shrink-0" />
            <span className="text-sm font-medium text-[#2D5A3D]">Perfect day!</span>
          </div>
        )}
      </div>
    </div>
  )
}
