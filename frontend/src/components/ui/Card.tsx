import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-[#FAF7F2] border border-[#D4C5A9] rounded-xl shadow-sm p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
