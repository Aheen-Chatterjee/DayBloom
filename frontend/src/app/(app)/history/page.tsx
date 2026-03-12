'use client'

import { useEffect } from 'react'
import { useHistory } from '@/hooks/useHistory'
import { CalendarGrid } from '@/components/history/CalendarGrid'
import { Spinner } from '@/components/ui/Spinner'

export default function HistoryPage() {
  const { days, loading, load } = useHistory()

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#8B7355]">History (˘▾˘)</h1>
        <p className="text-[#A08B6E] mt-1">Your last 90 days at a glance</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs text-[#8B7A65]">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F5F0E8', border: '1px solid #D4C5A9' }} />
          <span>0%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#A8C4A8' }} />
          <span>50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B8E6B' }} />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>✿</span>
          <span>Journal entry</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <CalendarGrid days={days} />
      )}
    </div>
  )
}
