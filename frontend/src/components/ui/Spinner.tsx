import { cn } from '@/lib/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-5 h-5 border-2 border-[#E2DBD0] border-t-[#1E3D2F] rounded-full animate-spin',
        className
      )}
    />
  )
}
