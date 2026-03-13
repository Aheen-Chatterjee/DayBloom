'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getMoodColor } from '@/types/analysis'

interface SentimentDonutProps {
  distribution: Record<string, number>
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2DBD0] rounded-xl p-2.5 shadow-md text-xs">
      <span className="font-semibold text-[#1A1A1A]">{payload[0].name}</span>
      <span className="text-[#7A7169] ml-2">{payload[0].value} {payload[0].value === 1 ? 'entry' : 'entries'}</span>
    </div>
  )
}

export function SentimentDonut({ distribution }: SentimentDonutProps) {
  const data = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value, color: getMoodColor(name) }))

  if (!data.length) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-[#B0A898]">No data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-[#5A5040]">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
