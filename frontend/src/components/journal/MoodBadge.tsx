import { getMoodColor, getMoodBgColor, getMoodEmoji } from '@/types/analysis'

interface MoodBadgeProps {
  sentiment: string | null | undefined
  size?: 'sm' | 'md'
  showEmoji?: boolean
}

export function MoodBadge({ sentiment, size = 'md', showEmoji = true }: MoodBadgeProps) {
  if (!sentiment) return null

  const color = getMoodColor(sentiment)
  const bg = getMoodBgColor(sentiment)
  const emoji = getMoodEmoji(sentiment)

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${padding}`}
      style={{ color, backgroundColor: bg, border: `1px solid ${color}30` }}
    >
      {showEmoji && <span>{emoji}</span>}
      {sentiment}
    </span>
  )
}
