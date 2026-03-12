import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#1E3D2F] text-white hover:bg-[#2A5940] active:bg-[#142B21]',
      secondary: 'bg-white text-[#1A1A1A] border border-[#E2DBD0] hover:bg-[#F7F5EF] hover:border-[#C9A96E]',
      ghost: 'text-[#1E3D2F] hover:bg-[#1E3D2F0D]',
      danger: 'bg-[#B5534D] text-white hover:bg-[#943F3A]',
      gold: 'bg-[#C9A96E] text-[#1A1A1A] hover:bg-[#DEC08C]',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
      lg: 'px-6 py-3 text-sm font-semibold rounded-xl gap-2',
    }
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button }
