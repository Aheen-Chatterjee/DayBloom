import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#7A7169] uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl text-sm text-[#1A1A1A]',
            'bg-white border border-[#E2DBD0]',
            'placeholder:text-[#C0B8B0]',
            'transition-all duration-150',
            'focus:outline-none focus:border-[#1E3D2F] focus:ring-3 focus:ring-[#1E3D2F1A]',
            error && 'border-[#B5534D] focus:border-[#B5534D] focus:ring-[#B5534D1A]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#B5534D]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
