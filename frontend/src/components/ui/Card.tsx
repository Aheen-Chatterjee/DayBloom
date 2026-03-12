import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white border border-[#E2DBD0] rounded-2xl p-6',
        'shadow-[0_1px_4px_rgba(30,61,47,0.06),0_4px_16px_rgba(30,61,47,0.04)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
