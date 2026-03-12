import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'umber' | 'sage' | 'mauve' | 'rose'
  className?: string
}

export function Badge({ children, variant = 'umber', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        {
          umber: 'bg-[#F0E8DC] text-[#8B7355]',
          sage: 'bg-[#DCF0DC] text-[#4A6B4A]',
          mauve: 'bg-[#EDD8ED] text-[#6B4A6B]',
          rose: 'bg-[#F5DADA] text-[#8B4040]',
        }[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
