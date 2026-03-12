'use client'

import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2C2C2C]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-[#FAF7F2] border border-[#D4C5A9] rounded-2xl shadow-xl',
          'w-full max-w-lg max-h-[90vh] overflow-y-auto p-6',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#8B7355] font-serif">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#B0A090] hover:text-[#2C2C2C] text-2xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
