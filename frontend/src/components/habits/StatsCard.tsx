'use client'

import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import { StreakBadge } from '@/components/streaks/StreakBadge'
import type { StreakData } from '@/types/streaks'

interface StatsCardProps {
  streak: StreakData
  weekData?: boolean[]
}

export function StatsCard({ streak, weekData = [] }: StatsCardProps) {
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: weekData[i] ? 1 : 0,
  }))

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6" style={{ boxShadow: '0 1px 4px rgba(30,61,47,0.06)' }}>
        <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px' }}>
          Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center mb-5">
          {[
            { value: streak.current_streak, label: 'Current streak', color: '#1E3D2F' },
            { value: streak.longest_streak, label: 'Longest streak', color: '#C9A96E' },
            { value: streak.total_completions, label: 'Total', color: '#7A7169' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-[#F7F5EF] rounded-xl p-4">
              <div className="text-3xl font-bold" style={{ fontFamily: '"Cormorant Garamond", serif', color }}>{value}</div>
              <div className="text-xs text-[#7A7169] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {weekData.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#B0A898] uppercase tracking-wider mb-3">Last 7 days</p>
            <div className="h-14">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="value" stroke="#1E3D2F" strokeWidth={2} dot={false} />
                  <Tooltip content={() => null} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {streak.current_streak > 0 && (
          <div className="mt-4 pt-4 border-t border-[#F0EDE4]">
            <StreakBadge streak={streak.current_streak} label="streak" />
          </div>
        )}
      </div>
    </div>
  )
}
