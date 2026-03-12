export function completionToColor(percentage: number): string {
  if (percentage === 0) return '#F0EDE4'
  if (percentage >= 100) return '#1E3D2F'
  if (percentage >= 75) {
    const t = (percentage - 75) / 25
    return interpolateHex('#4E7D5E', '#1E3D2F', t)
  }
  if (percentage >= 40) {
    const t = (percentage - 40) / 35
    return interpolateHex('#A8C4B0', '#4E7D5E', t)
  }
  const t = percentage / 40
  return interpolateHex('#F0EDE4', '#A8C4B0', t)
}

function interpolateHex(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export const HABIT_COLORS = [
  '#1E3D2F', '#2A5940', '#4E7D5E',
  '#C9A96E', '#8A6E3A', '#B5534D',
  '#5A6E8A', '#6B5A8A', '#7A7169',
]
