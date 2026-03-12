'use client'

import { useEffect } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { CalendarGrid } from '@/components/history/CalendarGrid'
import { Spinner } from '@/components/ui/Spinner'

export default function HistoryPage() {
  const { days, loading, load } = useHistory()

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#F7F5EF' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-widest mb-2">Overview</p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.1 }}>
            History
          </h1>
          <p className="text-sm text-[#7A7169] mt-1">Your last 90 days at a glance</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-8">
          <span className="text-xs font-semibold text-[#B0A898] uppercase tracking-wider">Progress</span>
          <div className="flex items-center gap-3">
            {[
              { color: '#F0EDE4', label: '0%' },
              { color: '#A8C4B0', label: '50%' },
              { color: '#4E7D5E', label: '75%' },
              { color: '#1E3D2F', label: '100%' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-sm border border-black/10" style={{ backgroundColor: color }} />
                <span className="text-xs text-[#B0A898]">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />
              <span className="text-xs text-[#B0A898]">Journal entry</span>
            </div>
          </div>
        </div>

        {loading
          ? <div className="flex justify-center py-20"><Spinner /></div>
          : <CalendarGrid days={days} />
        }
      </div>
    </div>
  )
}
