'use client'

import { useState } from 'react'
import { DayHistory } from '@/types/streaks'
import { DayCell } from './DayCell'
import { DayDetailPanel } from './DayDetailPanel'
import { todayISO } from '@/lib/utils/dates'

interface CalendarGridProps {
  days: DayHistory[]
}

export function CalendarGrid({ days }: CalendarGridProps) {
  const [selected, setSelected] = useState<DayHistory | null>(null)
  const today = todayISO()

  if (days.length === 0) {
    return (
      <div className="text-center py-12 text-[#8B7A65]">
        <div className="text-4xl mb-3">(˘▾˘)</div>
        <p>No history yet. Start tracking habits to see your progress!</p>
      </div>
    )
  }

  // Group by month
  const months: Record<string, DayHistory[]> = {}
  days.forEach(day => {
    const key = day.date.slice(0, 7) // YYYY-MM
    if (!months[key]) months[key] = []
    months[key].push(day)
  })

  return (
    <div className="relative">
      {Object.entries(months).reverse().map(([month, monthDays]) => {
        const [year, m] = month.split('-')
        const monthName = new Date(+year, +m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

        return (
          <div key={month} className="mb-8">
            <h3 className="font-serif text-lg font-bold text-[#8B7355] mb-3">{monthName}</h3>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs text-[#A08B6E] pb-1">{d}</div>
              ))}
            </div>
            {/* Calendar cells - pad first week */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding for first day of month */}
              {Array.from({ length: new Date(monthDays[0].date + 'T00:00:00').getDay() }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {monthDays.map(day => (
                <DayCell
                  key={day.date}
                  day={day}
                  isToday={day.date === today}
                  isSelected={selected?.date === day.date}
                  onClick={() => setSelected(selected?.date === day.date ? null : day)}
                />
              ))}
            </div>
          </div>
        )
      })}

      <DayDetailPanel day={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
