'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot
} from 'recharts'
import type { MoodTimelinePoint } from '@/types/insights'
import { getMoodColor } from '@/types/analysis'

interface MoodTimelineProps {
  data: MoodTimelinePoint[]
}

function CustomDot(props: { cx?: number; cy?: number; payload?: MoodTimelinePoint }) {
  const { cx, cy, payload } = props
  if (!cx || !cy || !payload?.primary_sentiment) return null
  const color = getMoodColor(payload.primary_sentiment)
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MoodTimelinePoint }> }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  const date = new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const color = getMoodColor(p.primary_sentiment)

  return (
    <div className="bg-white border border-[#E2DBD0] rounded-xl p-3 shadow-md text-xs max-w-[200px]">
      <p className="text-[#B0A898] mb-1">{date}</p>
      {p.primary_sentiment && (
        <p className="font-semibold mb-1" style={{ color }}>{p.primary_sentiment}</p>
      )}
      {p.one_line_summary && (
        <p className="italic text-[#7A7169] leading-snug">&ldquo;{p.one_line_summary}&rdquo;</p>
      )}
    </div>
  )
}

export function MoodTimeline({ data }: MoodTimelineProps) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#B0A898' }} />
        <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#B0A898' }} />
        <ReferenceLine y={0} stroke="#E2DBD0" strokeDasharray="4 4" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="sentiment_score"
          stroke="#4E7D5E"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 7, fill: '#2A5940' }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
