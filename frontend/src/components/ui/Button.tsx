import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          {
            primary: 'bg-[#8B7355] text-[#FAF7F2] hover:bg-[#6D5A40]',
            secondary: 'bg-[#EDE8DF] text-[#2C2C2C] border border-[#D4C5A9] hover:bg-[#D4C5A9]',
            ghost: 'text-[#8B7355] hover:bg-[#EDE8DF]',
            danger: 'bg-[#C4706A] text-white hover:bg-[#a05550]',
          }[variant],
          {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
          }[size],
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
