'use client'

import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import { StreakBadge } from '@/components/streaks/StreakBadge'
import { Card } from '@/components/ui/Card'
import type { StreakData } from '@/types/streaks'

interface StatsCardProps {
  streak: StreakData
  weekData?: boolean[] // 7 booleans: completed each of last 7 days
}

export function StatsCard({ streak, weekData = [] }: StatsCardProps) {
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    value: weekData[i] ? 1 : 0,
  }))

  return (
    <Card className="space-y-4">
      <h3 className="font-serif text-lg font-bold text-[#8B7355]">Stats</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold text-[#6B8E6B]">{streak.current_streak}</div>
          <div className="text-xs text-[#8B7A65]">Current streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#8B7355]">{streak.longest_streak}</div>
          <div className="text-xs text-[#8B7A65]">Longest streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#8E6B8B]">{streak.total_completions}</div>
          <div className="text-xs text-[#8B7A65]">Total</div>
        </div>
      </div>

      {weekData.length > 0 && (
        <div>
          <p className="text-xs text-[#8B7A65] mb-2">Last 7 days</p>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6B8E6B"
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip
                  content={() => null}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {streak.current_streak > 0 && (
        <StreakBadge streak={streak.current_streak} label="streak" />
      )}
    </Card>
  )
}
