'use client'

import { useRoast } from '@/context/RoastContext'
import { Flame } from 'lucide-react'

export function RoastBanner() {
  const { payload, dismiss } = useRoast()

  if (!payload) return null

  const { roast, broken_habits } = payload

  // Filter out the force-mode sentinel
  const realHabits = broken_habits.filter(h => h.name !== 'everything')

  // Build habit title
  let habitTitle = ''
  let habitSubtext = ''

  if (realHabits.length === 0) {
    habitTitle = 'General Character Assessment'
  } else if (realHabits.length === 1) {
    const h = realHabits[0]
    habitTitle = `${h.name} — ${h.days_missed} day${h.days_missed !== 1 ? 's' : ''} missed`
  } else if (realHabits.length === 2) {
    habitTitle = realHabits
      .map(h => h.name)
      .join(' · ')
    const worst = [...realHabits].sort((a, b) => b.days_missed - a.days_missed)[0]
    habitSubtext = `Worst offender: ${worst.name} at ${worst.days_missed} days`
  } else {
    const first2 = realHabits.slice(0, 2).map(h => h.name).join(' · ')
    habitTitle = `${first2} +${realHabits.length - 2} more`
    habitSubtext = realHabits
      .sort((a, b) => b.days_missed - a.days_missed)
      .map(h => `${h.name} (${h.days_missed}d)`)
      .join('  ·  ')
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100]"
      style={{
        background: 'linear-gradient(135deg, #0D0404 0%, #1A0606 50%, #0D0404 100%)',
        borderBottom: '1px solid #6B1A1A',
        boxShadow: '0 8px 40px rgba(180, 20, 20, 0.4)',
      }}
    >
      <div className="max-w-2xl mx-auto px-5 py-4 md:py-6">

        {/* Top row: icon + label */}
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-[#E05252]" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E05252]">
            Accountability Check
          </span>
        </div>

        {/* Habit title */}
        <h2
          className="text-white font-bold mb-1"
          style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', lineHeight: 1.3 }}
        >
          {habitTitle}
        </h2>

        {/* Habit subtext (3+ habits) */}
        {habitSubtext && (
          <p className="text-[#A06060] text-xs mb-4 font-medium tracking-wide">
            {habitSubtext}
          </p>
        )}

        {/* Roast message */}
        <p
          className="text-[#F5D0D0] font-medium leading-relaxed mb-6"
          style={{ fontSize: 'clamp(15px, 2vw, 19px)' }}
        >
          {roast}
        </p>

        {/* Lock In button */}
        <button
          onClick={dismiss}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-150"
          style={{
            background: '#E05252',
            color: '#0D0404',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#FF6B6B')}
          onMouseLeave={e => (e.currentTarget.style.background = '#E05252')}
        >
          <Flame size={15} />
          Lock In
        </button>
      </div>
    </div>
  )
}
