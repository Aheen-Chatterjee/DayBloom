export function completionToColor(percentage: number): string {
  if (percentage === 0) return '#F5F0E8'
  if (percentage === 100) return '#6B8E6B'
  const t = percentage / 100
  const h = 38 + (120 - 38) * t
  const s = 43 + (14 - 43) * t
  const l = 93 + (49 - 93) * t
  return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`
}

export const HABIT_COLORS = [
  '#8B7355',
  '#6B8E6B',
  '#8E6B8B',
  '#C4706A',
  '#7B8E6B',
  '#6B7B8E',
  '#8E8B6B',
  '#6B8E8B',
]
