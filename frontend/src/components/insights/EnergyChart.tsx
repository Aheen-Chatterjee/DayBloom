'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { MoodTimelinePoint } from '@/types/insights'

interface EnergyChartProps {
  timeline: MoodTimelinePoint[]
}

export function EnergyChart({ timeline }: EnergyChartProps) {
  // Aggregate energy per day
  const data = timeline.map(p => ({
    label: new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    High: p.energy_level === 'High' ? 1 : 0,
    Medium: p.energy_level === 'Medium' ? 1 : 0,
    Low: p.energy_level === 'Low' ? 1 : 0,
  }))

  if (!data.length) {
    return <div className="h-[160px] flex items-center justify-center text-sm text-[#B0A898]">No energy data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#B0A898' }} />
        <YAxis tick={false} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2DBD0' }}
        />
        <Legend formatter={(v) => <span className="text-xs text-[#5A5040]">{v}</span>} iconSize={8} iconType="circle" />
        <Bar dataKey="High" stackId="a" fill="#C9A96E" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Medium" stackId="a" fill="#7AA88A" />
        <Bar dataKey="Low" stackId="a" fill="#6B7FA3" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
