import { cn } from '@/lib/utils/cn'

interface StreakBadgeProps {
  streak: number
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function StreakBadge({ streak, label, size = 'md', className }: StreakBadgeProps) {
  const isHot = streak >= 7
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        isHot ? 'bg-[#DCF0DC] text-[#4A6B4A]' : 'bg-[#F0E8DC] text-[#8B7355]',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <span>{isHot ? 'v(^_^)v' : '✿'}</span>
      <span>{streak} day{streak !== 1 ? 's' : ''}{label ? ` ${label}` : ''}</span>
    </div>
  )
}
