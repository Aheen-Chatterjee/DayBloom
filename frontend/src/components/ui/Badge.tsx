import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'forest' | 'gold' | 'sage' | 'error' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    forest: 'bg-[#1E3D2F12] text-[#1E3D2F] border-[#1E3D2F20]',
    gold: 'bg-[#C9A96E18] text-[#8A6E3A] border-[#C9A96E30]',
    sage: 'bg-[#4E7D5E18] text-[#2D5A3D] border-[#4E7D5E25]',
    error: 'bg-[#B5534D12] text-[#B5534D] border-[#B5534D20]',
    neutral: 'bg-[#F0EDE4] text-[#7A7169] border-[#E2DBD0]',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  )
}
