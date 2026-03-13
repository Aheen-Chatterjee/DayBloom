'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ThemeCount } from '@/types/insights'

interface ThemeBarChartProps {
  themes: ThemeCount[]
}

const THEME_COLORS = [
  '#2A5940', '#4E7D5E', '#7AA88A', '#C9A96E',
  '#8B8BAE', '#C08B5A', '#6B7FA3', '#A0522D',
]

export function ThemeBarChart({ themes }: ThemeBarChartProps) {
  if (!themes.length) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-[#B0A898]">No themes yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, themes.length * 36)}>
      <BarChart data={themes} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: '#B0A898' }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="theme"
          tick={{ fontSize: 11, fill: '#5A5040' }}
          width={130}
        />
        <Tooltip
          formatter={(value) => [value, 'entries']}
          contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2DBD0' }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {themes.map((_, i) => (
            <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
