import { Flame, Zap } from 'lucide-react'
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
        isHot
          ? 'bg-[#C9A96E18] text-[#8A6E3A] border border-[#C9A96E35]'
          : 'bg-[#4E7D5E12] text-[#2D5A3D] border border-[#4E7D5E25]',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      {isHot
        ? <Flame size={size === 'sm' ? 10 : 12} />
        : <Zap size={size === 'sm' ? 10 : 12} />
      }
      <span>{streak}{label ? ` ${label}` : 'd'}</span>
    </div>
  )
}
