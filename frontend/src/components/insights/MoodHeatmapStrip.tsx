'use client'

import { useState } from 'react'
import type { MoodTimelinePoint } from '@/types/insights'
import { getMoodColor } from '@/types/analysis'

interface MoodHeatmapStripProps {
  timeline: MoodTimelinePoint[]
  days: number
}

export function MoodHeatmapStrip({ timeline, days }: MoodHeatmapStripProps) {
  const [hovered, setHovered] = useState<MoodTimelinePoint | null>(null)

  // Build a map by date
  const byDate = new Map(timeline.map(t => [t.date, t]))

  // Generate last N days
  const today = new Date()
  const allDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {allDays.map(date => {
          const point = byDate.get(date)
          const color = point?.primary_sentiment ? getMoodColor(point.primary_sentiment) : '#E2DBD0'
          const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

          return (
            <div
              key={date}
              className="relative"
              onMouseEnter={() => setHovered(point ?? null)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="w-8 h-8 rounded-lg cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: color, opacity: point ? 1 : 0.35 }}
                title={point ? `${label}: ${point.primary_sentiment}` : label}
              />
            </div>
          )
        })}
      </div>

      {hovered && (
        <div className="mt-3 bg-white border border-[#E2DBD0] rounded-xl p-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMoodColor(hovered.primary_sentiment) }} />
            <span className="font-semibold text-[#1A1A1A]">{hovered.primary_sentiment}</span>
            <span className="text-[#B0A898]">·</span>
            <span className="text-[#7A7169] text-xs">{new Date(hovered.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          {hovered.one_line_summary && (
            <p className="text-xs italic text-[#7A7169]">&ldquo;{hovered.one_line_summary}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  )
}
