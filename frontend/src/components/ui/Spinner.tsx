import { cn } from '@/lib/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-6 h-6 border-2 border-[#D4C5A9] border-t-[#8B7355] rounded-full animate-spin',
        className
      )}
    />
  )
}
