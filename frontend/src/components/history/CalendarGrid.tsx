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
      <div className="text-center py-16">
        <p className="text-[#7A7169] text-sm">No history yet — start tracking habits to see your progress here.</p>
      </div>
    )
  }

  const months: Record<string, DayHistory[]> = {}
  days.forEach(day => {
    const key = day.date.slice(0, 7)
    if (!months[key]) months[key] = []
    months[key].push(day)
  })

  return (
    <div className="relative">
      {Object.entries(months).reverse().map(([month, monthDays]) => {
        const [year, m] = month.split('-')
        const monthName = new Date(+year, +m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

        return (
          <div key={month} className="mb-10">
            <h3 className="mb-4 text-[#1A1A1A]" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', fontWeight: 600 }}>
              {monthName}
            </h3>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs text-[#B0A898] font-medium pb-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
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
