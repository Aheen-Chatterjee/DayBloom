import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-[#2C2C2C]">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-[#D4C5A9] bg-[#FAF7F2]',
            'text-[#2C2C2C] placeholder:text-[#B0A090]',
            'focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent',
            'transition-colors',
            error && 'border-[#C4706A] focus:ring-[#C4706A]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#C4706A]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
